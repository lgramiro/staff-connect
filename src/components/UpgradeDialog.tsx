import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limite: number | null;
  planoNome: string;
}

export const UpgradeDialog = ({ open, onOpenChange, limite, planoNome }: UpgradeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Limite atingido</DialogTitle>
          <DialogDescription>
            Você atingiu o limite de {limite} vagas do plano {planoNome}. 
            Faça upgrade para criar mais vagas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button asChild variant="hero">
            <Link to="/app/estabelecimento/planos">Ver Planos</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
