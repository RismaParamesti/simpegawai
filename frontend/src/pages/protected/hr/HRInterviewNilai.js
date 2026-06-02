import React, { useState, useEffect } from "react";
import axios from "axios";
import { NotificationManager } from "react-notifications";
import { createPortal } from "react-dom";
import {
  getRequiredDocuments,
  DOCUMENT_FIELD_METADATA,
} from "../../../utils/documentRequirements";

const ASSESSMENT_START = "[ASSESSMENT_CRITERIA]";
const ASSESSMENT_END = "[/ASSESSMENT_CRITERIA]";

const parseAssessmentCriteria = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const normalizeAssessmentCriteria = (value) =>
  parseAssessmentCriteria(value)
    .map((item) => ({
      criterion: String(item?.criterion || "").trim(),
      score: Math.max(
        0,
        Number(String(item?.score || "").replace(/%/g, "")) || 0
      ),
    }))
    .filter((item) => item.criterion && item.score > 0);

const formatAssessmentScore = (score) => {
  if (score === null || score === undefined || score === "") return "-";

  const raw = String(score).trim();
  if (raw.endsWith("%")) return raw;

  const numeric = Number(raw);
  return Number.isFinite(numeric) ? `${numeric}%` : raw;
};

const parseStoredAssessment = (notes) => {
  const rawNotes = String(notes || "");
  const startIndex = rawNotes.indexOf(ASSESSMENT_START);
  const endIndex = rawNotes.indexOf(ASSESSMENT_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return { notes: rawNotes, assessment: null };
  }

  const json = rawNotes
    .slice(startIndex + ASSESSMENT_START.length, endIndex)
    .trim();
  const cleanNotes = `${rawNotes.slice(0, startIndex)}${rawNotes.slice(
    endIndex + ASSESSMENT_END.length
  )}`.trim();

  try {
    return { notes: cleanNotes, assessment: JSON.parse(json) };
  } catch (error) {
    return { notes: cleanNotes, assessment: null };
  }
};

export default function InterviewModal({
  isFormOpen,
  isCancelOpen,
  isDetailOpen = false,
  onCloseForm,
  onCloseCancel,
  selectedCandidate,
  form,
  setForm,
  mode,
  cancelNotes,
  setCancelNotes,
  onSubmit,
  onCancelSubmit,
  readOnly = false,
  allowEditingWhenClosed = false,
}) {
  const [detailCandidate, setDetailCandidate] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [evaluation, setEvaluation] = useState({
    rating: "",
    recommendation: "",
    interviewer_notes: "",
    result: "",
    criteria_scores: {},
  });
  const [isEdit, setIsEdit] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewName, setPreviewName] = useState("");
  const [previewIsImage, setPreviewIsImage] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  // Tambahan: state untuk job_opening
  const [jobOpeningStatus, setJobOpeningStatus] = useState({
    status: null,
    hiring_status: null,
    assessment_criteria: [],
  });

  const isExternalUrl = (value) => /^https?:\/\//i.test(String(value || ""));
  const getDocumentUrl = (value) => {
    if (!value) return "#";
    if (isExternalUrl(value)) return value;
    if (String(value).startsWith("/uploads")) return `http://localhost:5000${value}`;
    if (String(value).startsWith("uploads/")) return `http://localhost:5000/${value}`;
    return `http://localhost:5000/${String(value).replace(/^\//, "")}`;
  };
  const normalizeDocumentValue = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return normalizeDocumentValue(value[0]);
    if (typeof value === "object") {
      if (value.type === "Buffer" && Array.isArray(value.data)) {
        try {
          return new TextDecoder("utf-8").decode(new Uint8Array(value.data)).trim();
        } catch (error) {
          return "";
        }
      }
      if (typeof value.data === "string") return value.data;
      if (Array.isArray(value.data)) {
        try {
          return new TextDecoder("utf-8").decode(new Uint8Array(value.data)).trim();
        } catch (error) {
          return "";
        }
      }
      if (typeof value.path === "string") return value.path;
      if (typeof value.url === "string") return value.url;
      if (typeof value.file === "string") return value.file;
    }
    return "";
  };
  const openPreviewUrl = (url, name) => {
    if (!url) return;
    setPreviewUrl(url);
    setPreviewName(name || url.split("/").pop() || "File");
    const lower = (url.split("?")[0] || "").toLowerCase();
    setPreviewIsImage(/\.(png|jpe?g|gif|webp|bmp)$/i.test(lower));
    setPreviewScale(1);
  };
  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewName("");
    setPreviewIsImage(false);
    setPreviewScale(1);
  };
  const zoomIn = () => setPreviewScale((s) => Math.min(3, +(s + 0.25).toFixed(2)));
  const zoomOut = () => setPreviewScale((s) => Math.max(0.25, +(s - 0.25).toFixed(2)));
  const resetZoom = () => setPreviewScale(1);
  const formatJobPosition = (c) => {
    if (!c) return "Lowongan belum tersedia";
    const title =
      c.job_title ||
      c.job?.title ||
      c.job_opening?.title ||
      c.title ||
      c.position_name ||
      c.position ||
      c.base_position_name ||
      "";
    const pos =
      c.position_name ||
      c.position ||
      c.job?.position_name ||
      c.job_opening?.position_name ||
      "";
    const base =
      c.base_position ||
      c.base_position_name ||
      c.job?.base_position ||
      c.job_opening?.base_position ||
      c.position?.base_position ||
      "";

    const parts = [];
    const pushUnique = (v) => {
      if (!v) return;
      if (!parts.includes(v)) parts.push(v);
    };

    pushUnique(title);
    pushUnique(pos);
    pushUnique(base);

    return parts.length ? parts.join(" - ") : "Lowongan belum tersedia";
  };
  const assessmentCriteria = jobOpeningStatus.assessment_criteria?.length
    ? jobOpeningStatus.assessment_criteria
    : normalizeAssessmentCriteria(
        detailCandidate?.assessment_criteria ||
          selectedCandidate?.assessment_criteria
      );
  const getAssessmentSummary = (criteriaScores = evaluation.criteria_scores) => {
    const totalWeight = assessmentCriteria.reduce(
      (total, item) => total + item.score,
      0
    );
    const weightedTotal = assessmentCriteria.reduce((total, item, index) => {
      const value = Number(criteriaScores?.[index]);
      const candidateScore = Number.isFinite(value)
        ? Math.max(0, Math.min(100, value))
        : 0;
      return total + candidateScore * item.score;
    }, 0);

    const averageScore = totalWeight > 0 ? weightedTotal / totalWeight : 0;
    const weightedAverage =
      totalWeight > 0 ? Number(averageScore.toFixed(2)) : "";

    return { totalWeight, weightedTotal, averageScore, rating: weightedAverage };
  };
  const getEvaluationFromData = (data = {}) => {
    const parsedNotes = parseStoredAssessment(data.interviewer_notes);
    const storedCriteria = Array.isArray(parsedNotes.assessment?.criteria)
      ? parsedNotes.assessment.criteria
      : [];
    const criteriaScores = storedCriteria.reduce((scores, item, index) => {
      scores[index] = item?.achieved_score ?? "";
      return scores;
    }, {});

    return {
      rating: data.average_rating ?? data.rating ?? "",
      average_rating: data.average_rating ?? data.rating ?? "",
      recommendation: data.recommendation || "",
      interviewer_notes: parsedNotes.notes,
      result: data.result || "",
      criteria_scores: criteriaScores,
    };
  };
  const updateCriteriaScore = (index, value) => {
    const numericValue =
      value === "" ? "" : Math.max(0, Math.min(100, Number(value) || 0));
    setEvaluation((current) => ({
      ...current,
      criteria_scores: {
        ...current.criteria_scores,
        [index]: numericValue,
      },
    }));
  };
  const buildInterviewerNotes = () => {
    if (!assessmentCriteria.length) return evaluation.interviewer_notes;

    const summary = getAssessmentSummary();
    const assessment = {
      criteria: assessmentCriteria.map((item, index) => ({
        criterion: item.criterion,
        weight_percentage: item.score,
        maximum_score: 100,
        achieved_score: Number(evaluation.criteria_scores?.[index]) || 0,
      })),
      total_score: Number(summary.averageScore.toFixed(2)),
      maximum_score: 100,
      total_weight: Number(summary.totalWeight.toFixed(2)),
      percentage: Number(summary.averageScore.toFixed(2)),
      rating: summary.rating,
    };

    return `${String(evaluation.interviewer_notes || "").trim()}

${ASSESSMENT_START}
${JSON.stringify(assessment)}
${ASSESSMENT_END}`.trim();
  };
  const saveEvaluation = async ({ closeAfterSave = false } = {}) => {
    if (
      assessmentCriteria.length &&
      assessmentCriteria.some(
        (_, index) =>
          evaluation.criteria_scores?.[index] === "" ||
          evaluation.criteria_scores?.[index] === undefined
      )
    ) {
      NotificationManager.error(
        "Lengkapi nilai seluruh kriteria penilaian",
        "Penilaian belum lengkap",
        4000
      );
      return;
    }

    const summary = getAssessmentSummary();

    if (assessmentCriteria.length && Math.abs(summary.totalWeight - 100) > 0.01) {
      NotificationManager.error(
        `Total bobot kriteria harus 100%. Saat ini ${summary.totalWeight.toFixed(2)}%`,
        "Bobot kriteria belum valid",
        4000
      );
      return;
    }

    try {
      await axios.put(`/api/hr/interviews/${selectedCandidate.id}/result`, {
        rating: assessmentCriteria.length ? summary.rating : evaluation.rating,
        average_rating: assessmentCriteria.length
          ? summary.rating
          : evaluation.rating,
        recommendation: evaluation.recommendation,
        interviewer_notes: buildInterviewerNotes(),
        result: evaluation.result,
        status: "completed",
        publish: false,
      });

      NotificationManager.success(
        "Berhasil menyimpan hasil wawancara",
        "Berhasil",
        3000
      );

      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(new Event("refreshInterviewData"));
      }

      setIsEdit(false);
      if (closeAfterSave && typeof onCloseForm === "function") {
        onCloseForm();
      }
    } catch (err) {
      console.error(err);
      NotificationManager.error("Gagal menyimpan", "Gagal", 4000);
    }
  };
  // Ambil status & hiring_status dari job_openings
  useEffect(() => {
    // Cari job_opening_id dari detailCandidate atau selectedCandidate
    const jobOpeningId = detailCandidate?.job_opening_id || selectedCandidate?.job_opening_id;
    if (!jobOpeningId) return;
    // Cegah refetch jika sudah sama
    if (
      jobOpeningStatus.status &&
      jobOpeningStatus.hiring_status &&
      jobOpeningStatus._id === jobOpeningId
    ) {
      return;
    }
    // Fetch ke backend
    axios
      .get(`/api/job-openings/${jobOpeningId}`)
      .then((res) => {
        if (res.data && res.data.job) {
          setJobOpeningStatus({
            status: res.data.job.status,
            hiring_status: res.data.job.hiring_status,
            assessment_criteria: normalizeAssessmentCriteria(
              res.data.job.assessment_criteria
            ),
            _id: jobOpeningId,
          });
        }
      })
      .catch(() => {
        setJobOpeningStatus({
          status: null,
          hiring_status: null,
          assessment_criteria: [],
          _id: jobOpeningId,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailCandidate, selectedCandidate]);

  // Saat masuk mode edit, isi field dengan data terakhir
  useEffect(() => {
    if (isEdit) {
      setEvaluation(
        getEvaluationFromData(detailCandidate || selectedCandidate || evaluation)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  // Ambil detail kandidat/interview saat modal detail dibuka
  useEffect(() => {
    if (isDetailOpen && selectedCandidate?.id) {
      setDetailCandidate(selectedCandidate);
      setDetailError("");
      setEvaluation(getEvaluationFromData(selectedCandidate));
      let url = "";
      if (selectedCandidate.application_id) {
        url = `/api/candidates/admin/applications/${selectedCandidate.application_id}`;
      } else {
        url = `/api/candidates/interviews/${selectedCandidate.id}`;
      }
      //nilai kandidat
      axios
        .get(url)
        .then((res) => {
          const data = res.data.application || res.data.interview || selectedCandidate;
          setDetailCandidate(data);
          // Set evaluation jika ada data interview
          setEvaluation(getEvaluationFromData(data));
        })
        .catch((err) => {
          let msg = "Gagal mengambil detail pelamar/interview";
          if (err.response && err.response.data && err.response.data.message) {
            msg += ": " + err.response.data.message;
          } else if (err.message) {
            msg += ": " + err.message;
          }
          setDetailError(msg);
          setDetailCandidate(selectedCandidate);
        });
    } else if (!isDetailOpen) {
      setDetailCandidate(null);
      setDetailError("");
    }
  }, [isDetailOpen, selectedCandidate]);

  const renderAssessmentFields = () => {
    if (!assessmentCriteria.length) return null;

    const summary = getAssessmentSummary();

    return (
      <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-bold text-base-content">
              Penilaian Berdasarkan Kriteria Lowongan
            </h4>
            <p className="text-xs text-base-content/70">
              Isi nilai kandidat 0-100 untuk setiap kriteria berbobot.
            </p>
          </div>
          <div className="badge badge-primary gap-1 px-3 py-3">
            Total Bobot {summary.totalWeight.toFixed(2)}%
          </div>
        </div>

        <div className="space-y-3">
          {assessmentCriteria.map((item, index) => (
            <div
              key={`${item.criterion}-${index}`}
              className="grid gap-3 rounded-xl border border-base-300 bg-base-100 p-3 sm:grid-cols-[1fr_120px]"
            >
              <div>
                <p className="text-sm font-semibold text-base-content">
                  {item.criterion}
                </p>
                <p className="mt-1 text-xs text-base-content/70">
                  Bobot: {formatAssessmentScore(item.score)}
                </p>
              </div>
              <label className="form-control">
                <span className="label-text mb-1 text-xs font-semibold">
                  Nilai Kandidat (0-100)
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input input-bordered input-sm w-full"
                  placeholder="0 - 100"
                  value={evaluation.criteria_scores?.[index] ?? ""}
                  onChange={(event) =>
                    updateCriteriaScore(index, event.target.value)
                  }
                />
              </label>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-base-100 px-3 py-2">
            <p className="text-xs text-base-content/70">Rata-rata Berbobot</p>
            <p className="font-bold">{summary.averageScore.toFixed(2)}</p>
          </div>
          <div className="rounded-xl bg-base-100 px-3 py-2">
            <p className="text-xs text-base-content/70">Jumlah Kriteria</p>
            <p className="font-bold">{assessmentCriteria.length}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAssessmentSummary = () => {
    if (!assessmentCriteria.length) return null;

    const summary = getAssessmentSummary();

    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-base-content/70">
              Rincian Kriteria Penilaian
            </p>
            <p className="text-sm font-bold">
              Rata-rata Berbobot: {summary.averageScore.toFixed(2)} (Bobot {summary.totalWeight.toFixed(2)}%)
            </p>
          </div>
          <span className="badge badge-primary">
            Rata-rata Berbobot {summary.rating || evaluation.average_rating || evaluation.rating || "-"}
          </span>
        </div>
        <div className="space-y-2">
          {assessmentCriteria.map((item, index) => (
            <div
              key={`${item.criterion}-${index}`}
              className="flex items-start justify-between gap-3 rounded-lg bg-base-100 px-3 py-2 text-sm"
            >
              <span>{item.criterion}</span>
              <span className="shrink-0 font-bold">
                {evaluation.criteria_scores?.[index] ?? 0}/100 (bobot {formatAssessmentScore(item.score)})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
  <>
    {isDetailOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 md:p-6">
        <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl bg-base-100 shadow-2xl border border-base-300">
          {/* HEADER */}
          <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-base-300 bg-base-100 px-5 py-4">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-base-content">
                Detail Pelamar
              </h3>
              <p className="text-xs text-base-content/60 truncate">
                Informasi kandidat, dokumen, status, dan hasil wawancara
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block md:ml-4 md:mr-2 min-w-0 max-w-xs text-right">
                <span
                  className="badge badge-primary badge-outline text-sm font-semibold truncate inline-block"
                  style={{ maxWidth: "18rem" }}
                >
                  {formatJobPosition(detailCandidate || selectedCandidate)}
                </span>
              </div>

              <button
                className="btn btn-sm btn-ghost rounded-xl"
                onClick={onCloseForm}
                type="button"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="max-h-[calc(92vh-72px)] overflow-y-auto p-4 md:p-6">
            {detailCandidate === null && !detailError && (
              <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                <p className="font-semibold">Memuat detail kandidat...</p>
                <p className="text-sm text-base-content/60">
                  Mohon tunggu sebentar
                </p>
              </div>
            )}

            {detailError && (
              <div className="alert alert-error">
                <span>{detailError}</span>
              </div>
            )}

            {detailCandidate && !detailError && (
              <div className="space-y-5">
                {/* PROFILE */}
                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="avatar flex justify-center md:justify-start">
                      <div className="w-20 rounded-full ring ring-primary/30 ring-offset-base-100 ring-offset-2">
                        <img
                          src={
                            detailCandidate?.photo_file
                              ? detailCandidate.photo_file.startsWith("http")
                                ? detailCandidate.photo_file
                                : `http://localhost:5000/${detailCandidate.photo_file.replace(
                                    /^\//,
                                    ""
                                  )}`
                              : "https://ui-avatars.com/api/?name=" +
                                encodeURIComponent(
                                  detailCandidate?.candidate_name ||
                                    detailCandidate?.name ||
                                    "-"
                                ) +
                                "&background=random"
                          }
                          alt="Foto Kandidat"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 text-center md:text-left">
                      <h2 className="truncate text-xl font-bold text-base-content">
                        {detailCandidate?.candidate_name ||
                          detailCandidate?.name ||
                          "-"}
                      </h2>
                      <p className="truncate text-sm text-base-content/60">
                        {detailCandidate?.candidate_email ||
                          detailCandidate?.email ||
                          "-"}
                      </p>

                      <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                        <span className="badge badge-primary badge-outline">
                          {detailCandidate?.position_name ||
                            detailCandidate?.position ||
                            "Posisi belum tersedia"}
                        </span>
                        <span className="badge badge-ghost">
                          {detailCandidate?.candidate_email || detailCandidate?.email || "Email belum tersedia"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DATA DIRI */}
                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-base-content">
                      Data Diri
                    </h3>
                    <p className="text-xs text-base-content/60">
                      Informasi pribadi dan pendidikan kandidat
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { key: "gender", label: "Jenis Kelamin" },
                      { key: "birth_place", label: "Tempat Lahir" },
                      { key: "date_of_birth", label: "Tanggal Lahir" },
                      { key: "phone", label: "Nomor HP" },
                      { key: "marital_status", label: "Status Pernikahan" },
                      { key: "nationality", label: "Kebangsaan" },
                      { key: "nik", label: "NIK" },
                      { key: "npwp", label: "NPWP" },
                      { key: "education_level", label: "Pendidikan" },
                      { key: "university", label: "Sekolah/Universitas" },
                      { key: "major", label: "Jurusan" },
                      { key: "graduation_year", label: "Tahun Lulus" },
                      { key: "expected_salary", label: "Ekspektasi Gaji" },
                      { key: "linkedin", label: "LinkedIn" },
                      { key: "portfolio", label: "Portfolio" },
                    ].map((f) => (
                      <div
                        key={f.key}
                        className="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3"
                      >
                        <p className="mb-1 text-xs font-medium text-base-content/60">
                          {f.label}
                        </p>
                        <p className="break-words text-sm font-semibold text-base-content">
                          {f.key === "date_of_birth"
                            ? detailCandidate?.[f.key]
                              ? new Date(
                                  detailCandidate[f.key]
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "-"
                            : f.key === "expected_salary"
                            ? detailCandidate?.[f.key]
                              ? new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 0,
                                }).format(detailCandidate[f.key])
                              : "-"
                            : detailCandidate?.[f.key] || "-"}
                        </p>
                      </div>
                    ))}

                    <div className="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3 sm:col-span-2 lg:col-span-3">
                      <p className="mb-1 text-xs font-medium text-base-content/60">
                        Alamat
                      </p>
                      <p className="break-words text-sm font-semibold text-base-content">
                        {detailCandidate?.address || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DOKUMEN */}
                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-base-content">
                      Dokumen Kandidat
                    </h3>
                    <p className="text-xs text-base-content/60">
                      Berkas pendukung yang diunggah kandidat
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {(() => {
                      const pos =
                        detailCandidate?.position_name ||
                        detailCandidate?.position ||
                        "";
                      const basePos = detailCandidate?.base_position || "";
                      const req = getRequiredDocuments(pos, basePos);
                      const meta = DOCUMENT_FIELD_METADATA;
                      const shownFields = [
                        ...(req.required || []),
                        ...(req.optional || []),
                      ];

                      return shownFields.map((key) => {
                        const val = normalizeDocumentValue(
                          detailCandidate?.[key]
                        );
                        const label = meta[key]?.label || key;
                        const isRequired = (req.required || []).includes(key);

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-200/40 px-4 py-3"
                          >
                            <div className="min-w-0">
                              <div className="mb-1 flex items-center gap-2">
                                <p className="truncate text-xs font-semibold text-base-content/60">
                                  {label}
                                </p>
                                <span
                                  className={`badge badge-xs ${
                                    isRequired
                                      ? "badge-error badge-outline"
                                      : "badge-warning badge-outline"
                                  }`}
                                >
                                  {isRequired ? "Wajib" : "Opsional"}
                                </span>
                              </div>

                              <p
                                className={`max-w-[220px] truncate text-sm font-semibold ${
                                  val ? "text-base-content" : "text-error/80"
                                }`}
                              >
                                {val || "Tidak diupload"}
                              </p>
                            </div>

                            {val ? (
                              isExternalUrl(val) ? (
                                <a
                                  href={getDocumentUrl(val)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-primary btn-xs rounded-lg shrink-0"
                                >
                                  Lihat
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openPreviewUrl(getDocumentUrl(val), val)
                                  }
                                  className="btn btn-primary btn-xs rounded-lg shrink-0"
                                >
                                  Lihat
                                </button>
                              )
                            ) : (
                              <span className="btn btn-xs btn-disabled rounded-lg shrink-0">
                                Kosong
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* SURAT LAMARAN */}
                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-base-content">
                      Surat Lamaran
                    </h3>
                    <p className="text-xs text-base-content/60">
                      File surat lamaran kandidat
                    </p>
                  </div>

                  {(() => {
                    const coverLetterValue = normalizeDocumentValue(
                      detailCandidate?.cover_letter_file ||
                        detailCandidate?.cover_letter
                    );

                    return (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-200/40 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-base-content/60">
                            File Surat Lamaran
                          </p>
                          <p className="max-w-[240px] truncate text-sm font-semibold text-base-content">
                            {coverLetterValue || "Tidak diupload"}
                          </p>
                        </div>

                        {coverLetterValue ? (
                          isExternalUrl(coverLetterValue) ? (
                            <a
                              href={getDocumentUrl(coverLetterValue)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-xs rounded-lg shrink-0"
                            >
                              Lihat
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                openPreviewUrl(
                                  getDocumentUrl(coverLetterValue),
                                  coverLetterValue
                                )
                              }
                              className="btn btn-primary btn-xs rounded-lg shrink-0"
                            >
                              Lihat
                            </button>
                          )
                        ) : (
                          <span className="btn btn-xs btn-disabled rounded-lg shrink-0">
                            Kosong
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* STATUS */}
                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-base-content">
                      Status Lamaran
                    </h3>
                    <p className="text-xs text-base-content/60">
                      Ringkasan status proses rekrutmen kandidat
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3">
                      <p className="text-xs text-base-content/60">Status</p>
                      <span className="badge badge-primary mt-2">
                        {detailCandidate?.status || "submitted"}
                      </span>
                    </div>

                    <div className="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3">
                      <p className="text-xs text-base-content/60">
                        Tanggal Melamar
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {detailCandidate?.submitted_at
                          ? new Date(
                              detailCandidate.submitted_at
                            ).toLocaleDateString("id-ID")
                          : "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3">
                      <p className="text-xs text-base-content/60">
                        Jadwal Interview
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {detailCandidate?.scheduled_date
                          ? new Date(
                              detailCandidate.scheduled_date
                            ).toLocaleDateString("id-ID")
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* HASIL WAWANCARA */}
                <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-base-content">
                      Hasil Wawancara
                    </h3>
                    <p className="text-xs text-base-content/60">
                      Penilaian, rekomendasi, hasil, dan catatan interviewer
                    </p>
                  </div>

                  {!readOnly ? (
                    <>
                      {renderAssessmentFields()}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="label">
                            <span className="label-text text-xs font-semibold">
                              Rata-rata Berbobot
                            </span>
                          </label>
                          {assessmentCriteria.length ? (
                            <div className="input input-bordered flex w-full items-center font-bold">
                              {getAssessmentSummary().rating || "-"}
                            </div>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="input input-bordered w-full"
                              placeholder="0 - 100"
                              value={evaluation.rating}
                              onChange={(e) =>
                                setEvaluation({
                                  ...evaluation,
                                  rating: e.target.value,
                                })
                              }
                            />
                          )}
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text text-xs font-semibold">
                              Rekomendasi
                            </span>
                          </label>
                          <select
                            className="select select-bordered w-full"
                            value={evaluation.recommendation}
                            onChange={(e) =>
                              setEvaluation({
                                ...evaluation,
                                recommendation: e.target.value,
                              })
                            }
                          >
                            <option value="">Pilih</option>
                            <option value="hire">Diterima</option>
                            <option value="consider">Dipertimbangkan</option>
                            <option value="reject">Ditolak</option>
                          </select>
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text text-xs font-semibold">
                              Hasil
                            </span>
                          </label>
                          <select
                            className="select select-bordered w-full"
                            value={evaluation.result}
                            onChange={(e) =>
                              setEvaluation({
                                ...evaluation,
                                result: e.target.value,
                              })
                            }
                          >
                            <option value="">Pilih</option>
                            <option value="passed">Lolos</option>
                            <option value="failed">Tidak Lolos</option>
                            <option value="no_show">Tidak Hadir</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="label">
                          <span className="label-text text-xs font-semibold">
                            Catatan Interviewer
                          </span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered w-full"
                          rows={4}
                          placeholder="Tulis catatan hasil wawancara..."
                          value={evaluation.interviewer_notes}
                          onChange={(e) =>
                            setEvaluation({
                              ...evaluation,
                              interviewer_notes: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                          className="btn btn-outline"
                          type="button"
                          onClick={onCloseForm}
                        >
                          Batal
                        </button>

                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() =>
                            saveEvaluation({ closeAfterSave: true })
                          }
                        >
                          Simpan Hasil
                        </button>
                      </div>
                    </>
                  ) : isEdit ? (
                    <>
                      {renderAssessmentFields()}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <label className="label">
                            <span className="label-text text-xs font-semibold">
                              Rata-rata Berbobot
                            </span>
                          </label>
                          {assessmentCriteria.length ? (
                            <div className="input input-bordered flex w-full items-center font-bold">
                              {getAssessmentSummary().rating || "-"}
                            </div>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="input input-bordered w-full"
                              placeholder="0 - 100"
                              value={evaluation.rating}
                              onChange={(e) =>
                                setEvaluation({
                                  ...evaluation,
                                  rating: e.target.value,
                                })
                              }
                            />
                          )}
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text text-xs font-semibold">
                              Rekomendasi
                            </span>
                          </label>
                          <select
                            className="select select-bordered w-full"
                            value={evaluation.recommendation}
                            onChange={(e) =>
                              setEvaluation({
                                ...evaluation,
                                recommendation: e.target.value,
                              })
                            }
                          >
                            <option value="">Pilih</option>
                            <option value="hire">Diterima</option>
                            <option value="consider">Dipertimbangkan</option>
                            <option value="reject">Ditolak</option>
                          </select>
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text text-xs font-semibold">
                              Hasil
                            </span>
                          </label>
                          <select
                            className="select select-bordered w-full"
                            value={evaluation.result}
                            onChange={(e) =>
                              setEvaluation({
                                ...evaluation,
                                result: e.target.value,
                              })
                            }
                          >
                            <option value="">Pilih</option>
                            <option value="passed">Lolos</option>
                            <option value="failed">Tidak Lolos</option>
                            <option value="no_show">Tidak Hadir</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="label">
                          <span className="label-text text-xs font-semibold">
                            Catatan Interviewer
                          </span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered w-full"
                          rows={4}
                          value={evaluation.interviewer_notes}
                          onChange={(e) =>
                            setEvaluation({
                              ...evaluation,
                              interviewer_notes: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                          className="btn btn-outline"
                          type="button"
                          onClick={() => setIsEdit(false)}
                        >
                          Batal
                        </button>

                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => saveEvaluation()}
                        >
                          Simpan Hasil
                        </button>
                      </div>
                    </>
                  ) : (
                    (() => {
                      const evalData = {
                        rating:
                          evaluation.average_rating ||
                          evaluation.rating ||
                          selectedCandidate?.rating ||
                          "-",
                        recommendation:
                          evaluation.recommendation ||
                          selectedCandidate?.recommendation ||
                          "-",
                        interviewer_notes:
                          evaluation.interviewer_notes ||
                          selectedCandidate?.interviewer_notes ||
                          "-",
                        result:
                          evaluation.result || selectedCandidate?.result || "-",
                      };

                      const recommendationLabel = {
                        hire: "Diterima",
                        consider: "Dipertimbangkan",
                        reject: "Ditolak",
                      };

                      const resultLabel = {
                        passed: "Lolos",
                        failed: "Tidak Lolos",
                        no_show: "Tidak Hadir",
                      };

                      return (
                        <div className="space-y-4">
                          {renderAssessmentSummary()}
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3">
                              <p className="text-xs text-base-content/60">
                                Rata-rata Berbobot
                              </p>
                              <p className="mt-1 text-lg font-bold">
                                {evalData.rating || "-"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3">
                              <p className="text-xs text-base-content/60">
                                Rekomendasi
                              </p>
                              <p className="mt-1 text-sm font-semibold">
                                {recommendationLabel[
                                  evalData.recommendation
                                ] ||
                                  evalData.recommendation ||
                                  "-"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3">
                              <p className="text-xs text-base-content/60">
                                Hasil
                              </p>
                              <p className="mt-1 text-sm font-semibold">
                                {resultLabel[evalData.result] ||
                                  evalData.result ||
                                  "-"}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-xl border border-base-300 bg-base-200/40 px-4 py-3">
                            <p className="mb-1 text-xs text-base-content/60">
                              Catatan Interviewer
                            </p>
                            <p className="whitespace-pre-line text-sm font-semibold">
                              {evalData.interviewer_notes || "-"}
                            </p>
                          </div>

                          {!readOnly &&
                            (allowEditingWhenClosed ||
                              (() => {
                                const status = jobOpeningStatus.status;
                                const hiringStatus =
                                  jobOpeningStatus.hiring_status;

                                if (!status || !hiringStatus) return true;

                                if (
                                  status.toLowerCase() === "closed" &&
                                  ["completed", "canceled"].includes(
                                    hiringStatus.toLowerCase()
                                  )
                                ) {
                                  return false;
                                }

                                return true;
                              })()) && (
                              <div className="flex justify-end">
                                <button
                                  className="btn btn-warning"
                                  type="button"
                                  onClick={() => setIsEdit(true)}
                                >
                                  Edit Hasil
                                </button>
                              </div>
                            )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {previewUrl &&
      createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={closePreview}
            aria-label="Tutup backdrop"
          />

          <div className="relative z-10 flex h-full items-start justify-center overflow-y-auto p-4 md:p-8">
            <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-base-100 shadow-2xl border border-base-300">
              <div className="relative border-b border-base-300 p-5">
                <button
                  type="button"
                  className="btn btn-sm btn-circle absolute right-4 top-4"
                  onClick={closePreview}
                  aria-label="Tutup preview"
                >
                  ✕
                </button>

                <h3 className="mb-1 pr-12 text-lg font-bold">
                  Lampiran Dokumen
                </h3>
                <p className="truncate pr-12 text-sm text-base-content/60">
                  {previewName}
                </p>
              </div>

              <div className="p-4 md:p-6">
                <div className="flex min-h-[420px] w-full items-center justify-center overflow-auto rounded-xl bg-base-200">
                  {previewIsImage ? (
                    <img
                      src={previewUrl}
                      alt={previewName}
                      style={{
                        transform: `scale(${previewScale})`,
                        transformOrigin: "center center",
                      }}
                      className="max-h-[70vh] max-w-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={previewUrl}
                      title={previewName}
                      className="h-[70vh] w-full border-0"
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={zoomOut}
                    aria-label="Perkecil"
                  >
                    -
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={zoomIn}
                    aria-label="Perbesar"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={resetZoom}
                    aria-label="Reset Zoom"
                  >
                    Reset
                  </button>

                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline"
                  >
                    Buka Tab Baru
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
  </>
);
}
