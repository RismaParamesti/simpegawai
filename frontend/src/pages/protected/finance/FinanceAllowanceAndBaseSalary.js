import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle, showNotification } from "../../../features/common/headerSlice";
import TitleCard from "../../../components/Cards/TitleCard";
import Pagination from "../../../components/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import { financeApi } from "../../../features/finance/api";
import useTablePagination from "../../../hooks/useTablePagination";
import { formatCurrencyInput, normalizeCurrencyInput } from "../../../components/Formatters/CurrencyFormatter";

const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const isCommissionerPosition = (position = {}) => {
  const name = String(position.name || "").toLowerCase().trim();
  const level = String(position.level || "").toLowerCase().trim();

  return name.includes("commissioner") || level === "commissioner";
};

function PositionSalary() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user role dari localStorage untuk role-based access control
  const activeRole = localStorage.getItem("activeRole") || "";
  const isReadOnly = activeRole === "finance";
  const canEdit = activeRole === "hr" || activeRole === "admin";

  const [positions, setPositions] = useState([]);
  const positionsPagination = useTablePagination(positions);
  const [editData, setEditData] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPositions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await financeApi.getPositions();
      setPositions((data || []).filter((position) => !isCommissionerPosition(position)));
    } catch (err) {
      dispatch(showNotification({ 
        message: err.message || "Gagal memuat data posisi", 
        status: 0 
      }));
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Input Gaji Pokok & Tunjangan Jabatan" }));
    loadPositions();
  }, [dispatch, loadPositions]);

  const handleChange = (id, field, value) => {
    if (isReadOnly) return; // Jangan ubah data jika read-only
    
    setEditData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleCurrencyChange = (id, field, value) => {
    handleChange(id, field, normalizeCurrencyInput(value));
  };

  const handleSave = async (id) => {
    try {
      setLoadingId(id);
      const dataToUpdate = editData[id] || {};
      
      if (Object.keys(dataToUpdate).length === 0) {
        dispatch(showNotification({ 
          message: "Tidak ada perubahan data", 
          status: 0 
        }));
        return;
      }

      await financeApi.updatePositionSalary(id, dataToUpdate);
      
      setPositions((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...dataToUpdate } : item,
        ),
      );

      setEditData((prev) => ({ ...prev, [id]: {} }));
      dispatch(showNotification({ 
        message: "Gaji posisi berhasil diperbarui", 
        status: 1 
      }));
    } catch (err) {
      dispatch(showNotification({ 
        message: err.message || "Gagal menyimpan gaji posisi", 
        status: 0 
      }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <TitleCard
      title="Input Gaji Pokok & Tunjangan Jabatan"
        topMargin="mt-0"
        TopSideButtons={
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate(-1)}
          >
            Kembali
          </button>
        }
    >
      {!isReadOnly && !canEdit && (
        <div className="alert alert-warning mb-4">
          <div>
            <span>Role Anda tidak memiliki akses ke halaman ini.</span>
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-center py-10">Memuat data...</div>
      ) : positions.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Tidak ada data posisi</div>
      ) : (
      <div className="overflow-x-auto w-full">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Position</th>
              <th>Level</th>
              <th>Base Salary</th>
              <th>Allowance</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {positionsPagination.paginatedItems.map((pos) => {
              const current = editData[pos.id] || {};

              return (
                <tr key={pos.id}>
                  <td className="font-semibold">{pos.name}</td>

                  <td>{pos.level}</td>

                  {/* Base Salary */}
                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={isReadOnly}
                      className={`input input-bordered w-full ${isReadOnly ? "opacity-60 cursor-not-allowed" : ""}`}
                      value={formatCurrencyInput(current.base_salary ?? pos.base_salary)}
                      onChange={(e) =>
                        handleCurrencyChange(pos.id, "base_salary", e.target.value)
                      }
                      placeholder="Rp"
                    />
                    <div className="text-xs opacity-60">
                      {formatCurrency(current.base_salary ?? pos.base_salary)}
                    </div>
                  </td>

                  {/* Allowance */}
                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={isReadOnly}
                      className={`input input-bordered w-full ${isReadOnly ? "opacity-60 cursor-not-allowed" : ""}`}
                      value={formatCurrencyInput(
                        current.position_allowance ??
                        pos.position_allowance ??
                        ""
                      )}
                      onChange={(e) =>
                        handleCurrencyChange(
                          pos.id,
                          "position_allowance",
                          e.target.value,
                        )
                      }
                      placeholder="Rp"
                    />
                    <div className="text-xs opacity-60">
                      {formatCurrency(
                        current.position_allowance ?? pos.position_allowance,
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className="badge badge-success">{pos.status}</span>
                  </td>

                  {/* Action */}
                  <td>
                    {!isReadOnly && (
                      <button
                        className={`btn btn-sm ${
                          loadingId === pos.id ? "btn-disabled" : "btn-primary"
                        }`}
                        onClick={() => handleSave(pos.id)}
                      >
                        {loadingId === pos.id ? "Saving..." : "Simpan"}
                      </button>
                    )}
                    {isReadOnly && (
                      <span className="text-xs opacity-60 italic">Lihat saja</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={positionsPagination.page} totalPages={positionsPagination.totalPages} onChangePage={positionsPagination.setPage} itemsPerPage={positionsPagination.itemsPerPage} />
      </div>
      )}
    </TitleCard>
  );
}

export default PositionSalary;

