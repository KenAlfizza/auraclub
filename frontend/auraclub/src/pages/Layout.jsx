import React from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app/appSidebar"
import Header from "@/components/app/appHeader"


const Layout = ({ children, header, sidebar }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Render header only if provided */}
      {header && <Header />}

      {/* Main content */}
      {/* Render sidebar only if provided */}
      {sidebar ? (
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 flex justify-center items-center p-6 bg-gray-100">
            {children}
          </main>
        </SidebarProvider>
      ) : (
        <main className="flex-1 flex justify-center items-center p-6 bg-gray-100">
          {children}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        &copy; {new Date().getFullYear()} AuraClub
      </footer>
    </div>
  );
};

export default Layout;