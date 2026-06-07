import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, ArrowRight, ArrowLeft, Check } from "lucide-react";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const formSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().min(2, "Estado é obrigatório"),
  funcoes: z.array(z.string()).min(1, "Selecione pelo menos uma função"),
  disponibilidade: z.array(z.string()).min(1, "Selecione pelo menos um dia"),
  diaria_minima: z.coerce.number().positive("Valor deve ser maior que 0"),
  experiencia: z.string().optional(),
  idiomas: z.string().optional(),
  certificacoes: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  youtube: z.string().optional(),
});

const ProfissionalOnboarding = () => {
  const { user } = useAuth();
  const { getFuncoes, getEstados } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "", whatsapp: "", cidade: "", estado: "",
      funcoes: [], disponibilidade: [], diaria_minima: 0,
      experiencia: "", idiomas: "", certificacoes: "",
      instagram: "", linkedin: "", portfolio: "", youtube: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profissionais").insert({
      user_id: user.id,
      ...values,
      idiomas: values.idiomas ? values.idiomas.split(",").map(s => s.trim()) : [],
      certificacoes: values.certificacoes ? values.certificacoes.split(",").map(s => s.trim()) : [],
      onboarding_completo: true,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: "Cadastro concluído!", 
        description: "Seu perfil foi criado com sucesso. Complete o treinamento para começar." 
      });
      
      const { data } = await supabase
        .from("profissionais")
        .select("treinamento_concluido")
        .eq("user_id", user.id)
        .single();
        
      if (data?.treinamento_concluido) {
        navigate("/app/profissional");
      } else {
        toast({
          title: "Treinamento Obrigatório",
          description: "Antes de começar, complete o treinamento obrigatório da plataforma."
        });
        navigate("/app/profissional/treinamentos");
      }
    }
  };

  const totalSteps = 5;

  const validateStep = async () => {
    let fields: (keyof z.infer<typeof formSchema>)[] = [];
    if (step === 1) fields = ["nome", "whatsapp"];
    if (step === 2) fields = ["cidade", "estado"];
    if (step === 3) fields = ["funcoes"];
    if (step === 4) fields = ["disponibilidade"];
    if (step === 5) fields = ["diaria_minima"];

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
                <FormField control={form.control} name="nome" render={({ field }) => <FormItem><FormLabel>Nome completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="whatsapp" render={({ field }) => <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              </>
            )}

            {step === 2 && (
              <>
                <FormField control={form.control} name="cidade" render={({ field }) => <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="estado" render={({ field }) => (
                    <FormItem><FormLabel>Estado</FormLabel><FormControl><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="">Selecione</option>{getEstados().map(e => <option key={e} value={e}>{e}</option>)}</select></FormControl><FormMessage /></FormItem>
                )} />
              </>
            )}

            {step === 3 && (
              <FormField control={form.control} name="funcoes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Funções</FormLabel>
                  <div className="flex flex-wrap gap-2">{getFuncoes().map(f => (
                    <Badge key={f} variant={field.value.includes(f) ? "default" : "outline"} className="cursor-pointer" onClick={() => field.onChange(field.value.includes(f) ? field.value.filter(x => x !== f) : [...field.value, f])}>
                      {field.value.includes(f) && <Check className="w-3 h-3 mr-1" />}{f}
                    </Badge>
                  ))}</div>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {step === 4 && (
              <FormField control={form.control} name="disponibilidade" render={({ field }) => (
                <FormItem>
                  <FormLabel>Disponibilidade</FormLabel>
                  <div className="flex flex-wrap gap-2">{DIAS.map(d => (
                    <Badge key={d} variant={field.value.includes(d) ? "default" : "outline"} className="cursor-pointer" onClick={() => field.onChange(field.value.includes(d) ? field.value.filter(x => x !== d) : [...field.value, d])}>
                      {field.value.includes(d) && <Check className="w-3 h-3 mr-1" />}{d}
                    </Badge>
                  ))}</div>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {step === 5 && (
              <>
                <FormField control={form.control} name="diaria_minima" render={({ field }) => <FormItem><FormLabel>Diária mínima (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="experiencia" render={({ field }) => <FormItem><FormLabel>Experiência (opcional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="instagram" render={({ field }) => <FormItem><FormLabel>Instagram (opcional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              </>
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

export default ProfissionalOnboarding;