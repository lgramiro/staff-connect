import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseUrl } from "@/hooks/useSupabaseUrl";
import { MapPin, Star, Instagram, Linkedin, Globe, Youtube, FileText, Camera, Upload, Check, Pencil, UserX } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useProfissionalQuery, useProfissionalMutation } from "@/hooks/queries/useProfissional";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const MeuPerfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getFuncoes } = useSettings();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const fotoRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);

  const { data: prof, isLoading: loading } = useProfissionalQuery(user?.id);
  const updateProfissional = useProfissionalMutation(user?.id);
  const [stats, setStats] = useState({ taxa: 100, diarias: 0, ocorrencias: 0 });

  useEffect(() => {
    if (!prof?.id) return;
    const loadStats = async () => {
      // Diárias realizadas
      const { data: concluidas } = await supabase
        .from("candidaturas")
        .select("status")
        .eq("profissional_id", prof.id)
        .in("status", ["concluida", "no_show", "nao_compareceu"]);
      
      const totalConcluidas = concluidas?.filter(c => c.status === "concluida").length || 0;
      const totalFaltas = concluidas?.filter(c => ["no_show", "nao_compareceu"].includes(c.status)).length || 0;
      const taxa = (totalConcluidas + totalFaltas) > 0 ? (totalConcluidas / (totalConcluidas + totalFaltas)) * 100 : 100;

      // Ocorrências últimos 90 dias
      const noventaDiasAtras = new Date();
      noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90);
      const { count: ocs } = await supabase
        .from("ocorrencias_slots")
        .select("*", { count: 'exact', head: true })
        .eq("profissional_id", prof.id)
        .eq("tipo", "no_show")
        .gte("created_at", noventaDiasAtras.toISOString());

      setStats({
        taxa,
        diarias: totalConcluidas,
        ocorrencias: ocs || 0
      });
    };
    loadStats();
  }, [prof?.id]);

  const { url: fotoUrl } = useSupabaseUrl(form.foto_url || prof?.foto_url, "fotos");
  const { url: cvUrl } = useSupabaseUrl(form.curriculo_url || prof?.curriculo_url, "curriculos");

  useEffect(() => {
    if (prof) setForm({ ...prof });
  }, [prof]);


  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Using a more secure path with a timestamp to prevent simple guessing
    const timestamp = new Date().getTime();
    const path = `${user.id}/foto_${timestamp}.${file.name.split(".").pop()}`;
    
    const { error } = await supabase.storage.from("fotos").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Erro no upload", description: error.message, variant: "destructive" }); return; }
    
    // Store ONLY the path in the database for private buckets
    updateProfissional.mutate({ foto_url: path });
    setForm((prev: any) => ({ ...prev, foto_url: path }));
  };


  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    const timestamp = new Date().getTime();
    const path = `${user.id}/curriculo_${timestamp}.${file.name.split(".").pop()}`;
    
    const { error } = await supabase.storage.from("curriculos").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Erro no upload", description: error.message, variant: "destructive" }); return; }
    
    // Store ONLY the path in the database
    updateProfissional.mutate({ curriculo_url: path });
    setForm((prev: any) => ({ ...prev, curriculo_url: path }));
  };


  const toggleFuncao = (f: string) => {
    const current = form.funcoes || [];
    setForm((prev: any) => ({
      ...prev,
      funcoes: current.includes(f) ? current.filter((x: string) => x !== f) : [...current, f]
    }));
  };

  const toggleDia = (d: string) => {
    const current = form.disponibilidade || [];
    setForm((prev: any) => ({
      ...prev,
      disponibilidade: current.includes(d) ? current.filter((x: string) => x !== d) : [...current, d]
    }));
  };

  const handleSave = async () => {
    updateProfissional.mutate({
      nome: form.nome,
      whatsapp: form.whatsapp,
      cidade: form.cidade,
      estado: form.estado,
      funcoes: form.funcoes,
      disponibilidade: form.disponibilidade,
      diaria_minima: parseFloat(form.diaria_minima) || 0,
      raio_atuacao: parseInt(form.raio_atuacao) || 50,
      experiencia: form.experiencia || null,
      idiomas: form.idiomas || [],
      certificacoes: form.certificacoes || [],
      instagram: form.instagram || null,
      linkedin: form.linkedin || null,
      portfolio: form.portfolio || null,
      youtube: form.youtube || null,
    }, {
      onSuccess: () => {
        setEditing(false);
      }
    });
  };


  if (loading) return <ProfissionalLayout><LoadingSpinner /></ProfissionalLayout>;
  if (!prof) return <ProfissionalLayout><EmptyState icon={UserX} title="Perfil não encontrado" description="Complete o onboarding para começar a usar o Tem Staff." action={{ buttonLabel: "Completar onboarding", onClick: () => navigate("/onboarding/profissional") }} /></ProfissionalLayout>;

  return (
    <ProfissionalLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-display text-2xl font-bold">Meu Perfil</h1>
          <Button variant={editing ? "ghost" : "outline"} onClick={() => { setEditing(!editing); if (!editing) setForm({ ...prof }); }}>
            {editing ? "Cancelar" : <><Pencil className="w-4 h-4 mr-1" /> Editar</>}
          </Button>
        </div>

        <div className="bg-card rounded-xl p-6 border border-border">
          {/* Photo */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              {fotoUrl ? (
                <img src={fotoUrl} alt="Foto" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                  {prof.nome?.charAt(0) || "P"}
                </div>
              )}
              <button onClick={() => fotoRef.current?.click()} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div className="flex-1">
              {editing ? (
                <Input value={form.nome || ""} onChange={e => setForm({ ...form, nome: e.target.value })} className="font-bold text-lg" />
              ) : (
                <h2 className="font-display text-xl font-bold">{prof.nome}</h2>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />{prof.cidade}, {prof.estado}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-semibold">{Number(prof.trust_score).toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({prof.total_avaliacoes} avaliações)</span>
              </div>
              
              {!editing && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/10 border-none">
                    {stats.taxa.toFixed(0)}% Comparecimento
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10 border-none">
                    {stats.diarias} Diárias realizadas
                  </Badge>
                  {stats.ocorrencias > 0 && (
                    <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-none">
                      {stats.ocorrencias} No-shows (90d)
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>WhatsApp</Label><Input value={form.whatsapp || ""} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></div>
                <div className="space-y-2"><Label>Cidade</Label><Input value={form.cidade || ""} onChange={e => setForm({ ...form, cidade: e.target.value })} /></div>
                <div className="space-y-2"><Label>Estado</Label><Input value={form.estado || ""} onChange={e => setForm({ ...form, estado: e.target.value })} /></div>
                <div className="space-y-2"><Label>Raio de Atuação (km)</Label><Input type="number" value={form.raio_atuacao || 50} onChange={e => setForm({ ...form, raio_atuacao: parseInt(e.target.value) })} /></div>
                <div className="space-y-2"><Label>Diária mínima (R$)</Label><Input type="number" value={form.diaria_minima || ""} onChange={e => setForm({ ...form, diaria_minima: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Experiência</Label><Textarea value={form.experiencia || ""} onChange={e => setForm({ ...form, experiencia: e.target.value })} /></div>
              
              <div className="space-y-2">
                <Label>Funções</Label>
                <div className="flex flex-wrap gap-2">
                  {getFuncoes().map(f => (
                    <Badge key={f} variant={(form.funcoes || []).includes(f) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleFuncao(f)}>
                      {(form.funcoes || []).includes(f) && <Check className="w-3 h-3 mr-1" />}{f}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Disponibilidade</Label>
                <div className="flex flex-wrap gap-2">
                  {DIAS.map(d => (
                    <Badge key={d} variant={(form.disponibilidade || []).includes(d) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleDia(d)}>
                      {(form.disponibilidade || []).includes(d) && <Check className="w-3 h-3 mr-1" />}{d}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Instagram</Label><Input value={form.instagram || ""} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@perfil" /></div>
                <div className="space-y-2"><Label>LinkedIn</Label><Input value={form.linkedin || ""} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="URL" /></div>
                <div className="space-y-2"><Label>Portfólio</Label><Input value={form.portfolio || ""} onChange={e => setForm({ ...form, portfolio: e.target.value })} placeholder="URL" /></div>
                <div className="space-y-2"><Label>YouTube</Label><Input value={form.youtube || ""} onChange={e => setForm({ ...form, youtube: e.target.value })} placeholder="URL" /></div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="hero" onClick={handleSave} disabled={updateProfissional.isPending}>{updateProfissional.isPending ? "Salvando..." : "Salvar Perfil"}</Button>
                <Button variant="outline" onClick={() => cvRef.current?.click()}><Upload className="w-4 h-4 mr-1" /> Enviar Currículo</Button>
                <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvUpload} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Funções</h3>
                <div className="flex flex-wrap gap-2">{(prof.funcoes || []).map((f: string) => <Badge key={f}>{f}</Badge>)}</div>
              </div>
              {prof.experiencia && <div><h3 className="font-semibold mb-1">Experiência</h3><p className="text-sm text-muted-foreground">{prof.experiencia}</p></div>}
              <div><h3 className="font-semibold mb-1">Diária mínima</h3><p className="text-primary font-bold">R$ {Number(prof.diaria_minima).toFixed(2)}</p></div>
              <div><h3 className="font-semibold mb-1">Raio de atuação</h3><p className="text-muted-foreground">{prof.raio_atuacao || 50} km</p></div>
              <div><h3 className="font-semibold mb-2">Disponibilidade</h3><div className="flex flex-wrap gap-2">{(prof.disponibilidade || []).map((d: string) => <Badge key={d} variant="outline">{d}</Badge>)}</div></div>
              <div className="flex gap-3 pt-2">
                {prof.instagram && <Button variant="ghost" size="icon" onClick={() => window.open(`https://instagram.com/${prof.instagram.replace("@", "")}`, "_blank")}><Instagram className="w-5 h-5" /></Button>}
                {prof.linkedin && <Button variant="ghost" size="icon" onClick={() => window.open(prof.linkedin, "_blank")}><Linkedin className="w-5 h-5" /></Button>}
                {prof.portfolio && <Button variant="ghost" size="icon" onClick={() => window.open(prof.portfolio, "_blank")}><Globe className="w-5 h-5" /></Button>}
                {prof.youtube && <Button variant="ghost" size="icon" onClick={() => window.open(prof.youtube, "_blank")}><Youtube className="w-5 h-5" /></Button>}
                {cvUrl && <Button variant="outline" size="sm" onClick={() => window.open(cvUrl, "_blank")}><FileText className="w-4 h-4 mr-1" /> Ver Currículo</Button>}
              </div>
              <Button variant="outline" className="mt-2" onClick={() => cvRef.current?.click()}><Upload className="w-4 h-4 mr-1" /> Enviar Currículo</Button>
              <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvUpload} />
            </div>
          )}
        </div>
      </div>
    </ProfissionalLayout>
  );
};

export default MeuPerfil;
