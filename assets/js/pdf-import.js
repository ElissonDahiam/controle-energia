import * as pdfjsLib from "../libs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "../libs/pdf.worker.mjs";

const input = document.getElementById("pdfInput");

input.addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        content.items.forEach(item => {
            text += item.str + " ";
        });
    }

    extractData(text);
});

function extractData(text) {

    // ===== UNIDADE CONSUMIDORA (11 dígitos) =====
    const uc = text.match(/\b\d{11}\b/);
    if (uc) document.getElementById("uc").value = uc[0];

    // ===== MÊS / ANO =====
    const mesAno = text.match(/(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{4}/);
    if (mesAno) document.getElementById("mesAno").value = mesAno[0];

    // ===== VENCIMENTO =====
    const venc = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
    if (venc) document.getElementById("vencimento").value = venc[0];

    // ===== VALOR TOTAL =====
    const valor = text.match(/TOTAL\s+([\d,.]+)/i);
    if (valor) {
        document.getElementById("valor").value =
            valor[1].replace(".", "").replace(",", ".");
    }

    // ===== CONSUMO (kWh) =====
    const consumo = text.match(/ENERGIA ATIVA.*?(\d+)\s*kWh/i);
    if (consumo) document.getElementById("consumo").value = consumo[1];
}
