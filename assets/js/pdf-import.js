// ================== PDF IMPORT — EQUATORIAL (ROBUSTO REAL) ==================

async function importarFaturaEquatorial(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let linhas = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    content.items.forEach(i => {
      const t = i.str?.trim();
      if (t) linhas.push(t.toUpperCase());
    });
  }

  /* ================== MÊS / ANO ================== */
  let mes_ano = "";
  const mesLinha = linhas.find(l =>
    /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{4}/.test(l)
  );
  if (mesLinha) {
    const m = mesLinha.match(/(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{4})/);
    const map = {
      JAN:"01",FEV:"02",MAR:"03",ABR:"04",
      MAI:"05",JUN:"06",JUL:"07",AGO:"08",
      SET:"09",OUT:"10",NOV:"11",DEZ:"12"
    };
    mes_ano = `${map[m[1]]}/${m[2]}`;
  }

  /* ================== VENCIMENTO ================== */
  let vencimento = "";
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i] === "VENCIMENTO" && linhas[i + 1]?.match(/\d{2}\/\d{2}\/\d{4}/)) {
      const [d, m, a] = linhas[i + 1].split("/");
      vencimento = `${a}-${m}-${d}`;
      break;
    }
  }

  /* ================== CONSUMOS ================== */
  let consumoAtivo = 0;
  let energiaGeracao = 0;

  for (let i = 0; i < linhas.length; i++) {

    // ENERGIA ATIVA → último número da linha
    if (linhas[i].includes("ENERGIA ATIVA") && linhas[i].includes("KWH")) {
      const nums = linhas[i].match(/\d+/g);
      if (nums?.length) {
        consumoAtivo = Number(nums[nums.length - 1]);
      }
    }

    // ENERGIA GERAÇÃO → último número da linha
    if (linhas[i].includes("ENERGIA GERAÇÃO") && linhas[i].includes("KWH")) {
      const nums = linhas[i].match(/\d+/g);
      if (nums?.length) {
        energiaGeracao = Number(nums[nums.length - 1]);
      }
    }
  }

  const consumoTotal = consumoAtivo + energiaGeracao;

  /* ================== VALOR TOTAL ================== */
  let valor = null;
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i].includes("TOTAL A PAGAR")) {
      const prox = linhas.slice(i, i + 3).join(" ");
      const m = prox.match(/(\d{1,3}(\.\d{3})*,\d{2})/);
      if (m) {
        valor = Number(m[1].replace(/\./g, "").replace(",", "."));
        break;
      }
    }
  }

  return {
    mes_ano,
    vencimento,
    consumo_ativo_kwh: consumoAtivo,
    energia_geracao_kwh: energiaGeracao,
    consumo_total_kwh: consumoTotal,
    valor
  };
}
