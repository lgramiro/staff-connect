import { useEffect, useState, useRef } from "react";
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
import { MapPin, Star, Instagram, Linkedin, Globe, Youtube, FileText, Camera, Upload, Check, Pencil, Download } from "lucide-react";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const MeuPerfil = () => {
  const { user } = useAuth();
  const { getFuncoes } = useSettings();
  const { toast } = useToast();
  const [prof, setProf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const fotoRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);
  const { url: fotoUrl } = useSupabaseUrl(form.foto_url || prof?.foto_url, "fotos");
  const { url: cvUrl } = useSupabaseUrl(form.curriculo_url || prof?.curriculo_url, "curriculos");

  const loadProfile = () => {
    if (!user) return;
    supabase.from("profissionais").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setProf(data);
      if (data) setForm({ ...data });
      setLoading(false);
    });
  };

  useEffect(() => { loadProfile(); }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Using a more secure path with a timestamp to prevent simple guessing
    const timestamp = new Date().getTime();
    const path = `${user.id}/foto_${timestamp}.${file.name.split(".").pop()}`;
    
    const { error } = await supabase.storage.from("fotos").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Erro no upload", description: error.message, variant: "destructive" }); return; }
    
    // Store ONLY the path in the database for private buckets
    await supabase.from("profissionais").update({ foto_url: path }).eq("user_id", user.id);
    setForm((prev: any) => ({ ...prev, foto_url: path }));
    setProf((prev: any) => ({ ...prev, foto_url: path }));
    toast({ title: "Foto atualizada!" });
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    const timestamp = new Date().getTime();
    const path = `${user.id}/curriculo_${timestamp}.${file.name.split(".").pop()}`;
    
    const { error } = await supabase.storage.from("curriculos").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Erro no upload", description: error.message, variant: "destructive" }); return; }
    
    // Store ONLY the path in the database
    await supabase.from("profissionais").update({ curriculo_url: path }).eq("user_id", user.id);
    setForm((prev: any) => ({ ...prev, curriculo_url: path }));
    setProf((prev: any) => ({ ...prev, curriculo_url: path }));
    toast({ title: "Currículo atualizado!" });
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
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profissionais").update({
      nome: form.nome,
      whatsapp: form.whatsapp,
      cidade: form.cidade,
      estado: form.estado,
      funcoes: form.funcoes,
      disponibilidade: form.disponibilidade,
      diaria_minima: parseFloat(form.diaria_minima) || 0,
      experiencia: form.experiencia || null,
      idiomas: form.idiomas || [],
      certificacoes: form.certificacoes || [],
      instagram: form.instagram || null,
      linkedin: form.linkedin || null,
      portfolio: form.portfolio || null,
      youtube: form.youtube || null,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!" });
      setEditing(false);
      loadProfile();
    }
  };

  if (loading) return <ProfissionalLayout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></ProfissionalLayout>;
  if (!prof) return <ProfissionalLayout><div className="text-center py-12 text-muted-foreground">Perfil não encontrado. Complete o onboarding.</div></ProfissionalLayout>;

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
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>WhatsApp</Label><Input value={form.whatsapp || ""} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></div>
                <div className="space-y-2"><Label>Cidade</Label><Input value={form.cidade || ""} onChange={e => setForm({ ...form, cidade: e.target.value })} /></div>
                <div className="space-y-2"><Label>Estado</Label><Input value={form.estado || ""} onChange={e => setForm({ ...form, estado: e.target.value })} /></div>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Instagram</Label><Input value={form.instagram || ""} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@perfil" /></div>
                <div className="space-y-2"><Label>LinkedIn</Label><Input value={form.linkedin || ""} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="URL" /></div>
                <div className="space-y-2"><Label>Portfólio</Label><Input value={form.portfolio || ""} onChange={e => setForm({ ...form, portfolio: e.target.value })} placeholder="URL" /></div>
                <div className="space-y-2"><Label>YouTube</Label><Input value={form.youtube || ""} onChange={e => setForm({ ...form, youtube: e.target.value })} placeholder="URL" /></div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="hero" onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar Perfil"}</Button>
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
              <div><h3 className="font-semibold mb-2">Disponibilidade</h3><div className="flex flex-wrap gap-2">{(prof.disponibilidade || []).map((d: string) => <Badge key={d} variant="outline">{d}</Badge>)}</div></div>
              <div className="flex gap-3 pt-2">
                {prof.instagram && <Button variant="ghost" size="icon" onClick={() => window.open(`https://instagram.com/${prof.instagram.replace("@", "")}`, "_blank")}><Instagram className="w-5 h-5" /></Button>}
                {prof.linkedin && <Button variant="ghost" size="icon" onClick={() => window.open(prof.linkedin, "_blank")}><Linkedin className="w-5 h-5" /></Button>}
                {prof.portfolio && <Button variant="ghost" size="icon" onClick={() => window.open(prof.portfolio, "_blank")}><Globe className="w-5 h-5" /></Button>}
                {prof.youtube && <Button variant="ghost" size="icon" onClick={() => window.open(prof.youtube, "_blank")}><Youtube className="w-5 h-5" /></Button>}
                {prof.curriculo_url && <Button variant="outline" size="sm" onClick={() => window.open(prof.curriculo_url, "_blank")}><FileText className="w-4 h-4 mr-1" /> Ver Currículo</Button>}
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
