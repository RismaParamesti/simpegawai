import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setPageTitle, showNotification } from '../../../features/common/headerSlice'
import TitleCard from '../../../components/Cards/TitleCard'
import Pagination from '../../../components/Pagination/Pagination'
import { atasanApi } from '../../../features/atasan/api'
import { formatDateOnly } from '../../../utils/dateUtils'

const LEAVE_TYPE_LABEL = {
    izin: 'Izin',
    cuti_tahunan: 'Cuti Tahunan',
    cuti_sakit: 'Cuti Sakit',
    cuti_melahirkan: 'Cuti Melahirkan',
    cuti_keguguran: 'Cuti Keguguran',
    cuti_menikah: 'Cuti Menikah',
    cuti_khusus: 'Cuti Penting (Cuti Khusus)',
    izin_sakit: 'Izin Sakit',
    izin_pribadi: 'Izin Keperluan Pribadi',
    izin_terlambat: 'Izin Terlambat / Pulang Cepat',
    izin_lainnya: 'Izin Lainnya',
    cuti_lainnya: 'Cuti Lainnya',
}

const getLeaveTypeLabel = (leaveType) => LEAVE_TYPE_LABEL[leaveType] || leaveType || '-'

const getFileTypeFromPath = (filePath) => {
    if (!filePath) return 'unknown'

    const lowerPath = String(filePath).toLowerCase()
    if (lowerPath.endsWith('.pdf')) return 'pdf'
    if (
        lowerPath.endsWith('.jpg') ||
        lowerPath.endsWith('.jpeg') ||
        lowerPath.endsWith('.png') ||
        lowerPath.endsWith('.webp')
    ) {
        return 'image'
    }

    return 'unknown'
}

function AtasanLeaveRequestsHistory() {
    const dispatch = useDispatch()
    const location = useLocation()
    const itemsPerPage = 10
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)
    const [approvalFilters] = useState({
        status: 'pending',
        search: ''
    })
    const [historyFilters, setHistoryFilters] = useState({
        name: '',
        type: '',
        status: '',
    })
    const [items, setItems] = useState([])
    const [historyItems, setHistoryItems] = useState([])
    const [employeeOptions, setEmployeeOptions] = useState([])
    const [selectedItem, setSelectedItem] = useState(null)
    const [selectedProof, setSelectedProof] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [approvalPage, setApprovalPage] = useState(1)
    const [historyPage, setHistoryPage] = useState(1)

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const [filteredResult, historyResult] = await Promise.all([
                atasanApi.getLeaveRequests({ status: approvalFilters.status }),
                atasanApi.getLeaveRequests({ status: '' }),
            ])

            const source = filteredResult?.data || []
            const historySource = historyResult?.data || []

            const roles = JSON.parse(localStorage.getItem('roles') || '[]')

            if (Array.isArray(roles) && roles.includes('admin')) {
                try {
                    const employees = await atasanApi.getAllEmployees()
                    const options = Array.from(
                        new Map(
                            employees
                                .filter((employee) => employee?.full_name)
                                .map((employee) => [
                                    employee.employee_code || String(employee.full_name).toLowerCase(),
                                    {
                                        name: employee.full_name,
                                        code: employee.employee_code || ''
                                    }
                                ])
                        ).values()
                    ).sort((a, b) => {
                        if (!a.code && !b.code) return a.name.localeCompare(b.name, 'id')
                        if (!a.code) return 1
                        if (!b.code) return -1
                        return a.code.localeCompare(b.code, 'id', { numeric: true, sensitivity: 'base' })
                    })

                    setEmployeeOptions(options)
                } catch {
                    // Fallback ke data pengajuan jika endpoint pegawai gagal dipanggil.
                    const fallbackOptions = Array.from(
                        new Map(
                            historySource
                                .filter((item) => item.employee_name)
                                .map((item) => [
                                    item.employee_code || String(item.employee_name).toLowerCase(),
                                    {
                                        name: item.employee_name,
                                        code: item.employee_code || ''
                                    }
                                ])
                        ).values()
                    ).sort((a, b) => {
                        if (!a.code && !b.code) return a.name.localeCompare(b.name, 'id')
                        if (!a.code) return 1
                        if (!b.code) return -1
                        return a.code.localeCompare(b.code, 'id', { numeric: true, sensitivity: 'base' })
                    })
                    setEmployeeOptions(fallbackOptions)
                }
            } else {
                const options = Array.from(
                    new Map(
                        historySource
                            .filter((item) => item.employee_name)
                            .map((item) => [
                                item.employee_code || String(item.employee_name).toLowerCase(),
                                {
                                    name: item.employee_name,
                                    code: item.employee_code || ''
                                }
                            ])
                    ).values()
                ).sort((a, b) => {
                    if (!a.code && !b.code) return a.name.localeCompare(b.name, 'id')
                    if (!a.code) return 1
                    if (!b.code) return -1
                    return a.code.localeCompare(b.code, 'id', { numeric: true, sensitivity: 'base' })
                })
                setEmployeeOptions(options)
            }

            setHistoryItems(
                historySource
                    .filter((item) => item.status === 'approved' || item.status === 'rejected')
                    .sort((a, b) => new Date(b.approved_at || b.updated_at || b.created_at) - new Date(a.approved_at || a.updated_at || a.created_at))
            )
            setItems(source)
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        } finally {
            setLoading(false)
        }
    }, [approvalFilters.status, dispatch])

    useEffect(() => {
        dispatch(setPageTitle({ title: 'Persetujuan Cuti & Izin' }))
    }, [dispatch])

    useEffect(() => {
        loadData()
    }, [loadData])

    useEffect(() => {
        setApprovalPage(1)
    }, [approvalFilters.search, approvalFilters.status])

    useEffect(() => {
        setHistoryPage(1)
    }, [historyFilters.name, historyFilters.type, historyFilters.status])

    useEffect(() => {
        const requestId = location.state?.requestId
        if (!requestId || !historyItems.length) return

        const match = historyItems.find((item) => String(item.id) === String(requestId))
        if (match) {
            openDetailModal(match)
        }
    }, [historyItems, location.state?.requestId])

    const isMatchEmployeeQuery = (item, query) => {
        if (!query) return true
        const normalized = query.toLowerCase()
        const name = (item.employee_name || '').toLowerCase()
        const code = (item.employee_code || '').toLowerCase()
        const codeName = `${code} ${name}`.trim()
        const nameCode = `${name} ${code}`.trim()
        return (
            name.includes(normalized) ||
            code.includes(normalized) ||
            codeName.includes(normalized) ||
            nameCode.includes(normalized)
        )
    }

    const filteredItems = items.filter((item) => isMatchEmployeeQuery(item, approvalFilters.search.trim()))
    const filteredHistoryItems = historyItems.filter((item) => {
        const matchesName = historyFilters.name
            ? (item.employee_name || '').toLowerCase().includes(historyFilters.name.trim().toLowerCase())
            : true
        const matchesType = historyFilters.type
            ? (item.leave_type || '').toLowerCase().includes(historyFilters.type.trim().toLowerCase())
            : true
        const matchesStatus = historyFilters.status ? item.status === historyFilters.status : true
        return matchesName && matchesType && matchesStatus
    })

    const totalApprovalPages = Math.ceil(filteredItems.length / itemsPerPage)
    const totalHistoryPages = Math.ceil(filteredHistoryItems.length / itemsPerPage)

    useEffect(() => {
        if (approvalPage > totalApprovalPages && totalApprovalPages > 0) {
            setApprovalPage(totalApprovalPages)
        }
    }, [approvalPage, totalApprovalPages])

    useEffect(() => {
        if (historyPage > totalHistoryPages && totalHistoryPages > 0) {
            setHistoryPage(totalHistoryPages)
        }
    }, [historyPage, totalHistoryPages])
    const paginatedHistoryItems = filteredHistoryItems.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage)

    const handleReview = async (id, action) => {
        try {
            setProcessingId(id)
            await atasanApi.reviewLeaveRequest(id, action)
            dispatch(showNotification({
                message: action === 'approve' ? 'Pengajuan berhasil disetujui' : 'Pengajuan berhasil ditolak',
                status: 1
            }))
            loadData()
            return true
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
            return false
        } finally {
            setProcessingId(null)
        }
    }

    const openDetailModal = (item) => {
        setSelectedItem(item)
        setShowDetailModal(true)
    }

    const closeDetailModal = () => {
        setSelectedItem(null)
        setShowDetailModal(false)
    }

    const openProofModal = (proofPath, leaveType) => {
        if (!proofPath) return
        setSelectedProof({
            path: proofPath,
            type: getFileTypeFromPath(proofPath),
            leaveType: getLeaveTypeLabel(leaveType),
        })
    }

    const closeProofModal = () => {
        setSelectedProof(null)
    }

    const getBuktiUrl = (path) => {
        if (!path) return ''
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000'
        return `${baseUrl}/${String(path).replace(/^\/+/, '')}`
    }

    return (
        <>
            <datalist id="employee-filter-options">
                {employeeOptions.map((option) => (
                    <option
                        key={`${option.name}-${option.code}`}
                        value={option.code ? `${option.code} - ${option.name}` : option.name}
                    />
                ))}
            </datalist>

            <TitleCard title="Riwayat Persetujuan Cuti & Izin" topMargin="mt-6">
                <div className="grid md:grid-cols-4 grid-cols-1 gap-4 mb-6">
                    <input
                        className="input input-bordered"
                        placeholder="Cari nama pegawai"
                        value={historyFilters.name}
                        onChange={(e) => setHistoryFilters((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                        className="input input-bordered"
                        placeholder="Cari tipe pengajuan"
                        value={historyFilters.type}
                        onChange={(e) => setHistoryFilters((prev) => ({ ...prev, type: e.target.value }))}
                    />
                    <select
                        className="select select-bordered"
                        value={historyFilters.status}
                        onChange={(e) => setHistoryFilters((prev) => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="">Semua Status</option>
                        <option value="approved">Disetujui</option>
                        <option value="rejected">Ditolak</option>
                    </select>
                    <button
                        className="btn-secondary rounded-full"
                        onClick={() => setHistoryFilters({ name: '', type: '', status: '' })}
                    >
                        Reset Filter
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Memuat data riwayat...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Pegawai</th>
                                    <th>Tipe</th>
                                    <th>Status</th>
                                    <th>Diproses Oleh</th>
                                    <th>Diproses Pada</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedHistoryItems.map((item) => (
                                    <tr key={`history-${item.id}`}>
                                        <td>
                                            <div className="font-semibold">{item.employee_name}</div>
                                            <div className="text-xs opacity-70">{item.employee_code}</div>
                                        </td>
                                        <td>{getLeaveTypeLabel(item.leave_type)}</td>
                                        <td>
                                            <span className={`badge ${item.status === 'approved' ? 'badge-success' : 'badge-error'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>{item.approved_by_name || '-'}</td>
                                        <td>{item.approved_at ? new Date(item.approved_at).toLocaleString('id-ID') : '-'}</td>
                                        <td>
    <button
        className=" px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg border border-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 "
        onClick={() => openDetailModal(item)}
    >
        Detail
    </button>
</td>
                                    </tr>
                                ))}
                                {filteredHistoryItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center opacity-70">Belum ada riwayat persetujuan</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && (
                    <Pagination
                        page={historyPage}
                        totalPages={totalHistoryPages}
                        onChangePage={setHistoryPage}
                        itemsPerPage={itemsPerPage}
                    />
                )}
            </TitleCard>

            {showDetailModal && selectedItem && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-2xl">
                        <h3 className="font-bold text-lg mb-4">Detail Pengajuan Cuti/Izin</h3>

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
                                <p className="opacity-60">Jenis Pengajuan</p>
                                <p className="font-semibold">{getLeaveTypeLabel(selectedItem.leave_type)}</p>
                            </div>
                            <div>
                                <p className="opacity-60">Total Hari</p>
                                <p className="font-semibold">{selectedItem.total_days || selectedItem.duration || 0}</p>
                            </div>
                            <div>
                                <p className="opacity-60">Waktu Pengajuan</p>
                                <p className="font-semibold">{selectedItem.time || '-'}</p>
                            </div>
                            <div>
                                <p className="opacity-60">Opsi Cuti Khusus</p>
                                <p className="font-semibold">{selectedItem.cuti_khusus_option || '-'}</p>
                            </div>
                            <div>
                                <p className="opacity-60">Tanggal Mulai</p>
                                <p className="font-semibold">
                                    {formatDateOnly(selectedItem.start_date)}
                                </p>
                            </div>
                            <div>
                                <p className="opacity-60">Tanggal Selesai</p>
                                <p className="font-semibold">
                                    {formatDateOnly(selectedItem.end_date)}
                                </p>
                            </div>
                            <div>
                                <p className="opacity-60">Status</p>
                                <span className={`badge mt-1 ${selectedItem.status === 'approved' ? 'badge-success' : selectedItem.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                                    {selectedItem.status}
                                </span>
                            </div>
                            <div>
                                <p className="opacity-60">Diproses Oleh</p>
                                <p className="font-semibold">{selectedItem.approved_by_name || '-'}</p>
                            </div>
                            <div>
                                <p className="opacity-60">Diajukan Pada</p>
                                <p className="font-semibold">
                                    {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString('id-ID') : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="opacity-60">Diproses Pada</p>
                                <p className="font-semibold">
                                    {selectedItem.approved_at ? new Date(selectedItem.approved_at).toLocaleString('id-ID') : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="opacity-60 text-sm">Alasan</p>
                            <div className="p-3 bg-base-200 rounded-lg mt-1 text-sm">
                                {selectedItem.reason || '-'}
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="opacity-60 text-sm">Bukti Lampiran</p>
                            {selectedItem.bukti ? (
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm mt-2"
                                    onClick={() => openProofModal(selectedItem.bukti, selectedItem.leave_type)}
                                >
                                    Lihat bukti ({selectedItem.bukti.split('/').pop()})
                                </button>
                            ) : (
                                <p className="text-sm opacity-70">Tidak ada bukti lampiran.</p>
                            )}
                        </div>

                        <div className="mt-4 grid md:grid-cols-2 grid-cols-1 gap-4 text-sm">
                            <div>
                                <p className="opacity-60">Diproses Oleh</p>
                                <p className="font-semibold">{selectedItem.approved_by_name || '-'}</p>
                            </div>
                            <div>
                                <p className="opacity-60">Diproses Pada</p>
                                <p className="font-semibold">
                                    {selectedItem.approved_at ? new Date(selectedItem.approved_at).toLocaleString('id-ID') : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button className="btn" onClick={closeDetailModal}>Tutup</button>
                            {selectedItem.status === 'pending' && (
                                <>
                                    <button
                                        className={`btn btn-success ${processingId === selectedItem.id ? 'loading' : ''}`}
                                        onClick={async () => {
                                            const success = await handleReview(selectedItem.id, 'approve')
                                            if (success) closeDetailModal()
                                        }}
                                        disabled={processingId === selectedItem.id}
                                    >
                                        Setujui
                                    </button>
                                    <button
                                        className={`btn btn-error ${processingId === selectedItem.id ? 'loading' : ''}`}
                                        onClick={async () => {
                                            const success = await handleReview(selectedItem.id, 'reject')
                                            if (success) closeDetailModal()
                                        }}
                                        disabled={processingId === selectedItem.id}
                                    >
                                        Tolak
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedProof ? (
                <div className="modal modal-open">
                    <div className="modal-box max-w-4xl">
                        <button
                            type="button"
                            className="btn btn-sm btn-circle absolute right-2 top-2"
                            onClick={closeProofModal}
                        >
                            x
                        </button>
                        <h3 className="font-semibold text-xl mb-1">Bukti Pengajuan</h3>
                        <p className="text-sm opacity-70 mb-4">
                            Jenis: {selectedProof.leaveType || '-'}
                        </p>

                        <div className="w-full min-h-[420px] bg-base-200 rounded-lg overflow-hidden flex items-center justify-center">
                            {selectedProof.type === 'image' ? (
                                <img
                                    src={getBuktiUrl(selectedProof.path)}
                                    alt="Bukti cuti atau izin"
                                    className="max-h-[70vh] w-auto object-contain"
                                />
                            ) : selectedProof.type === 'pdf' ? (
                                <iframe
                                    title="Bukti PDF"
                                    src={getBuktiUrl(selectedProof.path)}
                                    className="w-full h-[70vh] border-0"
                                />
                            ) : (
                                <div className="text-center p-6">
                                    <p className="mb-2">
                                        Preview tidak tersedia untuk tipe file ini.
                                    </p>
                                    <a
                                        href={getBuktiUrl(selectedProof.path)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-primary btn-sm"
                                    >
                                        Buka File
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="modal-action">
                            <button className="btn" onClick={closeProofModal}>
                                Tutup
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="modal-backdrop"
                        onClick={closeProofModal}
                    >
                        Close
                    </button>
                </div>
            ) : null}

        </>
    )
}

export default AtasanLeaveRequestsHistory

