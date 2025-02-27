"use client";

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Sidebar from '../Sidebar';
import useSidebar from '@/hooks/useSidebar';
import { Toaster } from 'react-hot-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar();
  
  return (
    <div className="h-screen flex">
      {/* Toast notifications */}
      <Toaster position="top-center" />
      
      {/* Sidebar component */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Top header with toggle button */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none lg:hidden"
          >
            {isSidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}