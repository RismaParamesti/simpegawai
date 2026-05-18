// All components mapping with path for internal routes

import { lazy } from "react";

// Employee Pages
const Dashboard = lazy(() => import("../pages/protected/admin/AdminDashboard"));
const EmployeeDashboard = lazy(() => import("../pages/protected/employee/EmployeeDashboard"),);
const EmployeeAttendance = lazy(() => import("../pages/protected/employee/EmployeeAttendance"),);
const EmployeeWarningLetters = lazy(() => import("../pages/protected/employee/EmployeeWarningLetters"));
const EmployeeLeave = lazy(() => import("../pages/protected/employee/EmployeeLeave"));
const EmployeePayroll = lazy(() => import("../pages/protected/employee/EmployeePayroll"),);
const EmployeeReimbursement = lazy(() => import("../pages/protected/employee/EmployeeReimbursement"),);
const EmployeeSalaryAppeal = lazy(() => import("../pages/protected/employee/EmployeeSalaryAppeal"),);
const ProfileSettings = lazy(() => import("../pages/protected/ProfileSettings"),);
const Page404 = lazy(() => import("../pages/protected/404"));

// Admin Pages
const AdminUsers = lazy(() => import("../pages/protected/admin/AdminUsers"));
const AdminEmployees = lazy(() => import("../pages/protected/admin/AdminEmployees"));
const AdminActivityLogs = lazy(() => import("../pages/protected/admin/AdminActivityLogs"),);
const AdmindDepartement = lazy(() => import("../pages/protected/admin/AdminDepartement"),);
const AdminDepartmentsPosition = lazy(() => import("../pages/protected/admin/AdminDepartmentsPosition"),);
const ApproveAllowance = lazy(() => import("../pages/protected/admin/AdminApproveAllowance"),);

// HR Pages
const HRDashboard = lazy(() => import("../pages/protected/hr/HRDashboard"));
const HREmployees = lazy(() => import("../pages/protected/hr/HREmployees"));
const HRAttendance = lazy(() => import("../pages/protected/hr/HRAttendance"));
const HRLeaveRequests = lazy(() => import("../pages/protected/hr/HRLeaveRequests"),);
const HRReimbursements = lazy(() => import("../pages/protected/hr/HRReimbursements"),);
const HRSalaryAppeals = lazy(() => import("../pages/protected/hr/HRSalaryAppeals"),);
const Allowance = lazy(() => import("../pages/protected/hr/HRAllowance"));
const HRPayrollDirectorAdjustments = lazy(() => import("../pages/protected/hr/HRAllowanceOther"),);
const HRWarningLetters = lazy(() => import("../pages/protected/hr/HRWarningLetters"),);
const HRJobOpenings = lazy(() => import("../pages/protected/hr/HRJobOpenings"));
const HRRecruitmentProcess = lazy(() => import("../pages/protected/hr/HRRecruitmentProcess"),);
const HRRecruitmentProcessDetail = lazy(() => import("../pages/protected/hr/HRRecruitmentProcessDetail"),);
const HRInterview = lazy(() => import("../pages/protected/hr/HRInterview"));
const JobDetail = lazy(() => import("../pages/protected/hr/HRInterviewDetailLowongan"));
const HRHiredCandidate = lazy(() => import("../pages/protected/hr/HRHiredCandidate"),);
const HRHiredCandidateDetail = lazy(() => import("../pages/protected/hr/HRHiredCandidateDetail"),);
const HRHiredCandidateDetailModal = lazy(() => import("../pages/protected/hr/HRHiredCandidateDetailModal"),);

// Atasan Pages
const AtasanDashboard = lazy(() => import("../pages/protected/atasan/AtasanDashboard"),);
const AtasanLeaveRequests = lazy(() => import("../pages/protected/atasan/AtasanLeaveRequests"),);
const AtasanLeaveRequestsHistory = lazy(() => import("../pages/protected/atasan/AtasanLeaveRequestsHistory"),);
const AtasanReimbursements = lazy(() => import("../pages/protected/atasan/AtasanReimbursements"),);
const AtasanReimbursementsHistory = lazy(() => import("../pages/protected/atasan/AtasanReimbursementsHistory"),);
const AtasanAttendance = lazy(() => import("../pages/protected/atasan/AtasanAttendance"),);

// Finance Pages
const FinanceDashboard = lazy(() => import("../pages/protected/finance/FinanceDashboard"),);
const FinancePayroll = lazy(() => import("../pages/protected/finance/FinancePayroll"));
const FinancePayrollRevision = lazy(() => import("../pages/protected/finance/FinancePayrollRevision"),);
const FinancePayrollTransfers = lazy(() => import("../pages/protected/finance/FinancePayrollTransfers"),);
const FinanceAllowance = lazy(() => import("../pages/protected/finance/FinanceAllowance"),);
const FinanceAllowancePayrollSettings = lazy(() => import("../pages/protected/finance/FinanceAllowancePayrollSettings"),);
const PositionSalary = lazy(() => import("../pages/protected/finance/FinanceAllowanceAndBaseSalary"),);
const FinanceReimbursements = lazy(() => import("../pages/protected/finance/FinanceReimbursements"),);
const FinanceSalaryAppeals = lazy(() => import("../pages/protected/finance/FinanceSalaryAppeals"),);
const FinanceReports = lazy(() => import("../pages/protected/finance/FinanceReports"));

//kandidat
const CandidateDashboardHome = lazy(() => import("../pages/CandidateDashboardHome"));
const CandidateJobList = lazy(() => import("../pages/CandidateOpeningPage"));
const CandidateProfilePage = lazy(() => import("../pages/CandidateProfilePage"));
const CandidateRequestsPage = lazy(() => import("../pages/CandidateRequestsPage"));
const CandidateJobDetailPage = lazy(() => import("../pages/CandidateJobDetailPage"));
const CandidateApplyPage = lazy(() => import("../pages/CandidateApplyPage"));

const adminRoutes = [
  {
    path: "/dashboard",
    component: Dashboard,
  },
  {
    path: "/users",
    component: AdminUsers,
  },
  {
    path: "/positions",
    component: AdmindDepartement,
  },
  {
    path: "/positions/:departmentId",
    component: AdminDepartmentsPosition,
  },
  {
    path: "/employees",
    component: AdminEmployees,
  },
  {
    path: "/activity-logs",
    component: AdminActivityLogs,
  },
  {
    path: "/allowance",
    component: ApproveAllowance,
  },
  {
    path: "/settings-profile",
    component: ProfileSettings,
  },
  {
    path: "/404",
    component: Page404,
  },
];

const pegawaiRoutes = [
  {
    path: "/dashboard",
    component: EmployeeDashboard,
  },
  {
    path: "/attendance",
    component: EmployeeAttendance,
  },
  {
    path: "/warning-letters",
    component: EmployeeWarningLetters,
  },
  {
    path: "/leave-requests",
    component: EmployeeLeave,
  },
  {
    path: "/payroll",
    component: EmployeePayroll,
  },
  {
    path: "/salary-appeals",
    component: EmployeeSalaryAppeal,
  },
  {
    path: "/reimbursements",
    component: EmployeeReimbursement,
  },
  {
    path: "/settings-profile",
    component: ProfileSettings,
  },
  {
    path: "/404",
    component: Page404,
  },
];
const hrRoutes = [
  {
    path: "/dashboard",
    component: HRDashboard,
  },
  {
    path: "/job-openings",
    component: HRJobOpenings,
  },
  {
    path: "/recruitment-process",
    component: HRRecruitmentProcess,
  },
  {
    path: "/Interview-process",
    component: HRInterview,
  },
  {
    path: "/DetailInterview-process",
    component: JobDetail,
  },
  {
    path: "/employees",
    component: HREmployees,
  },
  {
    path: "/attendance",
    component: HRAttendance,
  },
  {
    path: "/leave-requests",
    component: HRLeaveRequests,
  },
  {
    path: "/reimbursements",
    component: HRReimbursements,
  },
  {
    path: "/salary-appeals",
    component: HRSalaryAppeals,
  },
  {
    path: "/hr-allowance",
    component: Allowance,
  },
  {
    path: "/hr/position-allowance",
    component: PositionSalary,
  },
  {
    path: "/hr/settings",
    component: FinanceAllowancePayrollSettings,
  },
  {
    path: "/hr/other-allowance",
    component: HRPayrollDirectorAdjustments,
  },
  {
    path: "/warning-letters",
    component: HRWarningLetters,
  },
  {
    path: "/candidate/:jobId",
    component: HRRecruitmentProcessDetail,
  },
  {
    path: "/settings-profile",
    component: ProfileSettings,
  },
  {
    path: "/Hire-candidates",
    component: HRHiredCandidate,
  },
  {
    path: "/Hire-candidates/:id",
    component: HRHiredCandidateDetail,
  },
  {
    path: "/Hire-candidates-detailmodal/:id",
    component: HRHiredCandidateDetailModal,
  },
  {
    path: "/404",
    component: Page404,
  },
];

const atasanRoutes = [
  {
    path: "/dashboard",
    component: AtasanDashboard,
  },
  {
    path: "/leave-requests",
    component: AtasanLeaveRequests,
  },
  {
    path: "/leave-requests-history",
    component: AtasanLeaveRequestsHistory,
  },
  {
    path: "/reimbursements",
    component: AtasanReimbursements,
  },
  {
    path: "/reimbursements-history",
    component: AtasanReimbursementsHistory,
  },
  {
    path: "/team-attendance",
    component: AtasanAttendance,
  },
  {
    path: "/settings-profile",
    component: ProfileSettings,
  },
  {
    path: "/404",
    component: Page404,
  },
];

const financeRoutes = [
  {
    path: "/dashboard",
    component: FinanceDashboard,
  },
  {
    path: "/payroll",
    component: FinancePayroll,
  },
  {
    path: "/payroll/revision",
    component: FinancePayrollRevision,
  },
  {
    path: "/payroll/transfers",
    component: FinancePayrollTransfers,
  },
  {
    path: "/payroll/component",
    component: FinanceAllowance,
  },
  {
    path: "/payroll/position-allowance",
    component: PositionSalary,
  },
  {
    path: "/payroll/settings",
    component: FinanceAllowancePayrollSettings,
  },
  {
    path: "/payroll/other-allowance",
    component: HRPayrollDirectorAdjustments,
  },
  {
    path: "/reimbursements",
    component: FinanceReimbursements,
  },
  {
    path: "/salary-appeals",
    component: FinanceSalaryAppeals,
  },
  {
    path: "/reports",
    component: FinanceReports,
  },
  {
    path: "/settings-profile",
    component: ProfileSettings,
  },
  {
    path: "/404",
    component: Page404,
  },
];

const candidateRoutes = [
  {
    path: "/dashboard",
    component: CandidateDashboardHome,
  },
  {
    path: "/jobs",
    component: CandidateJobList,
  },
  {
    path: "/candidate/jobs/:jobId",
    component: CandidateJobDetailPage,
  },
  {
    path: "/candidate/apply/:jobId",
    component: CandidateApplyPage,
  },
  {
    path: "/profile",
    component: CandidateProfilePage,
  },
  {
    path: "/status",
    component: CandidateRequestsPage,
  },
  {
    path: "/404",
    component: Page404,
  },
];

export const getRoutesByRole = (activeRole) => {
  if (activeRole === "admin") {
    return adminRoutes;
  }

  if (activeRole === "candidate") {
    return candidateRoutes;
  }

  if (activeRole === "hr") {
    return hrRoutes;
  }

  if (activeRole === "atasan") {
    return atasanRoutes;
  }

  if (activeRole === "finance") {
    return financeRoutes;
  }

  return pegawaiRoutes;
};

export default getRoutesByRole;
