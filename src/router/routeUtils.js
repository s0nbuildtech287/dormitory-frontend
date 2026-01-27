import { ADMIN_ROUTES, STUDENT_ROUTES } from './index.js';
import { UserRole } from '../utils/types.js';

/**
 * Navigation handler utilities
 */
export const routeUtils = {
  /**
   * Get menu items based on user role
   * @param {string} role - User role
   * @returns {Array} Menu items
   */
  getMenuItems: (role) => {
    return role === UserRole.ADMIN ? ADMIN_ROUTES : STUDENT_ROUTES;
  },

  /**
   * Check if user can access route
   * @param {string} routeId - Route id
   * @param {string} userRole - User role
   * @returns {boolean}
   */
  canAccessRoute: (routeId, userRole) => {
    const routes = routeUtils.getMenuItems(userRole);
    return routes.some((route) => route.id === routeId);
  },

  /**
   * Get default route for user role
   * @param {string} role - User role
   * @returns {string} Default route id
   */
  getDefaultRoute: (role) => {
    return role === UserRole.ADMIN ? 'dashboard' : 'profile';
  },

  /**
   * Validate navigation
   * @param {string} fromRoute - Current route
   * @param {string} toRoute - Target route
   * @param {string} userRole - User role
   * @returns {boolean}
   */
  isValidNavigation: (fromRoute, toRoute, userRole) => {
    return routeUtils.canAccessRoute(toRoute, userRole);
  },
};

export default routeUtils;
