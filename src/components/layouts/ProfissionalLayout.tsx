import { ReactNode, useState } from "react";
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
  Star,
  Trophy,
  Menu,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface ProfissionalLayoutProps {
  children: ReactNode;
}

type NavItem = { icon: LucideIcon; label: string; path: string };

const desktopNavItems: NavItem[] = [
  { icon: Home, label: "Início", path: "/app/profissional" },
  { icon: Search, label: "Oportunidades", path: "/app/profissional/oportunidades" },
  { icon: FileText, label: "Candidaturas", path: "/app/profissional/candidaturas" },
  { icon: FileText, label: "Documentos", path: "/app/profissional/documentos" },
  { icon: User, label: "Perfil", path: "/app/profissional/perfil" },
  { icon: Trophy, label: "Ranking", path: "/app/profissional/ranking" },
  { icon: Star, label: "Avaliar", path: "/app/profissional/avaliacoes" },
  { icon: BookOpen, label: "Treinamentos", path: "/app/profissional/treinamentos" },
];

const primaryMobileItems: NavItem[] = [
  { icon: Home, label: "Início", path: "/app/profissional" },
  { icon: Search, label: "Oportunidades", path: "/app/profissional/oportunidades" },
  { icon: FileText, label: "Candidaturas", path: "/app/profissional/candidaturas" },
  { icon: BookOpen, label: "Treinamentos", path: "/app/profissional/treinamentos" },
];

const moreMenuItems: NavItem[] = [
  { icon: User, label: "Perfil", path: "/app/profissional/perfil" },
  { icon: FileText, label: "Documentos", path: "/app/profissional/documentos" },
  { icon: Trophy, label: "Ranking", path: "/app/profissional/ranking" },
  { icon: Star, label: "Avaliações", path: "/app/profissional/avaliacoes" },
];

export const ProfissionalLayout = ({ children }: ProfissionalLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const isMoreActive = moreMenuItems.some((i) => location.pathname === i.path);

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
            {desktopNavItems.map((item) => {
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
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white md:hidden"
        style={{
          boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="grid grid-cols-5 h-16">
          {primaryMobileItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1"
              >
                <item.icon
                  size={22}
                  style={{ color: isActive ? "#F97316" : "#9CA3AF" }}
                />
                <span
                  className="font-medium leading-none"
                  style={{
                    fontSize: "11px",
                    color: isActive ? "#F97316" : "#9CA3AF",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1"
              >
                <Menu
                  size={22}
                  style={{ color: isMoreActive ? "#F97316" : "#9CA3AF" }}
                />
                <span
                  className="font-medium leading-none"
                  style={{
                    fontSize: "11px",
                    color: isMoreActive ? "#F97316" : "#9CA3AF",
                  }}
                >
                  Mais
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Mais opções</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-3 mt-4 pb-4">
                {moreMenuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMoreOpen(false)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                    >
                      <item.icon
                        size={24}
                        style={{ color: isActive ? "#F97316" : "#374151" }}
                      />
                      <span
                        className="text-xs font-medium text-center"
                        style={{ color: isActive ? "#F97316" : "#374151" }}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4">{children}</div>
      </main>
    </div>
  );
};
