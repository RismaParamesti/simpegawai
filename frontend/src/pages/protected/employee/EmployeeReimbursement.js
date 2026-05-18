import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  setPageTitle,
  showNotification,
} from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";
import { pegawaiApi } from "../../../features/pegawai/api";

const INITIAL_FORM = {
  reimbursement_type: "",
  amount: "",
  description: "",
  attachment: null,
};

const REIMBURSEMENT_TYPE_OPTIONS = [
  { value: "transport", label: "Transportasi" },
  { value: "makan", label: "Konsumsi" },
  { value: "kesehatan", label: "Kesehatan" },
  { value: "operasional", label: "Operasional Kantor" },
  { value: "lainnya", label: "Lainnya" },
];

const REIMBURSEMENT_TYPE_LABELS = REIMBURSEMENT_TYPE_OPTIONS.reduce(
  (accumulator, option) => {
    accumulator[option.value] = option.label;
    return accumulator;
  },
  {},
);

const getStatusLabel = (status) => {
  const labels = {
    pending: "pending",
    approved: "approved",
    included_in_payroll: "included payroll",
    rejected: "rejected",
  };

  return labels[status] || status;
};

const getStatusBadge = (status) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "badge badge-warning text-white";

    case "approved":
      return "badge badge-info text-white";

    case "included_in_payroll":
      return "badge badge-success text-white";

    case "rejected":
      return "badge badge-error text-white";

    default:
      return "badge badge-outline";
  }
};

const getTypeLabel = (item) => {
  const rawType = item?.reimbursement_type || item?.type || "";
  if (!rawType) return "-";
  return REIMBURSEMENT_TYPE_LABELS[rawType] || rawType;
};

const getFileTypeFromPath = (filePath) => {
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
};

const getAssetUrl = (filePath) => {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const configuredBaseUrl = process.env.REACT_APP_BASE_URL;
  const fallbackBaseUrl = "http://localhost:5000";
  const baseUrl = (configuredBaseUrl || fallbackBaseUrl).replace(/\/$/, "");
  const normalizedPath = String(filePath).replace(/^\/+/, "");

  return `${baseUrl}/${normalizedPath}`;
};

const formatAmountInput = (value) => {
  if (!value) return "";
  const numericValue = String(value).replace(/\D/g, "");
  if (!numericValue) return "";
  return new Intl.NumberFormat("id-ID").format(Number(numericValue));
};

function EmployeeReimbursement() {
  const dispatch = useDispatch();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await pegawaiApi.getMyReimbursements();
      setItems(result?.data || []);
      setCurrentPage(1);
    } catch (err) {
      dispatch(showNotification({ message: err.message, status: 0 }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Reimbursement Pegawai" }));
    loadData();
  }, [dispatch, loadData]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAttachmentModal = (attachmentPath) => {
    if (!attachmentPath) return;
    setSelectedAttachment({
      url: getAssetUrl(attachmentPath),
      type: getFileTypeFromPath(attachmentPath),
    });
  };

  const closeAttachmentModal = () => {
    setSelectedAttachment(null);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // jenis/type filter
      const rawType = item?.reimbursement_type || item?.type || "";
      if (typeFilter && rawType !== typeFilter) return false;

      // status filter
      const rawStatus = (item?.status || "").toLowerCase();
      if (statusFilter && rawStatus !== statusFilter) return false;

      // single date filter (match same day)
      if (dateFilter && item?.created_at) {
        const itemDate = new Date(item.created_at);
        const targetStart = new Date(dateFilter);
        targetStart.setHours(0, 0, 0, 0);
        const targetEnd = new Date(dateFilter);
        targetEnd.setHours(23, 59, 59, 999);
        if (itemDate < targetStart || itemDate > targetEnd) return false;
      }

      return true;
    });
  }, [items, typeFilter, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const handleChangePage = (page) => {
    setCurrentPage(page);
  };

  const submitForm = async (event) => {
    event.preventDefault();

    const dbType = (form.reimbursement_type || "").trim();

    if (!dbType) {
      dispatch(
        showNotification({
          message: "Jenis reimbursement wajib diisi",
          status: 0,
        }),
      );
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      dispatch(
        showNotification({
          message: "Nominal wajib diisi dan harus lebih dari 0",
          status: 0,
        }),
      );
      return;
    }

    if (!(form.description || "").trim()) {
      dispatch(
        showNotification({ message: "Deskripsi wajib diisi", status: 0 }),
      );
      return;
    }

    if (!form.attachment) {
      dispatch(
        showNotification({
          message: "Lampiran bukti wajib diunggah",
          status: 0,
        }),
      );
      return;
    }

    try {
      setSubmitting(true);
      await pegawaiApi.submitReimbursement({
        ...form,
        amount: Number(form.amount),
        description: form.description.trim(),
        reimbursement_type: dbType,
      });
      setForm(INITIAL_FORM);
      setCurrentPage(1);
      dispatch(
        showNotification({
          message:
            "Reimbursement berhasil diajukan dan menunggu persetujuan atasan",
          status: 1,
        }),
      );
      await loadData();
    } catch (err) {
      dispatch(showNotification({ message: err.message, status: 0 }));
    } finally {
      setSubmitting(false);
    }
  };

  const resetFilters = () => {
    setDateFilter("");
    setTypeFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <>
      <TitleCard title="Ajukan Reimbursement" topMargin="mt-0">
        <form
          className="grid md:grid-cols-2 grid-cols-1 gap-4"
          onSubmit={submitForm}
        >
          <select
            className="select select-bordered"
            value={form.reimbursement_type}
            onChange={(e) => {
              const selectedValue = e.target.value;
              updateForm("reimbursement_type", selectedValue);
            }}
          >
            <option value="">Pilih jenis reimbursement</option>
            {REIMBURSEMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="input input-bordered border-base-300 bg-base-100 focus-within:border-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/20 flex items-center gap-2">
            <span className="text-primary font-semibold">Rp</span>
            <input
              className="grow bg-transparent"
              type="text"
              inputMode="numeric"
              placeholder="Nominal"
              value={formatAmountInput(form.amount)}
              onChange={(e) =>
                updateForm("amount", e.target.value.replace(/\D/g, ""))
              }
            />
          </label>

          <textarea
            className="textarea textarea-bordered md:col-span-2"
            placeholder="Deskripsi"
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
          />
          <input
            className="file-input file-input-bordered md:col-span-2"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) =>
              updateForm("attachment", e.target.files?.[0] || null)
            }
          />
          <div className="md:col-span-2 flex justify-end">
            <button
              className={`btn btn-primary ${submitting ? "loading" : ""}`}
              type="submit"
              disabled={submitting}
            >
              Kirim Reimbursement
            </button>
          </div>
        </form>
      </TitleCard>

      <TitleCard title="Riwayat Reimbursement" topMargin="mt-6">
        {loading ? (
          <div>Memuat data reimbursement...</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-3 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm opacity-80">Tanggal</label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div>
                <select
                  className="select select-bordered select-sm"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Semua Jenis</option>
                  {REIMBURSEMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  className="select select-bordered select-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Semua Status</option>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="included_in_payroll">included payroll</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>

              <button
                type="button"
                className="btn btn-secondary rounded-full"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Nominal</th>
                    <th>Status</th>
                    <th>Lampiran</th>
                    <th>Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </td>
                      <td>{getTypeLabel(item)}</td>
                      <td>
                        Rp {Number(item.amount || 0).toLocaleString("id-ID")}
                      </td>
                      <td>
                        <span className={getStatusBadge(item.status)}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td>
                        {item.attachment ? (
                          <button
                            type="button"
                            onClick={() => openAttachmentModal(item.attachment)}
                            className="
        px-3 py-1 text-xs
        bg-gradient-to-b from-blue-400 to-blue-600
        text-white rounded-full
        shadow-md hover:shadow-lg
        border border-blue-600
        hover:from-blue-500 hover:to-blue-700
        transition-all duration-200
      "
                          >
                            Lihat
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{item.description}</td>
                    </tr>
                  ))}
                  {paginatedItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center opacity-70">
                        {items.length === 0
                          ? "Belum ada reimbursement"
                          : "Tidak ada data"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {items.length > 0 && (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChangePage={handleChangePage}
                itemsPerPage={itemsPerPage}
              />
            )}
          </>
        )}
      </TitleCard>

      <input
        type="checkbox"
        id="attachment-modal"
        className="modal-toggle"
        checked={!!selectedAttachment}
        onChange={closeAttachmentModal}
      />
      <div className="modal">
        <div className="modal-box max-w-4xl">
          <button
            type="button"
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={closeAttachmentModal}
          >
            ✕
          </button>
          <h3 className="font-semibold text-xl mb-1">Lampiran Reimbursement</h3>

          <div className="w-full min-h-[420px] bg-base-200 rounded-lg overflow-hidden flex items-center justify-center">
            {selectedAttachment?.type === "image" ? (
              <img
                src={selectedAttachment.url}
                alt="Lampiran reimbursement"
                className="max-h-[70vh] w-auto object-contain"
              />
            ) : selectedAttachment?.type === "pdf" ? (
              <iframe
                title="Lampiran PDF"
                src={selectedAttachment.url}
                className="w-full h-[70vh] border-0"
              />
            ) : selectedAttachment?.url ? (
              <div className="text-center p-6">
                <p className="mb-2">
                  Preview tidak tersedia untuk tipe file ini.
                </p>
                <a
                  href={selectedAttachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  Buka File
                </a>
              </div>
            ) : (
              <p className="opacity-70">Tidak ada file lampiran.</p>
            )}
          </div>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="attachment-modal"
          onClick={closeAttachmentModal}
        >
          Close
        </label>
      </div>
    </>
  );
}

export default EmployeeReimbursement;

