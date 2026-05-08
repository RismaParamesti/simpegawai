import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle, showNotification } from '../../features/common/headerSlice'
import TitleCard from '../../components/Cards/TitleCard'
import { atasanApi } from '../../features/atasan/api'

const spLabelMap = {
    sp1: 'SP1',
    sp2: 'SP2',
    sp3: 'SP3',
    evaluasi_hr: 'Evaluasi HR',
}

const formatDate = (dateValue) => {
    if (!dateValue) return '-'
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
}

function AtasanWarningLetters() {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)
    const [letters, setLetters] = useState([])
    const [filters, setFilters] = useState({
        search: '',
        spLevel: '',
    })

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const result = await atasanApi.getTeamWarningLetters()
            setLetters(result?.data || [])
        } catch (err) {
            dispatch(showNotification({ message: err.message, status: 0 }))
        } finally {
            setLoading(false)
        }
    }, [dispatch])

    useEffect(() => {
        dispatch(setPageTitle({ title: 'Surat Peringatan Tim' }))
    }, [dispatch])

    useEffect(() => {
        loadData()
    }, [loadData])

    const filteredLetters = useMemo(() => {
        const query = filters.search.trim().toLowerCase()

        return letters.filter((item) => {
            const level = String(item.sp_level || '').toLowerCase()
            const matchesLevel = filters.spLevel ? level === filters.spLevel : true
            if (!matchesLevel) return false

            if (!query) return true
            const employeeName = String(item.employee_name || '').toLowerCase()
            const employeeCode = String(item.employee_code || '').toLowerCase()
            const letterNumber = String(item.letter_number || '').toLowerCase()

            return (
                employeeName.includes(query) ||
                employeeCode.includes(query) ||
                letterNumber.includes(query)
            )
        })
    }, [letters, filters.search, filters.spLevel])

    const openWarningLetterDocument = (letter) => {
        if (!letter) return

        if (letter.file_path) {
            const url = String(letter.file_path || '').startsWith('http')
                ? letter.file_path
                : `/${String(letter.file_path || '').replace(/^\/+/, '')}`
            window.open(url, '_blank', 'noopener,noreferrer')
            return
        }

        if (!letter.letter_content) return

        const win = window.open('', '_blank', 'width=900,height=700')
        if (!win) return

        const rawContent = String(letter.letter_content || '')
        const isHtml = /^\s*</.test(rawContent)

        win.document.write(`
            <html>
                <head>
                    <title>${letter.letter_number || 'Surat Peringatan'}</title>
                    <style>
                        @page { size: A4; margin: 16mm 18mm; }
                        * { box-sizing: border-box; }
                        body {
                            margin: 0;
                            font-family: 'Times New Roman', serif;
                            color: #111827;
                            line-height: 1.6;
                            background: #ffffff;
                        }
                        .sheet {
                            width: auto;
                            min-height: auto;
                            margin: 0 auto;
                            background: #ffffff;
                            padding: 0;
                            box-shadow: none;
                        }
                        .letter-content {
                            font-size: 12pt;
                            white-space: pre-wrap;
                            word-break: break-word;
                            overflow-wrap: anywhere;
                        }
                    </style>
                </head>
                <body>
                    <div class="sheet">
                        <div class="letter-content">${isHtml ? rawContent : rawContent.replace(/\n/g, '<br/>')}</div>
                    </div>
                </body>
            </html>
        `)
        win.document.close()
    }

    return (
        <TitleCard title="Surat Peringatan Tim (Dibuat HR)" topMargin="mt-0">
            <div className="grid md:grid-cols-3 grid-cols-1 gap-3 mb-4">
                <input
                    type="search"
                    className="input input-bordered"
                    placeholder="Cari nama, kode, atau nomor surat"
                    value={filters.search}
                    onChange={(event) =>
                        setFilters((prev) => ({ ...prev, search: event.target.value }))
                    }
                />
                <select
                    className="select select-bordered"
                    value={filters.spLevel}
                    onChange={(event) =>
                        setFilters((prev) => ({ ...prev, spLevel: event.target.value }))
                    }
                >
                    <option value="">Semua Level</option>
                    <option value="sp1">SP1</option>
                    <option value="sp2">SP2</option>
                    <option value="sp3">SP3</option>
                    <option value="evaluasi_hr">Evaluasi HR</option>
                </select>
                <button className="btn" onClick={loadData}>Refresh</button>
            </div>

            {loading ? (
                <div className="text-center py-10">Memuat surat peringatan tim...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table table-zebra">
                        <thead>
                            <tr>
                                <th>No Surat</th>
                                <th>Pegawai</th>
                                <th>Departemen</th>
                                <th>Level</th>
                                <th>Tgl Pelanggaran</th>
                                <th>Tgl Terbit</th>
                                <th>Dibuat Oleh</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLetters.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.letter_number || '-'}</td>
                                    <td>
                                        <div className="font-semibold">{item.employee_name || '-'}</div>
                                        <div className="text-xs opacity-70">{item.employee_code || '-'}</div>
                                    </td>
                                    <td>{item.department_name || '-'}</td>
                                    <td>
                                        <span className="badge badge-outline">
                                            {spLabelMap[String(item.sp_level || '').toLowerCase()] || '-'}
                                        </span>
                                    </td>
                                    <td>{formatDate(item.violation_date)}</td>
                                    <td>{formatDate(item.issued_date)}</td>
                                    <td>{item.issued_by_name || '-'}</td>
                                    <td>
                                        <button
                                            className="btn btn-xs btn-primary"
                                            onClick={() => openWarningLetterDocument(item)}
                                        >
                                            Lihat Surat
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredLetters.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center opacity-70">
                                        Belum ada surat peringatan tim yang diterbitkan HR
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </TitleCard>
    )
}

export default AtasanWarningLetters
