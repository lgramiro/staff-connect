import { Shield } from "lucide-react";

export const AvisoLegal = () => {
  return (
    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3 shadow-sm">
      <div className="bg-primary/10 p-2 rounded-lg text-primary">
        <Shield className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Aviso importante</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          O Tem Staff cobra somente pelo uso da plataforma. O pagamento do serviço 
          é realizado diretamente entre estabelecimento e profissional, fora da plataforma. 
          Não há intermediação de pagamentos.
        </p>
      </div>
    </div>
  );
};
