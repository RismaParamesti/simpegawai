import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setPageTitle,
  showNotification,
} from "../../features/common/headerSlice";
import TitleCard from "../../components/Cards/TitleCard";
import { adminApi } from "../../features/admin/api";

const isCommissionerPosition = (position = {}) => {
  const name = String(position.name || "")
    .toLowerCase()
    .trim();
  const level = String(position.level || "")
    .toLowerCase()
    .trim();

  return name.includes("commissioner") || level === "commissioner";
};

function AdminPosition() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { departmentId } = useParams();

  const [positions, setPositions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(null);

  const [departmentMeta, setDepartmentMeta] = useState({ code: "", name: "" });

  const [form, setForm] = useState({
    department_id: departmentId || null,
    name: "",
    level: "staff",
    status: "active",
  });

  const loadPositions = useCallback(async () => {
    try {
      setLoading(true);

      if (!departmentId) {
        setPositions([]);
        setDepartmentMeta({ code: "", name: "" });
        return;
      }

      const data = (await adminApi.getPositionsByDepartment)
        ? await adminApi.getPositionsByDepartment(departmentId)
        : await adminApi.getPositions();

      const positionsData = (data || []).filter(
        (position) => !isCommissionerPosition(position),
      );
      setPositions(positionsData);

      if (positionsData.length > 0) {
        setDepartmentMeta({
          code: positionsData[0].department_code || "",
          name: positionsData[0].department_name || "",
        });
      }
    } catch (err) {
      console.error("Error loading positions:", err);
      dispatch(showNotification({ message: err.message, status: 0 }));
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch, departmentId]);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Manajemen Posisi" }));
    loadPositions();
  }, [dispatch, loadPositions]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setForm({
      department_id: departmentId || null,
      name: "",
      level: "staff",
      status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = (position) => {
    setIsEditMode(true);
    setSelectedId(position.id);
    setForm({
      department_id: position.department_id,
      name: position.name,
      level: position.level,
      status: position.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setSelectedId(null);
    setForm({
      department_id: departmentId || null,
      name: "",
      level: "staff",
      status: "active",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = { ...form };

      if (isEditMode) {
        await adminApi.updatePosition(selectedId, payload);
        dispatch(
          showNotification({
            message: "Posisi berhasil diperbarui",
            status: 1,
          }),
        );
      } else {
        await adminApi.createPosition(payload);
        dispatch(
          showNotification({
            message: "Posisi berhasil ditambahkan",
            status: 1,
          }),
        );
      }

      handleCloseModal();
      await loadPositions();
    } catch (err) {
      dispatch(showNotification({ message: err.message, status: 0 }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (position) => {
    setSelectedDelete(position);
    setShowDeleteModal(true);
  };
  const confirmDeletePosition = async () => {
    try {
      await adminApi.deletePosition(selectedDelete.id);

      dispatch(
        showNotification({
          message: "Posisi berhasil dihapus",
          status: 1,
        }),
      );

      setShowDeleteModal(false);
      setSelectedDelete(null);

      await loadPositions();
    } catch (err) {
      dispatch(showNotification({ message: err.message, status: 0 }));
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedDelete(null);
  };

  const TopSideButtons = (
    <div className="flex items-center gap-2">
      <button className="btn btn-primary btn-sm" onClick={handleOpenModal}>
        Tambah Posisi
      </button>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate("/app/positions")}
      >
        Kembali
      </button>
    </div>
  );

  return (
    <div>
      <TitleCard
        title={`Posisi - ${departmentMeta.name || departmentMeta.code || ""}`}
        TopSideButtons={TopSideButtons}
      >
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Posisi</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {positions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center text-base-content/60 py-8"
                    >
                      Tidak ada posisi pada departemen ini
                    </td>
                  </tr>
                ) : (
                  positions.map((position, index) => (
                    <tr key={position.id}>
                      <td>{index + 1}</td>
                      <td>{position.name}</td>
                      <td>{position.level}</td>
                      <td>
                        <span
                          className={`badge ${
                            position.status === "active"
                              ? "badge-success"
                              : "badge-error"
                          }`}
                        >
                          {position.status === "active"
                            ? "Aktif"
                            : "Tidak Aktif"}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center gap-2">
                          <button
                            className="btn btn-warning btn-xs"
                            onClick={() => handleEdit(position)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => handleDelete(position)}
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
        )}
      </TitleCard>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl p-0 overflow-hidden rounded-2xl">
            <div className="bg-primary text-primary-content px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl">
                    {isEditMode ? "Edit Posisi" : "Tambah Posisi"}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    {isEditMode
                      ? "Perbarui data posisi yang dipilih"
                      : "Lengkapi data posisi baru"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-base-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Nama Posisi</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input input-bordered w-full focus:input-primary"
                    placeholder="Contoh: Software Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Level</span>
                  </label>
                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    className="select select-bordered w-full focus:select-primary"
                    required
                  >
                    <option value="staff">staff</option>
                    <option value="manager">manager</option>
                    <option value="director">director</option>
                    <option value="supervisor">supervisor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Status</span>
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="select select-bordered w-full focus:select-primary"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>

                <div className="bg-base-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-base-content/60">Preview Status</p>
                  <span
                    className={`badge mt-2 ${
                      form.status === "active" ? "badge-success" : "badge-error"
                    }`}
                  >
                    {form.status === "active" ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>
              </div>

              <div className="modal-action border-t pt-5">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCloseModal}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? "Menyimpan..."
                    : isEditMode
                      ? "Simpan Perubahan"
                      : "Simpan Posisi"}
                </button>
              </div>
            </form>
          </div>

          <div
            className="modal-backdrop bg-black/40"
            onClick={handleCloseModal}
          ></div>
        </div>
      )}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-0 overflow-hidden rounded-2xl">
            <div className="bg-error text-error-content px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                  ⚠️
                </div>

                <div>
                  <h3 className="font-bold text-xl">Hapus Posisi</h3>

                  <p className="text-sm opacity-90 mt-1">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-base-200 rounded-xl p-4">
                <p className="text-sm text-base-content/60">
                  Posisi yang akan dihapus:
                </p>

                <h2 className="text-xl font-bold mt-2">
                  {selectedDelete?.name}
                </h2>

                <p className="text-sm text-base-content/50 mt-1">
                  Level: {selectedDelete?.level}
                </p>
              </div>

              <div className="alert alert-warning mt-5 text-sm">
                <span>
                  Semua data yang berkaitan dengan posisi ini dapat ikut
                  terhapus.
                </span>
              </div>

              <div className="modal-action mt-6">
                <button className="btn btn-ghost" onClick={closeDeleteModal}>
                  Batal
                </button>

                <button
                  className="btn btn-error text-white"
                  onClick={confirmDeletePosition}
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>

          <div
            className="modal-backdrop bg-black/40"
            onClick={closeDeleteModal}
          ></div>
        </div>
      )}
    </div>
  );
}

export default AdminPosition;
