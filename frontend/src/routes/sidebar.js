/** Icons are imported separatly to reduce build time */
import Squares2X2Icon from "@heroicons/react/24/outline/Squares2X2Icon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import IdentificationIcon from "@heroicons/react/24/outline/IdentificationIcon";
import ClipboardDocumentListIcon from "@heroicons/react/24/outline/ClipboardDocumentListIcon";
import CalendarDaysIcon from "@heroicons/react/24/outline/CalendarDaysIcon";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import BanknotesIcon from "@heroicons/react/24/outline/BanknotesIcon";
import WalletIcon from "@heroicons/react/24/outline/WalletIcon";
import ReceiptPercentIcon from "@heroicons/react/24/outline/ReceiptPercentIcon";
import BriefcaseIcon from "@heroicons/react/24/outline/BriefcaseIcon";
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import ClipboardDocumentCheckIcon from "@heroicons/react/24/outline/ClipboardDocumentCheckIcon";
import UserPlusIcon from "@heroicons/react/24/outline/UserPlusIcon";
import {
  ClockIcon,
  ReceiptRefundIcon,
  CheckBadgeIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";

const iconClasses = `h-6 w-6`;

const adminRoutes = [
  {
    path: "/app/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "Dashboard Admin",
  },
  {
    path: "/app/positions",
    icon: <UsersIcon className={iconClasses} />,
    name: "Derpartemen & Jabatan",
  },
  {
    path: "/app/users",
    icon: <UsersIcon className={iconClasses} />,
    name: "Kelola Pengguna",
  },
  {
    path: "/app/employees",
    icon: <IdentificationIcon className={iconClasses} />,
    name: "Data Pegawai",
  },
  {
    path: "/app/activity-logs",
    icon: <ClipboardDocumentListIcon className={iconClasses} />,
    name: "Log Aktivitas",
  },
];

const pegawaiRoutes = [
  {
    path: "/app/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "Dashboard Pegawai",
  },
  {
    path: "/app/attendance",
    icon: <CalendarDaysIcon className={iconClasses} />,
    name: "Kehadiran",
    submenu: [
      {
        path: "/app/attendance",
        icon: <ClipboardDocumentCheckIcon className={iconClasses} />,
        name: "Presensi",
      },
      {
        path: "/app/warning-letters",
        icon: <DocumentTextIcon className={iconClasses} />,
        name: "Disiplin Kehadiran",
      },
    ],
  },
  {
    path: "/app/leave-requests",
    icon: <ClipboardDocumentListIcon className={iconClasses} />,
    name: "Ajukan Cuti & Izin",
  },
  {
    path: "/app/payroll",
    icon: <BanknotesIcon className={iconClasses} />,
    name: "Slip Gaji",
  },
  {
    path: "/app/salary-appeals",
    icon: <ScaleIcon className={iconClasses} />,
    name: "Ajukan Banding Gaji",
  },
  {
    path: "/app/reimbursements",
    icon: <ReceiptRefundIcon className={iconClasses} />,
    name: "Ajukan Reimbursement",
  },
];

const hrRoutes = [
  {
    path: "/app/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "Dashboard HR",
  },

  {
    path: "",
    icon: <UserPlusIcon className={iconClasses} />,
    name: "Rekrutmen",
    submenu: [
      {
        path: "/app/job-openings",
        icon: <BriefcaseIcon className={iconClasses} />,
        name: "Daftar Lowongan Kerja",
      },

      {
        path: "/app/recruitment-process",
        icon: <UserGroupIcon className={iconClasses} />,
        name: "Daftar Kandidat",
      },

      {
        path: "/app/Interview-process",
        icon: <DocumentTextIcon className={iconClasses} />,
        name: "Wawancara",
      },

      {
        path: "/app/Hire-candidates",
        icon: <ClipboardDocumentListIcon className={iconClasses} />,
        name: "Kandidat yang lolos",
      },
    ],
  },
  {
    path: "/app/employees",
    icon: <IdentificationIcon className={iconClasses} />,
    name: "Data Pegawai",
  },

  {
    path: "/app/attendance",
    icon: <CalendarDaysIcon className={iconClasses} />,
    name: "Kehadiran Pegawai",
    submenu: [
      {
        path: "/app/attendance",
        icon: <CalendarDaysIcon className={iconClasses} />,
        name: "Absensi Pegawai",
      },
      {
        path: "/app/warning-letters",
        icon: <DocumentTextIcon className={iconClasses} />,
        name: "Disiplin Kehadiran",
      },
    ],
  },

  {
    path: "/app/leave-requests",
    icon: <DocumentTextIcon className={iconClasses} />,
    name: "Riwayat Izin/Cuti",
  },

  {
    path: "/app/reimbursements",
    icon: <WalletIcon className={iconClasses} />,
    name: "Validasi Reimbursement",
  },

  {
    path: "/app/hr-allowance",
    icon: <BanknotesIcon className={iconClasses} />,
    name: "Manajemen Payroll",
  },

  {
    path: "/app/salary-appeals",
    icon: <ReceiptPercentIcon className={iconClasses} />,
    name: "Review Banding Gaji",
  },
];

const atasanRoutes = [
  {
    path: "/app/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "Dashboard Atasan",
  },
  {
    path: "",
    icon: <CalendarDaysIcon className={iconClasses} />,
    name: "Cuti dan Izin Anggota Tim",
    submenu: [
      {
        path: "/app/leave-requests",
        icon: <ClipboardDocumentCheckIcon className={iconClasses} />,
        name: "Persetujuan Cuti & Izin",
      },
      {
        path: "/app/leave-requests-history",
        icon: <ClockIcon className={iconClasses} />,
        name: "Riwayat Cuti & Izin",
      },
    ],
  },
  {
    path: "",
    icon: <BanknotesIcon className={iconClasses} />,
    name: "Reimbursement Anggota Tim",
    submenu: [
      {
        path: "/app/reimbursements",
        icon: <CheckBadgeIcon className={iconClasses} />,
        name: "Persetujuan Reimbursement",
      },
      {
        path: "/app/reimbursements-history",
        icon: <ReceiptRefundIcon className={iconClasses} />,
        name: "Riwayat Reimbursement",
      },
    ],
  },
  {
    path: "/app/team-attendance",
    icon: <CalendarDaysIcon className={iconClasses} />,
    name: "Kehadiran Tim",
  },
];

const financeRoutes = [
  {
    path: "/app/dashboard",
    icon: <Squares2X2Icon className={iconClasses} />,
    name: "Dashboard Finance",
  },
  {
    path: "/app/payroll/component",
    icon: <BanknotesIcon className={iconClasses} />,
    name: "Komponen Payroll",
  },
  {
    path: "/app/reimbursements",
    icon: <WalletIcon className={iconClasses} />,
    name: "Data Reimbursement",
  },
  {
    path: "/app/payroll",
    icon: <BanknotesIcon className={iconClasses} />,
    name: "Kelola Payroll",
  },
  {
    path: "/app/salary-appeals",
    icon: <ReceiptPercentIcon className={iconClasses} />,
    name: "Banding Gaji",
  },
  {
    path: "/app/payroll/transfers",
    icon: <BanknotesIcon className={iconClasses} />,
    name: "Riwayat Slip Gaji",
  },
  {
    path: "/app/reports",
    icon: <DocumentTextIcon className={iconClasses} />,
    name: "Laporan Keuangan",
  },
];

export const getSidebarByRole = (activeRole) => {
  if (activeRole === "admin") {
    return adminRoutes;
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

export default getSidebarByRole;
