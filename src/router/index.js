import React from 'react';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import RegistrationManagement from '../pages/RegistrationManagement.jsx';
import StudentDashboard from '../pages/StudentDashboard.jsx';
import RoomManagement from '../pages/RoomManagement.jsx';
import StudentManagement from '../pages/StudentManagement.jsx';
import BillingManagement from '../pages/BillingManagement.jsx';
import NotificationManagement from '../pages/NotificationManagement.jsx';
import FeedbackManagement from '../pages/FeedbackManagement.jsx';
import { UserRole } from '../utils/types.js';

// Admin Routes
export const ADMIN_ROUTES = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    path: '/dashboard',
    component: AdminDashboard,
    icon: 'LayoutDashboard',
    role: UserRole.ADMIN,
  },
  {
    id: 'registrations',
    label: 'Hồ sơ đăng ký',
    path: '/registrations',
    component: RegistrationManagement,
    icon: 'FileText',
    role: UserRole.ADMIN,
  },
  {
    id: 'rooms',
    label: 'Quản lý phòng',
    path: '/rooms',
    component: RoomManagement,
    icon: 'Home',
    role: UserRole.ADMIN,
  },
  {
    id: 'students',
    label: 'Sinh viên & Hợp đồng',
    path: '/students',
    component: StudentManagement,
    icon: 'Users',
    role: UserRole.ADMIN,
  },
  {
    id: 'billing',
    label: 'Hóa đơn',
    path: '/billing',
    component: BillingManagement,
    icon: 'CreditCard',
    role: UserRole.ADMIN,
  },
  {
    id: 'notifications',
    label: 'Thông báo',
    path: '/notifications',
    component: NotificationManagement,
    icon: 'Bell',
    role: UserRole.ADMIN,
  },
  {
    id: 'feedback',
    label: 'Phản ánh',
    path: '/feedback',
    component: FeedbackManagement,
    icon: 'MessageSquare',
    role: UserRole.ADMIN,
  },
];

// Student Routes
export const STUDENT_ROUTES = [
  {
    id: 'profile',
    label: 'Thông tin cá nhân',
    path: '/profile',
    component: StudentDashboard,
    icon: 'UserCircle',
    role: UserRole.STUDENT,
  },
  {
    id: 'contract',
    label: 'Hợp đồng KTX',
    path: '/contract',
    component: StudentDashboard,
    icon: 'FileText',
    role: UserRole.STUDENT,
  },
  {
    id: 'bills',
    label: 'Theo dõi hóa đơn',
    path: '/bills',
    component: StudentDashboard,
    icon: 'CreditCard',
    role: UserRole.STUDENT,
  },
  {
    id: 'notifications',
    label: 'Thông báo',
    path: '/notifications',
    component: StudentDashboard,
    icon: 'Bell',
    role: UserRole.STUDENT,
  },
  {
    id: 'feedback',
    label: 'Gửi phản ánh',
    path: '/feedback',
    component: StudentDashboard,
    icon: 'MessageSquare',
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
