import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, ArrowRight, ArrowLeft, Check, AlertTriangle } from "lucide-react";

const formSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  responsavel: z.string().min(2, "Responsável é obrigatório"),
  telefone: z.string().min(10, "Telefone inválido"),
  endereco: z.string().min(5, "Endereço completo é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  funcoes_utilizadas: z.array(z.string()).min(1, "Selecione pelo menos uma função"),
});

const EstabelecimentoOnboarding = () => {
  const { user } = useAuth();
  const { getFuncoes, getEstados, getAvisoLegal } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "", responsavel: "", telefone: "", endereco: "",
      cidade: "", estado: "", funcoes_utilizadas: [],
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setSaving(true);

    const { data: estab, error } = await supabase.from("estabelecimentos").insert({
      user_id: user.id,
      ...values,
      onboarding_completo: true,
    }).select().single();

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    const { data: freePlan } = await supabase.from("planos").select("id").eq("slug", "free").single();
    if (freePlan && estab) {
      await supabase.from("assinaturas").insert({
        estabelecimento_id: estab.id,
        plano_id: freePlan.id,
      });
    }

    setSaving(false);
    toast({ title: "Cadastro concluído!", description: "Seu estabelecimento foi cadastrado." });
    navigate("/app/estabelecimento");
  };

  const totalSteps = 3;

  const validateStep = async () => {
    let fields: (keyof z.infer<typeof formSchema>)[] = [];
    if (step === 1) fields = ["nome", "responsavel", "telefone"];
    if (step === 2) fields = ["endereco", "cidade", "estado"];
    if (step === 3) fields = ["funcoes_utilizadas"];

    const output = await form.trigger(fields);
    if (output) setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-xl border border-border p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Tem Staff</span>
        </div>

        <div className="flex gap-1 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-6">Passo {step} de {totalSteps}</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <>
                <FormField control={form.control} name="nome" render={({ field }) => <FormItem><FormLabel>Nome do estabelecimento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="responsavel" render={({ field }) => <FormItem><FormLabel>Responsável</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="telefone" render={({ field }) => <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              </>
            )}

            {step === 2 && (
              <>
                <FormField control={form.control} name="endereco" render={({ field }) => <FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="cidade" render={({ field }) => <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="estado" render={({ field }) => (
                  <FormItem><FormLabel>Estado</FormLabel><FormControl><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Selecione</option>{getEstados().map(e => <option key={e} value={e}>{e}</option>)}</select></FormControl><FormMessage /></FormItem>
                )} />
              </>
            )}

            {step === 3 && (
              <FormField control={form.control} name="funcoes_utilizadas" render={({ field }) => (
                <FormItem>
                  <FormLabel>Funções mais utilizadas</FormLabel>
                  <div className="flex flex-wrap gap-2">{getFuncoes().map(f => (
                    <Badge key={f} variant={field.value.includes(f) ? "default" : "outline"} className="cursor-pointer" onClick={() => field.onChange(field.value.includes(f) ? field.value.filter(x => x !== f) : [...field.value, f])}>
                      {field.value.includes(f) && <Check className="w-3 h-3 mr-1" />}{f}
                    </Badge>
                  ))}</div>
                  <FormMessage />
                  <div className="mt-6 p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-start gap-2"><AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" /><p className="text-sm text-foreground">{getAvisoLegal()}</p></div>
                  </div>
                </FormItem>
              )} />
            )}

            <div className="flex justify-between mt-8">
              {step > 1 ? <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)}><ArrowLeft className="w-4 h-4 mr-1" /> Voltar</Button> : <div />}
              {step < totalSteps ? <Button type="button" variant="hero" onClick={validateStep}>Próximo <ArrowRight className="w-4 h-4 ml-1" /></Button> : <Button variant="hero" disabled={saving}>{saving ? "Salvando..." : "Concluir Cadastro"}</Button>}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EstabelecimentoOnboarding;