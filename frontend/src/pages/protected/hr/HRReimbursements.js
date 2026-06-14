import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle, showNotification } from '../../../features/common/headerSlice'
import Pagination from '../../../components/Pagination/Pagination'
import { hrApi } from '../../../features/hr/api'
import useTablePagination from '../../../hooks/useTablePagination'

const getStatusBadge = (status) => {
    if (status === 'included_in_payroll') return 'badge-success'
    if (status === 'approved') return 'badge-info'
    if (status === 'rejected') return 'badge-error'
    return 'badge-warning'
}

const statusLabelMap = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    included_in_payroll: 'Masuk Payroll',
}

const getStatusLabel = (status) => {
    return statusLabelMap[status] || status
}

const normalizeStatus = (status) => String(status || '').trim().toLowerCase()
const isProcessedByHr = (status) => ['included_in_payroll', 'rejected'].includes(status)
const HR_REJECTION_MARKER = '[HR_REJECTION_REASON]'

const getRejectionReason = (item = {}) => {
    if (item.rejection_reason) return String(item.rejection_reason)
    if (item.hr_rejection_reason) return String(item.hr_rejection_reason)
    if (item.review_notes) return String(item.review_notes)
    if (item.notes) return String(item.notes)

    const description = String(item.description || '')
    const markerIndex = description.indexOf(HR_REJECTION_MARKER)
    if (markerIndex === -1) return ''
    return description.slice(markerIndex + HR_REJECTION_MARKER.length).trim()
}

const getEmployeeDescription = (item = {}) => {
    const description = String(item.description || item.note || '')
    const markerIndex = description.indexOf(HR_REJECTION_MARKER)
    if (markerIndex === -1) return description
    return description.slice(0, markerIndex).trim()
}

function HRReimbursements() {
    const dispatch = useDispatch()
    const currentUserId = (() => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
            return Number(storedUser?.id || storedUser?.user_id || 0)
        } catch (error) {
            return 0
        }
    })()
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)
    const [selectedItem, setSelectedItem] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [approveTarget, setApproveTarget] = useState(null)
    const [showApproveModal, setShowApproveModal] = useState(false)
    const [rejectTarget, setRejectTarget] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [items, setItems] = useState([])
    const [isPendingCardOpen, setIsPendingCardOpen] = useState(false)
    const [isHistoryCardOpen, setIsHistoryCardOpen] = useState(false)
    const historyCardRef = useRef(null)
    const [pendingFilters, setPendingFilters] = useState({
        search: '',
        month: '',
        year: '',
    })
    const [historyFilters, setHistoryFilters] = useState({
        search: '',
        status: '',
        month: '',
        year: '',
    })

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const result = await hrApi.getReimbursements()
            setItems(result?.data || [])
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        } finally {
            setLoading(false)
        }
    }, [dispatch])

    useEffect(() => {
        dispatch(setPageTitle({ title: 'Validasi Reimbursement' }))
    }, [dispatch])

    useEffect(() => {
        loadData()
    }, [loadData])

    const scrollToHistoryCard = useCallback(() => {
        window.requestAnimationFrame(() => {
            historyCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
    }, [])

    const handleAction = async (item, action) => {
        if (action === 'reject') {
            setRejectTarget(item)
            setRejectReason('')
            setShowRejectModal(true)
            return
        }

        setApproveTarget(item)
        setShowApproveModal(true)
    }

    const handleConfirmApprove = async () => {
        if (!approveTarget?.id) return

        try {
            setProcessingId(approveTarget.id)
            await hrApi.validateReimbursement(approveTarget.id)
            dispatch(showNotification({ message: 'Reimbursement berhasil divalidasi', status: 1 }))
            setShowApproveModal(false)
            setApproveTarget(null)

            await loadData()
            scrollToHistoryCard()
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        } finally {
            setProcessingId(null)
        }
    }

    const handleConfirmReject = async () => {
        if (!rejectTarget?.id) return

        const trimmedReason = rejectReason.trim()
        if (!trimmedReason) {
            dispatch(showNotification({ message: 'Alasan penolakan wajib diisi', status: 0 }))
            return
        }

        try {
            setProcessingId(rejectTarget.id)
            await hrApi.rejectReimbursement(rejectTarget.id, trimmedReason)
            dispatch(showNotification({ message: 'Reimbursement berhasil ditolak', status: 1 }))
            setShowRejectModal(false)
            setRejectTarget(null)
            setRejectReason('')
            await loadData()
            scrollToHistoryCard()
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        } finally {
            setProcessingId(null)
        }
    }

    const applyCommonFilters = useCallback((sourceItems, currentFilters) => {
        const query = String(currentFilters.search || '').trim().toLowerCase()

        return sourceItems.filter((item) => {
            const dateValue = item.created_at ? new Date(item.created_at) : null
            const monthMatch = !currentFilters.month || (dateValue ? String(dateValue.getMonth() + 1) === String(currentFilters.month) : false)
            const yearMatch = !currentFilters.year || (dateValue ? String(dateValue.getFullYear()) === String(currentFilters.year) : false)
            const searchMatch = !query
                ? true
                : String(item.employee_name || '').toLowerCase().includes(query)
                    || String(item.employee_code || '').toLowerCase().includes(query)
                    || String(item.reimbursement_type || '').toLowerCase().includes(query)

            return monthMatch && yearMatch && searchMatch
        })
    }, [])

    const openDetail = (item) => {
        setSelectedItem(item)
        setShowDetailModal(true)
    }

    const pendingItems = useMemo(() => {
        const pendingSource = items.filter(
            (item) => item.status === 'approved' && Number(item.submitter_user_id || 0) !== currentUserId,
        )
        return applyCommonFilters(pendingSource, pendingFilters)
    }, [items, pendingFilters, applyCommonFilters, currentUserId])

    const historyItems = useMemo(() => {
        let historySource = items.filter((item) => ['included_in_payroll', 'rejected'].includes(item.status))
        if (historyFilters.status) {
            historySource = historySource.filter((item) => item.status === historyFilters.status)
        }
        return applyCommonFilters(historySource, historyFilters)
            .slice()
            .sort((a, b) => {
                const processedA = new Date(a?.updated_at || a?.created_at || 0).getTime()
                const processedB = new Date(b?.updated_at || b?.created_at || 0).getTime()
                if (processedA !== processedB) return processedB - processedA
                return Number(b?.id || 0) - Number(a?.id || 0)
            })
    }, [items, historyFilters, applyCommonFilters])
    const pendingPagination = useTablePagination(pendingItems)
    const historyPagination = useTablePagination(historyItems)
    const summaryStats = useMemo(() => {
        return items.reduce((stats, item) => {
            const status = normalizeStatus(item.status)
            const amount = Number(item.amount) || 0
            const isOwnSubmission = Number(item.submitter_user_id || 0) === currentUserId

            if (status === 'approved' && !isOwnSubmission) stats.waitingValidation += 1
            if (status === 'included_in_payroll') stats.approved += 1
            if (status === 'rejected') stats.rejected += 1
            if (status === 'included_in_payroll') {
                stats.includedInPayroll += 1
                stats.totalAmount += amount
            }

            return stats
        }, {
            waitingValidation: 0,
            approved: 0,
            rejected: 0,
            includedInPayroll: 0,
            totalAmount: 0,
        })
    }, [items, currentUserId])

    return (
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
            <div className="space-y-6">
                <div className="relative min-h-[120px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-5 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
                    <div className="relative z-10 max-w-3xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
                            Validasi Reimbursement
                        </div>
                        <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
                            Validasi Reimbursement Pegawai
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                            Kelola reimbursement yang menunggu validasi, lihat detail lampiran, dan pantau riwayat validasi reimbursement.
                        </p>
                    </div>
                </div>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5 mb-6">
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="text-sm font-bold text-amber-700">Menunggu Validasi</div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">
                        {summaryStats.waitingValidation}
                    </div>
                </div>
                <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="text-sm font-bold text-sky-700">Disetujui</div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">
                        {summaryStats.approved}
                    </div>
                </div>
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="text-sm font-bold text-rose-700">Ditolak</div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">
                        {summaryStats.rejected}
                    </div>
                </div>
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="text-sm font-bold text-emerald-700">Sudah Masuk Payroll</div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">
                        {summaryStats.includedInPayroll}
                    </div>
                </div>
                <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="text-sm font-bold text-indigo-700">Total Nominal</div>
                    <div className="mt-2 text-2xl font-extrabold text-slate-900">
                        Rp {summaryStats.totalAmount.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Data Belum di Validasi</h2>
                        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Daftar reimbursement yang menunggu validasi HR.</p>
                    </div>
                    <button
                        type="button"
                        className="btn rounded-xl !border-orange-500 !bg-orange-500 !text-white hover:!border-orange-600 hover:!bg-orange-600"
                        onClick={() => setIsPendingCardOpen((prev) => !prev)}
                    >
                        {isPendingCardOpen ? 'Tutup' : 'Buka'}
                    </button>
                </div>
                {isPendingCardOpen && (
                    <>
                <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 lg:grid-cols-3">
                    <input
                        className="input input-bordered rounded-xl bg-white"
                        placeholder="Cari nama/kode/jenis reimbursement"
                        value={pendingFilters.search}
                        onChange={(e) => setPendingFilters((prev) => ({ ...prev, search: e.target.value }))}
                    />
                    <select
                        className="select select-bordered rounded-xl bg-white"
                        value={pendingFilters.month}
                        onChange={(e) => setPendingFilters((prev) => ({ ...prev, month: e.target.value }))}
                    >
                        <option value="">Semua Bulan</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={`pending-month-${i + 1}`} value={String(i + 1)}>
                                {new Date(2000, i).toLocaleString('id-ID', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <select
                        className="select select-bordered rounded-xl bg-white"
                        value={pendingFilters.year}
                        onChange={(e) => setPendingFilters((prev) => ({ ...prev, year: e.target.value }))}
                    >
                        <option value="">Semua Tahun</option>
                        {Array.from({ length: 5 }, (_, i) => {
                            const year = String(new Date().getFullYear() - i)
                            return <option key={`pending-year-${year}`} value={year}>{year}</option>
                        })}
                    </select>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-500">Memuat data reimbursement...</div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="table table-sm w-full">
                            <thead className="text-center">
                                <tr>
                                    <th className="text-center">Pegawai</th>
                                    <th className="text-center">Jenis</th>
                                    <th className="text-center">Nominal</th>
                                    <th className="text-center">Tanggal</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingPagination.paginatedItems.map((item) => {
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="font-bold text-slate-800">{item.employee_name || '-'}</div>
                                                <div className="text-xs text-slate-500">{item.employee_code || '-'}</div>
                                            </td>
                                            <td>{item.reimbursement_type || '-'}</td>
                                            <td className="font-bold text-slate-800">Rp {(Number(item.amount) || 0).toLocaleString('id-ID')}</td>
                                            <td>{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(item.status)}`}>
                                                    {getStatusLabel(item.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        className="
        px-3 py-1 text-xs
        bg-gradient-to-b from-blue-400 to-blue-600
        text-white rounded-full
        shadow-md hover:shadow-lg
        border border-blue-600
        hover:from-blue-500 hover:to-blue-700
        transition-all duration-200
      "
                                                        onClick={() => openDetail(item)}
                                                    >
                                                        Detail
                                                    </button>
                                                    <button
                                                        className={`btn btn-success btn-xs ${processingId === item.id ? 'loading' : ''}`}
                                                        onClick={() => handleAction(item, 'approve')}
                                                        disabled={processingId === item.id}
                                                    >
                                                        Validasi
                                                    </button>
                                                    <button
                                                        className={`btn btn-error btn-xs ${processingId === item.id ? 'loading' : ''}`}
                                                        onClick={() => handleAction(item, 'reject')}
                                                        disabled={processingId === item.id}
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {pendingItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-slate-500">Tidak ada data yang perlu divalidasi</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <Pagination page={pendingPagination.page} totalPages={pendingPagination.totalPages} onChangePage={pendingPagination.setPage} itemsPerPage={pendingPagination.itemsPerPage} />
                    </div>
                )}
                    </>
                )}
            </section>

            <div ref={historyCardRef}>
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">Riwayat Validasi</h2>
                            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Riwayat reimbursement yang sudah divalidasi atau ditolak.</p>
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
                <div className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 lg:grid-cols-4">
                    <input
                        className="input input-bordered rounded-xl bg-white"
                        placeholder="Cari nama/kode/jenis reimbursement"
                        value={historyFilters.search}
                        onChange={(e) => setHistoryFilters((prev) => ({ ...prev, search: e.target.value }))}
                    />
                    <select
                        className="select select-bordered rounded-xl bg-white"
                        value={historyFilters.status}
                        onChange={(e) => setHistoryFilters((prev) => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="">Semua Status</option>
                        <option value="included_in_payroll">Sudah Masuk Payroll</option>
                        <option value="rejected">Ditolak</option>
                    </select>
                    <select
                        className="select select-bordered rounded-xl bg-white"
                        value={historyFilters.month}
                        onChange={(e) => setHistoryFilters((prev) => ({ ...prev, month: e.target.value }))}
                    >
                        <option value="">Semua Bulan</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={`history-month-${i + 1}`} value={String(i + 1)}>
                                {new Date(2000, i).toLocaleString('id-ID', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <select
                        className="select select-bordered rounded-xl bg-white"
                        value={historyFilters.year}
                        onChange={(e) => setHistoryFilters((prev) => ({ ...prev, year: e.target.value }))}
                    >
                        <option value="">Semua Tahun</option>
                        {Array.from({ length: 5 }, (_, i) => {
                            const year = String(new Date().getFullYear() - i)
                            return <option key={`history-year-${year}`} value={year}>{year}</option>
                        })}
                    </select>
                </div>

                {/* Summary Stats */}
                <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 mb-6">
                    <div className="stat bg-success text-success-content rounded-lg">
                        <div className="stat-title text-success-content">Sudah Masuk Payroll</div>
                        <div className="stat-value text-2xl">
                            {items.filter(a => a.status === 'included_in_payroll').length}
                        </div>
                    </div>
                    <div className="stat bg-error text-error-content rounded-lg">
                        <div className="stat-title text-error-content">Ditolak</div>
                        <div className="stat-value text-2xl">
                            {items.filter(a => a.status === 'rejected').length}
                        </div>
                    </div>
                    <div className="stat bg-info text-info-content rounded-lg">
                        <div className="stat-title text-info-content">Total Disetujui</div>
                        <div className="stat-value text-xl">
                            Rp {items.filter(a => a.status === 'included_in_payroll').reduce((sum, a) => sum + (Number(a.amount) || 0), 0).toLocaleString('id-ID')}
                        </div>
                    </div>
                    <div className="stat bg-error/20 text-error-content rounded-lg">
                        <div className="stat-title text-error-content">Total Ditolak</div>
                        <div className="stat-value text-xl">
                            Rp {items.filter(a => a.status === 'rejected').reduce((sum, a) => sum + (Number(a.amount) || 0), 0).toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-500">Memuat data reimbursement...</div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="table table-sm w-full">
                            <thead className="text-center">
                                <tr>
                                    <th className="text-center">Pegawai</th>
                                    <th className="text-center">Jenis</th>
                                    <th className="text-center">Nominal</th>
                                    <th className="text-center">Tanggal Pengajuan</th>
                                    <th className="text-center">Status Akhir</th>
                                    <th className="text-center">Tanggal Proses</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyPagination.paginatedItems.map((item) => (
                                    <tr key={`history-${item.id}`}>
                                        <td>
                                            <div className="font-bold text-slate-800">{item.employee_name || '-'}</div>
                                            <div className="text-xs text-slate-500">{item.employee_code || '-'}</div>
                                        </td>
                                        <td>{item.reimbursement_type || '-'}</td>
                                        <td className="font-bold text-slate-800">Rp {(Number(item.amount) || 0).toLocaleString('id-ID')}</td>
                                        <td>{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(item.status)}`}>
                                                {getStatusLabel(item.status)}
                                            </span>
                                        </td>
                                        <td>{isProcessedByHr(item.status) && item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID') : '-'}</td>
                                        <td>
                                            <button
                                                className="
        px-3 py-1 text-xs
        bg-gradient-to-b from-blue-400 to-blue-600
        text-white rounded-full
        shadow-md hover:shadow-lg
        border border-blue-600
        hover:from-blue-500 hover:to-blue-700
        transition-all duration-200
      "
                                                onClick={() => openDetail(item)}
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {historyItems.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center text-slate-500">Belum ada riwayat validasi</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <Pagination page={historyPagination.page} totalPages={historyPagination.totalPages} onChangePage={historyPagination.setPage} itemsPerPage={historyPagination.itemsPerPage} />
                    </div>
                )}
                    </>
                )}
                </section>
            </div>

            {showDetailModal && selectedItem && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl overflow-hidden rounded-3xl border border-slate-200 p-0">
                        <h3 className="border-b border-slate-200 bg-gradient-to-r from-white to-orange-50 px-6 py-5 text-lg font-extrabold text-slate-900">Detail Reimbursement</h3>

                        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-500">Pegawai</p>
                                <p className="font-bold text-slate-800">{selectedItem.employee_name || '-'}</p>
                                <p className="text-sm opacity-70">{selectedItem.employee_code || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Status</p>
                                <span className={`badge ${getStatusBadge(selectedItem.status)}`}>
                                    {getStatusLabel(selectedItem.status)}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Jenis Reimbursement</p>
                                <p className="font-bold text-slate-800">{selectedItem.reimbursement_type || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Nominal</p>
                                <p className="font-bold text-slate-800">Rp {(Number(selectedItem.amount) || 0).toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Tanggal Pengajuan</p>
                                <p>{selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString('id-ID') : '-'}</p>
                            </div>
                            {isProcessedByHr(selectedItem.status) && (
                                <div>
                                    <p className="text-xs text-slate-500">Tanggal Diproses</p>
                                    <p>{selectedItem.updated_at ? new Date(selectedItem.updated_at).toLocaleString('id-ID') : '-'}</p>
                                </div>
                            )}
                            <div className="md:col-span-2">
                                <p className="text-xs text-slate-500">Keterangan Pegawai</p>
                                <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3">{getEmployeeDescription(selectedItem) || '-'}</p>
                            </div>
                            {selectedItem.status === 'rejected' && (
                                <div className="md:col-span-2">
                                    <p className="text-xs text-slate-500">Alasan Penolakan HR</p>
                                    <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-600">
                                        {getRejectionReason(selectedItem) || '-'}
                                    </p>
                                </div>
                            )}
                            <div className="md:col-span-2">
                                <p className="text-xs text-slate-500">Lampiran</p>
                                {selectedItem.attachment ? (
                                    <a
                                        href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${selectedItem.attachment}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="link link-primary"
                                    >
                                        Lihat lampiran reimbursement
                                    </a>
                                ) : (
                                    <p>-</p>
                                )}
                            </div>
                        </div>

                        <div className="modal-action border-t border-slate-200 px-6 py-4">
                            <button className="btn rounded-xl border-none bg-orange-500 text-white hover:bg-orange-600" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showApproveModal && approveTarget && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-lg overflow-hidden rounded-3xl border border-slate-200 p-0">
                        <h3 className="font-bold text-lg">Konfirmasi Validasi Reimbursement</h3>
                        <div className="mt-3 space-y-3">
                            <p className="text-sm text-base-content/70">
                                Pastikan data reimbursement sudah sesuai sebelum divalidasi.
                            </p>
                            <div className="bg-base-200 rounded p-3 text-sm">
                                <p><span className="font-bold text-slate-800">Pegawai:</span> {approveTarget.employee_name || '-'}</p>
                                <p><span className="font-bold text-slate-800">Jenis:</span> {approveTarget.reimbursement_type || '-'}</p>
                                <p><span className="font-bold text-slate-800">Nominal:</span> Rp {(Number(approveTarget.amount) || 0).toLocaleString('id-ID')}</p>
                                <p><span className="font-bold text-slate-800">Tanggal:</span> {approveTarget.created_at ? new Date(approveTarget.created_at).toLocaleDateString('id-ID') : '-'}</p>
                            </div>
                        </div>

                        <div className="modal-action border-t border-slate-200 px-6 py-4">
                            <button
                                className="btn rounded-xl"
                                onClick={() => {
                                    setShowApproveModal(false)
                                    setApproveTarget(null)
                                }}
                                disabled={processingId === approveTarget.id}
                            >
                                Batal
                            </button>
                            <button
                                className={`btn btn-success ${processingId === approveTarget.id ? 'loading' : ''}`}
                                onClick={handleConfirmApprove}
                                disabled={processingId === approveTarget.id}
                            >
                                Validasi Reimbursement
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && rejectTarget && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-lg overflow-hidden rounded-3xl border border-slate-200 p-0">
                        <h3 className="font-bold text-lg">Alasan Penolakan Reimbursement</h3>
                        <div className="mt-3 space-y-3">
                            <div className="bg-base-200 rounded p-3 text-sm">
                                <p><span className="font-bold text-slate-800">Pegawai:</span> {rejectTarget.employee_name || '-'}</p>
                                <p><span className="font-bold text-slate-800">Jenis:</span> {rejectTarget.reimbursement_type || '-'}</p>
                                <p><span className="font-bold text-slate-800">Nominal:</span> Rp {(Number(rejectTarget.amount) || 0).toLocaleString('id-ID')}</p>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Alasan Penolakan</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered min-h-[120px] rounded-2xl"
                                    placeholder="Tulis alasan penolakan reimbursement..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                                <label className="label">
                                    <span className="label-text-alt text-base-content/70">Alasan ini wajib diisi sebelum menolak</span>
                                </label>
                            </div>
                        </div>

                        <div className="modal-action border-t border-slate-200 px-6 py-4">
                            <button
                                className="btn rounded-xl"
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setRejectTarget(null)
                                    setRejectReason('')
                                }}
                                disabled={processingId === rejectTarget.id}
                            >
                                Batal
                            </button>
                            <button
                                className={`btn btn-error ${processingId === rejectTarget.id ? 'loading' : ''}`}
                                onClick={handleConfirmReject}
                                disabled={processingId === rejectTarget.id}
                            >
                                Tolak Reimbursement
                            </button>
                        </div>
                    </div>
                </div>
            )}

            </div>
        </div>
    )
}

export default HRReimbursements
