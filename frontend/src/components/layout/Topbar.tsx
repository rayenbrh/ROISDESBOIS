import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../services/queries/authQueries';
import { cn } from '../../utils/helpers';
import { getInitials } from '../../utils/format';

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, toggleSidebar, toggleSidebarOpen, sidebarCollapsed } = useUIStore();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate('/login');
  };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20 transition-all',
      // Desktop: margin for sidebar
      sidebarCollapsed ? 'lg:right-20' : 'lg:right-64'
    )}>
      <div className="h-full px-4 flex items-center justify-between gap-2">
        {/* Left side */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* User Menu */}
          <Menu as="div" className="relative hidden sm:block">
            <Menu.Button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-3 py-2 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.firstName} {user?.lastName}
                </span>
                <div className="h-8 w-8 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-sm font-medium">
                  {user ? getInitials(user.firstName, user.lastName) : 'U'}
                </div>
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="p-2">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-right',
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        )}
                        onClick={() => navigate('/admin/settings')}
                      >
                        <UserCircleIcon className="h-5 w-5" />
                        <span>الملف الشخصي</span>
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-right text-red-600 dark:text-red-400',
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        )}
                        onClick={handleLogout}
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span>تسجيل الخروج</span>
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Notifications */}
          <button className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors hidden md:block">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 left-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {theme === 'light' ? (
              <MoonIcon className="h-5 w-5 md:h-6 md:w-6" />
            ) : (
              <SunIcon className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </button>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-lg mx-2 md:mx-4 hidden sm:block">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-lg pr-10 pl-4 py-2 text-sm text-right focus:ring-2 focus:ring-[#D4AF37] text-gray-900 dark:text-gray-100 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right side - Sidebar toggle */}
        <div className="flex items-center gap-2">
          {/* Mobile menu toggle */}
          <button
            onClick={toggleSidebarOpen}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors hidden lg:block"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
