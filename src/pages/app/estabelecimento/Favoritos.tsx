import { useState, useMemo } from "react";
import { EstabelecimentoLayout } from "@/components/layouts/EstabelecimentoLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEstabelecimentoQuery } from "@/hooks/queries/useEstabelecimento";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Star, MapPin, Briefcase, Heart, Trash2, ShieldCheck, Clock, CheckCircle2, Inbox } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const Favoritos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: estab } = useEstabelecimentoQuery(user?.id);

  const { data: favoritos = [], isLoading } = useQuery({
    queryKey: ["favoritos-profissionais", estab?.id],
    queryFn: async () => {
      if (!estab?.id) return [];
      const { data, error } = await supabase
        .from("favoritos_profissionais")
        .select(`
          id,
          profissionais (*)
        `)
        .eq("estabelecimento_id", estab.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!estab?.id,
  });

  const removeFavorito = useMutation({
    mutationFn: async (favId: string) => {
      const { error } = await supabase
        .from("favoritos_profissionais")
        .delete()
        .eq("id", favId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoritos-profissionais"] });
      toast({ title: "Removido dos favoritos" });
    }
  });

  const renderStars = (score: number) => {
    const full = Math.floor(score);
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < full ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
        ))}
      </div>
    );
  };

  if (isLoading) return <EstabelecimentoLayout><LoadingSpinner /></EstabelecimentoLayout>;

  return (
    <EstabelecimentoLayout>
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Profissionais Favoritos</h1>
        
        {favoritos.length === 0 ? (
          <EmptyState 
            icon={Heart} 
            title="Sua lista está vazia" 
            description="Favorite profissionais que você gostou de trabalhar para encontrá-los facilmente depois." 
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favoritos.map((fav: any) => {
              const prof = fav.profissionais;
              return (
                <div key={fav.id} className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-all relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    onClick={() => removeFavorito.mutate(fav.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-14 h-14 border border-border">
                      <AvatarImage src={prof.foto_url} />
                      <AvatarFallback>{prof.nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{prof.nome}</p>
                        {prof.trust_score >= 4.5 && <ShieldCheck className="w-4 h-4 text-success" />}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(Number(prof.trust_score || 0))}
                        <span className="text-xs text-muted-foreground">({prof.total_avaliacoes || 0})</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" /> {prof.cidade || "Não informada"}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {prof.funcoes?.slice(0, 3).map((f: string) => (
                        <Badge key={f} variant="secondary" className="text-[10px] px-2 py-0">{f}</Badge>
                      ))}
                      {(prof.funcoes?.length || 0) > 3 && <Badge variant="outline" className="text-[10px] px-2 py-0">+{prof.funcoes.length - 3}</Badge>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm font-semibold">R$ {Number(prof.diaria_minima || 0).toFixed(2)}/dia</span>
                    <Button size="sm" variant="outline" className="h-8">Ver Perfil</Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </EstabelecimentoLayout>
  );
};

export default Favoritos;
