import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/api";

import { setPageTitle } from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";

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
  const [activeFilter, setActiveFilter] = useState(null); // 'all' | 'changed' | 'unchanged' | null

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
        job.position_name?.toLowerCase().includes(search.toLowerCase()),
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
      const [res, appsRes] = await Promise.all([
        api.get("/job-openings"),
        api.get("/candidates/admin/applications").catch(() => null),
      ]);
      const jobsData = res.data.jobs || [];
      // Tidak filter status, tampilkan semua (open & closed)
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

      

      // Prefer applications_count returned by the jobs API
      const countsFromJobs = {};
      jobsData.forEach((j) => {
        const jid = j.id || j.job_opening_id || j.job_openingId || j.jobId;
        if (typeof j.applications_count !== "undefined") {
          countsFromJobs[jid] = Number(j.applications_count) || 0;
        }
      });
      // If we have counts for all jobs, use them. Otherwise, fetch counts for visible jobs via batch endpoint.
      const allHaveCounts = jobsData.every((j) => typeof j.applications_count !== "undefined");
      if (allHaveCounts) {
        setApplicantsCount(countsFromJobs);
      } else {
        // set known counts
        setApplicantsCount(countsFromJobs);
        // fetch counts only for visible (filtered) jobs to avoid N+1
        try {
          const visibleIds = jobsData.map((j) => j.id || j.job_opening_id || j.job_openingId || j.jobId).filter(Boolean);
          if (visibleIds.length > 0) {
            const res = await api.get(`/job-openings/counts?ids=${visibleIds.join(",")}`);
            if (res.data && res.data.counts) {
              setApplicantsCount((prev) => ({ ...prev, ...res.data.counts }));
            }
          }
        } catch (e) {
          // ignore
        }
      }
      // Extract unique locations
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
      part_time: "Part-time",
      freelance: "Freelance",
    };
    return typeMap[type?.toLowerCase()] || type || "-";
  };

  

  const computeJobsList = (mode) => {
    // return list of jobs that have at least one application matching mode, with counts
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
      byJob[jid]++;
    });

    return Object.keys(byJob).map((jid) => {
      const jobId = Number(jid);
      const job = jobs.find((j) => (j.id || j.job_opening_id) === jobId) || { id: jobId, title: `Lowongan #${jobId}` };
      return { job, count: byJob[jid] };
    }).sort((a,b) => b.count - a.count);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div onClick={() => setActiveFilter('all')} className="rounded-2xl bg-base-100 border border-base-200 shadow-sm p-5 cursor-pointer hover:shadow-md">
          <p className="text-sm text-base-content/60">Total Pelamar</p>
          <p className="mt-2 text-3xl font-bold text-base-content">
            {candidateSummary.total}
          </p>
        </div>
        <div onClick={() => setActiveFilter('changed')} className="rounded-2xl bg-base-100 border border-base-200 shadow-sm p-5 cursor-pointer hover:shadow-md">
          <p className="text-sm text-base-content/60">Sudah Dikelola</p>
          <p className="mt-2 text-3xl font-bold text-warning">
            {candidateSummary.changed}
          </p>
        </div>
        <div onClick={() => setActiveFilter('unchanged')} className="rounded-2xl bg-base-100 border border-base-200 shadow-sm p-5 cursor-pointer hover:shadow-md">
          <p className="text-sm text-base-content/60">Belum Dikelola</p>
          <p className="mt-2 text-3xl font-bold text-success">
            {candidateSummary.unchanged}
          </p>
        </div>
      </div>
      {/* When activeFilter is set, the main job grid below will be filtered to show only matching lowongan. */}

      <TitleCard title="Pilih Lowongan Pekerjaan" topMargin="mt-0">
        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          {/* SEARCH */}
          <div className="flex-1">
            <label className="text-xs font-semibold opacity-60 mb-1 block">
              Cari Posisi
            </label>
            <input
              type="text"
              placeholder="Contoh: Supervisor, Mentor..."
              className="input input-bordered w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* LOCATION FILTER */}
          <div className="w-full md:w-60">
            <label className="text-xs font-semibold opacity-60 mb-1 block">
              Lokasi
            </label>
            <select
              className="select select-bordered w-full"
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
          </div>

          {/* STATUS FILTER */}
          <div className="w-full md:w-48">
            <label className="text-xs font-semibold opacity-60 mb-1 block">
              Status
            </label>
            <select
              className="select select-bordered w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
            <button
            button = "button"
              className="btn btn-secondary btn-sm rounded-full"
              onClick={() => {
                setSearch("");
                setLocationFilter("");
                setStatusFilter("");
                setActiveFilter(null);
              }}
            >
              Reset
            </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center p-6">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {/* ERROR */}
        {error && <div className="text-center text-error p-4">{error}</div>}

        {/* JOB LIST */}
        {!loading && !error && (() => {
          const jobsForFilter = activeFilter ? computeJobsList(activeFilter) : null;
          const visibleJobs = activeFilter ? jobsForFilter.map(j => j.job) : filteredJobs;
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleJobs.map((job) => {
                const jobCount = activeFilter ? (jobsForFilter.find(j => (j.job.id || j.job.job_opening_id) === (job.id || job.job_opening_id)) || {}).count : (applicantsCount[job.id || job.job_opening_id || job.job_openingId || job.jobId] ?? "-");
                return (
                  <div
                    key={job.id}
                    className="card bg-base-100 shadow-md border hover:shadow-xl transition"
                  >
                    <div className="card-body">
                      {/* TITLE */}
                      <h2 className="card-title text-primary">{job.position_name}</h2>

                      {/* LOCATION */}
                      <p className="text-sm opacity-70">📍 {job.location || "Lokasi tidak disebutkan"}</p>

                      {/* TYPE */}
                      <div className="badge badge-outline capitalize">Pegawai {getEmploymentTypeLabel(job.employment_type)}</div>

                      {/* SALARY */}
                      <p className="text-sm mt-2">
                        {job.salary_range_min && job.salary_range_max
                          ? `💰 Rp ${Number(job.salary_range_min).toLocaleString("id-ID")} - Rp ${Number(job.salary_range_max).toLocaleString("id-ID")}`
                          : "💰 Gaji dirahasiakan"}
                      </p>

                      {/* QUOTA */}
                      <p className="text-sm">👥 Kuota: {job.quota || 1}</p>

                      {/* APPLICANTS COUNT */}
                      <p className="text-sm">👥 Jumlah Pelamar: {jobCount ?? "-"}</p>

                      {/* DEADLINE */}
                      <p className="text-sm text-warning">⏳ Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString("id-ID") : "-"}</p>

                      {/* STATUS */}
                      <div className="mt-2">
                        {job.status === "open" && <span className="badge badge-success">Open Recruitment</span>}
                        {job.status === "closed" && <span className="badge badge-error">Closed</span>}
                      </div>

                      {/* BUTTON */}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          const jid = job.id || job.job_opening_id || job.job_openingId || job.jobId;
                          navigate(`/app/recruitment-process/${jid}?job_id=${jid}`, { state: { job } });
                        }}
                      >
                        Lihat Kandidat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </TitleCard>
    </div>
  );
}

