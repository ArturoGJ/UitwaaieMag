var firstEdition = document.getElementById('first-edition-en');
firstEdition.addEventListener('click', function (oEvent) {
  console.log('click');
  $('#exampleModal').modal('toggle');
});

// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
var url = 'assets/pdfs/FirstEditionEn.pdf';

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

// Asynchronous download of PDF
var loadingTask = pdfjsLib.getDocument(url);
loadingTask.promise.then(
  function (pdf) {
    console.log('PDF loaded');

    // Fetch the first page
    var pageNumber = 1;
    pdf.getPage(pageNumber).then(function (page) {
      console.log('Page loaded');

      var scale = 1.5;
      var viewport = page.getViewport({ scale: scale });

      // Prepare canvas using PDF page dimensions
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.height = '200px';
      canvas.width = '300px';

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      document.getElementById('page1').appendChild(canvas);
      console.log(document.getElementById('page1'));
      var renderTask = page.render(renderContext);
      renderTask.promise.then(function () {
        console.log('Page rendered');
      });
    });
  },
  function (reason) {
    // PDF loading error
    console.error(reason);
  }
);

// let elPDFViewer = document.getElementById('first-edition-en');
// // elPDFViewer.addEventListener('click', () => {
// //   pdfRenderer();
// // });
// pdfRenderer();
// function renderPDF(url, canvasContainer) {
//   // Loaded via <script> tag, create shortcut to access PDF.js exports.
//   var pdfjsLib = window['pdfjs-dist/build/pdf'];

//   // The workerSrc property shall be specified.
//   pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
//   // Render a specific page
//   function renderPage(page) {
//     console.log('page', page);
//     let viewPort = page.getViewport({ scale: 1 });
//     let canvas = document.createElement('canvas');
//     let canvasContext = canvas.getContext('2d');
//     canvas.height = viewPort.height;
//     canvas.width = viewPort.width;
//     let renderContext = {
//       canvasContext: canvasContext,
//       viewPort: viewPort,
//     };

//     canvasContainer.appendChild(canvas);
//     console.log('canvas', canvas);

//     page.render(renderContext).promise.then(() => console.log('page rendered'));
//   }

//   // Render multiple pages
//   function renderPages(pdfDoc) {
//     for (let num = 1; num <= 1; num++) {
//       pdfDoc.getPage(num).then(renderPage);
//     }
//   }

//   pdfjsLib.disableWorker = true;
//   pdfjsLib.getDocument(url).promise.then(renderPages);
// }

// function pdfRenderer() {
//   renderPDF('/assets/pdfs/FirstEditionEn.pdf', document.getElementById('holder'));
// }
