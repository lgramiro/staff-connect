import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Briefcase, 
  FileText, 
  CreditCard, 
  HeadphonesIcon, 
  Settings,
  ChefHat,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Building2, label: "Estabelecimentos", path: "/admin/estabelecimentos" },
  { icon: Users, label: "Profissionais", path: "/admin/profissionais" },
  { icon: Briefcase, label: "Vagas & Escalas", path: "/admin/vagas" },
  { icon: FileText, label: "Documentos", path: "/admin/documentos" },
  { icon: CreditCard, label: "Planos & Assinaturas", path: "/admin/planos" },
  { icon: HeadphonesIcon, label: "Suporte", path: "/admin/suporte" },
  { icon: Settings, label: "Configurações", path: "/admin/configuracoes" },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center flex-shrink-0">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              {!sidebarCollapsed && (
                <span className="font-display text-lg font-bold text-sidebar-foreground">
                  Admin
                </span>
              )}
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-primary" 
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    } ${sidebarCollapsed ? "px-2" : ""}`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${sidebarCollapsed ? "" : "mr-3"}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-sidebar-border">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-sidebar-foreground">A</span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">Admin</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">admin@temstaff.com</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-9 bg-muted/50 border-0"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
