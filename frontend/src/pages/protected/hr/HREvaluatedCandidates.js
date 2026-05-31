import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NotificationManager } from "react-notifications";

import TitleCard from "../../../components/Cards/TitleCard";
import { setPageTitle } from "../../../features/common/headerSlice";
import HRInterviewDetailLowongan from "./HRInterviewNilai";

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

const HREvaluatedCandidates = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
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
  const [showTop3Only, setShowTop3Only] = useState(false);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Final Review" }));
  }, [dispatch]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/hr/interviews/history-combined", {
        params: { include_active: true },
      });
      const history = Array.isArray(res.data?.history) ? res.data.history : [];

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
          interviewer_notes: item.interviewer_notes || "",
        }))
        .filter((item) => item.status === "completed")
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

  const filteredCandidates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return candidates.filter((item) => {
      const candidateName = (item.candidate_name || "").toLowerCase();
      const jobTitle = (item.job_title || "").toLowerCase();
      const recommendation = (item.recommendation || "").toLowerCase();
      const result = (item.result || "").toLowerCase();
      const ratingNumber = getRatingNumber(item.rating);
      const goodCandidate =
        ratingNumber >= 4 || recommendation === "hire" || result === "passed";

      if (keyword) {
        const searchable = [
          candidateName,
          jobTitle,
          recommendation,
          result,
        ].join(" ");
        if (!searchable.includes(keyword)) return false;
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

  const summary = useMemo(() => {
    const total = candidates.length;
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

    return { total, good, top, averageRating };
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

  const completeJobOpening = async (jobOpeningId, jobTitle) => {
    if (!jobOpeningId) {
      alert("ID lowongan tidak ditemukan!");
      return;
    }

    if (!window.confirm(`Yakin ingin menyelesaikan lowongan ${jobTitle}?`)) {
      return;
    }

    setCompletingJobs((prev) => ({ ...prev, [jobOpeningId]: true }));
    try {
      // Mark job_openings as complete (backend expected to publish results)
      await axios.put(`/api/job-openings/${jobOpeningId}/complete`);

      // Try calling explicit publish endpoint if backend exposes it.
      // This is a no-op if the endpoint does not exist or fails.
      let publishSucceeded = false;
      try {
        await axios.post(
          `/api/job-openings/${jobOpeningId}/publish-interviews`,
        );
        publishSucceeded = true;
      } catch (e) {
        publishSucceeded = false;
        if (NotificationManager)
          NotificationManager.info(
            "Publish endpoint not available; attempting per-application updates.",
            "Info",
            4000,
          );
        else
          console.info(
            "Publish endpoint not available; attempting per-application updates.",
          );
      }

      alert("Lowongan berhasil diselesaikan dan hasil interview dipublish.");

      // Optimistic UI update: mark job as completed locally in candidate list
      setCandidates((prev) =>
        (prev || []).map((it) =>
          (it.job_opening_id || it.position_id || it.id) === jobOpeningId
            ? { ...it, status: "completed" }
            : it,
        ),
      );

      // Notify other parts of the app to refresh (e.g., candidate view)
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new Event("interviewsPublished"));
      }

      // Refresh local data
      try {
        await fetchCandidates();
      } catch (e) {
        // ignore
      }

      // If publish endpoint wasn't available, fallback: update application statuses per-interview
      if (!publishSucceeded) {
        try {
          const publishErrors = [];
          let successCount = 0;
          const interviewsForJob = (candidates || []).filter(
            (it) =>
              (it.job_opening_id || it.position_id || it.id) === jobOpeningId,
          );
          for (const it of interviewsForJob) {
            const appId = it.application_id;
            if (!appId) continue;
            let appStatus = "";
            if (it.recommendation === "hire" && it.result === "passed") {
              appStatus = "diterima";
            } else if (
              it.recommendation === "reject" &&
              it.result === "failed"
            ) {
              appStatus = "ditolak";
            } else {
              continue;
            }
            try {
              const res = await axios.put(
                `/api/hr/applications/${appId}/status`,
                { status: appStatus },
              );
              successCount++;
              if (NotificationManager)
                NotificationManager.success(
                  `Status aplikasi ${appId} diupdate ke ${appStatus}`,
                  "Sukses",
                  3000,
                );
              else
                console.log(
                  `Updated application ${appId} => ${appStatus}`,
                  res.data,
                );
            } catch (err) {
              publishErrors.push({ appId, err });
              console.error(`Failed update application ${appId}`, err);
              if (NotificationManager)
                NotificationManager.error(
                  `Gagal update status aplikasi ${appId}: ${err?.response?.data?.message || err?.message || JSON.stringify(err)}`,
                  "Publish Error",
                  6000,
                );
            }
          }
          if (successCount > 0) {
            if (NotificationManager)
              NotificationManager.info(
                `${successCount} aplikasi berhasil dipublish.`,
                "Info",
                4000,
              );
            else console.info(`${successCount} aplikasi berhasil dipublish.`);
          }
          if (publishErrors.length > 0) {
            console.warn(
              "Some application status updates failed:",
              publishErrors,
            );
            if (NotificationManager)
              NotificationManager.error(
                "Beberapa update status aplikasi gagal. Cek console/network untuk detail.",
                "Error",
                8000,
              );
          }
        } catch (err) {
          console.error("Fallback publish failed", err);
          if (NotificationManager)
            NotificationManager.error(
              `Fallback publish failed: ${err?.message || JSON.stringify(err)}`,
              "Error",
              8000,
            );
        }
      }
    } catch (err) {
      alert(
        "Gagal menyelesaikan lowongan: " +
          (err?.response?.data?.message || err?.message || JSON.stringify(err)),
      );
    } finally {
      setCompletingJobs((prev) => ({ ...prev, [jobOpeningId]: false }));
    }
  };

  const getRecommendationBadge = (recommendation) => {
    if (recommendation === "hire") return "badge badge-success";
    if (recommendation === "consider") return "badge badge-warning";
    if (recommendation === "reject") return "badge badge-error";
    return "badge badge-ghost";
  };

  const getResultBadge = (result) => {
    if (result === "passed") return "badge badge-success";
    if (result === "failed") return "badge badge-error";
    if (result === "no_show") return "badge badge-warning";
    if (result === "pending") return "badge badge-ghost";
    return "badge badge-outline";
  };

  return (
    <TitleCard
      title="Final Review Kandidat"
      subtitle="Bandingkan hasil wawancara kandidat per lowongan sebelum menentukan kandidat yang lolos."
    >
      <div className="space-y-5">
        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Dinilai", value: summary.total },
            { label: "Layak Dipertimbangkan", value: summary.good },
            { label: "Nilai Sempurna", value: summary.top },
            { label: "Rata-rata Rating", value: summary.averageRating },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-primary">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* FILTER */}
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Cari Kandidat
                </span>
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-bordered input-sm w-full"
                placeholder="Nama, posisi, rekomendasi..."
              />
            </div>

            <div>
              <label className="label py-1">
                <span className="label-text text-xs font-semibold">Posisi</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
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
            </div>

            <div>
              <label className="label py-1">
                <span className="label-text text-xs font-semibold">Status</span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="completed">Selesai</option>
                <option value="canceled_by_company">
                  Dibatalkan Perusahaan
                </option>
              </select>
            </div>

            <div>
              <label className="label py-1">
                <span className="label-text text-xs font-semibold">
                  Sorotan
                </span>
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="">Semua Kandidat</option>
                <option value="good">Rating Bagus</option>
                <option value="top">Rating 5</option>
              </select>
            </div>
          </div>
        </div>

        {/* ACTION GROUP */}
        {!loading && !error && filteredCandidates.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-base-content">
                Review per Lowongan
              </p>
              <p className="text-xs text-base-content/60">
                Buka grup lowongan untuk melihat kandidat yang sudah dinilai.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-outline btn-sm rounded-xl"
                onClick={() => setAllGroupsExpanded(true)}
              >
                Buka Semua
              </button>
              <button
                className="btn btn-outline btn-sm rounded-xl"
                onClick={() => setAllGroupsExpanded(false)}
              >
                Tutup Semua
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-base-300 bg-base-100">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="mt-3 text-sm font-semibold">
              Memuat data kandidat...
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="alert alert-error rounded-2xl">
            <span>{error}</span>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredCandidates.length === 0 && (
          <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 px-4 py-12 text-center shadow-sm">
            <p className="font-semibold">Belum ada data kandidat</p>
            <p className="mt-1 text-sm text-base-content/60">
              Tidak ada kandidat yang sesuai filter atau belum ada interview
              yang dinilai.
            </p>
          </div>
        )}

        {/* GROUP LIST */}
        {!loading && !error && filteredCandidates.length > 0 && (
          <div className="space-y-4">
            {groupedEntries.map((group) => {
              const isExpanded = Boolean(expandedGroups[group.key]);

              // sort items by rating, recommendation, result, date
              const sortedItems = (group.items || []).slice().sort((a, b) => {
                const ra = getRatingNumber(a.rating);
                const rb = getRatingNumber(b.rating);
                if (rb !== ra) return rb - ra;
                const recWeight = (r) =>
                  r === "hire"
                    ? 3
                    : r === "consider"
                      ? 2
                      : r === "reject"
                        ? 1
                        : 0;
                const raw =
                  recWeight(b.recommendation) - recWeight(a.recommendation);
                if (raw !== 0) return raw;
                const resWeight = (r) =>
                  r === "passed" ? 2 : r === "failed" ? 1 : 0;
                const resw = resWeight(b.result) - resWeight(a.result);
                if (resw !== 0) return resw;
                const da = new Date(a.scheduled_date || 0).getTime();
                const db = new Date(b.scheduled_date || 0).getTime();
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
                      (getRatingNumber(item.rating) > 0 || item.recommendation),
                  ),
              };

              const firstItem = sortedItems[0];

              const displayItems = showTop3Only
                ? sortedItems.slice(0, 3)
                : sortedItems;

              return (
                <div
                  key={group.key}
                  className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm"
                >
                  {/* GROUP HEADER */}
                  <div className="border-b border-base-300 bg-base-200/30 px-4 py-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-bold text-base-content">
                            {group.job_title}
                          </h3>

                          <span
                            className={`badge badge-sm ${
                              metrics.allReevaluated
                                ? "badge-success"
                                : "badge-warning"
                            }`}
                          >
                            {metrics.allReevaluated
                              ? "Siap Final"
                              : "Belum Final"}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-base-content/60">
                          <span className="rounded-lg bg-base-100 px-2 py-1 border border-base-300">
                            {group.items.length} kandidat
                          </span>
                          <span className="rounded-lg bg-base-100 px-2 py-1 border border-base-300">
                            Rating rata-rata {avgRating}
                          </span>
                          <span className="rounded-lg bg-base-100 px-2 py-1 border border-base-300">
                            Dinilai {metrics.rated}/{metrics.total}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn btn-outline btn-sm rounded-xl"
                          onClick={() => toggleGroup(group.key)}
                        >
                          {isExpanded ? "Tutup" : "Buka"}
                        </button>
                        <button
                            type="button"
                            className={
                              showTop3Only
                                ? "btn btn-primary btn-sm rounded-xl"
                                : "btn btn-outline btn-primary btn-sm rounded-xl"
                            }
                          onClick={() => setShowTop3Only((s) => !s)}
                        >
                          {showTop3Only ? "Tampilkan Semua" : "Tampilkan Top 3"}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm rounded-xl"
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
                          Lihat Lowongan
                        </button>

                        <button
                          className="btn btn-success btn-sm rounded-xl"
                          disabled={
                            !metrics.allReevaluated ||
                            completingJobs[group.job_opening_id]
                          }
                          onClick={() =>
                            completeJobOpening(
                              group.job_opening_id,
                              group.job_title,
                            )
                          }
                        >
                          {completingJobs[group.job_opening_id]
                            ? "Memproses..."
                            : "Selesaikan"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TABLE */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="table table-sm">
                        <thead className="bg-base-100 text-xs text-base-content/70">
                          <tr>
                            <th className="min-w-[180px]">Kandidat</th>
                            <th className="min-w-[110px]">Tanggal</th>
                            <th className="min-w-[120px]">Nilai</th>
                            <th className="min-w-[180px]">Rekomendasi</th>
                            <th className="min-w-[130px]">Hasil</th>
                            <th className="min-w-[220px]">Catatan</th>
                            <th className="min-w-[150px] text-right">Aksi</th>
                          </tr>
                        </thead>

                        <tbody>
                          {displayItems.map((item) => {
                            const ratingNumber = getRatingNumber(item.rating);

                            const isGood =
                              ratingNumber >= 4 ||
                              item.recommendation === "hire" ||
                              item.result === "passed";

                            return (
                              <tr
                                key={item.id}
                                className={isGood ? "bg-success/5" : ""}
                              >
                                <td>
                                  <div className="font-semibold text-base-content">
                                    {item.candidate_name}
                                  </div>
                                  <div className="text-xs text-base-content/50">
                                    {item.interviewer_name || "-"}
                                  </div>
                                </td>

                                <td className="whitespace-nowrap text-sm">
                                  {item.scheduled_date
                                    ? new Date(
                                        item.scheduled_date,
                                      ).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "-"}
                                </td>

                                <td>
                                  <div className="font-bold text-primary">
                                    {ratingNumber || "-"}
                                  </div>
                                  <div className="text-[11px] text-base-content/50">
                                    {ratingLabelMap[ratingNumber] || "-"}
                                  </div>
                                </td>

                                <td>
                                  <span
                                    className={`${getRecommendationBadge(
                                      item.recommendation,
                                    )} badge-sm`}
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
                                    className={`${getResultBadge(
                                      item.result,
                                    )} badge-sm`}
                                  >
                                    {resultLabelMap[item.result] ||
                                      item.result ||
                                      "-"}
                                  </span>
                                </td>

                                <td className="max-w-[240px]">
                                  <p className="line-clamp-2 text-xs text-base-content/60">
                                    {item.interviewer_notes || "-"}
                                  </p>
                                </td>

                                <td>
                                  <div className="flex justify-end gap-2">
                                    <button
                                      className="btn btn-warning btn-xs rounded-lg"
                                      onClick={() => {
                                        setSelectedCandidate(item);
                                        setIsDetailOpen(true);
                                      }}
                                    >
                                      Edit Nilai
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
      </div>
    </TitleCard>
  );
};

export default HREvaluatedCandidates;
