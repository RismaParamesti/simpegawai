import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import TitleCard from '../../components/Cards/TitleCard'
import { pegawaiApi } from '../../features/pegawai/api'

const alphaSanctionLabelMap = {
  none: 'Belum Ada SP',
  sp1: 'SP1',
  sp2: 'SP2',
  sp3: 'SP3',
  evaluasi_hr: 'Evaluasi HR',
  nonaktif: 'Evaluasi HR',
}

const alphaSanctionBadgeMap = {
  none: 'badge-ghost',
  sp1: 'badge-info',
  sp2: 'badge-warning',
  sp3: 'badge-error',
  evaluasi_hr: 'badge-secondary',
  nonaktif: 'badge-secondary',
}

function EmployeeWarningLetters() {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [letters, setLetters] = useState([])
  const [summary, setSummary] = useState({})
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const [summaryRes, historyRes, lettersRes] = await Promise.allSettled([
        pegawaiApi.getAttendanceSummary(),
        pegawaiApi.getAttendanceHistory({ limit: 200 }),
        pegawaiApi.getMyWarningLetters(),
      ])

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value?.data || {})
      else setSummary({})

      if (historyRes.status === 'fulfilled') setHistory(historyRes.value?.data || [])
      else setHistory([])

      if (lettersRes.status === 'fulfilled') setLetters(lettersRes.value?.data || [])
      else setLetters([])
    } catch (err) {
      setError(err.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    dispatch(setPageTitle({ title: 'Surat Peringatan Saya' }))
    loadData()
  }, [dispatch, loadData])

  const openWarningLetterPdf = (letter) => {
    if (letter?.file_path) {
      const url = String(letter.file_path || '').startsWith('http')
        ? letter.file_path
        : `/${String(letter.file_path || '').replace(/^\/+/, '')}`
      window.open(url, '_blank')
      return
    }

    if (!letter?.letter_content) return
    const popup = window.open('', '_blank', 'width=900,height=700')
    if (!popup) return

    const rawContent = String(letter.letter_content || '')
    const isHtml = /^\s*</.test(rawContent)

    popup.document.write(`
      <html>
        <head>
          <title>${letter.letter_number || 'Surat Peringatan'}</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 32px; white-space: pre-wrap; line-height: 1.6; }
          </style>
        </head>
        <body>${isHtml ? rawContent : String(rawContent).replace(/\n/g, '<br/>')}</body>
      </html>
    `)
    popup.document.close()
    popup.focus()
  }

  if (loading) return <div className="py-10 text-center">Memuat data surat peringatan...</div>

  const discipline = summary.alpha_discipline || {}
  const sanctionLevel = String(discipline.alpha_sanction_level || 'none').toLowerCase()
  const sanctionLabel = alphaSanctionLabelMap[sanctionLevel] || sanctionLevel
  const sanctionBadgeClass = alphaSanctionBadgeMap[sanctionLevel] || 'badge-ghost'
  const latestWarningLetter = letters?.[0] || null

  const alphaHistory = (history || []).filter((item) => String(item.status || '').toLowerCase() === 'alpha')

  return (
    <div className="space-y-6">
      {error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-xs" onClick={loadData}>
            Muat Ulang
          </button>
        </div>
      ) : null}

      <TitleCard title="Status SP Alpha" topMargin="mt-0">
        <div className="grid md:grid-cols-4 grid-cols-1 gap-4">
          <div className="p-4 rounded-lg bg-base-200">
            <p className="text-sm opacity-70">Sanksi Saat Ini</p>
            <p className="text-lg font-semibold mt-1">
              <span className={`badge ${sanctionBadgeClass}`}>{sanctionLabel}</span>
            </p>
          </div>
          <div className="p-4 rounded-lg bg-base-200">
            <p className="text-sm opacity-70">Alpha Berturut-turut</p>
            <p className="text-lg font-semibold">{Number(discipline.alpha_consecutive_days || 0)} hari</p>
          </div>
          <div className="p-4 rounded-lg bg-base-200">
            <p className="text-sm opacity-70">Alpha Akumulasi</p>
            <p className="text-lg font-semibold">{Number(discipline.alpha_accumulated_days || 0)} hari</p>
          </div>
          <div className="p-4 rounded-lg bg-base-200">
            <p className="text-sm opacity-70">Dokumen</p>
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-sm opacity-80">
                {latestWarningLetter
                  ? `SP terbaru: ${latestWarningLetter.letter_number || '-'} (${String(latestWarningLetter.sp_level || '').toUpperCase()})`
                  : 'Belum ada dokumen SP'}
              </p>
              <button
                className="btn btn-sm btn-outline w-fit"
                disabled={!latestWarningLetter}
                onClick={() => openWarningLetterPdf(latestWarningLetter)}
              >
                Lihat PDF
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-base-200 border border-base-300">
          <p className="text-sm opacity-70 mb-2">Aturan SP Alpha</p>
          <div className="overflow-x-auto">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Kondisi</th>
                  <th>Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Alpha berturut-turut 3 hari</td>
                  <td>SP1</td>
                </tr>
                <tr>
                  <td>Alpha berturut-turut 5 hari</td>
                  <td>SP2</td>
                </tr>
                <tr>
                  <td>Alpha berturut-turut 6 hari</td>
                  <td>SP3</td>
                </tr>
                <tr>
                  <td>Alpha berturut-turut 7 hari</td>
                  <td>Evaluasi HR</td>
                </tr>
                <tr>
                  <td>Alpha akumulasi 7+ hari</td>
                  <td>Evaluasi HR</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </TitleCard>

      <TitleCard title="Bukti Alpha" topMargin="mt-6">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {alphaHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center opacity-60">
                    Tidak ada bukti alpha pada periode yang diminta
                  </td>
                </tr>
              ) : (
                alphaHistory.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{item.date || '-'}</td>
                    <td>{item.note || (item.status === 'alpha' ? 'Tidak hadir (alpha)' : item.status)}</td>
                    <td>{item.check_in || '-'}</td>
                    <td>{item.check_out || '-'}</td>
                    <td>
                      <button
                        className=" px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg border border-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 "
                        onClick={() => window.alert('Detail absensi: ' + JSON.stringify(item))}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TitleCard>
    </div>
  )
}

export default EmployeeWarningLetters
