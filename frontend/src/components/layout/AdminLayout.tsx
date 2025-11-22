import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../utils/helpers';

const AdminLayout: React.FC = () => {
  const { sidebarCollapsed, sidebarOpen, toggleSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <Topbar />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebarOpen}
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          // Desktop: margin based on sidebar state
          sidebarCollapsed ? 'lg:mr-20' : 'lg:mr-64'
        )}
      >
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
