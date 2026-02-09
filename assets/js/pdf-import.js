// ================= PDF.JS CONFIG =================
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "assets/libs/pdf.worker.min.js";

// ================= EVENTO =================
document.getElementById("pdfInput")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const dados = await importarFaturaEquatorial(file);

  console.log("PDF importado com sucesso:", dados);

  if (dados.mes_ano) mesAno.value = dados.mes_ano;
  if (dados.vencimento) vencimento.value = dados.vencimento;
  if (dados.consumo_kwh !== null) consumo.value = dados.consumo_kwh;
  if (dados.valor !== null) valor.value = dados.valor;
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

  // NORMALIZAÇÃO PESADA (essencial)
  texto = texto
    .replace(/\s+/g, " ")
    .replace(/\*/g, "")
    .toUpperCase();

  // ================= CONTA MÊS =================
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

  // ================= VENCIMENTO =================
  let vencimento = "";
  const vencMatch = texto.match(/VENCIMENTO\s+(\d{2}\/\d{2}\/\d{4})/);
  if (vencMatch) {
    const [d, m, a] = vencMatch[1].split("/");
    vencimento = `${a}-${m}-${d}`;
  }

  // ================= CONSUMO =================
  let consumo_kwh = null;
  let energia_geracao_kwh = null;

  const ativaMatch = texto.match(/ENERGIA ATIVA.*?KWH\s+(\d+)/);
  if (ativaMatch) consumo_kwh = Number(ativaMatch[1]);

  const geracaoMatch = texto.match(/ENERGIA GERAÇÃO.*?KWH\s+(\d+)/);
  if (geracaoMatch) energia_geracao_kwh = Number(geracaoMatch[1]);

  // ================= VALOR =================
  let valor = null;
  const totalMatch = texto.match(/TOTAL A PAGAR\s*R?\$?\s*([\d.,]+)/);
  if (totalMatch) {
    valor = Number(totalMatch[1].replace(".", "").replace(",", "."));
  }

  return {
    mes_ano,
    vencimento,
    consumo_kwh,
    energia_geracao_kwh,
    valor
  };
}
