/**
 * This file contains all the functions needed for the web-page
 */

// Start of Editions handler
// img-description is the class associated with the description that appears when you hover over an edition
/**
 * Adding event listeners for all the editions.
 */
let aEditions = document.getElementsByClassName('img-description');
Array.from(aEditions).forEach((edition) => {
  edition.addEventListener('click', function (oEvent) {
    let node = oEvent.target;
    while (node !== this) {
      if (node.className === 'img-description') {
        break;
      }

      node = node.parentNode;
    }

    let id = node.id;
    $('#modal').modal('toggle');
    renderPDF(id);
  });
});

/**
 * Function to render the PDF on the modal.
 * @param {string} id
 */
function renderPDF(id) {
  // If absolute URL from the remote server is provided, configure the CORS
  // header on that server.

  // var url = `pdfs/${id}.pdf`;
  var url = `/UitwaaieMag/pdfs/${id}.pdf`;

  // Loaded via <script> tag, create shortcut to access PDF.js exports.
  var pdfjsLib = window['pdfjs-dist/build/pdf'];

  // The workerSrc property shall be specified.
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

  let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1,
    container = document.getElementById('pdf-container'),
    canvas = document.getElementById('pdf-canvas'),
    ctx = canvas.getContext('2d');

  /**
   * Get page info from document, resize canvas accordingly, and render page.
   * @param num Page number.
   */
  function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function (page) {
      var width = container.offsetWidth;
      if (width > 700) {
        scale = 1.43;
      }
      var viewport = page.getViewport({ scale: container.offsetWidth / page.getViewport({ scale: scale }).width });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      container.appendChild(canvas);

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };
      var renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function () {
        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });

    // Update page counters
    document.getElementById('page_num').textContent = num;
  }

  /**
   * If another page rendering in progress, waits until the rendering is
   * finised. Otherwise, executes rendering immediately.
   */
  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  /**
   * Displays previous page.
   */
  function onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  }
  document.getElementById('prev').addEventListener('click', onPrevPage);

  /**
   * Displays next page.
   */
  function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  }
  document.getElementById('next').addEventListener('click', onNextPage);

  /**
   * Asynchronously downloads PDF.
   */
  pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
  });

  $('#modal').on('hidden.bs.modal', function (e) {
    const canvas = document.getElementById('pdf-canvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    pageNum = 1;
    pageRendering = false;
    pageNumPending = null;
    pdfDoc.destroy();
  });
}

// End of Editions handler

// Start of links handler
const aboutLink = document.getElementById('about-link');
const homeLink = document.getElementById('home-link');
const logo = document.getElementById('logo');

const aboutContent = document.getElementById('about-content');
const homeContent = document.getElementById('home-content');

/**
 * Adding event listeners for click events so that an animation is played when switching from home to about.
 */
aboutLink.addEventListener('click', (oEvent) => {
  homeContent.style.maxHeight = '0';
  aboutContent.style.maxHeight = '100vh';
});

[homeLink, logo].forEach((element) => {
  element.addEventListener('click', (oEvent) => {
    aboutContent.style.maxHeight = '0';
    homeContent.style.maxHeight = '100vh';
  });
});

function isMobile() {
  const viewportWidth = window.innerWidth;
  return viewportWidth <= 900;
}
