import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  List,
  PlusCircle,
  RotateCcw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import { setPageTitle } from "../../../features/common/headerSlice";
import jobService, { hrApi } from "../../../features/hr/api";
import Pagination from "../../../components/Pagination/Pagination";

const defaultJobOpening = {
  position_id: "",
  title: "",
  description: "",
  requirements: "",
  assessment_criteria: [
    {
      criterion: "",
      score: "",
    },
  ],
  responsibilities: "",
  quota: 1,
  employment_type: "permanent",
  salary_range_min: "",
  salary_range_max: "",
  location: "",
  deadline: "",
  status: "open",
  hiring_status: "ongoing",
};

export default function HRJobOpenings() {
  // Bidang/spesialisasi untuk mentor/project manager (hanya 5 bidang utama)
  const BASE_POSITIONS = [
    "Frontend Web Developer",
    "Backend Web Developer",
    "Frontend Mobile Developer",
    "Backend Mobile Developer",
    "Fullstack Mobile Developer",
    "Fullstack Web Developer",
    "UI/UX Designer",
    "Content Creator",
    "Graphic Designer",
    "Videographer / Video Editor",
  ];
  const DEVELOPER_SPECIALIZATIONS = [
    { value: "frontend_web", label: "Frontend Web" },
    { value: "backend_web", label: "Backend Web" },
    { value: "frontend_mobile", label: "Frontend Mobile" },
    { value: "backend_mobile", label: "Backend Mobile" },
  ];
  const [jobOpenings, setJobOpenings] = useState([]);
  const [historyOpenings, setHistoryOpenings] = useState([]);
  const [form, setForm] = useState(defaultJobOpening);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [pendingCancelJob, setPendingCancelJob] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  function parseAssessmentCriteria(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  function formatAssessmentScore(score) {
    if (score === null || score === undefined || score === "") return "-";

    const raw = String(score).trim();
    if (raw.endsWith("%")) return raw;

    const numeric = Number(raw);
    return Number.isFinite(numeric) ? `${numeric}%` : raw;
  }

  function parsePercentageValue(value) {
    const normalized = String(value ?? "")
      .replace(/%/g, "")
      .replace(/,/g, ".")
      .trim();
    const number = Number(normalized);
    return Number.isFinite(number) ? Math.max(0, number) : 0;
  }

  useEffect(() => {
    fetchJobOpenings();
    fetchPositions();
    dispatch(setPageTitle({ title: "Lowongan Pekerjaan" }));
  }, [dispatch]);

  async function fetchJobOpenings() {
    setLoading(true);
    setError("");
    try {
      // Ambil data dari API
      const data = await jobService.getJobOpenings();
      let jobs = Array.isArray(data) ? data : data.jobs || [];
      const active = [];
      const history = [];
      // Pisahkan aktif/riwayat berdasarkan status yang tersimpan di database.
      for (const job of jobs) {
        if (job.status === "closed") {
          history.push(job);
        } else {
          active.push(job);
        }
      }
      setJobOpenings(active);
      setHistoryOpenings(history);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function fetchPositions() {
    try {
      const meta = await hrApi.getMeta();
      setPositions(meta.positions || []);
    } catch (e) {
      // abaikan error
    }
  }

  function syncUpdatedJobOpening(updatedJob) {
    if (!updatedJob?.id) return;

    setJobOpenings((items) =>
      updatedJob.status === "closed"
        ? items.filter((item) => item.id !== updatedJob.id)
        : [
            ...items.filter((item) => item.id !== updatedJob.id),
            updatedJob,
          ],
    );
    setHistoryOpenings((items) =>
      updatedJob.status === "closed"
        ? [
            ...items.filter((item) => item.id !== updatedJob.id),
            updatedJob,
          ]
        : items.filter((item) => item.id !== updatedJob.id),
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "position_id") {
      const selected =
        positions
          .find((p) => String(p.id) === String(value))
          ?.name?.toLowerCase() || "";
      if (
        !selected.includes("mentor") &&
        !selected.includes("project manager") &&
        selected !== "developer"
      ) {
        setForm((f) => ({
          ...f,
          [name]: value,
          base_position: "",
          developer_specialization: "",
        }));
        return;
      }
    }
    if (name === "developer_specialization") {
      setForm((f) => ({ ...f, developer_specialization: value }));
      return;
    }
    // store salary inputs as digit-only strings, but display formatted
    if (name === "salary_range_min" || name === "salary_range_max") {
      const digits = String(value).replace(/\D/g, "");
      setForm((f) => ({ ...f, [name]: digits }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let payload = { ...form };
      const normalizedAssessmentCriteria = (payload.assessment_criteria || [])
        .filter((item) => item.criterion || item.score)
        .map((item) => ({
          criterion: String(item.criterion || "").trim(),
          score: String(item.score || "")
            .replace(/%/g, "")
            .replace(/,/g, ".")
            .trim(),
        }))
        .filter((item) => item.criterion || item.score);

      const hasIncompleteCriteria = normalizedAssessmentCriteria.some(
        (item) => !item.criterion || item.score === "",
      );
      if (hasIncompleteCriteria) {
        setError("Lengkapi semua kriteria dan bobot sebelum menyimpan.");
        setLoading(false);
        return;
      }

      if (normalizedAssessmentCriteria.length > 0) {
        const totalWeight = normalizedAssessmentCriteria.reduce(
          (sum, item) => sum + parsePercentageValue(item.score),
          0,
        );

        if (Math.abs(totalWeight - 100) > 0.01) {
          setError(
            `Total bobot kriteria harus 100%. Saat ini: ${totalWeight.toFixed(2)}%`,
          );
          setLoading(false);
          return;
        }
      }
      // Pastikan base_position, developer_specialization
      if (!payload.base_position) payload.base_position = "";
      if (!payload.developer_specialization)
        payload.developer_specialization = "";
      if (!payload.hiring_status) payload.hiring_status = "ongoing";
      payload.assessment_criteria = normalizedAssessmentCriteria;
      // Convert salary fields to numbers if present (they are stored as digit-only strings)
      if (payload.salary_range_min)
        payload.salary_range_min = parseInt(payload.salary_range_min, 10);
      if (payload.salary_range_max)
        payload.salary_range_max = parseInt(payload.salary_range_max, 10);
      if (editMode && editId) {
        const updated = await jobService.updateJobOpening(editId, payload);
        if (updated?.job) {
          syncUpdatedJobOpening(updated.job);
        } else {
          await fetchJobOpenings();
        }

        const msg =
          "Lowongan pekerjaan berhasil diperbarui. Perubahan data telah disimpan dan akan langsung digunakan pada proses rekrutmen.";

        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        await jobService.createJobOpening(payload);

        const msg =
          "Lowongan pekerjaan berhasil dibuat dan dipublikasikan. Kandidat sekarang dapat melihat serta mengajukan lamaran pada lowongan ini.";

        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(""), 5000);
      }
      setForm(defaultJobOpening);
      setEditMode(false);
      setEditId(null);
      setActiveTab(payload.status === "closed" ? "history" : "active");
      if (!editMode) {
        fetchJobOpenings();
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
    // clear success message after a short delay (use captured message)
    // setTimeout is scheduled only if a message was set
  }

  async function handleEdit(id) {
    // Cari di jobOpenings, jika tidak ada cari di historyOpenings
    let data = jobOpenings.find((j) => j.id === id);
    if (!data) {
      data = historyOpenings.find((j) => j.id === id);
    }
    if (data) {
      try {
        const detailResponse = await jobService.getJobOpening(id);
        const detailData = detailResponse?.job || detailResponse?.data?.job || {};
        const mergedData = {
          ...data,
          ...detailData,
        };

        // Pastikan hiring_status tetap ada di form, walau null/undefined
        setForm((f) => ({
          ...f,
          ...mergedData,
          base_position:
            mergedData.base_position !== undefined ? mergedData.base_position : "",
          hiring_status:
            mergedData.hiring_status !== undefined ? mergedData.hiring_status : "",
          assessment_criteria: parseAssessmentCriteria(
            mergedData.assessment_criteria,
          ).length
            ? parseAssessmentCriteria(mergedData.assessment_criteria).map((item) => ({
                criterion: item.criterion || "",
                score: item.score || "",
              }))
            : [
                {
                  criterion: "",
                  score: "",
                },
              ],
        }));
      } catch (error) {
        // Fallback ke data list jika request detail gagal
        setForm((f) => ({
          ...f,
          ...data,
          base_position:
            data.base_position !== undefined ? data.base_position : "",
          hiring_status:
            data.hiring_status !== undefined ? data.hiring_status : "",
          assessment_criteria: parseAssessmentCriteria(data.assessment_criteria)
            .length
            ? parseAssessmentCriteria(data.assessment_criteria).map((item) => ({
                criterion: item.criterion || "",
                score: item.score || "",
              }))
            : [
                {
                  criterion: "",
                  score: "",
                },
              ],
        }));
      }
      setEditMode(true);
      setEditId(id);
      setActiveTab("add");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleCancelJob(id) {
    const data = jobOpenings.find((j) => j.id === id);
    if (!data) return;
    setPendingCancelJob(data);
    setShowCancelPopup(true);
  }

  async function confirmCancelJob() {
    if (!pendingCancelJob) return;
    setLoading(true);
    setError("");
    try {
      await jobService.updateJobOpening(pendingCancelJob.id, {
        ...pendingCancelJob,
        status: "closed",
        hiring_status: "shortlisting",
      });
      const msg = "Lowongan berhasil ditutup";
      setShowCancelPopup(false);
      setPendingCancelJob(null);
      await fetchJobOpenings();
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function closeCancelPopup() {
    if (loading) return;
    setShowCancelPopup(false);
    setPendingCancelJob(null);
  }

  function handleCloseDetail() {
    setShowDetail(false);
    setDetailData(null);
  }

  function handleCancelEdit() {
    setEditMode(false);
    setEditId(null);
    setForm(defaultJobOpening);
  }

  function updateAssessmentCriterion(index, field, value) {
    const normalizedValue =
      field === "score"
        ? String(value)
            .replace(/[^0-9.,]/g, "")
            .replace(/,/g, ".")
        : value;

    setForm((f) => ({
      ...f,
      assessment_criteria: (f.assessment_criteria || []).map(
        (item, itemIndex) =>
          itemIndex === index
            ? { ...item, [field]: normalizedValue }
            : item,
      ),
    }));
  }

  function addAssessmentCriterion() {
    setForm((f) => ({
      ...f,
      assessment_criteria: [
        ...(f.assessment_criteria || []),
        {
          criterion: "",
          score: "",
        },
      ],
    }));
  }

  function removeAssessmentCriterion(index) {
    setForm((f) => {
      const remaining = (f.assessment_criteria || []).filter(
        (_, itemIndex) => itemIndex !== index,
      );
      return {
        ...f,
        assessment_criteria: remaining.length
          ? remaining
          : [
              {
                criterion: "",
                score: "",
              },
            ],
      };
    });
  }

  // Helper to format numbers with dot as thousand separator (Indonesian style)
  function formatWithDots(numStr) {
    if (numStr === null || numStr === undefined || numStr === "") return "";
    const s = String(numStr).replace(/\D/g, "");
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Filters for active and history lists
  const [filtersActive, setFiltersActive] = useState({
    title: "",
    position_id: "",
    quota: "",
    deadline: "",
  });
  const [filtersHistory, setFiltersHistory] = useState({
    title: "",
    position_id: "",
    quota: "",
    deadline: "",
  });

  function handleFilterChange(section, name, value) {
    if (section === "active") {
      setFiltersActive((f) => ({ ...f, [name]: value }));
    } else {
      setFiltersHistory((f) => ({ ...f, [name]: value }));
    }
  }

  function resetFilters(section) {
    if (section === "active")
      setFiltersActive({ title: "", position_id: "", quota: "", deadline: "" });
    else
      setFiltersHistory({
        title: "",
        position_id: "",
        quota: "",
        deadline: "",
      });
  }

  function applyFilters(list, filters) {
    return list.filter((j) => {
      if (
        filters.title &&
        !String(j.title || "")
          .toLowerCase()
          .includes(String(filters.title).toLowerCase())
      )
        return false;
      if (
        filters.position_id &&
        String(j.position_id) !== String(filters.position_id)
      )
        return false;
      if (filters.quota) {
        const q = parseInt(filters.quota, 10);
        if (!isNaN(q) && (isNaN(j.quota) || parseInt(j.quota, 10) < q))
          return false;
      }
      if (filters.deadline) {
        if (!j.deadline) return false;
        const dFilter = new Date(filters.deadline);
        const jd = new Date(j.deadline);
        if (isNaN(dFilter.getTime()) || jd < dFilter) return false;
      }
      return true;
    });
  }

  const filteredActive = applyFilters(jobOpenings, filtersActive);
  const filteredHistory = applyFilters(historyOpenings, filtersHistory);
  const combinedOpenings = [...jobOpenings, ...historyOpenings];
  const filteredAll = applyFilters(combinedOpenings, filtersActive);

  // Pagination state
  const ITEMS_PER_PAGE = 10;
  const [activePage, setActivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(
    () => setActivePage(1),
    [
      filtersActive.title,
      filtersActive.position_id,
      filtersActive.quota,
      filtersActive.deadline,
    ],
  );
  useEffect(
    () => setHistoryPage(1),
    [
      filtersHistory.title,
      filtersHistory.position_id,
      filtersHistory.quota,
      filtersHistory.deadline,
    ],
  );

  // Ensure current page is within bounds when filtered length changes
  useEffect(() => {
    const total = Math.max(
      1,
      Math.ceil(filteredActive.length / ITEMS_PER_PAGE),
    );
    if (activePage > total) setActivePage(total);
  }, [filteredActive.length, activePage]);

  useEffect(() => {
    const total = Math.max(
      1,
      Math.ceil(filteredHistory.length / ITEMS_PER_PAGE),
    );
    if (historyPage > total) setHistoryPage(total);
  }, [filteredHistory.length, historyPage]);

  const paginatedActive = filteredActive.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE,
  );
  const paginatedAll = filteredAll.slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    activePage * ITEMS_PER_PAGE,
  );
  const paginatedHistory = filteredHistory.slice(
    (historyPage - 1) * ITEMS_PER_PAGE,
    historyPage * ITEMS_PER_PAGE,
  );

  const assessmentWeightTotal = (form.assessment_criteria || []).reduce(
    (sum, item) => sum + parsePercentageValue(item?.score),
    0,
  );

  const getJobStatusBadgeClass = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "closed") return "badge-error";
    if (normalized === "draft") return "badge-warning";
    return "badge-success";
  };


  return (
  <>
    {/* Modal Detail */}
    {showDetail && detailData && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative border border-base-300">
          <div className="border-b border-base-300 px-6 py-5 flex justify-between items-center bg-gradient-to-r from-orange-50 to-base-100">
            <div>
              <h2 className="text-2xl font-bold text-base-content">
                Detail Lowongan
              </h2>
              <p className="text-sm text-base-content/60 mt-1">
                Informasi lengkap lowongan pekerjaan.
              </p>
            </div>

            <button
              className="btn btn-ghost btn-circle text-xl"
              onClick={handleCloseDetail}
              aria-label="Tutup detail lowongan"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="rounded-2xl border border-base-200 bg-base-50 p-5">
              <h3 className="font-bold text-base-content mb-4">
                Informasi Pekerjaan
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-base-content/60">Judul</p>
                  <p className="font-semibold">{detailData.title || "-"}</p>
                </div>

                <div>
                  <p className="text-base-content/60">Posisi</p>
                  <p className="font-semibold">
                    {positions.find((p) => p.id === detailData.position_id)
                      ?.name || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-base-content/60">Kuota</p>
                  <p className="font-semibold">{detailData.quota || "-"}</p>
                </div>

                <div>
                  <p className="text-base-content/60">Jenis</p>
                  <p className="font-semibold capitalize">
                    {detailData.employment_type || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-base-content/60">Lokasi</p>
                  <p className="font-semibold">{detailData.location || "-"}</p>
                </div>

                <div>
                  <p className="text-base-content/60">Deadline</p>
                  <p className="font-semibold">
                    {detailData.deadline
                      ? new Date(detailData.deadline).toLocaleDateString(
                          "id-ID",
                        )
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-base-content/60">Gaji</p>
                  <p className="font-semibold">
                    {detailData.salary_range_min && detailData.salary_range_max
                      ? `Rp ${parseInt(
                          detailData.salary_range_min,
                        ).toLocaleString("id-ID")} - Rp ${parseInt(
                          detailData.salary_range_max,
                        ).toLocaleString("id-ID")}`
                      : "Dirahasiakan"}
                  </p>
                </div>

                <div>
                  <p className="text-base-content/60">Status</p>
                  <span
                    className={`badge rounded-full ${
                      detailData.status === "open"
                        ? "badge-success"
                        : detailData.status === "closed"
                          ? "badge-error"
                          : "badge-warning"
                    }`}
                  >
                    {detailData.status || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl border border-base-200 bg-base-100 p-5">
                <h3 className="font-bold mb-2">Deskripsi Pekerjaan</h3>
                <p className="text-sm leading-relaxed whitespace-pre-line text-base-content/80">
                  {detailData.description || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-base-200 bg-base-100 p-5">
                <h3 className="font-bold mb-2">Persyaratan</h3>
                <p className="text-sm leading-relaxed whitespace-pre-line text-base-content/80">
                  {detailData.requirements || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-base-200 bg-base-100 p-5">
                <h3 className="font-bold mb-2">Tanggung Jawab</h3>
                <p className="text-sm leading-relaxed whitespace-pre-line text-base-content/80">
                  {detailData.responsibilities || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-base-200 bg-base-100 p-5">
                <h3 className="font-bold mb-3">Kriteria Penilaian</h3>

                {parseAssessmentCriteria(detailData.assessment_criteria)
                  .length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-base-200">
                    <table className="table table-sm w-full">
                      <thead className="bg-base-200">
                        <tr>
                          <th>No</th>
                          <th>Kriteria</th>
                          <th>Bobot</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseAssessmentCriteria(
                          detailData.assessment_criteria,
                        ).map((item, index) => (
                          <tr key={`${item.criterion || "criteria"}-${index}`}>
                            <td>{index + 1}</td>
                            <td className="font-medium">
                              {item.criterion || "-"}
                            </td>
                            <td>{formatAssessmentScore(item.score)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-base-content/60">
                    Belum ada kriteria penilaian.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Modal Konfirmasi Tutup */}
    {showCancelPopup && pendingCancelJob && (
      <div className="modal modal-open">
        <div className="modal-box max-w-md p-0 overflow-hidden rounded-3xl shadow-2xl">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                <TriangleAlert className="h-7 w-7" />
              </div>

              <div>
                <h3 className="font-bold text-xl">Tutup Lowongan</h3>
                <p className="text-sm opacity-90 mt-1">
                  Lowongan akan dipindahkan ke riwayat rekrutmen.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-base-200 rounded-2xl p-4">
              <p className="text-sm text-base-content/60">
                Lowongan yang akan ditutup:
              </p>

              <h2 className="text-xl font-bold mt-2">
                {pendingCancelJob?.title}
              </h2>

              <p className="text-sm text-base-content/50 mt-1">
                Posisi:{" "}
                {positions.find((p) => p.id === pendingCancelJob.position_id)
                  ?.name || "-"}
              </p>
            </div>

            <div className="alert alert-warning mt-5 text-sm rounded-2xl">
              <span>
                Anda masih dapat melihat data lowongan ini pada riwayat.
              </span>
            </div>

            <div className="modal-action mt-6">
                <button
                  className="btn btn-ghost btn-sm rounded-xl"
                  onClick={closeCancelPopup}
                  disabled={loading}
                >
                Batal
              </button>

              <button
                className="btn btn-error text-white rounded-xl"
                onClick={confirmCancelJob}
                disabled={loading}
              >
                {loading ? "Memproses..." : "Ya, Tutup"}
              </button>
            </div>
          </div>
        </div>

        <div
          className="modal-backdrop bg-black/40"
          onClick={closeCancelPopup}
        ></div>
      </div>
    )}

    {/* Toast Error */}
    {error && (
      <div className="fixed top-6 right-6 z-[9999] w-full max-w-md">
        <div className="alert alert-error rounded-2xl shadow-2xl">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )}

    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-base-200/80 bg-base-100 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] sm:p-7">
      <div className="space-y-5">
        {/* Header sesuai referensi */}
        <div className="relative min-h-[112px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-base-100 via-base-100 to-orange-50/70 px-1 py-2 sm:px-2">
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-[28px] font-extrabold leading-tight text-base-content">
              Lowongan Pekerjaan
            </h1>
            <p className="mt-2 text-sm font-medium text-base-content/60">
              Kelola dan pantau semua lowongan pekerjaan yang tersedia di perusahaan.
            </p>
          </div>
        </div>

        {/* Success Message sesuai referensi */}
        {successMessage && (
          <div className="rounded-2xl border border-success bg-success/10 shadow-sm">
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success text-white shadow-md">
                <Check className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-success">
                  {editMode
                    ? "Lowongan pekerjaan berhasil diperbarui."
                    : "Lowongan pekerjaan berhasil dibuat dan dipublikasikan."}
                </h3>
                <p className="mt-1 text-sm font-medium text-success/90">
                  {successMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage("")}
                className="btn btn-ghost btn-sm btn-circle text-success"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Menu */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-1 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-xl border px-5 py-3 text-left transition-all ${
                activeTab === "all"
                  ? "border-primary bg-base-100 text-primary shadow-sm"
                  : "border-base-200 bg-base-100 hover:border-primary hover:shadow-sm text-base-content"
              }`}
            >
              <div className="flex items-center gap-3">
                <List className="h-5 w-5" />
                <div>
                  <p className="font-bold">
                    Semua Lowongan
                  </p>
                  <p className="text-xs text-base-content/50 mt-1">
                    Aktif & riwayat
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`rounded-xl border px-5 py-3 text-left transition-all ${
                activeTab === "active"
                  ? "border-success bg-base-100 text-success shadow-sm"
                  : "border-base-200 bg-base-100 hover:border-success hover:shadow-sm text-base-content"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <div>
                  <p className="font-bold flex items-center gap-2">
                    Lowongan Aktif
                    <span className="badge badge-sm">
                      {jobOpenings.length}
                    </span>
                  </p>
                  <p className="text-xs text-base-content/50 mt-1">
                    Sedang menerima lamaran
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`rounded-xl border px-5 py-3 text-left transition-all ${
                activeTab === "history"
                  ? "border-base-300 bg-base-100 text-base-content shadow-sm"
                  : "border-base-200 bg-base-100 hover:border-base-300 hover:shadow-sm text-base-content"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                <div>
                  <p className="font-bold flex items-center gap-2">
                    Lowongan Nonaktif
                    <span className="badge badge-sm">
                      {historyOpenings.length}
                    </span>
                  </p>
                  <p className="text-xs text-base-content/50 mt-1">
                    Lowongan yang ditutup
                  </p>
                </div>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab("add");
              setEditMode(false);
              setEditId(null);
              setForm(defaultJobOpening);
            }}
            className="btn btn-primary px-5 shadow-md"
          >
            <PlusCircle className="h-5 w-5" />
            Tambah Lowongan
          </button>
        </div>

        {/* Form Tambah/Edit */}
        {activeTab === "add" && (
          <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                {editMode ? "Edit Lowongan Pekerjaan" : "Tambah Lowongan Baru"}
              </h2>
              <p className="text-sm text-base-content/60 mt-1">
                Lengkapi informasi lowongan dan kriteria penilaian yang akan
                digunakan saat interview.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div>
                <label className="label label-text text-base-content">
                  Posisi
                </label>
                <select
                  name="position_id"
                  value={form.position_id}
                  onChange={handleChange}
                  required
                  className="select select-bordered w-full rounded-xl"
                >
                  <option value="">Pilih Posisi</option>
                  {positions
                    .filter((pos) => {
                      const name = String(pos.name || "").toLowerCase().trim();
                      const level = String(pos.level || "")
                        .toLowerCase()
                        .trim();
                      return (
                        !name.includes("commissioner") &&
                        level !== "commissioner"
                      );
                    })
                    .map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.name}
                      </option>
                    ))}
                </select>

                {(() => {
                  const selected =
                    positions
                      .find((p) => String(p.id) === String(form.position_id))
                      ?.name?.toLowerCase() || "";

                  if (
                    selected.includes("mentor") ||
                    selected.includes("project manager")
                  ) {
                    return (
                      <div className="mt-2">
                        <label className="label label-text text-base-content">
                          Bidang/Spesialisasi
                        </label>
                        <select
                          name="base_position"
                          value={form.base_position || ""}
                          onChange={handleChange}
                          className="select select-bordered w-full rounded-xl"
                          required
                        >
                          <option value="">Pilih Bidang</option>
                          {BASE_POSITIONS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (selected === "developer") {
                    return (
                      <div className="mt-2">
                        <label className="label label-text text-base-content">
                          Bidang Developer
                        </label>
                        <select
                          name="developer_specialization"
                          value={form.developer_specialization || ""}
                          onChange={handleChange}
                          className="select select-bordered w-full rounded-xl"
                          required
                        >
                          <option value="">Pilih Bidang Developer</option>
                          {DEVELOPER_SPECIALIZATIONS.map((b) => (
                            <option key={b.value} value={b.value}>
                              {b.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>

              <div>
                <label className="label label-text text-base-content">
                  Judul
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full rounded-xl"
                  placeholder="Contoh: Frontend Developer"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label label-text text-base-content">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full rounded-xl min-h-28"
                  placeholder="Tuliskan deskripsi pekerjaan"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label label-text text-base-content">
                  Persyaratan
                </label>
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full rounded-xl min-h-28"
                  placeholder="Tuliskan persyaratan kandidat"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label label-text text-base-content">
                  Tanggung Jawab
                </label>
                <textarea
                  name="responsibilities"
                  value={form.responsibilities}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full rounded-xl min-h-28"
                  placeholder="Tuliskan tanggung jawab pekerjaan"
                />
              </div>

              <div>
                <label className="label label-text text-base-content">
                  Kuota
                </label>
                <input
                  type="number"
                  name="quota"
                  value={form.quota}
                  onChange={handleChange}
                  className="input input-bordered w-full rounded-xl"
                />
              </div>

              <div>
                <label className="label label-text text-base-content">
                  Jenis
                </label>
                <select
                  name="employment_type"
                  value={form.employment_type}
                  onChange={handleChange}
                  className="select select-bordered w-full rounded-xl"
                >
                  <option value="permanent">Tetap</option>
                  <option value="contract">Kontrak</option>
                  <option value="intern">Magang</option>
                </select>
              </div>

              <div>
                <label className="label label-text text-base-content">
                  Gaji Minimum
                </label>
                <input
                  type="text"
                  name="salary_range_min"
                  value={formatWithDots(form.salary_range_min)}
                  onChange={handleChange}
                  className="input input-bordered w-full rounded-xl"
                  inputMode="numeric"
                  pattern="[0-9.]*"
                  placeholder="Contoh: 2000000"
                />
              </div>

              <div>
                <label className="label label-text text-base-content">
                  Gaji Maksimum
                </label>
                <input
                  type="text"
                  name="salary_range_max"
                  value={formatWithDots(form.salary_range_max)}
                  onChange={handleChange}
                  className="input input-bordered w-full rounded-xl"
                  inputMode="numeric"
                  pattern="[0-9.]*"
                  placeholder="Contoh: 4000000"
                />
              </div>

              <div>
                <label className="label label-text text-base-content">
                  Lokasi
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="input input-bordered w-full rounded-xl"
                  placeholder="Contoh: Surabaya"
                />
              </div>

              <div>
                <label className="label label-text text-base-content">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline ? form.deadline.substring(0, 10) : ""}
                  onChange={handleChange}
                  className="input input-bordered w-full rounded-xl"
                />
              </div>

              <div>
                <label className="label label-text text-base-content">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="select select-bordered w-full rounded-xl"
                >
                  <option value="open">Buka</option>
                  {editMode && <option value="closed">Tutup</option>}
                  <option value="draft">Draf</option>
                </select>
              </div>

              <div>
                <label className="label label-text text-base-content">
                  Status Rekrutmen
                </label>
                <select
                  name="hiring_status"
                  value={form.hiring_status || ""}
                  onChange={handleChange}
                  className={`select select-bordered w-full rounded-xl ${
                    !editMode ? "opacity-60" : ""
                  }`}
                  required
                  disabled={!editMode}
                >
                  <option value="">Pilih Status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="shortlisting">Shortlisting</option>
                  <option value="interview">Interview</option>
                  <option value="offering">Offering</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>

                {!editMode && (
                  <p className="text-xs text-base-content/60 mt-1">
                    Status awal: <span className="font-medium">Ongoing</span>{" "}
                    dan dapat diubah setelah lowongan dibuat.
                  </p>
                )}
              </div>

              <div className="md:col-span-2 rounded-3xl border border-base-200 bg-base-200/30 p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base-content">
                      Kriteria Penilaian
                    </h3>
                    <p
                      className={`text-s mt-1 font-semibold ${
                        Math.abs(assessmentWeightTotal - 100) <= 0.01
                          ? "text-success"
                          : "text-warning"
                      }`}
                    >
                      Total Bobot saat ini: {assessmentWeightTotal.toFixed(2)}% (harus 100%)
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm rounded-xl"
                    onClick={addAssessmentCriterion}
                  >
                    + Tambah Kriteria
                  </button>
                </div>

                {(form.assessment_criteria || []).map((item, index) => (
                  <div
                    key={`assessment-criterion-${index}`}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm"
                  >
                    <div className="md:col-span-6">
                      <label className="label label-text text-base-content">
                        Kriteria
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full rounded-xl"
                        placeholder="Contoh: Kemampuan komunikasi"
                        value={item.criterion}
                        onChange={(e) =>
                          updateAssessmentCriterion(
                            index,
                            "criterion",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="label label-text text-base-content">
                         Bobot
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full rounded-xl"
                        placeholder="Contoh: 30%"
                        value={item.score}
                        onChange={(e) =>
                          updateAssessmentCriterion(
                            index,
                            "score",
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="md:col-span-2 flex items-end justify-end">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm rounded-xl text-error"
                        onClick={() => removeAssessmentCriterion(index)}
                        disabled={(form.assessment_criteria || []).length === 1}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-5 border-t border-base-200">
                {editMode && (
                  <button
                    type="button"
                    className="btn btn-ghost rounded-xl h-12 px-6"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Batal
                  </button>
                )}

                <button
                  type="submit"
                  className="btn btn-primary rounded-xl px-8 h-12"
                  disabled={loading}
                >
                  {loading
                    ? "Menyimpan..."
                    : editMode
                      ? "Simpan Perubahan"
                      : "Publikasikan Lowongan"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Daftar Lowongan Aktif / Semua Lowongan */}
        {(activeTab === "all" || activeTab === "active") && (
          <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <>
                <div className="rounded-2xl border border-base-200 bg-base-100 p-4 mb-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <label className="input input-bordered flex w-full items-center gap-2 rounded-xl">
                      <Search className="h-4 w-4 text-base-content/50" />
                      <input
                        type="text"
                        placeholder="Cari judul lowongan..."
                        className="grow"
                        value={filtersActive.title}
                        onChange={(e) =>
                          handleFilterChange("active", "title", e.target.value)
                        }
                      />
                    </label>

                    <select
                      className="select select-bordered w-full rounded-xl"
                      value={filtersActive.position_id}
                      onChange={(e) =>
                        handleFilterChange(
                          "active",
                          "position_id",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Semua Posisi</option>
                      {positions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Kuota min"
                      className="input input-bordered w-full rounded-xl"
                      value={filtersActive.quota}
                      onChange={(e) =>
                        handleFilterChange("active", "quota", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      className="btn btn-outline rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-content"
                      onClick={() => resetFilters("active")}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset Filter
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-base-200">
                  <table className="table w-full">
                    <thead className="bg-base-200 text-base-content">
                      <tr>
                        <th>Judul Lowongan</th>
                        <th>Posisi</th>
                        <th>Kuota</th>
                        <th>Gaji</th>
                        <th>Deadline</th>
                        {activeTab === "all" && <th>Status</th>}
                        <th className="text-center">Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(activeTab === "all" ? paginatedAll : paginatedActive).length === 0 ? (
                        <tr>
                          <td colSpan={activeTab === "all" ? 8 : 7} className="text-center py-8">
                            {activeTab === "all"
                              ? "Tidak ada lowongan ditemukan."
                              : "Tidak ada lowongan aktif."}
                          </td>
                        </tr>
                      ) : (
                        (activeTab === "all" ? paginatedAll : paginatedActive).map((j, index) => (
                          <tr key={j.id} className="hover:bg-base-200/40">
                            <td>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                                    index % 4 === 0
                                      ? "bg-orange-100 text-orange-600"
                                      : index % 4 === 1
                                        ? "bg-blue-100 text-blue-600"
                                        : index % 4 === 2
                                          ? "bg-purple-100 text-purple-600"
                                          : "bg-green-100 text-green-600"
                                  }`}
                                >
                                  <BriefcaseBusiness className="h-5 w-5" />
                                </div>

                                <div>
                                  <p className="font-bold text-base-content">
                                    {j.title}
                                  </p>
                                  <p className="text-xs text-base-content/50">
                                    ID: JOB-{String(j.id).padStart(4, "0")}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td>
                              {positions.find((p) => p.id === j.position_id)
                                ?.name || "-"}
                            </td>

                            <td>{j.quota}</td>

                            <td>
                              {j.salary_range_min && j.salary_range_max
                                ? `Rp ${parseInt(
                                    j.salary_range_min,
                                  ).toLocaleString("id-ID")} - Rp ${parseInt(
                                    j.salary_range_max,
                                  ).toLocaleString("id-ID")}`
                                : "Dirahasiakan"}
                            </td>

                            <td>
                              <span className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-base-content/50" />
                                {j.deadline
                                  ? new Date(j.deadline).toLocaleDateString(
                                      "id-ID",
                                      {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      },
                                    )
                                  : "-"}
                              </span>
                            </td>

                            {activeTab === "all" && (
                              <td>
                                <span className={`badge badge-sm rounded-full gap-1 ${getJobStatusBadgeClass(j.status)}`}>
                                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                                  {String(j.status || "open").toUpperCase()}
                                </span>
                              </td>
                            )}

                            <td>
                              <div className="flex items-center justify-center gap-3 whitespace-nowrap">
                                <button
                                  className="h-8 inline-flex items-center justify-center rounded-full border border-blue-600 bg-gradient-to-b from-blue-400 to-blue-600 px-3 py-1 text-xs text-white transition-all duration-200 hover:from-blue-500 hover:to-blue-700"
                                  type="button"
                                  onClick={() =>
                                    navigate(`/app/job-openings/${j.id}`)
                                  }
                                >
                                  Lihat
                                </button>

                                <button
                                  className="h-8 inline-flex items-center justify-center rounded-full border border-yellow-500 bg-gradient-to-b from-yellow-300 to-yellow-500 px-3 py-1 text-xs text-black transition-all duration-200 hover:from-yellow-400 hover:to-yellow-600"
                                  type="button"
                                  onClick={() => handleEdit(j.id)}
                                >
                                  Edit
                                </button>

                                <button
                                  className="h-8 inline-flex items-center justify-center rounded-full border border-red-600 bg-gradient-to-b from-red-400 to-red-600 px-3 py-1 text-xs text-white transition-all duration-200 hover:from-red-500 hover:to-red-700"
                                  type="button"
                                  onClick={() => handleCancelJob(j.id)}
                                >
                                  Tutup
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <Pagination
                    page={activePage}
                    totalPages={Math.max(
                      1,
                      Math.ceil((activeTab === "all" ? filteredAll.length : filteredActive.length) / ITEMS_PER_PAGE),
                    )}
                    onChangePage={(p) => setActivePage(p)}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Riwayat Lowongan */}
        {activeTab === "history" && (
          <div className="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
            {loading ? (
              <div className="text-center py-10">Loading...</div>
            ) : (
              <>
                <div className="rounded-2xl border border-base-200 bg-base-100 p-4 mb-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <label className="input input-bordered flex w-full items-center gap-2 rounded-xl">
                      <Search className="h-4 w-4 text-base-content/50" />
                      <input
                        type="text"
                        placeholder="Cari judul lowongan..."
                        className="grow"
                        value={filtersHistory.title}
                        onChange={(e) =>
                          handleFilterChange("history", "title", e.target.value)
                        }
                      />
                    </label>

                    <select
                      className="select select-bordered w-full rounded-xl"
                      value={filtersHistory.position_id}
                      onChange={(e) =>
                        handleFilterChange(
                          "history",
                          "position_id",
                          e.target.value,
                        )
                      }
                    >
                      <option value="">Semua Posisi</option>
                      {positions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Kuota min"
                      className="input input-bordered w-full rounded-xl"
                      value={filtersHistory.quota}
                      onChange={(e) =>
                        handleFilterChange("history", "quota", e.target.value)
                      }
                    />

                    <button
                      type="button"
                      className="btn btn-outline rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-content"
                      onClick={() => resetFilters("history")}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset Filter
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-base-200">
                  <table className="table w-full">
                    <thead className="bg-base-200 text-base-content">
                      <tr>
                        <th>Judul Lowongan</th>
                        <th>Posisi</th>
                        <th>Kuota</th>
                        <th>Gaji</th>
                        <th>Deadline</th>
                        <th>Status</th>
                        <th className="text-center">Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedHistory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8">
                            Tidak ada riwayat lowongan.
                          </td>
                        </tr>
                      ) : (
                        paginatedHistory.map((j, index) => (
                          <tr key={j.id} className="hover:bg-base-200/40">
                            <td>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                                    index % 4 === 0
                                      ? "bg-slate-100 text-slate-600"
                                      : index % 4 === 1
                                        ? "bg-blue-100 text-blue-600"
                                        : index % 4 === 2
                                          ? "bg-purple-100 text-purple-600"
                                          : "bg-green-100 text-green-600"
                                  }`}
                                >
                                  <BriefcaseBusiness className="h-5 w-5" />
                                </div>

                                <div>
                                  <p className="font-bold text-base-content">
                                    {j.title}
                                  </p>
                                  <p className="text-xs text-base-content/50">
                                    ID: JOB-{String(j.id).padStart(4, "0")}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td>
                              {positions.find((p) => p.id === j.position_id)
                                ?.name || "-"}
                            </td>

                            <td>{j.quota}</td>

                            <td>
                              {j.salary_range_min && j.salary_range_max
                                ? `Rp ${parseInt(
                                    j.salary_range_min,
                                  ).toLocaleString("id-ID")} - Rp ${parseInt(
                                    j.salary_range_max,
                                  ).toLocaleString("id-ID")}`
                                : "Dirahasiakan"}
                            </td>

                            <td>
                              <span className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-base-content/50" />
                                {j.deadline
                                  ? new Date(j.deadline).toLocaleDateString(
                                      "id-ID",
                                      {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      },
                                    )
                                  : "-"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`badge badge-sm rounded-full ${
                                  j.status === "closed"
                                    ? "badge-error"
                                    : j.status === "draft"
                                      ? "badge-warning"
                                      : "badge-success"
                                }`}
                              >
                                {j.status === "draft" ? "Draf" : j.status === "closed" ? "Tutup" : "Buka"}
                              </span>
                            </td>

                            <td>
                              <div className="flex items-center justify-center gap-3 whitespace-nowrap">
                                <button
                                  className="h-8 inline-flex items-center justify-center rounded-full border border-blue-600 bg-gradient-to-b from-blue-400 to-blue-600 px-3 py-1 text-xs text-white transition-all duration-200 hover:from-blue-500 hover:to-blue-700"
                                  type="button"
                                  onClick={() =>
                                    navigate(`/app/job-openings/${j.id}`)
                                  }
                                >
                                  Lihat
                                </button>

                                <button
                                  className="h-8 inline-flex items-center justify-center rounded-full border border-yellow-500 bg-gradient-to-b from-yellow-300 to-yellow-500 px-3 py-1 text-xs text-black transition-all duration-200 hover:from-yellow-400 hover:to-yellow-600"
                                  type="button"
                                  onClick={() => handleEdit(j.id)}
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <Pagination
                    page={historyPage}
                    totalPages={Math.max(
                      1,
                      Math.ceil(filteredHistory.length / ITEMS_PER_PAGE),
                    )}
                    onChangePage={(p) => setHistoryPage(p)}
                    itemsPerPage={ITEMS_PER_PAGE}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  </>
);
}
