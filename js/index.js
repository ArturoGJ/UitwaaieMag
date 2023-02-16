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
    /**
     * Open pdf in another tab.
     */
    // var url = `pdfs/${id}.pdf`;
    var url = `/UitwaaieMag/pdfs/${id}.pdf`;
    window.open(url, '_blank');

    /**
     * Open pdf in modal... doesn't look good on mobile.
     */
    // $('#modal').modal('toggle');
    // renderPDF(id);
  });
});

/**
 * Function to render the PDF on the modal, looks good on desktop but not on mobile.
 * Not being used ATM but I like it.
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
const newsLink = document.getElementById('news-link');
const logo = document.getElementById('logo-img');

const aboutContent = document.getElementById('about-content');
const homeContent = document.getElementById('home-content');
const newsContent = document.getElementById('news-content');

/**
 * Adding event listeners for click events so that an animation is played when switching from home to about.
 */
aboutLink.addEventListener('click', (oEvent) => {
  homeContent.style.maxHeight = '0';
  homeContent.scrollTop = 0;
  newsContent.style.maxHeight = '0';
  newsContent.style.overflowY = 'hidden';
  newsContent.scrollTop = 0;

  aboutContent.style.maxHeight = '99vh';
  aboutContent.style.overflowY = 'auto';

  closeMenu();
});

[homeLink, logo].forEach((element) => {
  element.addEventListener('click', (oEvent) => {
    homeContent.style.maxHeight = '99vh';

    aboutContent.style.maxHeight = '0';
    aboutContent.style.overflowY = 'hidden';
    aboutContent.scrollTop = 0;
    newsContent.style.maxHeight = '0';
    newsContent.style.overflowY = 'hidden';
    newsContent.scrollTop = 0;

    closeMenu();
  });
});

newsLink.addEventListener('click', (oEvent) => {
  homeContent.style.maxHeight = '0';
  homeContent.scrollTop = 0;
  aboutContent.style.maxHeight = '0';
  aboutContent.style.overflowY = 'hidden';
  aboutContent.scrollTop = 0;

  newsContent.style.maxHeight = '99vh';
  newsContent.style.overflowY = 'auto';
  closeMenu();
});

function closeMenu() {
  let menu = document.getElementById('menus');
  if (menu) {
    menu.classList.remove('menu-open');
    document.getElementById('menu-checkbox').checked = false;
  }
}

function isMobile() {
  const viewportWidth = window.innerWidth;
  return viewportWidth <= 900;
}

function openMenu() {
  let menu = document.getElementById('menus');
  menu.classList.toggle('menu-open');
}

// Switch language
function onChangeLanguage(value) {
  let menu = getMenuElementsAndText();
  let about = getAboutElementsAndText();
  let news = getNewsElementsAndText();

  let language = value === 'NL' || value === 'EN' ? value : 'NL';

  setText(menu, language);
  setText(about, language);
  setText(news, language);
}

function setText(oElementsAndText, sLanguage) {
  for (const key in oElementsAndText) {
    let element = oElementsAndText[key].element;
    let text = oElementsAndText[key][`text${sLanguage}`];
    element.innerText = text;
  }
}

function getMenuElementsAndText() {
  return {
    homeLink: {
      element: document.getElementById('home-link'),
      textNL: 'Startpagina',
      textEN: 'Home',
    },
    aboutLink: {
      element: document.getElementById('about-link'),
      textNL: 'Over Ons',
      textEN: 'About',
    },
    submitLink: {
      element: document.getElementById('submit-link'),
      textNL: 'Inzenden',
      textEN: 'Submit',
    },
    contactLink: {
      element: document.getElementById('contact-link'),
      textNL: 'Contact',
      textEN: 'Contact',
    },
  };
}

function getAboutElementsAndText() {
  return {
    aboutTitle: {
      element: document.getElementById('about-title'),
      textNL: 'Over Ons',
      textEN: 'About Us',
    },
    firstParagraph: {
      element: document.getElementById('about-first-paragraph'),
      textNL:
        'Uitwaaien Magazine is een platform voor kunst, cultuur en sociale verbinding. Uitwaaien Magazine, gevestigd in Wageningen, toont amateur- en professionele kunstenaars uit de regio en omgeving die bruggen willen slaan en een frisse wind laten waaien door de geest van lezers en donateurs.',
      textEN:
        'Uitwaaein Magazine is a platform for art, culture, and social connection. Located in Wageningen, Uitwaaien Magazine features amateur and professional artists from the area and surroundings seeking to create bridges and bring a breath of fresh wind to the mind of readers and contributors.',
    },
    secondParagraph: {
      element: document.getElementById('about-second-paragraph'),
      textNL:
        'Uitwaaien Magazine is een non-profit organisatie die gelooft in kunst als middel tot verbinding. Het tijdschrift wordt twee keer per jaar gedrukt, in de zomer en in de winter, waarbij elke editie streeft naar een diverse en inclusieve inhoud. Iedereen en alle soorten artistieke disciplines zijn welkom.',
      textEN:
        'Uitwaaien Magazine is a non-profit organisation that believes in art as a means of connection. The magazine is printed twice a year, summer and winter, with each edition aiming for diverse and inclusive content. Everyone and all kinds of artistic disciplines are welcome.',
    },
    boardTitle: {
      element: document.getElementById('about-board-title'),
      textNL: 'Bestuur',
      textEN: 'Board',
    },
    boardPm: {
      element: document.getElementById('about-board-pm'),
      textNL: 'Projectleider: Marta Vallvé Odena (voorzitter)',
      textEN: 'Project manager: Marta Vallvé Odena (Chair)',
    },
    boardCuration: {
      element: document.getElementById('about-board-curation'),
      textNL: 'Curatie: Fernando Gabriel',
      textEN: 'Curation: Fernando Gabriel',
    },
    boardDesign: {
      element: document.getElementById('about-board-design'),
      textNL: 'Ontwerp: Mattia Bosoni',
      textEN: 'Design: Mattia Bosoni',
    },
    boardPr: {
      element: document.getElementById('about-board-pr'),
      textNL: 'PR - sociale media: Imme Koster',
      textEN: 'PR - social media: Imme Koster',
    },
    boardTreasurer: {
      element: document.getElementById('about-board-treasurer'),
      textNL: 'Penningmeester: Edmund Bell',
      textEN: 'Treasurer: Edmund Bell',
    },
    aboutContact: {
      element: document.getElementById('about-contact'),
      textNL: 'Heb je interesse om je als vrijwilliger of bestuurslid bij het project aan te sluiten? Stuur een e-mail naar uitwaaien.magazine@gmail.com',
      textEN: 'Are you interested in joining the project as a volunteer or board member? Send an email to uitwaaien.magazine@gmail.com',
    },
  };
}

function getNewsElementsAndText() {
  return {
    newsTitle: {
      element: document.getElementById('news-title'),
      textNL: 'Nieuws',
      textEN: 'News',
    },
    firstParagraph: {
      element: document.getElementById('news-first-paragraph'),
      textNL: 'Inzendingen voor de tweede editie van Uitwaaien zijn nu open!',
      textEN: "Submissions for Uitwaaien's second edition are now open!",
    },
  };
}

// Initialize page with default language
onChangeLanguage('NL'); // Initializing with default language NL
