import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Eye,
  MapPin,
  RotateCcw,
  Search,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import api from "../../../lib/api";
import { setPageTitle } from "../../../features/common/headerSlice";

const formatDateLabel = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const CandidateHeroIllustration = () => (
  <div className="pointer-events-none absolute right-10 top-2 hidden h-32 w-80 lg:block">
    <div className="absolute bottom-2 right-0 h-20 w-72 rounded-full bg-orange-100/80 blur-[1px] dark:bg-orange-900/30" />
    <div className="absolute right-36 top-1 h-24 w-20 rotate-[-3deg] rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-orange-100 px-2 py-2 dark:border-slate-700">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/40 dark:text-orange-300">
          <Users className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-8 rounded-full bg-orange-400 dark:bg-orange-300" />
          <div className="h-1.5 w-6 rounded-full bg-slate-200 dark:bg-slate-600" />
        </div>
      </div>
      <div className="space-y-1.5 px-3 py-2">
        <div className="h-1.5 w-12 rounded-full bg-orange-300 dark:bg-orange-400" />
        <div className="h-1.5 w-10 rounded-full bg-emerald-200 dark:bg-emerald-400" />
        <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-600" />
        <div className="h-1.5 w-8 rounded-full bg-orange-200 dark:bg-orange-800" />
      </div>
    </div>
    <div className="absolute right-24 top-16 h-14 w-14 rounded-2xl bg-orange-400 shadow-md dark:bg-orange-500" />
    <div className="absolute right-8 top-8 h-14 w-14 rounded-2xl bg-emerald-200 shadow-sm dark:bg-emerald-500/70" />
    <div className="absolute right-12 top-20 h-2 w-20 rounded-full bg-slate-300 dark:bg-slate-600" />
    <div className="absolute right-14 top-24 h-8 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
    <div className="absolute right-28 top-24 h-8 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
  </div>
);

export default function CandidateJobList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [locations, setLocations] = useState([]);
  const [applicantsCount, setApplicantsCount] = useState({});
  const [candidateSummary, setCandidateSummary] = useState({
    total: 0,
    changed: 0,
    unchanged: 0,
  });
  const [applicationsList, setApplicationsList] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(setPageTitle({ title: "Daftar Kandidat" }));
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    let result = jobs;

    if (search) {
      result = result.filter((job) =>
        String(job.position_name || job.title || "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }

    if (locationFilter) {
      result = result.filter(
        (job) => job.location?.toLowerCase() === locationFilter.toLowerCase(),
      );
    }

    if (statusFilter) {
      result = result.filter((job) => job.status === statusFilter);
    }

    setFilteredJobs(result);
  }, [search, locationFilter, statusFilter, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const [res, appsRes] = await Promise.all([
        api.get("/job-openings"),
        api.get("/candidates/admin/applications").catch(() => null),
      ]);

      const jobsData = res.data.jobs || [];
      setJobs(jobsData);
      setFilteredJobs(jobsData);

      const applications = Array.isArray(appsRes?.data?.applications)
        ? appsRes.data.applications
        : [];

      setApplicationsList(applications);

      const totalApplications = applications.length;
      const unchangedApplications = applications.filter((app) => {
        const appStatus = String(app.status || "").toLowerCase();
        return appStatus === "submitted";
      }).length;

      setCandidateSummary({
        total: totalApplications,
        changed: Math.max(0, totalApplications - unchangedApplications),
        unchanged: unchangedApplications,
      });

      const countsFromJobs = {};
      jobsData.forEach((j) => {
        const jid = j.id || j.job_opening_id || j.job_openingId || j.jobId;
        if (typeof j.applications_count !== "undefined") {
          countsFromJobs[jid] = Number(j.applications_count) || 0;
        }
      });

      const allHaveCounts = jobsData.every(
        (j) => typeof j.applications_count !== "undefined",
      );

      if (allHaveCounts) {
        setApplicantsCount(countsFromJobs);
      } else {
        setApplicantsCount(countsFromJobs);
        try {
          const visibleIds = jobsData
            .map((j) => j.id || j.job_opening_id || j.job_openingId || j.jobId)
            .filter(Boolean);

          if (visibleIds.length > 0) {
            const resCounts = await api.get(
              `/job-openings/counts?ids=${visibleIds.join(",")}`,
            );
            if (resCounts.data && resCounts.data.counts) {
              setApplicantsCount((prev) => ({
                ...prev,
                ...resCounts.data.counts,
              }));
            }
          }
        } catch (e) {
          // Abaikan jika endpoint jumlah pelamar tidak tersedia.
        }
      }

      const uniqueLocations = [
        ...new Set(jobsData.map((job) => job.location).filter(Boolean)),
      ].sort();
      setLocations(uniqueLocations);
    } catch (err) {
      setError("Gagal mengambil data lowongan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEmploymentTypeLabel = (type) => {
    const typeMap = {
      permanent: "Tetap",
      contract: "Kontrak",
      temporary: "Sementara",
      internship: "Magang",
      intern: "Magang",
      part_time: "Part-time",
      freelance: "Freelance",
    };
    return typeMap[type?.toLowerCase()] || type || "-";
  };

  const computeJobsList = (mode) => {
    const byJob = {};

    applicationsList.forEach((app) => {
      const jid = app.job_opening_id || app.job_id;
      if (!jid) return;

      const appStatus = String(app.status || "").toLowerCase();
      const isUnchanged = appStatus === "submitted";

      let include = false;
      if (mode === "all") include = true;
      if (mode === "unchanged" && isUnchanged) include = true;
      if (mode === "changed" && !isUnchanged) include = true;
      if (!include) return;

      if (!byJob[jid]) byJob[jid] = 0;
      byJob[jid] += 1;
    });

    return Object.keys(byJob)
      .map((jid) => {
        const jobId = Number(jid);
        const job = jobs.find((j) => (j.id || j.job_opening_id) === jobId) || {
          id: jobId,
          title: `Lowongan #${jobId}`,
        };
        return { job, count: byJob[jid] };
      })
      .sort((a, b) => b.count - a.count);
  };

  const resetFilters = () => {
    setSearch("");
    setLocationFilter("");
    setStatusFilter("");
    setActiveFilter(null);
  };

  const summaryCards = [
    {
      key: "all",
      title: "Total Pelamar",
      value: candidateSummary.total,
      description: "Semua kandidat yang sudah melamar",
      icon: Users,
      baseClass:
        "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-200 dark:hover:bg-orange-950/50",
      activeClass:
        "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-950/40",
      iconClass: "bg-white/20 text-white",
    },
    {
      key: "changed",
      title: "Sudah Dikelola",
      value: candidateSummary.changed,
      description: "Status kandidat sudah diproses",
      icon: UserCheck,
      baseClass:
        "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200 dark:hover:bg-emerald-950/50",
      activeClass:
        "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-950/40",
      iconClass: "bg-white/20 text-white",
    },
    {
      key: "unchanged",
      title: "Belum Dikelola",
      value: candidateSummary.unchanged,
      description: "Lamaran masih berstatus submitted",
      icon: Clock3,
      baseClass:
        "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 dark:hover:bg-amber-950/50",
      activeClass:
        "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-200 dark:shadow-amber-950/40",
      iconClass: "bg-white/20 text-white",
    },
  ];

  const jobsForFilter = activeFilter ? computeJobsList(activeFilter) : null;
  const visibleJobs = activeFilter
    ? jobsForFilter.map((item) => item.job)
    : filteredJobs;

  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative min-h-[120px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-1 py-2 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-2">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
              <BriefcaseBusiness className="h-4 w-4" />
              Manajemen Kandidat
            </div>
            <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
              Daftar Kandidat
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              Pilih lowongan untuk melihat kandidat, memantau jumlah pelamar,
              dan mengelola proses rekrutmen dengan lebih mudah.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {summaryCards.map((item) => {
            const Icon = item.icon;
            const isActive = activeFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveFilter(item.key)}
                className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  isActive
                    ? item.activeClass
                    : item.baseClass
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isActive ? "text-white/90" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p
                      className={`mt-2 text-3xl font-extrabold ${
                        isActive ? "text-white" : "text-slate-900 dark:text-slate-50"
                      }`}
                    >
                      {item.value}
                    </p>
                    <p
                      className={`mt-1 text-xs font-medium ${
                        isActive ? "text-white/85" : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.iconClass}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                Pilih Lowongan Pekerjaan
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Gunakan filter untuk mencari lowongan berdasarkan posisi,
                lokasi, atau status rekrutmen.
              </p>
            </div>

            {activeFilter && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
                <ClipboardCheck className="h-4 w-4" />
                Filter ringkasan aktif
              </div>
            )}
          </div>

          {/* Search + Filter */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <label className="input input-bordered flex w-full items-center gap-2 rounded-xl bg-white text-slate-900 lg:col-span-5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari posisi, contoh: Supervisor, Mentor..."
                  className="grow bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">Semua Lokasi</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>

              <button
                type="button"
                className="btn rounded-xl border-none bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 lg:col-span-2"
                onClick={resetFilters}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <span className="loading loading-spinner loading-lg text-orange-500" />
              <p className="mt-3 text-sm font-medium">
                Memuat data lowongan dan kandidat...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-bold">Data gagal dimuat</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Job List */}
          {!loading && !error && (
            <>
              {visibleJobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <BriefcaseBusiness className="h-7 w-7" />
                  </div>
                  <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">
                    Tidak ada lowongan yang sesuai.
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Coba ubah kata kunci atau reset filter pencarian.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {visibleJobs.map((job, index) => {
                    const jid =
                      job.id || job.job_opening_id || job.job_openingId || job.jobId;
                    const jobCount = activeFilter
                      ? (
                          jobsForFilter.find(
                            (item) =>
                              (item.job.id || item.job.job_opening_id) === jid,
                          ) || {}
                        ).count
                      : applicantsCount[jid] ?? "-";
                    const jobTitle = job.position_name || job.title || "Lowongan";
                    const isOpen = job.status === "open";

                    return (
                      <div
                        key={jid || `${jobTitle}-${index}`}
                        className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-950 dark:hover:border-orange-800"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                                index % 4 === 0
                                  ? "bg-orange-100 text-orange-600"
                                  : index % 4 === 1
                                    ? "bg-blue-100 text-blue-600"
                                    : index % 4 === 2
                                      ? "bg-purple-100 text-purple-600"
                                      : "bg-emerald-100 text-emerald-600"
                              }`}
                            >
                              <BriefcaseBusiness className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="line-clamp-2 text-base font-extrabold text-slate-900 dark:text-slate-50">
                                {jobTitle}
                              </h3>
                            </div>
                          </div>

                          <span
                            className={`badge badge-sm rounded-full border-none px-3 py-3 font-bold text-white ${
                              isOpen
                                ? "!bg-emerald-500 !text-white"
                                : "!bg-red-500 !text-white"
                            }`}
                          >
                            {isOpen ? "Open" : "Closed"}
                          </span>
                        </div>

                        <div className="mt-5 space-y-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <span>{job.location || "Lokasi tidak disebutkan"}</span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <CircleDollarSign className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <span>
                              {job.salary_range_min && job.salary_range_max
                                ? `Rp ${Number(job.salary_range_min).toLocaleString(
                                    "id-ID",
                                  )} - Rp ${Number(
                                    job.salary_range_max,
                                  ).toLocaleString("id-ID")}`
                                : "Gaji dirahasiakan"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <CalendarDays className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <span>Deadline: {formatDateLabel(job.deadline)}</span>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-2">
                          <div className="rounded-2xl bg-orange-50 p-3 text-center dark:bg-orange-950/40">
                            <p className="text-[11px] font-semibold text-orange-600/80 dark:text-orange-300">
                              Jenis
                            </p>
                            <p className="mt-1 truncate text-sm font-bold text-orange-600 dark:text-orange-300">
                              {getEmploymentTypeLabel(job.employment_type)}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-orange-50 p-3 text-center dark:bg-orange-950/40">
                            <p className="text-[11px] font-semibold text-orange-600/80 dark:text-orange-300">
                              Kuota
                            </p>
                            <p className="mt-1 text-sm font-bold text-orange-600 dark:text-orange-300">
                              {job.quota || 1}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-orange-50 p-3 text-center dark:bg-orange-950/40">
                            <p className="text-[11px] font-semibold text-orange-600/80 dark:text-orange-300">
                              Pelamar
                            </p>
                            <p className="mt-1 text-sm font-bold text-orange-600 dark:text-orange-300">
                              {jobCount ?? "-"}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn mt-5 w-full rounded-xl border-none !border-orange-500 !bg-orange-500 !text-white shadow-md hover:!border-orange-500 hover:!bg-white hover:!text-orange-500"
                          onClick={() => {
                            navigate(
                              `/app/recruitment-process/${jid}?job_id=${jid}`,
                              { state: { job } },
                            );
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          Lihat Kandidat
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
