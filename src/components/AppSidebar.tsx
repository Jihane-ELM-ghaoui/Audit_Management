import { useEffect, useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  Menu,
  ChevronLeft,
  FileText,
  ClipboardCheck,
  AtSign,
  List,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthProvider";

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dash", roles: ["project_manager"] },
  { label: "Admin Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/admin", roles: ["admin"] },
  { label: "Demande d'Audit", icon: <ClipboardCheck className="w-5 h-5" />, path: "/audit-request", roles: ["admin", "project_manager"] },
  { label: "Liste des Demandes", icon: <FileText className="w-5 h-5" />, path: "/demande-list", roles: ["admin", "gacam_team"] },
  { label: "Liste des Affectations", icon: <List className="w-5 h-5" />, path: "/affect-list", roles: ["admin", "gacam_team"] },
  { label: "Liste des Audits", icon: <ClipboardList className="w-5 h-5" />, path: "/list", roles: ["admin", "gacam_team"] },
  { label: "Plan", icon: <Calendar className="w-5 h-5" />, path: "/plan", roles: ["admin", "gacam_team"] },
  { label: "Liste des Prestataires", icon: <Handshake className="w-5 h-5" />, path: "/prestataires", roles: ["admin", "gacam_team"] },
  { label: "Liste des Auditeurs", icon: <Users className="w-5 h-5" />, path: "/auditeurs", roles: ["admin", "gacam_team"] },
  { label: "Liste des IPs", icon: <AtSign className="w-5 h-5" />, path: "/ips", roles: ["admin", "gacam_team"] },
];

const roleAccess: { [key: string]: string[] } = {
  admin: navItems.map((item) => item.path),
  gacam_team: navItems.map((item) => item.path),
  project_manager: ["/dash", "/audit-request"],
};

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { roles } = useAuth();

  useEffect(() => {
    if (!isMobile) {
      const saved = localStorage.getItem("sidebarCollapsed");
      if (saved) setCollapsed(JSON.parse(saved));
    } else {
      setCollapsed(true);
    }
  }, [isMobile]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      const newState = !collapsed;
      setCollapsed(newState);
      localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
    }
  };

  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  const getAllowedPaths = () => {
    if (roles.includes("admin")) return roleAccess.admin;
    if (roles.includes("gacam_team")) return roleAccess.gacam_team;
    if (roles.includes("project_manager")) return roleAccess.project_manager;
    return [];
  };

  const allowedPaths = getAllowedPaths();

  return (
    <>
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={handleOverlayClick}
        />
      )}

      {isMobile && (
        <div className="sticky top-0 z-50 flex items-center justify-between bg-white border-b px-4 py-3 shadow-sm">
          <Link to="/">
            <h1 className="text-gacam-green font-bold text-xl">GACAM</h1>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-muted"
            onClick={toggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      )}

      <aside
        className={`${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'sticky top-0 h-screen'} 
          bg-white border-r transition-all duration-300 shadow-sm
          ${collapsed && !isMobileMenuOpen ? "w-[72px]" : "w-[240px]"}
          ${isMobile && !isMobileMenuOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          {(!collapsed || isMobileMenuOpen) && (
            <Link to="/">
              <h1 className="text-gacam-green font-bold text-xl cursor-pointer transition-colors hover:text-gacam-red-vivid">GACAM</h1>
            </Link>
          )}
          {!isMobile && (
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full hover:bg-muted text-gacam-red-vivid"
              onClick={toggleSidebar}
            >
              {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          )}
        </div>

        <nav className="mt-4">
          <TooltipProvider>
            {navItems
              .filter((item) => item.roles.some((role) => roles.includes(role)))
              .map(({ label, icon, path }) => {
                const isActive = location.pathname === path;
                return (
                  <Tooltip key={label} delayDuration={200}>
                    <TooltipTrigger asChild>
                      <NavLink to={path} className="block">
                        <div
                          className={`flex items-center gap-3 px-4 py-2 mx-2 my-1 rounded-lg transition-all duration-200
                          ${isActive ? "bg-gacam-green/90 text-white shadow-sm" : "text-gray-700 hover:bg-muted"}`}
                        >
                          <div
                            className={`shrink-0 p-1 rounded-md ${
                              isActive ? "bg-white text-gacam-red-vivid" : "text-gray-500"
                            }`}
                          >
                            {icon}
                          </div>
                          {(!collapsed || isMobileMenuOpen) && (
                            <span className="text-sm font-medium">{label}</span>
                          )}
                        </div>
                      </NavLink>
                    </TooltipTrigger>
                    {collapsed && !isMobileMenuOpen && !isMobile && (
                      <TooltipContent side="right">{label}</TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
          </TooltipProvider>
        </nav>
      </aside>
    </>
  );
};

export default AppSidebar;
