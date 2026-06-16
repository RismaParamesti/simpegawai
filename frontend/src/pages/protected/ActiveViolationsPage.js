import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TitleCard from "../../components/Cards/TitleCard";
import Pagination from "../../components/Pagination/Pagination";
import { setPageTitle } from "../../features/common/headerSlice";
import { hrApi } from "../../features/hr/api";
import { atasanApi } from "../../features/atasan/api";
import { pegawaiApi } from "../../features/pegawai/api";
import { openModal } from "../../features/common/modalSlice";
import { MODAL_BODY_TYPES } from "../../utils/globalConstantUtil";

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
  const [ruleMap, setRuleMap] = useState({ byCode: {}, byId: {} });
  const [employeeList, setEmployeeList] = useState([]);
  const [levelList, setLevelList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // keep `ruleMap` referenced so it can be used later (detail action)
  useEffect(() => {
    // no-op; intentionally referencing ruleMap to avoid unused variable errors
  }, [ruleMap]);
  const itemsPerPage = 10;

  const parseSnapshot = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  };

  const getValidUntil = (it) => {
    if (!it) return null;
    if (it.valid_until) return it.valid_until;
    const snap = parseSnapshot(it.evidence_snapshot || it.evidence);
    return snap && snap.valid_until ? snap.valid_until : null;
  };

  const getStatusValue = (it) =>
    String(it?.status || it?.letter_status || "active").toLowerCase();
  const getLevelValue = (it) =>
    String(it?.sp_level || it?.sp || "-").toLowerCase();
  const getEmployeeId = (it) =>
    String(it?.employee_id || it?.employeeId || it?.employee?.id || "");

  const normalizeResponseData = (res) => {
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.employees)) return res.employees;
    if (Array.isArray(res)) return res;
    return [];
  };

  const normalizeSanctionLevel = (value) => String(value || "").toLowerCase().trim();

  const buildViolationItemsFromEligibleEmployees = (employees = []) =>
    employees
      .filter((employee) => {
        const level = normalizeSanctionLevel(employee.alpha_sanction_level);
        const alphaCount = Number(
          employee.alpha_consecutive_days ||
            employee.consecutive_alpha_days ||
            employee.alpha_accumulated_days ||
            0,
        );
        const lateCount = Number(
          employee.late_consecutive_days ||
            employee.late_accumulated_days ||
            0,
        );
        return (
          level &&
          level !== "none" &&
          level !== "0" &&
          level !== "-" &&
          (alphaCount > 0 || lateCount > 0)
        );
      })
      .map((employee) => ({
        id: `employee-${employee.employee_id || employee.id}`,
        employee_id: employee.employee_id || employee.id,
        employee_name:
          employee.employee_name || employee.full_name || employee.name || "-",
        employee_code: employee.employee_code || "-",
        department_name: employee.department_name || "-",
        position_name: employee.position_name || "-",
        sp_level: employee.alpha_sanction_level,
        violation_date:
          employee.violation_date_start ||
          employee.latest_alpha_date ||
          employee.alpha_last_evaluated_at ||
          null,
        issued_date:
          employee.violation_date_start ||
          employee.latest_alpha_date ||
          employee.alpha_last_evaluated_at ||
          null,
        status: "active",
        evidence_snapshot: {
          alpha_consecutive_days:
            employee.alpha_consecutive_days ||
            employee.consecutive_alpha_days ||
            0,
          alpha_accumulated_days: employee.alpha_accumulated_days || 0,
          violation_date: employee.violation_date_start || employee.latest_alpha_date,
          violation_date_end: employee.violation_date_end || null,
        },
      }));

  useEffect(() => {
    dispatch(setPageTitle({ title: "Semua Pelanggaran" }));

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const activeRole = localStorage.getItem("activeRole") || "";
        const loaders = [];
        if (activeRole === "hr" || activeRole === "admin") {
          loaders.push(() => hrApi.getActiveWarningLetters());
          loaders.push(() => hrApi.getWarningLetters());
          loaders.push(() => atasanApi.getTeamWarningLetters());
          loaders.push(() => atasanApi.getTeamWarningLettersAll());
        } else if (activeRole === "atasan") {
          loaders.push(() => atasanApi.getTeamWarningLetters());
          loaders.push(() => atasanApi.getTeamWarningLettersAll());
          loaders.push(() => hrApi.getActiveWarningLetters());
          loaders.push(() => hrApi.getWarningLetters());
        } else {
          loaders.push(() => hrApi.getActiveWarningLetters());
          loaders.push(() => hrApi.getWarningLetters());
          loaders.push(() => atasanApi.getTeamWarningLetters());
          loaders.push(() => atasanApi.getTeamWarningLettersAll());
        }

        let loadedItems = [];
        for (const loader of loaders) {
          try {
            const res = await loader();
            const data = normalizeResponseData(res);
            if (data.length || loadedItems.length === 0) {
              loadedItems = data;
            }
            if (data.length) break;
          } catch (e) {
            // try next available source
          }
        }

        if (loadedItems.length === 0 && (activeRole === "hr" || activeRole === "admin")) {
          try {
            const eligibleRes = await hrApi.getWarningLetterEligibleEmployees();
            loadedItems = buildViolationItemsFromEligibleEmployees(
              normalizeResponseData(eligibleRes),
            );
          } catch (e) {
            // keep empty warning-letter result if fallback is unavailable
          }
        }

        if (loadedItems.length === 0 && activeRole === "atasan") {
          try {
            const teamRes = await atasanApi.getTeamMembers();
            loadedItems = buildViolationItemsFromEligibleEmployees(
              normalizeResponseData(teamRes),
            );
          } catch (e) {
            // keep empty warning-letter result if team fallback is unavailable
          }
        }

        setItems(loadedItems);

        const employeeLoader =
          activeRole === "atasan"
            ? atasanApi.getTeamMembers
            : hrApi.getEmployees;

        const [employeesRes, rulesRes, statusesRes] = await Promise.allSettled([
          employeeLoader(),
          pegawaiApi.getAttendanceWarningRulesPublic(),
          hrApi.getWarningLetterStatuses(),
        ]);

        if (employeesRes.status === "fulfilled") {
          const employees = normalizeResponseData(employeesRes.value);
          setEmployeeList(
            employees
              .map((employee) => ({
                id: String(employee.id || employee.employee_id || ""),
                name:
                  employee.employee_name ||
                  employee.full_name ||
                  employee.name ||
                  "-",
              }))
              .filter(
                (employee) =>
                  employee.id && employee.name && employee.name !== "-",
              ),
          );
        } else {
          setEmployeeList([]);
        }

        if (rulesRes.status === "fulfilled") {
          const rules = rulesRes.value?.data || [];
          const mapByCode = {};
          const mapById = {};
          const levels = [];

          for (const r of rules) {
            const normalizedLevel = String(r.sanction_level || r.level || "")
              .trim()
              .toLowerCase();
            if (normalizedLevel) {
              levels.push({
                value: normalizedLevel,
                label: r.sanction_label || r.rule_name || normalizedLevel,
              });
            }
            if (r.rule_code)
              mapByCode[String(r.rule_code).trim()] = r.description || "";
            if (r.id) mapById[String(r.id)] = r.description || "";
          }

          setRuleMap({ byCode: mapByCode, byId: mapById });
          setLevelList(
            Array.from(
              new Map(levels.map((item) => [item.value, item.label])).entries(),
            ).map(([value, label]) => ({ value, label })),
          );
        } else {
          setRuleMap({ byCode: {}, byId: {} });
          setLevelList([]);
        }

        if (statusesRes.status === "fulfilled") {
          const statuses = statusesRes.value?.data || [];
          setStatusList(statuses.map((s) => String(s).toLowerCase()));
        } else {
          setStatusList(["active", "expired", "escalated"]);
        }
      } catch (e) {
        setError(e.message || "Gagal memuat data surat peringatan");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [selectedEmployee, selectedLevel, selectedStatus]);

  if (loading)
    return (
      <div className="py-8 text-center">Memuat data surat peringatan...</div>
    );

  const filteredItems = (items || []).filter((it) => {
    const matchEmployee =
      !selectedEmployee || getEmployeeId(it) === selectedEmployee;
    const matchLevel = !selectedLevel || getLevelValue(it) === selectedLevel;
    const matchStatus =
      !selectedStatus || getStatusValue(it) === selectedStatus;
    return matchEmployee && matchLevel && matchStatus;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / itemsPerPage),
  );
  const paginatedItems = filteredItems.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  return (
    <div>
      {error ? <div className="alert alert-error mb-4">{error}</div> : null}

      <TitleCard title="Peringatan Pelanggaran" topMargin="mt-0">
        <div className="grid md:grid-cols-4 grid-cols-1 gap-4 mb-6">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text text-xs font-semibold uppercase opacity-60">
                Nama Pegawai
              </span>
            </div>
            <select
              className="select select-bordered select-sm w-full"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Semua pegawai</option>
              {employeeList.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text text-xs font-semibold uppercase opacity-60">
                Level Pelanggaran
              </span>
            </div>
            <select
              className="select select-bordered select-sm w-full"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">Semua level</option>
              {levelList.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label || level.value.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text text-xs font-semibold uppercase opacity-60">
                Status
              </span>
            </div>
            <select
              className="select select-bordered select-sm w-full"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Semua status</option>
              {statusList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end justify-right mb-0">
            <button
              button="button"
              className="btn btn-secondary btn-sm rounded-full"
              onClick={() => {
                setSelectedEmployee("");
                setSelectedLevel("");
                setSelectedStatus("");
              }}
            >
              Reset Filter
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center opacity-60 py-8">
            Tidak ada surat peringatan
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra table-sm min-w-[720px]">
              <thead>
                <tr>
                  <th>Pegawai</th>
                  <th>Level Pelanggaran</th>
                  <th>Pelanggaran Terbit</th>
                  <th>Berlaku Sampai</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((it) => (
                  <tr key={it.id}>
                    <td>
                      <div className="font-semibold">
                        {it.employee_name || "-"}
                      </div>
                      <div className="text-xs opacity-70">
                        {it.employee_code || "-"} • {it.department_name || it.position_name || "-"}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-warning badge-sm">
                        {it.sp_level || it.sp || "-"}
                      </span>
                    </td>
                    <td>{formatDateOnly(it.issued_date || it.created_at)}</td>
                    <td>{formatDateOnly(getValidUntil(it))}</td>
                    <td>
                      <span className="badge badge-success badge-sm">
                        {it.status || it.letter_status || "active"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          dispatch(
                            openModal({
                              title: "Detail Pelanggaran",
                              bodyType: MODAL_BODY_TYPES.WARNING_LETTER_DETAIL,
                              size: "lg",
                              extraObject: it,
                            }),
                          )
                        }
                      >
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onChangePage={(p) => setPage(p)}
                itemsPerPage={itemsPerPage}
                disabled={totalPages <= 1}
              />
            </div>
          </div>
        )}
      </TitleCard>
    </div>
  );
}

export default ActiveViolationsPage;
