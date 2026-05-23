import axios from "axios";

function getVisibleStatus(app) {
  const rawStatus = app?.status || "submitted";
  const isPublished =
    app?.is_published ||
    app?.hiring_status === "interview" ||
    app?.hiring_status === "completed";

  if (
    !isPublished &&
    [
      "ditolak",
      "diterima",
      "lolos_dokumen",
      "wawancara",
      "interview_rescheduled",
    ].includes(rawStatus)
  ) {
    return "screening";
  }

  return rawStatus;
}

export async function getCandidateDashboardStats() {
  // Ambil data statistik untuk dashboard kandidat
  const res = await axios.get("/api/candidates/applications");
  const apps = res.data.applications || [];

  // Total semua aplikasi
  const total = apps.length;
  // Sedang diproses: status submitted, screening, lolos_dokumen, wawancara
  const visibleApps = apps.map((app) => ({ ...app, visible_status: getVisibleStatus(app) }));
  const inProgress = visibleApps.filter(a => ["submitted", "screening", "lolos_dokumen", "wawancara"].includes((a.visible_status || "").toString())).length;
  // Hitung khusus untuk status "lolos_dokumen" dan "wawancara"
  const lolosDokumen = visibleApps.filter(a => a.visible_status === "lolos_dokumen").length;
  const wawancara = visibleApps.filter(a => a.visible_status === "wawancara").length;
  // Diterima: status diterima
  const accepted = visibleApps.filter(a => a.visible_status === "diterima").length;
  // Ditolak: status ditolak
  const rejected = visibleApps.filter(a => a.visible_status === "ditolak").length;

  // Untuk tabel status terbaru, urutkan berdasarkan submitted_at desc
  const latest = visibleApps
    .slice()
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
    .slice(0, 5)
    .map((app) => ({
      ...app,
      status: app.visible_status,
    }));

  return {
    total,
    inProgress,
    accepted,
    rejected,
    latest,
    lolosDokumen,
    wawancara
  };
}
