import React, { useEffect, useState } from 'react'
import { hrApi } from '../../../features/hr/api'
import Pagination from '../../../components/Pagination/Pagination'

function fmtDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const WarningLetterDetailModalBody = ({ extraObject = {}, closeModal = () => {} }) => {
  const it = extraObject || {}
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const isViolationAttendance = (item) => {
    if (!item) return false
    const isLate = Number(item.late_minutes || 0) > 0 || item.is_late
    const status = String(item.status || '').toLowerCase()
    return isLate || status === 'alpha' || status === 'terlambat' || status === 'late'
  }

  let evidence = it.evidence_snapshot || it.evidence || null
  if (typeof evidence === 'string') {
    try {
      evidence = JSON.parse(evidence)
    } catch (e) {
      // keep original string
    }
  }

  useEffect(() => {
    const fetchAttendance = async () => {
      // parse evidence locally to avoid object identity deps
      let localEvidence = it.evidence_snapshot || it.evidence || null
      if (typeof localEvidence === 'string') {
        try {
          localEvidence = JSON.parse(localEvidence)
        } catch (e) {
          // keep as string
        }
      }

      // If evidence contains detailed attendance entries, use them
      if (localEvidence && Array.isArray(localEvidence.attendance) && localEvidence.attendance.length) {
        setAttendance(localEvidence.attendance)
        return
      }

      // Otherwise, try to fetch attendance records for the employee around the violation date
      if (!it.employee_id) return
      setLoading(true)
      try {
        // Fetch the full attendance history like the employee page does,
        // then filter locally to only violation rows.
        const res = await hrApi.getAttendanceRecords({ employee_id: it.employee_id })
        const data = (res && res.data) || []
        setAttendance(data)
      } catch (e) {
        setAttendance([])
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [it.employee_id, it.evidence_snapshot, it.evidence, it.violation_date])

  // Reset to first page when attendance changes
  useEffect(() => {
    setPage(1)
  }, [attendance])

  const formatStatus = (item) => {
    if (!item) return '-'
    const isLate = Number(item.late_minutes || 0) > 0 || item.is_late
    if (isLate) return 'terlambat'
    const s = String(item.status || '').toLowerCase()
    if (s === 'alpha') return 'alpha'
    if (!s) return '-'
    return String(s).charAt(0).toUpperCase() + String(s).slice(1)
  }

  const formatLate = (minutes) => {
    const m = Number(minutes || 0)
    if (!m || m <= 0) return '-'
    const h = Math.floor(m / 60)
    const rem = m % 60
    if (h > 0) return `${h} jam ${rem} menit`
    return `${rem} menit`
  }

  const filteredAttendance = (attendance || []).filter(isViolationAttendance)
  const totalPages = Math.max(1, Math.ceil(filteredAttendance.length / itemsPerPage))
  const paginated = filteredAttendance.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
  <div className="px-1 pb-2">
    <div className="rounded-2xl overflow-hidden border border-error/20 bg-base-100">
      {/* HEADER */}
      <div className="bg-error/10 border-b border-error/20 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-error/15 text-error flex items-center justify-center text-xl">
            ⚠️
          </div>

          <div>
            <h3 className="text-lg font-bold text-error">
              Detail Surat Peringatan
            </h3>
            <p className="text-sm opacity-70 mt-1">
              Informasi pelanggaran kehadiran pegawai dan bukti pendukung.
            </p>
          </div>
        </div>
      </div>

      {/* INFO PEGAWAI */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["Nama Pegawai", it.employee_name || "-"],
            ["Departemen", it.department_name || "-"],
            ["Posisi", it.position_name || "-"],
            ["Level Pelanggaran", it.sp_level || it.sp || "-"],
            ["Tanggal Terbit", fmtDate(it.issued_date || it.created_at)],
            ["Berlaku Sampai", fmtDate(it.valid_until)],
            ["Status Pelanggaran", it.status || it.letter_status || "-"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-base-300 bg-base-200/40 p-4"
            >
              <div className="text-xs font-semibold uppercase tracking-wide opacity-60">
                {label}
              </div>
              <div className="mt-1 font-semibold text-base">
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* BUKTI */}
        <div className="mt-5 rounded-xl border border-base-300 bg-base-200/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-base-300 flex items-center justify-between">
            <div>
              <h4 className="font-bold">Bukti Pelanggaran</h4>
              <p className="text-xs opacity-60">
                Data absensi yang menjadi dasar surat peringatan.
              </p>
            </div>

            {filteredAttendance?.length > 0 && (
              <div className="badge badge-error badge-outline">
                {filteredAttendance.length} data
              </div>
            )}
          </div>

          <div className="p-4">
            {loading ? (
              <div className="py-10 text-center">
                <span className="loading loading-spinner loading-md text-error"></span>
                <p className="text-sm opacity-70 mt-3">Memuat bukti...</p>
              </div>
            ) : filteredAttendance.length ? (
              <div className="overflow-x-auto rounded-lg border border-base-300">
                <table className="table table-zebra table-sm">
                  <thead className="bg-base-200">
                    <tr>
                      <th className="w-16">No</th>
                      <th>Tanggal</th>
                      <th>Status</th>
                      <th>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item, idx) => {
                      const globalIndex = (page - 1) * itemsPerPage + idx + 1
                      const isLate =
                        Number(item.late_minutes || 0) > 0 || item.is_late
                      const rawStatus = String(item.status || "").toLowerCase()
                      const statusLabel = isLate ? "terlambat" : rawStatus || "-"

                      let keterangan = "-"
                      if (statusLabel === "alpha") keterangan = "Tidak hadir"
                      else if (statusLabel === "terlambat")
                        keterangan = formatLate(item.late_minutes)
                      else if (item.note) keterangan = item.note

                      return (
                        <tr key={item.id || `${globalIndex}`}>
                          <td className="font-medium opacity-70">
                            {globalIndex}
                          </td>
                          <td>{fmtDate(item.date)}</td>
                          <td>
                            <span
                              className={`badge badge-sm ${
                                statusLabel === "alpha"
                                  ? "badge-error"
                                  : statusLabel === "terlambat"
                                  ? "badge-warning"
                                  : "badge-success"
                              }`}
                            >
                              {formatStatus(item)}
                            </span>
                          </td>
                          <td>{keterangan}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                <div className="p-3 border-t border-base-300">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChangePage={(p) => setPage(p)}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              </div>
            ) : evidence ? (
              typeof evidence === "object" ? (
                <pre className="whitespace-pre-wrap text-xs bg-base-200 p-4 rounded-lg border border-base-300">
                  {JSON.stringify(evidence, null, 2)}
                </pre>
              ) : (
                <div className="italic opacity-60">{String(evidence)}</div>
              )
            ) : (
              <div className="text-center py-8 italic opacity-60">
                Tidak ada bukti pelanggaran.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="modal-action border-t border-base-300 bg-base-200/40 px-5 py-4 mt-0">
        <button className="btn btn-ghost" onClick={() => closeModal()}>
          Tutup
        </button>
      </div>
    </div>
  </div>
)}

export default WarningLetterDetailModalBody
