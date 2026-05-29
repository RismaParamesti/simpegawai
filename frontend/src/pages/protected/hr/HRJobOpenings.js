import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPageTitle } from "../../../features/common/headerSlice";
import jobService, { hrApi } from "../../../features/hr/api";
import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";

const defaultJobOpening = {
  position_id: "",
  title: "",
  description: "",
  requirements: "",
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
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [pendingCancelJob, setPendingCancelJob] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("add");

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
      const now = new Date();
      const active = [];
      const history = [];
      // Pisahkan dan update status jika perlu
      for (const job of jobs) {
        // Jika lowongan sudah ditutup, masukkan ke riwayat
        if (job.status === "closed") {
          history.push(job);
          continue;
        }
        // Pastikan hiring_status tetap ikut di state
        if (job.deadline && new Date(job.deadline) < now) {
          if (job.status !== "closed") {
            try {
              await jobService.updateJobOpening(job.id, {
                ...job,
                status: "closed",
                hiring_status: job.hiring_status || "ongoing",
              });
              history.push({ ...job, status: "closed" });
            } catch (e) {
              history.push({ ...job, status: "closed" });
            }
          } else {
            history.push(job);
          }
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
      // Pastikan base_position, developer_specialization
      if (!payload.base_position) payload.base_position = "";
      if (!payload.developer_specialization)
        payload.developer_specialization = "";
      if (!payload.hiring_status) payload.hiring_status = "ongoing";
      // Convert salary fields to numbers if present (they are stored as digit-only strings)
      if (payload.salary_range_min)
        payload.salary_range_min = parseInt(payload.salary_range_min, 10);
      if (payload.salary_range_max)
        payload.salary_range_max = parseInt(payload.salary_range_max, 10);
      if (editMode && editId) {
        await jobService.updateJobOpening(editId, payload);
      } else {
        await jobService.createJobOpening(payload);
      }
      setForm(defaultJobOpening);
      setEditMode(false);
      setEditId(null);
      setActiveTab("active");
      fetchJobOpenings();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function handleEdit(id) {
    // Cari di jobOpenings, jika tidak ada cari di historyOpenings
    let data = jobOpenings.find((j) => j.id === id);
    if (!data) {
      data = historyOpenings.find((j) => j.id === id);
    }
    if (data) {
      // Pastikan hiring_status tetap ada di form, walau null/undefined
      setForm((f) => ({
        ...f,
        ...data,
        base_position:
          data.base_position !== undefined ? data.base_position : "",
        hiring_status:
          data.hiring_status !== undefined ? data.hiring_status : "",
      }));
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
      setShowCancelPopup(false);
      setPendingCancelJob(null);
      await fetchJobOpenings();
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

  // Helper to format numbers with dot as thousand separator (Indonesian style)
  function formatWithDots(numStr) {
    if (numStr === null || numStr === undefined || numStr === "") return "";
    const s = String(numStr).replace(/\D/g, "");
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // Filters for active and history lists
  const [filtersActive, setFiltersActive] = useState({ title: "", position_id: "", quota: "", deadline: "" });
  const [filtersHistory, setFiltersHistory] = useState({ title: "", position_id: "", quota: "", deadline: "" });

  function handleFilterChange(section, name, value) {
    if (section === "active") {
      setFiltersActive((f) => ({ ...f, [name]: value }));
    } else {
      setFiltersHistory((f) => ({ ...f, [name]: value }));
    }
  }

  function resetFilters(section) {
    if (section === "active") setFiltersActive({ title: "", position_id: "", quota: "", deadline: "" });
    else setFiltersHistory({ title: "", position_id: "", quota: "", deadline: "" });
  }

  function applyFilters(list, filters) {
    return list.filter((j) => {
      if (filters.title && !(String(j.title || "").toLowerCase().includes(String(filters.title).toLowerCase()))) return false;
      if (filters.position_id && String(j.position_id) !== String(filters.position_id)) return false;
      if (filters.quota) {
        const q = parseInt(filters.quota, 10);
        if (!isNaN(q) && (isNaN(j.quota) || parseInt(j.quota, 10) < q)) return false;
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

  const menu = [
    { key: "add", label: "Tambah Lowongan" },
    { key: "active", label: "Daftar Lowongan Aktif" },
    { key: "history", label: "Riwayat Lowongan" },
  ];

  // Pagination state
  const ITEMS_PER_PAGE = 10;
  const [activePage, setActivePage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => setActivePage(1), [filtersActive.title, filtersActive.position_id, filtersActive.quota, filtersActive.deadline]);
  useEffect(() => setHistoryPage(1), [filtersHistory.title, filtersHistory.position_id, filtersHistory.quota, filtersHistory.deadline]);

  // Ensure current page is within bounds when filtered length changes
  useEffect(() => {
    const total = Math.max(1, Math.ceil(filteredActive.length / ITEMS_PER_PAGE));
    if (activePage > total) setActivePage(total);
  }, [filteredActive.length, activePage]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE));
    if (historyPage > total) setHistoryPage(total);
  }, [filteredHistory.length, historyPage]);

  const paginatedActive = filteredActive.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);
  const paginatedHistory = filteredHistory.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);

  return (
    <>
      {/* Modal Detail */}
      {showDetail && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative border border-base-300">
            {/* HEADER */}
            <div className="border-b border-base-300 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-base-content">
                Detail Lowongan
              </h2>

              <button
                className="text-base-content hover:text-primary text-xl"
                onClick={handleCloseDetail}
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* INFORMASI UTAMA */}
              <div>
                <h3 className="font-semibold text-base-content mb-3">
                  Informasi Pekerjaan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-base-content/70">Judul</p>
                    <p className="font-semibold text-base-content">
                      {detailData.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-base-content/70">Posisi</p>
                    <p className="font-semibold text-base-content">
                      {positions.find((p) => p.id === detailData.position_id)
                        ?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-base-content/70">Kuota</p>
                    <p className="font-semibold text-base-content">
                      {detailData.quota}
                    </p>
                  </div>

                  <div>
                    <p className="text-base-content/70">Jenis</p>
                    <p className="font-semibold capitalize text-base-content">
                      {detailData.employment_type}
                    </p>
                  </div>

                  <div>
                    <p className="text-base-content/70">Lokasi</p>
                    <p className="font-semibold text-base-content">
                      {detailData.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-base-content/70">Deadline</p>
                    <p className="font-semibold text-base-content">
                      {detailData.deadline
                        ? new Date(detailData.deadline).toLocaleDateString(
                            "id-ID",
                          )
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-base-content/70">Gaji</p>
                    <p className="font-semibold text-base-content">
                      {detailData.salary_range_min &&
                      detailData.salary_range_max
                        ? `Rp ${parseInt(
                            detailData.salary_range_min,
                          ).toLocaleString("id-ID")} - Rp ${parseInt(
                            detailData.salary_range_max,
                          ).toLocaleString("id-ID")}`
                        : "Dirahasiakan"}
                    </p>
                  </div>

                  <div>
                    <p className="text-base-content/70">Status</p>
                    <span
                      className={`badge ${
                        detailData.status === "open"
                          ? "badge-success"
                          : detailData.status === "closed"
                            ? "badge-error"
                            : "badge-warning"
                      }`}
                    >
                      {detailData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* DESKRIPSI */}
              <div>
                <h3 className="font-semibold text-base-content mb-2">
                  Deskripsi Pekerjaan
                </h3>

                <p className="text-sm text-base-content leading-relaxed whitespace-pre-line">
                  {detailData.description || "-"}
                </p>
              </div>

              {/* PERSYARATAN */}
              <div>
                <h3 className="font-semibold text-base-content mb-2">
                  Persyaratan
                </h3>

                <p className="text-sm text-base-content leading-relaxed whitespace-pre-line">
                  {detailData.requirements || "-"}
                </p>
              </div>

              {/* TANGGUNG JAWAB */}
              <div>
                <h3 className="font-semibold text-base-content mb-2">
                  Tanggung Jawab
                </h3>

                <p className="text-sm text-base-content leading-relaxed whitespace-pre-line">
                  {detailData.responsibilities || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus (match AdminDepartement style) */}
      {showCancelPopup && pendingCancelJob && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-0 overflow-hidden rounded-2xl">
            <div className="bg-error text-error-content px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                  ⚠️
                </div>

                <div>
                  <h3 className="font-bold text-xl">Tutup Lowongan</h3>

                  <p className="text-sm opacity-90 mt-1">
                    Tindakan ini akan menutup lowongan dan mengubah hiring status menjadi Shortlisting.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-base-200 rounded-xl p-4">
                <p className="text-sm text-base-content/60">Lowongan yang akan ditutup:</p>

                <h2 className="text-xl font-bold mt-2">{pendingCancelJob?.title}</h2>

                <p className="text-sm text-base-content/50 mt-1">Posisi: {positions.find((p) => p.id === pendingCancelJob.position_id)?.name || '-'}</p>
              </div>

              <div className="alert alert-warning mt-5 text-sm">
                <span>Lowongan akan ditutup. Anda masih dapat membuka kembali lowongan ini nanti jika diperlukan.</span>
              </div>

              <div className="modal-action mt-6">
                <button className="btn btn-ghost" onClick={closeCancelPopup} disabled={loading}>
                  Batal
                </button>

                <button className="btn btn-error text-white" onClick={confirmCancelJob} disabled={loading}>
                  {loading ? "Memproses..." : "Ya, Tutup"}
                </button>
              </div>
            </div>
          </div>

          <div className="modal-backdrop bg-black/40" onClick={closeCancelPopup}></div>
        </div>
      )}

      <TitleCard
        title="Manajemen Lowongan"
        topMargin="mt-4"
      >
        <div className="space-y-6">
          <div className="flex w-full bg-base-200 p-2 rounded-2xl gap-2">
            {menu.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveTab(m.key)}
                className={`flex-1 text-center py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === m.key
                    ? "bg-primary text-white shadow-md"
                    : "text-base-content hover:bg-base-300"
                }`}
              >
                {m.key === "add" && editMode ? "Edit Lowongan" : m.label}
              </button>
            ))}
          </div>

          {activeTab === "add" && (
            <div className="rounded-2xl border border-base-200 bg-base-100 p-6">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
            <div>
              <label className="label label-text text-base-content">Posisi</label>
              <select
                name="position_id"
                value={form.position_id}
                onChange={handleChange}
                required
                className="select select-bordered w-full"
              >
                <option value="">Pilih Posisi</option>
                {positions
                  .filter((pos) => {
                    const name = String(pos.name || "").toLowerCase().trim();
                    const level = String(pos.level || "").toLowerCase().trim();
                    return !name.includes("commissioner") && level !== "commissioner";
                  })
                  .map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.name}
                    </option>
                  ))}
              </select>
              {(() => {
                const selected = positions.find((p) => String(p.id) === String(form.position_id))?.name?.toLowerCase() || "";
                if (selected.includes("mentor") || selected.includes("project manager")) {
                  return (
                    <div className="mt-2">
                      <label className="label label-text text-base-content">Bidang/Spesialisasi</label>
                      <select
                        name="base_position"
                        value={form.base_position || ""}
                        onChange={handleChange}
                        className="select select-bordered w-full"
                        required
                      >
                        <option value="">Pilih Bidang</option>
                        {BASE_POSITIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (selected === "developer") {
                  return (
                    <div className="mt-2">
                      <label className="label label-text text-base-content">Bidang Developer</label>
                      <select
                        name="developer_specialization"
                        value={form.developer_specialization || ""}
                        onChange={handleChange}
                        className="select select-bordered w-full"
                        required
                      >
                        <option value="">Pilih Bidang Developer</option>
                        {DEVELOPER_SPECIALIZATIONS.map((b) => (
                          <option key={b.value} value={b.value}>{b.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div>
              <label className="label label-text text-base-content">Judul</label>
              <input name="title" value={form.title} onChange={handleChange} required className="input input-bordered w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="label label-text text-base-content">Deskripsi</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="textarea textarea-bordered w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="label label-text text-base-content">Persyaratan</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} className="textarea textarea-bordered w-full" />
            </div>
            <div className="md:col-span-2">
              <label className="label label-text text-base-content">Tanggung Jawab</label>
              <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} className="textarea textarea-bordered w-full" />
            </div>
            <div>
              <label className="label label-text text-base-content">Kuota</label>
              <input type="number" name="quota" value={form.quota} onChange={handleChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label label-text text-base-content">Jenis</label>
              <select name="employment_type" value={form.employment_type} onChange={handleChange} className="select select-bordered w-full">
                <option value="permanent">Tetap</option>
                <option value="contract">Kontrak</option>
                <option value="intern">Magang</option>
              </select>
            </div>
            <div>
              <label className="label label-text text-base-content">Gaji Minimum</label>
              <input type="text" name="salary_range_min" value={formatWithDots(form.salary_range_min)} onChange={handleChange} className="input input-bordered w-full" inputMode="numeric" pattern="[0-9.]*" />
            </div>
            <div>
              <label className="label label-text text-base-content">Gaji Maksimum</label>
              <input type="text" name="salary_range_max" value={formatWithDots(form.salary_range_max)} onChange={handleChange} className="input input-bordered w-full" inputMode="numeric" pattern="[0-9.]*" />
            </div>
            <div>
              <label className="label label-text text-base-content">Lokasi</label>
              <input name="location" value={form.location} onChange={handleChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label label-text text-base-content">Deadline</label>
              <input type="date" name="deadline" value={form.deadline ? form.deadline.substring(0, 10) : ""} onChange={handleChange} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="label label-text text-base-content">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="select select-bordered w-full">
                <option value="open">Buka</option>
                {editMode && <option value="closed">Tutup</option>}
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="label label-text text-base-content">Hiring Status</label>
              <select name="hiring_status" value={form.hiring_status || ""} onChange={handleChange} className={`select select-bordered w-full ${!editMode ? "opacity-60" : ""}`} required disabled={!editMode}>
                <option value="">Pilih Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="shortlisting">Shortlisting</option>
                <option value="interview">Interview</option>
                <option value="offering">Offering</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
              {!editMode && <p className="text-xs text-base-content/60 mt-1">Status awal: <span className="font-medium">Ongoing</span> (tidak dapat diubah saat membuat)</p>}
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>{editMode ? "Update" : "Simpan"}</button>
              {editMode && <button type="button" className="btn btn-ghost" onClick={handleCancelEdit} disabled={loading}>Batal</button>}
            </div>
            {error && <div className="text-error md:col-span-2">{error}</div>}
              </form>
            </div>
          )}

          {activeTab === "active" && (
            <div className="rounded-2xl border border-base-200 bg-base-100 p-6">
              {loading ? (
                <div className="text-center py-6">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <input type="text" placeholder="Cari Judul" className="input input-bordered w-full" value={filtersActive.title} onChange={(e) => handleFilterChange("active", "title", e.target.value)} />
                    <select className="select select-bordered w-full" value={filtersActive.position_id} onChange={(e) => handleFilterChange("active", "position_id", e.target.value)}>
                      <option value="">Semua Posisi</option>
                      {positions.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                    <input type="number" placeholder="Kuota min" className="input input-bordered w-full" value={filtersActive.quota} onChange={(e) => handleFilterChange("active", "quota", e.target.value)} />
                    <div className="flex items-center gap-2">
                      <button type="button" className="btn btn-secondary btn-sm rounded-full" onClick={() => resetFilters("active")}>Reset</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Judul</th><th>Posisi</th><th>Kuota</th><th>Gaji</th><th>Deadline</th><th>Status</th><th className="text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedActive.length === 0 ? (
                          <tr><td colSpan={7} className="text-center py-4">Tidak ada lowongan aktif.</td></tr>
                        ) : (
                          paginatedActive.map((j) => (
                            <tr key={j.id} className="hover">
                              <td className="font-semibold">{j.title}</td>
                              <td>{positions.find((p) => p.id === j.position_id)?.name || "-"}</td>
                              <td>{j.quota}</td>
                              <td>{j.salary_range_min && j.salary_range_max ? `Rp ${parseInt(j.salary_range_min).toLocaleString("id-ID")} - Rp ${parseInt(j.salary_range_max).toLocaleString("id-ID")}` : "Dirahasiakan"}</td>
                              <td>{j.deadline ? new Date(j.deadline).toLocaleDateString("id-ID") : "-"}</td>
                              <td><span className={`badge ${j.status === "open" ? "badge-success" : j.status === "closed" ? "badge-error" : "badge-warning"}`}>{j.status}</span></td>
                              <td className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button className="px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg border border-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-200" type="button" onClick={() => navigate(`/app/job-openings/${j.id}`)}>Lihat</button>
                                  <button className="px-3 py-1 text-xs bg-gradient-to-b from-yellow-300 to-yellow-500 text-black rounded-full shadow-md hover:shadow-lg border border-yellow-500 hover:from-yellow-400 hover:to-yellow-600 transition-all duration-200" type="button" onClick={() => handleEdit(j.id)}>Edit</button>
                                  <button className="btn btn-xs btn-error text-white" type="button" onClick={() => handleCancelJob(j.id)}>Tutup</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={activePage} totalPages={Math.max(1, Math.ceil(filteredActive.length / ITEMS_PER_PAGE))} onChangePage={(p) => setActivePage(p)} itemsPerPage={ITEMS_PER_PAGE} />
                </>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="rounded-2xl border border-base-200 bg-base-100 p-6">
              {loading ? (
                <div className="text-center py-6">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <input type="text" placeholder="Cari Judul" className="input input-bordered w-full" value={filtersHistory.title} onChange={(e) => handleFilterChange("history", "title", e.target.value)} />
                    <select className="select select-bordered w-full" value={filtersHistory.position_id} onChange={(e) => handleFilterChange("history", "position_id", e.target.value)}>
                      <option value="">Semua Posisi</option>
                      {positions.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                    </select>
                    <input type="number" placeholder="Kuota min" className="input input-bordered w-full" value={filtersHistory.quota} onChange={(e) => handleFilterChange("history", "quota", e.target.value)} />
                    <div className="flex items-center gap-2">
                      <button type="button" className="btn btn-secondary btn-sm rounded-full" onClick={() => resetFilters("history")}>Reset</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Judul</th><th>Posisi</th><th>Kuota</th><th>Gaji</th><th>Deadline</th><th>Status</th><th className="text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHistory.length === 0 ? (
                          <tr><td colSpan={7} className="text-center py-4">Tidak ada riwayat lowongan.</td></tr>
                        ) : (
                          paginatedHistory.map((j) => (
                            <tr key={j.id} className="hover">
                              <td className="font-semibold">{j.title}</td>
                              <td>{positions.find((p) => p.id === j.position_id)?.name || "-"}</td>
                              <td>{j.quota}</td>
                              <td>{j.salary_range_min && j.salary_range_max ? `Rp ${parseInt(j.salary_range_min).toLocaleString("id-ID")} - Rp ${parseInt(j.salary_range_max).toLocaleString("id-ID")}` : "Dirahasiakan"}</td>
                              <td>{j.deadline ? new Date(j.deadline).toLocaleDateString("id-ID") : "-"}</td>
                              <td><span className={`badge ${j.status === "open" ? "badge-success" : j.status === "closed" ? "badge-error" : "badge-warning"}`}>{j.status}</span></td>
                              <td className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button className="px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg border border-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-200" type="button" onClick={() => navigate(`/app/job-openings/${j.id}`)}>Lihat</button>
                                  <button className="px-3 py-1 text-xs bg-gradient-to-b from-yellow-300 to-yellow-500 text-black rounded-full shadow-md hover:shadow-lg border border-yellow-500 hover:from-yellow-400 hover:to-yellow-600 transition-all duration-200" type="button" onClick={() => handleEdit(j.id)}>Edit</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={historyPage} totalPages={Math.max(1, Math.ceil(filteredHistory.length / ITEMS_PER_PAGE))} onChangePage={(p) => setHistoryPage(p)} itemsPerPage={ITEMS_PER_PAGE} />
                </>
              )}
            </div>
          )}
        </div>
      </TitleCard>
    </>
  );
}
