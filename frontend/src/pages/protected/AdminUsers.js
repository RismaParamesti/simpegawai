import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { setPageTitle } from "../../features/common/headerSlice";
import TitleCard from "../../components/Cards/TitleCard";
import { adminApi } from "../../features/admin/api";

const API_ORIGIN = (process.env.REACT_APP_BASE_URL || "")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const getDisplayValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const getDocumentFileName = (pathValue) => {
  if (!pathValue) return "-";
  return String(pathValue).split("/").pop();
};

const getAssetUrl = (pathValue) => {
  if (!pathValue) return "";
  if (/^https?:\/\//i.test(pathValue)) return pathValue;
  const normalizedPath = String(pathValue).startsWith("/")
    ? String(pathValue)
    : `/${pathValue}`;
  if (API_ORIGIN) return `${API_ORIGIN}${normalizedPath}`;
  return `http://localhost:5000${normalizedPath}`;
};

const formatRupiah = (value) =>
  `Rp. ${Number(value || 0).toLocaleString("id-ID")}`;

const normalizeText = (value = "") =>
  String(value).toLowerCase().replace(/\s+/g, " ").trim();

const isManagerLevelPosition = (position) =>
  normalizeText(position?.level) === "manager";

const getRawAutoRolesForEdit = (formState, allPositions) => {
  const autoRoles = new Set(["pegawai"]);
  const normalizedDepartment = normalizeText(formState.department_name);

  if (normalizedDepartment.includes("management")) {
    autoRoles.add("admin");
  }
  if (normalizedDepartment.startsWith("hr")) {
    autoRoles.add("hr");
  }
  if (normalizedDepartment.includes("finance")) {
    autoRoles.add("finance");
  }

  const selectedPosition = allPositions.find(
    (position) => String(position.id) === String(formState.position_id),
  );
  const normalizedPosition = normalizeText(selectedPosition?.name);
  if (isManagerLevelPosition(selectedPosition)) {
    autoRoles.add("atasan");
  }
  if (
    normalizedPosition === "hr&ga manager" ||
    normalizedPosition === "hr & ga manager"
  ) {
    autoRoles.add("hr");
  }

  return Array.from(autoRoles);
};

const getEffectiveAutoRolesForEdit = (formState, allPositions) => {
  const rawAutoRoles = getRawAutoRolesForEdit(formState, allPositions);
  const excludedAutoRoles = formState.excluded_auto_roles || [];
  return rawAutoRoles.filter((role) => !excludedAutoRoles.includes(role));
};

function AdminUsers() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    position: "",
    role: "",
    status: "",
  });

  const filteredRoles = useMemo(() => {
    const available = roles.map((item) => item.name);
    return available.filter((role) => role !== "kandidat");
  }, [roles]);

  const departments = useMemo(() => {
    const uniqueDepartments = Array.from(
      new Set(
        positions.map((position) => position.department_name).filter(Boolean),
      ),
    );
    return uniqueDepartments.sort((left, right) => left.localeCompare(right));
  }, [positions]);

  const availablePositions = useMemo(() => {
    const uniquePositions = Array.from(
      new Set(positions.map((position) => position.name).filter(Boolean)),
    );
    return uniquePositions.sort((left, right) => left.localeCompare(right));
  }, [positions]);

  const employeeByUserId = useMemo(() => {
    return employees.reduce((accumulator, employee) => {
      accumulator[String(employee.user_id)] = employee;
      return accumulator;
    }, {});
  }, [employees]);

  const filteredPositionsForEdit = useMemo(() => {
    if (!editingUser?.department_name) return [];
    return positions.filter(
      (position) => position.department_name === editingUser.department_name,
    );
  }, [positions, editingUser]);

  const tableUsers = useMemo(() => {
    const activeRole = String(localStorage.getItem("activeRole") || "")
      .toLowerCase()
      .trim();
    const isDirector = activeRole === "admin";
    const searchQuery = normalizeText(filters.search);

    const baseUsers = !isDirector
      ? users
      : users.filter((user) => {
      const normalizedRoles = Array.isArray(user.roles)
        ? user.roles.map((role) => String(role).toLowerCase().trim())
        : [];

      return !normalizedRoles.includes("kandidat");
      });

    return baseUsers.filter((user) => {
      const linkedEmployee = employeeByUserId[String(user.id)];
      const userRoles = Array.isArray(user.roles)
        ? user.roles.map((role) => String(role || "").toLowerCase().trim())
        : [];
      const userStatus = String(user.status || "").toLowerCase().trim();

      const matchesSearch =
        !searchQuery ||
        [
          user.name,
          user.username,
          user.email,
          linkedEmployee?.department_name,
          linkedEmployee?.position_name,
          user.roles?.join(", "),
          user.status,
        ].some((value) => normalizeText(value).includes(searchQuery));

      const matchesDepartment =
        !filters.department ||
        normalizeText(linkedEmployee?.department_name) ===
          normalizeText(filters.department);

      const matchesPosition =
        !filters.position ||
        normalizeText(linkedEmployee?.position_name) ===
          normalizeText(filters.position);

      const matchesRole =
        !filters.role || userRoles.includes(normalizeText(filters.role));

      const matchesStatus =
        !filters.status || userStatus === normalizeText(filters.status);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesPosition &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [employeeByUserId, filters, users]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      department: "",
      position: "",
      role: "",
      status: "",
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [usersData, metaData, employeesData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getMeta(),
        adminApi.getEmployees(),
      ]);
      setUsers(usersData);
      setRoles(metaData.roles || []);
      setPositions(metaData.positions || []);
      setEmployees(employeesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setPageTitle({ title: "Manajemen Pengguna" }));
    loadData();
  }, [dispatch]);

  // Initialize filters from query params (e.g. /app/users?status=inactive)
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || "");
      const status = params.get("status") || "";
      const department = params.get("department") || "";
      const position = params.get("position") || "";
      const role = params.get("role") || "";

      if (status || department || position || role) {
        setFilters((prev) => ({
          ...prev,
          status,
          department,
          position,
          role,
        }));
      }
    } catch (err) {
      // ignore malformed query
    }
  }, [location.search]);

  const applyAutoRolesForEdit = (nextFormState, previousFormState) => {
    const prevState = previousFormState || nextFormState;
    const prevAutoRoles = getEffectiveAutoRolesForEdit(prevState, positions);

    const rawNextAutoRoles = getRawAutoRolesForEdit(nextFormState, positions);
    const nextExcludedAutoRoles = (
      nextFormState.excluded_auto_roles || []
    ).filter((role) => rawNextAutoRoles.includes(role));
    const nextAutoRoles = rawNextAutoRoles.filter(
      (role) => !nextExcludedAutoRoles.includes(role),
    );

    const existingRoles = nextFormState.roles || prevState.roles || [];
    const manualRoles = existingRoles.filter(
      (role) => !prevAutoRoles.includes(role),
    );

    return {
      ...nextFormState,
      excluded_auto_roles: nextExcludedAutoRoles,
      roles: Array.from(new Set([...manualRoles, ...nextAutoRoles])),
    };
  };

  const toggleRole = (roleName) => {
    setEditingUser((prev) => {
      if (!prev) return prev;

      const rawCurrentAutoRoles = getRawAutoRolesForEdit(prev, positions);
      const currentAutoRoles = getEffectiveAutoRolesForEdit(prev, positions);
      const manualRoles = (prev.roles || []).filter(
        (role) => !currentAutoRoles.includes(role),
      );

      const exists = manualRoles.includes(roleName);
      let updatedRoles = exists
        ? manualRoles.filter((role) => role !== roleName)
        : [...manualRoles, roleName];

      let nextExcludedAutoRoles = [...(prev.excluded_auto_roles || [])];
      if (rawCurrentAutoRoles.includes(roleName)) {
        const currentlyChecked = (prev.roles || []).includes(roleName);
        if (currentlyChecked) {
          updatedRoles = updatedRoles.filter((role) => role !== roleName);
          nextExcludedAutoRoles = Array.from(
            new Set([...nextExcludedAutoRoles, roleName]),
          );
        } else {
          nextExcludedAutoRoles = nextExcludedAutoRoles.filter(
            (role) => role !== roleName,
          );
        }
      }

      return applyAutoRolesForEdit(
        {
          ...prev,
          roles: updatedRoles,
          excluded_auto_roles: nextExcludedAutoRoles,
        },
        prev,
      );
    });
  };

  const openEditUser = (user) => {
    const employee = employeeByUserId[String(user.id)];
    const initialEditState = {
      ...user,
      photo: user.photo || employee?.photo || "",
      roles: user.roles || [],
      excluded_auto_roles: [],
      employee_id: employee?.id || null,
      department_name: employee?.department_name || "",
      position_id: employee?.position_id ? String(employee.position_id) : "",
    };
    setEditingUser(applyAutoRolesForEdit(initialEditState, initialEditState));
  };

  const openViewUser = async (user) => {
    const employee = employeeByUserId[String(user.id)];

    const baseView = {
      ...user,
      employee,
      detail: employee || null,
      user_status: user.status,
    };
    setViewingUser(baseView);

    if (!employee?.id) return;

    try {
      const detail = await adminApi.getEmployeeById(employee.id);
      setViewingUser((prev) => {
        if (!prev || prev.id !== user.id) return prev;
        return {
          ...prev,
          detail: { ...prev.detail, ...detail },
        };
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    const requiredFields = [
      { key: "department_name", label: "Departemen" },
      { key: "position_id", label: "Posisi" },
      { key: "status", label: "Status" },
    ];

    const missingFields = requiredFields
      .filter((field) => !String(editingUser[field.key] || "").trim())
      .map((field) => field.label);

    if (!Array.isArray(editingUser.roles) || editingUser.roles.length === 0) {
      missingFields.push("Role");
    }

    if (missingFields.length > 0) {
      const message = `Silakan isi semua field wajib sebelum menyimpan: ${missingFields.join(", ")}`;
      setError(message);
      window.alert(message);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await adminApi.updateUser(editingUser.id, {
        status: editingUser.status,
        roles: editingUser.roles,
      });

      if (editingUser.employee_id && editingUser.position_id) {
        await adminApi.updateEmployee(editingUser.employee_id, {
          position_id: Number(editingUser.position_id),
        });
      }

      setEditingUser(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const getStatusBadgeClass = (status) => {
    const s = String(status || "").toLowerCase();

    switch (s) {
      case "active":
      case "aktif":
        return "badge badge-success text-white";

      case "inactive":
      case "nonactive":
      case "tidak aktif":
        return "badge badge-error text-white";

      default:
        return "badge badge-outline";
    }
  };

  return (
    <>
      {error ? (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      ) : null}

      <TitleCard title="Data Pengguna" topMargin="mt-0">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-1 xl:grid-cols-7">
          <label className="form-control w-full xl:col-span-2">
            <span className="label-text mb-1 text-sm font-medium text-base-content/70">
              Cari Nama
            </span>

            <input
              type="search"
              className="input input-bordered w-full"
              placeholder="Cari nama, username, atau email"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm font-medium text-base-content/70">
              Departemen
            </span>

            <select
              className="select select-bordered w-full"
              value={filters.department}
              onChange={(e) => handleFilterChange("department", e.target.value)}
            >
              <option value="">Semua Departemen</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm font-medium text-base-content/70">
              Posisi
            </span>

            <select
              className="select select-bordered w-full"
              value={filters.position}
              onChange={(e) => handleFilterChange("position", e.target.value)}
            >
              <option value="">Semua Posisi</option>
              {availablePositions.map((positionName) => (
                <option key={positionName} value={positionName}>
                  {positionName}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm font-medium text-base-content/70">
              Role
            </span>

            <select
              className="select select-bordered w-full"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <option value="">Semua Role</option>
              {filteredRoles.map((roleName) => (
                <option key={roleName} value={roleName}>
                  {roleName}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm font-medium text-base-content/70">
              Status
            </span>

            <select
              className="select select-bordered w-full"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </label>
            <button
            className="btn btn-secondary rounded-full px-6 min-h-12 self-start md:self-end md:mt-6"
              onClick={handleResetFilters}
            >
              Reset Filter
            </button>
        </div>

        {loading ? (
          <div>Memuat data pengguna...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead className="text-center [&_th]:py-3">
                <tr>
                  <th>Nama</th>
                  <th>Departemen</th>
                  <th>Posisi</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tableUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-base-content/60">
                      tidak ada data ditemukan
                    </td>
                  </tr>
                ) : (
                  tableUsers.map((user) => {
                  const linkedEmployee = employeeByUserId[String(user.id)];

                  return (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{linkedEmployee?.department_name || "-"}</td>
                      <td>{linkedEmployee?.position_name || "-"}</td>
                      <td>{(user.roles || []).join(", ")}</td>
                      <td>
                        <span className={getStatusBadgeClass(user.status)}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 whitespace-nowrap">
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
                            onClick={() => openViewUser(user)}
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
    transition-all duration-200
  "
                            onClick={() => openEditUser(user)}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </TitleCard>

      <input
        type="checkbox"
        id="edit-user-modal"
        className="modal-toggle"
        checked={!!editingUser}
        onChange={() => setEditingUser(null)}
      />
      <div className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg">Ubah Role & Status Pengguna</h3>
          {editingUser ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-col items-center justify-center">
                <div className="avatar">
                  <div className="w-24 rounded-xl ring ring-base-300 ring-offset-base-100 ring-offset-2">
                    <img
                      src={
                        getAssetUrl(editingUser.photo) ||
                        "https://placeimg.com/120/120/people"
                      }
                      alt="Foto Pengguna"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
                <div>
                  <span className="font-semibold">Nama:</span>{" "}
                  {editingUser.name}
                </div>
                <div>
                  <span className="font-semibold">Username:</span>{" "}
                  {editingUser.username}
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  {editingUser.email}
                </div>
                <div>
                  <label className="label p-0 pb-1">
                    <span className="label-text font-semibold">Departemen</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={editingUser.department_name || ""}
                    onChange={(e) => {
                      setEditingUser((prev) => {
                        if (!prev) return prev;
                        return applyAutoRolesForEdit(
                          {
                            ...prev,
                            department_name: e.target.value,
                            position_id: "",
                          },
                          prev,
                        );
                      });
                    }}
                  >
                    <option value="">Pilih Departemen</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label p-0 pb-1">
                    <span className="label-text font-semibold">Posisi</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={editingUser.position_id || ""}
                    onChange={(e) => {
                      setEditingUser((prev) => {
                        if (!prev) return prev;
                        return applyAutoRolesForEdit(
                          { ...prev, position_id: e.target.value },
                          prev,
                        );
                      });
                    }}
                  >
                    <option value="">Pilih Posisi</option>
                    {filteredPositionsForEdit.map((position) => (
                      <option key={position.id} value={position.id}>
                        {position.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label p-0 pb-1">
                    <span className="label-text font-semibold">Status</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={editingUser.status || "active"}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, status: e.target.value })
                    }
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <p className="font-medium mb-2">Hak Akses Role</p>
                  <div className="flex flex-wrap gap-4">
                    {filteredRoles.map((roleName) => (
                      <label
                        key={roleName}
                        className="label cursor-pointer gap-2"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-sm"
                          checked={(editingUser.roles || []).includes(roleName)}
                          onChange={() => toggleRole(roleName)}
                        />
                        <span className="label-text capitalize">
                          {roleName}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className="modal-action">
            <button className="btn" onClick={() => setEditingUser(null)}>
              Batal
            </button>
            <button
              className={`btn btn-primary ${submitting ? "loading" : ""}`}
              onClick={handleSaveEdit}
              disabled={submitting}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>

      <input
        type="checkbox"
        id="view-user-modal"
        className="modal-toggle"
        checked={!!viewingUser}
        onChange={() => setViewingUser(null)}
      />
      <div className="modal">
        <div className="modal-box max-w-3xl">
          <h3 className="font-bold text-lg">Detail Pengguna & Pegawai</h3>
          {viewingUser ? (
            <div className="space-y-4 mt-4">
              <div className="flex flex-col items-center justify-center">
                <div className="avatar">
                  <div className="w-24 rounded-xl ring ring-base-300 ring-offset-base-100 ring-offset-2">
                    <img
                      src={
                        getAssetUrl(viewingUser?.detail?.photo) ||
                        "https://placeimg.com/120/120/people"
                      }
                      alt="Foto Pegawai"
                    />
                  </div>
                </div>
                <p className="mt-2 font-semibold">
                  {getDisplayValue(viewingUser.name)}
                </p>
                <p className="text-xs text-base-content/70">
                  {getDisplayValue(viewingUser?.detail?.employee_code)}
                </p>
              </div>

              <div className="border border-base-300 rounded-lg p-4">
                <p className="font-semibold mb-3">Akun Pengguna</p>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                  <div>
                    <span className="font-semibold">Nama:</span>{" "}
                    {getDisplayValue(viewingUser.name)}
                  </div>
                  <div>
                    <span className="font-semibold">Username:</span>{" "}
                    {getDisplayValue(viewingUser.username)}
                  </div>
                  <div>
                    <span className="font-semibold">Email:</span>{" "}
                    {getDisplayValue(viewingUser.email)}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    {getDisplayValue(viewingUser.status)}
                  </div>
                </div>
              </div>

              <div className="border border-base-300 rounded-lg p-4">
                <p className="font-semibold mb-3">Data Kepegawaian</p>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                  <div>
                    <span className="font-semibold">Departemen:</span>{" "}
                    {getDisplayValue(viewingUser?.detail?.department_name)}
                  </div>
                  <div>
                    <span className="font-semibold">Posisi:</span>{" "}
                    {getDisplayValue(viewingUser?.detail?.position_name)}
                  </div>
                  <div>
                    <span className="font-semibold">Tanggal Bergabung:</span>{" "}
                    {getDisplayValue(
                      viewingUser?.detail?.join_date
                        ? String(viewingUser.detail.join_date).slice(0, 10)
                        : "",
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Status Kepegawaian:</span>{" "}
                    {getDisplayValue(viewingUser?.detail?.employment_status)}
                  </div>
                  <div>
                    <span className="font-semibold">Gaji Pokok:</span>{" "}
                    {formatRupiah(viewingUser?.detail?.basic_salary)}
                  </div>
                </div>
              </div>

              <div className="border border-base-300 rounded-lg p-4">
                <p className="font-semibold mb-3">Role & Hak Akses</p>
                <div className="flex flex-wrap gap-2">
                  {(viewingUser.roles || []).length ? (
                    (viewingUser.roles || []).map((roleName) => (
                      <span
                        key={roleName}
                        className="badge badge-outline capitalize"
                      >
                        {roleName}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-base-content/70">
                      Role tidak tersedia
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-base-300 rounded-lg p-4">
                <p className="font-semibold mb-3">Dokumen Pegawai</p>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                  <div>
                    <span className="font-semibold">Dokumen KTP:</span>{" "}
                    {viewingUser?.detail?.ktp_document ? (
                      <a
                        href={getAssetUrl(viewingUser.detail.ktp_document)}
                        target="_blank"
                        rel="noreferrer"
                        className="link link-primary"
                      >
                        {getDocumentFileName(viewingUser.detail.ktp_document)}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Dokumen Ijazah:</span>{" "}
                    {viewingUser?.detail?.diploma_document ? (
                      <a
                        href={getAssetUrl(viewingUser.detail.diploma_document)}
                        target="_blank"
                        rel="noreferrer"
                        className="link link-primary"
                      >
                        {getDocumentFileName(
                          viewingUser.detail.diploma_document,
                        )}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Dokumen Kontrak:</span>{" "}
                    {viewingUser?.detail?.employment_contract_document ? (
                      <a
                        href={getAssetUrl(
                          viewingUser.detail.employment_contract_document,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="link link-primary"
                      >
                        {getDocumentFileName(
                          viewingUser.detail.employment_contract_document,
                        )}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className="modal-action">
            <button
              className=" btn btn-primary rounded-full"
              onClick={() => setViewingUser(null)}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminUsers;
