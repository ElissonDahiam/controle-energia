// ================== PDF IMPORT — EQUATORIAL (DEFINITIVO) ==================

async function importarFaturaEquatorial(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let linhas = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    content.items.forEach(item => {
      const t = item.str.trim().toUpperCase();
      if (t) linhas.push(t);
    });
  }

  // ================== MÊS / ANO ==================
  let mes_ano = "";
  const mesLinha = linhas.find(l =>
    /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{4}/.test(l)
  );

  if (mesLinha) {
    const m = mesLinha.match(/(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{4})/);
    const meses = {
      JAN: "01", FEV: "02", MAR: "03", ABR: "04",
      MAI: "05", JUN: "06", JUL: "07", AGO: "08",
      SET: "09", OUT: "10", NOV: "11", DEZ: "12"
    };
    mes_ano = `${meses[m[1]]}/${m[2]}`;
  }

  // ================== VENCIMENTO (REAL) ==================
  let vencimento = "";
  const vencLinha = linhas.find(l => l.includes("VENCIMENTO"));

  if (vencLinha) {
    const d = vencLinha.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (d) {
      const [dia, mes, ano] = d[1].split("/");
      vencimento = `${ano}-${mes}-${dia}`;
    }
  }

  // ================== CONSUMOS ==================
  let consumo_ativo_kwh = 0;
  let energia_geracao_kwh = 0;

  for (let i = 0; i < linhas.length; i++) {
    if (
      linhas[i].includes("ENERGIA") &&
      linhas[i].includes("ATIVA") &&
      linhas[i].includes("KWH")
    ) {
      const n = linhas.slice(i, i + 10).join(" ").match(/\b(\d{1,4})\b/);
      if (n) consumo_ativo_kwh = Number(n[1]);
    }

    if (
      linhas[i].includes("ENERGIA") &&
      linhas[i].includes("GERAÇÃO") &&
      linhas[i].includes("KWH")
    ) {
      const n = linhas.slice(i, i + 10).join(" ").match(/\b(\d{1,6})\b/);
      if (n) energia_geracao_kwh = Number(n[1]);
    }
  }

  const consumo_total_kwh = consumo_ativo_kwh + energia_geracao_kwh;

  // ================== VALOR TOTAL ==================
  let valor = null;
  const totalLinha = linhas.find(l => l.includes("TOTAL") && l.includes("PAGAR"));

  if (totalLinha) {
    const v = totalLinha.match(/([\d.,]+)/);
    if (v) valor = Number(v[1].replace(".", "").replace(",", "."));
  }

  return {
    mes_ano,
    vencimento,
    consumo_ativo_kwh,
    energia_geracao_kwh,
    consumo_total_kwh,
    valor
  };
}
