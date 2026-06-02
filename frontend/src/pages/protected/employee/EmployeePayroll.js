import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import { pegawaiApi } from "../../../features/pegawai/api";
import Pagination from "../../../components/Pagination/Pagination";

// (removed unused helper getFileTypeFromPath for cleanliness)

const getPayrollStatusLabel = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "transferred") {
    return "telah dikirim ke rekening";
  }

  return normalizedStatus || "-";
};

const PAYROLL_BADGE_CLASS = {
  draft: "badge-warning",
  transferred: "badge-info",
  published: "badge-success",
  claimed: "badge-primary",
  rejected: "badge-error",
};

const APPEAL_BADGE_CLASS = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
};

const getPayrollStatusValue = (item) =>
  String(item?.payment_status || item?.status || "").toLowerCase();

const getAccountCreatedYear = (profile) => {
  const dateCandidates = [
    profile?.employee?.created_at,
    profile?.employee?.createdAt,
    profile?.employee?.joined_date,
    profile?.employee?.joinedDate,
    profile?.user?.created_at,
    profile?.user?.createdAt,
    profile?.created_at,
    profile?.createdAt,
  ];

  for (const candidate of dateCandidates) {
    if (!candidate) continue;
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) {
      return date.getFullYear();
    }
  }

  return null;
};

const getSlipDateParts = (item) => {
  const pad = (value) => String(value).padStart(2, "0");
  const dateCandidates = [
    item?.created_at,
    item?.createdAt,
    item?.slip_created_at,
    item?.slipCreatedAt,
    item?.generated_at,
    item?.generatedAt,
  ];

  for (const candidate of dateCandidates) {
    if (!candidate) continue;
    const date = new Date(candidate);
    if (!Number.isNaN(date.getTime())) {
      return {
        day: pad(date.getDate()),
        month: pad(date.getMonth() + 1),
        year: String(date.getFullYear()),
      };
    }
  }

  const periodMonth = Number(item?.period_month);
  const periodYear = Number(item?.period_year);
  if (
    Number.isFinite(periodMonth) &&
    periodMonth >= 1 &&
    periodMonth <= 12 &&
    Number.isFinite(periodYear)
  ) {
    return {
      day: "01",
      month: pad(periodMonth),
      year: String(periodYear),
    };
  }

  const now = new Date();
  return {
    day: pad(now.getDate()),
    month: pad(now.getMonth() + 1),
    year: String(now.getFullYear()),
  };
};

function EmployeePayroll() {
  const dispatch = useDispatch();
  const [employeeId, setEmployeeId] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [startYear, setStartYear] = useState(null);
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appealStatusFilter, setAppealStatusFilter] = useState("all");
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const yearOptions = useMemo(() => {
    const nowYear = new Date().getFullYear();

    // Main behavior: show years from account creation year up to current year.
    if (Number.isFinite(startYear)) {
      const fromYear = Math.min(startYear, nowYear);
      const years = [];
      for (let year = nowYear; year >= fromYear; year -= 1) {
        years.push(String(year));
      }
      return years;
    }

    // Fallback when account creation year is unavailable.
    const payrollYears = Array.from(
      new Set(
        payrolls
          .map((item) => String(item?.period_year || "").trim())
          .filter(Boolean),
      ),
    );

    return payrollYears.sort((a, b) => Number(b) - Number(a));
  }, [payrolls, startYear]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(
      new Set(
        payrolls.map((item) => getPayrollStatusValue(item)).filter(Boolean),
      ),
    );

    return statuses.sort((a, b) => a.localeCompare(b));
  }, [payrolls]);

  const appealStatusOptions = useMemo(() => {
    const statuses = Array.from(
      new Set(
        payrolls
          .map((item) =>
            String(item?.appeal_status || "")
              .toLowerCase()
              .trim(),
          )
          .filter(Boolean),
      ),
    );

    return statuses.sort((a, b) => a.localeCompare(b));
  }, [payrolls]);

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((item) => {
      const itemYear = String(item?.period_year || "").trim();
      const itemStatus = getPayrollStatusValue(item);
      const itemAppealStatus = String(item?.appeal_status || "")
        .toLowerCase()
        .trim();

      const matchYear = yearFilter === "all" || itemYear === yearFilter;
      const matchStatus = statusFilter === "all" || itemStatus === statusFilter;
      const matchAppealStatus =
        appealStatusFilter === "all" || itemAppealStatus === appealStatusFilter;

      return matchYear && matchStatus && matchAppealStatus;
    });
  }, [payrolls, yearFilter, statusFilter, appealStatusFilter]);

  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayrolls = filteredPayrolls.slice(startIndex, endIndex);

  const handleChangePage = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredPayrolls]);

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
      setStartYear(getAccountCreatedYear(profile));
      const result = await pegawaiApi.getPayrollByEmployee(currentEmployeeId);
      setPayrolls(result?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: "Slip Gaji Pegawai" }));
    loadData();
  }, [dispatch]);

  const claimPayroll = async (payrollId) => {
    try {
      setActionLoadingId(payrollId);
      setError("");
      await pegawaiApi.claimPayroll(payrollId);
      if (employeeId) {
        const result = await pegawaiApi.getPayrollByEmployee(employeeId);
        setPayrolls(result?.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openPayrollPdf = async (payrollItem) => {
    const payrollId = payrollItem?.id;

    try {
      setError("");
      const blob = await pegawaiApi.getPayrollPdfBlob(payrollId);
      const url = window.URL.createObjectURL(blob);
      const { day, month, year } = getSlipDateParts(payrollItem);

      setSelectedPayroll({
        url,
        payrollId,
        period: `${payrollItem.period_month}/${payrollItem.period_year}`,
        date: `${day}-${month}-${year}`,
        type: "pdf",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const closePayrollModal = () => {
    if (selectedPayroll?.url) {
      window.URL.revokeObjectURL(selectedPayroll.url);
    }
    setSelectedPayroll(null);
  };

  const resetPayrollFilters = () => {
    setYearFilter("all");
    setStatusFilter("all");
    setAppealStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <>
      {error ? (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      ) : null}

      <TitleCard title="Daftar Slip Gaji" topMargin="mt-0">
        {loading ? (
          <div>Memuat slip gaji...</div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Filter Tahun</span>
                </div>
                <select
                  className="select select-bordered w-full"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="all">Semua Tahun</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Filter Status</span>
                </div>
                <select
                  className="select select-bordered w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {getPayrollStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Filter Status Banding</span>
                </div>
                <select
                  className="select select-bordered w-full"
                  value={appealStatusFilter}
                  onChange={(e) => setAppealStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status Banding</option>
                  {appealStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end justify-right mb-0">
                <button
                  type="button"
                  className="btn btn-secondary rounded-full"
                  onClick={resetPayrollFilters}
                >
                  Reset
                </button>
              </div>
            </div>

            <>
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Periode</th>
                      <th>Total Gaji</th>
                      <th>Final Amount</th>
                      <th>Status</th>
                      <th>Status Banding</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayrolls.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.period_month}/{item.period_year}
                      </td>
                      <td>
                        {item.is_revised_appeal &&
                        ["published", "claimed", "transferred"].includes(
                          getPayrollStatusValue(item),
                        ) ? (
                          <div className="space-y-1">
                            <p>
                              Rp{" "}
                              {Number(
                                item.comparison_old_amount ??
                                  item.take_home_pay ??
                                  0,
                              ).toLocaleString("id-ID")}
                            </p>
                            <p className="text-xs opacity-70">
                              Hasil banding:{" "}
                              {Number(
                                (
                                  Number(
                                    item.comparison_new_amount ??
                                      item.final_amount ??
                                      item.net_salary ??
                                      0,
                                  ) -
                                  Number(
                                    item.comparison_old_amount ??
                                      item.take_home_pay ??
                                      0,
                                  )
                                ).toFixed(2),
                              ) >= 0
                                ? "+"
                                : "-"}
                              Rp{" "}
                              {Math.abs(
                                Number(
                                  (
                                    Number(
                                      item.comparison_new_amount ??
                                        item.final_amount ??
                                        item.net_salary ??
                                        0,
                                    ) -
                                    Number(
                                      item.comparison_old_amount ??
                                        item.take_home_pay ??
                                        0,
                                    )
                                  ).toFixed(2),
                                ),
                              ).toLocaleString("id-ID")}
                            </p>
                          </div>
                        ) : (
                          <span>
                            Rp{" "}
                            {Number(
                              item.take_home_pay ??
                                item.final_amount ??
                                item.net_salary ??
                                0,
                            ).toLocaleString("id-ID")}
                          </span>
                        )}
                      </td>
                      <td>
                        {item.final_amount !== null &&
                        item.final_amount !== undefined
                          ? `Rp ${Number(item.final_amount).toLocaleString("id-ID")}`
                          : "-"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            PAYROLL_BADGE_CLASS[
                              String(
                                item.payment_status || item.status,
                              ).toLowerCase()
                            ] || "badge-ghost"
                          }`}
                        >
                          {getPayrollStatusLabel(
                            item.payment_status || item.status,
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            APPEAL_BADGE_CLASS[
                              String(item.appeal_status || "").toLowerCase()
                            ] || "badge-outline"
                          }`}
                        >
                          {item.appeal_status || "-"}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            className="px-3 py-1 text-xs bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full shadow-md hover:shadow-lg border border-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-200 whitespace-nowrap"
                            onClick={() => openPayrollPdf(item)}
                          >
                            Lihat
                          </button>
                          <button
                            className={`btn btn-xs btn-primary whitespace-nowrap ${actionLoadingId === item.id ? "loading" : ""}`}
                            disabled={
                              item.status !== "published" ||
                              actionLoadingId === item.id ||
                              item.appeal_status === "pending"
                            }
                            onClick={() => claimPayroll(item.id)}
                          >
                            Klaim gaji
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                    {filteredPayrolls.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center opacity-70">
                          Belum ada slip gaji
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onChangePage={handleChangePage}
                itemsPerPage={itemsPerPage}
              />
            </>
          </>
        )}
      </TitleCard>

      <input
        type="checkbox"
        id="payroll-modal"
        className="modal-toggle"
        checked={!!selectedPayroll}
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
            Periode: {selectedPayroll?.period || "-"}
          </p>

          <div className="w-full min-h-[420px] bg-base-200 rounded-lg overflow-hidden flex items-center justify-center">
            {selectedPayroll?.type === "pdf" ? (
              <iframe
                title="Slip Gaji PDF"
                src={selectedPayroll.url}
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
    </>
  );
}

export default EmployeePayroll;

