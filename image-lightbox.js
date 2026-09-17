(() => {
  const cards = [...document.querySelectorAll(".project-card")];
  if (!cards.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "project-image-lightbox";
  lightbox.id = "project-image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-labelledby", "project-lightbox-title");
  lightbox.setAttribute("aria-describedby", "project-lightbox-description");
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <button class="project-lightbox-close" type="button" aria-label="Close full-size tattoo image">×</button>
    <button class="project-lightbox-nav project-lightbox-previous" type="button" aria-label="View previous image">←</button>
    <figure>
      <img class="project-lightbox-image" alt="" width="1" height="1">
      <figcaption>
        <h2 id="project-lightbox-title"></h2>
        <p id="project-lightbox-description" class="project-lightbox-description" aria-live="polite"></p>
      </figcaption>
    </figure>
    <button class="project-lightbox-nav project-lightbox-next" type="button" aria-label="View next image">→</button>
  `;
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector(".project-lightbox-image");
  const lightboxTitle = lightbox.querySelector("#project-lightbox-title");
  const lightboxDescription = lightbox.querySelector("#project-lightbox-description");
  const closeButton = lightbox.querySelector(".project-lightbox-close");
  const previousButton = lightbox.querySelector(".project-lightbox-previous");
  const nextButton = lightbox.querySelector(".project-lightbox-next");

  const items = cards.map((card) => {
    const image = card.querySelector("img");
    return {
      source: image.dataset.fullSrc,
      width: Number(image.getAttribute("width")),
      height: Number(image.getAttribute("height")),
      alt: image.alt,
      title: card.querySelector("h3")?.textContent.trim() || image.alt,
      description: card.querySelector("p")?.textContent.trim() || ""
    };
  });

  let activeIndex = 0;
  let trigger = null;

  function updateImage(index) {
    activeIndex = (index + items.length) % items.length;
    const item = items[activeIndex];

    lightboxImage.src = item.source;
    lightboxImage.alt = item.alt;
    lightboxImage.width = item.width;
    lightboxImage.height = item.height;
    lightboxImage.loading = "eager";
    lightboxImage.decoding = "sync";
    lightboxImage.style.width = "auto";
    lightboxImage.style.height = "auto";
    lightboxImage.style.maxWidth = "calc(100vw - 48px)";
    lightboxImage.style.maxHeight = "calc(100vh - 180px)";
    lightboxImage.style.objectFit = "contain";
    lightboxTitle.textContent = item.title;
    lightboxDescription.textContent = item.description;

    const showNavigation = items.length > 1;
    previousButton.hidden = !showNavigation;
    nextButton.hidden = !showNavigation;
  }

  function open(index, event, card) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    trigger = card;
    updateImage(index);
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  }

  function close() {
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    document.body.classList.remove("lightbox-open");
    trigger?.focus();
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", (event) => open(index, event, card));
  });

  closeButton.addEventListener("click", close);
  previousButton.addEventListener("click", () => updateImage(activeIndex - 1));
  nextButton.addEventListener("click", () => updateImage(activeIndex + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;

    if (event.key === "Tab") {
      const focusable = [...lightbox.querySelectorAll("button:not([hidden])")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!lightbox.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateImage(activeIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateImage(activeIndex + 1);
    }
  });
})();
