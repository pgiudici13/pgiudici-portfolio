/* global Lenis, ScrollTrigger, gsap */

// Avvia tutte le funzionalità quando il markup è pronto.
document.addEventListener("DOMContentLoaded", () => {
  // Rileva la preferenza di movimento ridotto impostata dal sistema operativo.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Conserva l'istanza Lenis per riutilizzarla nella navigazione interna.
  let smoothScroller = null;

  // Seleziona e anima il cursore indipendente dalle CDN esterne.
  const cursor = document.querySelector(".custom-cursor");
  if (cursor && !reducedMotion) {
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

  // Collega il pulsante mobile al pannello di navigazione accessibile.
  const menuToggle = document.querySelector(".menu-toggle");
  // Recupera il pannello che contiene i collegamenti mobile.
  const mobileMenu = document.querySelector("#mobile-menu");
  // Attiva il menu solo quando entrambi gli elementi sono presenti nella pagina.
  if (menuToggle && mobileMenu) {
    // Aggiorna apertura, attributi ARIA e stato visivo del menu.
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.hidden = isOpen;
    });
    // Chiude il menu dopo la selezione di una destinazione.
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        mobileMenu.hidden = true;
      });
    });
  }

  // Alterna i ruoli personali nella Hero con un effetto di decodifica da terminale.
  const heroRole = document.querySelector(".hero-role");
  // Definisce le parole che descrivono il modo in cui lavoro.
  const roles = ["DEVELOPER", "PHOTOGRAPHER", "VIDEOMAKER"];
  // Usa caratteri da codice per simulare la ricerca del nuovo valore.
  const machineCharacters = "01<>[]{}#$%/|\§^~*+-=()@!?;:";
  // Decodifica un testo breve carattere dopo carattere con simboli da macchina.
  const scrambleText = (element, nextText, onComplete) => {
    // Calcola la lunghezza necessaria per contenere il testo più lungo.
    const frameCount = Math.max(element.textContent.trim().length, nextText.length);
    // Tiene traccia del fotogramma corrente della transizione.
    let frame = 0;
    // Applica lo stato visivo di elaborazione.
    element.classList.add("is-scrambling");
    // Aggiorna il contenuto a intervalli brevi e regolari.
    const animation = window.setInterval(() => {
      // Determina quanti caratteri sono già stati risolti.
      const resolvedCount = Math.floor((frame / 10) * frameCount);
      // Costruisce il testo tra simboli casuali e caratteri definitivi.
      element.textContent = Array.from({ length: frameCount }, (_, index) => {
        if (index < resolvedCount) return nextText[index] || "";
        return machineCharacters[Math.floor(Math.random() * machineCharacters.length)];
      }).join("");
      // Avanza al fotogramma successivo.
      frame += 1;
      // Mostra il testo finale e chiude lo stato di elaborazione.
      if (frame > 10) {
        window.clearInterval(animation);
        element.textContent = nextText;
        element.classList.remove("is-scrambling");
        if (onComplete) onComplete();
      }
    }, 45);
  };
  // Avvia la rotazione solo se il testo e il movimento lo consentono.
  if (heroRole && !reducedMotion) {
    // Memorizza l'indice del ruolo attualmente mostrato.
    let roleIndex = 0;
    // Avvia la rotazione dei ruoli con un ritmo volutamente calmo.
    window.setInterval(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      scrambleText(heroRole, roles[roleIndex]);
    }, 3000);
  }

  // Decodifica le parole accentate dei titoli quando entrano nel viewport.
  const sectionTitleWords = document.querySelectorAll(".section-title em, .footer-title em");
  if (sectionTitleWords.length && !reducedMotion && "IntersectionObserver" in window) {
    // Osserva i titoli prima che siano completamente visibili.
    const titleObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // Mantiene maiuscole e minuscole definite dal design di ogni sezione.
          const originalText = entry.target.textContent.trim();
          // Esegue l'effetto una sola volta per ogni titolo.
          scrambleText(entry.target, originalText, () => observer.unobserve(entry.target));
        });
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.2 },
    );
    sectionTitleWords.forEach((title) => titleObserver.observe(title));
  }

  // Attiva lo scroll inerziale se Lenis è disponibile.
  if (typeof Lenis !== "undefined" && !reducedMotion) {
    smoothScroller = new Lenis({
      duration: 2,
      easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      smoothWheel: true,
      syncTouch: true,
      wheelMultiplier: 0.8,
    });
    if (typeof ScrollTrigger !== "undefined") smoothScroller.on("scroll", ScrollTrigger.update);
    if (typeof gsap !== "undefined") {
      gsap.ticker.add((time) => smoothScroller.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        smoothScroller.raf(time);
        window.requestAnimationFrame(raf);
      };
      window.requestAnimationFrame(raf);
    }
  }

  // Intercetta i collegamenti con ancora per creare una transizione coerente tra le sezioni.
  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    // Ignora i link che puntano a un'altra pagina prima dell'ancora.
    const linkUrl = new URL(link.href, window.location.href);
    if (linkUrl.pathname !== window.location.pathname || !linkUrl.hash) return;
    // Esegue lo scroll verso la sezione selezionata senza il salto predefinito del browser.
    link.addEventListener("click", (event) => {
      const target = document.querySelector(linkUrl.hash);
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", linkUrl.hash);
      if (smoothScroller) {
        smoothScroller.scrollTo(target, { offset: -24 });
      } else {
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
      target.classList.remove("section-focus");
      window.requestAnimationFrame(() => target.classList.add("section-focus"));
    });
  });

  // Evidenzia nella navigazione la sezione attualmente visibile.
  const navigationSections = document.querySelectorAll("main section[id], footer[id]");
  const navigationLinks = document.querySelectorAll('.site-header a[href*="#"]');
  if (navigationSections.length && navigationLinks.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navigationLinks.forEach((link) => {
            const isCurrent = link.getAttribute("href").endsWith(`#${entry.target.id}`);
            link.classList.toggle("is-current", isCurrent);
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    navigationSections.forEach((section) => sectionObserver.observe(section));
  }

  // Registra ScrollTrigger quando i due script sono caricati.
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && !reducedMotion) {
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
      if (isOpen) {
        detail.style.maxHeight = `${detail.scrollHeight}px`;
        window.requestAnimationFrame(() => {
          detail.classList.remove("is-open");
          detail.style.maxHeight = "0px";
        });
        window.setTimeout(() => {
          if (button.getAttribute("aria-expanded") === "false") {
            detail.hidden = true;
          }
        }, reducedMotion ? 0 : 420);
      } else {
        detail.hidden = false;
        detail.style.maxHeight = "0px";
        window.requestAnimationFrame(() => {
          detail.classList.add("is-open");
          detail.style.maxHeight = `${detail.scrollHeight}px`;
        });
      }
    });
  });

  // Mostra le animazioni con GSAP oppure lascia i contenuti visibili in fallback.
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && !reducedMotion) {
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
  void loadPublishedMedia();
  void loadProjectPage();

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
    if (!response.ok) {
      showMediaMessage(gallery, "La galleria sarà disponibile dopo il primo deploy con manifest.");
      console.error(`Manifest error: ${response.status}`);
      return;
    }
    const mediaItems = await response.json();
    if (!Array.isArray(mediaItems)) {
      showMediaMessage(gallery, "Il catalogo media non è disponibile.");
      console.error("Manifest non valido.");
      return;
    }
    gallery.replaceChildren();
    if (!mediaItems.length) {
      const empty = document.createElement("p");
      empty.className = "media-empty";
      empty.textContent = "La galleria è pronta. Aggiungi il primo file in assets/media/.";
      gallery.appendChild(empty);
      return;
    }
    mediaItems.forEach((item) => {
      if (!isValidMediaItem(item)) return;
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
    showMediaMessage(gallery, "La galleria sarà disponibile dopo il primo deploy con manifest.");
    console.error(error);
  }
}

// Mostra uno stato della galleria senza interpretare testo proveniente dal manifest.
function showMediaMessage(gallery, message) {
  const empty = document.createElement("p");
  empty.className = "media-empty";
  empty.textContent = message;
  gallery.replaceChildren(empty);
}

// Accetta solo record media locali e completi generati dal workflow del progetto.
function isValidMediaItem(item) {
  return (
    item &&
    typeof item.src === "string" &&
    item.src.startsWith("assets/media/") &&
    !item.src.includes("..") &&
    (item.type === "image" || item.type === "video") &&
    typeof item.title === "string"
  );
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

  // Costruisce titoli dinamici usando nodi testuali invece di HTML interpretato.
  const setDetailTitle = (firstLine, secondLine) => {
    const emphasis = document.createElement("em");
    emphasis.textContent = secondLine;
    title.replaceChildren(document.createTextNode(firstLine), document.createElement("br"), emphasis);
  };

  // Mostra un messaggio coerente quando il media richiesto non è disponibile.
  const showMissingMedia = () => {
    setDetailTitle("Media", "not found.");
    meta.textContent = "Portfolio";
    copy.textContent = "Questo file non è presente nel catalogo pubblicato.";
    media.replaceChildren();
  };

  if (mediaPath) {
    try {
      const response = await fetch("assets/media/manifest.json", { cache: "no-store" });
      const items = response.ok ? await response.json() : [];
      const item = Array.isArray(items) && items.find((entry) => isValidMediaItem(entry) && entry.src === mediaPath);
      if (!item) return showMissingMedia();
      const name = item.title;
      setDetailTitle(name, "detail.");
      meta.textContent = item.category;
      copy.textContent = item.description;
      media.replaceChildren();
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
      showMissingMedia();
      console.error(error);
    }
    return;
  }

  const project = projects[projectKey] || projects["web-experiments"];
  setDetailTitle(project[0], "project.");
  meta.textContent = project[1];
  copy.textContent = project[2];
  const placeholder = document.createElement("div");
  placeholder.className = "project-placeholder";
  placeholder.append("Aggiungi immagini o video del progetto in ", document.createElement("code"));
  placeholder.lastChild.textContent = "assets/media/";
  media.replaceChildren(placeholder);
  document.title = `${project[0]} — Pietro Giudici`;
}
