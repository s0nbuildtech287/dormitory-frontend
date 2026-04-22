import React from "react";
import AdminDashboard from "../pages/admin_dashboard/index.jsx";
import RegistrationManagement from "../pages/registration_management/index.jsx";
import StudentDashboard from "../pages/student/index.jsx";
import RoomManagement from "../pages/room_management/index.jsx";
import AssetManagement from "../pages/asset_management/index.jsx";
import ContractManagement from "../pages/contract_management/index.jsx";
import DisciplineManagement from "../pages/discipline_management/index.jsx";
import BillingManagement from "../pages/billing_management/index.jsx";
import NotificationManagement from "../pages/notification_management/index.jsx";
import FeedbackManagement from "../pages/feedback_management/index.jsx";
import ProfileAdmin from "../pages/profile_admin/index.jsx";
import { UserRole } from "../utils/types.js";

// Admin Routes
export const ADMIN_ROUTES = [
  {
    id: "dashboard",
    label: "Tổng quan",
    path: "/dashboard",
    component: AdminDashboard,
    icon: "LayoutDashboard",
    role: UserRole.ADMIN,
  },
  {
    id: "registrations",
    label: "Hồ sơ đăng ký",
    path: "/registrations",
    component: RegistrationManagement,
    icon: "FileText",
    role: UserRole.ADMIN,
  },
  {
    id: "students",
    label: "Hợp đồng sinh viên",
    path: "/students",
    component: ContractManagement,
    icon: "ScrollText",
    role: UserRole.ADMIN,
    submenu: [
      {
        id: "students-list",
        label: "Thông tin sinh viên",
        path: "/students",
        component: ContractManagement,
        icon: "UserCheck",
      },
      {
        id: "discipline",
        label: "Cảnh báo kỷ luật",
        path: "/discipline",
        component: DisciplineManagement,
        icon: "ShieldAlert",
      },
    ],
  },
  {
    id: "rooms",
    label: "Quản lý phòng",
    path: "/rooms",
    component: RoomManagement,
    icon: "Building2",
    role: UserRole.ADMIN,
    submenu: [
      {
        id: "rooms-list",
        label: "Thông tin phòng",
        path: "/rooms",
        component: RoomManagement,
        icon: "DoorOpen",
      },
      {
        id: "assets",
        label: "Cơ sở vật chất",
        path: "/assets",
        component: AssetManagement,
        icon: "Package",
      },
    ],
  },
  {
    id: "billing",
    label: "Hóa đơn",
    path: "/billing",
    component: BillingManagement,
    icon: "CreditCard",
    role: UserRole.ADMIN,
  },
  {
    id: "notifications",
    label: "Thông báo",
    path: "/notifications",
    component: NotificationManagement,
    icon: "Bell",
    role: UserRole.ADMIN,
  },
  {
    id: "feedback",
    label: "Phản ánh",
    path: "/feedback",
    component: FeedbackManagement,
    icon: "MessageSquare",
    role: UserRole.ADMIN,
  },
];

// Student Routes
export const STUDENT_ROUTES = [
  {
    id: "profile",
    label: "Thông tin cá nhân",
    path: "/profile",
    component: StudentDashboard,
    icon: "UserCircle",
    role: UserRole.STUDENT,
  },
  {
    id: "contract",
    label: "Hợp đồng sinh viên",
    path: "/contract",
    component: StudentDashboard,
    icon: "FileText",
    role: UserRole.STUDENT,
  },
  {
    id: "bills",
    label: "Theo dõi hóa đơn",
    path: "/bills",
    component: StudentDashboard,
    icon: "CreditCard",
    role: UserRole.STUDENT,
  },
  {
    id: "home",
    label: "Thông báo",
    path: "/home",
    component: StudentDashboard,
    icon: "Bell",
    role: UserRole.STUDENT,
  },
  {
    id: "news",
    label: "Tin tức TLU",
    path: "/news",
    component: StudentDashboard,
    icon: "Newspaper",
    role: UserRole.STUDENT,
  },
  {
    id: "feedback",
    label: "Gửi phản ánh",
    path: "/feedback",
    component: StudentDashboard,
    icon: "MessageSquare",
    role: UserRole.STUDENT,
  },
  {
    id: "regulations",
    label: "Nội quy",
    path: "/regulations",
    component: StudentDashboard,
    icon: "BookOpen",
    role: UserRole.STUDENT,
  },
];

/**
 * Get routes based on user role
 * @param {string} role - User role
 * @returns {Array} Routes for the role
 */
export const getRoutesByRole = (role) => {
  return role === UserRole.ADMIN ? ADMIN_ROUTES : STUDENT_ROUTES;
};

/**
 * Get route by id
 * @param {string} id - Route id
 * @param {string} role - User role
 * @returns {Object} Route object
 */
export const getRouteById = (id, role) => {
  const routes = getRoutesByRole(role);
  return routes.find((route) => route.id === id);
};

/**
 * Get component by route id
 * @param {string} id - Route id
 * @param {string} role - User role
 * @returns {Component} Component for the route
 */
export const getComponentByRouteId = (id, role) => {
  const route = getRouteById(id, role);
  return route ? route.component : null;
};
