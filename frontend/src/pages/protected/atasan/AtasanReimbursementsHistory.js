import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setPageTitle, showNotification } from '../../../features/common/headerSlice'
import TitleCard from '../../../components/Cards/TitleCard'
import Pagination from '../../../components/Pagination/Pagination'
import { atasanApi } from '../../../features/atasan/api'

const getStatusLabel = (status) => {
    const labels = {
        pending: 'pending',
        approved: 'approved',
        included_in_payroll: 'included payroll',
        rejected: 'rejected',
    }

    return labels[status] || status
}

const getStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
        case "pending":
            return "badge badge-warning text-white"

        case "approved":
            return "badge badge-info text-white"

        case "included_in_payroll":
            return "badge badge-success text-white"

        case "rejected":
            return "badge badge-error text-white"

        default:
            return "badge badge-outline"
    }
}

function AtasanReimbursementsHistory() {
    const dispatch = useDispatch()
    const location = useLocation()
    const itemsPerPage = 10
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        name: '',
        type: '',
        date: '',
        status: '',
    })
    const [allItems, setAllItems] = useState([])
    const [historyPage, setHistoryPage] = useState(1)
    const [selectedItem, setSelectedItem] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const result = await atasanApi.getReimbursements()
            setAllItems(result?.data || [])
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        } finally {
            setLoading(false)
        }
    }, [dispatch])

    useEffect(() => {
        dispatch(setPageTitle({ title: 'Persetujuan Reimbursement' }))
    }, [dispatch])

    useEffect(() => {
        loadData()
    }, [loadData])

    useEffect(() => {
        setHistoryPage(1)
    }, [filters.name, filters.type, filters.date, filters.status])

    useEffect(() => {
        const reimbursementId = location.state?.reimbursementId
        if (!reimbursementId || !allItems.length) return

        const match = allItems.find((item) => String(item.id) === String(reimbursementId))
        if (match) {
            setSelectedItem(match)
            setShowDetailModal(true)
        }
    }, [allItems, location.state?.reimbursementId])

    const normalizeLocalDate = (value) => {
        if (!value) return ''
        const parsed = new Date(value)
        if (Number.isNaN(parsed.getTime())) return ''
        const year = parsed.getFullYear()
        const month = String(parsed.getMonth() + 1).padStart(2, '0')
        const day = String(parsed.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const getReimbursementTypeLabel = (value) => {
        if (!value) return '-'
        return String(value).replace(/_/g, ' ')
    }

    const openDetailModal = (item) => {
        setSelectedItem(item)
        setShowDetailModal(true)
    }

    const closeDetailModal = () => {
        setSelectedItem(null)
        setShowDetailModal(false)
    }

    const historyItems = allItems.filter((item) => {
        if (item.status === 'pending') return false

        const matchesName = filters.name
            ? (item.employee_name || '').toLowerCase().includes(filters.name.trim().toLowerCase())
            : true

        const matchesType = filters.type
            ? (item.reimbursement_type || '').toLowerCase().includes(filters.type.trim().toLowerCase())
            : true

        const matchesDate = filters.date
            ? normalizeLocalDate(item.created_at) === filters.date
            : true

        const matchesStatus = filters.status
            ? item.status === filters.status
            : true

        return matchesName && matchesType && matchesDate && matchesStatus
    })
    const totalHistoryPages = Math.ceil(historyItems.length / itemsPerPage)

    useEffect(() => {
        if (historyPage > totalHistoryPages && totalHistoryPages > 0) {
            setHistoryPage(totalHistoryPages)
        }
    }, [historyPage, totalHistoryPages])

    const paginatedHistoryItems = historyItems.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage)

    const resetFilters = () => {
        setFilters({
            name: '',
            type: '',
            date: '',
            status: '',
        })
    }

    return (
        <>
            <TitleCard title="Riwayat Reimbursement Tim" topMargin="mt-6">
                {loading ? (
                    <div className="text-center py-10">Memuat data reimbursement...</div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-5 grid-cols-1 gap-4 mb-6">
                            <input
                                className="input input-bordered"
                                placeholder="Cari nama pegawai"
                                value={filters.name}
                                onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
                            />
                            <input
                                className="input input-bordered"
                                placeholder="Cari jenis reimbursement"
                                value={filters.type}
                                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                            />
                            <input
                                className="input input-bordered"
                                type="date"
                                value={filters.date}
                                onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                            />
                            <select
                                className="select select-bordered"
                                value={filters.status}
                                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                            >
                                <option value="">Semua Status</option>
                                <option value="approved">Approved</option>
                                <option value="included_in_payroll">Included in Payroll</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <button className="btn-secondary rounded-full" onClick={resetFilters}>
                                Reset Filter
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Pegawai</th>
                                    <th>Jenis</th>
                                    <th>Nominal</th>
                                    <th>Tanggal</th>
                                    <th>Status</th>
                                    <th>Lampiran</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedHistoryItems.map((item) => {
                                    const attachmentUrl = item.attachment
                                        ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${item.attachment}`
                                        : ''

                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="font-semibold">{item.employee_name}</div>
                                                <div className="text-xs opacity-70">{item.employee_code}</div>
                                            </td>
                                            <td>{getReimbursementTypeLabel(item.reimbursement_type)}</td>
                                            <td className="font-semibold">Rp {(Number(item.amount) || 0).toLocaleString('id-ID')}</td>
                                            <td>{item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(item.status)}`}>
                                                    {getStatusLabel(item.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2 items-center">
                                                    <button className="btn btn-xs action-view" onClick={() => openDetailModal(item)}>
                                                        Detail
                                                    </button>
                                                    {item.attachment ? (
                                                    <a href={attachmentUrl} target="_blank" rel="noreferrer">
                                                        <button className=" px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg border border-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 ">Lihat</button>
                                                    </a>
                                                ) : (
                                                    <span className="text-xs opacity-60">-</span>
                                                )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {historyItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center opacity-70">Belum ada riwayat reimbursement</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                    </>
                )}

                {!loading && historyItems.length > 0 && (
                    <Pagination
                        page={historyPage}
                        totalPages={totalHistoryPages}
                        onChangePage={setHistoryPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}

                {showDetailModal && selectedItem && (
                    <div className="modal modal-open">
                        <div className="modal-box max-w-2xl">
                            <h3 className="font-bold text-lg mb-4">Detail Reimbursement</h3>

                            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 text-sm">
                                <div>
                                    <p className="opacity-60">Nama Pegawai</p>
                                    <p className="font-semibold">{selectedItem.employee_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="opacity-60">Kode Pegawai</p>
                                    <p className="font-semibold">{selectedItem.employee_code || '-'}</p>
                                </div>
                                <div>
                                    <p className="opacity-60">Jenis</p>
                                    <p className="font-semibold">{getReimbursementTypeLabel(selectedItem.reimbursement_type)}</p>
                                </div>
                                <div>
                                    <p className="opacity-60">Nominal</p>
                                    <p className="font-semibold">Rp {(Number(selectedItem.amount) || 0).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="opacity-60">Status</p>
                                    <span className={`badge mt-1 ${getStatusBadge(selectedItem.status)}`}>
                                        {getStatusLabel(selectedItem.status)}
                                    </span>
                                </div>
                                <div>
                                    <p className="opacity-60">Diajukan Pada</p>
                                    <p className="font-semibold">{selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString('id-ID') : '-'}</p>
                                </div>
                                <div>
                                    <p className="opacity-60">Diproses Oleh</p>
                                    <p className="font-semibold">{selectedItem.reviewed_by_name || selectedItem.approved_by_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="opacity-60">Diproses Pada</p>
                                    <p className="font-semibold">
                                        {selectedItem.reviewed_at || selectedItem.approved_at
                                            ? new Date(selectedItem.reviewed_at || selectedItem.approved_at).toLocaleString('id-ID')
                                            : '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="opacity-60 text-sm">Deskripsi</p>
                                <div className="p-3 bg-base-200 rounded-lg mt-1 text-sm whitespace-pre-wrap">
                                    {selectedItem.description || selectedItem.notes || '-'}
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="opacity-60 text-sm">Lampiran</p>
                                {selectedItem.attachment ? (
                                    <a
                                        href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${String(selectedItem.attachment).replace(/^\/+/, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="link link-primary text-sm"
                                    >
                                        Lihat lampiran ({String(selectedItem.attachment).split('/').pop()})
                                    </a>
                                ) : (
                                    <p className="text-sm opacity-70">Tidak ada lampiran.</p>
                                )}
                            </div>

                            <div className="modal-action">
                                <button className="btn" onClick={closeDetailModal}>
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </TitleCard>
        </>
    )
}

export default AtasanReimbursementsHistory

