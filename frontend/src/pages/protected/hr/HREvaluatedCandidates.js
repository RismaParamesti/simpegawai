import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Eye,
  Filter,
  ListChecks,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

import { setPageTitle } from "../../../features/common/headerSlice";
import Pagination from "../../../components/Pagination/Pagination";
import HiredCandidateWarning from "../../../components/HiredCandidateWarning";
import HRInterviewDetailLowongan from "./HRInterviewNilai";
import { formatInterviewAssessmentNotes } from "../../../utils/interviewAssessmentNotes";
import {
  buildHiredCandidateLookup,
  findHiredCandidateInfo,
  isPendingRecruitmentWarningCandidate,
} from "../../../utils/hiredCandidateStatus";

const ratingLabelMap = {
  1: "Tidak Memenuhi",
  2: "Kurang",
  3: "Cukup / Standar",
  4: "Baik",
  5: "Sangat Baik / Unggul",
};

const recommendationLabelMap = {
  hire: "Direkomendasikan Lolos",
  consider: "Dipertimbangkan",
  reject: "Tidak Direkomendasikan",
};

const resultLabelMap = {
  passed: "Lolos",
  failed: "Tidak Lolos",
  no_show: "Tidak Hadir",
  pending: "Menunggu",
};

const ITEMS_PER_PAGE = 10;

const getRatingNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getJobKey = (item) =>
  item.job_opening_id ||
  item.position_id ||
  item.id ||
  item.job_title ||
  "unknown";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const FinalReviewHeroIllustration = () => (
  <div className="pointer-events-none absolute right-10 top-2 hidden h-32 w-80 lg:block">
    <div className="absolute bottom-2 right-0 h-20 w-72 rounded-full bg-orange-100/80 blur-[1px] dark:bg-orange-900/30" />
    <div className="absolute right-36 top-1 h-24 w-20 rotate-[-3deg] rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-orange-100 px-2 py-2 dark:border-slate-700">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/40 dark:text-orange-300">
          <Star className="h-4 w-4" />
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
    <div className="absolute right-24 top-16 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-400 text-white shadow-md dark:bg-orange-500">
      <Trophy className="h-7 w-7" />
    </div>
    <div className="absolute right-8 top-8 h-14 w-14 rounded-2xl bg-emerald-200 shadow-sm dark:bg-emerald-500/70" />
    <div className="absolute right-12 top-20 h-2 w-20 rounded-full bg-slate-300 dark:bg-slate-600" />
    <div className="absolute right-14 top-24 h-8 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
    <div className="absolute right-28 top-24 h-8 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
  </div>
);

const HREvaluatedCandidates = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [hiredCandidates, setHiredCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [completingJobs, setCompletingJobs] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [completionConfirm, setCompletionConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showTop3Only, setShowTop3Only] = useState(false);
  const [candidateSort, setCandidateSort] = useState("rating_desc");
  const [groupPages, setGroupPages] = useState({});

  useEffect(() => {
    dispatch(setPageTitle({ title: "Final Review" }));
  }, [dispatch]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError("");
      const [res, hiredRes] = await Promise.all([
        axios.get("/api/hr/interviews/history-combined", {
          params: { include_active: true },
        }),
        axios.get("/api/interviews?status=passed").catch(() => ({ data: [] })),
      ]);
      const history = Array.isArray(res.data?.history) ? res.data.history : [];
      setHiredCandidates(Array.isArray(hiredRes.data) ? hiredRes.data : []);

      const evaluated = history
        .map((item) => ({
          ...item,
          id: item.id || item.interview_id,
          candidate_name: item.candidate_name || item.name || "-",
          job_title:
            item.job_title ||
            item.position_name ||
            item.base_position ||
            "Lainnya",
          scheduled_date: item.scheduled_date || item.date,
          interviewer_name:
            item.interviewer_name || item.interviewer || item.full_name || "-",
          rating: item.rating ?? item.interview_rating ?? "",
          recommendation: item.recommendation || "",
          result: item.result || item.interview_result || "",
          interviewer_notes: item.interviewer_notes,
          display_interviewer_notes: formatInterviewAssessmentNotes(
            item.interviewer_notes,
            "",
          ),
        }))
        .filter(
          (item) =>
            item.status === "completed" &&
            item.job_hiring_status !== "completed",
        )
        .sort((a, b) => {
          const ratingDiff =
            getRatingNumber(b.rating) - getRatingNumber(a.rating);
          if (ratingDiff !== 0) return ratingDiff;
          return (
            new Date(b.scheduled_date || 0) - new Date(a.scheduled_date || 0)
          );
        });

      setCandidates(evaluated);
    } catch (err) {
      console.error("[HREvaluatedCandidates] fetch error", err);
      setError("Gagal memuat kandidat yang sudah dinilai.");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();

    const refreshHandler = () => fetchCandidates();
    window.addEventListener("refreshInterviewData", refreshHandler);
    window.addEventListener("interviewsPublished", refreshHandler);

    return () => {
      window.removeEventListener("refreshInterviewData", refreshHandler);
      window.removeEventListener("interviewsPublished", refreshHandler);
    };
  }, []);

  const positions = useMemo(
    () =>
      Array.from(
        new Set(candidates.map((item) => item.job_title).filter(Boolean)),
      ),
    [candidates],
  );
  const hiredCandidateLookup = useMemo(
    () => buildHiredCandidateLookup(hiredCandidates),
    [hiredCandidates],
  );

  const filteredCandidates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return candidates.filter((item) => {
      const jobTitle = (item.job_title || "").toLowerCase();
      const recommendation = (item.recommendation || "").toLowerCase();
      const result = (item.result || "").toLowerCase();
      const ratingNumber = getRatingNumber(item.rating);
      const goodCandidate =
        ratingNumber >= 4 || recommendation === "hire" || result === "passed";

      if (keyword) {
        if (!jobTitle.includes(keyword)) return false;
      }

      if (positionFilter && item.job_title !== positionFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (ratingFilter === "good" && !goodCandidate) return false;
      if (ratingFilter === "top" && ratingNumber < 5) return false;

      return true;
    });
  }, [candidates, positionFilter, ratingFilter, search, statusFilter]);

  const groupedEntries = useMemo(() => {
    const grouped = filteredCandidates.reduce((acc, item) => {
      const key = getJobKey(item);
      if (!acc[key]) {
        acc[key] = {
          key,
          job_opening_id: item.job_opening_id || item.position_id || null,
          job_title: item.job_title || "Lainnya",
          items: [],
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => {
      const avgA =
        a.items.reduce((sum, item) => sum + getRatingNumber(item.rating), 0) /
        a.items.length;
      const avgB =
        b.items.reduce((sum, item) => sum + getRatingNumber(item.rating), 0) /
        b.items.length;
      return avgB - avgA;
    });
  }, [filteredCandidates]);

  const hiredCandidateWarnings = useMemo(
    () =>
      filteredCandidates
        .filter(isPendingRecruitmentWarningCandidate)
        .map((item) => {
          const hiredInfo = findHiredCandidateInfo(hiredCandidateLookup, item);
          if (!hiredInfo) return null;

          return {
            ...hiredInfo,
            candidateName:
              item.candidate_name ||
              item.name ||
              hiredInfo.candidate_name ||
              hiredInfo.name,
          };
        })
        .filter(Boolean),
    [filteredCandidates, hiredCandidateLookup],
  );

  const summary = useMemo(() => {
    const total = candidates.length;
    const unpublishedJobs = new Set(
      candidates.map((item) => getJobKey(item)).filter(Boolean),
    ).size;
    const good = candidates.filter((item) => {
      const ratingNumber = getRatingNumber(item.rating);
      return (
        ratingNumber >= 4 ||
        item.recommendation === "hire" ||
        item.result === "passed"
      );
    }).length;
    const top = candidates.filter(
      (item) => getRatingNumber(item.rating) >= 5,
    ).length;
    const averageRating = total
      ? (
          candidates.reduce(
            (sum, item) => sum + getRatingNumber(item.rating),
            0,
          ) / total
        ).toFixed(2)
      : "0.00";

    return { total, unpublishedJobs, good, top, averageRating };
  }, [candidates]);

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const setAllGroupsExpanded = (value) => {
    const next = {};
    groupedEntries.forEach((group) => {
      next[group.key] = value;
    });
    setExpandedGroups(next);
  };

  const setGroupPage = (groupKey, page) => {
    setGroupPages((prev) => ({ ...prev, [groupKey]: page }));
  };

  const resetFilters = () => {
    setSearch("");
    setPositionFilter("");
    setStatusFilter("");
    setRatingFilter("");
    setGroupPages({});
  };

  const completeJobOpening = async (jobOpeningId, jobTitle) => {
    if (!jobOpeningId) {
      setError("ID lowongan tidak ditemukan!");
      return;
    }

    setError("");
    setSuccessMessage("");
    setCompletingJobs((prev) => ({ ...prev, [jobOpeningId]: true }));
    try {
      await axios.post(
        `/api/hr/job-openings/${jobOpeningId}/publish-interviews`,
      );

      setSuccessMessage(
        `Lowongan ${jobTitle || ""} berhasil diselesaikan dan hasil interview dipublish.`,
      );
      setCompletionConfirm(null);

      setCandidates((prev) =>
        (prev || []).filter(
          (item) =>
            String(item.job_opening_id || item.position_id || item.id) !==
            String(jobOpeningId),
        ),
      );

      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new Event("interviewsPublished"));
      }

      await fetchCandidates();
    } catch (err) {
      setError(
        "Gagal menyelesaikan lowongan: " +
          (err?.response?.data?.message || err?.message || JSON.stringify(err)),
      );
    } finally {
      setCompletingJobs((prev) => ({ ...prev, [jobOpeningId]: false }));
    }
  };

  const markEvaluatedCandidateNotPassed = async (candidate, hiredInfo) => {
    if (!candidate || !hiredInfo) return;

    const interviewId = candidate.id || candidate.interview_id;
    if (!interviewId) {
      setError("ID interview tidak ditemukan.");
      return;
    }

    const notes = `Tidak lolos karena kandidat sudah lolos pada lowongan ${
      hiredInfo.hiredJobLabel || "-"
    }.`;

    setError("");
    setSuccessMessage("");

    try {
      await axios.put(`/api/admin/interviews/${interviewId}/result`, {
        interviewer_notes: notes,
        recommendation: "reject",
        result: "failed",
        status: "completed",
      });

      setCandidates((prev) =>
        prev.map((item) =>
          String(item.id || item.interview_id) === String(interviewId)
            ? {
                ...item,
                recommendation: "reject",
                result: "failed",
                interviewer_notes: notes,
                display_interviewer_notes: notes,
              }
            : item,
        ),
      );
      setSuccessMessage(
        `Kandidat ${candidate.candidate_name || candidate.name || ""} dijadikan tidak lolos karena sudah lolos di ${hiredInfo.hiredJobLabel || "-"}.`,
      );
    } catch (err) {
      setError(
        "Gagal menjadikan kandidat tidak lolos: " +
          (err?.response?.data?.message || err?.message || JSON.stringify(err)),
      );
    }
  };

  const getRecommendationBadgeClass = (recommendation) => {
    if (recommendation === "hire")
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60";
    if (recommendation === "consider")
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60";
    if (recommendation === "reject")
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60";
    return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  };

  const getResultBadgeClass = (result) => {
    if (result === "passed")
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60";
    if (result === "failed")
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/60";
    if (result === "no_show")
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60";
    return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  };

  const summaryCards = [
    {
      label: "Lowongan Belum Dipublish",
      value: summary.unpublishedJobs,
      description: "Lowongan yang masih menunggu finalisasi hasil interview",
      icon: BriefcaseBusiness,
      active: false,
    },
    {
      label: "Layak Dipertimbangkan",
      value: summary.good,
      description: "Rating bagus atau direkomendasikan lolos",
      icon: UserCheck,
      active: false,
    },
    {
      label: "Nilai Sempurna",
      value: summary.top,
      description: "Kandidat dengan nilai 100",
      icon: Trophy,
      active: false,
    },
    {
      label: "Nilai Rata-rata",
      value: summary.averageRating,
      description: "Nilai rata-rata seluruh kandidat",
      icon: Star,
      active: false,
    },
  ];

  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative min-h-[126px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-1 py-2 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-2">
          <FinalReviewHeroIllustration />
          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
              <ClipboardCheck className="h-4 w-4" />
              Final Review Kandidat
            </div>
            <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
              Tentukan Kandidat Terbaik
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              Bandingkan hasil wawancara kandidat per lowongan, cek rating dan
              rekomendasi, lalu selesaikan lowongan saat semua data sudah final.
            </p>
          </div>
        </div>

        {/* Beginner guide */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {[
            {
              step: "1",
              title: "Pilih Lowongan",
              text: "Buka grup lowongan yang ingin dibandingkan.",
            },
            {
              step: "2",
              title: "Cek Nilai Kandidat",
              text: "Lihat rating, rekomendasi, hasil, dan catatan interviewer.",
            },
            {
              step: "3",
              title: "Selesaikan",
              text: "Klik Selesaikan jika kandidat sudah final untuk dipublish.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 dark:border-orange-900/50 dark:bg-orange-950/20"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-extrabold text-white">
                  {item.step}
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-slate-50">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {item.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-slate-50">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                Review per Lowongan
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Gunakan filter agar lebih mudah mencari kandidat atau lowongan
                tertentu.
              </p>
            </div>
            {!loading && !error && filteredCandidates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn rounded-xl !border-none !bg-orange-500 !text-white shadow-sm hover:!bg-orange-600"
                  onClick={() => setAllGroupsExpanded(true)}
                >
                  <ChevronDown className="h-4 w-4" />
                  Buka Semua
                </button>
                <button
                  type="button"
                  className="btn rounded-xl !border-none !bg-orange-500 !text-white shadow-sm hover:!bg-orange-600"
                  onClick={() => setAllGroupsExpanded(false)}
                >
                  <ChevronUp className="h-4 w-4" />
                  Tutup Semua
                </button>
              </div>
            )}
          </div>

          {/* Filter */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
              <Filter className="h-4 w-4 text-orange-500" />
              Filter Lowongan
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <label className="input input-bordered flex w-full items-center gap-2 rounded-xl bg-white text-slate-900 lg:col-span-4 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan judul lowongan..."
                  className="grow bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
              >
                <option value="">Semua Posisi</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="completed">Selesai</option>
                <option value="canceled_by_company">
                  Dibatalkan Perusahaan
                </option>
              </select>

              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="">Semua Kandidat</option>
                <option value="good">Rating Bagus</option>
                <option value="top">Rating 5</option>
              </select>

              <button
                type="button"
                className="btn rounded-xl !border-none !bg-emerald-500 !text-white shadow-sm hover:!bg-emerald-600 lg:col-span-1"
                onClick={resetFilters}
                title="Reset filter"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <span className="loading loading-spinner loading-lg text-orange-500" />
              <p className="mt-3 text-sm font-medium">
                Memuat data kandidat...
              </p>
            </div>
          )}

          {!loading && successMessage && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                <p className="text-sm font-semibold">{successMessage}</p>
              </div>
            </div>
          )}

          {!loading && !error && hiredCandidateWarnings.length > 0 && (
            <HiredCandidateWarning
              items={hiredCandidateWarnings}
              title="Kandidat ini sudah lolos"
              description="Ada kandidat pada daftar final review yang sudah tercatat lolos pada lowongan lain. Gunakan aksi Jadikan Tidak Lolos agar hasilnya tidak dipublish sebagai lolos lagi."
            />
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

          {/* Empty */}
          {!loading && !error && filteredCandidates.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <ListChecks className="h-7 w-7" />
              </div>
              <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">
                Belum ada data kandidat.
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Tidak ada kandidat yang sesuai filter atau belum ada interview
                yang dinilai.
              </p>
            </div>
          )}

          {/* Group list */}
          {!loading && !error && filteredCandidates.length > 0 && (
            <div className="space-y-5">
              {groupedEntries.map((group) => {
                const isExpanded = Boolean(expandedGroups[group.key]);

                const recWeight = (value) =>
                  value === "hire"
                    ? 3
                    : value === "consider"
                      ? 2
                      : value === "reject"
                        ? 1
                        : 0;
                const resultWeight = (value) =>
                  value === "passed"
                    ? 3
                    : value === "pending"
                      ? 2
                      : value === "failed"
                        ? 1
                        : 0;

                const sortedItems = (group.items || []).slice().sort((a, b) => {
                  const ra = getRatingNumber(a.rating);
                  const rb = getRatingNumber(b.rating);
                  const nameA = String(a.candidate_name || "").toLowerCase();
                  const nameB = String(b.candidate_name || "").toLowerCase();
                  const da = new Date(a.scheduled_date || 0).getTime();
                  const db = new Date(b.scheduled_date || 0).getTime();

                  if (candidateSort === "rating_asc") {
                    if (ra !== rb) return ra - rb;
                    return nameA.localeCompare(nameB);
                  }

                  if (candidateSort === "name_asc")
                    return nameA.localeCompare(nameB);
                  if (candidateSort === "name_desc")
                    return nameB.localeCompare(nameA);
                  if (candidateSort === "date_desc") return db - da;
                  if (candidateSort === "date_asc") return da - db;

                  if (rb !== ra) return rb - ra;
                  const recommendationDiff =
                    recWeight(b.recommendation) - recWeight(a.recommendation);
                  if (recommendationDiff !== 0) return recommendationDiff;
                  const resultDiff =
                    resultWeight(b.result) - resultWeight(a.result);
                  if (resultDiff !== 0) return resultDiff;
                  return db - da;
                });

                const avgRating = (
                  sortedItems.reduce(
                    (sum, item) => sum + getRatingNumber(item.rating),
                    0,
                  ) / (sortedItems.length || 1) || 0
                ).toFixed(2);

                const metrics = {
                  total: group.items.length,
                  rated: group.items.filter(
                    (item) =>
                      item.status === "completed" &&
                      (getRatingNumber(item.rating) > 0 ||
                        item.recommendation ||
                        item.result),
                  ).length,
                  allReevaluated:
                    group.items.length > 0 &&
                    group.items.every(
                      (item) =>
                        item.status === "completed" &&
                        item.result !== "pending" &&
                        (getRatingNumber(item.rating) > 0 ||
                          item.recommendation),
                    ),
                };

                const firstItem = sortedItems[0];
                const displayItems = showTop3Only
                  ? sortedItems.slice(0, 3)
                  : sortedItems;
                const totalCandidatePages = Math.max(
                  1,
                  Math.ceil(displayItems.length / ITEMS_PER_PAGE),
                );
                const candidatePage = Math.min(
                  Math.max(1, Number(groupPages[group.key]) || 1),
                  totalCandidatePages,
                );
                const paginatedDisplayItems = displayItems.slice(
                  (candidatePage - 1) * ITEMS_PER_PAGE,
                  candidatePage * ITEMS_PER_PAGE,
                );

                return (
                  <div
                    key={group.key}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-950"
                  >
                    <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-5 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300">
                              <BriefcaseBusiness className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="truncate text-lg font-extrabold text-slate-900 dark:text-slate-50">
                                {group.job_title}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Review kandidat pada lowongan ini.
                              </p>
                            </div>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                metrics.allReevaluated
                                  ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                              }`}
                            >
                              {metrics.allReevaluated
                                ? "Siap Final"
                                : "Belum Final"}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                            <div className="rounded-2xl bg-white px-3 py-2 text-slate-600 shadow-sm dark:bg-slate-950 dark:text-slate-300">
                              <span className="font-bold text-orange-600 dark:text-orange-300">
                                {group.items.length}
                              </span>{" "}
                              kandidat
                            </div>
                            <div className="rounded-2xl bg-white px-3 py-2 text-slate-600 shadow-sm dark:bg-slate-950 dark:text-slate-300">
                              Nilai rata-rata{" "}
                              <span className="font-bold text-orange-600 dark:text-orange-300">
                                {avgRating}
                              </span>
                            </div>
                            <div className="rounded-2xl bg-white px-3 py-2 text-slate-600 shadow-sm dark:bg-slate-950 dark:text-slate-300">
                              Dinilai{" "}
                              <span className="font-bold text-orange-600 dark:text-orange-300">
                                {metrics.rated}/{metrics.total}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn rounded-xl !border-none !bg-orange-500 !text-white shadow-sm hover:!bg-orange-600"
                            onClick={() => toggleGroup(group.key)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            {isExpanded ? "Tutup" : "Buka"}
                          </button>

                          <button
                            type="button"
                            className={`btn rounded-xl shadow-sm ${
                              showTop3Only
                                ? "!border-none !bg-orange-500 !text-white hover:!bg-orange-600"
                                : "!border-none !bg-amber-500 !text-white hover:!bg-amber-600"
                            }`}
                            onClick={() => setShowTop3Only((s) => !s)}
                          >
                            <Sparkles className="h-4 w-4" />
                            {showTop3Only ? "Semua" : "Top 3"}
                          </button>

                          <button
                            type="button"
                            className="btn rounded-xl !border-none !bg-sky-600 !text-white shadow-sm hover:!bg-sky-700"
                            onClick={() =>
                              navigate("/app/DetailInterview-process", {
                                state: {
                                  job: {
                                    id:
                                      firstItem?.position_id ||
                                      firstItem?.job_opening_id,
                                    title: group.job_title,
                                  },
                                },
                              })
                            }
                          >
                            <Eye className="h-4 w-4" />
                            Lowongan
                          </button>

                          <button
                            type="button"
                            className="btn rounded-xl !border-none !bg-emerald-500 !text-white shadow-md hover:!bg-emerald-600 disabled:!bg-slate-300 disabled:!text-slate-500"
                            disabled={
                              !metrics.allReevaluated ||
                              completingJobs[group.job_opening_id]
                            }
                            onClick={() => {
                              setError("");
                              setSuccessMessage("");
                              setCompletionConfirm({
                                jobOpeningId: group.job_opening_id,
                                jobTitle: group.job_title,
                                candidateCount: group.items.length,
                              });
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {completingJobs[group.job_opening_id]
                              ? "Memproses..."
                              : "Selesaikan"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 sm:p-5">
                        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/60 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                              Tabel Ranking Kandidat
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Data bisa diurutkan dari nilai tertinggi ke
                              terendah, nilai terendah ke tertinggi, nama, atau
                              tanggal interview.
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <select
                              className="select select-bordered select-sm rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                              value={candidateSort}
                              onChange={(event) =>
                                setCandidateSort(event.target.value)
                              }
                            >
                              <option value="rating_desc">
                                Nilai Tertinggi
                              </option>
                              <option value="rating_asc">Nilai Terendah</option>
                              <option value="name_asc">Nama A-Z</option>
                              <option value="name_desc">Nama Z-A</option>
                              <option value="date_desc">Tanggal Terbaru</option>
                              <option value="date_asc">Tanggal Terlama</option>
                            </select>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
                          <table className="table table-zebra w-full min-w-[980px]">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                              <tr>
                                <th className="w-24">Peringkat</th>
                                <th>Kandidat</th>
                                <th className="text-center">Nilai</th>
                                <th>Keterangan Nilai</th>
                                <th>Rekomendasi</th>
                                <th>Hasil</th>
                                <th>Interviewer</th>
                                <th>Tanggal</th>
                                <th className="text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedDisplayItems.map((item, index) => {
                                const globalIndex =
                                  (candidatePage - 1) * ITEMS_PER_PAGE + index;
                                const ratingNumber = getRatingNumber(
                                  item.rating,
                                );
                                const hiredInfo = findHiredCandidateInfo(
                                  hiredCandidateLookup,
                                  item,
                                );
                                const rankLabel =
                                  globalIndex === 0
                                    ? "🥇 1"
                                    : globalIndex === 1
                                      ? "🥈 2"
                                      : globalIndex === 2
                                        ? "🥉 3"
                                        : `#${globalIndex + 1}`;

                                return (
                                  <tr
                                    key={
                                      item.id ||
                                      `${item.candidate_name}-${globalIndex}`
                                    }
                                    className={
                                      ratingNumber >= 4 ||
                                      item.recommendation === "hire" ||
                                      item.result === "passed"
                                        ? "bg-emerald-50/50 dark:bg-emerald-950/10"
                                        : ""
                                    }
                                  >
                                    <td>
                                      <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                                        {rankLabel}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="font-extrabold text-slate-900 dark:text-slate-50">
                                        {item.candidate_name || "-"}
                                      </div>
                                      {hiredInfo && (
                                        <div className="mt-2 flex max-w-[320px] items-start gap-2 rounded-2xl border border-emerald-300 bg-red-50 px-3 py-2 texts-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                          <div>
                                            <p className="text-xs font-extrabold">
                                              Kandidat sudah lolos
                                            </p>
                                            <p className="text-[11px] font-semibold">
                                              Lowongan:{" "}
                                              {hiredInfo.hiredJobLabel || "-"}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                      <p className="mt-1 max-w-[260px] truncate text-xs text-slate-500 dark:text-slate-400">
                                        {item.display_interviewer_notes ||
                                          "Tidak ada catatan"}
                                      </p>
                                    </td>
                                    <td className="text-center">
                                      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-orange-500 px-3 text-sm font-extrabold text-white shadow-sm">
                                        {ratingNumber || "-"}
                                      </span>
                                    </td>
                                    <td className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                      {ratingLabelMap[ratingNumber] || "-"}
                                    </td>
                                    <td>
                                      <span
                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getRecommendationBadgeClass(
                                          item.recommendation,
                                        )}`}
                                      >
                                        {recommendationLabelMap[
                                          item.recommendation
                                        ] ||
                                          item.recommendation ||
                                          "-"}
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getResultBadgeClass(
                                          item.result,
                                        )}`}
                                      >
                                        {resultLabelMap[item.result] ||
                                          item.result ||
                                          "-"}
                                      </span>
                                    </td>
                                    <td className="text-sm text-slate-600 dark:text-slate-300">
                                      {item.interviewer_name || "-"}
                                    </td>
                                    <td className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                      {formatDate(item.scheduled_date)}
                                    </td>
                                    <td className="text-right">
                                      {hiredInfo ? (
                                        <button
                                          type="button"
                                          className="inline-flex w-full max-w-[220px] items-start gap-2 rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-left text-red-700 shadow-sm hover:bg-red-100 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950/70 sm:w-[220px]"
                                          onClick={() =>
                                            markEvaluatedCandidateNotPassed(
                                              item,
                                              hiredInfo,
                                            )
                                          }
                                        >
                                          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                          <span className="min-w-0">
                                            <p className="text-sm font-bold text-red-700">
                                              Jadikan Tidak Lolos
                                            </p>
                                          </span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          className="btn btn-sm rounded-xl !border-none !bg-orange-500 !text-white shadow-sm hover:!bg-orange-600"
                                          onClick={() => {
                                            setSelectedCandidate(item);
                                            setIsDetailOpen(true);
                                          }}
                                        >
                                          <Eye className="h-4 w-4" />
                                          Detail
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <Pagination
                          page={candidatePage}
                          totalPages={totalCandidatePages}
                          onChangePage={(page) => setGroupPage(group.key, page)}
                          itemsPerPage={ITEMS_PER_PAGE}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <HRInterviewDetailLowongan
          isFormOpen={false}
          isCancelOpen={false}
          isDetailOpen={isDetailOpen}
          onCloseForm={() => setIsDetailOpen(false)}
          onCloseCancel={() => setIsDetailOpen(false)}
          selectedCandidate={selectedCandidate}
          readOnly={false}
          allowEditingWhenClosed={true}
        />

        {completionConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-200 bg-gradient-to-r from-orange-50 via-white to-emerald-50 px-5 py-4 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
                      Selesaikan Lowongan?
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Hasil interview akan dipublish dan lowongan ini masuk ke
                      proses akhir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Lowongan
                  </p>
                  <p className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-50">
                    {completionConfirm.jobTitle || "-"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {completionConfirm.candidateCount || 0} kandidat akan
                    difinalisasi.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="btn rounded-xl !border-none !bg-slate-200 !text-slate-700 hover:!bg-slate-300 dark:!bg-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-600"
                    onClick={() => setCompletionConfirm(null)}
                    disabled={completingJobs[completionConfirm.jobOpeningId]}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className={`btn rounded-xl !border-none !bg-emerald-500 !text-white shadow-md hover:!bg-emerald-600 ${
                      completingJobs[completionConfirm.jobOpeningId]
                        ? "loading"
                        : ""
                    }`}
                    onClick={() =>
                      completeJobOpening(
                        completionConfirm.jobOpeningId,
                        completionConfirm.jobTitle,
                      )
                    }
                    disabled={completingJobs[completionConfirm.jobOpeningId]}
                  >
                    Selesaikan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HREvaluatedCandidates;
