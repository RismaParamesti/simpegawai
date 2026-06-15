import { useEffect, useState, useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { setPageTitle, showNotification } from '../../../features/common/headerSlice'
import TitleCard from '../../../components/Cards/TitleCard'
import Pagination from '../../../components/Pagination/Pagination'
import { hrApi } from '../../../features/hr/api'
import useTablePagination from '../../../hooks/useTablePagination'
import { formatDateOnly } from '../../../utils/dateUtils'

const normalizeAttendanceStatus = (value) => String(value || '').toLowerCase().trim()

const getAttendanceCategory = (item) => {
    const status = normalizeAttendanceStatus(item?.status)

    if (status === 'alpha' || status === 'absent') return 'alpha'
    if (status === 'cuti') return 'cuti'
    if (status === 'izin' || status === 'sakit') return 'izin'

    return 'hadir'
}

const attendanceStatusLabels = {
    hadir: 'Hadir',
    alpha: 'Alpha',
    cuti: 'Cuti',
    izin: 'Izin',
}

const getDefaultFilters = () => ({
    date: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    employeeSearch: '',
    status: 'all',
})

function HRAttendance() {
    const dispatch = useDispatch()
    const location = useLocation()
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState(getDefaultFilters)
    const [records, setRecords] = useState([])
    const recordsPagination = useTablePagination(records)
    const [allRecords, setAllRecords] = useState([])
    const [employees, setEmployees] = useState([])

    const loadEmployees = useCallback(async () => {
        try {
            const result = await hrApi.getAttendanceMembers()
            setEmployees(result?.data || [])
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        }
    }, [dispatch])

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const params = filters.date
                ? { date: filters.date }
                : { month: filters.month, year: filters.year }
            const result = await hrApi.getAttendanceRecords(params)
            setAllRecords(result?.data || [])
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        } finally {
            setLoading(false)
        }
    }, [filters.date, filters.month, filters.year, dispatch])

    useEffect(() => {
        dispatch(setPageTitle({ title: 'Kehadiran Pegawai' }))
    }, [dispatch])

    useEffect(() => {
        loadData()
    }, [loadData])

    useEffect(() => {
        loadEmployees()
    }, [loadEmployees])

    useEffect(() => {
        if (location.pathname === '/app/attendance') {
            loadData()
            loadEmployees()
        }
    }, [location.key, location.pathname, loadData, loadEmployees])

    useEffect(() => {
        const refreshInterval = setInterval(() => {
            loadData()
        }, 30000)

        return () => clearInterval(refreshInterval)
    }, [loadData])

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const statusFromQuery = String(params.get('status') || '').toLowerCase()
        const dateFromQuery = String(params.get('date') || '')
        const allowedStatuses = new Set(['all', 'hadir', 'alpha', 'cuti', 'izin'])
        const nextStatus = allowedStatuses.has(statusFromQuery) ? statusFromQuery : 'all'

        setFilters((prev) => {
            const nextDate = /^\d{4}-\d{2}-\d{2}$/.test(dateFromQuery) ? dateFromQuery : prev.date
            if (prev.status === nextStatus && prev.date === nextDate) return prev
            return { ...prev, status: nextStatus, date: nextDate }
        })
    }, [location.search])

    useEffect(() => {
        let filtered = allRecords

        const employeeQuery = String(filters.employeeSearch || '').trim().toLowerCase()
        if (employeeQuery) {
            filtered = filtered.filter((item) => {
                const name = String(item.employee_name || '').toLowerCase()
                const code = String(item.employee_code || '').toLowerCase()
                const codeName = `${code} - ${name}`.trim()
                const nameCode = `${name} - ${code}`.trim()
                return (
                    name.includes(employeeQuery) ||
                    code.includes(employeeQuery) ||
                    codeName.includes(employeeQuery) ||
                    nameCode.includes(employeeQuery)
                )
            })
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter((item) => getAttendanceCategory(item) === filters.status)
        }

        setRecords(filtered)
    }, [allRecords, filters.employeeSearch, filters.status])

    const sortedEmployees = useMemo(() => {
        return [...employees].sort((a, b) => {
            const codeA = String(a.employee_code || '')
            const codeB = String(b.employee_code || '')
            if (!codeA && !codeB) {
                return String(a.employee_name || '').localeCompare(String(b.employee_name || ''), 'id')
            }
            if (!codeA) return 1
            if (!codeB) return -1
            return codeA.localeCompare(codeB, 'id', { numeric: true, sensitivity: 'base' })
        })
    }, [employees])

    const summary = records.reduce((acc, item) => {
        const key = getAttendanceCategory(item)
        acc[key] = (acc[key] || 0) + 1
        return acc
    }, {})

    const getStatusBadgeClass = (status) => {
    const s = normalizeAttendanceStatus(status)

    switch (s) {
        case 'hadir':
            return 'badge badge-success text-white'
        case 'alpha':
            return 'badge badge-error text-white'
        case 'cuti':
            return 'badge badge-info text-white'
        case 'izin':
            return 'badge badge-warning text-white'
        default:
            return 'badge badge-outline'
    }
}

    const getDisplayStatus = (item) => {
        const category = getAttendanceCategory(item)
        return attendanceStatusLabels[category] || category
    }

    const resetFilters = () => {
        setFilters(getDefaultFilters())
        recordsPagination.setPage(1)
    }

    return (
        <TitleCard title="Laporan Kehadiran Pegawai" topMargin="mt-0">
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-6">
                <input
                    type="date"
                    className="input input-bordered"
                    value={filters.date}
                    onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                />
                <select
                    className="select select-bordered"
                    value={filters.month}
                    onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))}
                    disabled={Boolean(filters.date)}
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
                    disabled={Boolean(filters.date)}
                >
                    {Array.from({ length: 5 }, (_, idx) => {
                        const year = new Date().getFullYear() - idx
                        return <option key={year} value={year}>{year}</option>
                    })}
                </select>
                <input
                    className="input input-bordered"
                    list="attendance-employee-options"
                    placeholder="Cari pegawai"
                    value={filters.employeeSearch}
                    onChange={(e) => setFilters((prev) => ({ ...prev, employeeSearch: e.target.value }))}
                />
                <datalist id="attendance-employee-options">
                    {sortedEmployees.map((member) => (
                        <option
                            key={member.employee_id}
                            value={member.employee_code ? `${member.employee_code} - ${member.employee_name}` : member.employee_name}
                        />
                    ))}
                </datalist>
                <select
                    className="select select-bordered"
                    value={filters.status}
                    onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                >
                    <option value="all">Semua Status</option>
                    <option value="hadir">Hadir</option>
                    <option value="alpha">Alpha</option>
                    <option value="cuti">Cuti</option>
                    <option value="izin">Izin</option>
                </select>
                <button
                    type="button"
                    className="btn btn-outline w-full border-orange-500 text-orange-600 hover:border-orange-600 hover:bg-orange-500 hover:text-white"
                    onClick={resetFilters}
                >
                    Reset Filter
                </button>
            </div>

            <div className="grid md:grid-cols-4 grid-cols-2 gap-4 mb-6">
                <div className="stat rounded-lg bg-base-200">
                    <div className="stat-title">Hadir</div>
                    <div className="stat-value text-xl">{summary.hadir || 0}</div>
                </div>
                <div className="stat rounded-lg bg-base-200">
                    <div className="stat-title">Alpha</div>
                    <div className="stat-value text-xl">{summary.alpha || 0}</div>
                </div>
                <div className="stat rounded-lg bg-base-200">
                    <div className="stat-title">Cuti</div>
                    <div className="stat-value text-xl">{summary.cuti || 0}</div>
                </div>
                <div className="stat rounded-lg bg-base-200">
                    <div className="stat-title">Izin</div>
                    <div className="stat-value text-xl">{summary.izin || 0}</div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Memuat data kehadiran...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Pegawai</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recordsPagination.paginatedItems.map((item) => (
                                <tr key={item.id}>
                                    <td>{formatDateOnly(item.date)}</td>
                                    <td>
                                        <div className="font-semibold">{item.employee_name}</div>
                                        <div className="text-xs opacity-70">{item.employee_code}</div>
                                    </td>
                                    <td>{item.check_in || '-'}</td>
                                    <td>{item.check_out || '-'}</td>
                                    <td>
    <span className={getStatusBadgeClass(getAttendanceCategory(item))}>
        {getDisplayStatus(item)}
    </span>
</td>
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center opacity-70">Tidak ada data kehadiran</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination page={recordsPagination.page} totalPages={recordsPagination.totalPages} onChangePage={recordsPagination.setPage} itemsPerPage={recordsPagination.itemsPerPage} />
                </div>
            )}
        </TitleCard>
    )
}

export default HRAttendance

