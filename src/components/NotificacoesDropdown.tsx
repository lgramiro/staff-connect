import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { cn } from "@/lib/utils";

export const NotificacoesDropdown = () => {
  const { notificacoes, naoLidasCount, marcarComoLida, marcarTodasLidas } = useNotificacoes();
  const ultimas = notificacoes.slice(0, 10);
  const badgeText = naoLidasCount > 9 ? "9+" : String(naoLidasCount);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {naoLidasCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {badgeText}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {naoLidasCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => marcarTodasLidas()}>
              <Check className="w-3 h-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {ultimas.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="divide-y divide-border">
              {ultimas.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.lida && marcarComoLida(n.id)}
                  className={cn(
                    "w-full text-left p-3 hover:bg-muted/50 transition-colors flex gap-2",
                    !n.lida && "bg-primary/5"
                  )}
                >
                  <div className="flex-shrink-0 mt-1.5">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      !n.lida ? "bg-primary" : "bg-transparent"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.lida ? "font-semibold" : "font-medium")}>
                      {n.titulo}
                    </p>
                    {n.mensagem && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.mensagem}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};
