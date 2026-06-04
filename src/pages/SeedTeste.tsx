import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SeedTeste() {
  const [loading, setLoading] = useState(false);

  const inserir = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("insert_seed_data");
      if (error) {
        toast.error(`Erro ao inserir dados: ${error.message}`);
      } else {
        toast.success("Dados de teste inseridos com sucesso (via RPC)");
      }
    } catch (err: any) {
      toast.error(`Erro inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const limpar = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc("delete_seed_data");
      if (error) {
        toast.error(`Erro ao limpar dados: ${error.message}`);
      } else {
        toast.success("Dados de teste removidos com sucesso (via RPC)");
      }
    } catch (err: any) {
      toast.error(`Erro inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full space-y-6 p-8 border rounded-lg bg-card">
        <div>
          <h1 className="text-2xl font-bold">Seed de Teste</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Página temporária para popular o banco com dados de exemplo via RPC (SECURITY DEFINER).
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