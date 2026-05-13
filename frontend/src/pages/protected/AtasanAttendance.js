import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle, showNotification } from '../../features/common/headerSlice'
import TitleCard from '../../components/Cards/TitleCard'
import { atasanApi } from '../../features/atasan/api'

function AtasanAttendance() {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState(null)
    const [activeEditId, setActiveEditId] = useState(null)
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        employeeId: 'all',
        status: 'all'
    })
    const [records, setRecords] = useState([])
    const [allRecords, setAllRecords] = useState([])
    const [teamMembers, setTeamMembers] = useState([])
    const [editableRecords, setEditableRecords] = useState({})

    const formatLateDuration = (lateMinutes) => {
        const minutes = Number(lateMinutes)
        if (!Number.isFinite(minutes) || minutes <= 0) {
            return '00 jam 00 menit 00 detik'
        }

        const totalSeconds = Math.round(minutes * 60)
        const hours = Math.floor(totalSeconds / 3600)
        const remainingSeconds = totalSeconds % 3600
        const mins = Math.floor(remainingSeconds / 60)
        const secs = remainingSeconds % 60

        const [hh, mm, ss] = [hours, mins, secs].map((value) => String(value).padStart(2, '0'))
        return `${hh} jam ${mm} menit ${ss} detik`
    }

    const formatWorkDuration = (hoursValue) => {
        const hours = Number(hoursValue)
        if (!Number.isFinite(hours) || hours <= 0) {
            return '00 jam 00 menit'
        }

        const totalMinutes = Math.round(hours * 60)
        const hh = Math.floor(totalMinutes / 60)
        const mm = totalMinutes % 60

        return `${String(hh).padStart(2, '0')} jam ${String(mm).padStart(2, '0')} menit`
    }

    const loadTeamMembers = useCallback(async () => {
        try {
            const result = await atasanApi.getTeamMembers()
            setTeamMembers(result?.data || [])
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        }
    }, [dispatch])

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const result = await atasanApi.getAttendanceRecords({ month: filters.month, year: filters.year })
            const source = result?.data || []
            setAllRecords(source)
            setEditableRecords(
                source.reduce((acc, item) => {
                    acc[item.id] = {
                        check_in: item.check_in || '',
                        check_out: item.check_out || '',
                        status: item.status || 'hadir',
                    }
                    return acc
                }, {})
            )
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        } finally {
            setLoading(false)
        }
    }, [filters.month, filters.year, dispatch])

    useEffect(() => {
        dispatch(setPageTitle({ title: 'Kehadiran Tim' }))
    }, [dispatch])

    useEffect(() => {
        loadData()
    }, [loadData])

    useEffect(() => {
        loadTeamMembers()
    }, [loadTeamMembers])

    useEffect(() => {
        let filteredRecords = allRecords

        if (filters.employeeId !== 'all') {
            filteredRecords = filteredRecords.filter((item) => String(item.employee_id) === String(filters.employeeId))
        }

        if (filters.status !== 'all') {
            if (filters.status === 'terlambat') {
                filteredRecords = filteredRecords.filter((item) => Boolean(item.is_late))
            } else {
                filteredRecords = filteredRecords.filter((item) => String(item.status) === filters.status)
            }
        }

        setRecords(filteredRecords)
    }, [allRecords, filters.employeeId, filters.status])

    useEffect(() => {
        if (!activeEditId) return
        const activeStillVisible = records.some((item) => String(item.id) === String(activeEditId))
        if (!activeStillVisible) {
            setActiveEditId(null)
        }
    }, [activeEditId, records])

    const updateRecordField = (id, field, value) => {
        setEditableRecords((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [field]: value,
            },
        }))
    }

    const openEditRow = (item) => {
        setActiveEditId(item.id)
        setEditableRecords((prev) => ({
            ...prev,
            [item.id]: {
                check_in: prev[item.id]?.check_in ?? item.check_in ?? '',
                check_out: prev[item.id]?.check_out ?? item.check_out ?? '',
                status: prev[item.id]?.status ?? item.status ?? 'hadir',
            },
        }))
    }

    const closeEditRow = () => {
        setActiveEditId(null)
    }

    const saveRecord = async (item) => {
        try {
            setUpdatingId(item.id)
            const draft = editableRecords[item.id] || {}
            await atasanApi.updateAttendanceRecord(item.id, {
                check_in: draft.check_in ?? item.check_in ?? '',
                check_out: draft.check_out ?? item.check_out ?? '',
                status: draft.status ?? item.status ?? 'hadir',
            })
            dispatch(showNotification({ message: 'Data kehadiran berhasil diperbarui', status: 1 }))
            await loadData()
            setActiveEditId(null)
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        } finally {
            setUpdatingId(null)
        }
    }

    const summary = records.reduce((acc, item) => {
        const key = item.status || 'unknown'
        acc[key] = (acc[key] || 0) + 1
        if (item.is_late) {
            acc.late = (acc.late || 0) + 1
            acc.late_minutes = (acc.late_minutes || 0) + (Number(item.late_minutes) || 0)
        }
        return acc
    }, {})
const getAttendanceStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
        case "hadir":
            return "badge badge-success text-white"

        case "izin":
            return "badge badge-info text-white"

        case "sakit":
            return "badge badge-warning text-white"

        case "alpha":
            return "badge badge-error text-white"

        case "libur":
            return "badge badge-neutral text-white"

        case "terlambat":
            return "badge badge-secondary text-white"

        default:
            return "badge badge-outline"
    }
}
    return (
        <>
            <TitleCard title="Laporan Kehadiran Tim" topMargin="mt-0">
                <div className="grid md:grid-cols-4 grid-cols-1 gap-4 mb-6">
                    <select
                        className="select select-bordered"
                        value={filters.month}
                        onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))}
                    >
                        {Array.from({ length: 12 }, (_, idx) => (
                            <option key={idx + 1} value={idx + 1}>
                                {new Date(2000, idx).toLocaleString('id-ID', { month: 'long' })}
                            </option>
                        ))}
                    </select>
                    <select
                        className="select select-bordered"
                        value={filters.year}
                        onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value }))}
                    >
                        {Array.from({ length: 5 }, (_, idx) => {
                            const year = new Date().getFullYear() - idx
                            return <option key={year} value={year}>{year}</option>
                        })}
                    </select>
                    <select
                        className="select select-bordered"
                        value={filters.employeeId}
                        onChange={(e) => setFilters((prev) => ({ ...prev, employeeId: e.target.value }))}
                    >
                        <option value="all">Semua Anggota Tim</option>
                        {teamMembers.map((member) => (
                            <option key={member.employee_id} value={member.employee_id}>
                                {member.employee_name} {member.employee_code ? `(${member.employee_code})` : ''}
                            </option>
                        ))}
                    </select>
                    <select
                        className="select select-bordered"
                        value={filters.status}
                        onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="all">Semua Status</option>
                        <option value="hadir">Hadir</option>
                        <option value="izin">Izin</option>
                        <option value="sakit">Sakit</option>
                        <option value="alpha">Alpha</option>
                        <option value="libur">Libur</option>
                        <option value="terlambat">Terlambat</option>
                    </select>
                </div>

                <div className="grid md:grid-cols-6 grid-cols-2 gap-4 mb-6">
                    <div className="stat rounded-lg bg-base-200">
                        <div className="stat-title">Hadir</div>
                        <div className="stat-value text-xl">{summary.hadir || 0}</div>
                    </div>
                    <div className="stat rounded-lg bg-base-200">
                        <div className="stat-title">Izin</div>
                        <div className="stat-value text-xl">{summary.izin || 0}</div>
                    </div>
                    <div className="stat rounded-lg bg-base-200">
                        <div className="stat-title">Sakit</div>
                        <div className="stat-value text-xl">{summary.sakit || 0}</div>
                    </div>
                    <div className="stat rounded-lg bg-base-200">
                        <div className="stat-title">Alpha</div>
                        <div className="stat-value text-xl">{summary.alpha || 0}</div>
                    </div>
                    <div className="stat rounded-lg bg-base-200">
                        <div className="stat-title">Libur</div>
                        <div className="stat-value text-xl">{summary.libur || 0}</div>
                    </div>
                    <div className="stat rounded-lg bg-base-200">
                        <div className="stat-title">Terlambat</div>
                        <div className="stat-value text-xl">{summary.late || 0}</div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Memuat data kehadiran...</div>
                ) : (
                    <div className="relative overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Pegawai</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Jam Kerja</th>
                                    <th>Jam Lembur</th>
                                    <th>Status</th>
                                    <th>Terlambat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="cursor-pointer hover:bg-base-300/60"
                                        onClick={() => openEditRow(item)}
                                    >
                                        <td>{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                        <td>
                                            <div className="font-semibold">{item.employee_name}</div>
                                            <div className="text-xs opacity-70">{item.employee_code}</div>
                                        </td>
                                        <td>{item.check_in || '-'}</td>
                                        <td>{item.check_out || '-'}</td>
                                        <td>{formatWorkDuration(item.working_hours)}</td>
                                        <td>{formatWorkDuration(item.overtime_hours)}</td>
                                        <td>
    <span className={getAttendanceStatusBadge(item.status)}>
        {item.status}
    </span>
</td>

<td>
    {['izin', 'sakit', 'libur', 'alpha'].includes(
        String(item.status || '').toLowerCase()
    )
        ? '-'
        : (item.is_late
            ? formatLateDuration(item.late_minutes || 0)
            : 'Tidak')}
</td>
                                    </tr>
                                ))}
                                {records.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="text-center opacity-70">Tidak ada data kehadiran</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {activeEditId ? (() => {
                            const activeItem = records.find((item) => String(item.id) === String(activeEditId))
                            const draft = editableRecords[activeEditId] || {}

                            if (!activeItem) return null

                            return (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-300/40 backdrop-blur-sm px-4">
                                    <div className="w-full max-w-4xl rounded-2xl border border-base-300 bg-base-100 shadow-2xl overflow-hidden scale-100 animate-[fadeIn_.15s_ease-out]">
                                        <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
                                            <div>
                                                <div className="text-sm opacity-70">
                                                    Edit baris kehadiran - {new Date(activeItem.date).toLocaleDateString('id-ID')}
                                                </div>
                                                <div className="text-lg font-semibold">{activeItem.employee_name} {activeItem.employee_code ? `(${activeItem.employee_code})` : ''}</div>
                                            </div>
                                            <button className="btn btn-sm btn-ghost" onClick={closeEditRow}>Tutup</button>
                                        </div>

                                        <div className="p-5">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <label className="form-control w-full">
                                                    <div className="label"><span className="label-text">Check In</span></div>
                                                    <input
                                                        type="time"
                                                        className="input input-bordered w-full"
                                                        value={draft.check_in ?? activeItem.check_in ?? ''}
                                                        onChange={(e) => updateRecordField(activeEditId, 'check_in', e.target.value)}
                                                    />
                                                </label>
                                                <label className="form-control w-full">
                                                    <div className="label"><span className="label-text">Check Out</span></div>
                                                    <input
                                                        type="time"
                                                        className="input input-bordered w-full"
                                                        value={draft.check_out ?? activeItem.check_out ?? ''}
                                                        onChange={(e) => updateRecordField(activeEditId, 'check_out', e.target.value)}
                                                    />
                                                </label>
                                                <label className="form-control w-full md:col-span-2">
                                                    <div className="label"><span className="label-text">Status</span></div>
                                                    <select
                                                        className="select select-bordered w-full"
                                                        value={draft.status ?? activeItem.status ?? 'hadir'}
                                                        onChange={(e) => updateRecordField(activeEditId, 'status', e.target.value)}
                                                    >
                                                        <option value="hadir">hadir</option>
                                                        <option value="izin">izin</option>
                                                        <option value="sakit">sakit</option>
                                                        <option value="alpha">alpha</option>
                                                        <option value="libur">libur</option>
                                                    </select>
                                                </label>
                                                <div className="rounded-xl bg-base-200 p-4 md:col-span-2 grid gap-2 md:grid-cols-2">
                                                    <div>
                                                        <div className="text-xs uppercase opacity-70">Jam Kerja</div>
                                                        <div className="text-lg font-semibold">{formatWorkDuration(activeItem.working_hours)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs uppercase opacity-70">Jam Lembur</div>
                                                        <div className="text-lg font-semibold">{formatWorkDuration(activeItem.overtime_hours)}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-5 flex items-center justify-end gap-3">
                                                <button className="btn btn-ghost" onClick={closeEditRow}>Batal</button>
                                                <button
                                                    className={`btn btn-primary ${updatingId === activeItem.id ? 'loading' : ''}`}
                                                    onClick={() => saveRecord(activeItem)}
                                                    disabled={updatingId === activeItem.id}
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })() : null}
                    </div>
                )}
            </TitleCard>
        </>
    )
}

export default AtasanAttendance
