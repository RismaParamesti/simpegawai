import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setPageTitle } from '../../features/common/headerSlice'
import TitleCard from '../../components/Cards/TitleCard'
import { adminApi } from '../../features/admin/api'

function InternalPage(){
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [dashboard, setDashboard] = useState(null)

   const getStatusBadgeClass = (status) => {
    const s = String(status || '').toLowerCase().trim()

    switch (s) {
        // Status aktif
        case 'active':
        case 'aktif':
            return 'badge badge-success text-white'

        // Status nonaktif
        case 'inactive':
        case 'nonactive':
        case 'non-active':
        case 'tidak aktif':
        case 'nonaktif':
            return 'badge badge-error text-white'

        // Status pegawai tetap
        case 'permanent':
        case 'tetap':
            return 'badge badge-primary text-white'

        // Status kontrak
        case 'contract':
        case 'kontrak':
            return 'badge badge-warning text-black'

        // Status magang
        case 'intern':
        case 'magang':
            return 'badge badge-info text-white'

        default:
            return 'badge badge-outline'
    }
}


    const loadDashboard = async () => {
        try {
            setLoading(true)
            setError('')
            const result = await adminApi.getDashboard()
            setDashboard(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        dispatch(setPageTitle({ title : 'Dashboard Admin'}))
        loadDashboard()
            }, [dispatch])

    if (loading) {
        return <div className="text-center py-10">Memuat dashboard admin...</div>
    }

    if (error) {
        return (
            <TitleCard title="Dashboard Admin" topMargin="mt-0">
                <div className="alert alert-error">
                    <span>{error}</span>
                </div>
                <button className="btn btn-primary mt-4" onClick={loadDashboard}>Muat Ulang</button>
            </TitleCard>
        )
    }

    const employees = dashboard?.overview?.employees || {}
    const users = dashboard?.overview?.users || {}
    const recentUsers = dashboard?.recent_activity?.new_users || []
    const recentEmployees = dashboard?.recent_activity?.new_employees || []
    const departmentStats = dashboard?.departments || []
    const positionStats = dashboard?.positions || []
    const shiftStats = dashboard?.shifts || []

    const statCards = [
        { title: 'Total Pegawai', value: employees.total_employees || 0, path: '/app/employees' },
        { title: 'Total User', value: users.total_users || 0, path: '/app/users' },
        { title: 'User Aktif', value: users.active_users || 0, path: '/app/users' },
        { title: 'User Nonaktif', value: users.inactive_users || 0, path: '/app/users' },
    ]

    return(
        <>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                {statCards.map((item) => (
                    <button
                        key={item.title}
                        type="button"
                        onClick={() => navigate(item.path)}
                        className="stat bg-base-100 rounded-box shadow text-left hover:bg-base-200/60 transition cursor-pointer"
                    >
                        <div className="stat-title text-xs leading-tight">{item.title}</div>
                        <div className="stat-value text-primary text-lg sm:text-2xl lg:text-3xl">{item.value}</div>
                        <div className="stat-desc opacity-70 text-xs">Klik detail &rarr;</div>
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6">
                <TitleCard title="Departemen Terbaru" topMargin="mt-0">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Departemen</th>
                                    <th>Posisi</th>
                                    <th>Jumlah Pegawai</th>
                                    <th>Rata-rata Gaji</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departmentStats.slice(0, 5).map((department) => (
                                    <tr key={department.id || `${department.name}-${department.code}`}>
                                        <td>
                                            <div className="font-semibold">{department.name}</div>
                                            <div className="text-xs opacity-70">{department.code || '-'}</div>
                                        </td>
                                        <td>{department.position_count || 0}</td>
                                        <td>{department.employee_count || 0}</td>
                                        <td>Rp {(Number(department.avg_salary) || 0).toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                                {departmentStats.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center opacity-70">Belum ada data departemen</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {departmentStats.length > 5 ? (
                        <div className="text-right mt-3">
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/positions')}>
                                Lihat Semua
                            </button>
                        </div>
                    ) : null}
                </TitleCard>

                <TitleCard title="Informasi Jam Kerja" topMargin="mt-0">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Jenis</th>
                                    <th>Jam Masuk</th>
                                    <th>Jam Pulang</th>
                                    <th>Pegawai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shiftStats.slice(0, 5).map((shift) => (
                                    <tr key={`${shift.shift_name}-${shift.check_in_time}-${shift.check_out_time}`}>
                                        <td className="font-semibold">{shift.shift_name}</td>
                                        <td>{shift.check_in_time || '-'}</td>
                                        <td>{shift.check_out_time || '-'}</td>
                                        <td>{shift.employee_count || 0}</td>
                                    </tr>
                                ))}
                                {shiftStats.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center opacity-70">Belum ada data shift</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {shiftStats.length > 5 ? (
                        <div className="text-right mt-3">
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/attendance')}>
                                Lihat Semua
                            </button>
                        </div>
                    ) : null}
                </TitleCard>
            </div>

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mt-6">
                <TitleCard title="User Terbaru" topMargin="mt-0">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.slice(0, 5).map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td><span className={getStatusBadgeClass(user.status)}>{user.status}</span></td>
                                    </tr>
                                ))}
                                {recentUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center opacity-70">Belum ada user terbaru</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {recentUsers.length > 5 ? (
                        <div className="text-right mt-3">
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/users')}>
                                Lihat Semua
                            </button>
                        </div>
                    ) : null}
                </TitleCard>

                <TitleCard title="Pegawai Terbaru" topMargin="mt-0">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Nama</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentEmployees.slice(0, 5).map((employee) => (
                                    <tr key={employee.employee_code}>
                                        <td>{employee.employee_code}</td>
                                        <td>{employee.name}</td>
                                        <td><span className={getStatusBadgeClass(employee.employment_status)}>{employee.employment_status}</span></td>
                                    </tr>
                                ))}
                                {recentEmployees.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center opacity-70">Belum ada pegawai terbaru</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {recentEmployees.length > 5 ? (
                        <div className="text-right mt-3">
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/employees')}>
                                Lihat Semua
                            </button>
                        </div>
                    ) : null}
                </TitleCard>
            </div>
        </>
    )
}

export default InternalPage
