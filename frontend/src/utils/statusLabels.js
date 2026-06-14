export const statusLabelMap = {
  active: "Aktif",
  inactive: "Nonaktif",
  pending: "Menunggu",
  waiting: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
  accepted: "Diterima",
  cancelled: "Dibatalkan",
  canceled: "Dibatalkan",
  draft: "Draf",
  published: "Dipublikasikan",
  claimed: "Diklaim",
  transferred: "Sudah Ditransfer",
  included_in_payroll: "Masuk Payroll",
  ready_for_payroll: "Siap Masuk Payroll",
  submitted: "Terkirim",
  reviewing: "Sedang Ditinjau",
  reviewed: "Sudah Ditinjau",
  review: "Ditinjau",
  shortlisted: "Masuk Seleksi",
  screening: "Seleksi",
  lolos_dokumen: "Lolos Dokumen",
  wawancara: "Wawancara",
  interview: "Wawancara",
  interview_scheduled: "Wawancara Dijadwalkan",
  interview_rescheduled: "Wawancara Dijadwalkan Ulang",
  interview_completed: "Wawancara Selesai",
  interview_cancelled: "Wawancara Dibatalkan",
  scheduled: "Dijadwalkan",
  rescheduled: "Dijadwalkan Ulang",
  completed: "Selesai",
  passed: "Lolos",
  failed: "Tidak Lolos",
  no_show: "Tidak Hadir",
  hire: "Direkomendasikan Diterima",
  consider: "Dipertimbangkan",
  reject: "Tidak Direkomendasikan",
  diterima: "Diterima",
  ditolak: "Ditolak",
  withdrawn: "Dibatalkan",
};

export function getStatusLabel(status) {
  if (!status && status !== "") return "-";
  const normalized = String(status || "").toLowerCase().trim();
  return (
    statusLabelMap[normalized] ||
    String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export default getStatusLabel;
