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
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const CriarEscala = () => {
  const { user } = useAuth();
  const { getFuncoes } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    dataInicio: "", dataFim: "", funcao: "", quantidade: "1",
    horarioInicio: "", horarioFim: "", valor: "", endereco: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { data: estab } = await supabase.from("estabelecimentos").select("id, endereco").eq("user_id", user.id).single();
    if (!estab) { toast({ title: "Erro", description: "Estabelecimento não encontrado.", variant: "destructive" }); setSaving(false); return; }

    const start = new Date(form.dataInicio);
    const end = form.dataFim ? new Date(form.dataFim) : start;
    const slotsToInsert = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      slotsToInsert.push({
        estabelecimento_id: estab.id,
        funcao: form.funcao,
        quantidade: parseInt(form.quantidade),
        data: d.toISOString().split("T")[0],
        horario_inicio: form.horarioInicio,
        horario_fim: form.horarioFim,
        valor: parseFloat(form.valor),
        endereco: form.endereco || estab.endereco,
      });
    }

    const { error } = await supabase.from("slots").insert(slotsToInsert);
    setSaving(false);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Escala criada!", description: `${slotsToInsert.length} slot(s) criado(s).` });
      navigate("/app/estabelecimento");
    }
  };

  return (
    <EstabelecimentoLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild><Link to="/app/estabelecimento"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="font-display text-2xl font-bold">Criar Escala</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data início</Label>
              <Input type="date" required value={form.dataInicio} onChange={e => setForm({ ...form, dataInicio: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Data fim (opcional)</Label>
              <Input type="date" value={form.dataFim} onChange={e => setForm({ ...form, dataFim: e.target.value })} />
            </div>
          </div>

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
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" required value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Horário início</Label>
              <Input type="time" required value={form.horarioInicio} onChange={e => setForm({ ...form, horarioInicio: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Horário fim</Label>
              <Input type="time" required value={form.horarioFim} onChange={e => setForm({ ...form, horarioFim: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Endereço (opcional, usa do estabelecimento se vazio)</Label>
            <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número" />
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={saving}>
            {saving ? "Criando..." : "Criar Escala"}
          </Button>
        </form>
      </div>
    </EstabelecimentoLayout>
  );
};

export default CriarEscala;
