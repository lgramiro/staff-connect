import { useState } from "react";
import { ProfissionalLayout } from "@/components/layouts/ProfissionalLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  Receipt,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { useProfissionalQuery } from "@/hooks/queries/useProfissional";
import { gerarReciboPDF } from "@/lib/gerarDocumentos";

const MeusDocumentos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: prof } = useProfissionalQuery(user?.id);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [selectedSlotForReceipt, setSelectedSlotForReceipt] = useState<any>(null);

  // Buscar documentos
  const { data: documentos = [], isLoading: loadingDocs } = useQuery({
    queryKey: ["documentos", prof?.id],
    queryFn: async () => {
      if (!prof?.id) return [];
      const { data, error } = await supabase
        .from("documentos")
        .select(`
          *,
          slot:slots (*),
          estabelecimento:estabelecimentos (*)
        `)
        .eq("profissional_id", prof.id)
        .order("gerado_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!prof?.id
  });

  // Buscar candidaturas concluídas para gerar recibo (apenas as que ainda não têm recibo)
  const { data: concluidasSemRecibo = [], isLoading: loadingConcluidas } = useQuery({
    queryKey: ["concluidas-sem-recibo", prof?.id],
    queryFn: async () => {
      if (!prof?.id) return [];
      
      // Busca candidaturas concluídas
      const { data: cands, error } = await supabase
        .from("candidaturas")
        .select(`
          id,
          slot_id,
          slot:slots (*, estabelecimento:estabelecimentos (*))
        `)
        .eq("profissional_id", prof.id)
        .eq("status", "concluida");

      if (error) throw error;

      // Filtra as que já possuem recibo na tabela documentos
      const { data: recibos } = await supabase
        .from("documentos")
        .select("slot_id")
        .eq("tipo", "RECIBO")
        .eq("profissional_id", prof.id);
      
      const slotIdsComRecibo = new Set((recibos || []).map(r => r.slot_id));
      return (cands || []).filter(c => !slotIdsComRecibo.has(c.slot_id));
    },
    enabled: !!prof?.id
  });

  const aceitarConvite = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase
        .from("documentos")
        .update({ aceite_profissional_at: new Date().toISOString() })
        .eq("id", docId);
      
      if (error) throw error;

      // Também atualiza a candidatura para 'confirmada' se for o caso
      const doc = documentos.find(d => d.id === docId);
      if (doc?.slot_id) {
        await supabase
          .from("candidaturas")
          .update({ status: "confirmada" })
          .eq("slot_id", doc.slot_id)
          .eq("profissional_id", prof?.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
      queryClient.invalidateQueries({ queryKey: ["candidaturas"] });
      toast({ title: "Convite aceito!", description: "Sua presença foi confirmada." });
      setShowAcceptDialog(false);
    }
  });

  const criarRecibo = useMutation({
    mutationFn: async (cand: any) => {
      if (!prof || !cand.slot) return;

      const pdfBlob = gerarReciboPDF({
        profissional: {
          nome: prof.nome,
          whatsapp: prof.whatsapp
        },
        estabelecimento: {
          nome: cand.slot.estabelecimento.nome,
          endereco: cand.slot.estabelecimento.endereco,
          responsavel: cand.slot.estabelecimento.responsavel
        },
        slot: {
          funcao: cand.slot.funcao,
          data: cand.slot.data,
          horario_inicio: cand.slot.horario_inicio,
          horario_fim: cand.slot.horario_fim,
          valor: Number(cand.slot.valor),
          endereco: cand.slot.endereco || cand.slot.estabelecimento.endereco
        },
        valor_declarado: Number(cand.slot.valor)
      });

      const fileName = `recibos/${cand.slot_id}_${prof.id}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(fileName, pdfBlob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("documentos")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("documentos").insert({
        tipo: "RECIBO",
        slot_id: cand.slot_id,
        estabelecimento_id: cand.slot.estabelecimento_id,
        profissional_id: prof.id,
        pdf_url: publicUrlData.publicUrl,
        gerado_at: new Date().toISOString()
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
      queryClient.invalidateQueries({ queryKey: ["concluidas-sem-recibo"] });
      toast({ title: "Recibo gerado!", description: "O documento foi salvo em seu histórico." });
      setShowReceiptDialog(false);
    }
  });

  if (loadingDocs || loadingConcluidas) return <ProfissionalLayout><LoadingSpinner /></ProfissionalLayout>;

  return (
    <ProfissionalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Meus Documentos</h1>
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="w-3 h-3" /> {documentos.length} total
          </Badge>
        </div>

        {/* Alerta de recibos pendentes */}
        {concluidasSemRecibo.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Receipt className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Recibos pendentes</p>
                <p className="text-sm text-muted-foreground">Você tem {concluidasSemRecibo.length} serviço(s) concluído(s) aguardando geração de recibo.</p>
              </div>
            </div>
            <div className="flex gap-2">
              {concluidasSemRecibo.map(cand => (
                <Button 
                  key={cand.id} 
                  size="sm" 
                  onClick={() => {
                    setSelectedSlotForReceipt(cand);
                    setShowReceiptDialog(true);
                  }}
                >
                  Gerar recibo ({cand.slot.funcao})
                </Button>
              ))}
            </div>
          </div>
        )}

        {documentos.length === 0 ? (
          <EmptyState 
            icon={FileText} 
            title="Nenhum documento gerado" 
            description="Convites de serviço e recibos de pagamento aparecerão aqui automaticamente." 
          />
        ) : (
          <div className="grid gap-4">
            {documentos.map((doc: any) => (
              <div key={doc.id} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${doc.tipo === 'CONVITE' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {doc.tipo === 'CONVITE' ? <FileCheck className="w-6 h-6" /> : <Receipt className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold">{doc.tipo === 'CONVITE' ? 'Convite de Serviço' : 'Recibo de Pagamento'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doc.slot?.funcao} em {doc.estabelecimento?.nome} • {new Date(doc.gerado_at).toLocaleDateString('pt-BR')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {doc.tipo === 'CONVITE' && (
                        doc.aceite_profissional_at ? (
                          <Badge variant="secondary" className="bg-success/10 text-success border-success/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Aceito em {new Date(doc.aceite_profissional_at).toLocaleDateString('pt-BR')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pendente de aceite
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {doc.tipo === 'CONVITE' && !doc.aceite_profissional_at && (
                    <Button 
                      variant="hero" 
                      size="sm"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setShowAcceptDialog(true);
                      }}
                    >
                      Ver e Aceitar
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Aceite de Convite */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aceitar Convite de Serviço</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
              <p><strong>Estabelecimento:</strong> {selectedDoc?.estabelecimento?.nome}</p>
              <p><strong>Função:</strong> {selectedDoc?.slot?.funcao}</p>
              <p><strong>Data:</strong> {selectedDoc?.slot?.data ? new Date(selectedDoc.slot.data).toLocaleDateString('pt-BR') : ''}</p>
              <p><strong>Horário:</strong> {selectedDoc?.slot?.horario_inicio} às {selectedDoc?.slot?.horario_fim}</p>
              <p><strong>Valor:</strong> R$ {Number(selectedDoc?.slot?.valor || 0).toFixed(2)}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground italic">
                Ao aceitar, você confirma sua presença para a data e horários estipulados acima e declara estar ciente de que a prestação de serviço eventual não caracteriza vínculo empregatício.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>Cancelar</Button>
            <Button 
              variant="hero" 
              onClick={() => aceitarConvite.mutate(selectedDoc.id)}
              disabled={aceitarConvite.isPending}
            >
              {aceitarConvite.isPending ? "Processando..." : "Aceitar Convite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Geração de Recibo */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Recebimento</DialogTitle>
            <DialogDescription>
              Confirme que você recebeu o pagamento referente ao serviço prestado.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-success/5 border border-success/20 p-4 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <p className="text-sm">
                Confirmo que recebi o pagamento de <strong>R$ {Number(selectedSlotForReceipt?.slot?.valor || 0).toFixed(2)}</strong> referente ao serviço de {selectedSlotForReceipt?.slot?.funcao} realizado em {selectedSlotForReceipt?.slot?.data}.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>Cancelar</Button>
            <Button 
              variant="hero" 
              onClick={() => criarRecibo.mutate(selectedSlotForReceipt)}
              disabled={criarRecibo.isPending}
            >
              {criarRecibo.isPending ? "Gerando..." : "Confirmar e Gerar Recibo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProfissionalLayout>
  );
};

export default MeusDocumentos;
