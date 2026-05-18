import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";
import { pegawaiApi } from "../../../features/pegawai/api";

// Helper: generate label and badge deterministically when backend doesn't provide them
const makeSanctionLabel = (raw) => {
  const value = String(raw || "").trim();
  if (!value || value.toLowerCase() === "none") return "Belum Ada SP";
  const spMatch = value.match(/^\s*sp\s*[-_]?\s*(\d+)\s*$/i);
  if (spMatch) return `SP${spMatch[1]}`;
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const makeSanctionBadge = (raw) => {
  const m = String(raw || "").toLowerCase();
  if (!m || m === "none") return "badge-ghost";
  const palette = ["badge-info", "badge-warning", "badge-error", "badge-secondary", "badge-success", "badge-neutral", "badge-ghost"];
  let hash = 0;
  for (let i = 0; i < m.length; i++) hash = (hash << 5) - hash + m.charCodeAt(i);
  return palette[Math.abs(hash) % palette.length];
};

function EmployeeWarningLetters() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [history, setHistory] = useState([]);
  const [letters, setLetters] = useState([]);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState("");
  const [alphaPage, setAlphaPage] = useState(1);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryRes, historyRes, lettersRes, rulesRes] =
        await Promise.allSettled([
          pegawaiApi.getAttendanceSummary(),
          pegawaiApi.getAttendanceHistory({ limit: 200 }),
          pegawaiApi.getMyWarningLetters(),
          pegawaiApi.getAttendanceWarningRulesPublic(),
        ]);

      if (summaryRes.status === "fulfilled")
        setSummary(summaryRes.value?.data || {});
      else setSummary({});

      if (historyRes.status === "fulfilled")
        setHistory(historyRes.value?.data || []);
      else setHistory([]);

      if (lettersRes && lettersRes.status === "fulfilled")
        setLetters(lettersRes.value?.data || []);
      else setLetters([]);

      if (rulesRes && rulesRes.status === "fulfilled")
        setRules(rulesRes.value?.data || []);
      else setRules([]);
    } catch (err) {
      setError(err.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDateOnly = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    // If Date parser fails, try a common numeric YYYYMMDD fallback, otherwise show raw value
    if (Number.isNaN(d.getTime())) {
      if (typeof value === "string" && /^\d{8}$/.test(value)) {
        const yyyy = value.slice(0, 4);
        const mm = value.slice(4, 6);
        const dd = value.slice(6, 8);
        return `${yyyy}-${mm}-${dd}`;
      }
      return String(value);
    }

    const yyyy = d.getFullYear();
    // Guard against malformed dates that parse to small years (e.g. 3-digit years)
    if (Number(yyyy) < 1000) {
      if (typeof value === "string" && /^\d{8}$/.test(value)) {
        const y = value.slice(0, 4);
        const m = value.slice(4, 6);
        const da = value.slice(6, 8);
        return `${y}-${m}-${da}`;
      }
      return String(value);
    }

    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: "Pelanggaran Kehadiran" }));
    loadData();
  }, [dispatch, loadData]);

  if (loading)
    return (
      <div className="py-10 text-center">Memuat data surat peringatan...</div>
    );

  const discipline = summary.alpha_discipline || {};
  const lateCount = Number(summary?.late_days || 0);
  const consecutiveLate = (() => {
    try {
      const hist = (history || []).slice().sort((a, b) => {
        const da = new Date(a.date || 0).getTime();
        const db = new Date(b.date || 0).getTime();
        return db - da;
      });
      let cnt = 0;
      for (const item of hist) {
        const isLate = Number(item?.late_minutes || 0) > 0 || Boolean(item?.is_late);
        if (isLate) cnt += 1;
        else break;
      }
      return cnt;
    } catch (e) {
      return 0;
    }
  })();
  const normalizeSanction = (value) => {
    if (!value && !letters?.length) return "none";
    const raw = String(
      value || (letters && letters[0] && letters[0].sp_level) || "",
    )
      .toLowerCase()
      .trim();
    if (!raw) return "none";
    // common backend formats: 'SP1', 'sp_1', '1', 'sp1', 'SP-1'
    if (/sp\s*[-_]?\s*1|^1$|^sp1$/i.test(raw)) return "sp1";
    if (/sp\s*[-_]?\s*2|^2$|^sp2$/i.test(raw)) return "sp2";
    if (/sp\s*[-_]?\s*3|^3$|^sp3$/i.test(raw)) return "sp3";
    if (
      raw.includes("evaluasi") ||
      raw.includes("nonaktif") ||
      raw.includes("non-active") ||
      raw.includes("non active")
    )
      return "evaluasi_hr";
    if (raw === "none" || raw === "-" || raw === "0") return "none";
    return raw;
  };

  const sanctionLevel = normalizeSanction(discipline.alpha_sanction_level);
  const sanctionLabel = discipline.alpha_sanction_label || makeSanctionLabel(discipline.alpha_sanction_level || sanctionLevel);
  const sanctionBadgeClass = discipline.alpha_sanction_badge || makeSanctionBadge(discipline.alpha_sanction_level || sanctionLevel);

  const alphaHistory = (history || []).filter((item) => {
    const status = String(item.status || "").toLowerCase();
    const isLate = Number(item.late_minutes || 0) > 0 || Boolean(item.is_late);
    return status === "alpha" || isLate;
  });

  const itemsPerPage = 10;
  const totalAlphaPages = Math.ceil(alphaHistory.length / itemsPerPage);
  const startIndex = (alphaPage - 1) * itemsPerPage;
  const paginatedAlphaHistory = alphaHistory.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="space-y-6">
      {error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-xs" onClick={loadData}>
            Muat Ulang
          </button>
        </div>
      ) : null}

      <TitleCard title="Pelanggaran Kehadiran Saya" topMargin="mt-0">
        <div className="grid md:grid-cols-5 grid-cols-1 gap-4">
          <div className="p-4 rounded-lg bg-base-200">
            <p className="text-sm opacity-70">Sanksi Saat Ini</p>
            <p className="text-lg font-semibold mt-1">
              <span className={`badge ${sanctionBadgeClass}`}>
                {sanctionLabel}
              </span>
            </p>
          </div>
          <div className="p-4 rounded-lg bg-base-200">
            <p className="text-sm opacity-70">Alpha Berturut-turut</p>
            <p className="text-lg font-semibold">
              {Number(discipline.alpha_consecutive_days || 0)} hari
            </p>
          </div>
          <div className="p-4 rounded-lg bg-base-200">
            <p className="text-sm opacity-70">Alpha Akumulasi</p>
            <p className="text-lg font-semibold">
              {Number(discipline.alpha_accumulated_days || 0)} hari
            </p>
          </div>
          <div className="p-4 rounded-lg bg-base-200">
            <p className="text-sm opacity-70">Terlambat Berturut-turut</p>
            <p className="text-lg font-semibold">{consecutiveLate} kali</p>
          </div>
          <div className="p-4 rounded-lg bg-base-200">
            <p className="text-sm opacity-70">Terlambat Akumulasi</p>
            <p className="text-lg font-semibold">{lateCount} kali</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-base-200 border-b border-base-300">
            <h3 className="font-semibold text-base">
              Aturan Peringatan Kehadiran
            </h3>
            <p className="text-xs opacity-60 mt-1">
              Ringkasan batas pelanggaran berdasarkan level sanksi.
            </p>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {rules.length === 0 ? (
              <div className="md:col-span-3 text-center py-8 text-sm opacity-60">
                Aturan belum tersedia
              </div>
            ) : (
              rules.map((rule) => {
                const sanction = rule.sanction_label || makeSanctionLabel(rule.sanction_level || "");
                const badgeClass = rule.sanction_badge || makeSanctionBadge(rule.sanction_level || "");

                return (
                  <div
                    key={rule.id}
                    className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs opacity-60">Level Sanksi</p>
                        <h4 className="font-bold text-lg mt-1">{sanction}</h4>
                      </div>

                      <span className={`badge ${badgeClass} badge-outline`}>
                        {rule.rule_code}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl bg-base-200 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">Alpha</span>
                          <span className="badge badge-error badge-outline badge-sm">
                            Hari
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs opacity-60">Berturut</p>
                            <p className="font-bold">
                              {Number(rule.min_consecutive_alpha || 0)} hari
                            </p>
                          </div>

                          <div>
                            <p className="text-xs opacity-60">Akumulasi</p>
                            <p className="font-bold">
                              {Number(rule.min_accumulated_alpha || 0)} hari
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-base-200 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">
                            Terlambat
                          </span>
                          <span className="badge badge-warning badge-outline badge-sm">
                            Kali
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-xs opacity-60">Berturut</p>
                            <p className="font-bold">
                              {Number(rule.min_consecutive_late || 0)} kali
                            </p>
                          </div>

                          <div>
                            <p className="text-xs opacity-60">Akumulasi</p>
                            <p className="font-bold">
                              {Number(rule.min_accumulated_late || 0)} kali
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </TitleCard>

      <TitleCard title="Bukti Pelanggaran" topMargin="mt-6">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th className="w-16">No</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Keterangan</th>
              </tr>
            </thead>

            <tbody>
              {alphaHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center opacity-60">
                    Tidak ada bukti pelanggaran pada periode yang diminta
                  </td>
                </tr>
              ) : (
                paginatedAlphaHistory.map((item, idx) => {
                  const isLate =
                    Number(item.late_minutes || 0) > 0 || item.is_late;
                  const rawStatus = String(item.status || "").toLowerCase();
                  const statusLabel = isLate ? "terlambat" : rawStatus || "-";

                  const formatStatus = (s) => {
                    if (!s) return "-";
                    if (s === "alpha") return "alpha";
                    if (s === "terlambat") return "terlambat";
                    return (
                      String(s).charAt(0).toUpperCase() + String(s).slice(1)
                    );
                  };
                  const formatLate = (minutes) => {
                    const m = Number(minutes || 0);
                    if (!m || m <= 0) return "-";
                    const h = Math.floor(m / 60);
                    const rem = m % 60;
                    if (h > 0) return `${h} jam ${rem} menit`;
                    return `${rem} menit`;
                  };

                  let keterangan = "-";
                  if (statusLabel === "alpha") keterangan = "Tidak hadir";
                  else if (statusLabel === "terlambat")
                    keterangan = formatLate(item.late_minutes);
                  else if (item.note) keterangan = item.note;

                  return (
                    <tr key={item.id || idx}>
                      <td className="font-medium opacity-70">
                        {startIndex + idx + 1}
                      </td>
                      <td>{formatDateOnly(item.date)}</td>
                      <td>{formatStatus(statusLabel)}</td>
                      <td>{keterangan}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {alphaHistory.length > 0 && (
          <div className="mt-4">
            <Pagination
              page={alphaPage}
              totalPages={totalAlphaPages}
              onChangePage={setAlphaPage}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </TitleCard>
    </div>
  );
}

export default EmployeeWarningLetters;
