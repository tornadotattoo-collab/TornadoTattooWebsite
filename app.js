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
      { src: "assets/josh-coverup-goth-girl-before-after.webp", title: "Cover-up rework", category: "Documented cover-up • Before & after", alt: "Before-and-after color cover-up and rework tattoo by Josh Poindexter" },
      { src: "assets/josh-coverup-koi-back-before.webp", title: "Koi back cover-up", category: "Documented cover-up • Before", alt: "Before photo of a large faded back tattoo prior to cover-up work by Josh Poindexter" },
      { src: "assets/josh-coverup-koi-back-after.webp", title: "Koi back cover-up", category: "Documented cover-up • After", alt: "After photo of a large koi and lotus back cover-up tattoo by Josh Poindexter" }
    ]
  },
  japanese: {
    title: "Japanese",
    description: "Selected large-scale and Japanese-inspired work showing body flow, layered composition, strong silhouettes, and detailed storytelling.",
    items: [
      { src: "assets/josh-samurai-backpiece.webp", title: "Samurai backpiece", category: "Japanese • Large-scale", alt: "Japanese samurai, temple, and mountain backpiece tattoo by Josh Poindexter" },
      { src: "assets/josh-samurai-forearm.webp", title: "Samurai warrior", category: "Japanese-inspired • Black & Red", alt: "Black and red samurai warrior tattoo by Josh Poindexter" },
      { src: "assets/josh-color-floral-sleeve.webp", title: "Floral sleeve", category: "Japanese-inspired • Color", alt: "Bright floral color sleeve tattoo by Josh Poindexter" },
      { src: "assets/josh-traditional-tiger-shoulder.webp", title: "Tiger shoulder piece", category: "Japanese-inspired • Color", alt: "Bold color tiger shoulder tattoo by Josh Poindexter" }
    ]
  },
  horror: {
    title: "Horror & Dark Work",
    description: "Character-driven and atmospheric pieces demonstrating black-and-gray depth, dramatic contrast, texture, and unsettling detail.",
    items: [
      { src: "assets/josh-tiger-skulls-backpiece.webp", title: "Tiger and skulls backpiece", category: "Dark • Large-scale", alt: "Large tiger and skulls backpiece tattoo by Josh Poindexter" },
      { src: "assets/josh-kiss-demon.webp", title: "The Demon", category: "Character portrait • Color", alt: "The Demon character portrait tattoo by Josh Poindexter" },
      { src: "assets/josh-wolf-hand.webp", title: "Red-eyed wolf", category: "Black & Gray • Hand", alt: "Black-and-gray snarling wolf hand tattoo with red eyes by Josh Poindexter" },
      { src: "assets/josh-sugar-skull.webp", title: "Sugar skull portrait", category: "Illustrative • Color", alt: "Color sugar skull portrait tattoo by Josh Poindexter" }
    ]
  },
  traditional: {
    title: "Traditional & Bold Color",
    description: "Bold outlines, clear silhouettes, and confident color across classic tattoo subjects and custom pop-culture work.",
    items: [
      { src: "assets/josh-traditional-tiger-shoulder.webp", title: "Traditional tiger", category: "Traditional • Color", alt: "Bold color traditional tiger shoulder tattoo by Josh Poindexter" },
      { src: "assets/josh-traditional-panther.webp", title: "Traditional panther", category: "Traditional • Color", alt: "Bold black and red traditional panther tattoo by Josh Poindexter" },
      { src: "assets/josh-traditional-snake.webp", title: "Traditional snake", category: "Traditional • Color", alt: "Bold green and red traditional snake tattoo by Josh Poindexter" },
      { src: "assets/josh-wolf-headdress.webp", title: "Wolf headdress", category: "Traditional-inspired • Color", alt: "Traditional-inspired wolf headdress tattoo by Josh Poindexter" },
      { src: "assets/josh-dragon-balls.webp", title: "Dragon Balls", category: "Pop culture • Color", alt: "Bright orange Dragon Balls tattoo by Josh Poindexter" }
    ]
  }
};

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
    src: image.getAttribute("src"),
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

function showLightboxImage(index) {
  activeLightboxIndex = (index + activeLightboxItems.length) % activeLightboxItems.length;
  const item = activeLightboxItems[activeLightboxIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
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
    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt;
    image.loading = "lazy";
    image.decoding = "async";
    imageWrap.append(image);

    const copy = document.createElement("span");
    copy.className = "style-gallery-item-copy";
    const title = document.createElement("strong");
    title.textContent = item.title;
    const category = document.createElement("span");
    category.textContent = item.category;
    copy.append(title, category);

    button.append(imageWrap, copy);
    button.addEventListener("click", () => {
      openPortfolioLightbox(gallery.items, index, { trigger: button, returnToStyleGallery: true });
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
    if (event.key === "ArrowLeft") showLightboxImage(activeLightboxIndex - 1);
    if (event.key === "ArrowRight") showLightboxImage(activeLightboxIndex + 1);
    return;
  }
  if (!styleGalleryModal.hidden && event.key === "Escape") closeStyleGallery();
});
