import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import { setPageTitle } from "../../features/common/headerSlice";
import { hrApi } from "../../features/hr/api";
import { atasanApi } from "../../features/atasan/api";

function formatDateOnly(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function ActiveViolationsPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Pelanggaran Aktif" }));

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const activeRole = localStorage.getItem("activeRole") || "";
        let res;
        if (activeRole === "hr" || activeRole === "admin") {
          res = await hrApi.getActiveWarningLetters();
          setItems(res.data || []);
        } else if (activeRole === "atasan") {
          res = await atasanApi.getTeamWarningLetters();
          setItems(res.data || []);
        } else {
          setItems([]);
        }
      } catch (e) {
        setError(e.message || "Gagal memuat data pelanggaran aktif");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [dispatch]);

  if (loading) return <div className="py-8 text-center">Memuat pelanggaran aktif...</div>;

  return (
    <div>
      {error ? (
        <div className="alert alert-error mb-4">{error}</div>
      ) : null}

      <TitleCard title="Pelanggaran Aktif" topMargin="mt-0">
        {items.length === 0 ? (
          <div className="text-center opacity-60 py-8">Tidak ada pelanggaran aktif</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Pegawai</th>
                  <th>SP Aktif</th>
                  <th>Keterangan</th>
                  <th>Berlaku Sampai</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td>
                      <div className="font-semibold">{it.employee_name || "-"}</div>
                      <div className="text-xs opacity-70">{it.employee_code || "-"} • {it.department_name || "-"}</div>
                    </td>
                    <td>
                      <span className="badge badge-warning badge-sm">{it.sp_level || it.sp || "-"}</span>
                    </td>
                    <td className="text-xs leading-5">{it.evidence_summary || it.rule_name || it.description || "-"}</td>
                    <td>{formatDateOnly(it.valid_until)}</td>
                    <td><span className="badge badge-success badge-sm">{it.status || it.letter_status || "active"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TitleCard>
    </div>
  );
}

export default ActiveViolationsPage;
