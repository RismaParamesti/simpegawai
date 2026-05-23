import React, { useEffect, useState } from "react";
import axios from "axios";
import { NotificationManager } from "react-notifications";

export default function InterviewModal({
  isFormOpen,
  isCancelOpen,
  isDetailOpen = false,
  onCloseForm,
  onCloseCancel,
  selectedCandidate,
  form,
  setForm,
  mode,
  cancelNotes,
  setCancelNotes,
  onSubmit,
  onCancelSubmit,
}) {
  const [currentEmployeeId, setCurrentEmployeeId] = useState("");
  const [detailCandidate, setDetailCandidate] = useState(null);

  // Fetch detail kandidat/interview dari backend saat popup detail dibuka ATAU saat form atur ulang dibuka
  useEffect(() => {
    const shouldFetch =
      (isDetailOpen || (isFormOpen && mode === "update")) &&
      selectedCandidate?.id;
    if (shouldFetch) {
      let url = "";
      if (selectedCandidate.application_id) {
        url = `/api/candidates/admin/applications/${selectedCandidate.application_id}`;
      } else {
        url = `/api/candidates/interviews/${selectedCandidate.id}`;
      }
      axios
        .get(url)
        .then((res) => {
          if (res.data && (res.data.application || res.data.interview)) {
            setDetailCandidate(res.data.application || res.data.interview);
          } else {
            setDetailCandidate(selectedCandidate);
          }
        })
        .catch((err) => {
          setDetailCandidate(selectedCandidate);
          // eslint-disable-next-line no-console
          console.error("[InterviewModal] Detail fetch error:", err);
        });
    } else if (!isDetailOpen && !(isFormOpen && mode === "update")) {
      setDetailCandidate(null);
    }
  }, [isDetailOpen, isFormOpen, mode, selectedCandidate]);
  const formatDateOnly = (date) => {
    return date
      ? new Date(date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";
  };

  // Tampilkan nama lowongan dan posisi dalam format "nama lowongan - posisi"
  const formatJobAndPos = (candidate) => {
    const c = candidate || {};
    if (Object.keys(c).length === 0) return "-";
    const name =
      c.job_title ||
      c.job_opening_title ||
      c.title ||
      (c.job_opening && c.job_opening.title) ||
      "";
    const pos =
      c.base_position ||
      c.position_name ||
      (c.job_opening && c.job_opening.base_position) ||
      "";
    if (!name && !pos) return "-";
    if (name && pos) return `${name} - ${pos}`;
    return name || pos;
  };

  // Ambil employee aktif saat modal dibuka, lalu isi interviewer otomatis
  useEffect(() => {
    if (!isFormOpen) return;
    axios
      .get("/api/profile")
      .then((res) => {
        const employeeId = res?.data?.employee?.id || "";
        setCurrentEmployeeId(employeeId);
        if (employeeId) {
          setForm((prev) => ({ ...prev, interviewer_id: employeeId }));
        }
      })
      .catch(() => {
        setCurrentEmployeeId("");
      });
    // eslint-disable-next-line
  }, [isFormOpen]);

  // Tidak perlu update interviewer berdasarkan interview_stage lagi

  // Helper untuk format ke YYYY-MM-DDTHH:mm agar input datetime-local bisa terisi
  function toDatetimeLocal(val) {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => n.toString().padStart(2, "0");
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  // Prefill form saat mode update dan modal dibuka
  useEffect(() => {
    if (isFormOpen && mode === "update" && selectedCandidate) {
      // Ambil data employee interviewer jika ada interviewer_id
      const fetchInterviewer = async () => {
        let departmentName =
          selectedCandidate.interview_stage ||
          selectedCandidate.department_name ||
          "";
        let interviewerId = selectedCandidate.interviewer_id || "";
        if (interviewerId) {
          try {
            const res = await axios.get(`/api/employees/${interviewerId}`);
            if (res.data && res.data.employee) {
              departmentName =
                res.data.employee.department_name || departmentName;
            }
          } catch (e) {
            /* fallback ke data lama */
          }
        }
        setForm({
          scheduled_date: toDatetimeLocal(
            selectedCandidate.scheduled_date || selectedCandidate.date,
          ),
          interview_stage: departmentName,
          interviewer_id: currentEmployeeId || interviewerId,
          duration_minutes: selectedCandidate.duration_minutes || "",
          interview_type: selectedCandidate.interview_type || "online",
          meeting_link: selectedCandidate.meeting_link || "",
          location: selectedCandidate.location || "",
        });
      };
      fetchInterviewer();
    }
    // eslint-disable-next-line
  }, [isFormOpen, mode, selectedCandidate, currentEmployeeId]);

  const handleFormSubmit = () => {
    // Pastikan scheduled_date ada dan tidak sebelum sekarang
    if (!form.scheduled_date) {
      NotificationManager.error(
        "Tanggal & waktu harus diisi",
        "Validasi Gagal",
        3000,
      );
      return;
    }
    const selected = new Date(form.scheduled_date);
    const now = new Date();
    if (isNaN(selected.getTime())) {
      NotificationManager.error(
        "Format tanggal/waktu tidak valid",
        "Validasi Gagal",
        3000,
      );
      return;
    }
    if (selected < now) {
      NotificationManager.error(
        "Tanggal & waktu tidak boleh sebelum saat ini",
        "Validasi Gagal",
        4000,
      );
      return;
    }

    const selHour = selected.getHours();
    const selMin = selected.getMinutes();
    if (selHour < 7 || selHour > 20 || (selHour === 20 && selMin > 0)) {
      NotificationManager.error(
        "Waktu wawancara harus antara 07:00 dan 20:00",
        "Validasi Gagal",
        5000,
      );
      return;
    }

    // Passed validation -> submit
    if (typeof onSubmit === "function") onSubmit();
  };

  return (
    <>
      {/* ================= MODAL FORM (ASLI) ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-xl w-full max-w-3xl shadow-lg overflow-y-auto max-h-[80vh]">
            <h3 className="font-bold text-lg mb-4">
              {mode === "create"
                ? "Buat Jadwal Wawancara"
                : "Atur Ulang Jadwal Wawancara"}
            </h3>

            {/* PROFILE KANDIDAT */}
            <div className="rounded-xl border border-base-300 p-4 mb-5">
              <div className="flex flex-col items-center mb-4">
                <div className="avatar mb-3">
                  <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      src={(() => {
                        // Prioritaskan photo_file dari detailCandidate jika ada, lalu selectedCandidate
                        const photo =
                          (detailCandidate?.photo_file ??
                            selectedCandidate?.photo_file) ||
                          "";
                        if (
                          photo &&
                          photo !== "-" &&
                          photo !== "null" &&
                          photo !== null &&
                          photo !== undefined &&
                          photo !== ""
                        ) {
                          return photo.startsWith("http")
                            ? photo
                            : `http://localhost:5000/${photo.replace(/^\//, "")}`;
                        }
                        // Fallback ke nama
                        const name =
                          detailCandidate?.name ||
                          detailCandidate?.candidate_name ||
                          selectedCandidate?.name ||
                          selectedCandidate?.candidate_name ||
                          "-";
                        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
                      })()}
                      alt={
                        detailCandidate?.name ||
                        detailCandidate?.candidate_name ||
                        selectedCandidate?.name ||
                        selectedCandidate?.candidate_name ||
                        ""
                      }
                    />
                  </div>
                </div>

                <h2 className="font-bold text-md">
                  {detailCandidate?.name ||
                    detailCandidate?.candidate_name ||
                    selectedCandidate?.name ||
                    selectedCandidate?.candidate_name ||
                    "-"}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <p>
                  <span className="font-semibold">Jenis Kelamin:</span>{" "}
                  {detailCandidate?.gender || selectedCandidate?.gender || "-"}
                </p>
                <p>
                  <span className="font-semibold">Tanggal Lahir:</span>{" "}
                  {formatDateOnly(
                    detailCandidate?.date_of_birth ||
                      selectedCandidate?.date_of_birth,
                  )}
                </p>
                <p>
                  <span className="font-semibold">Pendidikan:</span>{" "}
                  {detailCandidate?.education_level ||
                    selectedCandidate?.education_level ||
                    "-"}
                </p>
                <p>
                  <span className="font-semibold">Jurusan:</span>{" "}
                  {detailCandidate?.major || selectedCandidate?.major || "-"}
                </p>
                <p>
                  <span className="font-semibold">Tahun Lulus:</span>{" "}
                  {detailCandidate?.graduation_year ||
                    selectedCandidate?.graduation_year ||
                    "-"}
                </p>
                <p>
                  <span className="font-semibold">NPWP:</span>{" "}
                  {detailCandidate?.npwp || selectedCandidate?.npwp || "-"}
                </p>
              </div>
            </div>

            {/* FORM */}
            <div className="grid gap-3">
              <div className="rounded-xl border border-base-300 bg-base-200/50 px-4 py-3 text-sm text-base-content/70">
                Interviewer akan terisi otomatis oleh HR.
              </div>
              <input
                type="datetime-local"
                className="input input-bordered"
                value={form.scheduled_date}
                min={toDatetimeLocal(new Date())}
                onChange={(e) =>
                  setForm({ ...form, scheduled_date: e.target.value })
                }
              />

              <input
                type="number"
                className="input input-bordered"
                placeholder="Durasi (menit)"
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm({ ...form, duration_minutes: e.target.value })
                }
              />

              <select
                className="select select-bordered"
                value={form.interview_type}
                onChange={(e) =>
                  setForm({ ...form, interview_type: e.target.value })
                }
              >
                <option value="online">Pilih tipe</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>

              {form.interview_type === "online" && (
                <input
                  type="text"
                  placeholder="Meeting Link"
                  className="input input-bordered"
                  value={form.meeting_link}
                  onChange={(e) =>
                    setForm({ ...form, meeting_link: e.target.value })
                  }
                />
              )}

              {form.interview_type === "offline" && (
                <input
                  type="text"
                  placeholder="Lokasi Interview"
                  className="input input-bordered"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button className="btn btn-ghost" onClick={onCloseForm}>
                Batal
              </button>

              <button className="btn btn-primary" onClick={handleFormSubmit}>
                {mode === "create" ? "Simpan Jadwal" : "Update Jadwal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL GUGURKAN KANDIDAT ================= */}
      {isCancelOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-2xl p-0 rounded-2xl max-h-[80vh] overflow-y-auto">
            <div className="bg-error text-error-content px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                  ⚠️
                </div>

                <div>
                  <h3 className="font-bold text-xl">Gugurkan Kandidat</h3>

                  <p className="text-sm opacity-90 mt-1">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-base-200 rounded-xl p-4">
                <p className="text-sm text-base-content/60">
                  Kandidat yang akan digugurkan:
                </p>

                <h2 className="text-xl font-bold mt-2">
                  {selectedCandidate?.name ||
                    selectedCandidate?.candidate_name ||
                    "-"}
                </h2>

                <p className="text-sm text-base-content/50 mt-1">
                  {formatJobAndPos(detailCandidate || selectedCandidate)}
                </p>
              </div>

              <div className="alert alert-warning mt-5 text-sm">
                <span>
                  Kandidat akan digugurkan dari proses rekrutmen. Tindakan ini
                  dilakukan apabila kandidat tidak memenuhi ketentuan proses
                  seleksi, seperti tidak hadir saat wawancara, tidak memberikan
                  konfirmasi, atau alasan lain.
                </span>
              </div>
              <div className="alert alert-warning mt-5 text-sm">
                <span>Apakah Anda yakin ingin melanjutkan?</span>
              </div>

              <div className="mt-5">
                <label className="label">
                  <span className="label-text font-medium">
                    Alasan pengguguran
                  </span>
                </label>

                <textarea
                  className="textarea textarea-bordered w-full min-h-28"
                  placeholder="Masukkan alasan pengguguran..."
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                />
              </div>

              <div className="modal-action mt-6">
                <button className="btn btn-ghost" onClick={onCloseCancel}>
                  Batal
                </button>

                <button
                  className="btn btn-error text-white"
                  onClick={onCancelSubmit}
                >
                  Ya, Gugurkan
                </button>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop bg-black/40"
            onClick={onCloseCancel}
          ></div>
        </div>
      )}
    </>
  );
}
