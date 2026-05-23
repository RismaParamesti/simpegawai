import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getRequiredDocuments,
  DOCUMENT_FIELD_METADATA,
} from "../../../utils/documentRequirements";
import { useDispatch } from "react-redux";
import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";
import { setPageTitle } from "../../../features/common/headerSlice";
import api from "../../../lib/api";
import CheckBadgeIcon from "@heroicons/react/24/outline/UserPlusIcon";
import { getStatusLabel } from "../../../utils/statusLabels";
// Komponen Modal sederhana
function Modal({
  open,
  onClose,
  onSubmit,
  children,
  title,
  submitLabel = "Tolak",
  submitButtonClassName = "btn-error",
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-6 text-base-content shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-base-content">{title}</h3>
        {children}
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn btn-sm btn-outline" onClick={onClose}>
            Batal
          </button>
          <button
            className={`btn btn-sm ${submitButtonClassName}`}
            onClick={onSubmit}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getCoverLetterFileUrl(value) {
  if (!value) return "";

  if (typeof value === "string") {
    if (value.startsWith("http")) return value;
    if (value.startsWith("/")) {
      return `http://localhost:5000${value}`;
    }
    return `http://localhost:5000/${value}`;
  }

  if (typeof value === "number") {
    return `http://localhost:5000/${value}`;
  }

  if (typeof value === "object") {
    const fileValue =
      value.url || value.path || value.file_url || value.filename || value.name;
    return getCoverLetterFileUrl(fileValue);
  }

  return String(value);
}

function getFileDisplayText(value) {
  if (!value) return "";
  const asString = (v) => {
    const s = String(v);
    try {
      const decoded = decodeURIComponent(s);
      const parts = decoded.split(/[/\\]/).filter(Boolean);
      return parts.length ? parts[parts.length - 1] : decoded;
    } catch (e) {
      const parts = s.split(/[/\\]/).filter(Boolean);
      return parts.length ? parts[parts.length - 1] : s;
    }
  };

  if (typeof value === "string" || typeof value === "number") {
    return asString(value);
  }

  if (typeof value === "object") {
    const prop =
      value.name || value.filename || value.file_name || value.file_url || value.url || value.path;
    if (prop) return asString(prop);
    return "File terlampir";
  }

  return asString(value);
}

function getFileTypeFromPath(filePath) {
  if (!filePath) return "unknown";

  const lowerPath = String(filePath).toLowerCase();
  if (lowerPath.endsWith(".pdf")) return "pdf";
  if (
    lowerPath.endsWith(".jpg") ||
    lowerPath.endsWith(".jpeg") ||
    lowerPath.endsWith(".png") ||
    lowerPath.endsWith(".webp")
  ) {
    return "image";
  }

  return "unknown";
}

function getAssetUrl(filePath) {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const baseUrl = (process.env.REACT_APP_BASE_URL || "http://localhost:5000").replace(
    /\/$/,
    "",
  );
  const normalizedPath = String(filePath).replace(/^\/+/, "");

  return `${baseUrl}/${normalizedPath}`;
}

function isExternalLink(value) {
  if (typeof value !== "string") return false;
  if (!/^https?:\/\//i.test(value)) return false;
  return !/^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?\//i.test(value);
}

export default function HRRecruitmentProcessDetail() {
  // Untuk popup Tolak
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showMassUpdatePopup, setShowMassUpdatePopup] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const dispatch = useDispatch();
  const location = useLocation();

  const [job, setJob] = useState(location.state?.job || null);
  // Ambil jobId dari query string
  const params = new URLSearchParams(location.search);
  const jobId = params.get("job_id");

  // Ambil applicationId dari path jika ada /recruitment-process/:id
  const urlApplicationId = location.pathname.includes("/recruitment-process/")
    ? parseInt(location.pathname.split("/recruitment-process/").pop(), 10)
    : null;

  const [view, setView] = useState("list"); // list | detail
  const [activeTab, setActiveTab] = useState("submitted"); // submitted | screening | history
  const [selected, setSelected] = useState(null);
  const [tabFilters, setTabFilters] = useState({
    submitted: { name: "", education: "", year: "" },
    screening: { name: "", education: "", year: "" },
    history: { name: "", education: "", year: "" },
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittedPage, setSubmittedPage] = useState(1);
  const [screeningPage, setScreeningPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const submittedItemsPerPage = 10;
  const screeningItemsPerPage = 10;
  const historyItemsPerPage = 10;

  // ================= INIT =================
  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;

      try {
        const res = await api.get(`/job-openings/${jobId}`);
        setJob(res.data?.job || null);
      } catch (err) {
        console.error("Gagal mengambil data lowongan", err);
      }
    };

    fetchJob();
    fetchApplications();
    // eslint-disable-next-line
  }, [jobId]);

  useEffect(() => {
    dispatch(
      setPageTitle({
        title: job
          ? `Pelamar Posisi ${job.position_name || job.title || "-"}`
          : "Data Pelamar",
      }),
    );
  }, [dispatch, job]);

  // Jika ada id aplikasi di URL, set selected otomatis jika ada di hasil fetch
  useEffect(() => {
    if (applications.length === 0 || selected) return;

    // Hanya auto-buka detail jika ada id aplikasi di path
    if (urlApplicationId) {
      const found = applications.find(
        (app) => Number(app.application_id) === Number(urlApplicationId),
      );
      if (found) {
        setSelected(found);
        setView("detail");
      }
    }
    // Jika tidak ada id aplikasi di path, tetap di list
  }, [urlApplicationId, applications, selected]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let res;
      // Jika ada jobId, filter aplikasi berdasarkan jobId
      if (jobId) {
        res = await api.get(
          `/candidates/admin/applications?job_opening_id=${jobId}`,
          { headers: getAuthHeaders() },
        );
      } else {
        // Jika tidak ada jobId, ambil semua aplikasi
        res = await api.get(`/candidates/admin/applications`, {
          headers: getAuthHeaders(),
        });
      }
      // Debug: pastikan id aplikasi benar
      if (res.data.applications && Array.isArray(res.data.applications)) {
        console.log(
          "[DEBUG] Applications fetched:",
          res.data.applications.map((a) => ({
            id: a.application_id,
            candidate_id: a.candidate_id,
          })),
        );
      }
      setApplications(res.data.applications || []);
    } catch (err) {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!selected) return;
    const appId = selected?.application_id || selected?.id;

    try {
      await api.put(
        `/candidates/admin/applications/${appId}/status`,
        {
          status: "screening",
        },
        { headers: getAuthHeaders() },
      );

      setApplications((prev) =>
        prev.map((app) =>
          (app.application_id || app.id) === appId
            ? { ...app, status: "screening" }
            : app,
        ),
      );

      setActiveTab("screening");
      setView("list");
    } catch (err) {
      alert("Gagal menyimpan perubahan status pelamar");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectNotes.trim() || !selected) return;

    try {
      const appId = selected?.application_id || selected?.id;

      await api.put(
        `/candidates/admin/applications/${appId}/status`,
        {
          status: "ditolak",
          admin_notes: rejectNotes,
        },
        { headers: getAuthHeaders() },
      );

      setApplications((prev) =>
        prev.map((app) =>
          (app.application_id || app.id) === appId
            ? { ...app, status: "ditolak", admin_notes: rejectNotes }
            : app,
        ),
      );

      setShowRejectPopup(false);
      setRejectNotes("");
      setActiveTab("screening");
      setView("list");
    } catch (err) {
      alert("Gagal menyimpan penolakan");
    }
  };

  const handleMassUpdateSubmit = async () => {
    const screeningIds = passedApplicants.map(
      (app) => app.application_id || app.id,
    );

    if (screeningIds.length === 0) return;

    try {
      await Promise.all(
        screeningIds.map((id) =>
          api.put(
            `/candidates/admin/applications/${id}/status`,
            { status: "lolos_dokumen" },
            { headers: getAuthHeaders() },
          ),
        ),
      );

      if (jobId) {
        await api.put(`/job-openings/${jobId}/advance-to-interview`);
      }

      setJob((prev) =>
        prev ? { ...prev, hiring_status: "interview" } : prev,
      );
      setActiveTab("history");

      setShowMassUpdatePopup(false);
      await fetchApplications();
    } catch (err) {
      alert("Gagal update status massal");
    }
  };

  const passedApplicants = useMemo(() => {
    return applications.filter((app) => app.status === "screening");
  }, [applications]);

  const isResultPublished =
    job?.hiring_status === "interview" || job?.hiring_status === "completed";

  const shortlistedApplications = useMemo(() => {
    return applications.filter((app) => {
      if (app.status === "screening") return true;
      if (app.status === "ditolak") return !isResultPublished;
      return false;
    });
  }, [applications, isResultPublished]);

  // Untuk tabel riwayat, jika lowongan sudah closed & completed, tampilkan SEMUA aplikasi kecuali yang diterima
  // Jika belum completed, hanya tampilkan yang ditolak saja
  const historyApplications = useMemo(() => {
    const isClosedCompleted =
      job && job.status === "closed" && job.hiring_status === "completed";
    if (isClosedCompleted) {
      // Tampilkan semua aplikasi kecuali yang statusnya 'diterima'
      return applications.filter((app) => app.status !== "diterima");
    } else if (job?.hiring_status === "interview") {
      // Setelah mass update, shortlist yang sudah jadi lolos_dokumen juga masuk riwayat
      return applications.filter(
        (app) =>
          app.status === "ditolak" ||
          app.status === "lolos_dokumen" ||
          app.status === "withdrawn",
      );
    } else {
      // Default: hanya yang dibatalkan; hasil screening menunggu publish
      return applications.filter((app) => app.status === "withdrawn");
    }
  }, [applications, job]);

  // ================= FILTER =================
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => app.status === "submitted")
      .filter(
        (app) =>
          (app.candidate_name || app.name || "")
            .toLowerCase()
            .includes(tabFilters.submitted.name.toLowerCase()) &&
          (tabFilters.submitted.education
            ? String(app.education_level || "")
                .toLowerCase()
                .includes(tabFilters.submitted.education.toLowerCase())
            : true) &&
          (tabFilters.submitted.year
            ? String(app.graduation_year || "").includes(
                tabFilters.submitted.year,
              )
            : true),
      );
  }, [applications, tabFilters.submitted]);

  const submittedTotalPages = Math.ceil(
    filteredApplications.length / submittedItemsPerPage,
  );

  const paginatedSubmittedApplications = useMemo(() => {
    const startIndex = (submittedPage - 1) * submittedItemsPerPage;
    return filteredApplications.slice(
      startIndex,
      startIndex + submittedItemsPerPage,
    );
  }, [filteredApplications, submittedPage]);

  const filteredShortlistedApplications = useMemo(() => {
    return shortlistedApplications.filter((app) => {
      const nameMatch = (app.candidate_name || app.name || "")
        .toLowerCase()
        .includes(tabFilters.screening.name.toLowerCase());
      const educationMatch = tabFilters.screening.education
        ? String(app.education_level || "")
            .toLowerCase()
            .includes(tabFilters.screening.education.toLowerCase())
        : true;
      const yearMatch = tabFilters.screening.year
        ? String(app.graduation_year || "").includes(tabFilters.screening.year)
        : true;

      return nameMatch && educationMatch && yearMatch;
    });
  }, [shortlistedApplications, tabFilters.screening]);

  const screeningTotalPages = Math.ceil(
    filteredShortlistedApplications.length / screeningItemsPerPage,
  );

  const paginatedShortlistedApplications = useMemo(() => {
    const startIndex = (screeningPage - 1) * screeningItemsPerPage;
    return filteredShortlistedApplications.slice(
      startIndex,
      startIndex + screeningItemsPerPage,
    );
  }, [filteredShortlistedApplications, screeningPage]);

  const filteredHistoryApplications = useMemo(() => {
    return historyApplications.filter((app) => {
      const nameMatch = (app.candidate_name || app.name || "")
        .toLowerCase()
        .includes(tabFilters.history.name.toLowerCase());
      const educationMatch = tabFilters.history.education
        ? String(app.education_level || "")
            .toLowerCase()
            .includes(tabFilters.history.education.toLowerCase())
        : true;
      const yearMatch = tabFilters.history.year
        ? String(app.graduation_year || "").includes(tabFilters.history.year)
        : true;

      return nameMatch && educationMatch && yearMatch;
    });
  }, [historyApplications, tabFilters.history]);

  const historyTotalPages = Math.ceil(
    filteredHistoryApplications.length / historyItemsPerPage,
  );

  const paginatedHistoryApplications = useMemo(() => {
    const startIndex = (historyPage - 1) * historyItemsPerPage;
    return filteredHistoryApplications.slice(startIndex, startIndex + historyItemsPerPage);
  }, [filteredHistoryApplications, historyPage]);

  const handleTabFilterChange = (tab, field, value) => {
    setTabFilters((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value,
      },
    }));
  };

  const resetTabFilters = (tab) => {
    setTabFilters((prev) => ({
      ...prev,
      [tab]: { name: "", education: "", year: "" },
    }));
  };

  useEffect(() => {
    setSubmittedPage(1);
  }, [tabFilters.submitted.name, tabFilters.submitted.education, tabFilters.submitted.year, applications.length]);

  useEffect(() => {
    setScreeningPage(1);
  }, [tabFilters.screening.name, tabFilters.screening.education, tabFilters.screening.year, applications.length]);

  useEffect(() => {
    setHistoryPage(1);
  }, [tabFilters.history.name, tabFilters.history.education, tabFilters.history.year, historyApplications.length]);

  const openPreviewModal = (filePath, title) => {
    if (!filePath) return;
    setSelectedPreview({
      path: filePath,
      title,
      type: getFileTypeFromPath(filePath),
    });
  };

  const closePreviewModal = () => {
    setSelectedPreview(null);
  };

  // Sudah digabung di atas

  return (
    <>
      {/* ===================== LIST ===================== */}
      {view === "list" &&
        (() => {
          const menu = [
            { key: "submitted", label: "Data Pelamar" },
            { key: "screening", label: "Shortlisted Kandidat" },
            { key: "history", label: "Riwayat Pelamar" },
          ];

          return (
            <TitleCard
              title={
                job
                  ? `Data Pelamar - ${job.position_name || job.title}`
                  : "Data Pelamar"
              }
              topMargin="mt-4"
              TopSideButtons={
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => window.history.back()}
                >
                  Kembali
                </button>
              }
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
                      {m.label}
                    </button>
                  ))}
                </div>

                {activeTab === "submitted" && (
                  <div className="rounded-2xl border border-base-200 bg-base-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <input
                        className="input input-bordered w-full"
                        placeholder="Cari nama..."
                        value={tabFilters.submitted.name}
                        onChange={(e) =>
                          handleTabFilterChange(
                            "submitted",
                            "name",
                            e.target.value,
                          )
                        }
                      />
                      <input
                        className="input input-bordered w-full"
                        placeholder="Cari pendidikan..."
                        value={tabFilters.submitted.education}
                        onChange={(e) =>
                          handleTabFilterChange(
                            "submitted",
                            "education",
                            e.target.value,
                          )
                        }
                      />
                      <input
                        className="input input-bordered w-full"
                        placeholder="Cari tahun lulus..."
                        value={tabFilters.submitted.year}
                        onChange={(e) =>
                          handleTabFilterChange(
                            "submitted",
                            "year",
                            e.target.value,
                          )
                        }
                      />
                      <div className="flex items-center gap-2 h-full">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm rounded-full w-full -translate-y-0.5"
                          onClick={() => resetTabFilters("submitted")}
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {loading ? (
                      <div className="text-center py-10">Loading...</div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="table table-zebra">
                            <thead className="text-center">
                              <tr>
                                <th>Nama</th>
                                <th>Email</th>
                                <th>Pendidikan</th>
                                <th>Tahun Lulus</th>
                                <th>NPWP</th>
                                <th>Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedSubmittedApplications.map((item) => (
                                <tr key={item?.application_id}>
                                  <td>{item.candidate_name || item.name}</td>
                                  <td>{item.candidate_email || item.email}</td>
                                  <td className="text-center">
                                    {item.education_level} - {item.major}
                                  </td>
                                  <td className="text-center">
                                    {item.graduation_year || "-"}
                                  </td>
                                  <td className="text-center">
                                    {item.npwp || "-"}
                                  </td>
                                  <td className="text-center">
                                    <button
                                      className="btn btn-ghost btn-xs"
                                      onClick={() => {
                                        setSelected({
                                          ...item,
                                          isHistory: false,
                                        });
                                        setView("detail");
                                      }}
                                    >
                                      Detail
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              {filteredApplications.length === 0 && (
                                <tr>
                                  <td
                                    colSpan={6}
                                    className="text-center opacity-70"
                                  >
                                    Tidak ada data
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {filteredApplications.length > 0 && (
                          <Pagination
                            page={submittedPage}
                            totalPages={submittedTotalPages}
                            onChangePage={setSubmittedPage}
                            itemsPerPage={submittedItemsPerPage}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeTab === "screening" && (
                  <div className="rounded-2xl border border-base-200 bg-base-100 p-5">
                    {/* FILTER + ACTION */}
                    <div className="mb-5 flex flex-col xl:flex-row gap-4 xl:items-end xl:justify-between">
                      {/* FILTER */}
                      <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <input
                          className="input input-bordered w-full"
                          placeholder="Cari nama..."
                          value={tabFilters.screening.name}
                          onChange={(e) =>
                            handleTabFilterChange(
                              "screening",
                              "name",
                              e.target.value,
                            )
                          }
                        />

                        <input
                          className="input input-bordered w-full"
                          placeholder="Cari pendidikan..."
                          value={tabFilters.screening.education}
                          onChange={(e) =>
                            handleTabFilterChange(
                              "screening",
                              "education",
                              e.target.value,
                            )
                          }
                        />

                        <input
                          className="input input-bordered w-full"
                          placeholder="Cari tahun lulus..."
                          value={tabFilters.screening.year}
                          onChange={(e) =>
                            handleTabFilterChange(
                              "screening",
                              "year",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      {/* BUTTON */}
                      <div className="flex flex-col sm:flex-row gap-2 xl:flex-shrink-0">
                        <button
                          type="button"
                          className="btn btn-secondary rounded-xl"
                          onClick={() => resetTabFilters("screening")}
                        >
                          Reset Filter
                        </button>
                        <button
                          type="button"
                          className="btn btn-success rounded-xl gap-2"
                          onClick={() => setShowMassUpdatePopup(true)}
                        >
                          Publish Hasil
                        </button>
                      </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-x-auto">
                      <table className="table table-zebra">
                        <thead className="text-center">
                          <tr>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Pendidikan</th>
                            <th>Tahun Lulus</th>
                            <th>NPWP</th>
                            <th>Hasil</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedShortlistedApplications.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="text-center opacity-70"
                              >
                                Belum ada kandidat shortlist
                              </td>
                            </tr>
                          ) : (
                            paginatedShortlistedApplications.map((item) => (
                              <tr key={item?.application_id}>
                                <td>{item.candidate_name || item.name}</td>
                                <td>{item.candidate_email || item.email}</td>
                                <td className="text-center">
                                  {item.education_level} - {item.major}
                                </td>
                                <td className="text-center">
                                  {item.graduation_year || "-"}
                                </td>
                                <td className="text-center">
                                  {item.npwp || "-"}
                                </td>
                                <td className="text-center">
                                  <span
                                    className={`badge ${item.status === "ditolak" ? "badge-error" : "badge-success"}`}
                                  >
                                    {item.status === "ditolak"
                                      ? "Ditolak"
                                      : "Lolos Dokumen"}
                                  </span>
                                </td>
                                <td className="text-center">
                                  <button
                                    className="btn btn-ghost btn-xs"
                                    onClick={() => {
                                      setSelected({
                                        ...item,
                                        isHistory: false,
                                      });
                                      setView("detail");
                                    }}
                                  >
                                    Detail
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {filteredShortlistedApplications.length > 0 && (
                      <Pagination
                        page={screeningPage}
                        totalPages={screeningTotalPages}
                        onChangePage={setScreeningPage}
                        itemsPerPage={screeningItemsPerPage}
                      />
                    )}
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="rounded-2xl border border-base-200 bg-base-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <input
                        className="input input-bordered w-full"
                        placeholder="Cari nama..."
                        value={tabFilters.history.name}
                        onChange={(e) =>
                          handleTabFilterChange(
                            "history",
                            "name",
                            e.target.value,
                          )
                        }
                      />
                      <input
                        className="input input-bordered w-full"
                        placeholder="Cari pendidikan..."
                        value={tabFilters.history.education}
                        onChange={(e) =>
                          handleTabFilterChange(
                            "history",
                            "education",
                            e.target.value,
                          )
                        }
                      />
                      <input
                        className="input input-bordered w-full"
                        placeholder="Cari tahun lulus..."
                        value={tabFilters.history.year}
                        onChange={(e) =>
                          handleTabFilterChange(
                            "history",
                            "year",
                            e.target.value,
                          )
                        }
                      />
                      <div className="flex items-center gap-2 h-full">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm rounded-full w-full -translate-y-0.5"
                          onClick={() => resetTabFilters("history")}
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {loading ? (
                      <div className="text-center py-6">Loading...</div>
                    ) : (
                      <>
                      <div className="overflow-x-auto">
                        <table className="table table-zebra">
                          <thead className="text-center">
                            <tr>
                              <th>Nama</th>
                              <th>Pendidikan</th>
                              <th>Tahun Lulus</th>
                              <th>NPWP</th>
                              <th>Status</th>
                              <th>Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedHistoryApplications.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="text-center opacity-70 py-6"
                                >
                                  Belum ada riwayat
                                </td>
                              </tr>
                            ) : (
                              paginatedHistoryApplications.map((item) => (
                                <tr key={item.application_id}>
                                  <td>
                                    {item.candidate_name || item.name || "-"}
                                  </td>
                                  <td className="text-center">
                                    {item.education_level
                                      ? `${item.education_level} - ${item.major || "-"}`
                                      : "-"}
                                  </td>
                                  <td className="text-center">
                                    {item.graduation_year || "-"}
                                  </td>
                                  <td className="text-center">
                                    {item.npwp || "-"}
                                  </td>
                                  <td className="text-center">
                                    <span
                                      className={`badge ${item.status === "ditolak" ? "badge-error" : ""} ${item.status === "lolos_dokumen" ? "badge-success" : ""} ${item.status === "withdrawn" ? "badge-ghost" : ""}`}
                                    >
                                      {getStatusLabel(item.status)}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <button
                                      className="btn btn-ghost btn-xs"
                                      onClick={() => {
                                        setSelected({
                                          ...item,
                                          isHistory: true,
                                        });
                                        setView("detail");
                                      }}
                                    >
                                      Detail
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      {filteredHistoryApplications.length > 0 && (
                        <Pagination
                          page={historyPage}
                          totalPages={historyTotalPages}
                          onChangePage={setHistoryPage}
                          itemsPerPage={historyItemsPerPage}
                        />
                      )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </TitleCard>
          );
        })()}

      {/* ===================== DETAIL ===================== */}
      {view === "detail" && selected && (
        <>
          <TitleCard
            title="Detail Pelamar"
            TopSideButtons={
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setView("list")}
              >
                Kembali
              </button>
            }
          >
            <div className="space-y-4">
              {/* ================= DATA DIRI ================= */}
              <div className="card bg-base-200 border">
                <div className="card-body">
                  <div className="avatar mb-3 flex justify-center">
                    <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img
                        src={
                          selected.photo_file
                            ? selected.photo_file.startsWith("http")
                              ? selected.photo_file
                              : `http://localhost:5000/${selected.photo_file.replace(/^\//, "")}`
                            : "https://ui-avatars.com/api/?name=" +
                              encodeURIComponent(
                                selected.candidate_name || selected.name || "-",
                              ) +
                              "&background=random"
                        }
                        alt="Foto Kandidat"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <h3 className="card-title text-lg">Data Diri Lengkap</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {[
                      { key: "candidate_name", label: "Nama Lengkap" },
                      { key: "candidate_email", label: "Email" },
                      { key: "phone", label: "Nomor HP" },
                      { key: "gender", label: "Jenis Kelamin" },
                      { key: "birth_place", label: "Tempat Lahir" },
                      { key: "date_of_birth", label: "Tanggal Lahir" },
                      { key: "marital_status", label: "Status Pernikahan" },
                      { key: "nationality", label: "Kebangsaan" },
                      { key: "address", label: "Alamat" },
                      { key: "nik", label: "NIK" },
                      { key: "npwp", label: "No. NPWP" },
                      { key: "education_level", label: "Tingkat Pendidikan" },
                      { key: "university", label: "Sekolah/Universitas" },
                      { key: "major", label: "Jurusan" },
                      { key: "graduation_year", label: "Tahun Lulus" },
                      { key: "linkedin", label: "LinkedIn" },
                      { key: "portfolio", label: "Portfolio Website" },
                      { key: "expected_salary", label: "Ekspektasi Gaji" },
                    ].map((f) => (
                      <div key={f.key}>
                        <p className="text-xs opacity-60">{f.label}</p>
                        <p className="font-semibold break-words">
                          {f.key === "date_of_birth"
                            ? selected[f.key]
                              ? new Date(selected[f.key]).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )
                              : "-"
                            : f.key === "expected_salary"
                              ? selected[f.key]
                                ? new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                  }).format(selected[f.key])
                                : "-"
                              : selected[f.key] ||
                                selected[f.key.replace("candidate_", "")] ||
                                "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ================= DOKUMEN ================= */}
              <div className="card bg-base-200 border">
                <div className="card-body">
                  <h3 className="card-title text-lg">📄 Dokumen</h3>
                  <div className="divide-y border rounded-lg overflow-hidden">
                    {(() => {
                      // Ambil dokumen requirements sesuai posisi dan base_position LANGSUNG
                      const pos =
                        selected.position_name || selected.position || "";
                      const basePos = selected.base_position || "";
                      const req = getRequiredDocuments(pos, basePos);
                      const meta = DOCUMENT_FIELD_METADATA;
                      const shownFields = [
                        ...(req.required || []),
                        ...(req.optional || []),
                      ];
                      let idx = 0;
                      return shownFields.map((key) => {
                        const val = selected[key];
                        const label = meta[key]?.label || key;
                        const externalLink = isExternalLink(val);
                        let url = "";
                        if (val) {
                          if (val.startsWith("http")) {
                            url = val;
                          } else if (
                            val.startsWith("/uploads") ||
                            val.startsWith("uploads/")
                          ) {
                            url = `http://localhost:5000/${val.replace(/^\//, "")}`;
                          } else {
                            url = `http://localhost:5000/uploads/candidate_documents/${val}`;
                          }
                        }
                        const isRequired = (req.required || []).includes(key);
                        const bg = idx % 2 === 0 ? "bg-base-100" : "";
                        idx++;
                        return (
                          <div
                            key={key}
                            className={`flex justify-between items-center px-4 py-3 ${bg}`}
                          >
                            <div>
                              <p className="text-xs opacity-60">
                                {label}
                                {!isRequired && (
                                  <span className="ml-1 text-xs text-warning">
                                    (Opsional)
                                  </span>
                                )}
                              </p>
                              <p
                                className={`font-semibold break-all ${!val ? "text-error opacity-60" : ""}`}
                              >
                                {getFileDisplayText(val) || "Tidak diupload"}
                              </p>
                            </div>
                            {val ? externalLink ? (
                              <a
                                href={val}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:from-blue-500 hover:to-blue-700 border border-blue-600"
                              >
                                Lihat
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openPreviewModal(url, label)}
                                className="px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:from-blue-500 hover:to-blue-700 border border-blue-600"
                              >
                                Lihat
                              </button>
                            ) : (
                              <span className="btn btn-xs btn-disabled opacity-60">
                                Tidak ada file
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* ================= COVER LETTER ================= */}
              <div className="card bg-base-200 border">
                <div className="card-body text-sm">
                  <h3 className="card-title text-lg">Cover Letter</h3>
                  <div className="whitespace-pre-line break-words p-2 border rounded bg-base-100 min-h-[48px]">
                    {selected.cover_letter_file ? (
                      (() => {
                        const coverLetterUrl = getCoverLetterFileUrl(
                          selected.cover_letter_file,
                        );
                        const externalLink = isExternalLink(
                          selected.cover_letter_file,
                        );
                        return (
                          <div className="flex items-center justify-between">
                            <div className="font-semibold break-all">
                              {getFileDisplayText(selected.cover_letter_file) ||
                                "Cover letter"}
                            </div>
                            {externalLink ? (
                              <a
                                href={selected.cover_letter_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:from-blue-500 hover:to-blue-700 border border-blue-600"
                              >
                                Lihat
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  openPreviewModal(coverLetterUrl, "Cover Letter")
                                }
                                className="px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:from-blue-500 hover:to-blue-700 border border-blue-600"
                              >
                                Lihat
                              </button>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <span className="opacity-60 italic">
                        Tidak ada cover letter
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ================= STATUS ================= */}
              <div className="card bg-base-200 border">
                <div className="card-body text-sm">
                  <h3 className="card-title text-lg">Status Pelamar</h3>
                  <p>📌 {getStatusLabel(selected.status || "submitted")}</p>
                  <p>
                    📅 Apply:{" "}
                    {selected.submitted_at
                      ? new Date(selected.submitted_at).toLocaleDateString(
                          "id-ID",
                        )
                      : "-"}
                  </p>
                  {selected.reviewed_at && (
                    <p>
                      ✔ Review:{" "}
                      {new Date(selected.reviewed_at).toLocaleDateString(
                        "id-ID",
                      )}
                    </p>
                  )}
                  {selected.scheduled_date && (
                    <p>
                      📆 Interview:{" "}
                      {new Date(selected.scheduled_date).toLocaleDateString(
                        "id-ID",
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/*================= ACTIONS =================*/}
            <div className="mt-6 border-t pt-6">
              {selected?.isHistory ? (
                <div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    className="btn btn-outline btn-error w-full py-3"
                    onClick={() => {
                      console.log("[DEBUG] Klik Tolak, selected:", selected);
                      setShowRejectPopup(true);
                    }}
                    disabled={selected?.status === "ditolak"}
                  >
                    Tolak
                  </button>
                  <button
                    className="btn btn-success w-full py-3"
                    onClick={handleAccept}
                    disabled={
                      passedApplicants.some(
                        (p) => p.application_id === selected?.application_id,
                      ) || selected.status === "ditolak"
                    }
                  >
                    Shortlist Kandidat
                  </button>{" "}
                </div>
              )}
            </div>
            {/* Modal Tolak */}
            <Modal
              open={showRejectPopup}
              onClose={() => {
                setShowRejectPopup(false);
                setRejectNotes("");
              }}
              onSubmit={handleRejectSubmit}
              title="Tolak Pelamar"
            >
              <label className="block mb-2 font-medium">
                Catatan Penolakan
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                placeholder="Masukkan alasan penolakan..."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
              />
            </Modal>
          </TitleCard>
        </>
      )}

      <Modal
        open={showMassUpdatePopup}
        onClose={() => setShowMassUpdatePopup(false)}
        onSubmit={handleMassUpdateSubmit}
        title="Konfirmasi Update Massal"
        submitLabel="Ya, Update"
        submitButtonClassName="btn-primary text-primary-content"
      >
        <div className="space-y-4">
          {/* HEADER CARD */}
          <div className="flex items-start gap-4 rounded-2xl border border-primary/20 bg-primary/10 p-5 text-base-content">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-sm">
              <CheckBadgeIcon className="h-6 w-6" />
            </div>

            <div>
              <h4 className="text-base font-semibold text-base-content">
                Publish hasil screening kandidat?
              </h4>

              <p className="mt-2 text-sm leading-relaxed text-base-content/70">
                Semua kandidat pada tab
                <span className="mx-1 rounded-lg bg-base-200 px-2 py-1 font-semibold text-base-content">
                  Shortlisted
                </span>
                akan dipublish hasilnya, termasuk kandidat yang
                <span className="mx-1 rounded-lg bg-error/10 px-2 py-1 font-semibold text-error">
                  ditolak
                </span>
                dan yang
                <span className="ml-1 inline-flex rounded-lg bg-success/15 px-2 py-1 font-semibold text-success">
                  Lolos Dokumen
                </span>
              </p>
            </div>
          </div>

          {/* INFO */}
          <div className="rounded-xl border border-base-300 bg-base-200/60 p-4 text-base-content">
            <p className="text-sm text-base-content/70">
              Pastikan seluruh hasil screening sudah final sebelum mempublish.
            </p>
          </div>
        </div>
      </Modal>

      {selectedPreview ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <button
              type="button"
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={closePreviewModal}
            >
              ✕
            </button>
            <h3 className="font-semibold text-xl mb-1">
              {selectedPreview.title || "Preview File"}
            </h3>
            <p className="text-sm opacity-70 mb-4">
              {getFileDisplayText(selectedPreview.path)}
            </p>

            <div className="w-full min-h-[420px] bg-base-200 rounded-lg overflow-hidden flex items-center justify-center">
              {selectedPreview.type === "image" ? (
                <img
                  src={getAssetUrl(selectedPreview.path)}
                  alt={selectedPreview.title || "Preview file"}
                  className="max-h-[70vh] w-auto object-contain"
                />
              ) : selectedPreview.type === "pdf" ? (
                <iframe
                  title={selectedPreview.title || "Preview PDF"}
                  src={getAssetUrl(selectedPreview.path)}
                  className="w-full h-[70vh] border-0"
                />
              ) : selectedPreview.path ? (
                <div className="text-center p-6">
                  <p className="mb-2">
                    Preview tidak tersedia untuk tipe file ini.
                  </p>
                  <a
                    href={getAssetUrl(selectedPreview.path)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    Buka File
                  </a>
                </div>
              ) : (
                <p className="opacity-70">Tidak ada file.</p>
              )}
            </div>
          </div>
          <label className="modal-backdrop" onClick={closePreviewModal}>
            Close
          </label>
        </div>
      ) : null}
    </>
  );
}
