import { useCallback, useRef, useState } from "react";

const popupStyles = {
  warning: {
    header: "from-red-500 to-red-600",
    border: "border-red-200 dark:border-red-900/60",
    panel: "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30",
    badge: "badge-error",
    button: "border-none bg-red-500 text-white hover:bg-red-600",
    icon: "!",
  },
  info: {
    header: "from-blue-500 to-blue-600",
    border: "border-blue-200 dark:border-blue-900/60",
    panel: "border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/30",
    badge: "badge-info",
    button: "border-none bg-blue-500 text-white hover:bg-blue-600",
    icon: "i",
  },
};

function useAppPopup() {
  const [popupState, setPopupState] = useState(null);
  const resolverRef = useRef(null);

  const closePopup = useCallback((result) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
    setPopupState(null);
  }, []);

  const openPopup = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setPopupState({
        type: "alert",
        variant: "warning",
        title: "Pemberitahuan",
        message: "",
        confirmLabel: "Mengerti",
        cancelLabel: "Batal",
        ...options,
      });
    });
  }, []);

  const alertPopup = useCallback(
    (options) => openPopup({ ...options, type: "alert" }),
    [openPopup],
  );

  const confirmPopup = useCallback(
    (options) => openPopup({ ...options, type: "confirm" }),
    [openPopup],
  );

  const AppPopup = popupState ? (
    <div className="modal modal-open backdrop-blur-sm">
      <div
        className={`modal-box max-w-xl overflow-hidden rounded-3xl border p-0 shadow-2xl ${
          popupStyles[popupState.variant]?.border || popupStyles.warning.border
        }`}
      >
        <div
          className={`bg-gradient-to-r px-6 py-5 text-white ${
            popupStyles[popupState.variant]?.header || popupStyles.warning.header
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black shadow-md">
              {popupStyles[popupState.variant]?.icon || popupStyles.warning.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold">{popupState.title}</h3>
              <p className="mt-1 text-sm opacity-90">
                {popupState.subtitle || "Perlu konfirmasi sebelum melanjutkan"}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div
            className={`mb-5 rounded-2xl border p-4 ${
              popupStyles[popupState.variant]?.panel || popupStyles.warning.panel
            }`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div
                className={`badge badge-lg ${
                  popupStyles[popupState.variant]?.badge ||
                  popupStyles.warning.badge
                }`}
              >
                {popupState.badge || "Notifikasi"}
              </div>
            </div>
            <div className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
              {String(popupState.message || "")
                .split("\n")
                .map((line, index) => (
                  <p key={`${line}-${index}`}>{line || "\u00a0"}</p>
                ))}
            </div>
          </div>
          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            {popupState.type === "confirm" ? (
              <button
                type="button"
                className="btn btn-outline rounded-xl"
                onClick={() => closePopup(false)}
              >
                {popupState.cancelLabel || "Batal"}
              </button>
            ) : null}
            <button
              type="button"
              className={`btn rounded-xl ${
                popupStyles[popupState.variant]?.button ||
                popupStyles.warning.button
              }`}
              onClick={() => closePopup(true)}
            >
              {popupState.confirmLabel || "Mengerti"}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return { popup: AppPopup, alertPopup, confirmPopup };
}

export default useAppPopup;
