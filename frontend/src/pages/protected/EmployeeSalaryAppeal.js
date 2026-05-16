import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import TitleCard from "../../components/Cards/TitleCard";
import Pagination from "../../components/Pagination/Pagination";
import { formatCurrency } from "../../components/Formatters/CurrencyFormatter";
import { pegawaiApi } from "../../features/pegawai/api";

const INITIAL_FORM = {
  payroll_id: "",
  appeal_items: [
    {
      appeal_reason_item: "",
      reason: "",
    },
  ],
  supporting_documents: null,
};

const INCOME_REASON_OPTIONS = [
  { key: "basic_salary", label: "Gaji Pokok", payrollField: "basic_salary" },
  { key: "allowance", label: "Total Tunjangan", payrollField: "allowance" },
  {
    key: "transport_allowance",
    label: "Tunjangan Transport",
    payrollField: "transport_allowance",
  },
  {
    key: "meal_allowance",
    label: "Tunjangan Makan",
    payrollField: "meal_allowance",
  },
  {
    key: "health_allowance",
    label: "Tunjangan Kesehatan",
    payrollField: "health_allowance",
  },
  { key: "bonus", label: "Bonus", payrollField: "bonus" },
  {
    key: "other_allowance",
    label: "Tunjangan Lainnya",
    payrollField: "other_allowance",
  },
  {
    key: "reimbursement_total",
    label: "Reimbursement",
    payrollField: "reimbursement_total",
  },
  { key: "gross_salary", label: "Gaji Kotor", payrollField: "gross_salary" },
  {
    key: "total_income",
    label: "Total Pendapatan",
    payrollField: "total_income",
  },
];

const DEDUCTION_REASON_OPTIONS = [
  {
    key: "late_deduction",
    label: "Potongan Keterlambatan",
    payrollField: "late_deduction",
  },
  {
    key: "absent_deduction",
    label: "Potongan Alpha",
    payrollField: "absent_deduction",
  },
  {
    key: "bpjs_deduction",
    label: "Potongan BPJS",
    payrollField: "bpjs_deduction",
  },
  {
    key: "tax_deduction",
    label: "Potongan Pajak",
    payrollField: "tax_deduction",
  },
  {
    key: "other_deduction",
    label: "Potongan Lainnya",
    payrollField: "other_deduction",
  },
  { key: "deduction", label: "Total Potongan", payrollField: "deduction" },
];

const getAppealStatusLabel = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "approved") {
    return "diproses";
  }

  return normalizedStatus || "-";
};

const APPEAL_STATUS_BADGE_CLASS = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
  reviewed: "badge-info",
};

const getAppealItems = (appeal) => {
  if (
    Array.isArray(appeal?.appeal_reason_items) &&
    appeal.appeal_reason_items.length > 0
  ) {
    return appeal.appeal_reason_items;
  }

  if (appeal?.appeal_reason_item || appeal?.reason) {
    return [
      {
        appeal_reason_item: appeal.appeal_reason_item || "",
        appeal_reason_label: appeal.appeal_reason_label || "-",
        reason: appeal.reason || "",
      },
    ];
  }

  return [];
};

const parseReviewNotes = (reviewNotes) => {
  if (!reviewNotes) return [];

  const notes = String(reviewNotes);
  // Match pattern: [anything] followed by anything until next [ or end
  const pattern = /\[[^\]]*\][^[]*(?=\[|$)/g;
  const matches = notes.match(pattern);

  return matches && matches.length > 0
    ? matches.map((m) => m.trim()).filter(Boolean)
    : [notes];
};

const parseReviewItem = (reviewItem) => {
  if (!reviewItem) return { component: "-", status: "-", detail: "-" };

  const item = String(reviewItem).trim();

  // Extract component part in brackets
  const componentMatch = item.match(/^\[([^\]]*)\]/);
  const component = componentMatch ? componentMatch[1] : "-";

  // Remove component part in brackets
  const withoutComponent = item.replace(/^\[[^\]]*\]\s*/, "");

  // Extract status (disetujui, ditolak, pending, etc.)
  const statusMatch = withoutComponent.match(
    /^(disetujui|ditolak|pending|diproses|reviewing)/i,
  );
  const status = statusMatch ? statusMatch[1] : "-";

  // Extract detail (everything after status)
  let detail =
    withoutComponent
      .replace(/^(disetujui|ditolak|pending|diproses|reviewing)[,\s]*/i, "")
      .trim() || "-";

  // Clean up detail: remove "alasan:" prefix, but keep "nominal perbaikan" without colon
  detail =
    detail
      .replace(/^nominal\s+perbaikan\s*:\s*/i, "nominal perbaikan ")
      .replace(/^alasan\s*:\s*/i, "")
      .trim() || "-";

  return { component, status, detail };
};

const formatDetailWithCurrency = (detail) => {
  if (detail === "-") return "-";

  // Check if detail starts with "nominal perbaikan" and extract the numeric value
  const nominalMatch = detail.match(/^nominal\s+perbaikan\s+(.+)$/i);
  if (nominalMatch) {
    const nominalValue = nominalMatch[1].trim();
    // Try to parse as number
    const numValue = parseFloat(nominalValue.replace(/\D/g, ""));
    if (!isNaN(numValue)) {
      return `nominal perbaikan ${formatCurrency(numValue)}`;
    }
  }

  return detail;
};

function EmployeeSalaryAppeal() {
  const dispatch = useDispatch();
  const [employeeId, setEmployeeId] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingAppealId, setEditingAppealId] = useState(null);
  const [selectedPayrollModal, setSelectedPayrollModal] = useState(null);
  const [selectedSupportingDoc, setSelectedSupportingDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const formCardRef = useRef(null);
  const itemsPerPage = 10;
  const [periodFilter, setPeriodFilter] = useState("");
  const [appealStatusFilter, setAppealStatusFilter] = useState("");

  const publishedPayrolls = useMemo(() => {
    return payrolls.filter(
      (item) => item.status === "published" || item.status === "claimed",
    );
  }, [payrolls]);

  const periodOptions = useMemo(() => {
    const setVals = new Set();
    appeals.forEach((a) => {
      const pm = a?.period_month;
      const py = a?.period_year;
      if (pm && py) setVals.add(`${pm}/${py}`);
    });
    return Array.from(setVals).sort((a, b) => {
      // sort descending by year then month
      const [am, ay] = a.split("/").map(Number);
      const [bm, by] = b.split("/").map(Number);
      if (ay === by) return bm - am;
      return by - ay;
    });
  }, [appeals]);

  // fixed status options: pending, approved (disetujui), rejected (ditolak)

  const filteredAppeals = useMemo(() => {
    return appeals.filter((item) => {
      const periodMatch = !periodFilter || `${item.period_month}/${item.period_year}` === periodFilter;
      const statusMatch = !appealStatusFilter || String(item.status || "").toLowerCase() === String(appealStatusFilter || "").toLowerCase();
      return periodMatch && statusMatch;
    });
  }, [appeals, periodFilter, appealStatusFilter]);

  const totalPages = Math.ceil(filteredAppeals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppeals = filteredAppeals.slice(startIndex, endIndex);

  const resetAppealFilters = () => {
    setPeriodFilter("");
    setAppealStatusFilter("");
    setCurrentPage(1);
  };

  const handleChangePage = (page) => {
    setCurrentPage(page);
  };

  const selectedPayroll = useMemo(() => {
    if (!form.payroll_id) return null;
    return (
      publishedPayrolls.find(
        (item) => String(item.id) === String(form.payroll_id),
      ) || null
    );
  }, [publishedPayrolls, form.payroll_id]);

  const eligiblePayrolls = useMemo(() => {
    const appealedPayrollIds = new Set(
      appeals.map((item) => String(item.payroll_id || "")).filter(Boolean),
    );

    return publishedPayrolls.filter(
      (item) => !appealedPayrollIds.has(String(item.id)),
    );
  }, [publishedPayrolls, appeals]);

  const availableReasonOptions = useMemo(() => {
    if (!selectedPayroll) {
      return { income: [], deduction: [] };
    }

    const income = INCOME_REASON_OPTIONS.map((option) => ({
      ...option,
      value: Number(selectedPayroll[option.payrollField] || 0),
    }));

    const deduction = DEDUCTION_REASON_OPTIONS.map((option) => ({
      ...option,
      value: Number(selectedPayroll[option.payrollField] || 0),
    }));

    return { income, deduction };
  }, [selectedPayroll]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const profile = await pegawaiApi.getProfile();
      const currentEmployeeId = profile?.employee?.id;
      if (!currentEmployeeId) {
        throw new Error("Data pegawai tidak ditemukan");
      }

      setEmployeeId(currentEmployeeId);

      const [payrollResult, appealResult] = await Promise.all([
        pegawaiApi.getPayrollByEmployee(currentEmployeeId),
        pegawaiApi.getMySalaryAppeals(),
      ]);

      setPayrolls(payrollResult?.data || []);
      setAppeals(appealResult?.data || []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: "Banding Gaji Pegawai" }));
    loadData();
  }, [dispatch]);

  useEffect(() => {
    const allKeys = [
      ...availableReasonOptions.income,
      ...availableReasonOptions.deduction,
    ].map((item) => item.key);

    setForm((prev) => ({
      ...prev,
      appeal_items: (prev.appeal_items || []).map((item) => {
        if (!item.appeal_reason_item) return item;
        if (allKeys.includes(item.appeal_reason_item)) return item;
        return {
          ...item,
          appeal_reason_item: "",
        };
      }),
    }));
  }, [availableReasonOptions]);

  useEffect(() => {
    if (editingAppealId) {
      return;
    }

    setForm((prev) => {
      const currentPayrollId = String(prev.payroll_id || "");
      const stillEligible = eligiblePayrolls.some(
        (item) => String(item.id) === currentPayrollId,
      );

      if (stillEligible) {
        return prev;
      }

      return {
        ...prev,
        payroll_id:
          eligiblePayrolls.length > 0 ? String(eligiblePayrolls[0].id) : "",
      };
    });
  }, [editingAppealId, eligiblePayrolls]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateAppealItem = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      appeal_items: prev.appeal_items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const openViewModal = (appeal) => {
    setSelectedAppeal(appeal);
    setShowViewModal(true);
  };

  const startEditFromForm = (appeal) => {
    const parsedAppealItems = getAppealItems(appeal);
    setEditingAppealId(appeal.id);
    setForm({
      payroll_id: String(appeal.payroll_id || ""),
      appeal_items: parsedAppealItems.length
        ? parsedAppealItems.map((item) => ({
            appeal_reason_item: item.appeal_reason_item || "",
            reason: item.reason || "",
          }))
        : [
            {
              appeal_reason_item: "",
              reason: "",
            },
          ],
      supporting_documents: null,
    });
    setError("");

    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const cancelEdit = () => {
    setEditingAppealId(null);
    setForm(INITIAL_FORM);
    setError("");
  };

  const deleteAppeal = async (appeal) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus riwayat banding gaji ini?\n\nPeriode: ${appeal.period_month}/${appeal.period_year}\nStatus: ${getAppealStatusLabel(appeal.status)}\n\nTindakan ini tidak bisa dibatalkan.`,
    );
    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError("");
      await pegawaiApi.deleteSalaryAppeal(appeal.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openPayrollPdf = async (payrollId) => {
    if (!payrollId) return;

    try {
      setError("");
      const blob = await pegawaiApi.getPayrollPdfBlob(payrollId);
      const url = window.URL.createObjectURL(blob);

      setSelectedPayrollModal({
        url,
        payrollId,
        type: "pdf",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const closePayrollModal = () => {
    if (selectedPayrollModal?.url) {
      window.URL.revokeObjectURL(selectedPayrollModal.url);
    }
    setSelectedPayrollModal(null);
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

  const openSupportingDocModal = (docUrl) => {
    if (!docUrl) return;
    setSelectedSupportingDoc({
      url: getAssetUrl(docUrl),
      type: getFileTypeFromPath(docUrl),
    });
  };

  const closeSupportingDocModal = () => {
    setSelectedSupportingDoc(null);
  };

  const addAppealItem = () => {
    setForm((prev) => ({
      ...prev,
      appeal_items: [
        ...prev.appeal_items,
        {
          appeal_reason_item: "",
          reason: "",
        },
      ],
    }));
  };

  const removeAppealItem = (index) => {
    setForm((prev) => {
      const filtered = prev.appeal_items.filter(
        (_, itemIndex) => itemIndex !== index,
      );
      return {
        ...prev,
        appeal_items: filtered.length
          ? filtered
          : [
              {
                appeal_reason_item: "",
                reason: "",
              },
            ],
      };
    });
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const normalizedAppealItems = (form.appeal_items || []).filter(
      (item) => item.appeal_reason_item || item.reason,
    );

    if (!form.payroll_id || normalizedAppealItems.length === 0) {
      setError("Periode slip gaji dan minimal 1 alasan komponen wajib diisi");
      return;
    }

    if (!editingAppealId && !eligiblePayrolls.length) {
      setError("Banding hanya bisa diajukan 1 kali per slip gaji.");
      return;
    }

    const hasEmptyRow = normalizedAppealItems.some(
      (item) => !item.appeal_reason_item || !String(item.reason || "").trim(),
    );

    if (hasEmptyRow) {
      setError(
        "Setiap komponen banding wajib memiliki pilihan komponen dan alasan teks",
      );
      return;
    }

    const selectedKeys = normalizedAppealItems.map(
      (item) => item.appeal_reason_item,
    );
    const hasDuplicateKey = new Set(selectedKeys).size !== selectedKeys.length;
    if (hasDuplicateKey) {
      setError(
        "Komponen banding tidak boleh dipilih lebih dari satu kali dalam satu pengajuan",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (editingAppealId) {
        await pegawaiApi.updateSalaryAppeal(editingAppealId, {
          appeal_items: normalizedAppealItems.map((appealItem) => ({
            appeal_reason_item: appealItem.appeal_reason_item,
            reason: String(appealItem.reason || "").trim(),
          })),
          supporting_documents: form.supporting_documents,
        });
      } else {
        await pegawaiApi.submitSalaryAppeal({
          payroll_id: form.payroll_id,
          appeal_items: normalizedAppealItems.map((appealItem) => ({
            appeal_reason_item: appealItem.appeal_reason_item,
            reason: String(appealItem.reason || "").trim(),
          })),
          supporting_documents: form.supporting_documents,
        });
      }

      setEditingAppealId(null);
      setForm(INITIAL_FORM);
      setCurrentPage(1);
      if (employeeId) {
        const [payrollResult, appealResult] = await Promise.all([
          pegawaiApi.getPayrollByEmployee(employeeId),
          pegawaiApi.getMySalaryAppeals(),
        ]);
        setPayrolls(payrollResult?.data || []);
        setAppeals(appealResult?.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error ? (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      ) : null}

      <div ref={formCardRef}>
        <TitleCard
          title={editingAppealId ? "Edit Banding Gaji" : "Ajukan Banding Gaji"}
          topMargin="mt-0"
        >
          <form
            className="grid md:grid-cols-2 grid-cols-1 gap-4"
            onSubmit={submitForm}
          >
            {editingAppealId ? (
              <div className="alert alert-info md:col-span-2">
                <span>
                  Mode edit aktif. Ubah data di form ini lalu klik Simpan Edit.
                </span>
              </div>
            ) : null}

            {!editingAppealId ? (
              <div className="md:col-span-2 alert alert-info">
                <span>
                  Banding gaji hanya bisa diajukan 1 kali per slip gaji.
                  {selectedPayroll
                    ? ` Slip dipilih otomatis: ${selectedPayroll.period_month}/${selectedPayroll.period_year} - ${formatCurrency(selectedPayroll.final_amount || selectedPayroll.net_salary || 0)}`
                    : " Saat ini tidak ada slip gaji yang tersedia untuk diajukan banding."}
                </span>
              </div>
            ) : null}
            <div className="md:col-span-2 space-y-3">
              <p className="font-semibold">
                Alasan Banding (Komponen Slip, tanpa Total Gaji)
              </p>
              {(form.appeal_items || []).map((appealItem, index) => (
                <div
                  key={`appeal-item-${index}`}
                  className="grid md:grid-cols-2 grid-cols-1 gap-3 rounded-lg border border-base-300 p-3"
                >
                  <select
                    className="select select-bordered"
                    value={appealItem.appeal_reason_item}
                    onChange={(e) =>
                      updateAppealItem(
                        index,
                        "appeal_reason_item",
                        e.target.value,
                      )
                    }
                    disabled={!form.payroll_id}
                  >
                    <option value="">Pilih Komponen Slip</option>
                    {availableReasonOptions.income.length > 0 ? (
                      <optgroup label="Rincian Pendapatan">
                        {availableReasonOptions.income.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.label} - {formatCurrency(option.value)}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                    {availableReasonOptions.deduction.length > 0 ? (
                      <optgroup label="Rincian Potongan">
                        {availableReasonOptions.deduction.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.label} - {formatCurrency(option.value)}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                  </select>
                  <textarea
                    className="textarea textarea-bordered"
                    placeholder="Alasan banding (teks penjelasan)"
                    value={appealItem.reason}
                    onChange={(e) =>
                      updateAppealItem(index, "reason", e.target.value)
                    }
                  />
                  <div className="md:col-span-2 flex justify-end">
                    {!editingAppealId ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeAppealItem(index)}
                        disabled={submitting}
                      >
                        Hapus Baris
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
              {!editingAppealId ? (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={addAppealItem}
                  disabled={!form.payroll_id || submitting}
                >
                  Tambah Alasan Komponen
                </button>
              ) : null}
            </div>
            <input
              className="file-input file-input-bordered md:col-span-2"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                updateForm("supporting_documents", e.target.files?.[0] || null)
              }
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                className={`btn btn-primary ${submitting ? "loading" : ""}`}
                type="submit"
                disabled={submitting}
              >
                {editingAppealId ? "Simpan Edit" : "Kirim Banding"}
              </button>
              {editingAppealId ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={cancelEdit}
                  disabled={submitting}
                >
                  Batal Edit
                </button>
              ) : null}
            </div>
          </form>
        </TitleCard>
      </div>

      <TitleCard title="Riwayat Banding Gaji" topMargin="mt-6">
        {loading ? (
          <div>Memuat data banding gaji...</div>
        ) : (
          <>
            <div className="flex justify-right mb-4 items-center gap-2">
              <select
                className="select select-bordered select-sm w-full max-w-xs"
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Semua Periode</option>
                {periodOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered select-sm w-full max-w-xs"
                value={appealStatusFilter}
                onChange={(e) => {
                  setAppealStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Semua Status</option>
                <option value="approved">disetujui</option>
                <option value="rejected">ditolak</option>
                <option value="pending">pending</option>
              </select>

              <button type="button" className="btn btn-secondary rounded-full" onClick={resetAppealFilters}>
                Reset
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Periode</th>
                    <th>Detail Pengajuan</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppeals.length > 0 ? (
                    paginatedAppeals.map((item) => (
                      <tr key={item.id}>
                        <td className="font-semibold">
                          {item.period_month}/{item.period_year}
                        </td>
                        <td>
                          <div className="overflow-x-auto">
                            <table className="table table-compact table-sm bg-base-100">
                              <thead>
                                <tr className="bg-base-200">
                                  <th className="w-8">No</th>
                                  <th className="w-40">Komponen</th>
                                  <th className="w-48">Alasan Teks</th>
                                  <th className="w-32">Komponen Review</th>
                                  <th className="w-24">Status Review</th>
                                  <th className="flex-1">Nominal/Alasan</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getAppealItems(item).length > 0 ? (
                                  getAppealItems(item).map((appealItem, idx) => {
                                    const reviewNotes = parseReviewNotes(item.review_notes);
                                    const reviewNote = reviewNotes[idx] || "-";
                                    const { component: reviewComponent, status: reviewStatus, detail: reviewDetail } = parseReviewItem(reviewNote);

                                    return (
                                      <tr key={idx} className="border-b-0">
                                        <td className="text-center font-semibold">{idx + 1}</td>
                                        <td className="text-sm">{appealItem.appeal_reason_label || appealItem.appeal_reason_item || "-"}</td>
                                        <td className="text-sm">{appealItem.reason || "-"}</td>
                                        <td className="text-sm">{reviewComponent}</td>
                                        <td className="text-sm">
                                          <span className={`badge badge-sm ${reviewStatus === "disetujui" ? "badge-success" : reviewStatus === "ditolak" ? "badge-error" : reviewStatus === "pending" ? "badge-warning" : "badge-outline"}`}>
                                            {reviewStatus}
                                          </span>
                                        </td>
                                        <td className="text-sm">{formatDetailWithCurrency(reviewDetail)}</td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan={6} className="text-center text-sm opacity-70">Tidak ada detail</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${APPEAL_STATUS_BADGE_CLASS[String(item.status || "").toLowerCase()] || "badge-outline"}`}>
                            {getAppealStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg border border-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-200" type="button" onClick={() => openViewModal(item)}>
                              Lihat
                            </button>

                            {item.status === "pending" && (
                              <>
                                <button className="px-3 py-1 text-xs bg-gradient-to-b from-yellow-300 to-yellow-500 text-black rounded-full shadow-md hover:shadow-lg border border-yellow-500 hover:from-yellow-400 hover:to-yellow-600 transition-all duration-200" type="button" onClick={() => startEditFromForm(item)} disabled={submitting}>
                                  Edit
                                </button>

                                <button className="btn btn-xs btn-error text-white rounded-full" type="button" onClick={() => deleteAppeal(item)} disabled={submitting}>
                                  Hapus
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-10 opacity-70">tidak ada data riwayat banding gaji yang diajukan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {appeals.length > 0 && (
              <Pagination page={currentPage} totalPages={totalPages} onChangePage={handleChangePage} itemsPerPage={itemsPerPage} />
            )}
          </>
        )}
      </TitleCard>

      {showViewModal && selectedAppeal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Detail Banding Gaji</h3>
            <div className="space-y-4 text-sm">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-base-200 rounded-lg p-3 space-y-1">
                  <p>
                    <span className="font-semibold">ID Banding:</span>{" "}
                    {selectedAppeal.id || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">ID Payroll:</span>{" "}
                    {selectedAppeal.payroll_id || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Periode:</span>{" "}
                    {selectedAppeal.period_month}/{selectedAppeal.period_year}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    {getAppealStatusLabel(selectedAppeal.status)}
                  </p>
                  <p>
                    <span className="font-semibold">Status Payroll:</span>{" "}
                    {selectedAppeal.payroll_status || "-"}
                  </p>
                </div>
                <div className="bg-base-200 rounded-lg p-3 space-y-1">
                  <p>
                    <span className="font-semibold">Nominal Perbaikan:</span>{" "}
                    {formatCurrency(selectedAppeal.expected_amount)}
                  </p>
                  <div>
                    <span className="font-semibold mb-2 block">
                      Catatan Review:
                    </span>
                    {selectedAppeal.review_notes ? (
                      <div className="space-y-2 text-xs">
                        {parseReviewNotes(selectedAppeal.review_notes).map(
                          (reviewNote, idx) => {
                            const {
                              component,
                              status: reviewStatus,
                              detail: reviewDetail,
                            } = parseReviewItem(reviewNote);
                            return (
                              <div
                                key={idx}
                                className="bg-base-100 p-2 rounded border border-base-300"
                              >
                                <div className="font-semibold text-xs mb-1">
                                  {component}
                                </div>
                                <div className="flex gap-2 items-start">
                                  <span
                                    className={`badge badge-xs flex-shrink-0 ${
                                      reviewStatus === "disetujui"
                                        ? "badge-success"
                                        : reviewStatus === "ditolak"
                                          ? "badge-error"
                                          : reviewStatus === "pending"
                                            ? "badge-warning"
                                            : "badge-outline"
                                    }`}
                                  >
                                    {reviewStatus}
                                  </span>
                                  <span className="flex-1">
                                    {formatDetailWithCurrency(reviewDetail)}
                                  </span>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                  <p>
                    <span className="font-semibold">Dibuat:</span>{" "}
                    {selectedAppeal.created_at
                      ? new Date(selectedAppeal.created_at).toLocaleString(
                          "id-ID",
                        )
                      : "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Diupdate:</span>{" "}
                    {selectedAppeal.updated_at
                      ? new Date(selectedAppeal.updated_at).toLocaleString(
                          "id-ID",
                        )
                      : "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Direview:</span>{" "}
                    {selectedAppeal.reviewed_at
                      ? new Date(selectedAppeal.reviewed_at).toLocaleString(
                          "id-ID",
                        )
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="bg-base-200 rounded-lg p-3">
                <p className="font-semibold mb-2">Detail Alasan Banding</p>
                <div className="overflow-x-auto">
                  <table className="table table-zebra table-sm">
                    <thead>
                      <tr>
                        <th>Komponen</th>
                        <th>Alasan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAppealItems(selectedAppeal).map(
                        (appealItem, index) => (
                          <tr
                            key={`${appealItem.appeal_reason_item || "item"}-${index}`}
                          >
                            <td>
                              {appealItem.appeal_reason_label ||
                                appealItem.appeal_reason_item ||
                                "-"}
                            </td>
                            <td>{appealItem.reason || "-"}</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-base-200 rounded-lg p-3">
                <p className="font-semibold mb-2">Rincian Slip Gaji</p>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
                  <p>
                    <span className="font-semibold">Gaji Pokok:</span>{" "}
                    {formatCurrency(selectedAppeal.basic_salary)}
                  </p>
                  <p>
                    <span className="font-semibold">Transport:</span>{" "}
                    {formatCurrency(selectedAppeal.transport_allowance)}
                  </p>
                  <p>
                    <span className="font-semibold">Makan:</span>{" "}
                    {formatCurrency(selectedAppeal.meal_allowance)}
                  </p>
                  <p>
                    <span className="font-semibold">Tunjangan Kesehatan:</span>{" "}
                    {formatCurrency(selectedAppeal.health_allowance)}
                  </p>
                  <p>
                    <span className="font-semibold">Bonus:</span>{" "}
                    {formatCurrency(selectedAppeal.bonus)}
                  </p>
                  <p>
                    <span className="font-semibold">Tunjangan Lain:</span>{" "}
                    {formatCurrency(selectedAppeal.other_allowance)}
                  </p>
                  <p>
                    <span className="font-semibold">Total Tunjangan:</span>{" "}
                    {formatCurrency(selectedAppeal.allowance)}
                  </p>
                  <p>
                    <span className="font-semibold">Gaji Kotor:</span>{" "}
                    {formatCurrency(selectedAppeal.gross_salary)}
                  </p>
                  <p>
                    <span className="font-semibold">Reimbursement:</span>{" "}
                    {formatCurrency(selectedAppeal.reimbursement_total)}
                  </p>
                  <p>
                    <span className="font-semibold">Total Income:</span>{" "}
                    {formatCurrency(selectedAppeal.total_income)}
                  </p>
                  <p>
                    <span className="font-semibold">Potongan Telat:</span>{" "}
                    {formatCurrency(selectedAppeal.late_deduction)}
                  </p>
                  <p>
                    <span className="font-semibold">Potongan Alpha:</span>{" "}
                    {formatCurrency(selectedAppeal.absent_deduction)}
                  </p>
                  <p>
                    <span className="font-semibold">Potongan BPJS:</span>{" "}
                    {formatCurrency(selectedAppeal.bpjs_deduction)}
                  </p>
                  <p>
                    <span className="font-semibold">Potongan Pajak:</span>{" "}
                    {formatCurrency(selectedAppeal.tax_deduction)}
                  </p>
                  <p>
                    <span className="font-semibold">Potongan Lain:</span>{" "}
                    {formatCurrency(selectedAppeal.other_deduction)}
                  </p>
                  <p>
                    <span className="font-semibold">Total Potongan:</span>{" "}
                    {formatCurrency(selectedAppeal.deduction)}
                  </p>
                  <p>
                    <span className="font-semibold">Net Salary:</span>{" "}
                    {formatCurrency(selectedAppeal.net_salary)}
                  </p>
                  <p>
                    <span className="font-semibold">Total Gaji Final:</span>{" "}
                    {formatCurrency(
                      selectedAppeal.final_amount || selectedAppeal.net_salary,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {selectedAppeal.supporting_documents_url ? (
                  <button
                    type="button"
                    onClick={() =>
                      openSupportingDocModal(
                        selectedAppeal.supporting_documents_url,
                      )
                    }
                    className="
                      px-3 py-1 text-sm
                      bg-gradient-to-b from-blue-400 to-blue-600
                      text-white rounded-full
                      shadow-md hover:shadow-lg
                      border border-blue-600
                      hover:from-blue-500 hover:to-blue-700
                      transition-all duration-200
                      inline-flex items-center justify-center
                    "
                  >
                    Lihat Bukti
                  </button>
                ) : null}
                {selectedAppeal.payroll_id ? (
                  <button
                    type="button"
                    className="
                      px-3 py-1 text-xs
                      bg-gradient-to-b from-blue-400 to-blue-600
                      text-white rounded-full
                      shadow-md hover:shadow-lg
                      border border-blue-600
                      hover:from-blue-500 hover:to-blue-700
                      transition-all duration-200
                    "
                    onClick={() => openPayrollPdf(selectedAppeal.payroll_id)}
                  >
                    Lihat Slip Gaji
                  </button>
                ) : null}
              </div>
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn"
                onClick={() => setShowViewModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        type="checkbox"
        id="payroll-modal"
        className="modal-toggle"
        checked={!!selectedPayrollModal}
        onChange={closePayrollModal}
      />
      <div className="modal">
        <div className="modal-box max-w-4xl">
          <button
            type="button"
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={closePayrollModal}
          >
            ✕
          </button>
          <h3 className="font-semibold text-xl mb-1">Slip Gaji</h3>
          <p className="text-sm opacity-70 mb-4">
            ID Payroll: {selectedPayrollModal?.payrollId || "-"}
          </p>

          <div className="w-full min-h-[420px] bg-base-200 rounded-lg overflow-hidden flex items-center justify-center">
            {selectedPayrollModal?.type === "pdf" ? (
              <iframe
                title="Slip Gaji PDF"
                src={selectedPayrollModal.url}
                className="w-full h-[70vh] border-0"
              />
            ) : (
              <p className="opacity-70">Tidak ada file slip gaji.</p>
            )}
          </div>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="payroll-modal"
          onClick={closePayrollModal}
        >
          Close
        </label>
      </div>

      <input
        type="checkbox"
        id="supporting-doc-modal"
        className="modal-toggle"
        checked={!!selectedSupportingDoc}
        onChange={closeSupportingDocModal}
      />
      <div className="modal">
        <div className="modal-box max-w-4xl">
          <button
            type="button"
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={closeSupportingDocModal}
          >
            ✕
          </button>
          <h3 className="font-semibold text-xl mb-1">Bukti Pendukung</h3>

          <div className="w-full min-h-[420px] bg-base-200 rounded-lg overflow-hidden flex items-center justify-center">
            {selectedSupportingDoc?.type === "image" ? (
              <img
                src={selectedSupportingDoc.url}
                alt="Bukti pendukung"
                className="max-h-[70vh] w-auto object-contain"
              />
            ) : selectedSupportingDoc?.type === "pdf" ? (
              <iframe
                title="Bukti PDF"
                src={selectedSupportingDoc.url}
                className="w-full h-[70vh] border-0"
              />
            ) : selectedSupportingDoc?.url ? (
              <div className="text-center p-6">
                <p className="mb-2">
                  Preview tidak tersedia untuk tipe file ini.
                </p>
                <a
                  href={selectedSupportingDoc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  Buka File
                </a>
              </div>
            ) : (
              <p className="opacity-70">Tidak ada file bukti.</p>
            )}
          </div>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="supporting-doc-modal"
          onClick={closeSupportingDocModal}
        >
          Close
        </label>
      </div>
    </>
  );
}

export default EmployeeSalaryAppeal;
