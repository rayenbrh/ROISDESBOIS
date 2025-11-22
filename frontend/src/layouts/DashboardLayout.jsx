import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiHome,
  FiPackage,
  FiLayers,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { useState } from 'react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: FiHome, label: 'لوحة التحكم' },
    { path: '/products', icon: FiPackage, label: 'المنتجات' },
    { path: '/configurable-products', icon: FiLayers, label: 'المنتجات المركبة' },
    { path: '/orders', icon: FiShoppingCart, label: 'الطلبات' },
    { path: '/inventory', icon: FiTrendingUp, label: 'المخزون' },
    { path: '/users', icon: FiUsers, label: 'المستخدمين', adminOnly: true },
    { path: '/settings', icon: FiSettings, label: 'الإعدادات', adminOnly: true },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-dark-100 border-l border-gray-200 dark:border-dark-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-dark-200">
          {sidebarOpen && (
            <h1 className="text-xl font-bold gold-gradient bg-clip-text text-transparent">
              Les Rois des Bois
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gold-500 text-white shadow-gold'
                      : 'hover:bg-gray-100 dark:hover:bg-dark-200'
                  }`
                }
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 p-2 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-all"
              title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded-lg transition-all"
              title="تسجيل الخروج"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
