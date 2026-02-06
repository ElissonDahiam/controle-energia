import * as pdfjsLib from "../libs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "../libs/pdf.worker.mjs";

const input = document.getElementById("pdfInput");

if (input) {
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
}

function extractData(text) {

    const uc = text.match(/\b\d{11}\b/);
    if (uc) document.getElementById("uc").value = uc[0];

    const mesAno = text.match(/(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{4}/);
    if (mesAno) document.getElementById("mesAno").value = mesAno[0];

    const venc = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
    if (venc) document.getElementById("vencimento").value = venc[0];

    const valor = text.match(/R\$\s*\**([\d,.]+)/);
    if (valor) {
        document.getElementById("valor").value =
            valor[1].replace(".", "").replace(",", ".");
    }

    const consumo = text.match(/ENERGIA ATIVA[^0-9]*([0-9]+)/i);
    if (consumo) document.getElementById("consumo").value = consumo[1];
}
