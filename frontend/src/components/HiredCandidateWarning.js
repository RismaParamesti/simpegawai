import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

const getCandidateLabel = (item) =>
  item?.candidateName ||
  item?.candidate_name ||
  item?.name ||
  item?.email ||
  "Kandidat";

const getJobLabel = (item) =>
  item?.hiredJobLabel || item?.jobTitle || item?.job_title || "-";

const getWarningKey = (items) =>
  (items || [])
    .map((item) => `${getCandidateLabel(item)}:${getJobLabel(item)}`)
    .join("|");

const normalizeWarnings = (items = []) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = `${getCandidateLabel(item)}:${getJobLabel(item)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export default function HiredCandidateWarning({
  items = [],
  title = "Ada kandidat yang sudah lolos",
  description = "Kandidat berikut sudah tercatat lolos pada daftar kandidat yang lolos. Jadikan kandidat tersebut tidak lolos pada proses ini agar tidak diproses ulang.",
}) {
  const warnings = useMemo(() => normalizeWarnings(items), [items]);
  const warningKey = useMemo(() => getWarningKey(warnings), [warnings]);
  const [showPopup, setShowPopup] = useState(false);
  const [dismissedKey, setDismissedKey] = useState("");

  useEffect(() => {
    if (warnings.length > 0 && warningKey && dismissedKey !== warningKey) {
      setShowPopup(true);
    }
  }, [dismissedKey, warningKey, warnings.length]);

  if (warnings.length === 0) return null;

  const closePopup = () => {
    setDismissedKey(warningKey);
    setShowPopup(false);
  };

  return (
    <>
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-200 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">{title}</p>
            <p className="mt-1 text-sm font-medium">{description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {warnings.slice(0, 4).map((item, index) => (
                <span
                  key={`${getCandidateLabel(item)}-${getJobLabel(item)}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-bold text-amber-800 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-100"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {getCandidateLabel(item)} - {getJobLabel(item)}
                </span>
              ))}
              {warnings.length > 4 && (
                <span className="inline-flex rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-bold text-amber-800 dark:border-amber-700 dark:bg-slate-900 dark:text-amber-100">
                  +{warnings.length - 4} lainnya
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-2xl dark:border-amber-800 dark:bg-slate-950">
            <div className="flex items-start gap-3 border-b border-amber-100 bg-amber-50 px-5 py-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-200 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-extrabold">{title}</h3>
                <p className="mt-1 text-sm font-semibold">{description}</p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={closePopup}
                aria-label="Tutup peringatan"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[50vh] space-y-2 overflow-auto px-5 py-5">
              {warnings.map((item, index) => (
                <div
                  key={`${getCandidateLabel(item)}-${getJobLabel(item)}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900"
                >
                  <p className="font-extrabold text-slate-900 dark:text-slate-50">
                    {getCandidateLabel(item)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Sudah lolos pada lowongan: {getJobLabel(item)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t border-slate-200 px-5 py-4 dark:border-slate-700">
              <button
                type="button"
                className="btn rounded-xl !border-none !bg-amber-500 !text-white hover:!bg-amber-600"
                onClick={closePopup}
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
