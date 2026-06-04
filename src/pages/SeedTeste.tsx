import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ESTAB_USER_ID = "00000000-0000-0000-0000-000000000001";
const PROF_USER_ID = "00000000-0000-0000-0000-000000000002";

const estabelecimentos = [
  { nome: "Restaurante Bella Italia", responsavel: "Marco Rossi", telefone: "11999990001", endereco: "Rua Augusta, 1200", cidade: "São Paulo", estado: "SP", funcoes_utilizadas: ["Garçom", "Cozinheiro"], onboarding_completo: true, user_id: ESTAB_USER_ID },
  { nome: "Churrascaria do Sul", responsavel: "Gaúcho Lima", telefone: "11999990002", endereco: "Av. Paulista, 900", cidade: "São Paulo", estado: "SP", funcoes_utilizadas: ["Garçom", "Bartender"], onboarding_completo: true, user_id: ESTAB_USER_ID },
  { nome: "Sushi Sakura", responsavel: "Kenji Tanaka", telefone: "11999990003", endereco: "Rua Liberdade, 50", cidade: "São Paulo", estado: "SP", funcoes_utilizadas: ["Auxiliar de Cozinha"], onboarding_completo: true, user_id: ESTAB_USER_ID },
  { nome: "Café Central", responsavel: "Ana Beatriz", telefone: "11999990004", endereco: "Rua Oscar Freire, 300", cidade: "São Paulo", estado: "SP", funcoes_utilizadas: ["Garçom", "Caixa"], onboarding_completo: true, user_id: ESTAB_USER_ID },
];

const profissionais = [
  { nome: "Carlos Mendes", whatsapp: "11988880001", cidade: "São Paulo", estado: "SP", funcoes: ["Garçom"], disponibilidade: ["Sexta", "Sábado", "Domingo"], diaria_minima: 180, experiencia: "5 anos em restaurantes finos", trust_score: 4.8, total_avaliacoes: 12, onboarding_completo: true, user_id: PROF_USER_ID },
  { nome: "Fernanda Costa", whatsapp: "11988880002", cidade: "São Paulo", estado: "SP", funcoes: ["Cozinheiro", "Auxiliar de Cozinha"], disponibilidade: ["Segunda", "Terça", "Quarta"], diaria_minima: 200, experiencia: "Chef formada pelo Senac", trust_score: 4.5, total_avaliacoes: 8, onboarding_completo: true, user_id: PROF_USER_ID },
  { nome: "Rafael Oliveira", whatsapp: "11988880003", cidade: "São Paulo", estado: "SP", funcoes: ["Bartender"], disponibilidade: ["Quinta", "Sexta", "Sábado"], diaria_minima: 220, experiencia: "Bartender em bares e eventos", trust_score: 4.9, total_avaliacoes: 20, onboarding_completo: true, user_id: PROF_USER_ID },
  { nome: "Juliana Santos", whatsapp: "11988880004", cidade: "São Paulo", estado: "SP", funcoes: ["Garçom", "Recepcionista"], disponibilidade: ["Sábado", "Domingo"], diaria_minima: 160, experiencia: "3 anos em eventos corporativos", trust_score: 4.2, total_avaliacoes: 5, onboarding_completo: true, user_id: PROF_USER_ID },
  { nome: "Pedro Alves", whatsapp: "11988880005", cidade: "São Paulo", estado: "SP", funcoes: ["Auxiliar de Cozinha"], disponibilidade: ["Segunda", "Quarta", "Sexta"], diaria_minima: 140, experiencia: "Iniciante com curso técnico", trust_score: 3.8, total_avaliacoes: 3, onboarding_completo: true, user_id: PROF_USER_ID },
];

export default function SeedTeste() {
  const [loading, setLoading] = useState(false);

  const inserir = async () => {
    setLoading(true);
    const { error: e1 } = await supabase.from("estabelecimentos").insert(estabelecimentos);
    if (e1) toast.error(`Erro estabelecimentos: ${e1.message}`);
    else toast.success(`${estabelecimentos.length} estabelecimentos inseridos`);

    const { error: e2 } = await supabase.from("profissionais").insert(profissionais);
    if (e2) toast.error(`Erro profissionais: ${e2.message}`);
    else toast.success(`${profissionais.length} profissionais inseridos`);
    setLoading(false);
  };

  const limpar = async () => {
    setLoading(true);
    const { error: e1 } = await supabase.from("estabelecimentos").delete().eq("user_id", ESTAB_USER_ID);
    if (e1) toast.error(`Erro ao limpar estabelecimentos: ${e1.message}`);
    else toast.success("Estabelecimentos de teste removidos");

    const { error: e2 } = await supabase.from("profissionais").delete().eq("user_id", PROF_USER_ID);
    if (e2) toast.error(`Erro ao limpar profissionais: ${e2.message}`);
    else toast.success("Profissionais de teste removidos");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-6 p-8 border rounded-lg bg-card">
        <div>
          <h1 className="text-2xl font-bold">Seed de Teste</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Página temporária para popular o banco com dados de exemplo.
          </p>
        </div>
        <div className="space-y-3">
          <Button onClick={inserir} disabled={loading} className="w-full">
            Inserir Dados de Teste
          </Button>
          <Button onClick={limpar} disabled={loading} variant="destructive" className="w-full">
            Limpar Dados de Teste
          </Button>
        </div>
      </div>
    </div>
  );
}
