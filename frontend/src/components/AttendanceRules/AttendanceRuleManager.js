import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  setPageTitle,
  showNotification,
} from "../../features/common/headerSlice";
import TitleCard from "../Cards/TitleCard";

const normalizeSanctionLevel = (value) => {
  const raw = String(value || "").toLowerCase().trim();
  if (!raw) return "";
  if (raw === "none" || raw === "0" || raw === "-") return "none";

  if (/^\d+$/.test(raw)) {
    return `sp${Number.parseInt(raw, 10)}`;
  }

  const spMatch = raw.match(/^sp\s*[-_]?\s*(\d+)$/i);
  if (spMatch) {
    return `sp${Number.parseInt(spMatch[1], 10)}`;
  }

  const slug = raw
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return slug || "";
};

const formatSanctionLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw || raw.toLowerCase() === "none") return "Tidak Ada SP";
  const spMatch = raw.match(/^\s*sp\s*[-_]?\s*(\d+)\s*$/i);
  if (spMatch) return `SP${spMatch[1]}`;
  return raw.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const toDateInputValue = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyForm = () => ({
  rule_code: "",
  rule_name: "",
  description: "",
  min_consecutive_alpha: "",
  min_consecutive_late: "",
  min_accumulated_alpha: "",
  min_accumulated_late: "",
  sanction_level: "",
  recommendation: "",
  effective_date: toDateInputValue(new Date()),
  is_active: true,
  notes: "",
});

function AttendanceRuleManager({ pageTitle, subtitle, apiClient }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rules, setRules] = useState([]);
  const [search, setSearch] = useState("");
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const formContainerRef = useRef(null);
  const toggleButtonRef = useRef(null);

  useEffect(() => {
    if (showForm) {
      // scroll to the form when opened
      formContainerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      // scroll back to the toggle button when closed
      toggleButtonRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [showForm]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiClient.getAttendanceWarningRules();
      setRules(response?.data || []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    dispatch(setPageTitle({ title: pageTitle }));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rules;

    return rules.filter((item) => {
      const haystack = [
        item.rule_code,
        item.rule_name,
        item.description,
        item.min_consecutive_late,
        item.min_accumulated_late,
        item.recommendation,
        item.notes,
        item.sanction_level,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      return haystack.includes(query);
    });
  }, [rules, search]);

  const activeRuleCount = useMemo(
    () => rules.filter((item) => item.is_active).length,
    [rules],
  );

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleStartCreate = () => {
    setEditingRuleId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingRuleId(null);
    setForm(emptyForm());
    setShowForm(false);
  };

  const handleEdit = (rule) => {
    setEditingRuleId(rule.id);
    setForm({
      rule_code: rule.rule_code || "",
      rule_name: rule.rule_name || "",
      description: rule.description || "",
      min_consecutive_alpha: String(rule.min_consecutive_alpha ?? ""),
      min_consecutive_late: String(rule.min_consecutive_late ?? ""),
      min_accumulated_alpha: String(rule.min_accumulated_alpha ?? ""),
      min_accumulated_late: String(rule.min_accumulated_late ?? ""),
      sanction_level: rule.sanction_level || "",
      recommendation: rule.recommendation || "",
      effective_date: toDateInputValue(rule.effective_date),
      is_active: Boolean(rule.is_active),
      notes: rule.notes || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const normalizedSanctionLevel = normalizeSanctionLevel(
        form.sanction_level,
      );
      if (!normalizedSanctionLevel) {
        throw new Error("Level sanksi wajib diisi");
      }

      const payload = {
        rule_code: form.rule_code.trim(),
        rule_name: form.rule_name.trim(),
        description: form.description.trim(),
        min_consecutive_alpha: Number(form.min_consecutive_alpha || 0),
        min_consecutive_late: Number(form.min_consecutive_late || 0),
        min_accumulated_alpha: Number(form.min_accumulated_alpha || 0),
        min_accumulated_late: Number(form.min_accumulated_late || 0),
        sanction_level: normalizedSanctionLevel,
        recommendation: form.recommendation.trim(),
        effective_date: form.effective_date,
        is_active: form.is_active ? 1 : 0,
        notes: form.notes.trim(),
      };

      const result = editingRuleId
        ? await apiClient.updateAttendanceWarningRule(editingRuleId, payload)
        : await apiClient.createAttendanceWarningRule(payload);

      dispatch(
        showNotification({
          message: result?.message || "Aturan berhasil disimpan",
          status: 1,
        }),
      );

      await loadData();
      setEditingRuleId(null);
      setForm(emptyForm());
      setShowForm(false);
    } catch (saveError) {
      setError(saveError.message);
      dispatch(showNotification({ message: saveError.message, status: 0 }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (rule) => {
    setDeletingRule(rule);
  };
  const confirmDelete = async () => {
    if (!deletingRule) return;

    try {
      setSaving(true);
      setError("");

      const result = await apiClient.deleteAttendanceWarningRule(
        deletingRule.id,
      );

      dispatch(
        showNotification({
          message: result?.message || "Aturan berhasil dihapus",
          status: 1,
        }),
      );

      await loadData();
      setDeletingRule(null);
      handleStartCreate();
    } catch (deleteError) {
      setError(deleteError.message);
      dispatch(showNotification({ message: deleteError.message, status: 0 }));
    } finally {
      setSaving(false);
    }
  };

  const [viewingRule, setViewingRule] = useState(null);
  const [deletingRule, setDeletingRule] = useState(null);

  const handleView = (rule) => {
    setViewingRule(rule);
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        Memuat aturan peringatan kehadiran...
      </div>
    );
  }

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

      <div ref={formContainerRef}>
        <TitleCard
          title={editingRuleId ? "Ubah Aturan" : "Buat Aturan Baru"}
          TopSideButtons={
            <button
              ref={toggleButtonRef}
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => {
                if (showForm) {
                  handleCloseForm();
                } else {
                  handleStartCreate();
                }
              }}
            >
              {showForm ? "Tutup Form" : "Aturan Baru"}
            </button>
          }
          topMargin="mt-0"
        >
          {showForm && (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="form-control">
                <span className="label-text">Kode Aturan</span>
                <input
                  className="input input-bordered"
                  value={form.rule_code}
                  onChange={(event) =>
                    handleChange("rule_code", event.target.value)
                  }
                  placeholder="Kosongkan untuk auto-generate"
                />
              </label>

              <label className="form-control">
                <span className="label-text">Nama Aturan</span>
                <input
                  className="input input-bordered"
                  value={form.rule_name}
                  onChange={(event) =>
                    handleChange("rule_name", event.target.value)
                  }
                  required
                />
              </label>

              <label className="form-control md:col-span-2">
                <span className="label-text">Deskripsi</span>
                <textarea
                  className="textarea textarea-bordered min-h-[96px]"
                  value={form.description}
                  onChange={(event) =>
                    handleChange("description", event.target.value)
                  }
                  placeholder="Jelaskan konteks aturan ini"
                />
              </label>

              <label className="form-control">
                <span className="label-text">Minimal Alpha Berturut</span>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered"
                  value={form.min_consecutive_alpha}
                  onChange={(event) =>
                    handleChange("min_consecutive_alpha", event.target.value)
                  }
                  required
                />
              </label>

              <label className="form-control">
                <span className="label-text">Minimal Alpha Akumulasi</span>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered"
                  value={form.min_accumulated_alpha}
                  onChange={(event) =>
                    handleChange("min_accumulated_alpha", event.target.value)
                  }
                  required
                />
              </label>

              <label className="form-control">
                <span className="label-text">Minimal Telat Berturut</span>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered"
                  value={form.min_consecutive_late}
                  onChange={(event) =>
                    handleChange("min_consecutive_late", event.target.value)
                  }
                />
              </label>

              <label className="form-control">
                <span className="label-text">Minimal Telat Akumulasi</span>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered"
                  value={form.min_accumulated_late}
                  onChange={(event) =>
                    handleChange("min_accumulated_late", event.target.value)
                  }
                />
              </label>

              <label className="form-control">
                <span className="label-text">Level Sanksi</span>
                <input
                  className="input input-bordered"
                  value={form.sanction_level}
                  onChange={(event) =>
                    handleChange("sanction_level", event.target.value)
                  }
                  onBlur={() =>
                    handleChange(
                      "sanction_level",
                      normalizeSanctionLevel(form.sanction_level),
                    )
                  }
                  placeholder="Ketik level, contoh: 1, SP1, SP4, evaluasi_hr"
                  required
                />
                <span className="label-text-alt opacity-70">
                  Otomatis dinormalisasi, misal "4" jadi "sp4"
                </span>
              </label>

              <label className="form-control">
                <span className="label-text">Tanggal Pemberlakuan</span>
                <input
                  type="date"
                  className="input input-bordered"
                  value={form.effective_date}
                  onChange={(event) =>
                    handleChange("effective_date", event.target.value)
                  }
                  required
                />
              </label>

              <label className="form-control md:col-span-2">
                <span className="label-text">Rekomendasi Tindak Lanjut</span>
                <textarea
                  className="textarea textarea-bordered min-h-[96px]"
                  value={form.recommendation}
                  onChange={(event) =>
                    handleChange("recommendation", event.target.value)
                  }
                  placeholder="Saran tindak lanjut ketika aturan ini tercapai"
                />
              </label>

              <label className="form-control md:col-span-2">
                <span className="label-text">Catatan Tambahan</span>
                <textarea
                  className="textarea textarea-bordered min-h-[80px]"
                  value={form.notes}
                  onChange={(event) =>
                    handleChange("notes", event.target.value)
                  }
                />
              </label>

              <label className="label cursor-pointer justify-start gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={form.is_active}
                  onChange={(event) =>
                    handleChange("is_active", event.target.checked)
                  }
                />
                <span className="label-text">Aturan aktif</span>
              </label>

              <div className="md:col-span-2 flex gap-2 flex-wrap">
                <button
                  type="submit"
                  className={`btn btn-primary ${saving ? "loading" : ""}`}
                  disabled={saving}
                >
                  {editingRuleId ? "Simpan Perubahan" : "Simpan Aturan"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleStartCreate}
                >
                  Reset Form
                </button>
              </div>
            </form>
          )}
        </TitleCard>
      </div>

      <TitleCard title="Aturan Peringatan Kehadiran" topMargin="mt-0">
        <p className="text-sm opacity-75 mb-4">{subtitle}</p>
        <div className="grid gap-3 md:grid-cols-3 mb-4">
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">Total Aturan</div>
              <div className="stat-value text-primary">{rules.length}</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">Aturan Aktif</div>
              <div className="stat-value text-success">{activeRuleCount}</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">Aturan Nonaktif</div>
              <div className="stat-value text-warning">
                {rules.length - activeRuleCount}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="search"
            className="input input-bordered w-full md:max-w-md"
            placeholder="Cari kode, nama, atau rekomendasi"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Aturan</th>
                <th>Ambang Alpha</th>
                <th>Ambang Telat</th>
                <th>Rekomendasi</th>
                <th>Level</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center opacity-60">
                    Belum ada aturan peringatan kehadiran
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.rule_code}</td>
                    <td>
                      <div className="font-medium">{rule.rule_name}</div>
                      <div className="text-xs opacity-70">
                        {rule.description || "-"}
                      </div>
                    </td>
                    <td>
                      <div>
                        {Number(rule.min_consecutive_alpha || 0)} berturut /{" "}
                        {Number(rule.min_accumulated_alpha || 0)} akumulasi
                      </div>
                    </td>
                    <td>
                      <div>
                        {Number(rule.min_consecutive_late || 0)} berturut /{" "}
                        {Number(rule.min_accumulated_late || 0)} akumulasi
                      </div>
                    </td>
                    <td className="max-w-xs">
                      <div
                        className="truncate"
                        title={rule.recommendation || "-"}
                      >
                        {rule.recommendation || "-"}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline">
                        {formatSanctionLabel(rule.sanction_level)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${rule.is_active ? "badge-success" : "badge-ghost"}`}
                      >
                        {rule.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        <button
                           className="
        px-3 py-1 text-xs
        bg-gradient-to-b from-blue-400 to-blue-600
        text-white rounded-full
        shadow-md hover:shadow-lg
        border border-blue-600
        hover:from-blue-500 hover:to-blue-700
        transition-all duration-200"
                          onClick={() => handleView(rule)}
                        >
                          Lihat
                        </button>
                        <button
                          className="
    px-3 py-1 text-xs
    bg-gradient-to-b from-yellow-300 to-yellow-500
    text-black rounded-full
    shadow-md hover:shadow-lg
    border border-yellow-500
    hover:from-yellow-400 hover:to-yellow-600
    transition-all duration-200"
                          onClick={() => handleEdit(rule)}
                        >
                          Ubah
                        </button>
                        <button
                          className="btn btn-xs btn-error text-white rounded-full"
                          onClick={() => handleDelete(rule)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TitleCard>
      {viewingRule && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl p-0 rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* HEADER */}
            <div className="bg-primary text-primary-content px-6 py-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-xl">
                    Detail Aturan Peringatan
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    {viewingRule.rule_name} — {viewingRule.rule_code}
                  </p>
                </div>
              </div>
            </div>

            {/* BODY */}
            <div className="p-6 bg-base-100 space-y-5 overflow-y-auto flex-1">
              <div className="p-4 rounded-xl bg-base-200 border border-base-300">
                <div className="text-xs font-semibold opacity-60 mb-1">
                  Deskripsi
                </div>
                <p className="text-sm leading-relaxed">
                  {viewingRule.description || "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Ambang Alpha</h4>
                    <span className="badge badge-error badge-outline">
                      Alpha
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-70">Berturut-turut</span>
                      <span className="font-bold">
                        {Number(viewingRule.min_consecutive_alpha || 0)} kali
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Akumulasi</span>
                      <span className="font-bold">
                        {Number(viewingRule.min_accumulated_alpha || 0)} kali
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Ambang Telat</h4>
                    <span className="badge badge-warning badge-outline">
                      Telat
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-70">Berturut-turut</span>
                      <span className="font-bold">
                        {Number(viewingRule.min_consecutive_late || 0)} kali
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Akumulasi</span>
                      <span className="font-bold">
                        {Number(viewingRule.min_accumulated_late || 0)} kali
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-base-200 p-4">
                  <div className="text-xs opacity-60 mb-1">Level Sanksi</div>
                  <span className="badge badge-primary">
                    {formatSanctionLabel(viewingRule.sanction_level)}
                  </span>
                </div>

                <div className="rounded-xl bg-base-200 p-4">
                  <div className="text-xs opacity-60 mb-1">
                    Tanggal Pemberlakuan
                  </div>
                  <div className="font-semibold">
                    {toDateInputValue(viewingRule.effective_date) || "-"}
                  </div>
                </div>

                <div className="rounded-xl bg-base-200 p-4">
                  <div className="text-xs opacity-60 mb-1">Status</div>
                  <span
                    className={`badge ${
                      viewingRule.is_active ? "badge-success" : "badge-ghost"
                    }`}
                  >
                    {viewingRule.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-base-300 p-4">
                <div className="text-xs font-semibold opacity-60 mb-1">
                  Rekomendasi Tindak Lanjut
                </div>
                <p className="text-sm leading-relaxed">
                  {viewingRule.recommendation || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-base-300 p-4">
                <div className="text-xs font-semibold opacity-60 mb-1">
                  Catatan Tambahan
                </div>
                <p className="text-sm leading-relaxed">
                  {viewingRule.notes || "-"}
                </p>
              </div>

              {/* ACTION */}
              <div className="modal-action border-t border-base-300 pt-4">
                <button
                  className="btn btn-ghost"
                  onClick={() => setViewingRule(null)}
                >
                  Tutup
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    handleEdit(viewingRule);
                    setViewingRule(null);
                  }}
                >
                  Ubah Aturan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deletingRule && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-0 overflow-hidden rounded-2xl">
            <div className="bg-error text-error-content px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-error-content/20 flex items-center justify-center text-2xl">
                  !
                </div>

                <div>
                  <h3 className="font-bold text-xl">Hapus Aturan?</h3>
                  <p className="text-sm opacity-90">
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-base-100 space-y-4">
              <div className="rounded-xl border border-base-300 bg-base-200 p-4">
                <div className="text-xs opacity-60 mb-1">
                  Aturan yang akan dihapus
                </div>
                <div className="font-bold text-base">
                  {deletingRule.rule_name}
                </div>
                <div className="text-sm opacity-70 mt-1">
                  Kode: {deletingRule.rule_code}
                </div>
              </div>

              <p className="text-sm leading-relaxed opacity-80">
                Apakah kamu yakin ingin menghapus aturan ini dari daftar aturan
                peringatan kehadiran?
              </p>

              <div className="modal-action border-t border-base-300 pt-4">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setDeletingRule(null)}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="button"
                  className={`btn btn-error ${saving ? "loading" : ""}`}
                  onClick={confirmDelete}
                  disabled={saving}
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceRuleManager;
