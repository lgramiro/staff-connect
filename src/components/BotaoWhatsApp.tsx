import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

interface BotaoWhatsAppProps {
  telefone: string;
  mensagem: string;
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "outline" | "hero" | "secondary" | "ghost" | "link" | "default" | "destructive";
}

export const BotaoWhatsApp = ({ 
  telefone, 
  mensagem, 
  label = "WhatsApp",
  className = "",
  size = "sm",
  variant = "outline"
}: BotaoWhatsAppProps) => {
  const telefoneFormatado = telefone.replace(/\D/g, "");
  const link = `https://wa.me/55${telefoneFormatado}?text=${encodeURIComponent(mensagem)}`;

  return (
    <Button 
      size={size} 
      variant={variant} 
      className={`bg-success/5 hover:bg-success/10 border-success/20 text-success ${className}`}
      onClick={() => window.open(link, "_blank")}
    >
      <MessageCircle className="w-4 h-4 mr-2" /> {label}
    </Button>
  );
};
