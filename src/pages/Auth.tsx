import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ChefHat, Building2, User, ArrowLeft, Mail, Lock, Eye, EyeOff, CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePageTitle } from "@/hooks/usePageTitle";

type UserRole = "estabelecimento" | "profissional";
type AuthMode = "login" | "signup";

// ── Branding Panel ─────────────────────────────────────────────
const BrandingPanel = ({ mode, role }: { mode: AuthMode; role: UserRole }) => (
  <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero p-12 flex-col justify-between relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary-foreground rounded-full blur-3xl" />
    </div>
    <div className="relative z-10">
      <Link to="/" className="flex items-center gap-2 text-primary-foreground">
        <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
          <ChefHat className="w-7 h-7" />
        </div>
        <span className="font-display text-2xl font-bold">Tem Staff</span>
      </Link>
    </div>
    <div className="relative z-10 space-y-6">
      <h1 className="font-display text-4xl font-bold text-primary-foreground leading-tight">
        {mode === "login" ? "Bem-vindo de volta!" : role === "estabelecimento" ? "Monte sua equipe ideal" : "Encontre as melhores oportunidades"}
      </h1>
      <p className="text-primary-foreground/80 text-lg max-w-md">
        {role === "estabelecimento"
          ? "Gerencie escalas, encontre profissionais qualificados e simplifique sua operação."
          : "Acesse centenas de vagas em restaurantes e eventos. Candidate-se com um clique."}
      </p>
      <div className="flex items-center gap-2 text-primary-foreground/80">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm">100% Grátis para profissionais</span>
      </div>
    </div>
    <div className="relative z-10 text-primary-foreground/60 text-sm">© 2024 Tem Staff. Todos os direitos reservados.</div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────
const Auth = () => {
  usePageTitle("Entrar | Tem Staff");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, setActiveRole } = useAuth();

  const initialMode = (searchParams.get("mode") as AuthMode) || "login";
  const initialRole = (searchParams.get("role") as UserRole) || "profissional";
  const isBlocked = searchParams.get("blocked") === "true";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const timeoutRef = useRef<any>(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "", nome: "" });

  // ── Post-login redirect using user_roles ──
  const redirectByProfile = async () => {
    setRedirecting(true);
    setRedirectError(null);
    timeoutRef.current = setTimeout(() => {
      setRedirecting(false);
      setRedirectError("O redirecionamento demorou muito. Tente novamente.");
    }, 5000);

    try {
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      console.log("[Auth] Usuário autenticado:", authUser?.id);
      if (userError || !authUser) {
        clearTimeout(timeoutRef.current!);
        setRedirecting(false);
        setRedirectError("Erro ao buscar usuário autenticado.");
        return;
      }

      // Fetch roles from user_roles table
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id);

      const roles = (rolesData || []).map((r: any) => (typeof r.role === "string" ? r.role.toLowerCase() : "profissional"));
      console.log("[Auth] Roles encontrados:", roles);

      // Fallback: if user_roles is empty, use profiles.role
      if (roles.length === 0) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", authUser.id).single();
        if (profile?.role) {
          const fallbackRole = typeof profile.role === "string" ? profile.role.toLowerCase() : "profissional";
          roles.push(fallbackRole);
        }
        console.log("[Auth] Fallback para profiles.role:", roles);
      }

      if (roles.length === 0) {
        clearTimeout(timeoutRef.current!);
        setRedirecting(false);
        setRedirectError("Perfil do usuário não encontrado.");
        return;
      }

      const roleRoutes: Record<string, string> = {
        admin: "/admin",
        profissional: "/app/profissional",
        estabelecimento: "/app/estabelecimento",
      };

      clearTimeout(timeoutRef.current!);

      if (roles.length === 1) {
        setActiveRole(roles[0] as any);
        navigate(roleRoutes[roles[0]] || "/app/profissional", { replace: true });
      } else {
        // Multiple roles → show role picker
        navigate("/escolher-perfil", { replace: true });
      }
    } catch (err) {
      console.error("[Auth] Erro inesperado:", err);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setRedirecting(false);
      setRedirectError("Erro inesperado. Tente novamente.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRedirectError(null);

    if (mode === "signup") {
      if (formData.password !== formData.confirmPassword) {
        toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      const { error } = await signUp(formData.email, formData.password, formData.nome, role);
      setIsLoading(false);
      if (error) {
        toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Conta criada!", description: "Verifique seu email para confirmar o cadastro." });
      }
    } else {
      const { error } = await signIn(formData.email, formData.password);
      setIsLoading(false);
      if (error) {
        toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Login realizado!", description: "Redirecionando..." });
        await redirectByProfile();
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({ title: "Informe seu email", description: "Digite seu email para recuperar a senha.", variant: "destructive" });
      return;
    }
    const { error } = await resetPassword(formData.email);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email enviado!", description: "Verifique sua caixa de entrada." });
    }
  };

  if (redirecting) {
    return null; // Silent redirect
  }

  if (redirectError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md text-center space-y-4">
          <p className="text-destructive font-medium">{redirectError}</p>
          <Button onClick={() => { setRedirectError(null); setRedirecting(false); }} variant="outline">Voltar ao Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm flex">
      <BrandingPanel mode={mode} role={role} />

      <div className="flex-1 flex flex-col p-6 lg:p-12">
        <div className="lg:hidden mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Tem Staff</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div className="flex items-center gap-2 mb-8">
              <Button variant="ghost" size="icon" asChild><Link to="/"><ArrowLeft className="w-5 h-5" /></Link></Button>
              <span className="text-muted-foreground">Voltar para o site</span>
            </div>

            {isBlocked && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                Sua conta foi bloqueada. Entre em contato com o suporte.
              </div>
            )}

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                {mode === "login" ? "Entre na sua conta" : "Crie sua conta"}
              </h2>
              <p className="text-muted-foreground">
                {mode === "login" ? "Acesse sua conta para continuar" : "Preencha os dados abaixo para começar"}
              </p>
            </div>

            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                {(["estabelecimento", "profissional"] as const).map((r) => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`p-4 rounded-xl border-2 transition-all ${role === r ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                    {r === "estabelecimento" ? <Building2 className={`w-8 h-8 mx-auto mb-2 ${role === r ? "text-primary" : "text-muted-foreground"}`} /> : <User className={`w-8 h-8 mx-auto mb-2 ${role === r ? "text-primary" : "text-muted-foreground"}`} />}
                    <p className={`font-medium text-sm ${role === r ? "text-foreground" : "text-muted-foreground"}`}>
                      {r === "estabelecimento" ? "Restaurante" : "Profissional"}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="nome">{role === "estabelecimento" ? "Nome do Estabelecimento" : "Nome Completo"}</Label>
                  <Input id="nome" placeholder={role === "estabelecimento" ? "Nome do restaurante" : "Seu nome completo"}
                    value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required className="h-12" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="seu@email.com" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="h-12 pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="h-12 pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••"
                      value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required className="h-12 pl-10" />
                  </div>
                </div>
              )}
              {mode === "login" && (
                <div className="flex justify-end">
                  <button type="button" onClick={handleForgotPassword} className="text-sm text-primary hover:underline">Esqueceu a senha?</button>
                </div>
              )}
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Carregando..." : mode === "login" ? "Entrar" : "Criar Conta"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>Não tem uma conta?{" "}<button type="button" onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Cadastre-se</button></>
              ) : (
                <>Já tem uma conta?{" "}<button type="button" onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Entre aqui</button></>
              )}
            </div>

            {mode === "signup" && role === "estabelecimento" && (
              <p className="text-xs text-center text-muted-foreground">Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
