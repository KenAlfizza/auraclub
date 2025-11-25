import React from "react";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app/appSidebar"


const Layout = ({ children, header }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Render header only if provided */}
      {header && <div>{header}</div>}

      {/* Main content */}
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex justify-center items-center p-6 bg-gray-100">
          {children}
        </main>
      </SidebarProvider>  

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        &copy; {new Date().getFullYear()} AuraClub
      </footer>
    </div>
  );
};

export default Layout;