// Attende che il documento HTML sia completamente pronto prima di avviare le animazioni.
document.addEventListener("DOMContentLoaded", () => {
  // Seleziona il pallino custom presente nel markup.
  const cursor = document.querySelector(".custom-cursor");

  // Controlla che il cursore esista prima di collegare gli eventi del mouse.
  if (cursor) {
    // Memorizza la posizione corrente e quella richiesta dal mouse.
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let targetX = currentX;
    let targetY = currentY;

    // Imposta subito una posizione valida, così il pallino non resta nell'angolo 0,0.
    cursor.style.left = `${currentX}px`;
    cursor.style.top = `${currentY}px`;

    // Riceve la posizione del mouse senza dipendere da CDN o librerie esterne.
    window.addEventListener("mousemove", (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
    });

    // Interpola la posizione per ottenere un movimento morbido e stabile.
    const animateCursor = () => {
      currentX += (targetX - currentX) * 0.32;
      currentY += (targetY - currentY) * 0.32;
      cursor.style.left = `${currentX}px`;
      cursor.style.top = `${currentY}px`;
      window.requestAnimationFrame(animateCursor);
    };

    // Avvia il loop indipendente che anima il pallino.
    animateCursor();

    // Ingrandisce il pallino sopra link e pulsanti.
    document.querySelectorAll("a, button").forEach((interactiveElement) => {
      interactiveElement.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hovering");
      });
      interactiveElement.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hovering");
      });
    });
  }

  // Attiva Lenis solo quando la libreria è stata caricata correttamente.
  if (typeof Lenis !== "undefined") {
    // Crea l'istanza Lenis con una durata morbida e un easing progressivo.
    const lenis = new Lenis({
      duration: 2,
      easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
      smoothWheel: true,
      syncTouch: true,
      wheelMultiplier: 0.8,
    });

    // Sincronizza lo scroll fluido con ScrollTrigger quando disponibile.
    if (typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
    }

    // Usa il ticker GSAP se disponibile, altrimenti aggiorna Lenis con RAF nativo.
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

  // Registra ScrollTrigger soltanto quando GSAP e il plugin sono presenti.
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Attiva i filtri della griglia progetti senza ricaricare la pagina.
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      document.querySelectorAll(".project-card").forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !shouldShow);
      });
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });
  });

  // Gestisce gli accordion dei servizi nella sezione profilo.
  document.querySelectorAll(".service-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const detail = button.nextElementSibling;
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      detail.hidden = isOpen;
    });

    // Seleziona i controlli della Media Lab per gestire upload e anteprime.
    const mediaInput = document.querySelector("#media-upload");
    const uploadZone = document.querySelector(".upload-zone");
    const mediaPreview = document.querySelector("#media-preview");
    const clearMedia = document.querySelector("#clear-media");

    // Crea anteprime temporanee per immagini e video scelti dall'utente.
    const renderMedia = (files) => {
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          return;
        }

        const previewItem = document.createElement("div");
        const preview = file.type.startsWith("video/") ? document.createElement("video") : document.createElement("img");
        const name = document.createElement("span");
        const objectUrl = URL.createObjectURL(file);

        previewItem.className = "preview-item";
        preview.src = objectUrl;
        preview.alt = file.name;
        name.className = "preview-name";
        name.textContent = file.name;
        previewItem.append(preview, name);
        mediaPreview.appendChild(previewItem);
      });

      clearMedia.hidden = mediaPreview.children.length === 0;
    };

    // Mostra i file selezionati con il file picker.
    mediaInput?.addEventListener("change", (event) => {
      renderMedia(event.target.files);
      event.target.value = "";
    });

    // Evidenzia l'area durante il trascinamento dei file.
    ["dragenter", "dragover"].forEach((eventName) => {
      uploadZone?.addEventListener(eventName, (event) => {
        event.preventDefault();
        uploadZone.classList.add("is-dragging");
      });
    });

    // Rimuove l'evidenziazione quando i file escono o vengono rilasciati.
    ["dragleave", "drop"].forEach((eventName) => {
      uploadZone?.addEventListener(eventName, (event) => {
        event.preventDefault();
        uploadZone.classList.remove("is-dragging");
      });
    });

    // Aggiunge i file trascinati all'anteprima.
    uploadZone?.addEventListener("drop", (event) => {
      renderMedia(event.dataTransfer.files);
    });

    // Svuota le anteprime e libera gli oggetti temporanei del browser.
    clearMedia?.addEventListener("click", () => {
      mediaPreview.querySelectorAll("img, video").forEach((media) => URL.revokeObjectURL(media.src));
      mediaPreview.replaceChildren();
      clearMedia.hidden = true;
    });
  });

  // Seleziona tutti i testi che devono entrare dal basso quando diventano visibili.
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.utils.toArray(".reveal-text").forEach((element) => {
      // Anima posizione e opacità quando l'elemento raggiunge l'85% della viewport.
      gsap.from(element, {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          once: true,
        },
      });
    });

    // Seleziona gli elementi immagine che devono essere rivelati con una maschera.
    gsap.utils.toArray(".reveal-img").forEach((element) => {
      // Imposta la clip-path iniziale e la scala prima dell'ingresso nella viewport.
      gsap.set(element, {
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        scale: 1.2,
      });
      // Rimuove la maschera e riduce la scala con un easing dall'impatto editoriale.
      gsap.to(element, {
        clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
        scale: 1,
        duration: 1.4,
        ease: "power4.out",
        scrollTrigger: {
          trigger: element,
          start: "top 85%",
          once: true,
        },
      });
    });
  } else {
    document.querySelectorAll(".reveal-text, .reveal-img").forEach((element) => {
      element.style.opacity = "1";
      element.style.clipPath = "none";
      element.style.transform = "none";
    });
  }

  // Ricalcola i trigger dopo il caricamento degli asset per mantenere corrette le soglie.
  window.addEventListener("load", () => {
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });
});
