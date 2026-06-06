import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Users, 
  FileText, 
  Shield, 
  ChefHat, 
  Building2,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  MapPin
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { usePageTitle } from "@/hooks/usePageTitle";

const Index = () => {
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  
  useEffect(() => {
    // Check if it's mobile and not in standalone mode
    const isMobile = window.innerWidth < 768;
    // @ts-ignore - navigator.standalone is iOS only
    const isIOSStandalone = window.navigator.standalone === true;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || isIOSStandalone;
    
    if (isMobile && !isStandalone) {
      setShowInstallBanner(true);
    }
  }, []);

  usePageTitle("Tem Staff — Conecte seu restaurante aos melhores profissionais");
  
  return (
    <div className="min-h-screen bg-gradient-warm">
      {showInstallBanner && (
        <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-primary text-white px-8 py-2 text-center text-[10px] leading-tight font-medium shadow-lg animate-fade-down flex items-center justify-center">
          <span>📱 Instale o Tem Staff: toque em <b>Compartilhar</b> → <b>Adicionar à tela inicial</b></span>
          <button 
            onClick={() => setShowInstallBanner(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <header className={`fixed ${showInstallBanner ? 'top-8' : 'top-0'} left-0 right-0 z-50 glass-strong transition-all duration-300`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Tem Staff
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#para-restaurantes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Para Restaurantes
            </a>
            <a href="#para-profissionais" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Para Profissionais
            </a>
            <a href="#planos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/auth?mode=signup">Começar Grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
                <Star className="w-4 h-4" />
                A plataforma #1 de staffing para food service
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Conecte seu restaurante aos{" "}
                <span className="text-gradient-primary">melhores profissionais</span>{" "}
                freelancer
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Monte escalas completas, encontre profissionais qualificados e gere toda documentação automaticamente. Simples, rápido e sem burocracia.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/auth?mode=signup&role=estabelecimento">
                    Sou Restaurante
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="accent" size="xl" asChild>
                  <Link to="/auth?mode=signup&role=profissional">
                    Sou Profissional
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">Grátis para começar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">Sem intermediação de pagamento</span>
                </div>
              </div>
            </div>
            
            <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={heroImage} 
                  alt="Profissionais de food service em ação" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 glass-strong p-4 rounded-xl shadow-lg animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">+2.500</p>
                    <p className="text-xs text-muted-foreground">Profissionais ativos</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 glass-strong p-4 rounded-xl shadow-lg animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">+500</p>
                    <p className="text-xs text-muted-foreground">Restaurantes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma simples e eficiente para conectar quem precisa de staff com quem quer trabalhar
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: CalendarDays,
                title: "Monte sua Escala",
                description: "Crie necessidades por dia e função. O sistema gera vagas automaticamente para cada posição.",
                delay: "0s"
              },
              {
                icon: Users,
                title: "Receba Candidatos",
                description: "Profissionais qualificados se candidatam às suas vagas. Avalie perfis e aprove os melhores.",
                delay: "0.1s"
              },
              {
                icon: FileText,
                title: "Documentação Automática",
                description: "Convites e recibos gerados automaticamente. Tudo documentado e sem burocracia.",
                delay: "0.2s"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-up"
                style={{ animationDelay: item.delay }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Restaurants */}
      <section id="para-restaurantes" className="py-20 bg-gradient-warm">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
                <Building2 className="w-4 h-4" />
                Para Restaurantes
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Gerencie sua equipe extra com facilidade
              </h2>
              
              <p className="text-muted-foreground">
                Monte escalas mensais completas, encontre profissionais qualificados para eventos e picos de demanda. Tudo em uma única plataforma.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Calendário mensal para planejamento de escala",
                  "Aprovação de candidatos com um clique",
                  "Documentação jurídica gerada automaticamente",
                  "Histórico completo de serviços e profissionais",
                  "Pagamento direto ao freelancer (sem intermediação)"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth?mode=signup&role=estabelecimento">
                  Cadastrar Restaurante
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
            
            <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="bg-card rounded-2xl p-6 shadow-xl border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-semibold text-foreground">Dezembro 2024</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon-sm">
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                    <div key={day} className="py-2 text-muted-foreground font-medium">{day}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 6 + 1;
                    const isValid = day > 0 && day <= 31;
                    const hasEvent = [5, 12, 15, 20, 21, 24, 31].includes(day);
                    const isFilled = [5, 12, 20].includes(day);
                    
                    return (
                      <div 
                        key={i}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm ${
                          !isValid ? "opacity-0" : 
                          hasEvent ? (isFilled ? "bg-success/20 text-success" : "bg-warning/20 text-warning") : 
                          "hover:bg-muted/50"
                        } ${isValid ? "cursor-pointer" : ""}`}
                      >
                        {isValid && (
                          <>
                            <span className={hasEvent ? "font-semibold" : "text-muted-foreground"}>{day}</span>
                            {hasEvent && (
                              <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isFilled ? "bg-success" : "bg-warning"}`} />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    Preenchido
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    Pendente
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Professionals */}
      <section id="para-profissionais" className="py-20 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: ChefHat, label: "Chef de Cozinha", count: "120 vagas" },
                  { icon: Users, label: "Garçom", count: "85 vagas" },
                  { icon: Clock, label: "Bartender", count: "42 vagas" },
                  { icon: MapPin, label: "Auxiliar de Cozinha", count: "68 vagas" }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="bg-sidebar-accent p-5 rounded-xl hover:bg-sidebar-accent/80 transition-colors cursor-pointer"
                  >
                    <item.icon className="w-8 h-8 text-primary mb-3" />
                    <p className="font-semibold text-sidebar-foreground">{item.label}</p>
                    <p className="text-sm text-sidebar-foreground/70">{item.count}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-6 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sidebar-accent text-primary font-medium text-sm">
                <ChefHat className="w-4 h-4" />
                Para Profissionais
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Encontre oportunidades de trabalho freelancer
              </h2>
              
              <p className="text-sidebar-foreground/80">
                Cadastre-se gratuitamente e tenha acesso a centenas de vagas em restaurantes, eventos e estabelecimentos na sua região.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Acesso gratuito a todas as oportunidades",
                  "Candidate-se com um clique",
                  "Receba pagamento direto do estabelecimento",
                  "Documentação de serviço gerada automaticamente",
                  "Construa sua reputação e receba mais convites"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth?mode=signup&role=profissional">
                  Cadastrar Grátis
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Planos para Restaurantes
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Para profissionais é 100% grátis. Escolha o plano ideal para seu estabelecimento.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "Grátis",
                description: "Ideal para testar a plataforma",
                features: [
                  "Até 10 vagas/mês",
                  "Calendário básico",
                  "Documentação automática",
                  "Suporte por email"
                ],
                notIncluded: [
                  "Recorrência de escala",
                  "Exportação de dados",
                  "Destaque de vagas",
                  "Relatórios"
                ],
                variant: "outline" as const,
                popular: false
              },
              {
                name: "Moderado",
                price: "R$ 99",
                period: "/mês",
                description: "Para restaurantes em crescimento",
                features: [
                  "Até 40 vagas/mês",
                  "Recorrência de escala",
                  "Exportação PDF/CSV",
                  "Destaque de vagas",
                  "Relatórios básicos",
                  "Suporte prioritário"
                ],
                notIncluded: [
                  "Vagas ilimitadas",
                  "Relatórios completos"
                ],
                variant: "hero" as const,
                popular: true
              },
              {
                name: "Completo",
                price: "R$ 199",
                period: "/mês",
                description: "Para operações de grande escala",
                features: [
                  "Vagas ilimitadas",
                  "Todas as funcionalidades",
                  "Relatórios completos",
                  "Lista de favoritos",
                  "API de integração",
                  "Suporte dedicado"
                ],
                notIncluded: [],
                variant: "accent" as const,
                popular: false
              }
            ].map((plan, index) => (
              <div 
                key={index}
                className={`relative p-8 rounded-2xl border transition-all duration-300 animate-fade-up ${
                  plan.popular 
                    ? "border-primary bg-background shadow-xl scale-105" 
                    : "border-border bg-background hover:border-primary/30 hover:shadow-lg"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-hero rounded-full text-primary-foreground text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm opacity-50">
                      <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.variant} 
                  className="w-full" 
                  size="lg"
                  asChild
                >
                  <Link to="/auth?mode=signup&role=estabelecimento">
                    Começar Agora
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-4 p-6 rounded-xl bg-info/10 border border-info/20">
            <Shield className="w-6 h-6 text-info flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-semibold text-foreground mb-2">Transparência Total</h3>
              <p className="text-sm text-muted-foreground">
                O Tem Staff cobra somente pela assinatura da plataforma. O pagamento do serviço freelancer é feito diretamente entre o estabelecimento e o profissional, fora da plataforma. Não há intermediação de pagamentos, taxas sobre serviços ou split. Todos os documentos gerados servem como comprovação de prestação de serviço eventual, sem vínculo empregatício.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Pronto para começar?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de restaurantes e milhares de profissionais que já usam o Tem Staff.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="xl" asChild>
              <Link to="/auth?mode=signup&role=estabelecimento">
                Sou Restaurante
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline-accent" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
              <Link to="/auth?mode=signup&role=profissional">
                Sou Profissional
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-bold">Tem Staff</span>
              </Link>
              <p className="text-sm text-accent-foreground/70">
                A plataforma que conecta restaurantes a profissionais de food service.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Para Restaurantes</h4>
              <ul className="space-y-2 text-sm text-accent-foreground/70">
                <li><Link to="/auth" className="hover:text-accent-foreground transition-colors">Cadastrar</Link></li>
                <li><a href="#planos" className="hover:text-accent-foreground transition-colors">Planos</a></li>
                <li><a href="#como-funciona" className="hover:text-accent-foreground transition-colors">Como Funciona</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Para Profissionais</h4>
              <ul className="space-y-2 text-sm text-accent-foreground/70">
                <li><Link to="/auth" className="hover:text-accent-foreground transition-colors">Cadastrar</Link></li>
                <li><Link to="/auth" className="hover:text-accent-foreground transition-colors">Ver Vagas</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-accent-foreground/70">
                <li><a href="#" className="hover:text-accent-foreground transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-accent-foreground transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-accent-foreground/10 text-center text-sm text-accent-foreground/50">
            © 2024 Tem Staff. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
