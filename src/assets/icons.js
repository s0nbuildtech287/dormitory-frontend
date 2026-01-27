/**
 * Icon mappings for lucide-react
 * Maps icon names to components for dynamic rendering
 */
export const ICON_MAP = {
  LayoutDashboard: 'LayoutDashboard',
  Users: 'Users',
  Home: 'Home',
  FileText: 'FileText',
  CreditCard: 'CreditCard',
  Bell: 'Bell',
  MessageSquare: 'MessageSquare',
  LogOut: 'LogOut',
  Menu: 'Menu',
  UserCircle: 'UserCircle',
  ShieldCheck: 'ShieldCheck',
  KeyRound: 'KeyRound',
  Lock: 'Lock',
  LogIn: 'LogIn',
  ChevronDown: 'ChevronDown',
  ChevronRight: 'ChevronRight',
  Search: 'Search',
  Filter: 'Filter',
  Plus: 'Plus',
  Edit: 'Edit',
  Trash2: 'Trash2',
  Eye: 'Eye',
  EyeOff: 'EyeOff',
  Download: 'Download',
  Upload: 'Upload',
  Check: 'Check',
  X: 'X',
  AlertCircle: 'AlertCircle',
  Loader: 'Loader',
  Zap: 'Zap',
};

/**
 * Get icon name
 * @param {string} iconKey - Icon key
 * @returns {string} Icon name
 */
export const getIconName = (iconKey) => {
  return ICON_MAP[iconKey] || 'Zap';
};

export default ICON_MAP;
