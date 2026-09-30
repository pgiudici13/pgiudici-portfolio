// Avvia tutte le funzionalità quando il markup è pronto.
document.addEventListener("DOMContentLoaded", () => {
  // Seleziona e anima il cursore indipendente dalle CDN esterne.
  const cursor = document.querySelector(".custom-cursor");
  if (cursor) {
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;
    cursor.style.left = `${currentX}px`;
    cursor.style.top = `${currentY}px`;

    window.addEventListener("mousemove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    });

    const animateCursor = () => {
      currentX += (targetX - currentX) * 0.32;
      currentY += (targetY - currentY) * 0.32;
      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;
      window.requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.querySelectorAll("a, button, label").forEach((element) => {
      element.addEventListener("mouseenter", () => cursor.classList.add("is-hovering"));
      element.addEventListener("mouseleave", () => cursor.classList.remove("is-hovering"));
    });
  }

  // Attiva lo scroll inerziale se Lenis è disponibile.
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({
      duration: 2,
      easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      smoothWheel: true,
      syncTouch: true,
      wheelMultiplier: 0.8,
    });
    if (typeof ScrollTrigger !== "undefined") lenis.on("scroll", ScrollTrigger.update);
    if (typeof gsap !== "undefined") {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        lenis.raf(time);
        window.requestAnimationFrame(raf);
      };
      window.requestAnimationFrame(raf);
    }
  }

  // Registra ScrollTrigger quando i due script sono caricati.
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Collega i filtri dei progetti.
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      document.querySelectorAll(".project-card").forEach((card) => {
        card.classList.toggle("is-hidden", filter !== "all" && card.dataset.category !== filter);
      });
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    });
  });

  // Gestisce gli accordion della sezione profilo.
  document.querySelectorAll(".service-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const detail = button.nextElementSibling;
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      detail.hidden = isOpen;
    });
  });

  // Mostra le animazioni con GSAP oppure lascia i contenuti visibili in fallback.
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.utils.toArray(".reveal-text").forEach((element) => {
      gsap.from(element, {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 85%", once: true },
      });
    });
    gsap.utils.toArray(".reveal-img").forEach((element) => {
      gsap.set(element, { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)", scale: 1.2 });
      gsap.to(element, {
        clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
        scale: 1,
        duration: 1.4,
        ease: "power4.out",
        scrollTrigger: { trigger: element, start: "top 85%", once: true },
      });
    });
  } else {
    document.querySelectorAll(".reveal-text, .reveal-img").forEach((element) => {
      element.style.opacity = "1";
      element.style.clipPath = "none";
      element.style.transform = "none";
    });
  }

  // Carica il catalogo generato dal workflow e costruisce la galleria pubblicata.
  loadPublishedMedia();
  loadProjectPage();

  window.addEventListener("load", () => {
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });
});

// Legge assets/media/manifest.json e visualizza ogni foto o video pubblicato.
async function loadPublishedMedia() {
  const gallery = document.querySelector("#media-gallery-grid");
  if (!gallery) return;
  try {
    const response = await fetch("assets/media/manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Manifest error: ${response.status}`);
    const mediaItems = await response.json();
    gallery.replaceChildren();
    if (!mediaItems.length) {
      const empty = document.createElement("p");
      empty.className = "media-empty";
      empty.textContent = "La galleria è pronta. Aggiungi il primo file in assets/media/.";
      gallery.appendChild(empty);
      return;
    }
    mediaItems.forEach((item) => {
      const card = document.createElement("a");
      const caption = document.createElement("span");
      card.className = "published-media-card";
      card.href = `project.html?media=${encodeURIComponent(item.src)}`;
      if (item.type === "video") {
        const video = document.createElement("video");
        video.src = item.src;
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        card.appendChild(video);
      } else {
        const image = document.createElement("img");
        image.src = item.src;
        image.alt = item.title;
        image.loading = "lazy";
        card.appendChild(image);
      }
      caption.textContent = item.title;
      card.appendChild(caption);
      gallery.appendChild(card);
    });
  } catch (error) {
    gallery.innerHTML = `<p class="media-empty">La galleria sarà disponibile dopo il primo deploy con manifest.</p>`;
    console.error(error);
  }
}

// Costruisce una sottopagina per un progetto demo o per un media pubblicato.
async function loadProjectPage() {
  const detail = document.querySelector("#project-detail");
  if (!detail) return;
  const params = new URLSearchParams(window.location.search);
  const projectKey = params.get("project");
  const mediaPath = params.get("media");
  const projects = {
    "web-experiments": ["Web experiments", "HTML / CSS", "Esperimenti front-end costruiti per studiare ritmo, layout e interazioni."],
    "equestrian-stories": ["Equestrian stories", "Video / DaVinci Resolve", "Un racconto video realizzato per un'associazione equestre."],
    "frames-from-pavia": ["Frames from Pavia", "Photography / Personal", "Una raccolta di osservazioni, dettagli e atmosfere dalla mia città."],
    "python-playground": ["Python playground", "Python / Learning", "Piccoli esperimenti per imparare costruendo strumenti e idee."],
  };
  const title = detail.querySelector(".project-detail-title");
  const meta = detail.querySelector(".project-detail-meta");
  const copy = detail.querySelector(".project-detail-copy");
  const media = detail.querySelector(".project-detail-media");

  if (mediaPath) {
    try {
      const response = await fetch("assets/media/manifest.json", { cache: "no-store" });
      const items = response.ok ? await response.json() : [];
      const item = items.find((entry) => entry.src === mediaPath);
      if (!item) throw new Error("Media non trovato nel manifest.");
      const name = item.title;
      title.innerHTML = `${name}<br /><em>detail.</em>`;
      meta.textContent = item.category;
      copy.textContent = item.description;
      if (item.type === "video") {
        const video = document.createElement("video");
        video.src = item.src;
        video.controls = true;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        media.appendChild(video);
      } else {
        const image = document.createElement("img");
        image.src = item.src;
        image.alt = name;
        media.appendChild(image);
      }
      document.title = `${name} — Pietro Giudici`;
    } catch (error) {
      title.innerHTML = "Media<br /><em>not found.</em>";
      meta.textContent = "Portfolio";
      copy.textContent = "Questo file non è presente nel catalogo pubblicato.";
      console.error(error);
    }
    return;
  }

  const project = projects[projectKey] || projects["web-experiments"];
  title.innerHTML = `${project[0]}<br /><em>project.</em>`;
  meta.textContent = project[1];
  copy.textContent = project[2];
  media.innerHTML = `<div class="project-placeholder">Aggiungi immagini o video del progetto in <code>assets/media/</code>.</div>`;
  document.title = `${project[0]} — Pietro Giudici`;
}
