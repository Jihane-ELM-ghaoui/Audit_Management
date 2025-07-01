import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import Footer from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthProvider"; 

const Layout = () => {
  const isMobile = useIsMobile();
  const { authenticated } = useAuth(); // 

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar visible seulement si connecté */}
      {authenticated && !isMobile && <AppSidebar />}

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        {/* Sidebar mobile si connecté */}

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
