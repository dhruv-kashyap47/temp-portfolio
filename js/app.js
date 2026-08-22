(() => {
  document.documentElement.classList.add("js");

  /* ─── Feature detection ─────────────────────────────────────── */
  const reduce = false; // Force animations on all devices
  const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (touch) document.body.classList.add("touch");

  /* ─── Elements ──────────────────────────────────────────────── */
  const loader = document.getElementById("loader");
  const loaderCount = document.getElementById("loaderCount");
  const loaderFill = document.getElementById("loaderFill");
  const nav = document.getElementById("nav");
  const menu = document.getElementById("menu");
  const menuBtn = document.getElementById("menuBtn");

  /* ─── Loader ─────────────────────────────────────────────────── */
  const runLoader = () => {
    if (!loader || !loaderCount || !loaderFill) {
      ready();
      return;
    }

    if (reduce) {
      loader.classList.add("is-done");
      ready();
      return;
    }
    const start = performance.now();
    const duration = 1150;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const n = Math.round(eased * 100);
      loaderCount.textContent = String(n).padStart(2, "0");
      loaderFill.style.width = `${n}%`;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        loader.classList.add("is-done");
        setTimeout(ready, 80);
        setTimeout(() => loader.remove(), 1100);
      }
    };
    requestAnimationFrame(tick);
  };

  const ready = () => {
    document.documentElement.classList.add("is-ready");
    nav.classList.add("is-on");
    initMotion();
  };

  /* ─── Clock ──────────────────────────────────────────────────── */
  const initClock = () => {
    const el = document.getElementById("clock");
    if (!el) return;
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const stamp = () => {
      el.textContent = `India / ${fmt.format(new Date())} IST`;
    };
    stamp();
    setInterval(stamp, 1000);
  };

  /* ─── Menu ───────────────────────────────────────────────────── */
  const initMenu = () => {
    const setOpen = (open) => {
      document.body.classList.toggle("is-menu", open);
      menu.classList.toggle("is-open", open);
      if (open) nav.classList.remove("nav--hidden");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.querySelector("span").textContent = open ? "Close" : "Menu";
    };

    menuBtn.addEventListener("click", () => {
      setOpen(!menu.classList.contains("is-open"));
    });

    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  };

  /* ─── Navbar hides on scroll down, returns on scroll up ──────── */
  const initNavHide = () => {
    const THRESHOLD = 120;
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      if (!document.body.classList.contains("is-menu")) {
        nav.classList.toggle("nav--hidden", y > last && y > THRESHOLD);
      }
      last = y;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
  };

  /* ─── Custom cursor ──────────────────────────────────────────── */
  const initCursor = () => {
    if (touch) return;
    const cursor = document.querySelector(".cursor");
    const ring = cursor.querySelector(".cursor__ring");
    const dot = cursor.querySelector(".cursor__dot");
    const label = cursor.querySelector(".cursor__label");
    let x = 0,
      y = 0,
      rx = 0,
      ry = 0;

    window.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });

    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      label.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    const hoverables = document.querySelectorAll("a, button, .magnetic");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hover");
        label.textContent = el.dataset.cursor || "";
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hover");
        label.textContent = "";
      });
    });
  };

  /* ─── Magnetic hover ─────────────────────────────────────────── */
  /* NOTE: .spin-cta also has a CSS :hover scale(1.08). An inline
     magnetic transform would override that CSS rule, so the scale is
     composed into the inline transform here instead. */
  const initMagnetic = () => {
    if (touch || reduce) return;
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const scale = el.classList.contains("spin-cta") ? " scale(1.08)" : "";
        el.style.transition = "transform 0.08s linear";
        el.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)${scale}`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.transform = "translate(0, 0)";
      });
    });
  };

  /* ─── Ember / particle canvas ─────────────────────────────────── */
  const initEmbers = () => {
    const canvas = document.getElementById("emberCanvas");
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    const particles = [];
    let w = 0,
      h = 0;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const spawn = (n) => {
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: canvas.offsetHeight + Math.random() * 120,
          r: Math.random() * 1.8 + 0.25,
          s: Math.random() * 0.9 + 0.2,
          a: Math.random() * 0.5 + 0.08,
          drift: (Math.random() - 0.5) * 0.5,
          hue: Math.random() > 0.5 ? "197, 106, 50" : "201, 174, 124",
        });
      }
    };

    const step = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach((p) => {
        p.y -= p.s;
        p.x += p.drift;
        p.a *= 0.998;
        if (p.y < -10 || p.a < 0.015) {
          p.x = Math.random() * canvas.offsetWidth;
          p.y = canvas.offsetHeight + 10;
          p.a = Math.random() * 0.5 + 0.08;
          p.drift = (Math.random() - 0.5) * 0.5;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue}, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(step);
    };

    resize();
    /* Fewer embers on small viewports so mobile keeps the same feel
       without paying desktop particle counts. */
    const count = Math.max(
      30,
      Math.min(90, Math.round((canvas.offsetWidth * canvas.offsetHeight) / 22000)),
    );
    spawn(count);
    step();
    window.addEventListener("resize", resize);
  };

  /* ─── Work follower ──────────────────────────────────────────── */
  const initWorkFollower = () => {
    const follower = document.getElementById("workFollower");
    if (!follower || touch) return;
    const arts = [...follower.querySelectorAll(".art")];
    const items = document.querySelectorAll(".work-item");
    let x = 0,
      y = 0,
      fx = 0,
      fy = 0;

    const loop = () => {
      fx += (x - fx) * 0.13;
      fy += (y - fy) * 0.13;
      follower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        follower.classList.add("is-on");
        const key = item.dataset.art;
        arts.forEach((a) =>
          a.classList.toggle("is-active", a.dataset.art === key),
        );
      });
      item.addEventListener("mousemove", (e) => {
        x = e.clientX + 28;
        y = e.clientY + 10;
      });
      item.addEventListener("mouseleave", () => {
        follower.classList.remove("is-on");
      });
    });
  };

  /* ─── Count-up numbers ───────────────────────────────────────── */
  const initCountUp = () => {
    const nums = document.querySelectorAll("[data-count]");
    const play = (el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const duration = 1600;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = `${Math.round(eased * target)}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      nums.forEach(play);
      return;
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            play(entry.target);
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.4 },
    );
    nums.forEach((n) => io.observe(n));
  };

  /* ─── Scroll progress bar ─────────────────────────────────────── */
  const initScrollProgress = () => {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${pct}%`;
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  };

  /* ─── Ambient hero glow that follows scroll ──────────────────── */
  const initAmbientGlow = () => {
    if (reduce) return;
    const glow = document.querySelector(".hero__ambient");
    if (!glow) return;
    const update = () => {
      const s = Math.min(window.scrollY / (window.innerHeight * 0.8), 1);
      glow.style.opacity = String(0.65 - s * 0.65);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  };

  /* ─── Agents pipeline hover animation ────────────────────────── */
  const initAgentsPipeline = () => {
    const items = document.querySelectorAll(".agents__row li");
    const stage = document.querySelector(".agents");
    if (!items.length || !stage) return;

    const activate = (i) => {
      items.forEach((other, j) => {
        const dist = Math.abs(j - i);
        other.classList.toggle("agent--active", dist === 0);
        other.classList.toggle("agent--near", dist === 1);
        other.classList.toggle("agent--far", dist === 2);
      });
    };

    const clear = () => {
      items.forEach((other) => {
        other.classList.remove("agent--active", "agent--near", "agent--far");
      });
    };

    /* Desktop: ripple follows the pointer across the pipeline. */
    if (!touch) {
      items.forEach((li, i) => {
        li.style.setProperty("--delay", `${i * 0.1}s`);
        li.addEventListener("mouseenter", () => activate(i));
        li.addEventListener("mouseleave", clear);
      });
      return;
    }

    /* Touch parity: no hover exists on mobile, so the same ripple
       auto-plays while the section is on screen. */
    if (!("IntersectionObserver" in window)) return;
    let idx = 0;
    let timer = null;
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setInterval(() => {
            activate(idx);
            idx = (idx + 1) % items.length;
          }, 1400);
        } else {
          clearInterval(timer);
          timer = null;
          clear();
        }
      },
      { threshold: 0.3 },
    ).observe(stage);
  };

  /* ─── Typing effect for hero kicker ──────────────────────────── */
  const initTypingEffect = () => {
    if (reduce) return;
    const kicker = document.querySelector(".hero__kicker");
    if (!kicker) return;
    const spans = kicker.querySelectorAll("span:not(.dot)");
    spans.forEach((span, i) => {
      const text = span.textContent;
      span.textContent = "";
      span.style.opacity = "1";
      let charIdx = 0;
      const delay = 600 + i * 180;
      setTimeout(() => {
        const type = () => {
          if (charIdx < text.length) {
            span.textContent += text[charIdx++];
            setTimeout(type, 38 + Math.random() * 28);
          }
        };
        type();
      }, delay);
    });
  };

  /* ─── Section reveals ─────────────────────────────────────────
     Handled entirely by the ScrollTrigger tweens in initMotion().
     (An older IntersectionObserver pass here targeted .reveal-up /
     .stagger-parent selectors that don't exist, and set transition
     delays that fought GSAP's per-frame updates — removed.) */

  /* ─── Stack grid card hover tilt ─────────────────────────────── */
  const initStackTilt = () => {
    if (touch || reduce) return;
    document.querySelectorAll(".stack__grid article").forEach((card) => {
      /* CSS gives these cards `transition: transform .35s`; if left
         active it chases every mousemove frame and makes the tilt feel
         rubber-banded, so transitions are suspended while tilting. */
      card.addEventListener("mouseenter", () => {
        card.style.transition = "none";
      });
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 8;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 8;
        card.style.transform = `perspective(600px) rotateY(${nx}deg) rotateX(${-ny}deg) translateZ(4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "";
        card.style.transform = "";
      });
    });
  };

  /* ─── Ticker pause on hover (desktop nicety) ─────────────────── */
  const initTickerPause = () => {
    const ticker = document.querySelector(".ticker__track");
    if (!ticker) return;
    ticker.addEventListener(
      "mouseenter",
      () => (ticker.style.animationPlayState = "paused"),
    );
    ticker.addEventListener(
      "mouseleave",
      () => (ticker.style.animationPlayState = "running"),
    );
  };

  /* ─── GSAP + Lenis smooth scroll & scroll triggers ───────────── */
  const initMotion = () => {
    const hasGsap = typeof gsap !== "undefined";
    const hasLenis = typeof Lenis !== "undefined";
    const hasST = typeof ScrollTrigger !== "undefined";

    let lenis = null;
    if (hasLenis && !reduce) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      if (hasGsap && hasST) {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        const raf = (time) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      }
    }

    if (hasGsap && !reduce) {
      /* Several elements carry CSS `transition: transform/opacity` for
         their hover states. Left active, those transitions chase every
         GSAP frame during scroll reveals and make entrances feel
         laggy. This wrapper suspends them for the duration of the
         tween, then hands control back to CSS. */
      const fromNoTrans = (targets, vars) => {
        const els = gsap.utils.toArray(targets);
        if (!els.length) return;
        els.forEach((el) => el.classList.add("no-trans"));
        gsap.from(els, {
          ...vars,
          onComplete: () =>
            els.forEach((el) => el.classList.remove("no-trans")),
        });
      };

      /* Hero text reveal */
      gsap.to(".hero .reveal", {
        y: "0%",
        duration: 1.25,
        stagger: 0.14,
        ease: "power4.out",
        delay: 0.05,
      });

      fromNoTrans(".hero__lede, .spin-cta, .hero__stats, .hero__kicker", {
        y: 32,
        opacity: 0,
        duration: 1.1,
        stagger: 0.09,
        ease: "power3.out",
        delay: 0.3,
      });

      /* Hero parallax on scroll */
      if (hasST) {
        gsap.to(".hero__name", {
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.to(".hero__canvas", {
          y: -30,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        /* About title */
        gsap.from(".about__title", {
          y: 50,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".about__title", start: "top 85%" },
        });

        /* About copy paragraphs */
        gsap.from(".about__copy p, .about__edu, .about__links", {
          y: 28,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".about__copy", start: "top 80%" },
        });

        /* Agents pipeline */
        fromNoTrans(".agents__row li", {
          y: 20,
          opacity: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: { trigger: ".agents", start: "top 85%" },
        });

        /* Work section */
        gsap.from(".work__title", {
          y: 50,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".work__title", start: "top 85%" },
        });

        gsap.utils.toArray(".work-item").forEach((item, i) => {
          item.classList.add("no-trans");
          gsap.from(item, {
            y: 30,
            opacity: 0,
            duration: 0.9,
            delay: i * 0.05,
            ease: "power3.out",
            /* Tween-level onComplete (not scrollTrigger-level) so the
               .no-trans lock is always released once the reveal ends. */
            onComplete: () => item.classList.remove("no-trans"),
            scrollTrigger: { trigger: item, start: "top 90%" },
          });
        });

        /* Experience */
        gsap.from(".exp-plate", {
          y: 26,
          opacity: 0,
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: { trigger: ".exp-plate", start: "top 88%" },
        });

        /* Seal stamps in with a little overshoot */
        gsap.from(".exp-plate__seal", {
          scale: 0.55,
          opacity: 0,
          rotation: -50,
          duration: 1,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: ".exp-plate", start: "top 74%" },
        });

        gsap.from(".exp__left > *", {
          y: 30,
          opacity: 0,
          duration: 0.9,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: { trigger: ".exp", start: "top 80%" },
        });

        gsap.from(".exp__right > *", {
          y: 24,
          opacity: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: ".exp__right", start: "top 85%" },
        });

        /* Schematic panel rises in; connectors keep their CSS flow */
        fromNoTrans(".schem", {
          y: 34,
          opacity: 0,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: ".schem", start: "top 85%" },
        });

        /* Metrics */
        gsap.from(".metric", {
          y: 28,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".metrics", start: "top 85%" },
        });

        /* Light the metric underlines once counted into view */
        const metricsEl = document.querySelector(".metrics");
        if (metricsEl) {
          ScrollTrigger.create({
            trigger: metricsEl,
            start: "top 82%",
            once: true,
            onEnter: () => metricsEl.classList.add("is-lit"),
          });
        }

        /* Stack grid */
        fromNoTrans(".stack__grid article", {
          y: 24,
          opacity: 0,
          duration: 0.75,
          stagger: 0.07,
          ease: "power2.out",
          scrollTrigger: { trigger: ".stack__grid", start: "top 85%" },
        });

        /* Recognition */
        fromNoTrans(".recog li", {
          x: -24,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".recog", start: "top 85%" },
        });

        /* Contact */
        gsap.from(".contact h2", {
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: { trigger: ".contact h2", start: "top 85%" },
        });

        gsap.from(".contact__mail", {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          delay: 0.12,
          scrollTrigger: { trigger: ".contact__mail", start: "top 88%" },
        });

        gsap.from(".contact__row > *", {
          y: 18,
          opacity: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: "power2.out",
          scrollTrigger: { trigger: ".contact__row", start: "top 90%" },
        });

        /* Section head labels */
        gsap.utils.toArray(".section-head").forEach((sh) => {
          gsap.from(sh.children, {
            y: 14,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: sh, start: "top 88%" },
          });
        });
      }
    } else {
      /* Reduced motion fallback */
      document.querySelectorAll(".reveal").forEach((el) => {
        el.style.transform = "none";
      });
    }

    /* Smooth anchor scrolling */
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -12 });
        else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      });
    });

    /* Run everything else */
    initEmbers();
    initWorkFollower();
    initCountUp();
    initAgentsPipeline();
    initTypingEffect();
    initStackTilt();
    initScrollProgress();
    initAmbientGlow();
    initTickerPause();
  };

  /* ─── Boot ───────────────────────────────────────────────────── */
  initClock();
  initMenu();
  initCursor();
  initMagnetic();
  initNavHide();

  let booted = false;
  const boot = () => {
    if (booted) return;
    booted = true;
    runLoader();
  };
  /* Start counting as soon as the DOM is parsed. Waiting for the
     full window load event (fonts + CDN + everything) delayed the
     hero reveal by seconds on slow connections. The timeout stays
     as a safety net for stalled assets. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
  setTimeout(boot, 3200);
})();
