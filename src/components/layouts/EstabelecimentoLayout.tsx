import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CalendarDays, 
  Briefcase, 
  History, 
  User, 
  CreditCard,
  ChefHat,
  LogOut,
  Bell,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface EstabelecimentoLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: CalendarDays, label: "Calendário", path: "/app/estabelecimento" },
  { icon: Briefcase, label: "Vagas", path: "/app/estabelecimento/vagas" },
  { icon: History, label: "Histórico", path: "/app/estabelecimento/historico" },
  { icon: User, label: "Perfil", path: "/app/estabelecimento/perfil" },
  { icon: CreditCard, label: "Plano", path: "/app/estabelecimento/plano" },
];

export const EstabelecimentoLayout = ({ children }: EstabelecimentoLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <Link to="/app/estabelecimento" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-hero flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-foreground hidden sm:block">
                Tem Staff
              </span>
            </Link>
          </div>

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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-16 bottom-0 w-64 bg-card border-r border-border p-4 animate-slide-in-right">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Bottom Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border md:hidden">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => {
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
