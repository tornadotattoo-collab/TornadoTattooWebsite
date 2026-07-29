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

const portfolioButtons = [...document.querySelectorAll(".portfolio-open")];
const lightbox = document.querySelector("#portfolio-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCategory = document.querySelector("#lightbox-category");
const lightboxClose = lightbox.querySelector(".lightbox-close");
const lightboxPrevious = lightbox.querySelector(".lightbox-previous");
const lightboxNext = lightbox.querySelector(".lightbox-next");
let activePortfolioIndex = 0;
let portfolioTrigger = null;

function showPortfolioImage(index) {
  activePortfolioIndex = (index + portfolioButtons.length) % portfolioButtons.length;
  const button = portfolioButtons[activePortfolioIndex];
  const image = button.querySelector("img");
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = button.dataset.title;
  lightboxCategory.textContent = button.dataset.category;
}

function openPortfolioLightbox(index) {
  portfolioTrigger = document.activeElement;
  showPortfolioImage(index);
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  lightboxClose.focus();
}

function closePortfolioLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  lightboxImage.removeAttribute("src");
  portfolioTrigger?.focus();
}

portfolioButtons.forEach((button, index) => {
  button.addEventListener("click", () => openPortfolioLightbox(index));
});

lightboxClose.addEventListener("click", closePortfolioLightbox);
lightboxPrevious.addEventListener("click", () => showPortfolioImage(activePortfolioIndex - 1));
lightboxNext.addEventListener("click", () => showPortfolioImage(activePortfolioIndex + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closePortfolioLightbox();
});

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") closePortfolioLightbox();
  if (event.key === "ArrowLeft") showPortfolioImage(activePortfolioIndex - 1);
  if (event.key === "ArrowRight") showPortfolioImage(activePortfolioIndex + 1);
});
