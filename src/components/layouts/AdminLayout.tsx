import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { AdminViewAs } from "@/components/AdminViewAs";
import { NotificacoesDropdown } from "@/components/NotificacoesDropdown";
import { useAdminGlobalSearch, SearchResult } from "@/hooks/useAdminGlobalSearch";

import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  CreditCard, 
  Settings,
  ChefHat,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Usuários", path: "/admin/usuarios" },
  { icon: Users, label: "Profissionais", path: "/admin/profissionais" },
  { icon: Building2, label: "Estabelecimentos", path: "/admin/estabelecimentos" },
  { icon: Briefcase, label: "Slots", path: "/admin/slots" },
  { icon: Briefcase, label: "Candidaturas", path: "/admin/candidaturas" },
  { icon: CreditCard, label: "Avaliações", path: "/admin/avaliacoes" },
  { icon: CreditCard, label: "Planos", path: "/admin/planos" },
  { icon: CreditCard, label: "Assinaturas", path: "/admin/assinaturas" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
  { icon: Settings, label: "Logs", path: "/admin/logs" },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { signOut, profile } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: results, isLoading } = useAdminGlobalSearch(debouncedSearch);

  useEffect(() => {
    if (debouncedSearch.length >= 3) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [debouncedSearch]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleResultClick = (result: SearchResult) => {
    setOpen(false);
    setSearchTerm("");
    if (result.tipo === "profissional") {
      navigate("/admin/profissionais");
    } else if (result.tipo === "estabelecimento") {
      navigate("/admin/estabelecimentos");
    } else {
      navigate("/admin/usuarios");
    }
  };

  const hasResults = results && (
    results.profissionais.length > 0 || 
    results.estabelecimentos.length > 0 || 
    results.usuarios.length > 0
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="flex flex-col h-full">
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

          <div className="p-4 border-t border-sidebar-border">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-sidebar-foreground">{profile?.nome?.charAt(0) || "A"}</span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.nome || "Admin"}</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar profissionais, estabelecimentos..." 
                      className="pl-9 bg-muted/50 border-0"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[400px] p-0" 
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <ScrollArea className="max-h-[400px]">
                    {!hasResults && !isLoading && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Nenhum resultado encontrado para "{debouncedSearch}"
                      </div>
                    )}
                    
                    {results?.profissionais && results.profissionais.length > 0 && (
                      <div className="p-2">
                        <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Profissionais
                        </p>
                        {results.profissionais.map((p) => (
                          <button
                            key={p.id}
                            className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                            onClick={() => handleResultClick(p)}
                          >
                            {p.nome}
                          </button>
                        ))}
                      </div>
                    )}

                    {results?.estabelecimentos && results.estabelecimentos.length > 0 && (
                      <div className="p-2 border-t">
                        <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Estabelecimentos
                        </p>
                        {results.estabelecimentos.map((e) => (
                          <button
                            key={e.id}
                            className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                            onClick={() => handleResultClick(e)}
                          >
                            {e.nome}
                          </button>
                        ))}
                      </div>
                    )}

                    {results?.usuarios && results.usuarios.length > 0 && (
                      <div className="p-2 border-t">
                        <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Usuários
                        </p>
                        {results.usuarios.map((u) => (
                          <button
                            key={u.id}
                            className="w-full text-left px-2 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                            onClick={() => handleResultClick(u)}
                          >
                            <div className="font-medium">{u.nome}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-4">
              <AdminViewAs />
              <RoleSwitcher />
              <NotificacoesDropdown />

              
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
