// ================== PDF IMPORT — EQUATORIAL (DEFINITIVO E CORRETO) ==================

async function importarFaturaEquatorial(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let linhas = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    content.items.forEach(item => {
      if (item.str && item.str.trim()) {
        linhas.push(item.str.trim().toUpperCase());
      }
    });
  }

  // ================== MÊS / ANO ==================
  let mes_ano = "";
  const mesLinha = linhas.find(l =>
    l.match(/\b(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{4}\b/)
  );

  if (mesLinha) {
    const match = mesLinha.match(
      /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{4})/
    );
    const meses = {
      JAN: "01", FEV: "02", MAR: "03", ABR: "04",
      MAI: "05", JUN: "06", JUL: "07", AGO: "08",
      SET: "09", OUT: "10", NOV: "11", DEZ: "12"
    };
    mes_ano = `${meses[match[1]]}/${match[2]}`;
  }

  // ================== VENCIMENTO REAL ==================
  let vencimento = "";
  const vencLinha = linhas.find(l => l.includes("VENCIMENTO"));

  if (vencLinha) {
    const m = vencLinha.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (m) {
      const [d, mth, a] = m[1].split("/");
      vencimento = `${a}-${mth}-${d}`;
    }
  }

  // ================== CONSUMOS ==================
  let consumo_ativo_kwh = 0;
  let energia_geracao_kwh = 0;

  for (let i = 0; i < linhas.length; i++) {
    if (
      linhas[i].includes("ENERGIA ATIVA") &&
      linhas[i + 1] &&
      linhas[i + 1].includes("KWH")
    ) {
      const m = linhas[i + 1].match(/(\d+)/);
      if (m) consumo_ativo_kwh = Number(m[1]);
    }

    if (
      linhas[i].includes("ENERGIA GERAÇÃO") &&
      linhas[i + 1] &&
      linhas[i + 1].includes("KWH")
    ) {
      const m = linhas[i + 1].match(/(\d+)/);
      if (m) energia_geracao_kwh = Number(m[1]);
    }
  }

  const consumo_total_kwh = consumo_ativo_kwh + energia_geracao_kwh;

  // ================== VALOR TOTAL ==================
  let valor = null;
  const totalLinha = linhas.find(l => l.includes("TOTAL A PAGAR"));

  if (totalLinha) {
    const m = totalLinha.match(/([\d.,]+)/);
    if (m) {
      valor = Number(m[1].replace(/\./g, "").replace(",", "."));
    }
  }

  return {
    mes_ano,
    vencimento,
    consumo_ativo_kwh,
    energia_geracao_kwh,
    consumo_total_kwh,
    consumo_kwh: consumo_total_kwh,
    valor
  };
}
