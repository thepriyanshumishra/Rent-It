import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[var(--bg)] text-[var(--text)] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <AdminSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative z-50 h-full w-[240px]">
            <AdminSidebar 
              collapsed={false} 
              onToggle={() => setMobileMenuOpen(false)} 
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* We'll pass an empty title here and let child pages set it if needed, or use a context.
            For now, we'll let children provide their own specific header content if needed,
            but a global header is fine. */}
        <AdminHeader 
          title="Admin Portal" 
          onMenuToggle={() => setMobileMenuOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ setSidebarCollapsed }} />
        </main>
      </div>
    </div>
  );
}
