import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { NotificacoesDropdown } from "@/components/NotificacoesDropdown";

import { 
  Home, 
  Search, 
  FileText, 
  User, 
  ChefHat,
  LogOut,
  Bell,
  Star,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfissionalLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: "Início", path: "/app/profissional" },
  { icon: Search, label: "Oportunidades", path: "/app/profissional/oportunidades" },
  { icon: FileText, label: "Candidaturas", path: "/app/profissional/candidaturas" },
  { icon: FileText, label: "Documentos", path: "/app/profissional/documentos" },
  { icon: User, label: "Perfil", path: "/app/profissional/perfil" },
  { icon: Trophy, label: "Ranking", path: "/app/profissional/ranking" },
  { icon: Star, label: "Avaliar", path: "/app/profissional/avaliacoes" },
];


export const ProfissionalLayout = ({ children }: ProfissionalLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link to="/app/profissional" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground hidden sm:block">
              Tem Staff
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={isActive ? "text-foreground" : "text-muted-foreground"}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <RoleSwitcher />
            <NotificacoesDropdown />

            
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Bottom Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border md:hidden">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center p-2">
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-xs mt-1 ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  );
};
