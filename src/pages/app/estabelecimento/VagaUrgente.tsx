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
import { ArrowLeft, Zap } from "lucide-react";

const formSchema = z.object({
  funcao: z.string().min(1, "Selecione a função"),
  quantidade: z.coerce.number().min(1, "Mínimo 1"),
  data: z.string().min(1, "Data é obrigatória").refine((val) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Comparação simplificada para aceitar a data de hoje
    const selectedDate = new Date(val + 'T00:00:00');
    return selectedDate >= today;
  }, { message: "A data não pode ser anterior a hoje" }),
  horarioInicio: z.string().min(1, "Horário de início é obrigatório"),
  horarioFim: z.string().min(1, "Horário de fim é obrigatório"),
  valor: z.coerce.number().positive("O valor deve ser maior que 0"),
  endereco: z.string().optional()
});

const VagaUrgente = () => {
  const { user } = useAuth();
  const { getFuncoes } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      funcao: "", 
      quantidade: 1, 
      data: todayStr,
      horarioInicio: "", 
      horarioFim: "", 
      valor: 0, 
      endereco: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setSaving(true);

    try {
      const { data: estab } = await supabase
        .from("estabelecimentos")
        .select("id, endereco, nome")
        .eq("user_id", user.id)
        .single();

      if (!estab) { 
        toast({ title: "Erro", description: "Estabelecimento não encontrado.", variant: "destructive" }); 
        setSaving(false); 
        return; 
      }

      // 1. Criar a vaga
      const { data: slot, error: slotError } = await supabase
        .from("slots")
        .insert({
          estabelecimento_id: estab.id,
          funcao: values.funcao,
          quantidade: values.quantidade,
          data: values.data,
          horario_inicio: values.horarioInicio,
          horario_fim: values.horarioFim,
          valor: values.valor,
          endereco: values.endereco || estab.endereco,
          urgente: true,
        })
        .select()
        .single();

      if (slotError) throw slotError;

      // 2. Buscar profissionais compatíveis
      const { data: profissionais, error: prosError } = await supabase
        .from("profissionais")
        .select("user_id")
        .eq("onboarding_completo", true)
        .contains("funcoes", [values.funcao]);

      if (prosError) {
        console.error("Erro ao buscar profissionais:", prosError);
      }

      let notifiedCount = 0;
      if (profissionais && profissionais.length > 0) {
        // 3. Notificar profissionais em paralelo
        const notificationPromises = profissionais.map(p => 
          supabase.rpc('create_notificacao', {
            p_user_id: p.user_id,
            p_titulo: "🚨 Vaga Urgente disponível!",
            p_mensagem: `${values.funcao} em ${estab.nome} - hoje ${values.horarioInicio} às ${values.horarioFim} - R$ ${values.valor}`,
            p_tipo: "candidatura",
            p_referencia_id: slot.id
          })
        );

        const results = await Promise.all(notificationPromises);
        notifiedCount = results.filter(res => !res.error).length;
      }

      toast({ 
        title: "Vaga urgente publicada!", 
        description: `${notifiedCount} profissionais notificados.` 
      });
      navigate("/app/estabelecimento");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <EstabelecimentoLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild><Link to="/app/estabelecimento"><ArrowLeft className="w-4 h-4" /></Link></Button>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Zap className="w-6 h-6 text-destructive" />Vaga Urgente</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-card rounded-xl p-6 border border-destructive/20 space-y-4">
            <FormField control={form.control} name="funcao" render={({ field }) => (
              <FormItem><FormLabel>Função</FormLabel><FormControl><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Selecione</option>{getFuncoes().map(f => <option key={f} value={f}>{f}</option>)}</select></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="quantidade" render={({ field }) => <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="data" render={({ field }) => <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="horarioInicio" render={({ field }) => <FormItem><FormLabel>Horário início</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="horarioFim" render={({ field }) => <FormItem><FormLabel>Horário fim</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>

            <FormField control={form.control} name="valor" render={({ field }) => <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="endereco" render={({ field }) => <FormItem><FormLabel>Endereço (opcional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />

            <Button type="submit" variant="hero" className="w-full" disabled={saving}>{saving ? "Criando..." : "Publicar Vaga Urgente"}</Button>
          </form>
        </Form>
      </div>
    </EstabelecimentoLayout>
  );
};

export default VagaUrgente;