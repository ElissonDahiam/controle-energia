// ================= PDF.JS CONFIG (UMD) =================
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "assets/libs/pdf.worker.min.js";

// ================= EVENTO DE IMPORTAÇÃO =================
document.getElementById("pdfInput")
  ?.addEventListener("change", async (e) => {

  const file = e.target.files[0];
  if (!file) return;

  const dados = await importarFaturaEquatorial(file);

  if (dados.mes_ano) mesAno.value = dados.mes_ano;
  if (dados.vencimento) vencimento.value = dados.vencimento;
  if (dados.consumo_kwh !== undefined) consumo.value = dados.consumo_kwh;
  if (dados.valor !== undefined) valor.value = dados.valor;

  console.log("PDF importado com sucesso:", dados);
});

// ================= PARSER EQUATORIAL =================
async function importarFaturaEquatorial(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let texto = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    texto += content.items.map(i => i.str).join(" ") + " ";
  }

  texto = texto.replace(/\s+/g, " ").toUpperCase();

  // ===== CONTA MÊS =====
  let mes_ano = "";
  const mesMatch = texto.match(/CONTA MÊS\s+([A-Z]{3})\/(\d{4})/);
  if (mesMatch) {
    const meses = {
      JAN:"01", FEV:"02", MAR:"03", ABR:"04",
      MAI:"05", JUN:"06", JUL:"07", AGO:"08",
      SET:"09", OUT:"10", NOV:"11", DEZ:"12"
    };
    mes_ano = `${meses[mesMatch[1]]}/${mesMatch[2]}`;
  }

  // ===== VENCIMENTO =====
  let vencimento = "";
  const vencMatch = texto.match(/VENCIMENTO\s+(\d{2}\/\d{2}\/\d{4})/);
  if (vencMatch) {
    const [d,m,a] = vencMatch[1].split("/");
    vencimento = `${a}-${m}-${d}`;
  }

  // ===== CONSUMO =====
  const ativa = texto.match(/ENERGIA ATIVA.*?(\d+)\s*KWH/);
  const geracao = texto.match(/ENERGIA GERAÇÃO.*?(\d+)\s*KWH/);

  const consumo_kwh = ativa ? Number(ativa[1]) : 0;
  const energia_geracao_kwh = geracao ? Number(geracao[1]) : 0;

  // ===== VALOR =====
  let valor = "";
  const total = texto.match(/TOTAL A PAGAR\s*R?\$?\s*([\d.,]+)/);
  if (total) {
    valor = Number(total[1].replace(".", "").replace(",", "."));
  }

  return {
    mes_ano,
    vencimento,
    consumo_kwh,
    energia_geracao_kwh,
    valor
  };
}
