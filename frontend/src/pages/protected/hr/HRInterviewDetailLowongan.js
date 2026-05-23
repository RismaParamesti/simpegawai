import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TitleCard from "../../../components/Cards/TitleCard";
import axios from "axios";

export default function JobDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { jobId: jobIdParam } = useParams();

  // Ambil id dari state (dari navigasi sebelumnya)
  const jobState = state?.job;
  const jobId = jobState?.id || jobIdParam;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      setError("ID lowongan tidak ditemukan");
      return;
    }
    setLoading(true);
    axios
      .get(`/api/job-openings/${jobId}`)
      .then((res) => {
        setJob(res.data.job);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message || "Gagal mengambil data lowongan",
        );
        setLoading(false);
      });
  }, [jobId]);

  if (loading) {
    return (
      <TitleCard title="Detail Lowongan">
        <p>Memuat data lowongan...</p>
      </TitleCard>
    );
  }

  if (error || !job) {
    return (
      <TitleCard title="Detail Lowongan">
        <p>{error || "Data lowongan tidak ditemukan"}</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
          Kembali
        </button>
      </TitleCard>
    );
  }
  const formatTextToList = (value) => {
    if (!value) return [];

    // jika array
    if (Array.isArray(value)) {
      return value.flatMap((item) =>
        item
          .split(/\s*-\s*/)
          .map((x) => x.trim())
          .filter(Boolean),
      );
    }

    return (
      value
        // pisah berdasarkan enter ATAU tanda -
        .split(/\n|(?=\s*-\s)/)
        .map((item) => item.trim())
        .map((item) => item.replace(/^[-•]\s*/, ""))
        .filter(Boolean)
    );
  };

  // Parsing requirements dan responsibilities jika bentuknya string JSON
  let requirements = job.requirements;
  if (typeof requirements === "string") {
    try {
      requirements = JSON.parse(requirements);
    } catch {
      requirements = [requirements];
    }
  }

  let responsibilities = job.responsibilities;
  if (typeof responsibilities === "string") {
    try {
      responsibilities = JSON.parse(responsibilities);
    } catch {
      responsibilities = [responsibilities];
    }
  }

  const requirementList = formatTextToList(requirements);
  const responsibilityList = formatTextToList(responsibilities);

  const deadlineDate = job.deadline ? new Date(job.deadline) : null;
  const today = new Date();

  let deadlineClass = "bg-success/10 text-success border-success/20";

  if (deadlineDate) {
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      deadlineClass = "bg-error/10 text-error border-error/20";
    } else if (diffDays <= 7) {
      deadlineClass = "bg-warning/10 text-warning border-warning/20";
    }
  }
  let statusClass = "!bg-warning !text-warning-content";

  if (job.status === "open") {
    statusClass = "!bg-success !text-success-content";
  } else if (job.status === "closed") {
    statusClass = "!bg-error !text-error-content";
  } else if (job.status === "draft") {
    statusClass = "!bg-info !text-info-content";
  }

  return (
    <TitleCard
      title="Detail Lowongan"
      TopSideButtons={
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          Kembali
        </button>
      }
    >
      <div className="space-y-6">
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-base-100 to-secondary/10 p-6 shadow-sm">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/10"></div>
          <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-secondary/10"></div>

          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-base-content">
                {job.title}
              </h2>

              <p className="text-sm text-base-content/70 mt-2">
                {job.department_name || "-"} •{" "}
                {job.position_name || job.base_position || "-"}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`badge badge-lg gap-2 border-0 px-4 py-4 font-semibold shadow-sm ${statusClass}`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>

                {job.status === "open"
                  ? "Dibuka"
                  : job.status === "closed"
                    ? "Ditutup"
                    : job.status === "draft"
                      ? "Draft"
                      : job.status}
              </span>
            </div>
          </div>
        </div>

        {/* INFORMASI UTAMA */}
        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                i
              </div>

              <div>
                <h3 className="font-bold text-base-content">
                  Informasi Pekerjaan
                </h3>
                <p className="text-xs text-base-content/60">
                  Ringkasan data lowongan
                </p>
              </div>
            </div>

            <span className="badge badge-lg gap-2 border-0 px-4 py-3 font-semibold shadow-sm bg-base-200 text-base-content capitalize whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-current"></span>
              Tahap {job.hiring_status || "-"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ["Kuota", job.quota || "-"],
              ["Jenis", job.employment_type || "-"],
              ["Lokasi", job.location || "-"],
              [
                "Gaji",
                job.salary_range_min && job.salary_range_max
                  ? `Rp ${parseInt(job.salary_range_min).toLocaleString(
                      "id-ID",
                    )} - Rp ${parseInt(job.salary_range_max).toLocaleString(
                      "id-ID",
                    )}`
                  : "Dirahasiakan",
              ],
              [
                "Posisi",
                job.position_name || job.base_position || job.title || "-",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-base-300 bg-base-200/40 px-4 py-3 hover:bg-base-200/70 transition"
              >
                <p className="text-xs font-medium text-base-content/60 mb-1">
                  {label}
                </p>

                <p className="text-sm font-bold text-base-content capitalize break-words">
                  {value}
                </p>
              </div>
            ))}

            {/* DEADLINE */}
            <div className="rounded-2xl border border-base-300 bg-base-200/40 px-4 py-3 hover:bg-base-200/70 transition">
              <p className="text-xs font-medium text-base-content/60 mb-1">
                Deadline
              </p>

              <div
                className={`inline-flex rounded-xl border px-3 py-2 text-sm font-semibold ${deadlineClass}`}
              >
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString("id-ID")
                  : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* DETAIL DESKRIPSI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                ✦
              </div>

              <div>
                <h3 className="font-bold text-base-content">
                  Deskripsi Pekerjaan
                </h3>
                <p className="text-xs text-base-content/60">
                  Gambaran umum pekerjaan
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-base-200/40 border border-base-300 p-4">
              <p className="text-sm text-base-content/80 leading-relaxed whitespace-pre-line">
                {job.description || "-"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-base-300 bg-gradient-to-br from-accent/10 via-base-100 to-base-100 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-accent text-accent-content flex items-center justify-center font-bold">
                #
              </div>

              <div>
                <h3 className="font-bold text-base-content">Ringkasan</h3>
                <p className="text-xs text-base-content/60">
                  Informasi singkat
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-2xl bg-base-100 border border-base-300 px-4 py-3">
                <p className="text-base-content/60 text-xs mb-1">Departemen</p>
                <p className="font-bold text-base-content">
                  {job.department_name || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-base-100 border border-base-300 px-4 py-3">
                <p className="text-base-content/60 text-xs mb-1">
                  Tipe Pekerjaan
                </p>
                <p className="font-bold text-base-content capitalize">
                  {job.employment_type || "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-base-100 border border-base-300 px-4 py-3">
                <p className="text-base-content/60 text-xs mb-1">Lokasi</p>
                <p className="font-bold text-base-content">
                  {job.location || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PERSYARATAN & TANGGUNG JAWAB */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* PERSYARATAN */}
          <div className="rounded-3xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary text-primary-content flex items-center justify-center">
                  ✓
                </div>

                <div>
                  <h3 className="font-bold text-base-content text-lg">
                    Persyaratan
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Kualifikasi kandidat
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {requirementList.length > 0 ? (
                requirementList.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-2xl bg-base-200/40 border border-base-300 p-4"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>

                    <p className="text-sm text-base-content leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-base-content/60 text-sm">Tidak ada data</p>
              )}
            </div>
          </div>

          {/* TANGGUNG JAWAB */}
          <div className="rounded-3xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent border-b border-base-300">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-secondary text-secondary-content flex items-center justify-center">
                  ↗
                </div>

                <div>
                  <h3 className="font-bold text-base-content text-lg">
                    Tanggung Jawab
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Aktivitas utama pekerjaan
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {responsibilityList.length > 0 ? (
                responsibilityList.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-2xl bg-base-200/40 border border-base-300 p-4"
                  >
                    <div className="w-7 h-7 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </div>

                    <p className="text-sm text-base-content leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-base-content/60 text-sm">Tidak ada data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </TitleCard>
  );
}
