import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import TitleCard from "../../components/Cards/TitleCard";
import { pegawaiApi } from "../../features/pegawai/api";

const INITIAL_FORM = {
  leave_type: "",
  start_date: "",
  end_date: "",
  reason: "",
  bukti: null,
  time: "",
  cuti_khusus_option: "",
};

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

const LEAVE_MODE_LABEL = {
  izin: "Izin",
  cuti: "Cuti",
};

const LEAVE_MODE_TYPES = {
  izin: ["izin_sakit", "izin_pribadi", "izin_terlambat", "izin_lainnya"],
  cuti: [
    "cuti_tahunan",
    "cuti_sakit",
    "cuti_melahirkan",
    "cuti_keguguran",
    "cuti_menikah",
    "cuti_khusus",
    "cuti_lainnya",
  ],
};

const getDefaultLeaveTypeByMode = (mode) => LEAVE_MODE_TYPES[mode]?.[0] || "";

const CUTI_KHUSUS_OPTIONS = [
  { key: "menikahkan_anak", label: "Anggota keluarga menikah", days: 2 },
  { key: "istri_melahirkan", label: "Istri melahirkan/keguguran", days: 2 },
  { key: "pasangan_orangtua_anak_meninggal", label: "Keluarga meninggal", days: 2 },
  { key: "anggota_keluarga_serumah_meninggal", label: "Saudara meninggal", days: 1 },
];

const STATUS_BADGE_CLASS = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const calculateRequestedDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  )
    return 0;

  const difference = end - start;
  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
};

const addDaysToDateString = (dateString, daysToAdd) => {
  if (!dateString || Number.isNaN(Number(daysToAdd))) return "";

  const baseDate = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(baseDate.getTime())) return "";

  baseDate.setDate(baseDate.getDate() + Number(daysToAdd));

  const yyyy = baseDate.getFullYear();
  const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
  const dd = String(baseDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getMaxDaysForLeaveType = (leaveType, cutiKhususOptionKey) => {
  return 0;
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

function EmployeeLeave() {
  const dispatch = useDispatch();
  const [form, setForm] = useState(INITIAL_FORM);
  const [leaveMode, setLeaveMode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [profile, setProfile] = useState({});
  const [todayAttendance, setTodayAttendance] = useState({});
  const [selectedProof, setSelectedProof] = useState(null);
  const [leavePolicy, setLeavePolicy] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchPolicy = async () => {
      if (!form.leave_type) {
        setLeavePolicy(null);
        return;
      }

      try {
        const res = await pegawaiApi.getLeavePolicy(form.leave_type);
        const payload = res && res.data ? res.data : res;
        if (mounted) setLeavePolicy(payload || null);
      } catch (e) {
        if (mounted) setLeavePolicy(null);
      }
    };

    fetchPolicy();
    return () => {
      mounted = false;
    };
  }, [form.leave_type]);

  const getEffectiveMaxDays = (leaveType, cutiKhususOptionKey) => {
    if (leavePolicy && leavePolicy.leave_type === leaveType) {
      if (leaveType === "cuti_khusus") {
        const opts = (leavePolicy.meta && leavePolicy.meta.options) || [];
        const opt = opts.find((o) => o.key === cutiKhususOptionKey);
        if (opt && Number(opt.days)) return Number(opt.days);
      }
      if (Number(leavePolicy.max_days || 0) > 0) return Number(leavePolicy.max_days);
    }

    return getMaxDaysForLeaveType(leaveType, cutiKhususOptionKey);
  };

  const getAllowedEndDate = (startDate, leaveType, cutiKhususOptionKey) => {
    const maxDays = getEffectiveMaxDays(leaveType, cutiKhususOptionKey);
    if (!startDate || maxDays <= 0) return "";

    return addDaysToDateString(startDate, maxDays - 1);
  };

  const normalizeLeaveDates = (draftForm) => {
    const nextForm = { ...draftForm };

    if (!nextForm.start_date) return nextForm;

    if (nextForm.end_date && nextForm.end_date < nextForm.start_date) {
      nextForm.end_date = nextForm.start_date;
    }

    const allowedEndDate = getAllowedEndDate(
      nextForm.start_date,
      nextForm.leave_type,
      nextForm.cuti_khusus_option,
    );

    if (allowedEndDate && nextForm.end_date && nextForm.end_date > allowedEndDate) {
      nextForm.end_date = allowedEndDate;
    }

    return nextForm;
  };

  const todayDateKey = new Date().toISOString().split("T")[0];

  const isDateInRange = (startDate, endDate, currentDate) => {
    if (!startDate || !endDate || !currentDate) return false;
    return startDate <= currentDate && endDate >= currentDate;
  };

  const loadData = useCallback(
    async (selectedStatus = statusFilter) => {
      try {
        setLoading(true);
        setError("");

        const [profileResult, requestsResult, todayAttendanceResult] =
          await Promise.allSettled([
            pegawaiApi.getProfile(),
            pegawaiApi.getMyLeaveRequests(),
            pegawaiApi.getAttendanceToday(),
          ]);

        if (profileResult.status === "fulfilled") {
          setProfile(profileResult.value || {});
        } else {
          setProfile({});
        }

        if (requestsResult.status === "fulfilled") {
          const allData = requestsResult.value?.data || [];
          setAllRequests(allData);
          setRequests(
            selectedStatus
              ? allData.filter((item) => item.status === selectedStatus)
              : allData,
          );
        } else {
          setAllRequests([]);
          setRequests([]);
          setError(
            requestsResult.reason?.message || "Gagal memuat data cuti/izin",
          );
        }

        if (todayAttendanceResult.status === "fulfilled") {
          setTodayAttendance(todayAttendanceResult.value || {});
        } else {
          setTodayAttendance({});
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    dispatch(setPageTitle({ title: "Cuti & Izin Pegawai" }));
    loadData();
  }, [dispatch, loadData]);

  const updateForm = (field, value) => {
    setForm((prev) => {
      const nextForm = {
        ...prev,
        [field]: value,
      };

      if (field === "leave_type") {
        nextForm.cuti_khusus_option = value === "cuti_khusus" ? prev.cuti_khusus_option : "";
        nextForm.time = value === "izin_terlambat" ? prev.time : "";
      }

      return normalizeLeaveDates(nextForm);
    });
  };

  const selectLeaveMode = (mode) => {
    setLeaveMode(mode);
    setForm((prev) => ({
      ...prev,
      leave_type: getDefaultLeaveTypeByMode(mode),
    }));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const isSingleDayLeave = form.leave_type === "izin_terlambat";
    const effectiveEndDate = isSingleDayLeave
      ? form.start_date || form.end_date
      : form.end_date;

    if (
      !form.leave_type ||
      !form.start_date ||
      !effectiveEndDate ||
      !form.reason
    ) {
      setError(
        "Jenis cuti/izin, tanggal mulai, tanggal akhir, dan alasan wajib diisi",
      );
      return;
    }

    const submittedForm = normalizeLeaveDates({
      ...form,
      end_date: getAllowedEndDate(
        form.start_date,
        form.leave_type,
        form.cuti_khusus_option,
      ) || effectiveEndDate,
    });
    const requestedDaysForSubmit = calculateRequestedDays(
      submittedForm.start_date,
      submittedForm.end_date,
    );

    // Client-side specific validations (use policy from backend when available)
    const policy = leavePolicy || null;
    const requiresBukti = (() => {
      if (policy) {
        if (Number(policy.require_bukti || 0) === 1) return true;
        if (
          Number(policy.require_bukti_if_days_gt || 0) > 0 &&
          requestedDaysForSubmit > Number(policy.require_bukti_if_days_gt || 0)
        )
          return true;
        return false;
      }

      return [
        "cuti_melahirkan",
        "cuti_keguguran",
        "cuti_sakit",
        "izin_sakit",
      ].includes(form.leave_type);
    })();

    if (requiresBukti && !form.bukti) {
      setError("Jenis ini mensyaratkan bukti pendukung (surat dokter/dokumen).");
      return;
    }

    // Frontend: prevent submitting long izin_sakit; suggest cuti_sakit instead
    const izinSakitMaxDays = Number(
      form.leave_type === "izin_sakit" ? leavePolicy?.max_days || 0 : 0,
    );

    if (
      form.leave_type === "izin_sakit" &&
      izinSakitMaxDays > 0 &&
      requestedDaysForSubmit > izinSakitMaxDays
    ) {
      setError(`Izin Sakit hanya bisa diajukan maksimal ${izinSakitMaxDays} hari sesuai aturan database.`);
      return;
    }

    if (form.leave_type === "cuti_khusus" && !form.cuti_khusus_option) {
      setError("Pilih alasan untuk Cuti Penting (Cuti Khusus).");
      return;
    }

    if (form.leave_type === "izin_terlambat") {
      if (!form.time) {
        setError("Masukkan jam masuk / pulang cepat untuk Izin Terlambat.");
        return;
      }
      if (!form.cuti_khusus_option) {
        setError("Pilih tipe izin: Terlambat atau Pulang Cepat.");
        return;
      }
    }

    if (form.leave_type === "izin_pribadi") {
      const monthlyLimit = (policy && policy.meta && policy.meta.monthly_limit) || 2;
      if (requestedDaysForSubmit > Number(monthlyLimit)) {
        setError(`Izin Keperluan Pribadi dibatasi maksimal ${monthlyLimit} hari per pengajuan.`);
        return;
      }
    }

    const maxDaysForLeave = getEffectiveMaxDays(form.leave_type, form.cuti_khusus_option);

    if (maxDaysForLeave > 0 && requestedDaysForSubmit > maxDaysForLeave) {
      setError(
        `${LEAVE_TYPE_LABEL[form.leave_type] || form.leave_type} maksimal ${maxDaysForLeave} hari per pengajuan.`,
      );
      return;
    }

    if (new Date(submittedForm.end_date) < new Date(submittedForm.start_date)) {
      setError("Tanggal akhir tidak boleh lebih kecil dari tanggal mulai");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");
      await pegawaiApi.submitLeaveRequest(submittedForm);
      setForm({
        ...INITIAL_FORM,
        leave_type: getDefaultLeaveTypeByMode(leaveMode),
      });
      setSuccessMessage("Pengajuan cuti/izin berhasil dikirim");
      await loadData(statusFilter);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const annualLeaveQuota = profile?.employee?.annual_leave_quota ?? 0;
  const remainingLeaveQuota = profile?.employee?.remaining_leave_quota ?? 0;
  const requestedDays = calculateRequestedDays(form.start_date, form.end_date);
  const maxDaysForCurrentLeave = getEffectiveMaxDays(
    form.leave_type,
    form.cuti_khusus_option,
  );
  const maxEndDate = getAllowedEndDate(
    form.start_date,
    form.leave_type,
    form.cuti_khusus_option,
  );
  const pendingCount = allRequests.filter(
    (item) => item.status === "pending",
  ).length;
  const approvedCount = allRequests.filter(
    (item) => item.status === "approved",
  ).length;
  const rejectedCount = allRequests.filter(
    (item) => item.status === "rejected",
  ).length;

  const activeLeaveToday = allRequests.find(
    (item) =>
      item.status === "approved" &&
      isDateInRange(item.start_date, item.end_date, todayDateKey),
  );
  const isAttendanceIntegratedToday = ["izin", "sakit"].includes(
    String(todayAttendance?.status || "").toLowerCase(),
  );

  const openProofModal = (proofPath, leaveType) => {
    if (!proofPath) return;
    setSelectedProof({
      path: proofPath,
      type: getFileTypeFromPath(proofPath),
      leaveType: LEAVE_TYPE_LABEL[leaveType] || leaveType,
    });
  };

  const closeProofModal = () => {
    setSelectedProof(null);
  };

  useEffect(() => {
    if (!form.start_date || !form.end_date || !maxEndDate) return;
    if (form.end_date > maxEndDate) {
      setForm((prev) => ({ ...prev, end_date: maxEndDate }));
    }
  }, [form.start_date, form.end_date, maxEndDate]);

  useEffect(() => {
    if (form.leave_type !== "izin_terlambat") return;
    if (!form.start_date) return;
    if (form.end_date === form.start_date) return;

    setForm((prev) => ({
      ...prev,
      end_date: prev.start_date,
    }));
  }, [form.leave_type, form.start_date, form.end_date]);

  return (
    <>
      {error ? (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      ) : null}

      {successMessage ? (
        <div className="alert alert-success mb-4">
          <span>{successMessage}</span>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 mb-6">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Kuota Tahunan</div>
          <div className="stat-value text-primary text-2xl">
            {annualLeaveQuota}
          </div>
          <div className="stat-desc">hari/tahun</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Sisa Kuota</div>
          <div className="stat-value text-success text-2xl">
            {remainingLeaveQuota}
          </div>
          <div className="stat-desc">hari tersedia</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Menunggu</div>
          <div className="stat-value text-warning text-2xl">{pendingCount}</div>
          <div className="stat-desc">pengajuan pending</div>
        </div>
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Disetujui / Ditolak</div>
          <div className="stat-value text-2xl">
            {approvedCount}/{rejectedCount}
          </div>
          <div className="stat-desc">approved / rejected</div>
        </div>
      </div>

      <TitleCard title="Ajukan Cuti / Izin" topMargin="mt-6">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-base-200">
            <p className="text-sm opacity-70">Status Absensi Hari Ini</p>
            <p className="text-lg font-semibold capitalize">
              {todayAttendance?.status || "Belum ada status"}
            </p>
            <p className="text-xs opacity-70 mt-1">
              {isAttendanceIntegratedToday
                ? "Tombol absen otomatis tidak perlu diklik karena status cuti/izin aktif."
                : "Jika pengajuan disetujui untuk hari ini, absensi akan terisi otomatis."}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-base-200">
            <p className="text-sm opacity-70">Pengajuan Aktif Hari Ini</p>
            {activeLeaveToday ? (
              <>
                <p className="text-lg font-semibold">
                  {LEAVE_TYPE_LABEL[activeLeaveToday.leave_type] ||
                    activeLeaveToday.leave_type}
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {formatDate(activeLeaveToday.start_date)} -{" "}
                  {formatDate(activeLeaveToday.end_date)}
                </p>
              </>
            ) : (
              <p className="text-lg font-semibold">Tidak ada</p>
            )}
          </div>
        </div>

        {!leaveMode ? (
          <div className="mb-5 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-base-content">
                Jenis Pengajuan
              </h3>

              <p className="mt-1 text-sm text-base-content/70">
                Silakan pilih <b>Izin</b> atau <b>Cuti</b> untuk membuka form
                pengajuan.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => selectLeaveMode("izin")}
                className={`
        rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200
        ${
          leaveMode === "izin"
            ? "bg-primary text-primary-content shadow-md hover:bg-primary-focus"
            : "bg-base-200 text-base-content hover:bg-accent hover:text-accent-content"
        }
      `}
              >
                {LEAVE_MODE_LABEL.izin}
              </button>

              <button
                type="button"
                onClick={() => selectLeaveMode("cuti")}
                className={`
        rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200
        ${
          leaveMode === "cuti"
            ? "bg-primary text-primary-content shadow-md hover:bg-primary-focus"
            : "bg-base-200 text-base-content hover:bg-accent hover:text-accent-content"
        }
      `}
              >
                {LEAVE_MODE_LABEL.cuti}
              </button>
            </div>
          </div>
        ) : null}

        {leaveMode ? (
          <form
            className="grid md:grid-cols-2 grid-cols-1 gap-4"
            onSubmit={submitForm}
          >
            <div className="text-sm">
              <label className="block text-xs opacity-70 mb-1">Jenis pengajuan</label>
              <select
                className="select select-bordered w-full"
                value={form.leave_type}
                onChange={(e) => updateForm("leave_type", e.target.value)}
              >
                {LEAVE_MODE_TYPES[leaveMode].map((leaveType) => (
                  <option key={leaveType} value={leaveType}>
                    {LEAVE_TYPE_LABEL[leaveType] || leaveType}
                  </option>
                ))}
              </select>
            </div>
            {form.leave_type === "cuti_khusus" ? (
              <div className="hidden md:block" aria-hidden="true" />
            ) : (
              <div className="text-sm opacity-70 flex items-center">
                Total pengajuan: <b className="ml-1">{requestedDays} hari</b>
              </div>
            )}
            {form.leave_type === "cuti_khusus" ? (
              <>
                <div className="text-sm">
                  <label className="block text-xs opacity-70 mb-1">Alasan cuti khusus</label>
                  <select
                    className="select select-bordered w-full"
                    value={form.cuti_khusus_option}
                    onChange={(e) => updateForm("cuti_khusus_option", e.target.value)}
                  >
                    <option value="">Pilih alasan cuti khusus</option>
                    {((leavePolicy && leavePolicy.meta && leavePolicy.meta.options) || CUTI_KHUSUS_OPTIONS).map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm opacity-70 flex items-center">
                  Total pengajuan: <b className="ml-1">{requestedDays} hari</b>
                </div>
              </>
            ) : null}
            {form.leave_type === "izin_terlambat" ? (
              <>
                <div className="text-sm">
                  <label className="block text-xs opacity-70 mb-1">Tanggal izin</label>
                  <input
                    className="input input-bordered border-base-300 bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => updateForm("start_date", e.target.value)}
                  />
                </div>
                <div className="text-sm">
                  <label className="block text-xs opacity-70 mb-1">Jam masuk / pulang cepat</label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={form.time}
                    onChange={(e) => updateForm("time", e.target.value)}
                  />
                </div>
                <div className="text-sm">
                  <label className="block text-xs opacity-70 mb-1">Tipe izin</label>
                  <select
                    className="select select-bordered w-full"
                    value={form.cuti_khusus_option || ""}
                    onChange={(e) => updateForm("cuti_khusus_option", e.target.value)}
                  >
                    <option value="">Pilih tipe izin</option>
                    <option value="terlambat">Terlambat (masuk terlambat)</option>
                    <option value="pulang_cepat">Pulang Cepat</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <input
                  className="input input-bordered border-base-300 bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => updateForm("start_date", e.target.value)}
                />
                <input
                  className="input input-bordered border-base-300 bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="date"
                  value={form.end_date}
                  min={form.start_date || undefined}
                  max={maxEndDate || undefined}
                  onChange={(e) => updateForm("end_date", e.target.value)}
                />
              </>
            )}
            <div className="md:col-span-2 text-xs opacity-70">
              {form.leave_type === "izin_terlambat"
                ? "Izin terlambat/pulang cepat hanya untuk 1 tanggal pengajuan."
                : maxDaysForCurrentLeave > 0
                ? `Rentang tanggal otomatis dibatasi maksimal ${maxDaysForCurrentLeave} hari sesuai peraturan izin dan cuti.`
                : "Rentang tanggal mengikuti aturan izin dan cuti yang aktif."}
            </div>
            <textarea
              className="textarea textarea-bordered md:col-span-2"
              placeholder="Alasan pengajuan"
              value={form.reason}
              onChange={(e) => updateForm("reason", e.target.value)}
            />
            <input
              className="file-input file-input-bordered md:col-span-2"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => updateForm("bukti", e.target.files?.[0] || null)}
            />
            <div className="md:col-span-2 text-xs opacity-70">
              {(() => {
                const policy = leavePolicy || null;
                const requiresBuktiNow = (() => {
                  if (policy) {
                    if (Number(policy.require_bukti || 0) === 1) return true;
                    if (
                      Number(policy.require_bukti_if_days_gt || 0) > 0 &&
                      requestedDays > Number(policy.require_bukti_if_days_gt || 0)
                    )
                      return true;
                    return false;
                  }

                  return [
                    "cuti_melahirkan",
                    "cuti_keguguran",
                    "cuti_sakit",
                    "izin_sakit",
                  ].includes(form.leave_type);
                })();

                if (requiresBuktiNow) return "Bukti (surat dokter/dokumen) wajib untuk jenis ini.";
                if (form.leave_type === "izin_pribadi") {
                  const monthlyLimit = (policy && policy.meta && policy.meta.monthly_limit) || 2;
                  return `Izin Keperluan Pribadi: maksimal ${monthlyLimit} hari per bulan; tidak dibayar.`;
                }
                if (form.leave_type === "cuti_sakit") return "Skema pembayaran untuk cuti sakit: 4 bulan 100%, 4 bulan 75%, 4 bulan 50%, selanjutnya 25%.";
                if (maxDaysForCurrentLeave > 0) return `Maksimal ${maxDaysForCurrentLeave} hari untuk jenis ini.`;
                return "Tipe file bukti: PDF/JPG/JPEG/PNG. Bukti bersifat opsional.";
              })()}
            </div>
            <div className="md:col-span-2 flex gap-2 flex-wrap">
              <button
                className={`btn btn-primary ${submitting ? "loading" : ""}`}
                type="submit"
                disabled={submitting}
              >
                Kirim Pengajuan
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setLeaveMode("")}
              >
                Ulangi Pilihan
              </button>
            </div>
          </form>
        ) : (
          <></>
        )}
      </TitleCard>

      <TitleCard title="Riwayat Pengajuan Cuti / Izin" topMargin="mt-6">
        <div className="flex justify-end mb-4">
          <select
            className="select select-bordered select-sm w-full max-w-xs"
            value={statusFilter}
            onChange={async (e) => {
              const nextStatus = e.target.value;
              setStatusFilter(nextStatus);
              await loadData(nextStatus);
            }}
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div>Memuat data pengajuan...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Diajukan</th>
                  <th>Periode</th>
                  <th>Jenis</th>
                  <th>Total Hari</th>
                  <th>Status</th>
                  <th>Disetujui Oleh</th>
                  <th>Waktu Persetujuan</th>
                  <th>Bukti</th>
                  <th>Alasan</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        {formatDate(item.start_date)} -{" "}
                        {formatDate(item.end_date)}
                      </td>
                      <td>
                        {LEAVE_TYPE_LABEL[item.leave_type] || item.leave_type}
                      </td>
                      <td>{item.total_days || 0}</td>
                      <td>
                        <span
                          className={`badge ${STATUS_BADGE_CLASS[item.status] || "badge-outline"}`}
                        >
                          {item.status || "-"}
                        </span>
                      </td>
                      <td>{item.approved_by_name || "-"}</td>
                      <td>{formatDateTime(item.approved_at)}</td>
                      <td>
                        {item.bukti ? (
                          <button
                            type="button"
                            className="link link-primary"
                            onClick={() =>
                              openProofModal(item.bukti, item.leave_type)
                            }
                          >
                            Lihat
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="max-w-xs whitespace-normal">
                        {item.reason || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center opacity-70">
                      Belum ada data pengajuan cuti/izin
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </TitleCard>

      <input
        type="checkbox"
        id="leave-proof-modal"
        className="modal-toggle"
        checked={!!selectedProof}
        onChange={closeProofModal}
      />
      <div className="modal">
        <div className="modal-box max-w-4xl">
          <button
            type="button"
            className="btn btn-sm btn-circle absolute right-2 top-2"
            onClick={closeProofModal}
          >
            ✕
          </button>
          <h3 className="font-semibold text-xl mb-1">Bukti Pengajuan</h3>
          <p className="text-sm opacity-70 mb-4">
            Jenis: {selectedProof?.leaveType || "-"}
          </p>

          <div className="w-full min-h-[420px] bg-base-200 rounded-lg overflow-hidden flex items-center justify-center">
            {selectedProof?.type === "image" ? (
              <img
                src={getAssetUrl(selectedProof.path)}
                alt="Bukti cuti atau izin"
                className="max-h-[70vh] w-auto object-contain"
              />
            ) : selectedProof?.type === "pdf" ? (
              <iframe
                title="Bukti PDF"
                src={getAssetUrl(selectedProof.path)}
                className="w-full h-[70vh] border-0"
              />
            ) : selectedProof?.path ? (
              <div className="text-center p-6">
                <p className="mb-2">
                  Preview tidak tersedia untuk tipe file ini.
                </p>
                <a
                  href={getAssetUrl(selectedProof.path)}
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
          htmlFor="leave-proof-modal"
          onClick={closeProofModal}
        >
          Close
        </label>
      </div>
    </>
  );
}

export default EmployeeLeave;
