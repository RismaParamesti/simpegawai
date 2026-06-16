import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setPageTitle,
  showNotification,
} from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";
import { atasanApi } from "../../../features/atasan/api";
import { formatDateOnly, toDateInputValue } from "../../../utils/dateUtils";

const LEAVE_TYPE_LABEL = {
  izin: "Izin",
  cuti_tahunan: "Cuti Tahunan",
  cuti_sakit: "Cuti Sakit",
  cuti_melahirkan: "Cuti Melahirkan",
  cuti_keguguran: "Cuti Keguguran",
  cuti_menikah: "Cuti Menikah",
  cuti_khusus: "Cuti Penting (Cuti Khusus)",
  izin_sakit: "Izin Sakit",
  izin_pribadi: "Izin Keperluan Pribadi",
  izin_terlambat: "Izin Terlambat / Pulang Cepat",
  izin_lainnya: "Izin Lainnya",
  cuti_lainnya: "Cuti Lainnya",
};

const getLeaveTypeLabel = (leaveType) =>
  LEAVE_TYPE_LABEL[leaveType] || leaveType || "-";

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

function AtasanLeaveRequests() {
  const dispatch = useDispatch();
  const location = useLocation();
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [approvalFilters] = useState({
    status: "pending",
  });
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    date: "",
    totalDays: "",
  });
  const [items, setItems] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedProof, setSelectedProof] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [approvalPage, setApprovalPage] = useState(1);
  const [reviewConfirm, setReviewConfirm] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [filteredResult, historyResult] = await Promise.all([
        atasanApi.getLeaveRequests({ status: approvalFilters.status }),
        atasanApi.getLeaveRequests({ status: "" }),
      ]);

      const source = filteredResult?.data || [];
      const historySource = historyResult?.data || [];

      const roles = JSON.parse(localStorage.getItem("roles") || "[]");

      if (Array.isArray(roles) && roles.includes("admin")) {
        try {
          const employees = await atasanApi.getAllEmployees();
          const options = Array.from(
            new Map(
              employees
                .filter((employee) => employee?.full_name)
                .map((employee) => [
                  employee.employee_code ||
                    String(employee.full_name).toLowerCase(),
                  {
                    name: employee.full_name,
                    code: employee.employee_code || "",
                  },
                ]),
            ).values(),
          ).sort((a, b) => {
            if (!a.code && !b.code) return a.name.localeCompare(b.name, "id");
            if (!a.code) return 1;
            if (!b.code) return -1;
            return a.code.localeCompare(b.code, "id", {
              numeric: true,
              sensitivity: "base",
            });
          });

          setEmployeeOptions(options);
        } catch {
          // Fallback ke data pengajuan jika endpoint pegawai gagal dipanggil.
          const fallbackOptions = Array.from(
            new Map(
              historySource
                .filter((item) => item.employee_name)
                .map((item) => [
                  item.employee_code ||
                    String(item.employee_name).toLowerCase(),
                  {
                    name: item.employee_name,
                    code: item.employee_code || "",
                  },
                ]),
            ).values(),
          ).sort((a, b) => {
            if (!a.code && !b.code) return a.name.localeCompare(b.name, "id");
            if (!a.code) return 1;
            if (!b.code) return -1;
            return a.code.localeCompare(b.code, "id", {
              numeric: true,
              sensitivity: "base",
            });
          });
          setEmployeeOptions(fallbackOptions);
        }
      } else {
        const options = Array.from(
          new Map(
            historySource
              .filter((item) => item.employee_name)
              .map((item) => [
                item.employee_code || String(item.employee_name).toLowerCase(),
                {
                  name: item.employee_name,
                  code: item.employee_code || "",
                },
              ]),
          ).values(),
        ).sort((a, b) => {
          if (!a.code && !b.code) return a.name.localeCompare(b.name, "id");
          if (!a.code) return 1;
          if (!b.code) return -1;
          return a.code.localeCompare(b.code, "id", {
            numeric: true,
            sensitivity: "base",
          });
        });
        setEmployeeOptions(options);
      }

      setItems(source);
    } catch (err) {
      dispatch(showNotification({ message: err.message, status: 0 }));
    } finally {
      setLoading(false);
    }
  }, [approvalFilters.status, dispatch]);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Persetujuan Cuti & Izin" }));
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setApprovalPage(1);
  }, [filters.name, filters.type, filters.date, filters.totalDays]);

  const normalizeLocalDate = (value) => {
    return toDateInputValue(value);
  };

  const filteredItems = items.filter((item) => {
    const matchesName = filters.name
      ? (item.employee_name || "")
          .toLowerCase()
          .includes(filters.name.trim().toLowerCase())
      : true;
    const matchesType = filters.type
      ? (item.leave_type || "")
          .toLowerCase()
          .includes(filters.type.trim().toLowerCase())
      : true;
    const matchesDate = filters.date
      ? normalizeLocalDate(item.start_date) === filters.date ||
        normalizeLocalDate(item.end_date) === filters.date
      : true;
    const matchesTotalDays = filters.totalDays
      ? String(item.total_days || item.duration || 0) === filters.totalDays
      : true;

    return matchesName && matchesType && matchesDate && matchesTotalDays;
  });

  const totalApprovalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    if (approvalPage > totalApprovalPages && totalApprovalPages > 0) {
      setApprovalPage(totalApprovalPages);
    }
  }, [approvalPage, totalApprovalPages]);

  useEffect(() => {
    if (!filteredItems.length) {
      setApprovalPage(1);
    }
  }, [filteredItems.length]);

  useEffect(() => {
    const requestId = location.state?.requestId;
    if (!requestId || !items.length) return;

    const match = items.find((item) => String(item.id) === String(requestId));
    if (match) {
      openDetailModal(match);
    }
  }, [items, location.state?.requestId]);

  const paginatedItems = filteredItems.slice(
    (approvalPage - 1) * itemsPerPage,
    approvalPage * itemsPerPage,
  );
  const handleReview = async (id, action) => {
    try {
      setProcessingId(id);
      await atasanApi.reviewLeaveRequest(id, action);
      dispatch(
        showNotification({
          message:
            action === "approve"
              ? "Pengajuan berhasil disetujui"
              : "Pengajuan berhasil ditolak",
          status: 1,
        }),
      );
      loadData();
      return true;
    } catch (err) {
      dispatch(showNotification({ message: err.message, status: 0 }));
      return false;
    } finally {
      setProcessingId(null);
    }
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedItem(null);
    setShowDetailModal(false);
  };

  const openProofModal = (proofPath, leaveType) => {
    if (!proofPath) return;
    setSelectedProof({
      path: proofPath,
      type: getFileTypeFromPath(proofPath),
      leaveType: getLeaveTypeLabel(leaveType),
    });
  };

  const closeProofModal = () => {
    setSelectedProof(null);
  };

  const openReviewConfirm = (item, action) => {
    setReviewConfirm({ item, action });
  };

  const closeReviewConfirm = () => {
    setReviewConfirm(null);
  };

  const confirmReviewAction = async () => {
    const currentReview = reviewConfirm;
    if (!currentReview?.item || !currentReview?.action) return;

    closeReviewConfirm();
    if (
      selectedItem &&
      String(selectedItem.id) === String(currentReview.item.id)
    ) {
      closeDetailModal();
    }

    await handleReview(currentReview.item.id, currentReview.action);
  };

  const getBuktiUrl = (path) => {
    if (!path) return "";
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    return `${baseUrl}/${String(path).replace(/^\/+/, "")}`;
  };

  return (
    <>
      <datalist id="employee-filter-options">
        {employeeOptions.map((option) => (
          <option
            key={`${option.name}-${option.code}`}
            value={
              option.code ? `${option.code} - ${option.name}` : option.name
            }
          />
        ))}
      </datalist>

      <TitleCard title="Persetujuan Cuti & Izin" topMargin="mt-0">
        <div className="grid md:grid-cols-5 grid-cols-1 gap-4 mb-6">
          <input
            className="input input-bordered"
            placeholder="Cari nama pegawai"
            value={filters.name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <input
            className="input input-bordered"
            placeholder="Cari tipe pengajuan"
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
          />
          <input
            className="input input-bordered"
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, date: e.target.value }))
            }
          />
          <input
            className="input input-bordered"
            type="number"
            min="0"
            placeholder="Total hari"
            value={filters.totalDays}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, totalDays: e.target.value }))
            }
          />
          <button
            className="btn-secondary rounded-full"
            onClick={() =>
              setFilters({ name: "", type: "", date: "", totalDays: "" })
            }
          >
            Reset Filter
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Memuat data pengajuan...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Pegawai</th>
                  <th>Tipe</th>
                  <th>Tanggal</th>
                  <th>Total Hari</th>
                  <th>Status</th>
                  <th>Alasan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-semibold">{item.employee_name}</div>
                      <div className="text-xs opacity-70">
                        {item.employee_code}
                      </div>
                    </td>
                    <td>{getLeaveTypeLabel(item.leave_type)}</td>
                    <td>
                      {formatDateOnly(item.start_date)} -{" "}
                      {formatDateOnly(item.end_date)}
                    </td>
                    <td>{item.total_days || item.duration || 0}</td>
                    <td>
                      <span
                        className={`badge ${item.status === "approved" ? "badge-success" : item.status === "rejected" ? "badge-error" : "badge-warning"}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="max-w-xs truncate" title={item.reason}>
                      {item.reason || "-"}
                    </td>
                    <td>
                      {item.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            className=" px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg border border-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 "
                            onClick={() => openDetailModal(item)}
                          >
                            Detail
                          </button>
                          <button
                            className={`btn btn-success btn-xs ${processingId === item.id ? "loading" : ""}`}
                            onClick={() => openReviewConfirm(item, "approve")}
                            disabled={processingId === item.id}
                          >
                            Setujui
                          </button>
                          <button
                            className={`btn btn-error btn-xs ${processingId === item.id ? "loading" : ""}`}
                            onClick={() => openReviewConfirm(item, "reject")}
                            disabled={processingId === item.id}
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-xs action-view"
                          onClick={() => openDetailModal(item)}
                        >
                          Lihat Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center opacity-70">
                      Tidak ada data pengajuan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <Pagination
            page={approvalPage}
            totalPages={totalApprovalPages}
            onChangePage={setApprovalPage}
            itemsPerPage={itemsPerPage}
          />
        )}
      </TitleCard>
      {showDetailModal && selectedItem && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              Detail Pengajuan Cuti/Izin
            </h3>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-4 text-sm">
              <div>
                <p className="opacity-60">Nama Pegawai</p>
                <p className="font-semibold">
                  {selectedItem.employee_name || "-"}
                </p>
              </div>
              <div>
                <p className="opacity-60">Kode Pegawai</p>
                <p className="font-semibold">
                  {selectedItem.employee_code || "-"}
                </p>
              </div>
              <div>
                <p className="opacity-60">Jenis Pengajuan</p>
                <p className="font-semibold">
                  {getLeaveTypeLabel(selectedItem.leave_type)}
                </p>
              </div>
              <div>
                <p className="opacity-60">Total Hari</p>
                <p className="font-semibold">
                  {selectedItem.total_days || selectedItem.duration || 0}
                </p>
              </div>
              <div>
                <p className="opacity-60">Waktu Pengajuan</p>
                <p className="font-semibold">
                  {selectedItem.time || "-"}
                </p>
              </div>
              <div>
                <p className="opacity-60">Opsi Cuti Khusus</p>
                <p className="font-semibold">
                  {selectedItem.cuti_khusus_option || "-"}
                </p>
              </div>
              <div>
                <p className="opacity-60">Tanggal Mulai</p>
                <p className="font-semibold">
                  {selectedItem.start_date
                    ? formatDateOnly(selectedItem.start_date)
                    : "-"}
                </p>
              </div>
              <div>
                <p className="opacity-60">Tanggal Selesai</p>
                <p className="font-semibold">
                  {selectedItem.end_date
                    ? formatDateOnly(selectedItem.end_date)
                    : "-"}
                </p>
              </div>
              <div>
                <p className="opacity-60">Status</p>
                <span
                  className={`badge mt-1 ${selectedItem.status === "approved" ? "badge-success" : selectedItem.status === "rejected" ? "badge-error" : "badge-warning"}`}
                >
                  {selectedItem.status}
                </span>
              </div>
              <div>
                <p className="opacity-60">Diproses Oleh</p>
                <p className="font-semibold">
                  {selectedItem.approved_by_name || "-"}
                </p>
              </div>
              <div>
                <p className="opacity-60">Diajukan Pada</p>
                <p className="font-semibold">
                  {selectedItem.created_at
                    ? new Date(selectedItem.created_at).toLocaleString("id-ID")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="opacity-60">Diproses Pada</p>
                <p className="font-semibold">
                  {selectedItem.approved_at
                    ? new Date(selectedItem.approved_at).toLocaleString("id-ID")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="opacity-60 text-sm">Alasan</p>
              <div className="p-3 bg-base-200 rounded-lg mt-1 text-sm">
                {selectedItem.reason || "-"}
              </div>
            </div>

            <div className="mt-4">
              <p className="opacity-60 text-sm">Bukti Lampiran</p>
              {selectedItem.bukti ? (
                <button
                  type="button"
                  className="btn btn-outline btn-sm mt-2"
                  onClick={() =>
                    openProofModal(selectedItem.bukti, selectedItem.leave_type)
                  }
                >
                  Lihat bukti ({selectedItem.bukti.split("/").pop()})
                </button>
              ) : (
                <p className="text-sm opacity-70">Tidak ada bukti lampiran.</p>
              )}
            </div>

            <div className="mt-4 grid md:grid-cols-2 grid-cols-1 gap-4 text-sm">
              <div>
                <p className="opacity-60">Diproses Oleh</p>
                <p className="font-semibold">
                  {selectedItem.approved_by_name || "-"}
                </p>
              </div>
              <div>
                <p className="opacity-60">Diproses Pada</p>
                <p className="font-semibold">
                  {selectedItem.approved_at
                    ? new Date(selectedItem.approved_at).toLocaleString("id-ID")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={closeDetailModal}>
                Tutup
              </button>
              {selectedItem.status === "pending" && (
                <>
                  <button
                    className={`btn btn-success ${processingId === selectedItem.id ? "loading" : ""}`}
                    onClick={() => openReviewConfirm(selectedItem, "approve")}
                    disabled={processingId === selectedItem.id}
                  >
                    Setujui
                  </button>
                  <button
                    className={`btn btn-error ${processingId === selectedItem.id ? "loading" : ""}`}
                    onClick={() => openReviewConfirm(selectedItem, "reject")}
                    disabled={processingId === selectedItem.id}
                  >
                    Tolak
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedProof ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <button
              type="button"
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={closeProofModal}
            >
              x
            </button>
            <h3 className="font-semibold text-xl mb-1">Bukti Pengajuan</h3>
            <p className="text-sm opacity-70 mb-4">
              Jenis: {selectedProof.leaveType || "-"}
            </p>

            <div className="w-full min-h-[420px] bg-base-200 rounded-lg overflow-hidden flex items-center justify-center">
              {selectedProof.type === "image" ? (
                <img
                  src={getBuktiUrl(selectedProof.path)}
                  alt="Bukti cuti atau izin"
                  className="max-h-[70vh] w-auto object-contain"
                />
              ) : selectedProof.type === "pdf" ? (
                <iframe
                  title="Bukti PDF"
                  src={getBuktiUrl(selectedProof.path)}
                  className="w-full h-[70vh] border-0"
                />
              ) : (
                <div className="text-center p-6">
                  <p className="mb-2">
                    Preview tidak tersedia untuk tipe file ini.
                  </p>
                  <a
                    href={getBuktiUrl(selectedProof.path)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    Buka File
                  </a>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button className="btn" onClick={closeProofModal}>
                Tutup
              </button>
            </div>
          </div>
          <button
            type="button"
            className="modal-backdrop"
            onClick={closeProofModal}
          >
            Close
          </button>
        </div>
      ) : null}

      {reviewConfirm?.item && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-2">Konfirmasi Aksi</h3>
            <p className="text-sm opacity-80">
              Apakah Anda yakin ingin {reviewConfirm.action === "approve" ? "menyetujui" : "menolak"} pengajuan cuti/izin milik{' '}
              <span className="font-semibold">
                {reviewConfirm.item.employee_name || "-"}
              </span>
              ?
            </p>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={closeReviewConfirm}
                disabled={processingId === reviewConfirm.item.id}
              >
                Batal
              </button>
              <button
                className={`btn ${reviewConfirm.action === "approve" ? "btn-success" : "btn-error"} ${processingId === reviewConfirm.item.id ? "loading" : ""}`}
                onClick={confirmReviewAction}
                disabled={processingId === reviewConfirm.item.id}
              >
                Ya, {reviewConfirm.action === "approve" ? "Setujui" : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AtasanLeaveRequests;

