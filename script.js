const pdfUpload = document.getElementById('pdfUpload');
const convertBtn = document.getElementById('convertBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const downloadJpgBtn = document.getElementById('downloadJpgBtn');
const loading = document.getElementById('loading');
const downloadButtons = document.getElementById('downloadButtons');

let canvasImages = [];

convertBtn.addEventListener('click', function () {
  const file = pdfUpload.files[0];
  if (!file || file.type !== "application/pdf") {
    alert("Please upload a valid PDF file.");
    return;
  }

  loading.classList.remove("hidden");
  downloadButtons.classList.add("hidden");
  canvasImages = [];

  const fileReader = new FileReader();

  fileReader.onload = function () {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
      let pagesRendered = 0;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pdf.getPage(pageNum).then(function (page) {
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          page.render({ canvasContext: context, viewport: viewport }).promise.then(function () {
            canvasImages.push(canvas);
            pagesRendered++;

            if (pagesRendered === pdf.numPages) {
              loading.classList.add("hidden");
              downloadButtons.classList.remove("hidden");
            }
          });
        });
      }
    });
  };

  fileReader.readAsArrayBuffer(file);
});

downloadPngBtn.addEventListener('click', function () {
  canvasImages.forEach((canvas, index) => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `page-${index + 1}.png`;
    link.click();
  });
});

downloadJpgBtn.addEventListener('click', function () {
  canvasImages.forEach((canvas, index) => {
    const jpgCanvas = document.createElement('canvas');
    const ctx = jpgCanvas.getContext('2d');
    jpgCanvas.width = canvas.width;
    jpgCanvas.height = canvas.height;
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.href = jpgCanvas.toDataURL('image/jpeg', 1.0);
    link.download = `page-${index + 1}.jpg`;
    link.click();
  });
});
