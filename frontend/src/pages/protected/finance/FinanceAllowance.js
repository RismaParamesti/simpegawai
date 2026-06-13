import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setPageTitle } from "../../../features/common/headerSlice";
import { useNavigate } from "react-router-dom";

function FinanceAllowance() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Manajemen Payroll" }));
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[1.8rem] border border-orange-100 bg-gradient-to-r from-white via-white to-orange-50 px-6 py-8 shadow-sm">
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
            Payroll Management
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900">
            Manajemen Payroll
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Atur komponen global payroll seperti pajak dan tunjangan makan yang
            berlaku untuk seluruh pegawai.
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pengaturan Payroll */}
        <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
            &#9881;
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Pengaturan Payroll
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Atur komponen global payroll seperti pajak dan tunjangan makan yang
            berlaku untuk seluruh pegawai.
          </p>

          <button
            className="mt-6 w-full rounded-2xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
            onClick={() => navigate("/app/payroll/settings")}
          >
            Ubah Komponen Global
          </button>
        </div>

        {/* Gaji & Tunjangan Jabatan */}
        <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
            &#128188;
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Gaji & Tunjangan Jabatan
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Lihat gaji pokok dan tunjangan jabatan berdasarkan posisi jabatan.
          </p>

          <button
            className="mt-6 w-full rounded-2xl bg-blue-500 py-3 font-semibold text-white transition hover:bg-blue-600"
            onClick={() => navigate("/app/payroll/position-allowance")}
          >
            Lihat Gaji & Tunjangan
          </button>
        </div>

        {/* Tunjangan Lainnya */}
        <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
            &#127873;
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Tunjangan Lainnya
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Lihat riwayat komponen tambahan seperti potongan lain atau bonus khusus.
          </p>

          <button
            className="mt-6 w-full rounded-2xl bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-600"
            onClick={() => navigate("/app/payroll/other-allowance")}
          >
            Lihat Riwayat Komponen Lain
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinanceAllowance;

