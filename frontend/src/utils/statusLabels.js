export const statusLabelMap = {
  submitted: "Terkirim",
  screening: "Review",
  lolos_dokumen: "Lolos Dokumen",
  wawancara: "Wawancara",
  interview_rescheduled: "Jadwal Ulang Interview",
  interview_completed: "Interview Selesai",
  interview_cancelled: "Interview Dibatalkan",
  diterima: "Diterima",
  ditolak: "Ditolak",
  withdrawn: "Dibatalkan",
};

export function getStatusLabel(status) {
  if (!status && status !== "") return "-";
  return statusLabelMap[status] || String(status).replace(/_/g, " ");
}

export default getStatusLabel;
