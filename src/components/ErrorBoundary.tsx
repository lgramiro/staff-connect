import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6 animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Ops! Algo deu errado</h1>
              <p className="text-muted-foreground">
                Ocorreu um erro inesperado ao carregar esta página.
              </p>
              {this.state.error && (
                <div className="p-3 bg-muted rounded-md text-xs font-mono text-left overflow-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="hero" 
                className="w-full"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Recarregar página
              </Button>
              <Button 
                onClick={() => window.location.href = "/"} 
                variant="ghost" 
                className="w-full"
              >
                Voltar para o início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;