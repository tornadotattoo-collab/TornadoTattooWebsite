const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#primary-navigation");

menuButton.addEventListener("click", () => {
  const open = navigation.classList.toggle("nav-open");
  menuButton.setAttribute("aria-expanded", String(open));
});

navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  navigation.classList.remove("nav-open");
  menuButton.setAttribute("aria-expanded", "false");
}));

const galleryData = {
  "cover-ups": {
    title: "Cover-Ups",
    description: "Documented cover-up and rework examples by Josh. These before-and-after photos show how existing tattoos can be incorporated into larger, more readable designs.",
    items: [
      {
        src: "assets/josh-coverup-rework.jpg?v=20260917-1", width: 960, height: 960, widths: [320, 480, 960],
        title: "Cover-up / rework",
        category: "Cover-Up • Color",
        alt: "Color cover-up and rework tattoo by Josh Poindexter",
        lightboxItems: [
          { src: "assets/josh-coverup-rework.jpg?v=20260917-1", width: 960, height: 960, widths: [320, 480, 960], title: "Cover-up / rework", category: "Cover-Up • Color", alt: "Color cover-up and rework tattoo by Josh Poindexter" }
        ]
      },
      {
        src: "assets/josh-coverup-before-after.jpg?v=20260917-1", width: 1875, height: 900, widths: [320, 480, 960, 1440],
        title: "Cover-up transformation",
        category: "Before → After",
        alt: "Before-and-after cover-up tattoo transformation by Josh Poindexter",
        contain: true
      }
    ]
  },
  japanese: {
    title: "Japanese",
    description: "Selected large-scale and Japanese-inspired work showing body flow, layered composition, strong silhouettes, and detailed storytelling.",
    items: [
      { src: "assets/josh-japanese-backpiece-01.webp?v=20260917-1", width: 800, height: 800, widths: [320, 480, 800], title: "Samurai backpiece", category: "Japanese • Large-scale", alt: "Japanese samurai and temple backpiece tattoo by Josh Poindexter" },
      { src: "assets/josh-japanese-samurai-02.webp?v=20260917-1", width: 600, height: 800, widths: [320, 480, 600], title: "Samurai warrior", category: "Japanese • Black & Red", alt: "Black and red samurai warrior tattoo by Josh Poindexter" },
      { src: "assets/josh-japanese-tiger-03.webp?v=20260917-1", width: 764, height: 800, widths: [320, 480, 764], title: "Tiger portrait", category: "Japanese-inspired • Color", alt: "Japanese-inspired tiger portrait tattoo by Josh Poindexter" },
      { src: "assets/josh-japanese-daruma-04.webp?v=20260917-1", width: 635, height: 800, widths: [320, 480, 635], title: "Daruma portrait", category: "Japanese-inspired • Color", alt: "Colorful Japanese daruma tattoo by Josh Poindexter" }
    ]
  },
  horror: {
    title: "Horror & Dark Work",
    description: "Character-driven and atmospheric pieces demonstrating black-and-gray depth, dramatic contrast, texture, and unsettling detail.",
    items: [
      { src: "assets/josh-horror-freddy.webp?v=20260917-1", width: 1200, height: 1600, widths: [320, 480, 960, 1200], title: "Freddy portrait", category: "Horror • Color", alt: "Freddy horror character tattoo by Josh Poindexter" },
      { src: "assets/josh-horror-jason.webp?v=20260917-1", width: 1200, height: 1600, widths: [320, 480, 960, 1200], title: "Jason mask", category: "Horror • Color", alt: "Jason Voorhees mask tattoo by Josh Poindexter" },
      { src: "assets/josh-horror-pennywise.webp?v=20260917-1", width: 1200, height: 1600, widths: [320, 480, 960, 1200], title: "Pennywise portrait", category: "Horror • Black & Gray", alt: "Pennywise horror character tattoo by Josh Poindexter" }
    ]
  },
  traditional: {
    title: "Traditional & Bold Color",
    description: "Bold outlines, clear silhouettes, and confident color across classic tattoo subjects and custom pop-culture work.",
    items: [
      { src: "assets/josh-traditional-01.webp?v=20260917-1", width: 1200, height: 1600, widths: [320, 480, 960, 1200], title: "Traditional piece 1", category: "Traditional • Color", alt: "Color traditional tattoo by Josh Poindexter" },
      { src: "assets/josh-traditional-02.webp?v=20260917-1", width: 1200, height: 1600, widths: [320, 480, 960, 1200], title: "Traditional piece 2", category: "Traditional • Color", alt: "Color traditional tattoo by Josh Poindexter" },
      { src: "assets/josh-traditional-03.webp?v=20260917-1", width: 1200, height: 1600, widths: [320, 480, 960, 1200], title: "Traditional piece 3", category: "Traditional • Color", alt: "Color traditional tattoo by Josh Poindexter" },
    ]
  }
};

const galleryImageSizes = "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw";

function optimizedAssetPath(item, width) {
  return `/_vercel/image?url=${encodeURIComponent(`/${item.src}`)}&w=${width}&q=75`;
}

function responsiveSrcset(item) {
  return item.widths
    .map((width) => `${optimizedAssetPath(item, width)} ${width}w`)
    .join(", ");
}

function createResponsivePicture(item) {
  const picture = document.createElement("picture");

  ["image/avif", "image/webp"].forEach((type) => {
    const source = document.createElement("source");
    source.type = type;
    source.srcset = responsiveSrcset(item);
    source.sizes = galleryImageSizes;
    picture.append(source);
  });

  const fallbackWidths = item.widths.filter((width) => width <= 960);
  const fallbackWidth = fallbackWidths[fallbackWidths.length - 1] || item.widths[item.widths.length - 1];
  const image = document.createElement("img");
  image.src = optimizedAssetPath(item, fallbackWidth);
  image.dataset.fullSrc = item.src;
  image.alt = item.alt;
  image.width = item.width;
  image.height = item.height;
  image.sizes = galleryImageSizes;
  image.loading = "lazy";
  image.decoding = "async";
  picture.append(image);

  return { picture, image };
}

const serviceButtons = [...document.querySelectorAll(".service-open")];
const styleGalleryModal = document.querySelector("#style-gallery-modal");
const styleGalleryTitle = document.querySelector("#style-gallery-title");
const styleGalleryDescription = document.querySelector("#style-gallery-description");
const styleGalleryGrid = document.querySelector("#style-gallery-grid");
const styleGalleryClose = styleGalleryModal.querySelector(".style-gallery-close");
let styleGalleryTrigger = null;

const portfolioButtons = [...document.querySelectorAll(".portfolio-open")];
const portfolioItems = portfolioButtons.map((button) => {
  const image = button.querySelector("img");
  return {
    src: image.dataset.fullSrc,
    width: Number(image.getAttribute("width")),
    height: Number(image.getAttribute("height")),
    title: button.dataset.title,
    category: button.dataset.category,
    alt: image.alt
  };
});
const lightbox = document.querySelector("#portfolio-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCategory = document.querySelector("#lightbox-category");
const lightboxClose = lightbox.querySelector(".lightbox-close");
const lightboxPrevious = lightbox.querySelector(".lightbox-previous");
const lightboxNext = lightbox.querySelector(".lightbox-next");
let activeLightboxItems = portfolioItems;
let activeLightboxIndex = 0;
let lightboxTrigger = null;
let returnToStyleGallery = false;

function syncBodyLock() {
  document.body.classList.toggle("lightbox-open", !lightbox.hidden || !styleGalleryModal.hidden);
}

function updateLightboxNavigation() {
  const showNavigation = activeLightboxItems.length > 1;
  [lightboxPrevious, lightboxNext].forEach((button) => {
    button.hidden = !showNavigation;
    button.tabIndex = showNavigation ? 0 : -1;
    button.setAttribute("aria-hidden", String(!showNavigation));
  });
}

function showLightboxImage(index) {
  updateLightboxNavigation();
  activeLightboxIndex = (index + activeLightboxItems.length) % activeLightboxItems.length;
  const item = activeLightboxItems[activeLightboxIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxImage.width = item.width;
  lightboxImage.height = item.height;
  lightboxImage.loading = "eager";
  lightboxImage.decoding = "sync";
  lightboxImage.style.setProperty("width", "auto", "important");
  lightboxImage.style.setProperty("height", "auto", "important");
  lightboxImage.style.setProperty("max-width", "100%", "important");
  lightboxImage.style.setProperty("max-height", "calc(100vh - 160px)", "important");
  lightboxImage.style.setProperty("object-fit", "contain", "important");
  lightboxTitle.textContent = item.title;
  lightboxCategory.textContent = item.category;
}

function openPortfolioLightbox(items, index, options = {}) {
  activeLightboxItems = items;
  lightboxTrigger = options.trigger || document.activeElement;
  returnToStyleGallery = Boolean(options.returnToStyleGallery);
  showLightboxImage(index);
  if (returnToStyleGallery) styleGalleryModal.hidden = true;
  lightbox.hidden = false;
  syncBodyLock();
  lightboxClose.focus();
}

function closePortfolioLightbox() {
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
  if (returnToStyleGallery) {
    styleGalleryModal.hidden = false;
    syncBodyLock();
    lightboxTrigger?.focus();
  } else {
    syncBodyLock();
    lightboxTrigger?.focus();
  }
  returnToStyleGallery = false;
}

function renderStyleGallery(key) {
  const gallery = galleryData[key];
  styleGalleryTitle.textContent = gallery.title;
  styleGalleryDescription.textContent = gallery.description;
  styleGalleryGrid.replaceChildren();

  gallery.items.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "style-gallery-item";
    button.type = "button";
    button.setAttribute("aria-label", `View ${item.title} full screen`);

    const imageWrap = document.createElement("span");
    imageWrap.className = "style-gallery-item-image";
    const { picture, image } = createResponsivePicture(item);
    if (item.contain) {
      imageWrap.classList.add("style-gallery-item-image-contain");
      imageWrap.style.setProperty("aspect-ratio", "auto", "important");
      imageWrap.style.setProperty("height", "auto", "important");
      image.style.setProperty("width", "100%", "important");
      image.style.setProperty("height", "auto", "important");
      image.style.setProperty("aspect-ratio", "auto", "important");
      image.style.setProperty("object-fit", "contain", "important");
    }
    imageWrap.append(picture);

    const copy = document.createElement("span");
    copy.className = "style-gallery-item-copy";
    const title = document.createElement("strong");
    title.textContent = item.title;
    const category = document.createElement("span");
    category.textContent = item.category;
    copy.append(title, category);

    button.append(imageWrap, copy);
    button.addEventListener("click", () => {
      openPortfolioLightbox(item.lightboxItems || [item], 0, { trigger: button, returnToStyleGallery: true });
    });
    styleGalleryGrid.append(button);
  });
}

function openStyleGallery(key, trigger) {
  styleGalleryTrigger = trigger;
  renderStyleGallery(key);
  styleGalleryModal.hidden = false;
  syncBodyLock();
  styleGalleryClose.focus();
}

function closeStyleGallery() {
  styleGalleryModal.hidden = true;
  syncBodyLock();
  styleGalleryTrigger?.focus();
}

portfolioButtons.forEach((button, index) => {
  button.addEventListener("click", () => openPortfolioLightbox(portfolioItems, index, { trigger: button }));
});

serviceButtons.forEach((button) => {
  button.addEventListener("click", () => openStyleGallery(button.dataset.gallery, button));
});

styleGalleryClose.addEventListener("click", closeStyleGallery);
styleGalleryModal.addEventListener("click", (event) => {
  if (event.target === styleGalleryModal) closeStyleGallery();
});

lightboxClose.addEventListener("click", closePortfolioLightbox);
lightboxPrevious.addEventListener("click", () => showLightboxImage(activeLightboxIndex - 1));
lightboxNext.addEventListener("click", () => showLightboxImage(activeLightboxIndex + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closePortfolioLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.hidden) {
    if (event.key === "Escape") closePortfolioLightbox();
    if (activeLightboxItems.length > 1 && event.key === "ArrowLeft") showLightboxImage(activeLightboxIndex - 1);
    if (activeLightboxItems.length > 1 && event.key === "ArrowRight") showLightboxImage(activeLightboxIndex + 1);
    return;
  }
  if (!styleGalleryModal.hidden && event.key === "Escape") closeStyleGallery();
});
