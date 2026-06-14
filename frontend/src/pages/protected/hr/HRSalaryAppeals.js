import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import { showNotification } from '../../../features/common/headerSlice'
import Pagination from '../../../components/Pagination/Pagination'
import { hrApi } from '../../../features/hr/api'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import useTablePagination from '../../../hooks/useTablePagination'
import { formatCurrencyInput, normalizeCurrencyInput } from '../../../components/Formatters/CurrencyFormatter'

const formatCurrency = (value) => `Rp ${(parseFloat(value) || 0).toLocaleString('id-ID')}`
const DEFAULT_WORKING_HOURS_PER_DAY = 8
const DEFAULT_LATE_DEDUCTION_HOURLY_PERCENTAGE = 0.02

const resolvePhotoUrl = (photoPath) => {
    if (!photoPath) return null
    if (/^https?:\/\//i.test(photoPath)) return photoPath
    const baseUrl = (process.env.REACT_APP_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')
    return `${baseUrl}/${String(photoPath).replace(/^\/+/, '')}`
}

const getAppealItems = (appeal) => {
    if (Array.isArray(appeal?.appeal_reason_items) && appeal.appeal_reason_items.length > 0) {
        return appeal.appeal_reason_items
    }

    if (appeal?.appeal_reason_item || appeal?.reason) {
        return [
            {
                appeal_reason_item: appeal.appeal_reason_item || '',
                appeal_reason_label: appeal.appeal_reason_label || '-',
                reason: appeal.reason || '',
            },
        ]
    }

    return []
}

const parseReviewNotes = (notesText) => {
    const text = String(notesText || '').trim()
    if (!text) return []

    const result = []
    const pattern = /\[([^\]]+)\]\s*(disetujui|ditolak),\s*(nominal perbaikan|alasan):\s*([^\[]+)/gi
    let match

    while ((match = pattern.exec(text)) !== null) {
        const component = String(match[1] || '').trim()
        const decision = String(match[2] || '').toLowerCase().trim()
        const detailType = String(match[3] || '').toLowerCase().trim()
        const detailValue = String(match[4] || '').trim().replace(/[,\s]+$/, '')

        result.push({ component, decision, detailType, detailValue })
    }

    return result
}

const AUTO_REIMBURSE_REASON_KEY = 'reimbursement_total'
const normalizeStatus = (value) => String(value || '').toLowerCase().trim()
const isApprovedAppeal = (item = {}) => normalizeStatus(item.status) === 'approved'
const isRejectedAppeal = (item = {}) => {
    const status = normalizeStatus(item.status)
    return status === 'rejected' || status === 'ditolak'
}

const normalizeComponentText = (value) =>
    String(value || '')
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

const appealComponentGroups = [
    {
        group: 'Pendapatan',
        keywords: [
            'basic salary',
            'salary',
            'gaji pokok',
            'transport allowance',
            'transport',
            'meal allowance',
            'makan',
            'health allowance',
            'kesehatan',
            'bonus',
            'other allowance',
            'position allowance',
            'tunjangan',
            'allowance',
            'gross salary',
            'gaji kotor',
            'reimbursement',
        ],
    },
    {
        group: 'Potongan',
        keywords: [
            'late deduction',
            'late',
            'keterlambatan',
            'alpha deduction',
            'alpha',
            'unpaid leave deduction',
            'unpaid leave',
            'cuti tidak dibayar',
            'bpjs deduction',
            'bpjs',
            'tax deduction',
            'tax',
            'pajak',
            'other deduction',
            'potongan lain',
            'deduction',
            'potongan',
        ],
    },
]

const getAppealComponentGroup = (item = {}) => {
    const text = normalizeComponentText(
        [
            item.appeal_reason_item,
            item.appeal_reason_label,
            item.component,
        ].filter(Boolean).join(' '),
    )

    if (!text) return 'Penyesuaian'

    const matched = appealComponentGroups.find((definition) =>
        definition.keywords.some((keyword) => text.includes(normalizeComponentText(keyword))),
    )

    return matched?.group || 'Penyesuaian'
}

const getAdjustmentHelpText = (group) => {
    if (group === 'Pendapatan') {
        return 'Nominal perbaikan akan ditambahkan ke komponen pendapatan.'
    }

    if (group === 'Potongan') {
        return 'Nominal perbaikan akan mengurangi komponen potongan.'
    }

    return 'Nominal perbaikan dipakai sebagai penyesuaian saat revisi payroll.'
}

const getAdjustmentExampleText = (group) => {
    if (group === 'Pendapatan') {
        return 'Contoh: pendapatan Rp3.000, input Rp2.000, hasil revisi Rp5.000.'
    }

    if (group === 'Potongan') {
        return 'Contoh: potongan Rp3.000, input Rp2.000, sisa potongan Rp1.000.'
    }

    return 'Isi nominal koreksi yang disetujui HR untuk komponen ini.'
}

const getComponentGroupBadgeClass = (group) => {
    if (group === 'Pendapatan') return 'badge-success'
    if (group === 'Potongan') return 'badge-error'
    return 'badge-info'
}

const getAppealComponentKey = (item = {}) => normalizeComponentText(item.appeal_reason_item || item.component || item.appeal_reason_label)

const getCurrentComponentAmount = (componentKey, payroll = {}) => {
    const amountMap = {
        transport_allowance: payroll.transport_allowance,
        meal_allowance: payroll.meal_allowance,
        late_deduction: payroll.late_deduction,
        absent_deduction: payroll.absent_deduction,
        alpha_deduction: payroll.absent_deduction,
        unpaid_leave_deduction: payroll.unpaid_leave_deduction || payroll.absent_deduction,
    }

    return Number(amountMap[componentKey] || 0)
}

const getRevisionUnitCalculator = (item = {}, payroll = {}) => {
    const componentKey = getAppealComponentKey(item).replace(/\s+/g, '_')
    const presentDays = Number(payroll.present_days || 0)
    const basicSalary = Number(payroll.basic_salary || 0)
    const dailySalary = basicSalary / 30
    const lateHourlyRate = (dailySalary / DEFAULT_WORKING_HOURS_PER_DAY) * DEFAULT_LATE_DEDUCTION_HOURLY_PERCENTAGE
    const currentAmount = getCurrentComponentAmount(componentKey, payroll)

    if (componentKey === 'transport_allowance') {
        return {
            unit: 'hari',
            quantityLabel: 'Jumlah hari transport yang dikoreksi',
            rate: presentDays > 0 ? Number(payroll.transport_allowance || 0) / presentDays : 0,
            currentAmount,
            description: 'Tarif dihitung dari total tunjangan transport dibagi jumlah hari hadir pada slip.',
        }
    }

    if (componentKey === 'meal_allowance') {
        return {
            unit: 'hari',
            quantityLabel: 'Jumlah hari makan yang dikoreksi',
            rate: presentDays > 0 ? Number(payroll.meal_allowance || 0) / presentDays : 0,
            currentAmount,
            description: 'Tarif dihitung dari total tunjangan makan dibagi jumlah hari hadir pada slip.',
        }
    }

    if (
        componentKey === 'absent_deduction' ||
        componentKey === 'alpha_deduction' ||
        componentKey === 'unpaid_leave_deduction'
    ) {
        return {
            unit: 'hari',
            quantityLabel: componentKey === 'unpaid_leave_deduction'
                ? 'Jumlah hari cuti tidak dibayar yang dikoreksi'
                : 'Jumlah hari alpha yang dikoreksi',
            rate: dailySalary,
            currentAmount,
            description: 'Tarif dihitung dari gaji pokok dibagi 30 hari.',
        }
    }

    if (componentKey === 'late_deduction') {
        return {
            unit: 'jam',
            quantityLabel: 'Jumlah jam keterlambatan yang dikoreksi',
            rate: lateHourlyRate,
            currentAmount,
            description: 'Tarif estimasi dihitung dari gaji harian dibagi 8 jam dikali persentase potongan telat.',
        }
    }

    return null
}

const calculateAdjustmentFromUnit = (calculator, quantity) => {
    const parsedQuantity = Number(quantity || 0)
    const parsedRate = Number(calculator?.rate || 0)
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0 || !Number.isFinite(parsedRate)) {
        return 0
    }

    return Math.round(parsedQuantity * parsedRate)
}

const buildEmployeeSearchOptions = (items) => {
    const map = new Map()

    for (const item of items || []) {
        const employeeName = String(item?.employee_name || item?.full_name || item?.name || '').trim()
        const employeeCode = String(item?.employee_code || '').trim()
        if (!employeeName) continue

        const key = employeeCode || employeeName
        if (!map.has(key)) {
            map.set(key, {
                code: employeeCode,
                label: employeeCode ? `${employeeName} (${employeeCode})` : employeeName,
            })
        }
    }

    return Array.from(map.values())
        .sort((a, b) => {
            const codeA = String(a.code || '').trim()
            const codeB = String(b.code || '').trim()
            if (codeA && codeB) return codeA.localeCompare(codeB, 'id', { numeric: true, sensitivity: 'base' })
            if (codeA && !codeB) return -1
            if (!codeA && codeB) return 1
            return a.label.localeCompare(b.label, 'id', { sensitivity: 'base' })
        })
        .map((entry) => entry.label)
}

const statusLabelMap = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    ditolak: 'Ditolak',
}

function HRSalaryAppeals() {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [salaryAppeals, setSalaryAppeals] = useState([])
    const [salaryAppealHistory, setSalaryAppealHistory] = useState([])
    const [employeeSearchOptions, setEmployeeSearchOptions] = useState([])
    const [reviewSearchInput, setReviewSearchInput] = useState('')
    const [historySearchInput, setHistorySearchInput] = useState('')
    const [selectedItem, setSelectedItem] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [reviewItems, setReviewItems] = useState([])
    const [actionType, setActionType] = useState('')
    const [processing, setProcessing] = useState(false)
    const [isReviewCardOpen, setIsReviewCardOpen] = useState(false)
    const [isHistoryCardOpen, setIsHistoryCardOpen] = useState(false)
    const [selectedPayrollPdf, setSelectedPayrollPdf] = useState(null)
    const historyCardRef = useRef(null)

    const [filters, setFilters] = useState({
        status: 'pending',
        search: '',
        month: '',
        year: new Date().getFullYear()
    })
    const [historyFilters, setHistoryFilters] = useState({
        status: '',
        search: '',
        month: '',
        year: ''
    })

    const loadSalaryAppeals = useCallback(async () => {
        try {
            setLoading(true)
            const reviewQuery = {
                ...filters,
                month: filters.month || undefined,
                year: filters.year || undefined,
            }

            const [result, approvedHistoryResult, rejectedHistoryResult] = await Promise.all([
                hrApi.getSalaryAppeals(reviewQuery),
                hrApi.getSalaryAppeals({ status: 'approved' }),
                hrApi.getSalaryAppeals({ status: 'rejected' }),
            ])

            setSalaryAppeals(result.data || [])
            const historyRows = [
                ...(approvedHistoryResult.data || []),
                ...(rejectedHistoryResult.data || []),
            ]
            setSalaryAppealHistory(
                historyRows
                    .filter((item) => isApprovedAppeal(item) || isRejectedAppeal(item))
                    .slice()
                    .sort((a, b) => {
                        const reviewedA = new Date(a?.reviewed_at || a?.updated_at || a?.created_at || 0).getTime()
                        const reviewedB = new Date(b?.reviewed_at || b?.updated_at || b?.created_at || 0).getTime()
                        if (reviewedA !== reviewedB) return reviewedB - reviewedA
                        return Number(b?.id || 0) - Number(a?.id || 0)
                    })
            )
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        } finally {
            setLoading(false)
        }
    }, [filters, dispatch])

    const filteredHistoryAppeals = useMemo(() => {
        const selectedMonth = Number(historyFilters.month || 0)
        const selectedYear = Number(historyFilters.year || 0)
        const selectedStatus = String(historyFilters.status || '').toLowerCase()
        const searchQuery = String(historyFilters.search || '').trim().toLowerCase()
        return salaryAppealHistory.filter((item) => {
            const periodMonth = Number(item?.period_month || 0)
            const periodYear = Number(item?.period_year || 0)
            const searchableText = [
                item.employee_name,
                item.full_name,
                item.employee_code,
                item.department_name,
                item.position_name,
            ].filter(Boolean).join(' ').toLowerCase()
            const monthMatch = !selectedMonth || periodMonth === selectedMonth
            const yearMatch = !selectedYear || periodYear === selectedYear
            const statusMatch =
                !selectedStatus ||
                normalizeStatus(item.status) === selectedStatus ||
                (selectedStatus === 'rejected' && isRejectedAppeal(item))
            const searchMatch = !searchQuery || searchableText.includes(searchQuery)
            return monthMatch && yearMatch && statusMatch && searchMatch
        })
    }, [salaryAppealHistory, historyFilters.month, historyFilters.year, historyFilters.status, historyFilters.search])

    const reviewPagination = useTablePagination(salaryAppeals)
    const historyPagination = useTablePagination(filteredHistoryAppeals)

    const summaryCounts = useMemo(() => {
        return {
            pending: salaryAppeals.filter((item) => normalizeStatus(item.status) === 'pending').length,
            approved: salaryAppealHistory.filter(isApprovedAppeal).length,
            rejected: salaryAppealHistory.filter(isRejectedAppeal).length,
        }
    }, [salaryAppeals, salaryAppealHistory])

    const loadEmployeeOptions = useCallback(async () => {
        try {
            const result = await hrApi.getEmployees({
                search: '',
                department: '',
                position: '',
                employment_status: '',
                status: '',
            })
            setEmployeeSearchOptions(buildEmployeeSearchOptions(result.data || []))
        } catch (err) {
            setEmployeeSearchOptions([])
        }
    }, [])

    useEffect(() => {
        dispatch(setPageTitle({ title: 'Review Banding Gaji' }))
        loadSalaryAppeals()
    }, [dispatch, loadSalaryAppeals])

    useEffect(() => {
        loadEmployeeOptions()
    }, [loadEmployeeOptions])

    const scrollToHistoryCard = useCallback(() => {
        window.requestAnimationFrame(() => {
            historyCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
    }, [])

    const buildReviewItems = (item, type = 'approve') => {
        return getAppealItems(item).map((appealItem) => ({
            appeal_reason_item: appealItem.appeal_reason_item,
            appeal_reason_label: appealItem.appeal_reason_label,
            reason: appealItem.reason,
            decision: type === 'reject' ? 'reject' : 'approve',
            adjustment_amount: '',
            adjustment_quantity: '',
            rejection_note: '',
        }))
    }

    const openDetailModal = (item) => {
        setSelectedItem(item)
        if (item.status === 'pending') {
            setActionType('approve')
            setReviewItems(buildReviewItems(item))
        } else {
            setActionType('view')
            setReviewItems([])
        }
        setShowModal(true)
    }

    const confirmAction = async () => {
        if (!selectedItem) return

        if (actionType !== 'view') {
            if (!reviewItems.length) {
                dispatch(showNotification({ message: 'Detail alasan banding tidak ditemukan', status: 0 }))
                return
            }

            for (const reviewItem of reviewItems) {
                if (reviewItem.decision === 'approve') {
                    const isAutoReimburseComponent = reviewItem.appeal_reason_item === AUTO_REIMBURSE_REASON_KEY
                    if (isAutoReimburseComponent) continue

                    const parsedAmount = Number(reviewItem.adjustment_amount)
                    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
                        dispatch(showNotification({ message: `Nominal perbaikan wajib diisi untuk komponen ${reviewItem.appeal_reason_label || reviewItem.appeal_reason_item}`, status: 0 }))
                        return
                    }
                }

                if (reviewItem.decision === 'reject' && !String(reviewItem.rejection_note || '').trim()) {
                    dispatch(showNotification({ message: `Catatan penolakan wajib diisi untuk komponen ${reviewItem.appeal_reason_label || reviewItem.appeal_reason_item}`, status: 0 }))
                    return
                }
            }
        }

        try {
            setProcessing(true)
            await hrApi.reviewSalaryAppeal(selectedItem.id, actionType, {
                review_items: reviewItems.map((item) => ({
                    appeal_reason_item: item.appeal_reason_item,
                    decision: item.decision,
                    adjustment_amount: item.decision === 'approve' ? Number(item.adjustment_amount) : undefined,
                    rejection_note: item.decision === 'reject' ? item.rejection_note : undefined,
                })),
            })
            dispatch(showNotification({ message: 'Review banding gaji berhasil dikirim', status: 1 }))
            setShowModal(false)
            await loadSalaryAppeals()
            scrollToHistoryCard()
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        } finally {
            setProcessing(false)
        }
    }

    const getStatusBadgeClass = (status) => {
        const normalized = normalizeStatus(status)
        if (normalized === 'pending') return 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
        if (normalized === 'approved') return 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
        if (normalized === 'rejected' || normalized === 'ditolak') return 'border-red-200 bg-red-100 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
        return 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }

    const renderStatusBadge = (status) => (
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadgeClass(status)}`}>
            {statusLabelMap[normalizeStatus(status)] || status || '-'}
        </span>
    )

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))
    const handleHistoryFilterChange = (key, value) => setHistoryFilters((prev) => ({ ...prev, [key]: value }))

    const normalizeEmployeeSearchValue = (value) => {
        const parsed = String(value || '').trim()
        const match = parsed.match(/^(.*)\(([^)]+)\)\s*$/)
        return match ? String(match[2] || '').trim() : parsed
    }

    const handleReviewSearchChange = (value) => {
        setReviewSearchInput(value)
        handleFilterChange('search', normalizeEmployeeSearchValue(value))
    }

    const handleHistorySearchChange = (value) => {
        setHistorySearchInput(value)
        handleHistoryFilterChange('search', normalizeEmployeeSearchValue(value))
    }

    const updateReviewItem = (index, key, value) => {
        setReviewItems((prev) => prev.map((item, itemIndex) => (
            itemIndex === index ? { ...item, [key]: value } : item
        )))
    }

    const updateReviewCurrencyItem = (index, key, value) => {
        updateReviewItem(index, key, normalizeCurrencyInput(value))
    }

    const updateReviewQuantityItem = (index, value) => {
        const normalizedValue = String(value || '').replace(/[^0-9.,]/g, '').replace(',', '.')

        setReviewItems((prev) => prev.map((item, itemIndex) => {
            if (itemIndex !== index) return item

            const calculator = getRevisionUnitCalculator(item, selectedItem)
            const calculatedAmount = calculateAdjustmentFromUnit(calculator, normalizedValue)
            return {
                ...item,
                adjustment_quantity: normalizedValue,
                adjustment_amount: calculatedAmount ? String(calculatedAmount) : '',
            }
        }))
    }

    const openPayrollPdf = async (payrollId) => {
        try {
            const blob = await hrApi.getPayrollPdfBlob(payrollId)
            const url = window.URL.createObjectURL(blob)
            setSelectedPayrollPdf({ url, title: 'Slip Gaji' })
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        }
    }

    const closePayrollPdfModal = () => {
        if (selectedPayrollPdf?.url) {
            window.URL.revokeObjectURL(selectedPayrollPdf.url)
        }
        setSelectedPayrollPdf(null)
    }

    const resetReviewFilters = () => {
        setReviewSearchInput('')
        setFilters({ status: 'pending', search: '', month: '', year: new Date().getFullYear() })
    }

    const resetHistoryFilters = () => {
        setHistorySearchInput('')
        setHistoryFilters({ status: '', search: '', month: '', year: '' })
    }

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(2000, i).toLocaleString('id-ID', { month: 'long' }),
    }))

    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

    const renderFilterPanel = ({ type }) => {
        const isHistory = type === 'history'
        const currentFilters = isHistory ? historyFilters : filters
        const searchInput = isHistory ? historySearchInput : reviewSearchInput
        const onSearchChange = isHistory ? handleHistorySearchChange : handleReviewSearchChange
        const onFilterChange = isHistory ? handleHistoryFilterChange : handleFilterChange
        const onReset = isHistory ? resetHistoryFilters : resetReviewFilters

        return (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
                    <label className="input input-bordered flex w-full items-center gap-2 rounded-xl bg-white text-slate-900 lg:col-span-4 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                        <input
                            type="search"
                            list="hr-salary-appeal-employee-options"
                            placeholder="Cari nama/kode pegawai..."
                            className="grow bg-transparent text-sm outline-none placeholder:text-slate-400"
                            value={searchInput}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </label>

                    <select
                        className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        value={currentFilters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                    >
                        <option value="">Semua Status</option>
                        {!isHistory && <option value="pending">Menunggu</option>}
                        <option value="approved">Disetujui</option>
                        <option value="rejected">Ditolak</option>
                    </select>

                    <select
                        className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        value={currentFilters.month}
                        onChange={(e) => onFilterChange('month', e.target.value)}
                    >
                        <option value="">{isHistory ? 'Semua Bulan' : 'Seluruh Bulan'}</option>
                        {monthOptions.map((month) => (
                            <option key={`${type}-month-${month.value}`} value={month.value}>{month.label}</option>
                        ))}
                    </select>

                    <select
                        className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        value={currentFilters.year}
                        onChange={(e) => onFilterChange('year', e.target.value)}
                    >
                        {isHistory && <option value="">Semua Tahun</option>}
                        {yearOptions.map((year) => (
                            <option key={`${type}-year-${year}`} value={year}>{year}</option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className="btn rounded-xl border-none bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 lg:col-span-2"
                        onClick={onReset}
                    >
                        Reset Filter
                    </button>
                </div>
                <datalist id="hr-salary-appeal-employee-options">
                    {employeeSearchOptions.map((option) => (
                        <option key={`${type}-${option}`} value={option} />
                    ))}
                </datalist>
            </div>
        )
    }

    const renderTable = ({ rows, pagination, history = false }) => (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                        <tr>
                            <th>Pegawai</th>
                            <th>Periode Gaji</th>
                            <th>Total Gaji</th>
                            <th>Tanggal Pengajuan</th>
                            {history && <th>Tanggal Review</th>}
                            <th>Status</th>
                            <th className="text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {pagination.paginatedItems.map((item) => (
                            <tr key={history ? `history-${item.id}` : item.id} className="hover:bg-orange-50/40 dark:hover:bg-slate-800/70">
                                <td>
                                    <div className="font-extrabold text-slate-900 dark:text-slate-50">{item.employee_name || 'N/A'}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.employee_code || 'N/A'}</div>
                                </td>
                                <td className="font-semibold text-slate-700 dark:text-slate-200">
                                    {item.period_month}/{item.period_year}
                                </td>
                                <td className="font-extrabold text-orange-600 dark:text-orange-300">
                                    {formatCurrency(item.final_amount || item.net_salary)}
                                </td>
                                <td className="text-slate-600 dark:text-slate-300">
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                                </td>
                                {history && (
                                    <td className="text-slate-600 dark:text-slate-300">
                                        {item.reviewed_at ? new Date(item.reviewed_at).toLocaleDateString('id-ID') : '-'}
                                    </td>
                                )}
                                <td>{renderStatusBadge(item.status)}</td>
                                <td>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            className="rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600"
                                            onClick={() => openDetailModal(item)}
                                        >
                                            Detail
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onChangePage={pagination.setPage} itemsPerPage={pagination.itemsPerPage} />
            </div>
        </div>
    )

    return (
        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
            <div className="space-y-6">
                <div className="relative min-h-[125px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-5 py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6">
                    <div className="absolute right-10 top-3 hidden h-24 w-64 rounded-full bg-orange-100/70 blur-sm lg:block dark:bg-orange-900/30" />
                    <div className="relative z-10 max-w-3xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
                            Review Banding Gaji
                        </div>
                        <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
                            Kelola Banding Gaji Pegawai
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
                            Tinjau pengajuan banding gaji, cek alasan pegawai, lalu setujui atau tolak setiap komponen dengan rapi.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                        { label: 'Perlu Review', value: summaryCounts.pending, desc: 'Pengajuan yang masih menunggu keputusan', cls: 'border-amber-200 bg-amber-50 text-amber-700' },
                        { label: 'Disetujui', value: summaryCounts.approved, desc: 'Pengajuan yang sudah disetujui', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                        { label: 'Ditolak', value: summaryCounts.rejected, desc: 'Pengajuan yang tidak disetujui', cls: 'border-red-200 bg-red-50 text-red-700' },
                    ].map((item) => (
                        <div key={item.label} className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.cls} dark:border-slate-700 dark:bg-slate-900`}>
                            <p className="text-sm font-bold">{item.label}</p>
                            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-50">{Number(item.value || 0)}</p>
                            <p className="mt-1 text-xs font-medium opacity-80">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">Review Banding Gaji</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Daftar pengajuan yang perlu diperiksa HR.</p>
                        </div>
                        <button
                            type="button"
                            className="btn rounded-xl !border-orange-500 !bg-orange-500 !text-white hover:!border-orange-600 hover:!bg-orange-600"
                            onClick={() => setIsReviewCardOpen((prev) => !prev)}
                        >
                            {isReviewCardOpen ? 'Tutup' : 'Buka'}
                        </button>
                    </div>

                    {isReviewCardOpen && (
                        <>
                            {renderFilterPanel({ type: 'review' })}
                            {loading ? (
                                <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-500 dark:border-slate-700">
                                    Memuat data...
                                </div>
                            ) : salaryAppeals.length > 0 ? (
                                renderTable({ rows: salaryAppeals, pagination: reviewPagination })
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                    Tidak ada data banding gaji
                                </div>
                            )}
                        </>
                    )}
                </section>

                <section ref={historyCardRef} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">Riwayat Banding Gaji</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pengajuan yang sudah disetujui atau ditolak.</p>
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
                            {renderFilterPanel({ type: 'history' })}
                            {loading ? (
                                <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-500 dark:border-slate-700">
                                    Memuat data riwayat...
                                </div>
                            ) : filteredHistoryAppeals.length > 0 ? (
                                renderTable({ rows: filteredHistoryAppeals, pagination: historyPagination, history: true })
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                    Tidak ada riwayat banding gaji
                                </div>
                            )}
                        </>
                    )}
                </section>

                {showModal && selectedItem && (
                    <div className="modal modal-open">
                        <div className="modal-box max-h-[90vh] max-w-5xl overflow-y-auto rounded-3xl border border-slate-200 p-0 shadow-2xl dark:border-slate-700 dark:bg-slate-950">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xl font-extrabold">
                                        {actionType === 'view' ? 'Detail Banding Gaji' : 'Review Banding Gaji'}
                                    </h3>
                                    <p className="text-sm text-white/85">Periksa informasi pegawai, rincian gaji, dan alasan banding.</p>
                                </div>
                            </div>

                            <div className="space-y-5 p-6">
                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
                                    <h4 className="mb-4 font-extrabold text-slate-900 dark:text-slate-50">Informasi Pegawai</h4>
                                    <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                                        <img
                                            src={resolvePhotoUrl(selectedItem.employee_photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedItem.full_name || selectedItem.employee_name || 'Pegawai')}&background=random&color=fff`}
                                            alt={selectedItem.full_name || selectedItem.employee_name || 'pegawai'}
                                            className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
                                        />
                                        <div>
                                            <p className="text-lg font-extrabold text-slate-900 dark:text-slate-50">{selectedItem.full_name || selectedItem.employee_name || '-'}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{selectedItem.department_name || '-'} • {selectedItem.position_name || '-'}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Kode Pegawai: {selectedItem.employee_code || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                                    <h4 className="mb-4 font-extrabold text-slate-900 dark:text-slate-50">Informasi Gaji</h4>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {[
                                            ['Periode', `${selectedItem.period_month}/${selectedItem.period_year}`],
                                            ['Total Gaji', formatCurrency(selectedItem.final_amount || selectedItem.net_salary)],
                                            ['Gaji Pokok', formatCurrency(selectedItem.basic_salary)],
                                            ['Total Tunjangan', formatCurrency(selectedItem.total_allowances)],
                                            ['Total Potongan', formatCurrency(selectedItem.total_deductions)],
                                        ].map(([label, value]) => (
                                            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                                                <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                                                <p className="mt-1 font-extrabold text-slate-900 dark:text-slate-50">{value}</p>
                                            </div>
                                        ))}
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
                                            <p className="text-xs font-bold uppercase text-slate-400">Status</p>
                                            <div className="mt-1">{renderStatusBadge(selectedItem.status)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                                    <h4 className="mb-4 font-extrabold text-slate-900 dark:text-slate-50">Detail Banding</h4>
                                    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                                            <p className="text-xs font-bold uppercase text-slate-400">Tanggal Pengajuan</p>
                                            <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString('id-ID') : '-'}</p>
                                        </div>
                                        {selectedItem.reviewed_at && (
                                            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                                                <p className="text-xs font-bold uppercase text-slate-400">Tanggal Review</p>
                                                <p className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{new Date(selectedItem.reviewed_at).toLocaleString('id-ID')}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <div className="overflow-x-auto">
                                            <table className="table table-sm">
                                                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                                    <tr>
                                                        <th>Komponen Slip</th>
                                                        <th>Jenis</th>
                                                        <th>Alasan</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getAppealItems(selectedItem).length > 0 ? (
                                                        getAppealItems(selectedItem).map((appealItem, index) => {
                                                            const componentGroup = getAppealComponentGroup(appealItem)

                                                            return (
                                                                <tr key={`${appealItem.appeal_reason_item || 'item'}-${index}`}>
                                                                    <td className="font-semibold">{appealItem.appeal_reason_label || appealItem.appeal_reason_item || '-'}</td>
                                                                    <td>
                                                                        <span className={`badge badge-sm ${getComponentGroupBadgeClass(componentGroup)}`}>
                                                                            {componentGroup}
                                                                        </span>
                                                                    </td>
                                                                    <td>{appealItem.reason || '-'}</td>
                                                                </tr>
                                                            )
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={3} className="py-6 text-center text-slate-500">Tidak ada detail alasan</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {selectedItem.supporting_documents_url ? (
                                            <a href={selectedItem.supporting_documents_url} target="_blank" rel="noreferrer" className="btn rounded-xl border-none bg-blue-500 text-white hover:bg-blue-600">
                                                Lihat Bukti Pegawai
                                            </a>
                                        ) : (
                                            <button className="btn rounded-xl border border-slate-200 bg-slate-100 text-slate-400" type="button" disabled>
                                                Bukti Pegawai Tidak Ada
                                            </button>
                                        )}
                                        <button className="btn rounded-xl border-none bg-emerald-500 text-white hover:bg-emerald-600" type="button" onClick={() => openPayrollPdf(selectedItem.payroll_id)}>
                                            Lihat PDF Slip Gaji
                                        </button>
                                    </div>

                                    {selectedItem.review_notes && (
                                        <div className="mt-5">
                                            <p className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">Catatan HR</p>
                                            {parseReviewNotes(selectedItem.review_notes).length > 0 ? (
                                                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                                                    <div className="overflow-x-auto">
                                                        <table className="table table-sm">
                                                            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                                                <tr>
                                                                    <th>Komponen</th>
                                                                    <th>Jenis</th>
                                                                    <th>Keputusan</th>
                                                                    <th>Jenis Catatan</th>
                                                                    <th>Detail</th>
                                                                    <th>Efek Revisi</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {parseReviewNotes(selectedItem.review_notes).map((note, index) => {
                                                                    const componentGroup = getAppealComponentGroup(note)
                                                                    const isApproved = note.decision === 'disetujui'

                                                                    return (
                                                                        <tr key={`review-note-${index}`}>
                                                                            <td>{note.component || '-'}</td>
                                                                            <td>
                                                                                <span className={`badge badge-sm ${getComponentGroupBadgeClass(componentGroup)}`}>
                                                                                    {componentGroup}
                                                                                </span>
                                                                            </td>
                                                                            <td>{renderStatusBadge(isApproved ? 'approved' : 'rejected')}</td>
                                                                            <td className="capitalize">{note.detailType || '-'}</td>
                                                                            <td>{note.detailValue || '-'}</td>
                                                                            <td className="text-xs text-slate-500 dark:text-slate-400">
                                                                                {isApproved ? getAdjustmentHelpText(componentGroup) : '-'}
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">{selectedItem.review_notes}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {actionType !== 'view' && (
                                    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                                        <h4 className="mb-4 font-extrabold text-slate-900 dark:text-slate-50">Keputusan HR</h4>
                                        <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
                                            <p className="font-bold">Aturan nominal perbaikan</p>
                                            <p className="mt-1">
                                                Untuk komponen pendapatan, nominal perbaikan akan ditambahkan. Untuk komponen potongan, nominal perbaikan akan mengurangi potongan.
                                            </p>
                                            <p className="mt-1 text-xs opacity-80">
                                                Contoh potongan: Rp3.000 input Rp2.000 menjadi sisa potongan Rp1.000. Contoh pendapatan: Rp3.000 input Rp2.000 menjadi Rp5.000.
                                            </p>
                                            <p className="mt-1 text-xs opacity-80">
                                                Untuk transport, makan, alpha, cuti tidak dibayar, dan keterlambatan, isi jumlah hari/jam yang dikoreksi agar nominal perbaikan dihitung otomatis.
                                            </p>
                                        </div>
                                        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                                            <div className="overflow-x-auto">
                                                <table className="table table-sm min-w-[1000px]">
                                                    <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                                                        <tr>
                                                            <th>Komponen</th>
                                                            <th>Jenis</th>
                                                            <th>Alasan Pegawai</th>
                                                            <th>Keputusan HR</th>
                                                            <th>Nominal Perbaikan</th>
                                                            <th>Catatan Penolakan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reviewItems.map((item, index) => {
                                                            const componentGroup = getAppealComponentGroup(item)
                                                            const unitCalculator = getRevisionUnitCalculator(item, selectedItem)
                                                            const calculatedAmount = calculateAdjustmentFromUnit(unitCalculator, item.adjustment_quantity)

                                                            return (
                                                                <tr key={`${item.appeal_reason_item || 'review'}-${index}`}>
                                                                    <td className="font-semibold">{item.appeal_reason_label || item.appeal_reason_item || '-'}</td>
                                                                    <td>
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className={`badge badge-sm w-fit ${getComponentGroupBadgeClass(componentGroup)}`}>
                                                                                {componentGroup}
                                                                            </span>
                                                                            <span className="max-w-[220px] text-xs leading-snug text-slate-500 dark:text-slate-400">
                                                                                {getAdjustmentHelpText(componentGroup)}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td>{item.reason || '-'}</td>
                                                                    <td>
                                                                        <select className="select select-bordered select-sm rounded-xl" value={item.decision} onChange={(e) => updateReviewItem(index, 'decision', e.target.value)}>
                                                                            <option value="approve">Setujui</option>
                                                                            <option value="reject">Tolak</option>
                                                                        </select>
                                                                    </td>
                                                                    <td>
                                                                        {item.decision === 'approve' ? (
                                                                            item.appeal_reason_item === AUTO_REIMBURSE_REASON_KEY ? (
                                                                                <input className="input input-bordered input-sm w-full rounded-xl" value="Otomatis dari reimbursement disetujui" disabled />
                                                                            ) : (
                                                                                <div className="space-y-1">
                                                                                    {unitCalculator && (
                                                                                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-2 dark:border-blue-900/50 dark:bg-blue-950/30">
                                                                                            <label className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                                                                                                {unitCalculator.quantityLabel}
                                                                                            </label>
                                                                                            <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                                                                                                <input
                                                                                                    type="text"
                                                                                                    inputMode="decimal"
                                                                                                    className="input input-bordered input-sm w-full rounded-xl"
                                                                                                    placeholder={`0 ${unitCalculator.unit}`}
                                                                                                    value={item.adjustment_quantity || ''}
                                                                                                    onChange={(e) => updateReviewQuantityItem(index, e.target.value)}
                                                                                                />
                                                                                                <div className="rounded-xl bg-white px-3 py-2 text-xs text-blue-800 dark:bg-slate-900 dark:text-blue-200 sm:min-w-[190px]">
                                                                                                    <div>Tarif: {formatCurrency(unitCalculator.rate)} / {unitCalculator.unit}</div>
                                                                                                    <div>Hasil: {formatCurrency(calculatedAmount)}</div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <p className="mt-1 text-xs leading-snug text-blue-700 dark:text-blue-200">
                                                                                                {unitCalculator.description}
                                                                                            </p>
                                                                                            <p className="mt-1 text-xs leading-snug text-blue-700 dark:text-blue-200">
                                                                                                Nominal hasil kalkulator otomatis mengisi nominal perbaikan.
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                    <input type="text" inputMode="numeric" className="input input-bordered input-sm w-full rounded-xl" placeholder="Rp" value={formatCurrencyInput(item.adjustment_amount)} onChange={(e) => updateReviewCurrencyItem(index, 'adjustment_amount', e.target.value)} />
                                                                                    <p className="max-w-[260px] text-xs leading-snug text-slate-500 dark:text-slate-400">
                                                                                        {getAdjustmentExampleText(componentGroup)}
                                                                                    </p>
                                                                                </div>
                                                                            )
                                                                        ) : (
                                                                            <span className="text-slate-400">-</span>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {item.decision === 'reject' ? (
                                                                            <textarea className="textarea textarea-bordered textarea-sm w-full rounded-xl" placeholder="Alasan penolakan" value={item.rejection_note} onChange={(e) => updateReviewItem(index, 'rejection_note', e.target.value)} />
                                                                        ) : (
                                                                            <span className="text-slate-400">-</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row">
                                <button className="btn rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" onClick={() => setShowModal(false)} disabled={processing}>
                                    Tutup
                                </button>
                                {actionType !== 'view' && (
                                    <button className="btn rounded-xl border-none bg-orange-500 text-white hover:bg-orange-600" onClick={confirmAction} disabled={processing}>
                                        {processing ? 'Memproses...' : 'Kirim Review'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {selectedPayrollPdf && (
                    <div className="modal modal-open z-[60]">
                        <div className="modal-box max-w-4xl">
                            <button
                                type="button"
                                className="btn btn-sm btn-circle absolute right-2 top-2"
                                onClick={closePayrollPdfModal}
                            >
                                x
                            </button>
                            <h3 className="mb-4 text-xl font-semibold">
                                {selectedPayrollPdf.title || 'Slip Gaji'}
                            </h3>
                            <div className="flex min-h-[420px] w-full items-center justify-center overflow-hidden rounded-lg bg-base-200">
                                <iframe
                                    title="Slip Gaji PDF"
                                    src={selectedPayrollPdf.url}
                                    className="h-[70vh] w-full border-0"
                                />
                            </div>
                        </div>
                        <label className="modal-backdrop" onClick={closePayrollPdfModal}>
                            Close
                        </label>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HRSalaryAppeals
