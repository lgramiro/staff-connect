import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().optional(),
  funcao: z.string().min(1, "Selecione a função"),
  quantidade: z.coerce.number().min(1, "Mínimo 1"),
  horarioInicio: z.string().min(1, "Horário de início é obrigatório"),
  horarioFim: z.string().min(1, "Horário de fim é obrigatório"),
  valor: z.coerce.number().positive("O valor deve ser maior que 0"),
  endereco: z.string().optional()
}).refine((data) => {
  if (data.dataFim) {
    return new Date(data.dataFim) >= new Date(data.dataInicio);
  }
  return true;
}, {
  message: "Data fim deve ser posterior ou igual à data de início",
  path: ["dataFim"],
});

const CriarEscala = () => {
  const { user } = useAuth();
  const { getFuncoes } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataInicio: "", dataFim: "", funcao: "", quantidade: 1,
      horarioInicio: "", horarioFim: "", valor: 0, endereco: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setSaving(true);

    const { data: estab } = await supabase.from("estabelecimentos").select("id, endereco").eq("user_id", user.id).single();
    if (!estab) { toast({ title: "Erro", description: "Estabelecimento não encontrado.", variant: "destructive" }); setSaving(false); return; }

    const start = new Date(values.dataInicio);
    const end = values.dataFim ? new Date(values.dataFim) : start;
    const slotsToInsert = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      slotsToInsert.push({
        estabelecimento_id: estab.id,
        funcao: values.funcao,
        quantidade: values.quantidade,
        data: d.toISOString().split("T")[0],
        horario_inicio: values.horarioInicio,
        horario_fim: values.horarioFim,
        valor: values.valor,
        endereco: values.endereco || estab.endereco,
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-card rounded-xl p-6 border border-border space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="dataInicio" render={({ field }) => <FormItem><FormLabel>Data início</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="dataFim" render={({ field }) => <FormItem><FormLabel>Data fim (opcional)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>

            <FormField control={form.control} name="funcao" render={({ field }) => (
              <FormItem><FormLabel>Função</FormLabel><FormControl><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Selecione</option>{getFuncoes().map(f => <option key={f} value={f}>{f}</option>)}</select></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="quantidade" render={({ field }) => <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="valor" render={({ field }) => <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="horarioInicio" render={({ field }) => <FormItem><FormLabel>Horário início</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="horarioFim" render={({ field }) => <FormItem><FormLabel>Horário fim</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>

            <FormField control={form.control} name="endereco" render={({ field }) => <FormItem><FormLabel>Endereço (opcional)</FormLabel><FormControl><Input {...field} placeholder="Rua, número" /></FormControl><FormMessage /></FormItem>} />

            <Button type="submit" variant="hero" className="w-full" disabled={saving}>{saving ? "Criando..." : "Criar Escala"}</Button>
          </form>
        </Form>
      </div>
    </EstabelecimentoLayout>
  );
};

export default CriarEscala;