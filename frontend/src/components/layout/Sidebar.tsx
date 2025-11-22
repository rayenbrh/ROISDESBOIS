import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CubeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';
import { useUIStore } from '../../store/uiStore';

const navItems = [
  { name: 'لوحة التحكم', path: '/admin', icon: HomeIcon },
  { name: 'المستخدمون', path: '/admin/users', icon: UsersIcon },
  { name: 'الفئات', path: '/admin/categories', icon: FolderIcon },
  { name: 'المكونات', path: '/admin/components', icon: CubeIcon },
  { name: 'المنتجات', path: '/admin/products', icon: ShoppingBagIcon },
  { name: 'الطلبات', path: '/admin/orders', icon: ShoppingCartIcon },
  { name: 'الفواتير', path: '/admin/invoices', icon: DocumentTextIcon },
  { name: 'التحليلات', path: '/admin/analytics', icon: ChartBarIcon },
  { name: 'الإعدادات', path: '/admin/settings', icon: Cog6ToothIcon },
  { name: 'سجل المراجعة', path: '/admin/audit', icon: ClipboardDocumentListIcon },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed right-0 top-0 bottom-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 z-30',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <h1 className={cn(
          'font-bold text-[#D4AF37] transition-all',
          sidebarCollapsed ? 'text-xl' : 'text-2xl'
        )}>
          {sidebarCollapsed ? 'RDB' : 'Les Rois des Bois'}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-[#D4AF37] bg-opacity-10 text-[#D4AF37] font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                sidebarCollapsed && 'justify-center'
              )}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <Icon className="h-6 w-6 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
