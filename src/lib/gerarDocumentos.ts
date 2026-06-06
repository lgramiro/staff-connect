import { jsPDF } from "jspdf";

interface DocumentData {
  profissional: {
    nome: string;
    cpf?: string;
    whatsapp?: string;
  };
  estabelecimento: {
    nome: string;
    cnpj?: string;
    endereco: string;
    responsavel?: string;
  };
  slot: {
    funcao: string;
    data: string;
    horario_inicio: string;
    horario_fim: string;
    valor: number;
    forma_pagamento?: string;
    endereco: string;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const gerarConvitePDF = (dados: DocumentData): Blob => {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(220, 38, 38); // Red-600
  doc.text("Tem Staff", 105, y, { align: "center" });
  y += 15;

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("CONVITE DE PRESTAÇÃO DE SERVIÇO EVENTUAL (FREELANCER)", 105, y, { align: "center" });
  y += 15;

  // Partes
  doc.setFontSize(12);
  doc.text("CONTRATANTE (ESTABELECIMENTO):", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${dados.estabelecimento.nome}`, margin, y);
  y += 6;
  if (dados.estabelecimento.cnpj) {
    doc.text(`CNPJ: ${dados.estabelecimento.cnpj}`, margin, y);
    y += 6;
  }
  doc.text(`Endereço: ${dados.estabelecimento.endereco}`, margin, y);
  y += 6;
  if (dados.estabelecimento.responsavel) {
    doc.text(`Responsável: ${dados.estabelecimento.responsavel}`, margin, y);
    y += 6;
  }
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.text("CONTRATADO (PROFISSIONAL):", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${dados.profissional.nome}`, margin, y);
  y += 6;
  if (dados.profissional.cpf) {
    doc.text(`CPF: ${dados.profissional.cpf}`, margin, y);
    y += 6;
  }
  doc.text(`WhatsApp: ${dados.profissional.whatsapp || "N/A"}`, margin, y);
  y += 10;

  // Detalhes do Serviço
  doc.setFont("helvetica", "bold");
  doc.text("DETALHES DO SERVIÇO:", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.text(`Função: ${dados.slot.funcao}`, margin, y);
  y += 6;
  doc.text(`Data: ${formatDate(dados.slot.data)}`, margin, y);
  y += 6;
  doc.text(`Horário: ${dados.slot.horario_inicio} às ${dados.slot.horario_fim}`, margin, y);
  y += 6;
  doc.text(`Local: ${dados.slot.endereco}`, margin, y);
  y += 6;
  doc.text(`Valor Informativo: ${formatCurrency(dados.slot.valor)}`, margin, y);
  y += 15;

  // Cláusulas
  doc.setFont("helvetica", "bold");
  doc.text("CLÁUSULAS:", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const clausulas = [
    "1. O presente convite confirma prestação de serviço eventual, sem vínculo empregatício.",
    "2. O pagamento será realizado diretamente entre as partes, fora da plataforma Tem Staff.",
    "3. O Tem Staff não intermedia pagamentos e cobra apenas pela assinatura da plataforma."
  ];

  clausulas.forEach(c => {
    const lines = doc.splitTextToSize(c, 170);
    doc.text(lines, margin, y);
    y += (lines.length * 5) + 2;
  });

  y += 15;

  // Aceites
  doc.setFontSize(12);
  doc.text("Aceite do Profissional: ___________________________  Data: ____/____/____", margin, y);
  y += 12;
  doc.text("Aceite do Estabelecimento: ________________________  Data: ____/____/____", margin, y);

  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(150);
  const footerText = "Este documento foi gerado automaticamente pela plataforma Tem Staff. O aceite eletrônico na plataforma possui validade jurídica entre as partes para fins de comprovação de prestação de serviço eventual.";
  const footerLines = doc.splitTextToSize(footerText, 170);
  doc.text(footerLines, 105, 280, { align: "center" });

  return doc.output("blob");
};

export const gerarReciboPDF = (dados: DocumentData & { valor_declarado: number }): Blob => {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(220, 38, 38);
  doc.text("Tem Staff", 105, y, { align: "center" });
  y += 15;

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("RECIBO DE PRESTAÇÃO DE SERVIÇO FREELANCER", 105, y, { align: "center" });
  y += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${dados.profissional.nome}`, margin, y);
  y += 6;
  if (dados.profissional.cpf) {
    doc.text(`CPF: ${dados.profissional.cpf}`, margin, y);
    y += 6;
  }
  y += 10;

  const declaracao = `Declaro ter recebido de ${dados.estabelecimento.nome} a importância de ${formatCurrency(dados.valor_declarado)} referente à prestação de serviço eventual de ${dados.slot.funcao} realizado em ${formatDate(dados.slot.data)}, no horário de ${dados.slot.horario_inicio} às ${dados.slot.horario_fim}, sem caracterizar vínculo empregatício.`;
  
  const textLines = doc.splitTextToSize(declaracao, 170);
  doc.text(textLines, margin, y);
  y += (textLines.length * 6) + 10;

  doc.text(`Data do Pagamento: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
  y += 20;

  doc.text("Assinatura: ___________________________________________", margin, y);
  y += 6;
  doc.setFontSize(10);
  doc.text(dados.profissional.nome, margin + 20, y);

  y += 30;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Documento gerado pela plataforma Tem Staff. Pagamento realizado diretamente entre as partes.", 105, y, { align: "center" });

  return doc.output("blob");
};
