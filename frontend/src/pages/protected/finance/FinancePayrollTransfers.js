import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { setPageTitle } from '../../../features/common/headerSlice'
import Pagination from '../../../components/Pagination/Pagination'
import { financeApi } from '../../../features/finance/api'
import useTablePagination from '../../../hooks/useTablePagination'

const monthOptions = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
]

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`

const getEffectiveStatus = (item) => {
    return String(item?.payment_status || item?.status || '').toLowerCase()
}

const getSlipDateParts = (item) => {
    const pad = (value) => String(value).padStart(2, '0')
    const dateCandidates = [
        item?.created_at,
        item?.createdAt,
        item?.slip_created_at,
        item?.slipCreatedAt,
        item?.generated_at,
        item?.generatedAt,
    ]

    for (const candidate of dateCandidates) {
        if (!candidate) continue
        const date = new Date(candidate)
        if (!Number.isNaN(date.getTime())) {
            return {
                day: pad(date.getDate()),
                month: pad(date.getMonth() + 1),
                year: String(date.getFullYear()),
            }
        }
    }

    const periodMonth = Number(item?.period_month)
    const periodYear = Number(item?.period_year)
    if (Number.isFinite(periodMonth) && periodMonth >= 1 && periodMonth <= 12 && Number.isFinite(periodYear)) {
        return {
            day: '01',
            month: pad(periodMonth),
            year: String(periodYear),
        }
    }

    const now = new Date()
    return {
        day: pad(now.getDate()),
        month: pad(now.getMonth() + 1),
        year: String(now.getFullYear()),
    }
}

function FinancePayrollTransfers() {
    const dispatch = useDispatch()
    const [searchParams, setSearchParams] = useSearchParams()
    const initialMonth = searchParams.get('month') || ''
    const initialYear = searchParams.get('year') || ''
    const initialStatus = searchParams.get('status') === 'all'
        ? ''
        : (searchParams.get('status') || '')
    const initialEmployee = searchParams.get('employee') || ''
    const initialSort = searchParams.get('sort') || ''

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [rows, setRows] = useState([])
    const [employeeReferences, setEmployeeReferences] = useState([])
    const [actionLoadingId, setActionLoadingId] = useState(null)
    const [employeeFilter, setEmployeeFilter] = useState(initialEmployee)
    const [periodMonth, setPeriodMonth] = useState(initialMonth)
    const [periodYear, setPeriodYear] = useState(initialYear)
    const [search] = useState('')
    const [statusFilter, setStatusFilter] = useState(initialStatus)
    const [sortMode] = useState(initialSort)
    const [selectedPayroll, setSelectedPayroll] = useState(null)

    useEffect(() => {
        dispatch(setPageTitle({ title: 'Riwayat Slip Gaji' }))
    }, [dispatch])

    useEffect(() => {
        const loadEmployeeReferences = async () => {
            try {
                const refs = await financeApi.getEmployeeReferences()
                setEmployeeReferences(refs || [])
            } catch (err) {
                setEmployeeReferences([])
            }
        }

        loadEmployeeReferences()
    }, [])

    useEffect(() => {
        const nextParams = new URLSearchParams()

        if (employeeFilter) nextParams.set('employee', employeeFilter)
        if (periodMonth) nextParams.set('month', periodMonth)
        if (periodYear) nextParams.set('year', periodYear)
        if (statusFilter) {
            nextParams.set('status', statusFilter)
        } else {
            nextParams.set('status', 'all')
        }
        if (sortMode) nextParams.set('sort', sortMode)

        setSearchParams(nextParams, { replace: true })
    }, [employeeFilter, periodMonth, periodYear, statusFilter, sortMode, setSearchParams])

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                setError('')
                const result = await financeApi.getPayrollList({})
                setRows(result || [])
            } catch (err) {
                setRows([])
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const employeeOptions = useMemo(() => {
        const options = (employeeReferences || []).map((item) => ({
            value: String(item.employee_id),
            label: `${item.employee_code || '-'} - ${item.employee_name || '-'}`,
            code: String(item.employee_code || ''),
        }))

        return options.sort((a, b) =>
            a.code.localeCompare(b.code, 'id', {
                numeric: true,
                sensitivity: 'base',
            }),
        )
    }, [employeeReferences])

    const currentYear = new Date().getFullYear()
    const yearOptions = useMemo(() => {
        return Array.from({ length: 6 }, (_, index) => String(currentYear + index))
    }, [currentYear])

    const filteredRows = useMemo(() => {
        const keyword = search.trim().toLowerCase()

        const nextRows = rows.filter((item) => {
            const effectiveStatus = getEffectiveStatus(item)
            const rowEmployeeId = String(item.employee_id || '')
            const rowMonth = String(item.period_month || '')
            const rowYear = String(item.period_year || '')
            const matchStatus = !statusFilter || effectiveStatus === String(statusFilter).toLowerCase()
            const matchEmployee =
                !employeeFilter ||
                rowEmployeeId === String(employeeFilter)
            const matchMonth = !periodMonth || rowMonth === String(periodMonth)
            const matchYear = !periodYear || rowYear === String(periodYear)
            const matchKeyword =
                !keyword ||
                [item.employee_name, item.employee_code, item.id]
                    .map((value) => String(value || '').toLowerCase())
                    .some((value) => value.includes(keyword))

            return matchStatus && matchEmployee && matchMonth && matchYear && matchKeyword
        })

        if (sortMode === 'top-pay') {
            nextRows.sort((left, right) => {
                const totalLeft = Number(left?.final_amount || left?.net_salary || 0)
                const totalRight = Number(right?.final_amount || right?.net_salary || 0)

                if (totalRight !== totalLeft) {
                    return totalRight - totalLeft
                }

                return String(left?.employee_name || '').localeCompare(String(right?.employee_name || ''))
            })
        }

        return nextRows
    }, [rows, search, employeeFilter, periodMonth, periodYear, statusFilter, sortMode])
    const rowsPagination = useTablePagination(filteredRows)

    const handleTransferPayroll = async (payrollId) => {
        try {
            setActionLoadingId(payrollId)
            setError('')
            await financeApi.transferPayroll(payrollId)

            const refreshed = await financeApi.getPayrollList({})
            setRows(refreshed || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setActionLoadingId(null)
        }
    }

    const openPayrollPdf = async (payrollItem) => {
        const payrollId = payrollItem?.id

        try {
            setError('')
            const blob = await financeApi.getPayrollPdfBlob(payrollId)
            const url = window.URL.createObjectURL(blob)
            const { day, month, year } = getSlipDateParts(payrollItem)

            setSelectedPayroll({
                url,
                payrollId,
                period: `${payrollItem.period_month}/${payrollItem.period_year}`,
                date: `${day}-${month}-${year}`,
                type: 'pdf',
            })
        } catch (err) {
            setError(err.message)
        }
    }

    const closePayrollModal = () => {
        if (selectedPayroll?.url) {
            window.URL.revokeObjectURL(selectedPayroll.url)
        }
        setSelectedPayroll(null)
    }

    const getPayrollStatusBadge = (status) => {
        const normalized = String(status || '').toLowerCase().trim()

        switch (normalized) {
            case 'draft':
                return 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300'
            case 'claimed':
            case 'submitted':
                return 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
            case 'published':
            case 'approved':
                return 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
            case 'transferred':
                return 'border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300'
            case 'rejected':
                return 'border-red-200 bg-red-100 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
            default:
                return 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
        }
    }

    const getPayrollStatusLabel = (status) => {
        const normalized = String(status || '').toLowerCase().trim()

        const map = {
            draft: 'Draf',
            claimed: 'Diklaim',
            submitted: 'Menunggu',
            published: 'Dipublikasikan',
            transferred: 'Sudah Ditransfer',
            approved: 'Disetujui',
            rejected: 'Ditolak',
        }

        return map[normalized] || status || '-'
    }

    const summaryStats = useMemo(() => {
        return rows.reduce((acc, item) => {
            const status = getEffectiveStatus(item)
            const total = Number(item.final_amount || item.net_salary || 0)

            if (status === 'claimed') acc.claimed += 1
            if (status === 'transferred') acc.transferred += 1
            if (status === 'published') acc.published += 1
            acc.totalAmount += total

            return acc
        }, {
            claimed: 0,
            transferred: 0,
            published: 0,
            totalAmount: 0,
        })
    }, [rows])

    return (
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
            <div className="space-y-6">
                {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div className="relative min-h-[126px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-5 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6">
                    <div className="absolute right-10 top-3 hidden text-[110px] opacity-10 lg:block">💸</div>
                    <div className="relative z-10 max-w-3xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
                            Finance Payroll
                        </div>
                        <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
                            Riwayat Slip Gaji
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                            Kelola riwayat slip gaji pegawai, lihat detail PDF, dan kirim gaji untuk slip berstatus claimed.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30">
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Diklaim</p>
                        <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-50">{summaryStats.claimed}</p>
                        <p className="mt-1 text-xs font-medium text-amber-700/80 dark:text-amber-300/80">Siap dikirim gaji</p>
                    </div>
                    <div className="rounded-3xl border border-orange-200 bg-orange-50 p-5 shadow-sm dark:border-orange-900/60 dark:bg-orange-950/30">
                        <p className="text-sm font-bold text-orange-700 dark:text-orange-300">Sudah Ditransfer</p>
                        <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-50">{summaryStats.transferred}</p>
                        <p className="mt-1 text-xs font-medium text-orange-700/80 dark:text-orange-300/80">Gaji sudah dikirim</p>
                    </div>
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Dipublikasikan</p>
                        <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-50">{summaryStats.published}</p>
                        <p className="mt-1 text-xs font-medium text-emerald-700/80 dark:text-emerald-300/80">Slip sudah dipublikasikan</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                                Data Slip Gaji
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Gunakan filter untuk mencari slip gaji berdasarkan pegawai, periode, atau status.
                            </p>
                        </div>
                        <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/60 dark:text-orange-300">
                            {filteredRows.length} data ditemukan
                        </div>
                    </div>

                    <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                        <div className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                            Filter Slip Gaji
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <select
                                className="select select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                value={employeeFilter}
                                onChange={(event) => setEmployeeFilter(event.target.value)}
                            >
                                <option value="">Semua Pegawai</option>
                                {employeeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="select select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                value={periodMonth}
                                onChange={(event) => setPeriodMonth(event.target.value)}
                            >
                                <option value="">Semua Bulan</option>
                                {monthOptions.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="select select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                value={periodYear}
                                onChange={(event) => setPeriodYear(event.target.value)}
                            >
                                <option value="">Semua Tahun</option>
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="select select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                            >
                                <option value="">Semua Status</option>
                                <option value="claimed">Diklaim</option>
                                <option value="transferred">Sudah Ditransfer</option>
                                <option value="published">Dipublikasikan</option>
                                <option value="draft">Draf</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300">
                        Setelah transfer gaji berhasil, ubah status dengan klik tombol Kirim Gaji pada slip berstatus claimed.
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                        <table className="table table-sm w-full min-w-[900px]">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                                <tr>
                                    <th>Payroll ID</th>
                                    <th>Pegawai</th>
                                    <th>Kode</th>
                                    <th>Periode</th>
                                    <th>Total Gaji</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rowsPagination.paginatedItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-orange-50/50 dark:hover:bg-slate-800/70">
                                        <td className="font-bold text-slate-700 dark:text-slate-200">#{item.id}</td>
                                        <td>
                                            <p className="font-bold text-slate-900 dark:text-slate-50">{item.employee_name || '-'}</p>
                                        </td>
                                        <td className="text-slate-600 dark:text-slate-300">{item.employee_code || '-'}</td>
                                        <td className="font-semibold text-slate-700 dark:text-slate-200">{item.period_month}/{item.period_year}</td>
                                        <td className="font-extrabold text-orange-600 dark:text-orange-300">{formatCurrency(item.final_amount || item.net_salary)}</td>
                                        <td>
                                            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getPayrollStatusBadge(getEffectiveStatus(item))}`}>
                                                {getPayrollStatusLabel(getEffectiveStatus(item))}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 shadow-sm transition hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                                                    onClick={() => openPayrollPdf(item)}
                                                >
                                                    Lihat
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn btn-xs rounded-full border-none bg-orange-500 px-4 text-white hover:bg-orange-600 disabled:bg-slate-300 disabled:text-slate-500 ${actionLoadingId === item.id ? 'loading' : ''}`}
                                                    onClick={() => handleTransferPayroll(item.id)}
                                                    disabled={getEffectiveStatus(item) !== 'claimed' || actionLoadingId === item.id}
                                                >
                                                    Kirim Gaji
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {!filteredRows.length && !loading && (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-500 dark:text-slate-400">
                                            Tidak ada slip gaji pada filter ini
                                        </td>
                                    </tr>
                                )}

                                {loading && (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-500 dark:text-slate-400">
                                            Memuat data slip gaji...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4">
                        <Pagination page={rowsPagination.page} totalPages={rowsPagination.totalPages} onChangePage={rowsPagination.setPage} itemsPerPage={rowsPagination.itemsPerPage} />
                    </div>
                </div>

                <input
                    type="checkbox"
                    id="payroll-modal"
                    className="modal-toggle"
                    checked={!!selectedPayroll}
                    onChange={closePayrollModal}
                />
                <div className="modal">
                    <div className="modal-box max-w-5xl overflow-hidden rounded-3xl border border-slate-200 p-0 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-950">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">Slip Gaji</h3>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Periode: {selectedPayroll?.period || '-'}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300"
                                onClick={closePayrollModal}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-white p-5 dark:bg-slate-900">
                            <div className="flex min-h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                                {selectedPayroll?.type === 'pdf' ? (
                                    <iframe
                                        title="Slip Gaji PDF"
                                        src={selectedPayroll.url}
                                        className="h-[70vh] w-full border-0"
                                    />
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400">Tidak ada file slip gaji.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <label
                        className="modal-backdrop"
                        htmlFor="payroll-modal"
                        onClick={closePayrollModal}
                    >
                        Close
                    </label>
                </div>
            </div>
        </div>
    )
}

export default FinancePayrollTransfers
