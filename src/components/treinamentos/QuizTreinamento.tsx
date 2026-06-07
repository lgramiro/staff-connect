import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Award, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Questao {
  id: number;
  enunciado: string;
  alternativas: { letra: string; texto: string; correta: boolean }[];
  banco: string;
}

const bancoGeral: Questao[] = [
  { id: 1, enunciado: "O que deve ser feito se você confirmar presença em uma vaga e surgir um imprevisto?", alternativas: [{letra: 'A', texto: 'Avisar pelo app com o máximo de antecedência possível', correta: true}, {letra: 'B', texto: 'Apenas não aparecer', correta: false}, {letra: 'C', texto: 'Avisar no dia seguinte', correta: false}, {letra: 'D', texto: 'Pedir para um amigo ir no lugar', correta: false}], banco: 'geral' },
  { id: 2, enunciado: "Qual é a temperatura mínima no centro de um alimento para garantir segurança alimentar?", alternativas: [{letra: 'A', texto: '50°C', correta: false}, {letra: 'B', texto: '74°C', correta: true}, {letra: 'C', texto: '100°C', correta: false}, {letra: 'D', texto: '30°C', correta: false}], banco: 'geral' },
  { id: 3, enunciado: "Como o Trust Score é calculado no Tem Staff?", alternativas: [{letra: 'A', texto: 'Apenas por tempo de casa', correta: false}, {letra: 'B', texto: 'Por uma combinação de avaliações, comparecimento, completude do perfil e tempo de cadastro', correta: true}, {letra: 'C', texto: 'Aleatoriamente', correta: false}, {letra: 'D', texto: 'Apenas por nota de avaliações', correta: false}], banco: 'geral' },
  { id: 4, enunciado: "Qual é a postura correta ao usar o celular durante um serviço?", alternativas: [{letra: 'A', texto: 'Usar sempre que quiser', correta: false}, {letra: 'B', texto: 'Manter no silencioso e usar apenas em intervalos, nunca na frente dos clientes', correta: true}, {letra: 'C', texto: 'Usar apenas para tirar fotos', correta: false}, {letra: 'D', texto: 'Deixar ligado no volume máximo', correta: false}], banco: 'geral' },
  { id: 5, enunciado: "O que caracteriza a zona de perigo na segurança alimentar?", alternativas: [{letra: 'A', texto: 'Entre 5°C e 60°C, onde bactérias se multiplicam rapidamente', correta: true}, {letra: 'B', texto: 'Abaixo de 0°C', correta: false}, {letra: 'C', texto: 'Acima de 100°C', correta: false}, {letra: 'D', texto: 'Entre 80°C e 100°C', correta: false}], banco: 'geral' },
  { id: 6, enunciado: "Qual deve ser a aparência das unhas de profissionais que manipulam alimentos?", alternativas: [{letra: 'A', texto: 'Longas e decoradas', correta: false}, {letra: 'B', texto: 'Curtas, limpas e sem esmalte', correta: true}, {letra: 'C', texto: 'Com esmalte claro', correta: false}, {letra: 'D', texto: 'Com unhas postiças', correta: false}], banco: 'geral' },
  { id: 7, enunciado: "Quando ocorre a avaliação após um serviço no Tem Staff?", alternativas: [{letra: 'A', texto: 'O profissional avalia o estabelecimento', correta: false}, {letra: 'B', texto: 'O estabelecimento avalia o profissional com nota de 1 a 5 estrelas', correta: true}, {letra: 'C', texto: 'Nunca ocorre', correta: false}, {letra: 'D', texto: 'Automaticamente', correta: false}], banco: 'geral' },
  { id: 8, enunciado: "Qual é a conduta correta ao ter um conflito com outro funcionário durante o serviço?", alternativas: [{letra: 'A', texto: 'Discutir na frente dos clientes', correta: false}, {letra: 'B', texto: 'Manter a calma durante o serviço e registrar pelo app após o turno', correta: true}, {letra: 'C', texto: 'Ir embora imediatamente', correta: false}, {letra: 'D', texto: 'Chamar a polícia', correta: false}], banco: 'geral' }
];

const bancoFuncoes: Record<string, Questao[]> = {
  garcom: [{ id: 101, enunciado: "Qual é o sinal universal que indica que o cliente terminou o prato?", alternativas: [{letra: 'A', texto: 'Talheres cruzados', correta: false}, {letra: 'B', texto: 'Posicionar os talheres paralelos sobre o prato', correta: true}, {letra: 'C', texto: 'Talheres fora do prato', correta: false}, {letra: 'D', texto: 'Prato no chão', correta: false}], banco: 'garcom' }, { id: 102, enunciado: "O que fazer ao receber um pedido com alergia a amendoim?", alternativas: [{letra: 'A', texto: 'Ignorar', correta: false}, {letra: 'B', texto: 'Destacar na comanda e comunicar verbalmente à cozinha', correta: true}, {letra: 'C', texto: 'Servir sem avisar', correta: false}, {letra: 'D', texto: 'Pedir para o cliente trocar', correta: false}], banco: 'garcom' }],
  cozinheiro: [{ id: 201, enunciado: "O que significa PEPS?", alternativas: [{letra: 'A', texto: 'Primeiro que Entra, Primeiro que Sai', correta: true}, {letra: 'B', texto: 'Pode Entrar, Pode Sair', correta: false}, {letra: 'C', texto: 'Preparo Especial Por Semana', correta: false}, {letra: 'D', texto: 'Prato Especial para Sobremesa', correta: false}], banco: 'cozinheiro' }, { id: 202, enunciado: "O que é contaminação cruzada?", alternativas: [{letra: 'A', texto: 'Cozinhar rápido', correta: false}, {letra: 'B', texto: 'Transferência de microrganismos de um alimento contaminado para outro via contato ou utensílios', correta: true}, {letra: 'C', texto: 'Misturar sabores', correta: false}, {letra: 'D', texto: 'Trocar receitas', correta: false}], banco: 'cozinheiro' }],
  bartender: [{ id: 301, enunciado: "Por que o jigger é essencial para o bartender?", alternativas: [{letra: 'A', texto: 'Para decoração', correta: false}, {letra: 'B', texto: 'Para garantir consistência e precisão nas dosagens', correta: true}, {letra: 'C', texto: 'Para gelar o copo', correta: false}, {letra: 'D', texto: 'Para filtrar drinks', correta: false}], banco: 'bartender' }, { id: 302, enunciado: "Qual técnica é correta para preparar um Negroni?", alternativas: [{letra: 'A', texto: 'Build', correta: false}, {letra: 'B', texto: 'Stir no mixing glass com gelo', correta: true}, {letra: 'C', texto: 'Shake', correta: false}, {letra: 'D', texto: 'Blend', correta: false}], banco: 'bartender' }],
  recepcionista: [{ id: 401, enunciado: "Qual é a postura correta ao receber um cliente na entrada?", alternativas: [{letra: 'A', texto: 'Ficar sentado no celular', correta: false}, {letra: 'B', texto: 'Estar de pé, com postura ereta, sorrindo e cumprimentando assim que o cliente entra', correta: true}, {letra: 'C', texto: 'Ignorar o cliente', correta: false}, {letra: 'D', texto: 'Falar apenas se perguntado', correta: false}], banco: 'recepcionista' }, { id: 402, enunciado: "O que fazer quando uma reserva não está registrada no sistema?", alternativas: [{letra: 'A', texto: 'Mandá-lo embora', correta: false}, {letra: 'B', texto: 'Pedir desculpas, acomodar como walk-in na primeira disponibilidade e avisar o gerente', correta: true}, {letra: 'C', texto: 'Colocá-lo em uma mesa reservada', correta: false}, {letra: 'D', texto: 'Pedir para o cliente esperar em pé na porta', correta: false}], banco: 'recepcionista' }],
  chapeiro: [{ id: 501, enunciado: "O que fazer em caso de chama alta inesperada na chapa?", alternativas: [{letra: 'A', texto: 'Jogar água', correta: false}, {letra: 'B', texto: 'Abafar com uma tampa, nunca usar água', correta: true}, {letra: 'C', texto: 'Assoprar', correta: false}, {letra: 'D', texto: 'Chamar o bombeiro', correta: false}], banco: 'chapeiro' }, { id: 502, enunciado: "Por que não pressionar a carne com espátula na chapa?", alternativas: [{letra: 'A', texto: 'Porque diminui o tamanho', correta: false}, {letra: 'B', texto: 'Porque expulsa os sucos internos, ressecando a carne', correta: true}, {letra: 'C', texto: 'Porque esfria a carne', correta: false}, {letra: 'D', texto: 'Porque deixa a carne mais fina', correta: false}], banco: 'chapeiro' }],
  cumim: [{ id: 601, enunciado: "Quando o cumim deve retirar o prato do cliente?", alternativas: [{letra: 'A', texto: 'Assim que ele parar de mastigar', correta: false}, {letra: 'B', texto: 'Apenas quando TODOS os clientes da mesa tiverem terminado', correta: true}, {letra: 'C', texto: 'Quando o prato estiver meio vazio', correta: false}, {letra: 'D', texto: 'Assim que ele terminar', correta: false}], banco: 'cumim' }, { id: 602, enunciado: "Qual sinal visual indica que o cliente terminou o prato?", alternativas: [{letra: 'A', texto: 'Talheres fora do prato', correta: false}, {letra: 'B', texto: 'Talheres paralelos posicionados sobre o prato', correta: true}, {letra: 'C', texto: 'Talheres no guardanapo', correta: false}, {letra: 'D', texto: 'Prato vazio', correta: false}], banco: 'cumim' }],
  sommelier: [{ id: 701, enunciado: "Qual é o protocolo correto ao apresentar uma garrafa de vinho?", alternativas: [{letra: 'A', texto: 'Já aberta', correta: false}, {letra: 'B', texto: 'Apresentar fechada, confirmar o pedido, abrir na frente do cliente e oferecer para provar', correta: true}, {letra: 'C', texto: 'Servir diretamente na taça', correta: false}, {letra: 'D', texto: 'Deixar na mesa para o cliente abrir', correta: false}], banco: 'sommelier' }, { id: 702, enunciado: "Qual é a temperatura ideal para servir espumante ou champanhe?", alternativas: [{letra: 'A', texto: '15-20°C', correta: false}, {letra: 'B', texto: '6-8°C', correta: true}, {letra: 'C', texto: 'Temperatura ambiente', correta: false}, {letra: 'D', texto: 'Acima de 25°C', correta: false}], banco: 'sommelier' }]
};

export const QuizTreinamento = ({ funcao, onAprovado }: { funcao: string; onAprovado: (acertos: number, total: number) => void }) => {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [finalizado, setFinalizado] = useState(false);

  const carregarQuestoes = () => {
    const gerais = [...bancoGeral].sort(() => 0.5 - Math.random()).slice(0, 5);
    const funcoes = (bancoFuncoes[funcao] || []).sort(() => 0.5 - Math.random()).slice(0, 5);
    setQuestoes([...gerais, ...funcoes].sort(() => 0.5 - Math.random()));
    setIndice(0);
    setAcertos(0);
    setFinalizado(false);
    setSelecionada(null);
  };

  useEffect(() => {
    carregarQuestoes();
  }, [funcao]);

  if (finalizado) {
    const totalQuestoes = questoes.length || 1;
    const percentual = (acertos / totalQuestoes) * 100;
    return (
      <Card className="text-center p-6 space-y-4">
        <h2 className="text-xl font-bold">Resultado</h2>
        <p className="text-lg">{acertos} de {totalQuestoes} acertos — {Math.round(percentual)}%</p>
        {percentual >= 70 ? (
          <div className="space-y-4">
            <p className="text-green-600 font-bold">Parabéns! Você foi aprovado.</p>
            <Button onClick={() => onAprovado(acertos)} className="w-full">Acessar o Tem Staff</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-amber-600 font-bold">Você não atingiu a nota necessária.</p>
            <Button onClick={carregarQuestoes} className="w-full" variant="outline"><RotateCcw className="mr-2" /> Refazer o Quiz</Button>
          </div>
        )}
      </Card>
    );
  }

  const q = questoes[indice];
  if (!q) return null;

  const totalQuestoes = questoes.length;

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Questão {indice + 1} de {totalQuestoes}</span>
          <span>{Math.round(((indice) / totalQuestoes) * 100)}%</span>
        </div>
        <Progress value={(indice / totalQuestoes) * 100} />
      </div>
      
      <h3 className="text-lg font-medium">{q.enunciado}</h3>
      
      <div className="space-y-3">
        {q.alternativas.map((alt) => (
          <Button 
            key={alt.letra}
            variant={selecionada === alt.letra ? "default" : "outline"}
            className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal"
            onClick={() => setSelecionada(alt.letra)}
          >
            <span className="font-bold mr-2">{alt.letra}.</span> {alt.texto}
          </Button>
        ))}
      </div>

      <Button 
        className="w-full" 
        disabled={!selecionada} 
        onClick={() => {
          if (q.alternativas.find(a => a.letra === selecionada)?.correta) setAcertos(prev => prev + 1);
          if (indice === totalQuestoes - 1) {
            setFinalizado(true);
          } else { 
            setIndice(prev => prev + 1); 
            setSelecionada(null); 
          }
        }}
      >
        {indice === totalQuestoes - 1 ? "Ver Resultado" : "Próxima"}
      </Button>
    </Card>
  );
};
