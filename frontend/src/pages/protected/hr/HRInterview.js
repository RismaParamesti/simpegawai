// Pastikan status/hiring_status di-fetch untuk semua job di history
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HRModalInterview from "./HRInterviewModal";
import HRInterviewDetailLowongan from "./HRInterviewNilai";
import HiredCandidateWarning from "../../../components/HiredCandidateWarning";
import axios from "axios";
import { useRef } from "react";
import { NotificationManager } from "react-notifications";
import {
  CalendarDays,
  CheckCircle2,
  History,
  Mic,
  Users,
  XCircle,
} from "lucide-react";
import {
  buildHiredCandidateLookup,
  findHiredCandidateInfo,
  isPendingInterviewWarningCandidate,
  isUnscheduledInterviewWarningCandidate,
} from "../../../utils/hiredCandidateStatus";

const normalizeInterviewRows = (rows = []) =>
  (rows || []).map((i) => ({
    ...i,
    status: i.status ?? i.interview_status ?? "scheduled",
    job_title: i.job_title || i.position_name || i.base_position || "Lainnya",
    id: i.id || i.interview_id,
    candidate_name: i.candidate_name || i.name || "-",
    scheduled_date: i.scheduled_date || i.date,
    interview_type: i.interview_type || i.type || "-",
    interviewer_name:
      i.interviewer_name || i.interviewer || i.full_name || "-",
  }));

export default function HRInterview() {
  const [activeMenu, setActiveMenu] = useState("schedule");
  const [canceledMap, setCanceledMap] = useState({});
  const mergeHistoryRows = useCallback((currentRows, incomingRows) => {
    const map = new Map();
    [...(currentRows || []), ...(incomingRows || [])].forEach((row) => {
      if (!row) return;
      const key = row.id || row.interview_id || `${row.application_id || ""}-${row.scheduled_date || row.date || ""}`;
      if (!key) return;
      map.set(String(key), row);
    });
    return Array.from(map.values());
  }, []);
  // Listener untuk refresh data interview dari modal detail
  useEffect(() => {
    const handler = () => {
      if (activeMenu === "history") {
        // Ambil data dari endpoint baru gabungan
        axios
          .get("/api/hr/interviews/history-combined")
          .then((res) => {
            const historyRows = normalizeInterviewRows(res.data.history || []);
            setHistoryRows(historyRows);
            setData((prev) => mergeHistoryRows(prev, historyRows));
          })
          .catch(() => {
            // Jangan reset data lokal saat fetch history gagal
          });
      } else {
        axios
          .get("/api/hr/interviews")
          .then((res) => {
            console.log("[DEBUG] DATA INTERVIEWS", res.data.interviews);
            // Jika data kosong, tampilkan pesan
            if (!res.data.interviews || res.data.interviews.length === 0) {
              console.warn(
                "[DEBUG] Tidak ada data interview yang diterima dari API",
              );
            }
            // Pastikan status interview sesuai
            const rows = normalizeInterviewRows(res.data.interviews || []);
            setInterviewRows(rows);
            setData((prev) => mergeHistoryRows(prev, rows));
          })
          .catch(() => setInterviewRows([]));
      }
    };
    window.addEventListener("refreshInterviewData", handler);
    return () => window.removeEventListener("refreshInterviewData", handler);
  }, [activeMenu, mergeHistoryRows]);

  const [data, setData] = useState([]); // interview data
  const [interviewRows, setInterviewRows] = useState([]);
  const [historyRows, setHistoryRows] = useState([]);
  const [candidates, setCandidates] = useState([]); // kandidat lolos dokumen
  const [hiredCandidates, setHiredCandidates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState({});
  const [mode, setMode] = useState("create");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelNotes, setCancelNotes] = useState("");
  const [isCancelLowonganModalOpen, setIsCancelLowonganModalOpen] =
    useState(false);
  const [pendingCancelLowongan, setPendingCancelLowongan] = useState(null);
  const hiredCandidateLookup = React.useMemo(
    () => buildHiredCandidateLookup(hiredCandidates),
    [hiredCandidates],
  );
  const hiredCandidateWarnings = React.useMemo(() => {
    const sourceRows =
      activeMenu === "schedule"
        ? candidates
        : activeMenu === "list"
          ? interviewRows
          : historyRows;

    const warningFilter =
      activeMenu === "schedule"
        ? isUnscheduledInterviewWarningCandidate
        : activeMenu === "list"
          ? isPendingInterviewWarningCandidate
          : () => false;

    return (sourceRows || [])
      .filter(warningFilter)
      .map((item) => {
        const hiredInfo = findHiredCandidateInfo(hiredCandidateLookup, item);
        if (!hiredInfo) return null;

        return {
          ...hiredInfo,
          candidateName:
            item.candidate_name ||
            item.name ||
            hiredInfo.candidate_name ||
            hiredInfo.name,
        };
      })
      .filter(Boolean);
  }, [activeMenu, candidates, hiredCandidateLookup, historyRows, interviewRows]);

  const markInterviewCandidateNotPassed = async (candidate, hiredInfo) => {
    if (!candidate || !hiredInfo) return;

    const notes = `Tidak lolos karena kandidat sudah lolos pada lowongan ${
      hiredInfo.hiredJobLabel || "-"
    }.`;
    const interviewId = candidate.id || candidate.interview_id;
    const applicationId = candidate.application_id || candidate.id;

    try {
      if (candidate.scheduled_date || candidate.date || candidate.interview_id) {
        if (!interviewId) {
          NotificationManager.error("ID interview tidak ditemukan.", "Gagal", 3000);
          return;
        }

        await axios.put(`/api/admin/interviews/${interviewId}/result`, {
          interviewer_notes: notes,
          status: "disqualified",
          result: "disqualified",
        });

        const disqualifiedItem = {
          ...candidate,
          status: "disqualified",
          result: "disqualified",
          interviewer_notes: notes,
        };

        setInterviewRows((prev) =>
          prev.filter(
            (item) =>
              String(item.id || item.interview_id) !== String(interviewId),
          ),
        );
        setHistoryRows((prev) => mergeHistoryRows(prev, [disqualifiedItem]));
        setData((prev) => {
          const filtered = prev.filter(
            (item) => String(item.id || item.interview_id) !== String(interviewId),
          );
          return [disqualifiedItem, ...filtered];
        });
        setActiveMenu("history");
      } else {
        if (!applicationId) {
          NotificationManager.error("ID pelamar tidak ditemukan.", "Gagal", 3000);
          return;
        }

        await axios.put(`/api/candidates/admin/applications/${applicationId}/status`, {
          status: "ditolak",
          admin_notes: notes,
        });

        setCandidates((prev) =>
          prev.filter(
            (item) =>
              String(item.application_id || item.id) !== String(applicationId),
          ),
        );
      }

      NotificationManager.success(
        "Kandidat dijadikan tidak lolos karena sudah lolos di lowongan lain.",
        "Berhasil",
        3000,
      );
    } catch (err) {
      NotificationManager.error(
        err?.response?.data?.message || "Gagal menjadikan kandidat tidak lolos.",
        "Gagal",
        4000,
      );
    }
  };

  useEffect(() => {
    axios
      .get("/api/hr/interviews")
      .then((res) => {
        const rows = normalizeInterviewRows(res.data.interviews || []);
        setInterviewRows(rows);
        setData((prev) => mergeHistoryRows(prev, rows));
      })
      .catch(() => setInterviewRows([]));

    axios
      .get("/api/hr/interviews/history-combined")
      .then((res) => {
        const rows = normalizeInterviewRows(res.data.history || []);
        setHistoryRows(rows);
        setData((prev) => mergeHistoryRows(prev, rows));
      })
      .catch(() => setHistoryRows([]));

    axios
      .get("/api/interviews?status=passed")
      .then((res) => setHiredCandidates(Array.isArray(res.data) ? res.data : []))
      .catch(() => setHiredCandidates([]));
  }, [mergeHistoryRows]);

  useEffect(() => {
    if (activeMenu === "schedule") {
      axios
        .get("/api/hr/applications?status=lolos_dokumen")
        .then(async (res) => {
          const apps = (res.data && res.data.applications) || [];
          let tempCanceledMap = {};

          try {
            const resp = await axios.get(
              "/api/hr/interviews/canceled-applications",
            );

            if (resp.data && Array.isArray(resp.data.applications)) {
              resp.data.applications.forEach((row) => {
                tempCanceledMap[row.application_id] = true;
              });
            }
          } catch (e) {
            console.error("[ERROR CANCELED]:", e);
          }

          setCanceledMap(tempCanceledMap);
          setCandidates(apps);
        })
        .catch(() => setCandidates([]));
    } else if (activeMenu === "list") {
      axios
        .get("/api/hr/interviews")
        .then((res) => {
          console.log("[DEBUG] DATA INTERVIEWS", res.data.interviews);
          if (!res.data.interviews || res.data.interviews.length === 0) {
            console.warn(
              
            );
          }
                const rows = normalizeInterviewRows(res.data.interviews || []);
                setInterviewRows(rows);
                setData((prev) => mergeHistoryRows(prev, rows));
        })
        .catch((err) => {
          console.error("[DEBUG] Error ambil data interviews:", err);
          setInterviewRows([]);
        });
    } else if (activeMenu === "history") {
      axios
        .get("/api/hr/interviews/history-combined")
        .then((res) => {
          const historyRows = normalizeInterviewRows(res.data.history || []);
          setHistoryRows(historyRows);
          setData((prev) => mergeHistoryRows(prev, historyRows));
        })
        .catch(() => {
          // Jangan reset data lokal saat fetch history gagal
        });
    }
  }, [activeMenu, mergeHistoryRows]);

  const [form, setForm] = useState({
    datetime: "",
    type: "Online",
    stage: "HR",
    interviewer: "",
    location: "",
    searchName: "",
  });
  const [unscheduledFilter, setUnscheduledFilter] = useState(null); // 'jobs' | 'candidates' | null
  const [timelineFilter, setTimelineFilter] = useState(null); // 'today' | 'tomorrow' | 'overdue' | null

  const unscheduledCandidates = React.useMemo(() => {
    const list = (candidates || []).filter((c) => {
      const hasInterview = (data || []).some(
        (d) =>
          d.application_id && String(d.application_id) === String(c.id) &&
          ["scheduled", "rescheduled"].includes(d.status),
      );
      return !hasInterview;
    });
    return list;
  }, [candidates, data]);

  const unscheduledCandidateIds = React.useMemo(() => new Set((unscheduledCandidates || []).map((c) => String(c.id))), [unscheduledCandidates]);

  const unscheduledJobTitles = React.useMemo(() => new Set((unscheduledCandidates || []).map((c) => c.job_title || "Lainnya")), [unscheduledCandidates]);

  const groupedCandidates = React.useMemo(() => {
    const nameFilter = (form.searchName || "").toString().trim().toLowerCase();
    const base = (candidates || []).filter((c) => {
      if (form.positionFilter && (c.job_title || "Lainnya") !== form.positionFilter) return false;
      if (nameFilter) {
        const nm = ((c.name || c.candidate_name) || "").toString().toLowerCase();
        if (!nm.includes(nameFilter)) return false;
      }
      return true;
    });

    let list = base;
    if (unscheduledFilter === "candidates") {
      list = base.filter((c) => unscheduledCandidateIds.has(String(c.id)));
    }
    if (unscheduledFilter === "jobs") {
      list = base.filter((c) => unscheduledJobTitles.has(c.job_title || "Lainnya"));
    }

    return list.reduce((acc, curr) => {
      const job = curr.job_title || "Lainnya";
      if (!acc[job]) acc[job] = [];
      acc[job].push(curr);
      return acc;
    }, {});
  }, [candidates, form.positionFilter, unscheduledFilter, unscheduledCandidateIds, unscheduledJobTitles, form.searchName]);

  const groupedData = data
    .filter((d) => ["scheduled", "rescheduled"].includes(d.status))
    .reduce((acc, curr) => {
      if (!acc[curr.job_title]) {
        acc[curr.job_title] = [];
      }
      acc[curr.job_title].push(curr);
      return acc;
    }, {});

  const scheduleItems = React.useMemo(
    () => (data || []).filter((d) => ["scheduled", "rescheduled"].includes(d.status)),
    [data],
  );
  const getDayKey = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const getTimelineType = React.useCallback((item) => {
    const scheduledAt = new Date(item?.scheduled_date || item?.date || 0);
    if (Number.isNaN(scheduledAt.getTime())) return "";
    const now = new Date();
    const todayKey = getDayKey(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowKey = getDayKey(tomorrow);
    const itemKey = getDayKey(scheduledAt);

    if (itemKey === todayKey) return "today";
    if (itemKey === tomorrowKey) return "tomorrow";
    if (scheduledAt < now) return "overdue";
    return "future";
  }, []);

  const scheduleTimelineMetrics = React.useMemo(() => {
    const todayItems = scheduleItems.filter((item) => getTimelineType(item) === "today");
    const tomorrowItems = scheduleItems.filter((item) => getTimelineType(item) === "tomorrow");
    const overdueItems = scheduleItems.filter((item) => getTimelineType(item) === "overdue");

    return {
      todayItems,
      tomorrowItems,
      overdueItems,
    };
  }, [scheduleItems, getTimelineType]);

  const visibleListGroups = React.useMemo(() => {
    const nameFilter = (form.searchName || "").toString().trim().toLowerCase();
    const filteredByPosition = Object.fromEntries(
      Object.entries(groupedData).filter(
        ([job]) => !form.positionFilterList || job === form.positionFilterList,
      ),
    );

    const filteredByTimeline = Object.fromEntries(
      Object.entries(filteredByPosition)
        .map(([job, list]) => [
          job,
          timelineFilter
            ? (list || []).filter((item) => getTimelineType(item) === timelineFilter)
            : list,
        ])
        .map(([job, list]) => {
          if (nameFilter) {
            const filteredList = (list || []).filter((item) => {
              const nm = ((item.candidate_name || item.name) || "").toString().toLowerCase();
              return nm.includes(nameFilter);
            });
            return [job, filteredList];
          }
          return [job, list];
        })
        .filter(([, list]) => Array.isArray(list) && list.length > 0),
    );

    return filteredByTimeline;
  }, [form.positionFilterList, groupedData, timelineFilter, getTimelineType, form.searchName]);

  const openTimelineFilter = (filter) => {
    setTimelineFilter(filter);
    setUnscheduledFilter(null);
    setForm((prev) => ({
      ...prev,
      positionFilterList: "",
    }));
    setActiveMenu("list");
    setShowAll({});
    window.setTimeout(() => {
      const el = document.getElementById("list-groups");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 80);
  };

  const handleSchedule = (candidate) => {
    // Cek apakah kandidat sudah punya jadwal interview (scheduled/rescheduled)
    const alreadyScheduled = data.some(
      (d) =>
        d.application_id === candidate.id &&
        ["scheduled", "rescheduled"].includes(d.status),
    );
    if (alreadyScheduled) {
      NotificationManager.warning(
        "Kandidat ini sudah memiliki jadwal wawancara. Silakan atur ulang jadwal terlebih dahulu pada menu Jadwal Wawancara.",
        "Validasi",
        3500,
      );
      return;
    }

    if (form.scheduled_date && form.interviewer_id) {
      const newStart = new Date(form.scheduled_date);
      const newEnd = new Date(
        newStart.getTime() +
          (parseInt(form.duration_minutes || 0) || 0) * 60000,
      );
      const conflict = data.some((d) => {
        if (
          d.interviewer_id === form.interviewer_id &&
          ["scheduled", "rescheduled"].includes(d.status)
        ) {
          const existStart = new Date(d.scheduled_date);
          const existEnd = new Date(
            existStart.getTime() +
              (parseInt(d.duration_minutes || 0) || 0) * 60000,
          );
          // Cek overlap
          return newStart < existEnd && existStart < newEnd;
        }
        return false;
      });
      if (conflict) {
        NotificationManager.warning(
          "Interviewer sudah memiliki jadwal wawancara yang bentrok di waktu tersebut. Silakan pilih waktu lain.",
          "Validasi",
          3500,
        );
        return;
      }
    }

    // Cek apakah kandidat punya interview status canceled/cancelled
    const canceledInterview = data.find(
      (d) =>
        d.application_id === candidate.id &&
        ["canceled", "cancelled"].includes(d.status),
    );

    if (canceledInterview) {
      setMode("update");
      setSelectedCandidate(canceledInterview);
      setForm({
        scheduled_date: canceledInterview.scheduled_date || "",
        interview_stage: canceledInterview.stage || "HR",
        interview_type: canceledInterview.interview_type || "Online",
        duration_minutes: canceledInterview.duration_minutes || 60,
        interviewer_id: canceledInterview.interviewer_id || "",
        meeting_link: canceledInterview.meeting_link || "",
        location: canceledInterview.location || "",
      });
    } else {
      setMode("create");
      setSelectedCandidate(candidate);
      setForm((prev) => ({
        ...prev,
        scheduled_date: "",
        interview_stage: "HR",
        interview_type: "Online",
        duration_minutes: 60,
        interviewer_id: "",
        meeting_link: "",
        location: "",
      }));
    }
    setIsModalOpen(true);
    setTimeout(() => {
      console.log("isModalOpen:", isModalOpen, "selectedCandidate:", candidate);
    }, 100);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const bulan = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const hari = d.getDate();
    const namaBulan = bulan[d.getMonth()];
    const tahun = d.getFullYear();
    const jam = d.getHours().toString().padStart(2, "0");
    const menit = d.getMinutes().toString().padStart(2, "0");
    return `${hari} ${namaBulan} ${tahun}, pukul ${jam}:${menit}`;
  };

  // Format header: "jobName - posisi base_position"
  const formatJobAndPosFromFirst = (first, jobName) => {
    const f = first || {};
    const pickText = (...values) =>
      values.find((value) => typeof value === "string" && value.trim()) || "";
    const name =
      pickText(jobName, f.job_title, f.job_opening_title, f.title) ||
      "Lainnya";
    const jobOpeningId =
      f.job_opening?.id ||
      f.job_opening_id ||
      f.position_id ||
      f.id ||
      f.job_id ||
      f.job?.id ||
      f.position?.job_opening_id ||
      null;
    const jobStatus = jobOpeningId ? jobStatusMap[jobOpeningId] : null;
    const position = pickText(
      f.position_name,
      f.position?.name,
      f.position_title,
      f.job_opening?.position_name,
      f.job_opening?.position?.name,
      f.job?.position?.name,
      jobStatus?.position_name,
      jobStatus?.job_title,
      f.role,
    );
    const basePosition = pickText(
      f.base_position,
      f.basePosition,
      f.base_position_name,
      jobStatus?.base_position,
      f.job_opening?.base_position,
      f.job?.base_position,
      f.position?.base_position,
    );
    const jobLabel = [position, basePosition].filter(Boolean).join(" ").trim();
    if (name && jobLabel) return `${name} - ${jobLabel}`;
    return name || jobLabel || "Lainnya";
  };

  const handleCancelLowongan = async (items, jobName, onSuccess) => {
    const first = items?.[0];
    const jobId = first?.job_opening_id || first?.position_id || first?.id;

    if (!first || !jobId) {
      NotificationManager.error(
        "Data lowongan tidak ditemukan atau ID tidak valid!",
        "Gagal",
        3500,
      );
      return;
    }

    try {
      const url1 = `/api/candidates/admin/applications/cancel-by-job`;
      const url2 = `/api/job-openings/${jobId}/cancel`;
      const res1 = await axios.put(url1, { job_opening_id: jobId });
      const res2 = await axios.put(url2);

      if (res1.data && res2.data) {
        NotificationManager.success(
          `Lowongan berhasil dibatalkan. Semua kandidat dan interview telah diberi status dibatalkan oleh perusahaan.`,
          "Berhasil",
          3500,
        );
        onSuccess?.(jobName);
        // Refresh interview lists across the app so canceled interviews show in history
        try {
          if (typeof window !== "undefined" && window.dispatchEvent) {
            window.dispatchEvent(new Event("refreshInterviewData"));
          }
        } catch (e) {
          // ignore
        }
        // Switch UI to history tab so user sees the canceled interviews
        try {
          setActiveMenu("history");
        } catch (e) {
          // ignore if out of scope
        }
      } else {
        NotificationManager.error(
          "Gagal membatalkan lowongan. Respon tidak valid dari server.",
          "Gagal",
          3500,
        );
      }
    } catch (err) {
      let msg = "Gagal membatalkan lowongan\n";
      msg += `URL1: /api/candidates/admin/applications/cancel-by-job\n`;
      msg += `URL2: /api/job-openings/${jobId}/cancel\n`;
      msg += `Method: PUT\n`;
      if (err?.response?.data?.message)
        msg += `Pesan: ${err.response.data.message}`;
      else if (err?.message) msg += `Pesan: ${err.message}`;
      else msg += JSON.stringify(err);
      NotificationManager.error(msg, "Gagal", 4500);
    }
  };

  const getLowonganCancelInfo = (items, jobName) => {
    const first = items?.[0] || {};
    const jobOpeningId =
      first?.job_opening_id || first?.position_id || first?.id || null;
    const jobStatus = jobOpeningId ? jobStatusMap[jobOpeningId] : null;

    return {
      jobName:
        jobName ||
        first?.job_title ||
        first?.position_name ||
        first?.base_position ||
        "Lainnya",
      position:
        first?.position_name ||
        first?.base_position ||
        jobStatus?.position_name ||
        jobStatus?.base_position ||
        jobStatus?.job_title ||
        first?.job_title ||
        "",
      base_position: first?.base_position || jobStatus?.base_position || "",
      location:
        first?.location ||
        first?.job_location ||
        first?.work_location ||
        jobStatus?.location ||
        "-",
    };
  };

  const openCancelLowonganModal = (items, jobName, onSuccess) => {
    const first = items?.[0] || {};
    const jobOpeningId =
      first?.job_opening_id || first?.position_id || first?.id || null;

    const open = async () => {
      console.debug(
        "openCancelLowonganModal: jobOpeningId=",
        jobOpeningId,
        "existingJobStatus=",
        jobStatusMap[jobOpeningId],
      );
      // ensure job status (and location) is fetched before showing modal
      if (jobOpeningId && !jobStatusMap[jobOpeningId]) {
        try {
          const res = await axios.get(`/api/job-openings/${jobOpeningId}`);
          console.debug("fetch /api/job-openings/:id response", res?.data);
          if (res.data && res.data.job) {
            setJobStatusMap((prev) => ({
              ...prev,
              [jobOpeningId]: {
                status: res.data.job.status,
                hiring_status: res.data.job.hiring_status,
                location:
                  res.data.job.location ||
                  res.data.job.job_location ||
                  res.data.job.work_location ||
                  "",
                job_title: res.data.job.job_title || res.data.job.title || "",
                position_name: res.data.job.position_name || "",
                base_position: res.data.job.base_position || "",
              },
            }));
          }
        } catch (e) {
          // ignore fetch error, fallback to existing info
          console.error("Failed fetch job-opening on modal open", e);
        }
      }

      const info = getLowonganCancelInfo(items, jobName);
      console.debug(
        "Resolved cancel info",
        info,
        "jobStatusAfterFetch=",
        jobStatusMap[jobOpeningId],
      );
      setPendingCancelLowongan({ items, onSuccess, ...info });
      setIsCancelLowonganModalOpen(true);
    };

    open();
  };

  const closeCancelLowonganModal = () => {
    setIsCancelLowonganModalOpen(false);
    setPendingCancelLowongan(null);
  };

  const menu = [
    { key: "schedule", label: "Buatkan Jadwal" },
    { key: "list", label: "Jadwal Wawancara" },
    { key: "history", label: "Riwayat Jadwal" },
  ];

  const [jobStatusMap, setJobStatusMap] = useState({}); // { [job_opening_id]: { status, hiring_status, location } }
  const jobStatusLoading = useRef({}); // prevent duplicate fetch

  // Fungsi untuk fetch status job_openings jika belum ada di state
  const fetchJobStatus = useCallback(
    async (jobOpeningId) => {
      if (
        !jobOpeningId ||
        jobStatusMap[jobOpeningId] ||
        jobStatusLoading.current[jobOpeningId]
      )
        return;
      jobStatusLoading.current[jobOpeningId] = true;
      try {
        const res = await axios.get(`/api/job-openings/${jobOpeningId}`);
        const job = res?.data?.job || res?.data?.jobOpening || res?.data?.data || res?.data || null;
        if (job) {
          setJobStatusMap((prev) => ({
            ...prev,
            [jobOpeningId]: {
              status: job.status || job.job_status || "",
              hiring_status: job.hiring_status || job.hiringStatus || "",
              location:
                job.location || job.job_location || job.work_location || "",
              job_title: job.job_title || job.title || "",
              position_name:
                job.position_name || job.position?.name || job.positionName || "",
              base_position: job.base_position || job.position?.base_position || "",
            },
          }));
        }
      } catch (e) {
        // Optional: handle error
      } finally {
        jobStatusLoading.current[jobOpeningId] = false;
      }
    },
    [jobStatusMap],
  );

  // Pastikan status/hiring_status selalu di-fetch untuk setiap job di groupedData (schedule/list)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeMenu === "schedule" || activeMenu === "list") {
      Object.keys(groupedData).forEach((job) => {
        const first = groupedData[job]?.[0];
        const jobOpeningId =
          first?.job_opening_id || first?.position_id || first?.id;
        if (jobOpeningId) fetchJobStatus(jobOpeningId);
      });
    }
  }, [activeMenu, groupedData, fetchJobStatus]);

  // Gabungkan data interviews (completed/disqualified) dan applications/interviews (canceled_by_company) untuk history
  // Hanya tampilkan interview dengan status 'completed', 'disqualified', dan 'canceled_by_company'
  // Urutkan data riwayat terbaru di atas
  const sortedHistory = [...data]
    .filter(
      (d) =>
        d.status === "completed" ||
        d.status === "disqualified" ||
        d.status === "cancelled" ||
        (d.status === "" && d.interviewer_notes) ||
        d.status === "canceled_by_company",
    )
    .sort((a, b) => {
      // Urutkan descending berdasarkan tanggal interview
      const dateA = new Date(a.scheduled_date || a.date || 0);
      const dateB = new Date(b.scheduled_date || b.date || 0);
      return dateB - dateA;
    });

  const activeInterviewCount = React.useMemo(
    () =>
      (interviewRows || []).filter((d) =>
        ["scheduled", "rescheduled"].includes(d.status),
      ).length,
    [interviewRows],
  );

  const historyCount = React.useMemo(
    () =>
      (historyRows || []).filter(
        (d) =>
          d.status === "completed" ||
          d.status === "disqualified" ||
          d.status === "cancelled" ||
          (d.status === "" && d.interviewer_notes) ||
          d.status === "canceled_by_company",
      ).length,
    [historyRows],
  );

  // Group by job_title
  const groupedHistory = sortedHistory.reduce((acc, curr) => {
    const job = curr.job_title || "Lainnya";
    if (!acc[job]) acc[job] = [];
    acc[job].push(curr);
    return acc;
  }, {});

  // Filter by posisi, status, dan nama kandidat.
  const filteredHistory = Object.fromEntries(
    Object.entries(groupedHistory)
      .filter(([job]) => !form.positionFilterHistory || job === form.positionFilterHistory)
      .map(([job, list]) => {
        const nameFilter = (form.searchName || "").toString().trim().toLowerCase();
        const filteredList = (list || []).filter((d) => {
          const status = String(d.status || "").toLowerCase();
          const selectedStatus = String(form.statusFilterHistory || "").toLowerCase();
          const candidateName = ((d.candidate_name || d.name) || "")
            .toString()
            .toLowerCase();
          const matchesStatus =
            !selectedStatus ||
            status === selectedStatus ||
            (selectedStatus === "canceled_by_company" && status === "cancelled");
          const matchesName = !nameFilter || candidateName.includes(nameFilter);

          return matchesStatus && matchesName;
        });

        return [job, filteredList];
      })
      .filter(([, list]) => Array.isArray(list) && list.length > 0),
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeMenu === "history") {
      Object.keys(filteredHistory).forEach((job) => {
        const first = filteredHistory[job]?.[0];
        const jobOpeningId =
          first?.job_opening_id || first?.position_id || first?.id;
        if (jobOpeningId) fetchJobStatus(jobOpeningId);
      });
    }
  }, [activeMenu, filteredHistory, fetchJobStatus]);

  const tabItems = menu.map((m) => ({
    ...m,
    icon:
      m.key === "schedule"
        ? Users
        : m.key === "list"
          ? CalendarDays
          : History,
    count:
      m.key === "schedule"
        ? unscheduledCandidates.length
        : m.key === "list"
          ? activeInterviewCount
          : historyCount,
  }));

  return (
    <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.07)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[0_20px_70px_rgba(2,6,23,0.45)] sm:p-7">
      <div className="space-y-6">
        <div className="relative min-h-[120px] overflow-hidden rounded-[1.4rem] bg-gradient-to-r from-white via-white to-orange-50/80 px-1 py-2 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-2">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/70 dark:text-orange-300">
              <Mic className="h-4 w-4" />
              Manajemen Wawancara
            </div>
            <h1 className="text-[28px] font-extrabold leading-tight text-slate-900 dark:text-slate-50">
              Manajemen Interview
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              Kelola jadwal interview kandidat, penilaian wawancara, dan riwayat proses rekrutmen dalam satu halaman.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {tabItems.map((m) => {
            const Icon = m.icon;
            const isActive = activeMenu === m.key;

            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setActiveMenu(m.key)}
                className={`relative min-w-[220px] overflow-hidden rounded-2xl border px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  isActive
                    ? "border-orange-200 bg-white text-orange-500 ring-1 ring-orange-100 dark:border-orange-900/60 dark:bg-slate-900 dark:ring-orange-900/40"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {isActive && (
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-orange-500" />
                )}

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isActive
                          ? "bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-extrabold ${
                          isActive
                            ? "text-orange-500"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {m.label}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {m.key === "schedule"
                          ? "Kandidat siap dijadwalkan"
                          : m.key === "list"
                            ? "Interview aktif"
                            : "Data selesai/gugur"}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    {m.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <HiredCandidateWarning
          items={hiredCandidateWarnings}
          title="Kandidat sudah lolos"
          description="Ada kandidat pada halaman interview yang sudah tercatat lolos pada lowongan tertentu. Gunakan aksi Jadikan Tidak Lolos agar kandidat tidak diproses ulang di lowongan ini."
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
        {/* CONTENT */}
        {activeMenu === "schedule" && (
          <div>
            {/* SUMMARY METRICS: lowongan & kandidat tanpa jadwal */}
            <div className="w-full mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setUnscheduledFilter("jobs");
                  setForm((f) => ({ ...f, positionFilter: "" }));
                  setTimeout(() => {
                    const el = document.getElementById("schedule-groups");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                    Lowongan Belum Dijadwalkan
                  </p>
                  <p className="mt-2 text-2xl font-bold text-primary">{unscheduledJobTitles.size}</p>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm text-base-content/50">Lihat</span>
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setUnscheduledFilter("candidates");
                  setForm((f) => ({ ...f, positionFilter: "" }));
                  setTimeout(() => {
                    const el = document.getElementById("schedule-groups");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                    Kandidat Belum Dijadwalkan
                  </p>
                  <p className="mt-2 text-2xl font-bold text-primary">{unscheduledCandidates.length}</p>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm text-base-content/50">Lihat</span>
                </div>
              </div>
            </div>

            {/* FILTER SCHEDULE */}
            <div className="w-full mb-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <select
                  className="select select-bordered rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 flex-1 min-w-[180px]"
                  value={form.positionFilter || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, positionFilter: e.target.value }))
                  }
                >
                  <option value="">Semua Posisi</option>
                  {Array.from(
                    new Set(
                      (candidates || []).map(
                        (c) => c.position_name || c.base_position || c.job_title || "Lainnya",
                      ),
                    ),
                  ).map((pos, idx) => (
                    <option key={idx} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama"
                  className="input input-bordered rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 flex-1 min-w-[160px]"
                  value={form.searchName || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, searchName: e.target.value }))
                  }
                />
                <button
                  className="btn border-none bg-orange-500 text-white hover:bg-orange-600 w-full sm:w-auto"
                  onClick={() => {
                    setForm((f) => ({ ...f, positionFilter: "", searchName: "" }));
                    setUnscheduledFilter(null);
                    setTimelineFilter(null);
                    setShowAll({});
                  }}
                >
                  Reset 
                </button>
              </div>
            </div>

            {/* GROUPED LIST */}
            <div id="schedule-groups" className="space-y-6">
              {/* Group kandidat berdasarkan posisi (job_title) */}
              {Object.entries(groupedCandidates).map(([job, list], idx) => (
                <div key={idx} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
                    <span className="font-semibold">
                      {formatJobAndPosFromFirst(
                        (list || []).find(
                          (it) => it.position_name || it.base_position || (it.job_opening && it.job_opening.base_position),
                        ) || list?.[0],
                        job,
                      )}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="
      px-3 py-1 text-xs
      bg-gradient-to-b from-blue-400 to-blue-600
      text-white rounded-full
      shadow-md hover:shadow-lg
      border border-blue-600
      hover:from-blue-500 hover:to-blue-700
      transition-all duration-200
    "
                        onClick={() => {
                          // Cari kandidat pertama pada list untuk ambil id
                          const firstCandidate = list[0];
                          navigate("/app/DetailInterview-process", {
                            state: {
                              job: {
                                id:
                                  firstCandidate?.position_id ||
                                  firstCandidate?.job_opening_id,
                                title: job,
                              },
                            },
                          });
                        }}
                      >
                        Detail Lowongan
                      </button>
                      <button
                        className="btn btn-error btn-xs"
                        onClick={() =>
                          openCancelLowonganModal(list, job, () => {
                            // Refresh data kandidat
                            setCandidates((prev) =>
                              prev.filter(
                                (c) => (c.position_name || c.base_position || c.job_title || "Lainnya") !== job,
                              ),
                            );
                          })
                        }
                      >
                        Cancel Lowongan
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {(showAll[job] ? list : list.slice(0, 1)).map(
                      (candidate, i) => {
                        const isReschedule =
                          canceledMap[candidate.application_id];
                        const hiredInfo = findHiredCandidateInfo(
                          hiredCandidateLookup,
                          candidate,
                        );
                        return (
                          <div
                            key={candidate.id || i}
                            className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                              <span className="flex items-center">
                                {candidate.name ||
                                  candidate.candidate_name ||
                                  "(Tanpa Nama)"}
                                {isReschedule && (
                                  <span className="badge badge-warning ml-2">
                                    Reschedule jadwal ini
                                  </span>
                                )}
                              </span>
                              </div>
                              {hiredInfo && (
                                <div className="ml-5 flex max-w-xl items-start gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-emerald-800 shadow-sm">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                  <div>
                                    <p className="text-xs font-extrabold">
                                      Kandidat sudah lolos
                                    </p>
                                    <p className="text-[11px] font-semibold">
                                      Lowongan: {hiredInfo.hiredJobLabel || "-"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {hiredInfo ? (
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 shadow-sm hover:bg-red-100"
                                  onClick={() =>
                                    markInterviewCandidateNotPassed(
                                      candidate,
                                      hiredInfo,
                                    )
                                  }
                                >
                                  <XCircle className="h-4 w-4" />
                                  Jadikan Tidak Lolos
                                </button>
                              ) : !isReschedule ? (
                                <button
                                  className="btn border-none bg-orange-500 text-white hover:bg-orange-600 btn-sm"
                                  onClick={() => handleSchedule(candidate)}
                                >
                                  Buatkan Jadwal Wawancara
                                </button>
                              ) : (
                                <button
                                  className="btn border-none bg-orange-500 text-white hover:bg-orange-600 btn-sm"
                                  onClick={() => {
                                    setMode("update");
                                    // Cari interview canceled pada data
                                    const canceledInterview = data.find(
                                      (d) =>
                                        d.application_id === candidate.id &&
                                        ["canceled", "cancelled"].includes(
                                          d.status,
                                        ),
                                    );
                                    if (canceledInterview) {
                                      setSelectedCandidate(canceledInterview);
                                      setForm({
                                        scheduled_date:
                                          canceledInterview.scheduled_date ||
                                          canceledInterview.date,
                                        interview_stage:
                                          canceledInterview.stage,
                                        interview_type:
                                          canceledInterview.interview_type ||
                                          canceledInterview.type,
                                        duration_minutes:
                                          canceledInterview.duration_minutes ||
                                          60,
                                        interviewer_id:
                                          canceledInterview.interviewer_id ||
                                          "",
                                        meeting_link:
                                          canceledInterview.meeting_link || "",
                                        location:
                                          canceledInterview.location || "",
                                      });
                                    } else {
                                      setSelectedCandidate(candidate);
                                    }
                                    setIsModalOpen(true);
                                  }}
                                >
                                  Atur Ulang Jadwal
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                    {list.length > 1 && (
                      <div className="p-4 text-center">
                        <button
                          className="btn-sm"
                          onClick={() =>
                            setShowAll((prev) => ({
                              ...prev,
                              [job]: !prev[job],
                            }))
                          }
                        >
                          {showAll[job]
                            ? "Tampilkan Sedikit Data"
                            : `Tampilkan Semua (${list.length})`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {candidates.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Tidak ada kandidat yang lolos dokumen.
                </div>
              )}
            </div>
          </div>
        )}
        {activeMenu === "list" && (
          <div>
            {/* SUMMARY TIMELINE: jadwal hari ini / besok / lewat jadwal */}
            <div className="w-full mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => openTimelineFilter("today")}
                className="rounded-2xl border border-info/30 bg-info/10 p-4 shadow-sm text-left transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-info/80">
                  Jadwal Hari Ini
                </p>
                <p className="mt-2 text-2xl font-bold text-info">
                  {scheduleTimelineMetrics.todayItems.length}
                </p>
                <p className="mt-1 text-sm text-base-content/60">
                  Klik untuk lihat interview hari ini
                </p>
              </button>

              <button
                type="button"
                onClick={() => openTimelineFilter("tomorrow")}
                className="rounded-2xl border border-success/30 bg-success/10 p-4 shadow-sm text-left transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-success/80">
                  Jadwal Besok
                </p>
                <p className="mt-2 text-2xl font-bold text-success">
                  {scheduleTimelineMetrics.tomorrowItems.length}
                </p>
                <p className="mt-1 text-sm text-base-content/60">
                  Klik untuk lihat interview besok
                </p>
              </button>

              <button
                type="button"
                onClick={() => openTimelineFilter("overdue")}
                className="rounded-2xl border border-warning/30 bg-warning/10 p-4 shadow-sm text-left transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-warning/80">
                  Lewat Jadwal / Nilai Kandidat
                </p>
                <p className="mt-2 text-2xl font-bold text-warning">
                  {scheduleTimelineMetrics.overdueItems.length}
                </p>
                <p className="mt-1 text-sm text-base-content/60">
                  Klik untuk lihat kandidat yang sudah lewat jadwal
                </p>
              </button>
            </div>

            {timelineFilter && (
              <div className="mb-4 rounded-2xl border border-base-300 bg-base-100 px-4 py-3 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
                    Filter Timeline Aktif
                  </p>
                  <p className="mt-1 font-semibold">
                    {timelineFilter === "today"
                      ? "Jadwal Hari Ini"
                      : timelineFilter === "tomorrow"
                      ? "Jadwal Besok"
                      : "Lewat Jadwal / Nilai Kandidat"}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setTimelineFilter(null)}
                >
                  Hapus Filter
                </button>
              </div>
            )}
            {/* FILTER LIST */}
            <div className="w-full mb-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <select
                  className="select select-bordered rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 flex-1 min-w-[180px]"
                  value={form.positionFilterList || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      positionFilterList: e.target.value,
                    }))
                  }
                >
                  <option value="">Semua Posisi</option>
                  {Array.from(
                    new Set(
                      data
                        .filter((d) =>
                          ["scheduled", "rescheduled"].includes(d.status),
                        )
                        .map(
                          (c) => c.position_name || c.base_position || c.job_title || "Lainnya",
                        ),
                    ),
                  ).map((pos, idx) => (
                    <option key={idx} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama"
                  className="input input-bordered rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 flex-1 min-w-[160px]"
                  value={form.searchName || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, searchName: e.target.value }))
                  }
                />
                <button
                  className="btn border-none bg-orange-500 text-white hover:bg-orange-600 w-full sm:w-auto"
                  onClick={() => {
                    setForm((f) => ({ ...f, positionFilterList: "", searchName: "" }));
                    setTimelineFilter(null);
                    setShowAll({});
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
            <div id="list-groups" className="space-y-6">
              {Object.keys(visibleListGroups).map((job, idx) => (
                <div key={idx} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
                  {/* 🔥 HEADER POSISI */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
                    <span className="font-semibold">
                      {formatJobAndPosFromFirst(
                        (visibleListGroups[job] || []).find(
                          (it) => it.position_name || it.base_position || (it.job_opening && it.job_opening.base_position),
                        ) || visibleListGroups[job]?.[0],
                        job,
                      )}
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="
     px-3 py-1 text-xs
      bg-gradient-to-b from-blue-400 to-blue-600
      text-white rounded-full
      shadow-md hover:shadow-lg
      border border-blue-600
      hover:from-blue-500 hover:to-blue-700
      transition-all duration-200
    "
                        onClick={() => {
                          // Cari kandidat pertama pada groupedData[job] untuk ambil id
                          const first = visibleListGroups[job]?.[0];
                          navigate("/app/DetailInterview-process", {
                            state: {
                              job: {
                                id: first?.position_id || first?.job_opening_id,
                                title: job,
                              },
                            },
                          });
                        }}
                      >
                        Detail Lowongan
                      </button>
                      <button
                        className="btn btn-error btn-xs"
                        onClick={() =>
                          openCancelLowonganModal(visibleListGroups[job], job, () => {
                            setData((prev) =>
                              prev.filter((d) => d.job_title !== job),
                            );
                          })
                        }
                      >
                        Cancel Lowongan
                      </button>
                    </div>
                  </div>

                  {/* 🔥 LIST KANDIDAT */}
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {(showAll[job]
                      ? visibleListGroups[job]
                      : visibleListGroups[job].slice(0, 1)
                    ).map((d) => {
                      const hiredInfo = findHiredCandidateInfo(
                        hiredCandidateLookup,
                        d,
                      );

                      return (
                      <div
                        key={d.id}
                        id={`interview-row-${d.id}`}
                        className="bg-white p-5 dark:bg-slate-950"
                      >
                        {/* HEADER */}
                        <div>
                          <h2 className="font-semibold">{d.candidate_name}</h2>
                          {hiredInfo && (
                            <div className="mt-2 flex max-w-2xl items-start gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-sm">
                              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                              <div>
                                <p className="text-sm font-extrabold">
                                  Kandidat sudah lolos dan tidak dapat diproses lagi
                                </p>
                                <p className="text-xs font-semibold">
                                  Lowongan: {hiredInfo.hiredJobLabel || "-"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* DETAIL */}
                        <div className="mt-3 flex justify-between items-start">
                          {/* 🔹 LEFT: DETAIL */}
                          <div className="text-[15px] space-y-1.5">
                            <p>📆 Tanggal: {formatDate(d.scheduled_date)}</p>
                            <p>
                              ⏱️ Durasi:{" "}
                              {d.duration_minutes
                                ? `${d.duration_minutes} menit`
                                : "-"}
                            </p>
                            <p>📍 Tipe: {d.interview_type}</p>
                            <p>👤 Interviewer : {d.interviewer_name || "-"}</p>
                          </div>

                          {/* 🔹 RIGHT: BUTTON */}
                          <div className="flex flex-col gap-1.5 items-end w-[140px]">
                            {hiredInfo ? (
                              <button
                                type="button"
                                className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-700 shadow-sm hover:bg-red-100"
                                onClick={() =>
                                  markInterviewCandidateNotPassed(d, hiredInfo)
                                }
                              >
                                <XCircle className="h-4 w-4" />
                                Tidak Lolos
                              </button>
                            ) : (
                              <>
                            <button></button>

                            <button
                              className="
      btn-xs w-full text-sm normal-case
      bg-gradient-to-b from-blue-400 to-blue-600
      text-white rounded-full
      shadow-md hover:shadow-lg
      border border-blue-600
      hover:from-blue-500 hover:to-blue-700
      transition-all duration-200
    "
                              onClick={() => {
                                setSelectedCandidate(d);
                                setIsDetailOpen(true);
                              }}
                            >
                              Review & Nilai
                            </button>

                            <button
                              className="
       btn-xs w-full text-sm normal-case
      bg-gradient-to-b from-yellow-300 to-yellow-500
      text-black rounded-full
      shadow-md hover:shadow-lg
      border border-yellow-500
      hover:from-yellow-400 hover:to-yellow-600
      transition-all duration-200
    "
                              onClick={() => {
                                setMode("update");
                                setSelectedCandidate(d);

                                setForm({
                                  scheduled_date: d.date,
                                  interview_stage: d.stage,
                                  interview_type: d.type,
                                  duration_minutes: 60,
                                  interviewer_id: "",
                                  meeting_link: "",
                                  location: "",
                                });

                                setIsModalOpen(true);
                              }}
                            >
                              Atur Ulang Jadwal
                            </button>

                            <button
                              className="btn btn-error btn-xs w-full text-sm normal-case"
                              onClick={() => {
                                setSelectedCandidate(d);
                                setCancelNotes("");
                                setIsCancelModalOpen(true);
                              }}
                            >
                              Gugurkan
                            </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                  {visibleListGroups[job].length > 1 && (
                    <div className="p-4 text-center">
                      <button
                        className="btn-sm"
                        onClick={() =>
                          setShowAll((prev) => ({
                            ...prev,
                            [job]: !prev[job],
                          }))
                        }
                      >
                        {showAll[job]
                          ? "Tampilkan Sedikit Data"
                          : `Tampilkan Semua (${visibleListGroups[job].length})`}
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {Object.keys(
                Object.fromEntries(
                  Object.entries(groupedData).filter(
                    ([job]) =>
                      !form.positionFilterList ||
                      job === form.positionFilterList,
                  ),
                ),
              ).length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Tidak ada Jadwal Wawancara dengan Kandidat.
                </div>
              )}
            </div>
          </div>
        )}
        {activeMenu === "history" && (
          <div>
            {/* FILTER HISTORY */}
            <div className="w-full mb-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <select
                  className="select select-bordered rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 flex-1 min-w-[180px]"
                  value={form.positionFilterHistory || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      positionFilterHistory: e.target.value,
                    }))
                  }
                >
                  <option value="">Semua Posisi</option>
                  {Array.from(new Set(Object.keys(groupedHistory))).map(
                    (pos, idx) => (
                      <option key={idx} value={pos}>
                        {pos}
                      </option>
                    ),
                  )}
                </select>

                {/* Filter status */}
                <select
                  className="select select-bordered rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 flex-1 min-w-[160px]"
                  value={form.statusFilterHistory || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      statusFilterHistory: e.target.value,
                    }))
                  }
                >
                  <option value="">Semua Status</option>
                  <option value="completed">Selesai</option>
                  <option value="disqualified">Digugurkan/Diskualifikasi</option>
                  <option value="canceled_by_company">
                    Dibatalkan Perusahaan
                  </option>
                </select>

                <input
                  type="text"
                  placeholder="Cari berdasarkan nama"
                  className="input input-bordered rounded-xl bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 flex-1 min-w-[160px]"
                  value={form.searchName || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, searchName: e.target.value }))
                  }
                />

                <button
                  className="btn border-none bg-orange-500 text-white hover:bg-orange-600 w-full sm:w-auto"
                  onClick={() => {
                    setForm((f) => ({ ...f, positionFilterHistory: "", statusFilterHistory: "", searchName: "" }));
                    setShowAll({});
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* CONTENT HISTORY */}
            <div className="space-y-6">
              {Object.keys(filteredHistory).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Tidak ada data riwayat wawancara.
                </div>
              ) : (
                Object.keys(filteredHistory).map((job, idx) => {
                  return (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950"
                    >
                      {/* HEADER POSISI */}
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
                        <span className="font-semibold">
                          {formatJobAndPosFromFirst(
                            (filteredHistory[job] || []).find(
                              (it) => it.position_name || it.base_position || (it.job_opening && it.job_opening.base_position),
                            ) || filteredHistory[job]?.[0],
                            job,
                          )}
                        </span>
                        <div className="flex gap-2">
                          {(filteredHistory[job] || []).some(
                            (it) => it.status === "canceled_by_company",
                          ) && (
                            <span className="badge badge-error">
                              Dibatalkan oleh perusahaan
                            </span>
                          )}
                          <button
                            className="
      px-3 py-1 text-xs
      bg-gradient-to-b from-blue-400 to-blue-600
      text-white rounded-full
      shadow-md hover:shadow-lg
      border border-blue-600
      hover:from-blue-500 hover:to-blue-700
      transition-all duration-200
    "
                            onClick={() => {
                              const first = filteredHistory[job]?.[0];
                              navigate("/app/DetailInterview-process", {
                                state: {
                                  job: {
                                    id:
                                      first?.position_id ||
                                      first?.job_opening_id,
                                    title: job,
                                  },
                                },
                              });
                            }}
                          >
                            Detail Lowongan
                          </button>
                        </div>
                      </div>

                      {/* LIST HISTORY */}
                      <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {(showAll[job]
                          ? filteredHistory[job]
                          : filteredHistory[job].slice(0, 1)
                        ).map((d) => (
                          <div key={d.id} className="bg-white p-5 dark:bg-slate-950">
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                {/* KIRI: NAMA */}
                                <h2 className="font-semibold">
                                  {d.candidate_name}
                                </h2>

                                {/* KANAN: BADGE + BUTTON */}
                                <div className="flex gap-2 items-center">
                                  {d.result === "pending" && (
                                    <span className="badge badge-warning mr-1">
                                      Belum Dinilai
                                    </span>
                                  )}
                                  {d.result === "no_show" && (
                                    <span className="badge badge-warning mr-1">
                                      Tidak Ditampilkan
                                    </span>
                                  )}
                                  {d.result === "disqualified" &&
                                    d.status !== "disqualified" && (
                                      <span className="badge badge-error mr-1">
                                        Didiskualifikasi
                                      </span>
                                    )}
                                  {d.status === "completed" ? (
                                    <span className="badge badge-success">
                                      Selesai
                                    </span>
                                  ) : d.status === "cancelled" ||
                                    d.status === "disqualified" ? (
                                    <span className="badge badge-error">
                                      {d.status === "disqualified"
                                        ? "Digugurkan"
                                        : "Gugur"}
                                    </span>
                                  ) : null}
                                  <button
                                    className="
      px-3 py-1 text-xs
      bg-gradient-to-b from-blue-400 to-blue-600
      text-white rounded-full
      shadow-md hover:shadow-lg
      border border-blue-600
      hover:from-blue-500 hover:to-blue-700
      transition-all duration-200
    "
                                    onClick={() => {
                                      setSelectedCandidate(d);
                                      setIsDetailOpen(true);
                                    }}
                                  >
                                    Lihat Detail
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 text-sm space-y-1">
                              <p>📆 {formatDate(d.scheduled_date)}</p>
                              <p>📍 {d.interview_type || "-"}</p>
                              <p>
                                🎯 Interviewer : {d.interviewer_name || "-"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* BUTTON SHOW MORE */}
                      {Array.isArray(filteredHistory[job]) &&
                        filteredHistory[job].length > 1 && (
                          <div className="p-4 text-center">
                            <button
                              className="btn-sm"
                              onClick={() => {
                                setShowAll((prev) => ({
                                  ...prev,
                                  [job]: !prev[job],
                                }));
                              }}
                            >
                              {showAll[job]
                                ? "Tampilkan Sedikit Data"
                                : `Tampilkan Semua (${filteredHistory[job].length})`}
                            </button>
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        {/* Modal Form Jadwal/Cancel */}
        <HRModalInterview
          isFormOpen={isModalOpen}
          isCancelOpen={isCancelModalOpen}
          isDetailOpen={false}
          onCloseForm={() => {
            setIsModalOpen(false);
            setIsDetailOpen(false);
          }}
          onCloseCancel={() => setIsCancelModalOpen(false)}
          selectedCandidate={selectedCandidate}
          form={form}
          setForm={setForm}
          mode={mode}
          cancelNotes={cancelNotes}
          setCancelNotes={setCancelNotes}
          onSubmit={async () => {
            if (!selectedCandidate?.application_id) {
              NotificationManager.error(
                "Data aplikasi kandidat tidak ditemukan!",
                "Gagal",
                3500,
              );
              return;
            }
            // Validasi sederhana
            if (!form.scheduled_date) {
              NotificationManager.warning(
                "Tanggal wajib diisi!",
                "Validasi",
                3000,
              );
              return;
            }
            // Validasi bentrok interviewer (waktu overlap)
            if (form.scheduled_date && form.interviewer_id) {
              const newStart = new Date(form.scheduled_date);
              const newEnd = new Date(
                newStart.getTime() +
                  (parseInt(form.duration_minutes || 0) || 0) * 60000,
              );
              const conflict = data.some((d) => {
                // Jangan cek bentrok dengan interview yang sedang diupdate (mode update)
                if (
                  d.interviewer_id === form.interviewer_id &&
                  ["scheduled", "rescheduled"].includes(d.status) &&
                  (mode !== "update" || d.id !== selectedCandidate.id)
                ) {
                  const existStart = new Date(d.scheduled_date);
                  const existEnd = new Date(
                    existStart.getTime() +
                      (parseInt(d.duration_minutes || 0) || 0) * 60000,
                  );
                  // Cek overlap
                  return newStart < existEnd && existStart < newEnd;
                }
                return false;
              });
              if (conflict) {
                NotificationManager.warning(
                  "Interviewer sudah memiliki jadwal wawancara yang bentrok di waktu tersebut. Silakan pilih waktu lain.",
                  "Validasi",
                  3500,
                );
                return;
              }
            }
            try {
              // Determine interview id: prefer selectedCandidate.id, fallback to interview_id, or find by application_id in data
              const interviewId =
                (selectedCandidate &&
                  (selectedCandidate.id || selectedCandidate.interview_id)) ||
                (selectedCandidate && selectedCandidate.application_id
                  ? (
                      data.find(
                        (d) =>
                          d.application_id === selectedCandidate.application_id,
                      ) || {}
                    ).id
                  : null);

              if ((mode === "update" || mode === "reschedule") && interviewId) {
                // Update interview (reschedule)
                await axios.put(
                  `/api/candidates/admin/interviews/${interviewId}`,
                  {
                    interview_type: form.interview_type,
                    scheduled_date: form.scheduled_date,
                    duration_minutes: form.duration_minutes,
                    meeting_link: form.meeting_link,
                    location: form.location,
                    interviewer_id: form.interviewer_id,
                  },
                );
                NotificationManager.success(
                  "Jadwal wawancara berhasil diperbarui.",
                  "Berhasil",
                  3000,
                );
                // Fetch data interview terbaru agar langsung update di UI
                const res = await axios.get("/api/hr/interviews");
                const rows = normalizeInterviewRows(res.data.interviews || []);
                setInterviewRows(rows);
                setData((prev) => mergeHistoryRows(prev, rows));
              } else {
                // Buat interview baru
                const res = await axios.post(
                  `/api/hr/applications/${selectedCandidate.application_id}/schedule-interview`,
                  {
                    interview_type: form.interview_type,
                    scheduled_date: form.scheduled_date,
                    duration_minutes: form.duration_minutes,
                    meeting_link: form.meeting_link,
                    location: form.location,
                    interviewer_id: form.interviewer_id,
                    interview_stage: form.interview_stage,
                  },
                );
                // Update status aplikasi ke 'wawancara'
                await axios.put(
                  `/api/hr/applications/${selectedCandidate.application_id}/status`,
                  { status: "wawancara" },
                );
                NotificationManager.success(
                  "Jadwal wawancara berhasil disimpan.",
                  "Berhasil",
                  3000,
                );
                // Ambil data interview yang baru dibuat (dari response atau fetch ulang)
                let newInterview = null;
                if (res.data && res.data.interview) {
                  newInterview = res.data.interview;
                } else {
                  // fallback: fetch interview terbaru dari API
                  const resp = await axios.get("/api/hr/interviews");
                  if (
                    resp.data &&
                    resp.data.interviews &&
                    resp.data.interviews.length > 0
                  ) {
                    // Cari interview dengan application_id yang sama
                    newInterview = resp.data.interviews.find(
                      (i) =>
                        i.application_id === selectedCandidate.application_id,
                    );
                  }
                }
                // Fetch data interview terbaru agar langsung update di UI
                const resList = await axios.get("/api/hr/interviews");
                // After creating we set active menu to 'list', so update state accordingly
                const rows = normalizeInterviewRows(resList.data.interviews || []);
                const createdInterview =
                  rows.find(
                    (item) =>
                      String(item.application_id || "") ===
                      String(selectedCandidate.application_id || ""),
                  ) ||
                  rows.find(
                    (item) =>
                      newInterview?.id &&
                      String(item.id || item.interview_id || "") ===
                        String(newInterview.id || newInterview.interview_id),
                  ) ||
                  (newInterview ? normalizeInterviewRows([newInterview])[0] : null);
                setInterviewRows(rows);
                setData((prev) => mergeHistoryRows(prev, rows));
                setTimelineFilter(null);
                setActiveMenu("list");
                setForm((prev) => ({
                  ...prev,
                  positionFilterList: createdInterview?.job_title || "",
                  searchName: "",
                }));
                if (createdInterview?.id) {
                  setTimeout(() => {
                    const el = document.getElementById(
                      `interview-row-${createdInterview.id}`,
                    );
                    if (el) {
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      el.classList.add("ring", "ring-primary", "ring-offset-2");
                      setTimeout(() => {
                        el.classList.remove(
                          "ring",
                          "ring-primary",
                          "ring-offset-2",
                        );
                      }, 2000);
                    }
                  }, 500);
                }
              }
              setIsModalOpen(false);
              // Data interview sudah di-refresh otomatis
            } catch (err) {
              NotificationManager.error(
                err?.response?.data?.message ||
                  (mode === "update"
                    ? "Gagal mengupdate jadwal interview"
                    : "Gagal membuat jadwal interview"),
                "Gagal",
                4000,
              );
            }
          }}
          onCancelSubmit={async () => {
            if (!cancelNotes) {
              NotificationManager.warning(
                "Alasan pengguguran wajib diisi.",
                "Validasi",
                3000,
              );
              return;
            }
            if (!selectedCandidate || !selectedCandidate.id) {
              NotificationManager.error(
                "ID interview tidak ditemukan.",
                "Gagal",
                3000,
              );
              return;
            }
            try {
              // Simpan status disqualified + result disqualified dan interviewer_notes
              await axios.put(
                `/api/admin/interviews/${selectedCandidate.id}/result`,
                {
                  interviewer_notes: cancelNotes,
                  status: "disqualified",
                  result: "disqualified",
                },
              );

              const disqualifiedItem = {
                ...selectedCandidate,
                status: "disqualified",
                result: "disqualified",
                interviewer_notes: cancelNotes,
              };

              setInterviewRows((prev) =>
                prev.filter((item) => item.id !== selectedCandidate.id),
              );
              setHistoryRows((prev) =>
                mergeHistoryRows(prev, [disqualifiedItem]),
              );

              // Update local state: mark interview as disqualified
              setData((prev) =>
                prev.map((item) =>
                  item.id === selectedCandidate.id
                    ? disqualifiedItem
                    : item,
                ),
              );

              // Pastikan item langsung muncul di history walau fetch belum selesai
              setData((prev) => {
                const filtered = prev.filter((item) => item.id !== selectedCandidate.id);
                return [disqualifiedItem, ...filtered];
              });

              setForm((prev) => ({
                ...prev,
                statusFilterHistory: "",
                positionFilterHistory: "",
              }));

              // If currently in schedule view, move to history by switching menu
              setIsCancelModalOpen(false);
              NotificationManager.success(
                "Kandidat berhasil digugurkan.",
                "Berhasil",
                3000,
              );
              setActiveMenu("history");
            } catch (err) {
              let msg = "Gagal menggugurkan kandidat.";
              if (err?.response?.data?.message)
                msg += " " + err.response.data.message;
              else if (err?.message) msg += " " + err.message;
              NotificationManager.error(msg, "Gagal", 4000);
              console.error("[Gugurkan Interview Error]", err);
            }
          }}
        />

        {isCancelLowonganModalOpen && pendingCancelLowongan && (
          <div className="modal modal-open">
            <div className="modal-box max-w-md p-0 overflow-hidden rounded-2xl">
              <div className="bg-error text-error-content px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                    ⚠️
                  </div>

                  <div>
                    <h3 className="font-bold text-xl">Cancel Lowongan</h3>

                    <p className="text-sm opacity-90 mt-1">
                      Tindakan ini tidak dapat dibatalkan
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-base-200 rounded-xl p-4">
                  <p className="text-sm text-base-content/60">
                    Lowongan yang akan dibatalkan:
                  </p>

                  <h2 className="text-xl font-bold mt-2">
                    {pendingCancelLowongan.jobName}
                    {pendingCancelLowongan.position
                      ? ` — ${pendingCancelLowongan.position}`
                      : ""}
                    {pendingCancelLowongan.base_position &&
                    pendingCancelLowongan.base_position !==
                      pendingCancelLowongan.position
                      ? ` (${pendingCancelLowongan.base_position})`
                      : ""}
                  </h2>

                  <p className="text-sm text-base-content/50 mt-1">
                    {pendingCancelLowongan.location}
                  </p>
                </div>

                <div className="alert alert-warning mt-5 text-sm">
                  <span>
                    Semua kandidat dan interview pada lowongan ini akan diberi
                    status dibatalkan oleh perusahaan.
                  </span>
                </div>

                <div className="modal-action mt-6">
                  <button
                    className="btn btn-ghost"
                    onClick={closeCancelLowonganModal}
                  >
                    Batal
                  </button>

                  <button
                    className="btn btn-error text-white"
                    onClick={async () => {
                      await handleCancelLowongan(
                        pendingCancelLowongan.items,
                        pendingCancelLowongan.jobName,
                        pendingCancelLowongan.onSuccess,
                      );
                      closeCancelLowonganModal();
                    }}
                  >
                    Ya, Batalkan
                  </button>
                </div>
              </div>
            </div>

            <div
              className="modal-backdrop bg-black/40"
              onClick={closeCancelLowonganModal}
            ></div>
          </div>
        )}

        {/* Modal Detail Interview */}
        <HRInterviewDetailLowongan
          isFormOpen={false}
          isCancelOpen={false}
          isDetailOpen={isDetailOpen}
          onCloseForm={() => {
            setIsDetailOpen(false);
          }}
          selectedCandidate={selectedCandidate}
          readOnly={activeMenu === "history"}
          onEvaluationSaved={() => {
            setIsDetailOpen(false);
            navigate("/app/Evaluated-candidates");
          }}
        />
        </div>
      </div>
    </div>
  );
}
