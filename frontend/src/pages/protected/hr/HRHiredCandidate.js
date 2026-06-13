import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/Pagination/Pagination";
import useTablePagination from "../../../hooks/useTablePagination";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileCheck2,
  MailCheck,
  RotateCcw,
  Search,
  Send,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

import { setPageTitle } from "../../../features/common/headerSlice";

const formatInterviewDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getCandidateId = (candidate) => candidate?.candidate_id || candidate?.id || candidate?._id;

const getCandidatePhoto = (candidate) => {
  const photo = candidate?.photo_file || "";

  if (photo && photo !== "-" && photo !== "null") {
    return photo.startsWith("http")
      ? photo
      : `http://localhost:5000/${photo.replace(/^\//, "")}`;
  }

  const name = candidate?.name || "Kandidat";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F97316&color=fff`;
};

const getPositionLabel = (candidate) => {
  if (candidate?.base_position && String(candidate.base_position).trim() !== "") {
    return `${candidate.position_name || "-"} - ${candidate.base_position}`;
  }

  return candidate?.position_name || candidate?.job_title || "-";
};

const getOnboardingBadge = (status) => {
  if (status === "Belum dibuat") {
    return {
      label: "Belum dibuat",
      className:
        "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
      icon: FileCheck2,
    };
  }

  if (status === "sent") {
    return {
      label: "Undangan Dikirim",
      className:
        "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
      icon: Send,
    };
  }

  return {
    label: status || "-",
    className:
      "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300",
    icon: ClipboardCheck,
  };
};

const HiredHeroIllustration = () => (
  <div className="pointer-events-none absolute right-10 top-2 hidden h-32 w-80 lg:block">
    <div className="absolute bottom-2 right-0 h-20 w-72 rounded-full bg-orange-100/80 blur-[1px] dark:bg-orange-900/30" />
    <div className="absolute right-36 top-1 h-24 w-20 rotate-[-3deg] rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 border-b border-orange-100 px-2 py-2 dark:border-slate-700">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/40 dark:text-orange-300">
          <UserCheck className="h-4 w-4" />
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

const HRHiredCandidate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState({});

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("/api/interviews?status=passed");
      const candidatesData = Array.isArray(res.data) ? res.data : [];
      setCandidates(candidatesData);

      const statusObj = {};
      await Promise.all(
        candidatesData.map(async (candidate) => {
          const candidateId = getCandidateId(candidate);
          if (!candidateId) return;

          try {
            const resp = await axios.get(`/api/candidate-calls/${candidateId}`);
            statusObj[candidateId] = resp.data.status || "Belum dibuat";
          } catch (e) {
            statusObj[candidateId] = "Belum dibuat";
          }
        }),
      );

      setOnboardingStatus(statusObj);
    } catch (err) {
      setError("Gagal memuat data kandidat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: "Daftar Kandidat Yang Lolos" }));
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const summary = useMemo(() => {
    const total = candidates.length;
    const sent = candidates.filter((candidate) => onboardingStatus[getCandidateId(candidate)] === "sent").length;
    const accepted = candidates.filter((candidate) => onboardingStatus[getCandidateId(candidate)] === "accepted").length;
    const notCreated = candidates.filter((candidate) => {
      const status = onboardingStatus[getCandidateId(candidate)] || "Belum dibuat";
      return status === "Belum dibuat";
    }).length;

    return { total, sent, accepted, notCreated };
  }, [candidates, onboardingStatus]);

  const filteredCandidates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const candidateId = getCandidateId(candidate);
      const currentStatus = onboardingStatus[candidateId] || "Belum dibuat";
      const name = String(candidate?.name || "").toLowerCase();
      const position = getPositionLabel(candidate).toLowerCase();

      if (keyword && !`${name} ${position}`.includes(keyword)) return false;
      if (statusFilter && currentStatus !== statusFilter) return false;

      return true;
    });
  }, [candidates, onboardingStatus, search, statusFilter]);
  const candidatesPagination = useTablePagination(filteredCandidates);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  const summaryCards = [
    {
      label: "Total Kandidat Lolos",
      value: summary.total,
      description: "Kandidat yang sudah dinyatakan lolos interview",
      icon: Users,
      className:
        "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-200",
    },
    {
      label: "Belum Dibuat Surat",
      value: summary.notCreated,
      description: "Perlu dibuat undangan onboarding",
      icon: FileCheck2,
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",
    },
    {
      label: "Undangan Dikirim",
      value: summary.sent,
      description: "Menunggu respons kandidat",
      icon: MailCheck,
      className:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200",
    },
  ];

  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative min-h-[120px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-1 py-2 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-2">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
              <UserCheck className="h-4 w-4" />
              Onboarding Kandidat
            </div>
            <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
              Daftar Kandidat yang Lolos
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              Kelola kandidat yang sudah lolos seleksi, cek status surat undangan,
              dan buka detail untuk mengirim panggilan onboarding.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.className}`}
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-orange-600 shadow-sm dark:bg-slate-900/70 dark:text-orange-300">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
                Kandidat Siap Onboarding
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Gunakan pencarian dan filter status agar lebih mudah menemukan kandidat.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchCandidates}
              className="btn w-fit rounded-xl border border-orange-200 bg-orange-50 text-orange-600 shadow-sm hover:border-orange-500 hover:bg-orange-500 hover:text-white dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300"
            >
              <RotateCcw className="h-4 w-4" />
              Muat Ulang
            </button>
          </div>

          {/* Filter */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <label className="input input-bordered flex w-full items-center gap-2 rounded-xl bg-white text-slate-900 lg:col-span-6 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari nama kandidat atau posisi..."
                  className="grow bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <select
                className="select select-bordered w-full rounded-xl bg-white text-slate-900 lg:col-span-4 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Semua Status Surat</option>
                <option value="Belum dibuat">Belum dibuat</option>
                <option value="sent">Undangan Dikirim</option>
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
              <p className="mt-3 text-sm font-medium">Memuat data kandidat...</p>
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

          {/* Empty */}
          {!loading && !error && filteredCandidates.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center dark:border-slate-700">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <Users className="h-7 w-7" />
              </div>
              <p className="mt-3 font-bold text-slate-700 dark:text-slate-200">
                Tidak ada kandidat yang sesuai.
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Coba ubah kata kunci atau reset filter pencarian.
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && filteredCandidates.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="w-16 text-center">No</th>
                      <th>Kandidat</th>
                      <th>Posisi</th>
                      <th>Tanggal Interview</th>
                      <th>Status Surat</th>
                      <th className="text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidatesPagination.paginatedItems.map((candidate, index) => {
                      const candidateId = getCandidateId(candidate);
                      const status = onboardingStatus[candidateId] || "Belum dibuat";
                      const badge = getOnboardingBadge(status);
                      const BadgeIcon = badge.icon;

                      return (
                        <tr
                          key={candidateId || candidate?._id || index}
                          className="hover:bg-orange-50/40 dark:hover:bg-slate-800/60"
                        >
                          <td className="text-center font-semibold text-slate-500 dark:text-slate-400">
                            {candidatesPagination.startIndex + index + 1}
                          </td>

                          <td>
                            <div className="flex items-center gap-3">
                              <img
                                src={getCandidatePhoto(candidate)}
                                alt={candidate?.name || "Kandidat"}
                                className="h-11 w-11 rounded-2xl border border-slate-200 object-cover shadow-sm dark:border-slate-700"
                              />
                              <div>
                                <p className="font-extrabold text-slate-900 dark:text-slate-50">
                                  {candidate?.name || "-"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  ID: {candidateId || "-"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td>
                            <p className="max-w-[280px] text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {getPositionLabel(candidate)}
                            </p>
                          </td>

                          <td>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <CalendarDays className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                              {formatInterviewDate(candidate?.scheduled_date)}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.className}`}
                            >
                              <BadgeIcon className="h-3.5 w-3.5" />
                              {badge.label}
                            </span>
                          </td>

                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm rounded-xl border-none !bg-orange-500 !text-white shadow-md hover:!bg-white hover:!text-orange-500 hover:ring-1 hover:ring-orange-500"
                              onClick={() =>
                                navigate(`/app/Hire-candidates/${candidate?.id || candidate?._id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                              Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-4">
                <Pagination page={candidatesPagination.page} totalPages={candidatesPagination.totalPages} onChangePage={candidatesPagination.setPage} itemsPerPage={candidatesPagination.itemsPerPage} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRHiredCandidate;
