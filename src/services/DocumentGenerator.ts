import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  UnderlineType,
} from "docx";
import { saveAs } from "file-saver";
import { Cadastro } from "../types/typeCadastro";
import { OPCOES_PAGAMENTO } from "../utils/options";

const calcularIdade = (dataNasc: string) => {
  if (!dataNasc) return "";
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return idade.toString();
};

const getFormaPagamentoLabel = (valor: string) => {
  if (!valor) return "_____________";
  const opcao = OPCOES_PAGAMENTO.find((op) => op.value === valor);
  return opcao ? opcao.label : valor;
};

export const gerarContratoMatricula = async (
  aluno: Cadastro,
  infoAdicional: string = "",
  taxaMulta: string = "10",
) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const valorMensal = aluno.valorMensalidade
    ? Number(aluno.valorMensalidade).toFixed(2).replace(".", ",")
    : "_____";
  const diasSemanaQtd =
    aluno.diasSemana && aluno.diasSemana.length > 0
      ? aluno.diasSemana.length
      : "___";

  const dataNascFormatada = aluno.dataNascimento
    ? new Date(aluno.dataNascimento).toLocaleDateString("pt-BR")
    : "___/___/___";

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 24,
            color: "000000",
          },
        },
        heading1: {
          run: {
            font: "Arial",
            size: 32,
            bold: true,
            color: "000000",
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Ficha de inscrição",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Nome: " }),
              new TextRun({
                text: `${aluno.nome}                                         `,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
              new TextRun({ text: " RG: " }),
              new TextRun({
                text: `${aluno.rg || "_________________"}`,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
              new TextRun({ text: " idade: " }),
              new TextRun({
                text: `${calcularIdade(aluno.dataNascimento)} anos`,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Data nasc.: " }),
              new TextRun({
                text: `${dataNascFormatada}   `,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
              new TextRun({ text: " cel: " }),
              new TextRun({
                text: `${aluno.telefone}                  `,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
              new TextRun({ text: " tel de emergência: " }),
              new TextRun({
                text: `${aluno.telefone2 || "____________________"}`,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Endereço: " }),
              new TextRun({
                text: `${aluno.endereco}`,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
              new TextRun({
                text: "______________________________________________________",
              }),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Realiza atividade física:  " }),
              new TextRun(
                "intensa (  )   moderada (  )   leve (  )   nenhuma (  )",
              ),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "possui problema de saúde, tais como:" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(
                "diabetes (  )   hipertensão (  )   convulsão (  )   outros (  ) _____________________________",
              ),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "problema motor: " }),
              new TextRun(
                "______________________________________________________",
              ),
            ],
            spacing: { after: 400 },
          }),

          ...(infoAdicional
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Obs. Adicionais: ", color: "FF0000" }),
                    new TextRun(infoAdicional),
                  ],
                  spacing: { after: 200 },
                }),
              ]
            : []),

          new Paragraph({
            children: [
              new TextRun({ text: "Plano: " }),
              new TextRun({
                text: `${diasSemanaQtd}`,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
              new TextRun(" vezes por semana, com valor de "),
              new TextRun({ text: "R$ " }),
              new TextRun({
                text: `${valorMensal}`,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
              new TextRun(" mensais, com pagamento por meio de "),
              new TextRun({
                text: `${getFormaPagamentoLabel(aluno.formaPagamento)}`,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
              new TextRun(" com vencimento para todo dia "),
              new TextRun({
                text: `${aluno.diaVencimento || "__"}`,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
              new TextRun("."),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Autoriza o uso de imagem (fotos e vídeos)? ",
              }),
              new TextRun("(  ) Sim (  ) Não"),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Atenção:",
                bold: true,
              }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: "Em caso de faltas, o aluno terá o direito de agendar a reposição em horários disponíveis, desde que esteja com a mensalidade vigente.",
            alignment: AlignmentType.JUSTIFIED,
            bullet: { level: 0 },
          }),

          new Paragraph({
            text: `Em caso de atraso da mensalidade o aluno estará sujeito a pagar multa de ${taxaMulta}% do valor total.`,
            alignment: AlignmentType.JUSTIFIED,
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "No recesso de fim de ano o aluno deverá manter sua mensalidade em dia, evitando juros ou a perda de possíveis descontos.",
            alignment: AlignmentType.JUSTIFIED,
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "A mensalidade estará sujeita a reajustes uma vez por ano, sendo feita sempre entre os meses de janeiro e fevereiro.",
            alignment: AlignmentType.JUSTIFIED,
            bullet: { level: 0 },
            spacing: { after: 600 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Data: " }),
              new TextRun({
                text: `  ${dataHoje}  `,
                underline: { type: UnderlineType.SINGLE, color: "000000" },
              }),
            ],
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: "Ass. " }),
              new TextRun(
                "___________________________________________________",
              ),
            ],
          }),
          new Paragraph({
            text: `(${aluno.nome})`,
            alignment: AlignmentType.LEFT,
            indent: { left: 700 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Ficha_${aluno.nome}.docx`);
};
