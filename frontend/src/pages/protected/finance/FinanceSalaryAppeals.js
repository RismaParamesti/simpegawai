import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setPageTitle } from '../../../features/common/headerSlice'
import Pagination from '../../../components/Pagination/Pagination'
import { financeApi } from '../../../features/finance/api'
import useTablePagination from '../../../hooks/useTablePagination'

const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`

const toSafeArray = (value) => {
    if (Array.isArray(value)) {
        return value.filter((item) => item !== null && item !== undefined)
    }
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            return Array.isArray(parsed)
                ? parsed.filter((item) => item !== null && item !== undefined)
                : []
        } catch (error) {
            return []
        }
    }
    return []
}

const safeText = (value, fallback = '-') => {
    if (value === null || value === undefined) return fallback
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        const text = String(value)
        return text.trim() ? text : fallback
    }

    try {
        const serialized = JSON.stringify(value)
        return serialized && serialized !== '{}' ? serialized : fallback
    } catch (error) {
        return fallback
    }
}

const normalizeReasonItem = (item) => {
    if (item && typeof item === 'object') {
        return {
            appeal_reason_item: item.appeal_reason_item || '',
            appeal_reason_label: item.appeal_reason_label || '',
            reason: item.reason || '',
        }
    }

    return {
        appeal_reason_item: '',
        appeal_reason_label: '',
        reason: String(item || ''),
    }
}

const normalizeReviewItem = (item) => {
    if (item && typeof item === 'object') {
        return {
            label: item.label || '',
            decision: item.decision || '',
            adjustment_amount: item.adjustment_amount,
            rejection_note: item.rejection_note || '',
        }
    }

    return {
        label: '',
        decision: '',
        adjustment_amount: null,
        rejection_note: String(item || ''),
    }
}

const getApprovedReviewItems = (appeal) => {
    const approvedFromItems = toSafeArray(appeal?.review_result_items)
        .map((item) => normalizeReviewItem(item))
        .filter((item) => item.decision === 'approve')

    if (approvedFromItems.length > 0) {
        return approvedFromItems
    }

    const lines = String(appeal?.review_notes || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && /disetujui/i.test(line))

    return lines.map((line) => {
        const labelMatch = line.match(/^\[(.*?)\]/)
        const amountMatch = line.match(/(?:nominal\s*perbaikan\s*:?\s*)(\d+[\d.,]*)/i)

        const normalizedAmount = amountMatch
            ? Number(String(amountMatch[1]).replace(/\./g, '').replace(/,/g, '.')) || 0
            : 0

        return {
            label: labelMatch?.[1] || '-',
            decision: 'approve',
            adjustment_amount: normalizedAmount,
            rejection_note: '',
        }
    })
}

function FinanceSalaryAppeals() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [approvedAppeals, setApprovedAppeals] = useState([])
    const [selectedAppeal, setSelectedAppeal] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [isApprovedCardOpen, setIsApprovedCardOpen] = useState(false)
    const [isHistoryCardOpen, setIsHistoryCardOpen] = useState(false)
    const [filters, setFilters] = useState({
        search: '',
        month: '',
        year: '',
    })

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            setError('')
            const result = await financeApi.getSalaryAppeals({ status: 'approved' })
            setApprovedAppeals(result?.data || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        dispatch(setPageTitle({ title: 'Banding Gaji Finance' }))
        loadData()
    }, [dispatch, loadData])

    const activeApprovedAppeals = useMemo(() => {
        return approvedAppeals.filter((item) => {
            const hasRevisedAmount = item.final_amount !== null && item.final_amount !== undefined

            if (hasRevisedAmount) {
                return false
            }

            return true
        })
    }, [approvedAppeals])

    const yearOptions = useMemo(() => {
        const years = new Set(
            activeApprovedAppeals
                .map((item) => Number(item.period_year))
                .filter((year) => Number.isFinite(year) && year > 0)
        )

        return Array.from(years).sort((a, b) => b - a)
    }, [activeApprovedAppeals])

    const filteredAppeals = useMemo(() => {
        return activeApprovedAppeals.filter((item) => {
            const keyword = filters.search.trim().toLowerCase()
            const matchesSearch = !keyword || [
                item.full_name,
                item.employee_name,
                item.employee_code,
                item.department_name,
                item.position_name,
            ]
                .map((value) => String(value || '').toLowerCase())
                .some((value) => value.includes(keyword))

            const matchesMonth = !filters.month || String(item.period_month) === String(filters.month)
            const matchesYear = !filters.year || String(item.period_year) === String(filters.year)

            return matchesSearch && matchesMonth && matchesYear
        })
    }, [activeApprovedAppeals, filters])

    const historyAppeals = useMemo(() => {
        return approvedAppeals.filter((item) => {
            const hasRevisedAmount = item.final_amount !== null && item.final_amount !== undefined

            return hasRevisedAmount
        })
    }, [approvedAppeals])
    const approvedPagination = useTablePagination(filteredAppeals)
    const historyPagination = useTablePagination(historyAppeals)

    const totalAdjustmentAmount = useMemo(() => {
        return filteredAppeals.reduce((total, item) => total + Number(item.expected_amount || 0), 0)
    }, [filteredAppeals])

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const openDetailModal = (appeal) => {
        setSelectedAppeal(appeal)
        setShowDetailModal(true)
    }

    const getPayrollStatusBadge = (status) => {
    const normalized = String(status || '').toLowerCase().trim()

    switch (normalized) {
        case 'draft':
            return 'badge-info'       // biru
        case 'claimed':
            return 'badge-warning'    // kuning
        case 'submitted':
            return 'badge-warning'
        case 'approved':
            return 'badge-success'
        case 'rejected':
            return 'badge-error'
        case 'included_in_payroll':
            return 'badge-success'
        case 'done':
            return 'badge-primary'
        default:
            return 'badge-neutral'
    }
}
const payrollStatusLabel = (status) => {
    const normalized = String(status || '').toLowerCase().trim()

    const map = {
        draft: 'Draft',
        claimed: 'Claimed',
        submitted: 'Siap Diproses',
        approved: 'Disetujui',
        rejected: 'Ditolak',
        included_in_payroll: 'Masuk Payroll',
        done: 'Selesai',
    }

    return map[normalized] || status || '-'
}

    return (
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
            <div className="space-y-6">
                {error && <div className="alert alert-error"><span>{error}</span></div>}

                <div className="relative min-h-[125px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-5 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6">
                    <div className="absolute right-10 top-3 hidden h-24 w-64 rounded-full bg-orange-100/70 blur-sm lg:block dark:bg-orange-900/30" />
                    <div className="relative z-10 max-w-3xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
                            Banding Gaji Finance
                        </div>
                        <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
                            Kelola Revisi Banding Gaji
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                            Lihat banding gaji yang sudah disetujui HR atau Admin, lalu lanjutkan ke revisi payroll bila diperlukan.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                        { label: 'Perlu Direvisi', value: activeApprovedAppeals.length, desc: 'Pengajuan yang siap ditindaklanjuti', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                        { label: 'Sudah Direvisi', value: historyAppeals.length, desc: 'Data yang sudah memiliki nominal final', cls: 'border-amber-200 bg-amber-50 text-amber-700' },
                        { label: 'Total Nominal Perbaikan', value: formatCurrency(totalAdjustmentAmount), desc: 'Akumulasi nominal dari data tampil', cls: 'border-sky-200 bg-sky-50 text-sky-700' },
                    ].map((item) => (
                        <div key={item.label} className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.cls} dark:border-slate-700 dark:bg-slate-900`}>
                            <p className="text-sm font-bold">{item.label}</p>
                            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-50">{item.value}</p>
                            <p className="mt-1 text-xs font-medium opacity-80">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">Daftar Banding Gaji yang Perlu Direvisi</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pengajuan yang sudah disetujui bisa dilanjutkan ke revisi payroll.</p>
                        </div>
                        <button
                            type="button"
                            className="btn rounded-xl !border-orange-500 !bg-orange-500 !text-white hover:!border-orange-600 hover:!bg-orange-600"
                            onClick={() => setIsApprovedCardOpen((prev) => !prev)}
                        >
                            {isApprovedCardOpen ? 'Tutup' : 'Buka'}
                        </button>
                    </div>

                    {isApprovedCardOpen && (
                        <>
                            <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 lg:grid-cols-3 dark:border-slate-700 dark:bg-slate-950/50">
                                <input
                                    className="input input-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    placeholder="Cari nama/kode/departemen/posisi"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                                <select
                                    className="select select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    value={filters.month}
                                    onChange={(e) => handleFilterChange('month', e.target.value)}
                                >
                                    <option value="">Semua Bulan</option>
                                    {Array.from({ length: 12 }, (_, index) => (
                                        <option key={index + 1} value={index + 1}>
                                            {new Date(2000, index, 1).toLocaleString('id-ID', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="select select-bordered w-full rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    value={filters.year}
                                    onChange={(e) => handleFilterChange('year', e.target.value)}
                                >
                                    <option value="">Semua Tahun</option>
                                    {yearOptions.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            {loading ? (
                                <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-500 dark:border-slate-700">
                                    Memuat data banding gaji...
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="overflow-x-auto">
                                        <table className="table table-sm w-full">
                                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                                <tr>
                                                    <th>Pegawai</th>
                                                    <th>Kode</th>
                                                    <th>Departement</th>
                                                    <th>Posisi</th>
                                                    <th>Periode</th>
                                                    <th>Tanggal Review</th>
                                                    <th className="text-right">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {approvedPagination.paginatedItems.map((item) => (
                                                    <tr key={item.id} className="hover:bg-orange-50/40 dark:hover:bg-slate-800/70">
                                                        <td>{item.full_name || item.employee_name || '-'}</td>
                                                        <td>{item.employee_code || '-'}</td>
                                                        <td>{item.department_name || '-'}</td>
                                                        <td>{item.position_name || '-'}</td>
                                                        <td>{item.period_month}/{item.period_year}</td>
                                                        <td>{item.reviewed_at ? new Date(item.reviewed_at).toLocaleString('id-ID') : '-'}</td>
                                                        <td>
                                                            <div className="flex justify-end">
                                                                <button
                                                                    type="button"
                                                                    className="rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600"
                                                                    onClick={() => openDetailModal(item)}
                                                                >
                                                                    Lihat
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredAppeals.length === 0 && (
                                                    <tr><td colSpan={7} className="py-10 text-center text-slate-500">Belum ada banding gaji yang disetujui HR / Admin</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                                        <Pagination page={approvedPagination.page} totalPages={approvedPagination.totalPages} onChangePage={approvedPagination.setPage} itemsPerPage={approvedPagination.itemsPerPage} />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">Riwayat Banding Gaji</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Data banding gaji yang sudah masuk proses revisi payroll atau selesai.</p>
                        </div>
                        <button
                            type="button"
                            className="btn rounded-xl !border-orange-500 !bg-orange-500 !text-white hover:!border-orange-600 hover:!bg-orange-600"
                            onClick={() => setIsHistoryCardOpen((prev) => !prev)}
                        >
                            {isHistoryCardOpen ? 'Tutup' : 'Buka'}
                        </button>
                    </div>

                    {isHistoryCardOpen && (
                        <>
                            {loading ? (
                                <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-500 dark:border-slate-700">
                                    Memuat data riwayat...
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="overflow-x-auto">
                                        <table className="table table-sm w-full">
                                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                                <tr>
                                                    <th>Pegawai</th>
                                                    <th>Kode</th>
                                                    <th>Periode</th>
                                                    <th>Nominal Banding</th>
                                                    <th>Nominal Final</th>
                                                    <th>Status Payroll</th>
                                                    <th>Tanggal Review</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {historyPagination.paginatedItems.map((item) => (
                                                    <tr key={`history-${item.id}`} className="hover:bg-orange-50/40 dark:hover:bg-slate-800/70">
                                                        <td>{item.full_name || item.employee_name || '-'}</td>
                                                        <td>{item.employee_code || '-'}</td>
                                                        <td>{item.period_month}/{item.period_year}</td>
                                                        <td>{formatCurrency(item.expected_amount || 0)}</td>
                                                        <td>{formatCurrency(item.final_amount || 0)}</td>
                                                        <td>
                                                            <span className={`badge badge-sm ${getPayrollStatusBadge(item.payroll_status)}`}>
                                                                {payrollStatusLabel(item.payroll_status)}
                                                            </span>
                                                        </td>
                                                        <td>{item.reviewed_at ? new Date(item.reviewed_at).toLocaleString('id-ID') : '-'}</td>
                                                    </tr>
                                                ))}
                                                {historyAppeals.length === 0 && (
                                                    <tr>
                                                        <td colSpan={7} className="py-10 text-center text-slate-500">Belum ada riwayat banding gaji</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                                        <Pagination page={historyPagination.page} totalPages={historyPagination.totalPages} onChangePage={historyPagination.setPage} itemsPerPage={historyPagination.itemsPerPage} />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {showDetailModal && selectedAppeal && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-4xl">
                        <h3 className="font-bold text-lg mb-4">Detail Banding Gaji untuk Revisi</h3>

                        <div className="space-y-4 text-sm">
                            <div className="grid md:grid-cols-2 gap-3">
                                <div className="bg-base-200 rounded-lg p-3">
                                    <p><span className="font-semibold">Pegawai:</span> {safeText(selectedAppeal.full_name || selectedAppeal.employee_name)}</p>
                                    <p><span className="font-semibold">Kode:</span> {safeText(selectedAppeal.employee_code)}</p>
                                    <p><span className="font-semibold">Departement:</span> {safeText(selectedAppeal.department_name)}</p>
                                    <p><span className="font-semibold">Posisi:</span> {safeText(selectedAppeal.position_name)}</p>
                                </div>
                                <div className="bg-base-200 rounded-lg p-3">
                                    <p><span className="font-semibold">Periode:</span> {safeText(selectedAppeal.period_month)}/{safeText(selectedAppeal.period_year)}</p>
                                    <p><span className="font-semibold">Direview oleh:</span> {safeText(selectedAppeal.reviewer_name)}</p>
                                    <p><span className="font-semibold">Tanggal Review:</span> {selectedAppeal.reviewed_at ? new Date(selectedAppeal.reviewed_at).toLocaleString('id-ID') : '-'}</p>
                                    <p><span className="font-semibold">Total Nominal Perbaikan:</span> {formatCurrency(selectedAppeal.expected_amount || 0)}</p>
                                </div>
                            </div>

                            <div className="bg-base-200 rounded-lg p-3">
                                <p className="font-semibold mb-2">Alasan Banding Pegawai</p>
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra table-sm">
                                        <thead>
                                            <tr>
                                                <th>Komponen</th>
                                                <th>Alasan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {toSafeArray(selectedAppeal.appeal_reason_items).map((rawItem, index) => {
                                                const reasonItem = normalizeReasonItem(rawItem)
                                                return (
                                                <tr key={`${reasonItem.appeal_reason_item || 'reason'}-${index}`}>
                                                    <td>{safeText(reasonItem.appeal_reason_label || reasonItem.appeal_reason_item)}</td>
                                                    <td>{safeText(reasonItem.reason)}</td>
                                                </tr>
                                                )
                                            })}
                                            {toSafeArray(selectedAppeal.appeal_reason_items).length === 0 && (
                                                <tr>
                                                    <td colSpan={2} className="text-center opacity-70">Tidak ada detail alasan</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-base-200 rounded-lg p-3">
                                <p className="font-semibold mb-2">Hasil Review (Disetujui)</p>
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra table-sm">
                                        <thead>
                                            <tr>
                                                <th>Komponen</th>
                                                <th>Keputusan</th>
                                                <th>Nominal</th>
                                                <th>Catatan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getApprovedReviewItems(selectedAppeal).map((reviewItem, index) => {
                                                return (
                                                <tr key={`${reviewItem.label || 'review'}-${index}`}>
                                                    <td>{safeText(reviewItem.label)}</td>
                                                    <td>Disetujui</td>
                                                    <td>{formatCurrency(reviewItem.adjustment_amount || 0)}</td>
                                                    <td>-</td>
                                                </tr>
                                                )
                                            })}
                                            {getApprovedReviewItems(selectedAppeal).length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="text-center opacity-70">Belum ada item yang disetujui</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button type="button" className="btn btn-ghost" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    navigate(
                                        `/app/payroll/revision?employee_id=${selectedAppeal.employee_id}&month=${selectedAppeal.period_month}&year=${selectedAppeal.period_year}&source=salary-appeal&appeal_id=${selectedAppeal.id}`,
                                        { state: { appeal: selectedAppeal } }
                                    )
                                }}
                            >
                                Lanjut Revisi Payroll
                            </button>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    )
}

export default FinanceSalaryAppeals
