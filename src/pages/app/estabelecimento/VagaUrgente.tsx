import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const VagaUrgente = () => {
  const { user } = useAuth();
  const { getFuncoes } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    funcao: "", quantidade: "1", data: "", horarioInicio: "", horarioFim: "", valor: "", endereco: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { data: estab } = await supabase.from("estabelecimentos").select("id, endereco").eq("user_id", user.id).single();
    if (!estab) { toast({ title: "Erro", description: "Estabelecimento não encontrado.", variant: "destructive" }); setSaving(false); return; }

    const { error } = await supabase.from("slots").insert({
      estabelecimento_id: estab.id,
      funcao: form.funcao,
      quantidade: parseInt(form.quantidade),
      data: form.data,
      horario_inicio: form.horarioInicio,
      horario_fim: form.horarioFim,
      valor: parseFloat(form.valor),
      endereco: form.endereco || estab.endereco,
      urgente: true,
    });
    setSaving(false);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Vaga urgente criada!", description: "A vaga aparecerá no topo das oportunidades." });
      navigate("/app/estabelecimento");
    }
  };

  return (
    <EstabelecimentoLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild><Link to="/app/estabelecimento"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-destructive" />Vaga Urgente</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-destructive/20 space-y-4">
          <div className="space-y-2">
            <Label>Função</Label>
            <select required value={form.funcao} onChange={e => setForm({ ...form, funcao: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Selecione</option>
              {getFuncoes().map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input type="number" min="1" required value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" required value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Horário início</Label><Input type="time" required value={form.horarioInicio} onChange={e => setForm({ ...form, horarioInicio: e.target.value })} /></div>
            <div className="space-y-2"><Label>Horário fim</Label><Input type="time" required value={form.horarioFim} onChange={e => setForm({ ...form, horarioFim: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" step="0.01" required value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
          <div className="space-y-2"><Label>Endereço (opcional)</Label><Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} /></div>
          <Button type="submit" variant="hero" className="w-full" disabled={saving}>{saving ? "Criando..." : "Publicar Vaga Urgente"}</Button>
        </form>
      </div>
    </EstabelecimentoLayout>
  );
};

export default VagaUrgente;
