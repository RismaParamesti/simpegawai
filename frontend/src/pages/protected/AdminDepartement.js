import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPageTitle } from "../../features/common/headerSlice";
import TitleCard from "../../components/Cards/TitleCard";

const configuredApiUrl = process.env.REACT_APP_API_URL;
const configuredBaseUrl =
  process.env.REACT_APP_BASE_URL || "http://localhost:5000";
const normalizedApiRoot = (
  configuredApiUrl || `${configuredBaseUrl}/api`
).replace(/\/$/, "");
const API_BASE_URL = normalizedApiRoot.endsWith("/api")
  ? normalizedApiRoot
  : `${normalizedApiRoot}/api`;
const DEPARTMENTS_ENDPOINT = `${API_BASE_URL}/employees/departments`;

const getErrorMessage = async (response, fallbackMessage) => {
  try {
    const errorData = await response.json();
    return errorData.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

function AdminDepartement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    status: "active",
  });

  // Fetch departments from API
  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(DEPARTMENTS_ENDPOINT, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Failed to fetch departments",
        );
        throw new Error(message);
      }

      const data = await response.json();
      setDepartments(data.data || []);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching departments:", error);
      setErrorMessage("Gagal memuat data departemen");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: "Manajemen Jabatan" }));
    fetchDepartments();
  }, [dispatch]);

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
      code: "",
      name: "",
      description: "",
      status: "active",
    });

    setShowModal(true);
  };

  const handleEditDepartment = (department) => {
    setIsEditMode(true);
    setSelectedId(department.id);

    setForm({
      code: department.code,
      name: department.name,
      description: department.description,
      status: department.status,
    });

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setSelectedId(null);

    setForm({
      code: "",
      name: "",
      description: "",
      status: "active",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const endpoint = isEditMode
        ? `${DEPARTMENTS_ENDPOINT}/${selectedId}`
        : DEPARTMENTS_ENDPOINT;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Failed to save department",
        );
        throw new Error(message);
      }

      await fetchDepartments();
      setSuccessMessage(
        isEditMode
          ? "Departemen berhasil diperbarui"
          : "Departemen berhasil ditambahkan",
      );
      handleCloseModal();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage(error.message || "Terjadi kesalahan saat menyimpan");
    }
  };

  const handleDeleteDepartment = (department) => {
    setSelectedDelete(department);
    setShowDeleteModal(true);
  };

  const confirmDeleteDepartment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${DEPARTMENTS_ENDPOINT}/${selectedDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Failed to delete department",
        );
        throw new Error(message);
      }

      await fetchDepartments();
      setSuccessMessage("Departemen berhasil dihapus");
      setShowDeleteModal(false);
      setSelectedDelete(null);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting department:", error);
      setErrorMessage(error.message || "Terjadi kesalahan saat menghapus");
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedDelete(null);
  };

  const TopSideButtons = (
    <button className="btn btn-primary btn-sm" onClick={handleOpenModal}>
      Tambah Departemen
    </button>
  );

  return (
    <div>
      {errorMessage && (
        <div className="alert alert-error mb-4 shadow-lg">
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success mb-4 shadow-lg">
          <span>{successMessage}</span>
        </div>
      )}

      <TitleCard title="Daftar Departemen" TopSideButtons={TopSideButtons}>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-base-content/50">
              Tidak ada departemen tersedia
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {departments.map((department) => (
              <div
                key={department.id}
                className="border border-base-300 rounded-xl p-4 bg-base-100 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-base-content leading-tight">
                      {department.name}
                    </h2>

                    <p className="text-sm text-base-content/50 mt-1">
                      ID: {department.code}
                    </p>
                  </div>

                  <span
                    className={`badge shrink-0 ${
                      department.status === "active"
                        ? "badge-success"
                        : "badge-error"
                    }`}
                  >
                    {department.status === "active" ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-[2px] border-t border-base-300 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/70">
                      Jumlah Pegawai:
                    </span>

                    <span className="text-lg font-semibold text-base-content">
                      {department.totalEmployees || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/70">
                      Jumlah Posisi:
                    </span>

                    <span className="text-lg font-semibold text-base-content">
                      {department.totalPositions || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/70">
                      Dibuat:
                    </span>

                    <span className="text-base font-semibold text-base-content">
                      {new Date(department.created_at).toLocaleDateString(
                        "id-ID",
                      )}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    className="btn btn-primary btn-xs px-5 text-white"
                    onClick={() => navigate(`/app/positions/${department.id}`)}
                  >
                    Lihat
                  </button>

                  <button
                    className="btn btn-xs px-5 text-black border-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, #fde047, #eab308)",
                    }}
                    onClick={() => handleEditDepartment(department)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-error btn-xs px-5 text-white"
                    onClick={() => handleDeleteDepartment(department)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </TitleCard>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl p-0 rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-primary text-primary-content px-6 py-5 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl">
                    {isEditMode ? "Edit Departemen" : "Tambah Departemen"}
                  </h3>

                  <p className="text-sm opacity-90 mt-1">
                    {isEditMode
                      ? "Perbarui data departemen"
                      : "Lengkapi data departemen baru"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-base-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Kode Departemen
                    </span>
                  </label>

                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Contoh: 01"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">
                      Nama Departemen
                    </span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Contoh: Human Resource"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Deskripsi</span>
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full min-h-28"
                  placeholder="Masukkan deskripsi departemen"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Status</span>
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>

              <div className="modal-action border-t pt-5 sticky bottom-0 bg-base-100 pb-1">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCloseModal}
                >
                  Batal
                </button>

                <button type="submit" className="btn btn-primary">
                  {isEditMode ? "Simpan Perubahan" : "Simpan Departemen"}
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
                  <h3 className="font-bold text-xl">Hapus Departemen</h3>

                  <p className="text-sm opacity-90 mt-1">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-base-200 rounded-xl p-4">
                <p className="text-sm text-base-content/60">
                  Departemen yang akan dihapus:
                </p>

                <h2 className="text-xl font-bold mt-2">
                  {selectedDelete?.name}
                </h2>

                <p className="text-sm text-base-content/50 mt-1">
                  ID: {selectedDelete?.code}
                </p>
              </div>

              <div className="alert alert-warning mt-5 text-sm">
                <span>
                  Data departemen dan Posisi yang ada pada departemen ini dapat
                  ikut terhapus.
                </span>
              </div>

              <div className="modal-action mt-6">
                <button className="btn btn-ghost" onClick={closeDeleteModal}>
                  Batal
                </button>

                <button
                  className="btn btn-error text-white"
                  onClick={confirmDeleteDepartment}
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

export default AdminDepartement;
