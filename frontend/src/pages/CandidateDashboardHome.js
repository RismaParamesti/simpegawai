import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../features/common/headerSlice";
import TitleCard from "../components/Cards/TitleCard";
import Pagination from "../components/Pagination/Pagination";
import { getCandidateDashboardStats } from "../utils/candidateDashboard";
import { getCandidateProfile } from "../utils/candidateProfile";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { getChartColors, toRgba } from "../utils/themePalette";
import useTablePagination from "../hooks/useTablePagination";
import getStatusLabel from "../utils/statusLabels";

ChartJS.register(ArcElement, Tooltip, Legend);

// colors will be computed per-render inside the component to handle class-based dark mode

export default function CandidateDashboardHome() {
  const dispatch = useDispatch();
  // detect dark mode: prefer class-based dark or OS preference
  const currentTheme = document.documentElement.getAttribute("data-theme");

  const isDarkMode =
    currentTheme === "dark" ||
    document.documentElement.classList.contains("dark");

  const chartTextColor = isDarkMode ? "#FFFFFF" : "#111827";

  const tooltipBackground = isDarkMode ? "#0b1220" : "#ffffff";

  const legendBoxBorder = isDarkMode
    ? "rgba(255,255,255,0.55)"
    : "rgba(0,0,0,0.08)";
  const [profile, setProfile] = useState(null);
  const [candidateCall, setCandidateCall] = useState(null);
  const [selectedApplicationIndex, setSelectedApplicationIndex] = useState(0);

  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    accepted: 0,
    rejected: 0,
    latest: [],
    lolosDokumen: 0,
    wawancara: 0,
  });
  const latestApplicationsPagination = useTablePagination(stats.latest);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Beranda" }));
    getCandidateDashboardStats().then(setStats);
    getCandidateProfile().then(setProfile);
    // Cek apakah ada undangan candidate_calls
    axios
      .get("/api/candidate-calls/me")
      .then((res) => {
        if (res.data && res.data.id) setCandidateCall(res.data);
      })
      .catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    setSelectedApplicationIndex((currentIndex) =>
      Math.min(currentIndex, Math.max(stats.latest.length - 1, 0)),
    );
  }, [stats.latest.length]);

  const navigate = useNavigate();

  const invitationLetterUrl = candidateCall?.invitation_letter_file
    ? candidateCall.invitation_letter_file.startsWith("http")
      ? candidateCall.invitation_letter_file
      : `http://localhost:5000/${candidateCall.invitation_letter_file.replace(/^\//, "")}`
    : "";

  const selectedApplication =
    stats.latest[selectedApplicationIndex] || stats.latest[0] || null;

  // Prepare chart data and options: legend shows percentages, tooltip shows absolute numbers
  const _chartColors = getChartColors().slice(0, 3);
  const doughnutData = {
    labels: ["Diproses", "Diterima", "Ditolak"],
    datasets: [
      {
        data: [stats.inProgress ?? 0, stats.accepted ?? 0, stats.rejected ?? 0],
        backgroundColor: _chartColors.map((c) => toRgba(c, 0.85)),
        borderColor: _chartColors,
        borderWidth: 1,
      },
    ],
  };

  const legendItems = (() => {
    const data =
      (doughnutData.datasets &&
        doughnutData.datasets[0] &&
        doughnutData.datasets[0].data) ||
      [];
    const sum = data.reduce((s, v) => s + (Number(v) || 0), 0) || 1;
    return (doughnutData.labels || []).map((label, i) => ({
      label,
      value: data[i] || 0,
      percent: Math.round(((Number(data[i]) || 0) / sum) * 100),
      color:
        (doughnutData.datasets &&
          doughnutData.datasets[0] &&
          doughnutData.datasets[0].backgroundColor &&
          doughnutData.datasets[0].backgroundColor[i]) ||
        "#ccc",
    }));
  })();

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    color: chartTextColor,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: chartTextColor,
          generateLabels: (chart) => {
            const data =
              (chart.data.datasets &&
                chart.data.datasets[0] &&
                chart.data.datasets[0].data) ||
              [];
            const sum = data.reduce((s, v) => s + (Number(v) || 0), 0) || 1;
            return (chart.data.labels || []).map((label, i) => ({
              text: `${label} (${Math.round(((Number(data[i]) || 0) / sum) * 100)}%)`,
              fillStyle: chart.data.datasets[0].backgroundColor[i],
              hidden: chart.getDatasetMeta(0).data[i]?.hidden || false,
              index: i,
            }));
          },
        },
      },
      tooltip: {
        backgroundColor: tooltipBackground,
        titleColor: chartTextColor,
        bodyColor: chartTextColor,
        callbacks: {
          label: (context) => {
            const val = context.parsed || 0;
            return `${context.label}: ${val}`;
          },
        },
      },
    },
  };

  return (
    <div>
      {profile?.deleted_at && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700">
          <p className="text-lg font-bold">Anda telah menjadi pegawai.</p>
          <p className="mt-1 text-sm">
            Silakan login ulang untuk masuk ke dashboard pegawai.
          </p>
        </div>
      )}

      {/* STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TitleCard
          title="Total Permohonan"
          topMargin="mt-0"
          to="/candidate/requests"
          linkState={{ initialStatus: "all" }}
        >
          <div className="text-3xl font-bold text-primary">
            {stats.total ?? 0} lamaran
          </div>
        </TitleCard>

        <TitleCard
          title="Sedang Diproses"
          topMargin="mt-0"
          to="/candidate/requests"
          linkState={{ initialStatus: "screening" }}
        >
          <div className="text-3xl font-bold text-warning">
            {stats.inProgress ?? 0} lamaran
          </div>
        </TitleCard>

        <TitleCard
          title="Diterima"
          topMargin="mt-0"
          to="/candidate/requests"
          linkState={{ initialStatus: "diterima" }}
        >
          <div className="text-3xl font-bold text-success">
            {stats.accepted ?? 0} lamaran
          </div>
        </TitleCard>

        <TitleCard
          title="Ditolak"
          topMargin="mt-0"
          to="/candidate/requests"
          linkState={{ initialStatus: "ditolak" }}
        >
          <div className="text-3xl font-bold text-error">
            {stats.rejected ?? 0} lamaran
          </div>
        </TitleCard>
      </div>

      {/* UNDIVAN ONBOARDING */}
      {candidateCall && (
        <TitleCard
          title="Selamat! Anda Mendapatkan Undangan Onboarding"
          topMargin="mt-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-success mb-2">
                Selamat, Anda diundang untuk proses onboarding!
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Silakan unduh surat undangan onboarding Anda pada tombol di
                samping.
              </div>
            </div>
            <a
              href={invitationLetterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Lihat Surat
            </a>
          </div>
        </TitleCard>
      )}

      {/* GRID UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-1">
        {/* STATUS PERMOHONAN */}
        <div className="lg:col-span-2">
          <TitleCard title="Status Permohonan Terbaru">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Posisi</th>
                    <th>Tipe Pegawai</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {stats.latest.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-gray-400">
                        Belum ada data aplikasi
                      </td>
                    </tr>
                  ) : (
                    latestApplicationsPagination.paginatedItems.map((app, idx) => (
                      <tr
                        key={idx}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          navigate("/candidate/requests", {
                            state: { initialAppId: app.id },
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            navigate("/candidate/requests", {
                              state: { initialAppId: app.id },
                            });
                          }
                        }}
                        className="cursor-pointer hover:bg-base-200/60"
                      >
                        <td>{app.position_name}</td>
                        <td>
                          {app.employment_type === "permanent" &&
                            "Pegawai Tetap"}
                          {app.employment_type === "contract" && "Kontrak"}
                          {app.employment_type === "internship" && "Magang"}
                          {app.employment_type === "freelance" &&
                            "Pekerja Lepas"}
                          {![
                            "permanent",
                            "contract",
                            "internship",
                            "freelance",
                          ].includes(app.employment_type) &&
                            (app.employment_type || "-")}
                        </td>
                        <td>
                          {app.status === "diterima" && (
                            <span className="badge badge-success">
                              Diterima
                            </span>
                          )}
                          {app.status === "ditolak" && (
                            <span className="badge badge-error">Ditolak</span>
                          )}
                          {app.status === "withdrawn" && (
                            <span className="badge badge-neutral">
                              Dibatalkan
                            </span>
                          )}
                          {app.status === "wawancara" && (
                            <span className="badge badge-info">Wawancara</span>
                          )}
                          {app.status === "screening" && (
                            <span className="badge badge-accent">
                              Dalam Proses
                            </span>
                          )}
                          {app.status === "lolos_dokumen" && (
                            <span className="badge badge-accent">
                              Lolos Seleksi Dokumen
                            </span>
                          )}
                          {app.status === "submitted" && (
                            <span className="badge badge-warning">
                              Data Dikirim
                            </span>
                          )}
                          {![
                            "diterima",
                            "ditolak",
                            "withdrawn",
                            "wawancara",
                            "screening",
                            "lolos_dokumen",
                            "submitted",
                          ].includes(app.status) && (
                            <span className="badge">
                              {getStatusLabel(app.status)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <Pagination page={latestApplicationsPagination.page} totalPages={latestApplicationsPagination.totalPages} onChangePage={latestApplicationsPagination.setPage} itemsPerPage={latestApplicationsPagination.itemsPerPage} />
            </div>
          </TitleCard>

          <TitleCard title="Cek Data Diri & Dokumen">
            {profile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {/* ITEM */}
                {[
                  { label: "Nama", value: profile.name },
                  { label: "Email", value: profile.email },
                  { label: "No. HP", value: profile.phone },
                  { label: "Jenis Kelamin", value: profile.gender },
                  { label: "Tempat Lahir", value: profile.birth_place },
                  { label: "Tanggal Lahir", value: profile.date_of_birth },
                  { label: "Status Pernikahan", value: profile.marital_status },
                  { label: "Kewarganegaraan", value: profile.nationality },
                  { label: "NIK", value: profile.nik },
                  { label: "NPWP", value: profile.npwp },
                  {
                    label: "Pendidikan",
                    value: `${profile.education_level || "-"} ${profile.university ? `- ${profile.university}` : ""}`,
                  },
                  { label: "Jurusan", value: profile.major },
                  { label: "Tahun Lulus", value: profile.graduation_year },
                  {
                    label: "Gaji Diharapkan",
                    value: profile.expected_salary
                      ? `Rp${Number(profile.expected_salary).toLocaleString("id-ID")}`
                      : "-",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="font-medium">{item.value || "-"}</span>
                  </div>
                ))}

                {/* FULL WIDTH */}
                <div className="md:col-span-2 flex flex-col">
                  <span className="text-xs text-gray-500">Alamat</span>
                  <span className="font-medium">{profile.address || "-"}</span>
                </div>

                {/* LINK */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">LinkedIn</span>
                  {profile.linkedin ? (
                    <button
                      type="button"
                      className="btn btn-xs btn-outline"
                      onClick={() => {
                        const w = window.open(profile.linkedin, "_blank");
                        if (w) w.opener = null;
                      }}
                    >
                      Lihat LinkedIn
                    </button>
                  ) : (
                    "-"
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Portfolio</span>
                  {profile.portfolio ? (
                    <button
                      type="button"
                      className="btn btn-xs btn-outline"
                      onClick={() => {
                        const w = window.open(profile.portfolio, "_blank");
                        if (w) w.opener = null;
                      }}
                    >
                      Lihat Portfolio
                    </button>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            ) : (
              <p className="opacity-70 text-sm">Memuat data profil...</p>
            )}
          </TitleCard>
        </div>

        {/* GRAFIK */}
        <div>
          <TitleCard title="Progres Permohonan">
            <div className="py-4">
              {/* Chart */}
              <div style={{ height: 220, maxWidth: 360, margin: "0 auto" }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    ...doughnutOptions,
                    plugins: {
                      ...(doughnutOptions.plugins || {}),
                      legend: { display: false },
                    },
                  }}
                />
              </div>

              {/* Custom Legend */}
              <div className="mt-5 flex justify-center gap-5 flex-wrap">
                {legendItems.map((it, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm font-semibold text-base-content"
                  >
                    <span
                      aria-hidden
                      className="rounded-md border shrink-0"
                      style={{
                        width: 22,
                        height: 14,
                        background: it.color,
                        borderColor: "hsl(var(--bc) / 0.25)",
                      }}
                    />
                    <span className="text-base-content">
                      {it.label} ({it.percent}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TitleCard>

          <TitleCard title="Timeline Proses Rekrutmen">
            {stats.latest.length === 0 || !selectedApplication ? (
              <p className="opacity-70 text-sm">Belum ada data aplikasi</p>
            ) : (
              (() => {
                const getRecruitmentSteps = () => {
                  const status = selectedApplication.status;

                  // dibatalkan
                  if (status === "withdrawn") {
                    return [
                      { key: "submitted", label: "Kirim Lamaran" },
                      { key: "withdrawn", label: "Dibatalkan" },
                    ];
                  }

                  // ditolak langsung saat screening
                  if (
                    status === "ditolak" &&
                    selectedApplication.last_stage === "screening"
                  ) {
                    return [
                      { key: "submitted", label: "Kirim Lamaran" },
                      { key: "screening", label: "Seleksi" },
                      { key: "ditolak", label: "Ditolak" },
                    ];
                  }

                  // ditolak setelah interview
                  if (status === "ditolak") {
                    return [
                      { key: "submitted", label: "Kirim Lamaran" },
                      { key: "screening", label: "Seleksi" },
                      { key: "lolos_dokumen", label: "Lolos Dokumen" },
                      { key: "wawancara", label: "Wawancara" },
                      { key: "ditolak", label: "Ditolak" },
                    ];
                  }

                  // proses normal diterima
                  return [
                    { key: "submitted", label: "Kirim Lamaran" },
                    { key: "screening", label: "Seleksi" },
                    { key: "lolos_dokumen", label: "Lolos Dokumen" },
                    { key: "wawancara", label: "Wawancara" },
                    { key: "diterima", label: "Diterima" },
                  ];
                };

                const steps = getRecruitmentSteps();

                // Determine current step key:
                // - For final statuses (diterima/ditolak/withdrawn) use the status itself
                // - Otherwise prefer last_stage provided by backend (source of truth), fall back to status
                const finalStatuses = ["diterima", "ditolak", "withdrawn"];
                const currentKey = finalStatuses.includes(
                  selectedApplication.status,
                )
                  ? selectedApplication.status
                  : selectedApplication.last_stage ||
                    selectedApplication.status;

                const currentStepIndex = Math.max(
                  steps.findIndex((step) => step.key === currentKey),
                  0,
                );

                const currentApplicationLabel =
                  selectedApplication.position_name || "Lamaran aktif";

                return (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
                      <div className="space-y-4">
                        <div className="min-w-0 text-center">
                          <p className="text-xs font-medium uppercase tracking-wide text-base-content/50">
                            Lamaran dipilih
                          </p>

                          <h3 className="mt-1 text-base font-semibold text-base-content">
                            {currentApplicationLabel}
                          </h3>

                          <p className="mt-1 text-xs text-base-content/60">
                            Lamaran {selectedApplicationIndex + 1} dari{" "}
                            {stats.latest.length}
                          </p>
                        </div>

                        {/* BUTTON */}
                        <div className="flex justify-center items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-xs btn-outline"
                            onClick={() =>
                              setSelectedApplicationIndex((currentIndex) =>
                                Math.max(currentIndex - 1, 0),
                              )
                            }
                            disabled={selectedApplicationIndex === 0}
                          >
                            Sebelumnya
                          </button>

                          <button
                            type="button"
                            className="btn btn-xs btn-primary"
                            onClick={() =>
                              setSelectedApplicationIndex((currentIndex) =>
                                Math.min(
                                  currentIndex + 1,
                                  stats.latest.length - 1,
                                ),
                              )
                            }
                            disabled={
                              selectedApplicationIndex >=
                              stats.latest.length - 1
                            }
                          >
                            Berikutnya
                          </button>
                        </div>

                        {/* STATUS */}
                        <div className="flex items-center justify-between rounded-xl bg-base-200/60 px-3 py-2">
                          <span className="text-xs text-base-content/60">
                            Status saat ini
                          </span>

                          <span className="badge badge-sm badge-primary">
                            {getStatusLabel(selectedApplication.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative mx-auto mt-6 w-full max-w-sm px-2">
                      <div className="space-y-0">
                        {steps.map((step, idx) => {
                          const isCompleted = idx < currentStepIndex;
                          const isCurrent = idx === currentStepIndex;
                          const isActive = isCompleted || isCurrent;
                          const isLeft = idx % 2 === 0;

                          return (
                            <div
                              key={step.key}
                              className="relative grid min-h-[48px] grid-cols-[1fr_28px_1fr]"
                            >
                              {/* kiri */}
                              <div className={isLeft ? "pr-3 text-right" : ""}>
                                {isLeft && (
                                  <div
                                    className={`inline-flex flex-col ${
                                      isActive
                                        ? "text-primary"
                                        : "text-base-content/50"
                                    }`}
                                  >
                                    <span className="text-sm font-medium leading-tight">
                                      {step.label}
                                    </span>

                                    {isCompleted && (
                                      <span className="badge badge-xs badge-success mt-1 self-end">
                                        SELESAI
                                      </span>
                                    )}

                                    {isCurrent && (
                                      <span className="badge badge-xs badge-primary mt-1 self-end">
                                        AKTIF
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* tengah */}
                              <div className="relative flex justify-center">
                                <div
                                  className={`z-10 mt-1 h-3.5 w-3.5 rounded-full border-4 border-base-100 ${
                                    isCurrent
                                      ? "bg-primary"
                                      : isCompleted
                                        ? "bg-success"
                                        : "bg-base-300"
                                  }`}
                                />

                                {idx !== steps.length - 1 && (
                                  <div
                                    className={`absolute top-5 h-[58px] w-[3px] rounded-full ${
                                      idx < currentStepIndex
                                        ? "bg-success"
                                        : "bg-base-300"
                                    }`}
                                  />
                                )}
                              </div>

                              {/* kanan */}
                              <div className={!isLeft ? "pl-3 text-left" : ""}>
                                {!isLeft && (
                                  <div
                                    className={`inline-flex flex-col ${
                                      isActive
                                        ? "text-primary"
                                        : "text-base-content/50"
                                    }`}
                                  >
                                    <span className="text-sm font-medium leading-tight">
                                      {step.label}
                                    </span>

                                    {isCompleted && (
                                      <span className="badge badge-xs badge-success mt-1 self-start">
                                        SELESAI
                                      </span>
                                    )}

                                    {isCurrent && (
                                      <span className="badge badge-xs badge-primary mt-1 self-start">
                                        AKTIF
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </TitleCard>
        </div>
      </div>
    </div>
  );
}
