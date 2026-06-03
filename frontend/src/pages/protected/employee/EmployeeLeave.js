import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import { pegawaiApi } from "../../../features/pegawai/api";
import Holidays from "date-holidays";
import Pagination from "../../../components/Pagination/Pagination";

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

const parseLocalDate = (dateValue) => {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    return new Date(
      dateValue.getFullYear(),
      dateValue.getMonth(),
      dateValue.getDate(),
    );
  }

  const dateString = String(dateValue);
  return new Date(`${dateString}T00:00:00`);
};

const formatLocalDateKey = (dateValue) => {
  const date = parseLocalDate(dateValue);
  if (!date || Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Initialize holiday detector for Indonesia
const holidayCalendar = new Holidays("ID");

// Get holiday info from date-holidays library
const getHolidayInfo = (dateValue) => {
  try {
    const localDate = parseLocalDate(dateValue);
    if (!localDate || Number.isNaN(localDate.getTime())) return null;

    const result = holidayCalendar.isHoliday(localDate);
    if (!result) return null;
    if (Array.isArray(result)) return result[0] || null;
    return result;
  } catch (error) {
    return null;
  }
};

// Check if date is public holiday
const isPublicHoliday = (dateString) => {
  if (!dateString) return false;
  try {
    return !!getHolidayInfo(dateString);
  } catch (error) {
    return false;
  }
};

// Get holiday name from date-holidays library
const getHolidayName = (dateString) => {
  try {
    return getHolidayInfo(dateString)?.name || "Hari Libur";
  } catch (error) {
    return "Hari Libur";
  }
};

const getWeekendDaysInRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  
  const holidays = [];
  const current = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  
  while (current <= end) {
    const dateKey = formatLocalDateKey(current);
    const dayOfWeek = current.getDay();
    let type = null;
    let name = null;
    
    // Check if weekend
    if (dayOfWeek === 0) {
      type = 'weekend';
      name = 'Minggu';
    } else if (dayOfWeek === 6) {
      type = 'weekend';
      name = 'Sabtu';
    }
    
    // Check if public holiday
    if (isPublicHoliday(dateKey)) {
      type = 'holiday';
      name = getHolidayName(dateKey);
    }
    
    if (type) {
      holidays.push({
        date: dateKey,
        type: type,
        dayName: name,
        displayDate: current.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      });
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return holidays;
};

const getLeaveTypeLabel = (key, leaveTypeOptions) => {
  if (leaveTypeOptions?.labelMap?.[key]) {
    return leaveTypeOptions.labelMap[key];
  }
  return LEAVE_TYPE_LABEL[key] || key;
};

const getLeaveTypesByMode = (mode, leaveTypeOptions) => {
  if (leaveTypeOptions?.modeGroups?.[mode]) {
    return leaveTypeOptions.modeGroups[mode];
  }
  return LEAVE_MODE_TYPES[mode] || [];
};

function EmployeeLeave() {
  const dispatch = useDispatch();
  const [form, setForm] = useState(INITIAL_FORM);
  const [leaveMode, setLeaveMode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [submittedDateFilter, setSubmittedDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [profile, setProfile] = useState({});
  const [todayAttendance, setTodayAttendance] = useState({});
  const [selectedProof, setSelectedProof] = useState(null);
  const [leavePolicy, setLeavePolicy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [leaveTypeOptions, setLeaveTypeOptions] = useState({});

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

  // Fetch leave types from database
  useEffect(() => {
    let mounted = true;
    const fetchLeaveTypes = async () => {
      try {
        const res = await pegawaiApi.getLeaveTypes?.();
        if (!res) return;
        
        const data = res.data || res;
        if (mounted && Array.isArray(data)) {
          // Build label map from database
          const labelMap = {};
          const modeGroups = { izin: [], cuti: [] };
          
          data.forEach((item) => {
            labelMap[item.key] = item.label || item.name;
            const mode = item.mode || 'cuti';
            if (modeGroups[mode]) {
              modeGroups[mode].push(item.key);
            }
          });
          
          setLeaveTypeOptions({ labelMap, modeGroups });
        }
      } catch (e) {
        // Fall back to hardcoded if API fails
        console.warn('Failed to fetch leave types from database:', e);
      }
    };

    fetchLeaveTypes();
    return () => {
      mounted = false;
    };
  }, []);

  const getEffectiveMaxDays = (leaveType, cutiKhususOptionKey) => {
    if (leaveType === "cuti_tahunan") {
      return Number(remainingLeaveQuota || 0);
    }

    if (leavePolicy && leavePolicy.leave_type === leaveType) {
      if (leaveType === "cuti_khusus") {
        const opts = (leavePolicy.meta && leavePolicy.meta.options) || [];
        const opt = opts.find((o) => o.key === cutiKhususOptionKey);
        if (opt && Number(opt.days)) return Number(opt.days);
      }
      if (Number(leavePolicy.max_days || 0) > 0)
        return Number(leavePolicy.max_days);
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

    if (
      allowedEndDate &&
      nextForm.end_date &&
      nextForm.end_date > allowedEndDate
    ) {
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
    async (overrideStatus, overrideType, overrideDate) => {
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

          const selStatus =
            overrideStatus !== undefined ? overrideStatus : statusFilter;
          const selType = overrideType !== undefined ? overrideType : typeFilter;
          const selDate =
            overrideDate !== undefined ? overrideDate : submittedDateFilter;

          let filtered = allData;
          if (selStatus) filtered = filtered.filter((i) => i.status === selStatus);
          if (selType) filtered = filtered.filter((i) => i.leave_type === selType);
          if (selDate)
            filtered = filtered.filter((i) => {
              const created = i.created_at || "";
              return (
                created.startsWith(selDate) ||
                (created.split && created.split("T")[0] === selDate)
              );
            });

          setRequests(filtered);
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
    [statusFilter, typeFilter, submittedDateFilter],
  );

  const resetFilters = async () => {
    setStatusFilter("");
    setTypeFilter("");
    setSubmittedDateFilter("");
    setCurrentPage(1);
    await loadData("", "", "");
  };

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
        nextForm.cuti_khusus_option =
          value === "cuti_khusus" ? prev.cuti_khusus_option : "";
        nextForm.time = value === "izin_terlambat" ? prev.time : "";
      }

      return normalizeLeaveDates(nextForm);
    });
  };

  const selectLeaveMode = (mode) => {
    setLeaveMode(mode);
    const defaultType = getLeaveTypesByMode(mode, leaveTypeOptions)?.[0] || "";
    setForm((prev) => ({
      ...prev,
      leave_type: defaultType,
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

    if (form.start_date < todayDateKey || effectiveEndDate < todayDateKey) {
      setError(
        "Tanggal pengajuan tidak boleh lebih kecil dari hari ini. Pilih tanggal hari ini atau setelahnya.",
      );
      return;
    }

    // Cek hari libur dalam rentang tanggal
    const weekendDays = getWeekendDaysInRange(form.start_date, effectiveEndDate);
    if (weekendDays.length > 0) {
      const weekendList = weekendDays
        .map(w => `${w.dayName} (${w.displayDate})`)
        .join(', ');
      setError(
        `Pengajuan cuti/izin tidak dapat dilakukan pada hari libur. Rentang tanggal Anda mencakup: ${weekendList}. Silakan pilih tanggal lain yang hanya hari kerja.`
      );
      return;
    }

    const submittedForm = normalizeLeaveDates({
      ...form,
      end_date: effectiveEndDate,
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
      setError(
        "Jenis ini mensyaratkan bukti pendukung (surat dokter/dokumen).",
      );
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
      setError(
        `Izin Sakit hanya bisa diajukan maksimal ${izinSakitMaxDays} hari sesuai aturan database.`,
      );
      return;
    }

    if (form.leave_type === "cuti_khusus" && !form.cuti_khusus_option) {
      setError("Pilih alasan untuk Cuti Penting (Cuti Khusus).");
      return;
    }

    if (form.leave_type === "izin_terlambat") {
      const dayOfWeek = new Date(`${form.start_date}T00:00:00`).getDay();
      const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = isPublicHoliday(form.start_date);
      
      if (isWeekendDay || isHoliday) {
        const dayName = isHoliday ? getHolidayName(form.start_date) : (dayOfWeek === 0 ? 'Minggu' : 'Sabtu');
        setError(`Pengajuan izin terlambat tidak dapat dilakukan pada hari libur (${dayName}).`);
        return;
      }
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
      const monthlyLimit =
        (policy && policy.meta && policy.meta.monthly_limit) || 2;
      if (requestedDaysForSubmit > Number(monthlyLimit)) {
        setError(
          `Izin Keperluan Pribadi dibatasi maksimal ${monthlyLimit} hari per pengajuan.`,
        );
        return;
      }
    }

    if (form.leave_type === "cuti_tahunan") {
      if (Number(remainingLeaveQuota || 0) <= 0) {
        setError("Sisa kuota cuti tahunan sudah habis.");
        return;
      }

      if (requestedDaysForSubmit > Number(remainingLeaveQuota || 0)) {
        setError(
          `Cuti Tahunan maksimal ${remainingLeaveQuota} hari sesuai sisa kuota yang tersedia.`,
        );
        return;
      }
    }

    const maxDaysForLeave = getEffectiveMaxDays(
      form.leave_type,
      form.cuti_khusus_option,
    );

    if (maxDaysForLeave > 0 && requestedDaysForSubmit > maxDaysForLeave) {
      setError(
        `${getLeaveTypeLabel(form.leave_type, leaveTypeOptions) || form.leave_type} maksimal ${maxDaysForLeave} hari per pengajuan.`,
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
        leave_type: getLeaveTypesByMode(leaveMode, leaveTypeOptions)?.[0] || "",
      });
      setSuccessMessage("Pengajuan cuti/izin berhasil dikirim");
      setShowSuccessModal(true);
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

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = requests.slice(startIndex, endIndex);

  const handleChangePage = (page) => {
    setCurrentPage(page);
  };

  const openProofModal = (proofPath, leaveType) => {
    if (!proofPath) return;
    setSelectedProof({
      path: proofPath,
      type: getFileTypeFromPath(proofPath),
      leaveType: getLeaveTypeLabel(leaveType, leaveTypeOptions) || leaveType,
    });
  };

  const closeProofModal = () => {
    setSelectedProof(null);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
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

  useEffect(() => {
    setCurrentPage(1);
  }, [requests]);

  return (
    <>
      {error ? (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
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
                  {getLeaveTypeLabel(activeLeaveToday.leave_type, leaveTypeOptions) ||
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

        {!leaveMode && (
          <div className="mb-5 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-all duration-300">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-base-content">
                Jenis Pengajuan
              </h3>

              <div className="mt-3 rounded-xl bg-base-200 px-4 py-3 text-sm text-base-content/80">
                Silakan pilih <b>Izin</b> atau <b>Cuti</b> untuk membuka form
                pengajuan.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => selectLeaveMode("izin")}
                className={`
    btn btn-primary w-full rounded-2xl
    py-3 text-sm font-semibold
    transition-all duration-200
    ${leaveMode === "izin" ? "shadow-lg scale-[1.02]" : ""}
  `}
              >
                {LEAVE_MODE_LABEL.izin}
              </button>
              <button
                type="button"
                onClick={() => selectLeaveMode("cuti")}
                className={`
    btn btn-secondary w-full rounded-2xl py-3 text-sm font-semibold
    transition-all duration-200
    ${leaveMode === "cuti" ? "shadow-lg scale-[1.02]" : ""}
  `}
              >
                {LEAVE_MODE_LABEL.cuti}
              </button>
            </div>
          </div>
        )}

        {leaveMode && (
          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2 animate-fadeIn"
            onSubmit={submitForm}
          >
            <div className="text-sm">
              <label className="block text-xs opacity-70 mb-1">
                Jenis pengajuan
              </label>
              <select
                className="select select-bordered w-full"
                value={form.leave_type}
                onChange={(e) => updateForm("leave_type", e.target.value)}
              >
                {getLeaveTypesByMode(leaveMode, leaveTypeOptions).map((leaveType) => (
                  <option key={leaveType} value={leaveType}>
                    {getLeaveTypeLabel(leaveType, leaveTypeOptions)}
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
                  <label className="block text-xs opacity-70 mb-1">
                    Alasan cuti khusus
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={form.cuti_khusus_option}
                    onChange={(e) =>
                      updateForm("cuti_khusus_option", e.target.value)
                    }
                  >
                    <option value="">Pilih alasan cuti khusus</option>
                    {(
                      (leavePolicy &&
                        leavePolicy.meta &&
                        leavePolicy.meta.options) ||
                      []
                    ).map((opt) => (
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
                  <label className="block text-xs opacity-70 mb-1">
                    Tanggal izin
                  </label>
                  <input
                    className="input input-bordered border-base-300 bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
                    type="date"
                    min={todayDateKey}
                    value={form.start_date}
                    onChange={(e) => updateForm("start_date", e.target.value)}
                  />
                  {form.start_date && (
                    <div className="text-xs mt-2">
                      {(() => {
                        const dayOfWeek = new Date(`${form.start_date}T00:00:00`).getDay();
                        const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
                        const isHoliday = isPublicHoliday(form.start_date);
                        
                        if (isWeekendDay) {
                          const dayName = dayOfWeek === 0 ? 'Minggu' : 'Sabtu';
                          return (
                            <span className="text-warning font-semibold">
                              ⚠️ {dayName} adalah hari libur. Pengajuan tidak dapat diproses.
                            </span>
                          );
                        }
                        
                        if (isHoliday) {
                          return (
                            <span className="text-warning font-semibold">
                              ⚠️ {getHolidayName(form.start_date)} (Hari Libur Nasional). Pengajuan tidak dapat diproses.
                            </span>
                          );
                        }
                        
                        return (
                          <span className="text-success">
                            ✓ Hari kerja - dapat diajukan
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  <label className="block text-xs opacity-70 mb-1">
                    Jam masuk / pulang cepat
                  </label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={form.time}
                    onChange={(e) => updateForm("time", e.target.value)}
                  />
                </div>
                <div className="text-sm">
                  <label className="block text-xs opacity-70 mb-1">
                    Tipe izin
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={form.cuti_khusus_option || ""}
                    onChange={(e) =>
                      updateForm("cuti_khusus_option", e.target.value)
                    }
                  >
                    <option value="">Pilih tipe izin</option>
                    <option value="terlambat">
                      Terlambat (masuk terlambat)
                    </option>
                    <option value="pulang_cepat">Pulang Cepat</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <input
                  className="input input-bordered border-base-300 bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="date"
                  min={todayDateKey}
                  value={form.start_date}
                  onChange={(e) => updateForm("start_date", e.target.value)}
                />
                <input
                  className="input input-bordered border-base-300 bg-base-100 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="date"
                  min={form.start_date || todayDateKey}
                  value={form.end_date}
                  max={maxEndDate || undefined}
                  onChange={(e) => updateForm("end_date", e.target.value)}
                />
              </>
            )}
            {form.leave_type !== "izin_terlambat" && form.start_date && form.end_date && (
              <div className="md:col-span-2 p-2 rounded bg-base-200 border border-base-300 text-xs">
                {(() => {
                  const weekendDays = getWeekendDaysInRange(form.start_date, form.end_date);
                  if (weekendDays.length > 0) {
                    const weekends = weekendDays.filter(d => d.type === 'weekend');
                    const holidays = weekendDays.filter(d => d.type === 'holiday');
                    
                    return (
                      <div className="space-y-1">
                        <p className="font-semibold text-warning">⚠️ Hari libur dalam rentang:</p>
                        {holidays.length > 0 && (
                          <div>
                            <p className="font-semibold text-warning ml-2">📍 Hari Libur Nasional:</p>
                            {holidays.map((day, idx) => (
                              <p key={idx} className="text-warning ml-4">
                                • {day.dayName}: {day.displayDate}
                              </p>
                            ))}
                          </div>
                        )}
                        {weekends.length > 0 && (
                          <div>
                            <p className="font-semibold text-warning ml-2">📅 Akhir Pekan:</p>
                            {weekends.map((day, idx) => (
                              <p key={idx} className="text-warning ml-4">
                                • {day.dayName}: {day.displayDate}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <p className="text-success font-semibold">
                      ✓ Semua hari dalam rentang adalah hari kerja
                    </p>
                  );
                })()}
              </div>
            )}
            <div className="md:col-span-2 text-xs opacity-70">
              {form.leave_type === "izin_terlambat"
                ? "Izin terlambat/pulang cepat hanya untuk 1 tanggal pengajuan pada hari kerja."
                : form.leave_type === "cuti_tahunan"
                  ? remainingLeaveQuota > 0
                    ? `Cuti Tahunan dapat diajukan dalam rentang berapa pun selama tidak melebihi sisa kuota ${remainingLeaveQuota} hari.`
                    : "Sisa kuota cuti tahunan sudah habis."
                : maxDaysForCurrentLeave > 0
                  ? `Rentang tanggal otomatis dibatasi maksimal ${maxDaysForCurrentLeave} hari sesuai peraturan izin dan cuti.`
                  : "Rentang tanggal mengikuti aturan izin dan cuti yang aktif. Pengajuan tidak berlaku pada hari libur nasional atau akhir pekan."}
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
                      requestedDays >
                        Number(policy.require_bukti_if_days_gt || 0)
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

                if (requiresBuktiNow)
                  return "Bukti (surat dokter/dokumen) wajib untuk jenis ini.";
                if (form.leave_type === "izin_lainnya")
                  return "Jenis ini no paid.";
                if (form.leave_type === "cuti_lainnya")
                  return "Jenis ini no paid.";
                if (form.leave_type === "izin_pribadi") {
                  const monthlyLimit =
                    (policy && policy.meta && policy.meta.monthly_limit) || 2;
                  return `Izin Keperluan Pribadi: maksimal ${monthlyLimit} hari per bulan; tidak dibayar.`;
                }
                if (form.leave_type === "cuti_sakit")
                  return "Skema pembayaran untuk cuti sakit: 4 bulan 100%, 4 bulan 75%, 4 bulan 50%, selanjutnya 25%.";
                if (maxDaysForCurrentLeave > 0)
                  return `Maksimal ${maxDaysForCurrentLeave} hari untuk jenis ini.`;
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
        )}
      </TitleCard>

      {showSuccessModal && successMessage ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-2">Berhasil</h3>
            <p className="text-sm opacity-80">{successMessage}</p>

            <div className="modal-action">
              <button className="btn btn-primary" onClick={closeSuccessModal}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <TitleCard title="Riwayat Pengajuan Cuti / Izin" topMargin="mt-6">
        <div className="flex justify-right mb-4 items-center gap-2">
          <input
            type="date"
            className="input input-bordered input-sm max-w-xs"
            value={submittedDateFilter}
            onChange={async (e) => {
              const nextDate = e.target.value;
              setSubmittedDateFilter(nextDate);
              setCurrentPage(1);
              await loadData(undefined, undefined, nextDate);
            }}
          />

          <select
            className="select select-bordered select-sm w-full max-w-xs"
            value={typeFilter}
            onChange={async (e) => {
              const nextType = e.target.value;
              setTypeFilter(nextType);
              setCurrentPage(1);
              await loadData(undefined, nextType);
            }}
          >
            <option value="">Semua Jenis</option>
            {(Object.keys((leaveTypeOptions && leaveTypeOptions.labelMap) || LEAVE_TYPE_LABEL)).map((t) => (
              <option key={t} value={t}>
                {getLeaveTypeLabel(t, leaveTypeOptions)}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered select-sm w-full max-w-xs"
            value={statusFilter}
            onChange={async (e) => {
              const nextStatus = e.target.value;
              setStatusFilter(nextStatus);
              setCurrentPage(1);
              await loadData(nextStatus);
            }}
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button type="button" className="btn btn-secondary btn-sm rounded-full" onClick={resetFilters}>
            Reset
          </button>
        </div>

        {loading ? (
          <div>Memuat data pengajuan...</div>
        ) : (
          <>
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
                    paginatedRequests.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        {formatDate(item.start_date)} -{" "}
                        {formatDate(item.end_date)}
                      </td>
                      <td>
                        {getLeaveTypeLabel(item.leave_type, leaveTypeOptions) || item.leave_type}
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
                            className="
        px-3 py-1 text-xs
        bg-gradient-to-b from-blue-400 to-blue-600
        text-white rounded-full
        shadow-md hover:shadow-lg
        border border-blue-600
        hover:from-blue-500 hover:to-blue-700
        transition-all duration-200
      "
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
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChangePage={handleChangePage}
              itemsPerPage={itemsPerPage}
            />
          </>
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
