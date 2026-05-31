import { useEffect, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { setPageTitle } from '../../../features/common/headerSlice'
import { hrApi } from '../../../features/hr/api'
import {
    UserGroupIcon,
    DocumentTextIcon,
    WalletIcon,
    CheckCircleIcon,
    CalendarDaysIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    BuildingOffice2Icon,
    BriefcaseIcon,
    ArrowPathIcon,
    ChevronRightIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const formatDateLabel = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const formatViolationCounts = (item) => {
    const alphaConsecutive = Number(item?.alpha_consecutive_days || 0)
    const alphaAccumulated = Number(item?.alpha_accumulated_days || 0)
    const lateConsecutive = Number(item?.late_consecutive_days || 0)
    const lateAccumulated = Number(item?.late_accumulated_days || 0)

    const parts = []
    if (alphaConsecutive > 0 || alphaAccumulated > 0) {
        parts.push(`Alpha ${alphaConsecutive} berturut / ${alphaAccumulated} akumulasi`)
    }
    if (lateConsecutive > 0 || lateAccumulated > 0) {
        parts.push(`Telat ${lateConsecutive} berturut / ${lateAccumulated} akumulasi`)
    }

    return parts.join(' | ') || '-'
}

const formatSanctionLabel = (value) => {
    const raw = String(value || '').trim()
    if (!raw) return '-'
    const spMatch = raw.match(/^sp\s*[-_]?\s*(\d+)$/i)
    if (spMatch) return `SP${spMatch[1]}`
    return raw.replace(/[-_]+/g, ' ')
}

const EmptyState = ({ message }) => (
    <div className="flex min-h-[130px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-8 text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-300 shadow-sm">
            <DocumentTextIcon className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
    </div>
)

const DashboardSection = ({ title, subtitle, icon: Icon, actionTo, children, className = '' }) => (
    <div className={`rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)] ${className}`}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
                {Icon ? (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
                        <Icon className="h-5 w-5" />
                    </div>
                ) : null}
                <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{title}</h2>
                    {subtitle ? <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
                </div>
            </div>

            {actionTo ? (
                <Link
                    to={actionTo}
                    className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-orange-600 dark:text-orange-300 transition hover:bg-orange-50 dark:hover:bg-orange-900/30"
                >
                    Lihat Semua
                    <ChevronRightIcon className="h-4 w-4" />
                </Link>
            ) : null}
        </div>

        {children}
    </div>
)

const HeroIllustration = () => (
    <div className="pointer-events-none absolute right-10 top-2 hidden h-32 w-96 lg:block">
        <div className="absolute bottom-1 right-0 h-20 w-80 rounded-full bg-orange-100/70 blur-[1px]" />

        <div className="absolute right-44 top-1 h-28 w-24 rotate-[-3deg] rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-md">
            <div className="flex items-center gap-2 border-b border-orange-100 px-3 py-3">
                <div className="h-6 w-6 rounded-full bg-teal-100" />
                <div className="space-y-1.5">
                    <div className="h-1.5 w-10 rounded-full bg-orange-400" />
                    <div className="h-1.5 w-7 rounded-full bg-slate-300" />
                </div>
            </div>
            <div className="space-y-2 px-3 py-3">
                <div className="h-1.5 w-14 rounded-full bg-orange-400" />
                <div className="h-1.5 w-12 rounded-full bg-orange-300" />
                <div className="h-1.5 w-14 rounded-full bg-orange-200" />
                <div className="h-1.5 w-9 rounded-full bg-slate-200" />
            </div>
        </div>

        <div className="absolute right-28 top-9 h-16 w-16 rounded-2xl bg-emerald-200 shadow-sm dark:bg-emerald-900/20" />
        <div className="absolute right-14 top-7 h-20 w-16 rounded-full bg-orange-300 dark:bg-orange-900/30" />
        <div className="absolute right-20 top-4 h-7 w-7 rounded-full bg-slate-700 dark:bg-slate-400/20" />
        <div className="absolute right-12 top-24 h-2 w-24 rounded-full bg-slate-300 dark:bg-slate-700/40" />
        <div className="absolute right-18 top-25 h-10 w-2 rounded-full bg-slate-400 dark:bg-slate-700/40" />
        <div className="absolute right-32 top-25 h-10 w-2 rounded-full bg-slate-400 dark:bg-slate-700/40" />
    </div>
)

function HRDashboard() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const displayName =
        savedUser?.full_name || savedUser?.employee_name || savedUser?.name || savedUser?.username || savedUser?.email || 'Pengguna'
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [dashboard, setDashboard] = useState(null)
    const [activeViolations, setActiveViolations] = useState([])

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true)
            setError('')
            const [dashboardResult, violationResult] = await Promise.allSettled([
                hrApi.getDashboard(),
                hrApi.getActiveWarningLetters(),
            ])
            setDashboard(dashboardResult.status === 'fulfilled' ? dashboardResult.value : null)
            setActiveViolations(
                violationResult.status === 'fulfilled' ? violationResult.value?.data || [] : []
            )
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        dispatch(setPageTitle({ title: 'Dashboard HR' }))
        loadDashboard()
    }, [dispatch, loadDashboard])

    if (loading) {
        return (
            <div className="mt-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.07)]">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-200">Memuat dashboard HR...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mt-4 rounded-[1.5rem] border border-red-200 dark:border-red-700 bg-white dark:bg-slate-800 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)]">
                <div className="rounded-2xl border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-5">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                            <ExclamationTriangleIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-extrabold text-red-700 dark:text-red-200">Dashboard HR gagal dimuat</h2>
                            <p className="mt-1 text-sm font-medium text-red-600/90 dark:text-red-300">{error}</p>
                            <button
                                className="btn mt-4 rounded-xl border-none bg-orange-500 text-white hover:bg-orange-600"
                                onClick={loadDashboard}
                            >
                                <ArrowPathIcon className="h-4 w-4" />
                                Muat Ulang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const employeeOverview = dashboard?.employee_overview || {}
    const attendanceToday = dashboard?.attendance_today || {}
    const leaveManagement = dashboard?.leave_management || {}
    const reimbursementValidation = dashboard?.reimbursement_validation || {}
    const salaryAppeals = dashboard?.salary_appeals || {}
    const attendanceSummary = dashboard?.attendance_summary || {}
    const organization = dashboard?.organization || {}
    const todayDate = new Date().toISOString().split('T')[0]
    const leaveYearlyTotal = Number(leaveManagement.stats?.yearly_total || 0)
    const leaveMonthlyHistory = Number(leaveManagement.stats?.monthly_total || leaveManagement.stats?.total || 0)
    const reimbursementMonthlyHistory = Number(reimbursementValidation.stats?.total || 0) || (
        Number(reimbursementValidation.stats?.pending || 0) +
        Number(reimbursementValidation.stats?.approved_need_validation || 0) +
        Number(reimbursementValidation.stats?.validated || 0) +
        Number(reimbursementValidation.stats?.rejected || 0)
    )

    const statCards = [
        {
            title: 'Total Pegawai',
            value: employeeOverview.total_employees || 0,
            icon: UserGroupIcon,
            iconBox: 'bg-orange-50 text-orange-600',
            valueColor: 'text-orange-600',
            detail: `Tetap: ${employeeOverview.permanent || 0} | Kontrak: ${employeeOverview.contract || 0} | Magang: ${employeeOverview.intern || 0}`,
            path: '/app/employees',
        },
        {
            title: 'Banding Gaji Pending',
            value: salaryAppeals.stats?.pending || 0,
            icon: CheckCircleIcon,
            iconBox: 'bg-emerald-50 text-emerald-600',
            valueColor: 'text-emerald-600',
            detail: `Disetujui: ${salaryAppeals.stats?.approved || 0} | Ditolak: ${salaryAppeals.stats?.rejected || 0}`,
            path: '/app/salary-appeals',
        },
        {
            title: 'Permohonan Cuti/Izin',
            value: leaveYearlyTotal,
            icon: DocumentTextIcon,
            iconBox: 'bg-amber-50 text-amber-600',
            valueColor: 'text-amber-600',
            detail: `Riwayat Bulan Ini: ${leaveMonthlyHistory}`,
            path: '/app/leave-requests',
        },
        {
            title: 'Reimbursement Butuh Validasi',
            value: Number(reimbursementValidation.stats?.pending_validation_count || 0),
            icon: WalletIcon,
            iconBox: 'bg-blue-50 text-blue-600',
            valueColor: 'text-blue-600',
            detail: `Riwayat Bulan Ini: ${reimbursementMonthlyHistory}`,
            path: '/app/reimbursements',
        },
    ]

    const attendanceCards = [
        { label: 'Hadir', value: attendanceToday.present || 0, status: 'hadir', box: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' },
        { label: 'Terlambat', value: attendanceToday.late || 0, status: 'late', box: 'bg-amber-50 border-amber-200 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300' },
        { label: 'Sakit', value: attendanceToday.sakit || 0, status: 'sakit', box: 'bg-blue-50 border-blue-200 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
        { label: 'Izin', value: attendanceToday.izin || 0, status: 'izin', box: 'bg-violet-50 border-violet-200 text-violet-700 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300' },
        { label: 'Alpha', value: attendanceToday.alpha || 0, status: 'alpha', box: 'bg-red-50 border-red-200 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300' },
    ]

    const summaryCards = [
        { label: 'Total Hadir', value: attendanceSummary.hadir || 0, box: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' },
        { label: 'Total Terlambat', value: attendanceSummary.total_late || 0, box: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300' },
        { label: 'Sakit', value: attendanceSummary.sakit || 0, box: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
        { label: 'Izin', value: attendanceSummary.izin || 0, box: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300' },
        { label: 'Alpha', value: attendanceSummary.alpha || 0, box: 'border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300' },
        { label: 'Rata-rata Terlambat', value: `${(parseFloat(attendanceSummary.avg_late_minutes) || 0).toFixed(0)} min`, box: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200' },
    ]

    return (
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] sm:p-7">
            <div className="space-y-6">
                <div className="relative min-h-[130px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-orange-900/20 px-1 py-2 sm:px-2">
                    <HeroIllustration />
                    <div className="relative z-10 max-w-3xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-300">
                            <ShieldCheckIcon className="h-4 w-4" />
                            Human Resource Dashboard
                        </div>
                        <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-100">
                            Halo, {displayName}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                            Pantau data pegawai, kehadiran, cuti/izin, reimbursement, banding gaji, dan pelanggaran aktif dalam satu halaman.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((item, idx) => {
                        const Icon = item.icon
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => navigate(item.path)}
                                className="group rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 text-left shadow-[0_16px_44px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_22px_55px_rgba(15,23,42,0.09)]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBox} dark:bg-slate-700 dark:text-slate-200`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <ChevronRightIcon className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-orange-500" />
                                </div>

                                <div className="mt-5">
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-300">{item.title}</p>
                                    <p className={`mt-1 text-3xl font-extrabold ${item.valueColor} dark:text-white`}>
                                        {item.value}
                                    </p>
                                    <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                                        {item.detail}
                                    </p>
                                </div>
                            </button>
                        )
                    })}
                </div>

                <DashboardSection
                    title="Status Kehadiran Hari Ini"
                    subtitle="Klik salah satu status untuk melihat detail absensi pegawai hari ini."
                    icon={CalendarDaysIcon}
                >
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                        {attendanceCards.map((item) => (
                            <button
                                key={item.status}
                                type="button"
                                onClick={() => navigate(`/app/attendance?status=${item.status}&date=${todayDate}`)}
                                className={`rounded-2xl border p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md ${item.box} dark:border-slate-700`}
                            >
                                <p className="text-sm font-extrabold dark:text-slate-200">{item.label}</p>
                                <p className="mt-2 text-3xl font-black dark:text-white">{item.value}</p>
                            </button>
                        ))}
                    </div>
                </DashboardSection>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <DashboardSection
                        title="Permohonan Cuti/Izin Pending"
                        subtitle="Daftar pengajuan cuti atau izin yang masih membutuhkan keputusan."
                        icon={DocumentTextIcon}
                        actionTo={leaveManagement.pending_items?.length > 5 ? '/app/leave-requests' : ''}
                    >
                        <div className="mb-4 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">Pending: {leaveManagement.stats?.pending || 0}</span>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">Disetujui: {leaveManagement.stats?.approved || 0}</span>
                            <span className="rounded-full bg-red-50 px-3 py-1 font-bold text-red-700 dark:bg-red-900/20 dark:text-red-300">Ditolak: {leaveManagement.stats?.rejected || 0}</span>
                        </div>

                        {leaveManagement.pending_items?.length > 0 ? (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="table table-sm w-full">
                                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        <tr>
                                            <th>Pegawai</th>
                                            <th>Tipe</th>
                                            <th>Tanggal</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaveManagement.pending_items.slice(0, 5).map((item, idx) => (
                                            <tr key={idx} className="hover:bg-orange-50/40">
                                                <td>
                                                    <div className="font-bold text-slate-800">{item.employee_name}</div>
                                                    <div className="text-xs font-medium text-slate-400">{item.employee_code}</div>
                                                </td>
                                                <td><span className="badge badge-sm rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{item.leave_type}</span></td>
                                                <td className="text-xs font-medium text-slate-500">
                                                    {new Date(item.start_date).toLocaleDateString('id-ID')} - {new Date(item.end_date).toLocaleDateString('id-ID')}
                                                </td>
                                                <td><span className="badge badge-warning badge-sm rounded-full">{item.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState message="Tidak ada permohonan cuti/izin pending" />
                        )}
                    </DashboardSection>

                    <DashboardSection
                        title="Reimbursement Perlu Validasi"
                        subtitle="Pengajuan reimbursement yang menunggu validasi dari HR."
                        icon={WalletIcon}
                        actionTo={reimbursementValidation.need_validation?.length > 5 ? '/app/reimbursements' : ''}
                    >
                        <div className="mb-4 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                Perlu Validasi: {Number(reimbursementValidation.stats?.pending_validation_count || 0)}
                            </span>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                Tervalidasi: {reimbursementValidation.stats?.validated || 0}
                            </span>
                        </div>

                        {reimbursementValidation.need_validation?.length > 0 ? (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="table table-sm w-full">
                                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        <tr>
                                            <th>Pegawai</th>
                                            <th>Jumlah</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reimbursementValidation.need_validation.slice(0, 5).map((item, idx) => (
                                            <tr key={idx} className="hover:bg-orange-50/40">
                                                <td>
                                                    <div className="font-bold text-slate-800">{item.employee_name}</div>
                                                    <div className="text-xs font-medium text-slate-400">{item.employee_code}</div>
                                                </td>
                                                <td className="font-bold text-slate-700">Rp {(item.amount || 0).toLocaleString('id-ID')}</td>
                                                <td><span className="badge badge-info badge-sm rounded-full dark:bg-slate-700 dark:text-slate-300">{item.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState message="Tidak ada reimbursement yang perlu divalidasi" />
                        )}
                    </DashboardSection>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <DashboardSection
                        title="Banding Gaji Pending Review"
                        subtitle="Banding gaji yang masih perlu ditinjau dan diproses."
                        icon={CheckCircleIcon}
                        actionTo={salaryAppeals.pending_reviews?.length > 5 ? '/app/salary-appeals' : ''}
                    >
                        <div className="mb-4 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">Pending: {salaryAppeals.stats?.pending || 0}</span>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">Disetujui: {salaryAppeals.stats?.approved || 0}</span>
                            <span className="rounded-full bg-red-50 px-3 py-1 font-bold text-red-700 dark:bg-red-900/20 dark:text-red-300">Ditolak: {salaryAppeals.stats?.rejected || 0}</span>
                        </div>

                        {salaryAppeals.pending_reviews?.length > 0 ? (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="table table-sm w-full">
                                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        <tr>
                                            <th>Pegawai</th>
                                            <th>Periode</th>
                                            <th>Gaji</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salaryAppeals.pending_reviews.slice(0, 5).map((item, idx) => (
                                            <tr key={idx} className="hover:bg-orange-50/40">
                                                <td>
                                                    <div className="font-bold text-slate-800">{item.employee_name}</div>
                                                    <div className="text-xs font-medium text-slate-400">{item.employee_code}</div>
                                                </td>
                                                <td className="text-sm font-medium text-slate-500">{item.period_month}/{item.period_year}</td>
                                                <td className="font-bold text-slate-700">Rp {(item.net_salary || 0).toLocaleString('id-ID')}</td>
                                                <td><span className="badge badge-warning badge-sm rounded-full dark:bg-slate-700 dark:text-slate-300">{item.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState message="Tidak ada banding gaji yang perlu direview" />
                        )}
                    </DashboardSection>

                    <DashboardSection
                        title="Ringkasan Absensi Bulan Ini"
                        subtitle="Rekap status kehadiran pegawai pada bulan berjalan."
                        icon={ClockIcon}
                    >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {summaryCards.map((item) => (
                                <div key={item.label} className={`rounded-2xl border p-4 ${item.box}`}>
                                    <p className="text-xs font-extrabold uppercase tracking-wide opacity-80">{item.label}</p>
                                    <p className="mt-2 text-2xl font-black">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </DashboardSection>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <DashboardSection
                        title="Distribusi Pegawai per Departemen"
                        subtitle="Jumlah pegawai berdasarkan departemen organisasi."
                        icon={BuildingOffice2Icon}
                        actionTo={organization.departments?.length > 5 ? '/app/employees' : ''}
                    >
                        {organization.departments?.length > 0 ? (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="table table-sm w-full">
                                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        <tr>
                                            <th>Departemen</th>
                                            <th>Kode</th>
                                            <th className="text-right">Jumlah Pegawai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {organization.departments.slice(0, 5).map((dept, idx) => (
                                            <tr key={idx} className="hover:bg-orange-50/40">
                                                <td className="font-bold text-slate-800">{dept.name}</td>
                                                <td><span className="badge badge-sm rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{dept.code}</span></td>
                                                <td className="text-right font-black text-orange-600">{dept.employee_count || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState message="Data departemen tidak tersedia" />
                        )}
                    </DashboardSection>

                    <DashboardSection
                        title="Distribusi Pegawai per Jabatan"
                        subtitle="Jumlah pegawai berdasarkan jabatan dan level."
                        icon={BriefcaseIcon}
                        actionTo={organization.positions?.length > 5 ? '/app/employees' : ''}
                    >
                        {organization.positions?.length > 0 ? (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="table table-sm w-full">
                                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        <tr>
                                            <th>Jabatan</th>
                                            <th>Level</th>
                                            <th className="text-right">Jumlah Pegawai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {organization.positions.slice(0, 5).map((pos, idx) => (
                                            <tr key={idx} className="hover:bg-orange-50/40">
                                                <td className="font-bold text-slate-800">{pos.name}</td>
                                                <td><span className="badge badge-sm rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">{pos.level}</span></td>
                                                <td className="text-right font-black text-orange-600">{pos.employee_count || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState message="Data jabatan tidak tersedia" />
                        )}
                    </DashboardSection>
                </div>

                <DashboardSection
                    title="Pegawai dengan Pelanggaran Aktif"
                    subtitle="Daftar pegawai yang masih memiliki surat peringatan atau pelanggaran aktif."
                    icon={ExclamationTriangleIcon}
                    actionTo={activeViolations.length > 10 ? '/app/active-violations' : ''}
                >
                    {activeViolations.length > 0 ? (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="table table-sm w-full">
                                <thead className="bg-slate-50 text-slate-600">
                                    <tr>
                                        <th>Pegawai</th>
                                        <th>Departemen</th>
                                        <th>SP Aktif</th>
                                        <th>Keterangan Pelanggaran</th>
                                        <th>Berlaku Sampai</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeViolations.slice(0, 10).map((item) => (
                                        <tr key={item.id} className="hover:bg-orange-50/40">
                                            <td>
                                                <button
                                                    type="button"
                                                    className="font-bold text-slate-800 hover:text-orange-600 hover:underline"
                                                    onClick={() => navigate('/app/employees', { state: { employeeId: item.employee_id } })}
                                                >
                                                    {item.employee_name || '-'}
                                                </button>
                                                <div className="text-xs font-medium text-slate-400">{item.employee_code || '-'}</div>
                                            </td>
                                            <td className="font-medium text-slate-600">{item.department_name || '-'}</td>
                                            <td><span className="badge badge-warning badge-sm rounded-full">{formatSanctionLabel(item.sp_level)}</span></td>
                                            <td className="max-w-md text-xs font-medium leading-5 text-slate-500">{formatViolationCounts(item)}</td>
                                            <td className="font-medium text-slate-600">
                                                {formatDateLabel(item.valid_until)}
                                                {item.remaining_days !== null ? (
                                                    <div className="text-xs text-slate-400">{item.remaining_days} hari lagi</div>
                                                ) : null}
                                            </td>
                                            <td><span className="badge badge-success badge-sm rounded-full">active</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState message="Tidak ada pelanggaran aktif saat ini" />
                    )}
                </DashboardSection>
            </div>
        </div>
    )
}

export default HRDashboard
