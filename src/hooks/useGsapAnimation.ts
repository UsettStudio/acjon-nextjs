"use client";
import { SplitText } from "gsap/dist/SplitText";
import { useEffect } from 'react';
import gsap from 'gsap';

// character animation
export const charAnimation = () => {
  const char_come = gsap.utils.toArray<HTMLElement>(".tp-char-animation");
  char_come.forEach(splitTextLine => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: splitTextLine,
        start: 'top 90%',
        end: 'bottom 60%',
        scrub: false,
        markers: false,
        toggleActions: 'play none none none'
      }
    });
    const itemSplitted = new SplitText(splitTextLine, { type: "chars, words" });
    gsap.set(splitTextLine, { perspective: 300 });
    itemSplitted.split({ type: "chars, words" })
    tl.from(itemSplitted.chars,
      {
        duration: 1,
        delay: 0.5,
        x: 100,
        autoAlpha: 0,
        stagger: 0.05
      });
  });
}

// Button text animation
export const buttonTextAnim = () => {
  document.querySelectorAll<HTMLElement>(".tp-btn-anim .tp-btn-text").forEach((el) => {
    if (el.classList.contains("btn-animated")) return;

    el.classList.add("btn-animated");

    const text = el.textContent?.trim() || "";
    el.innerHTML = "";

    const block = document.createElement("div");
    block.classList.add("btn-anim__block");

    [...text].forEach((char) => {
      const span = document.createElement("span");
      span.className = "btn-anim__letter";
      span.textContent = char === " " ? "\u00A0" : char;
      block.appendChild(span);
    });

    el.appendChild(block);
    el.appendChild(block.cloneNode(true));
  });
};


//fade animation
export const fadeAnimation = () => {
  gsap.utils.toArray<HTMLElement>(".tp_fade_anim").forEach((item) => {
    const offset = parseFloat(item.dataset.fadeOffset || "40");
    const duration = parseFloat(item.dataset.duration || "0.75");
    const direction = item.dataset.fadeFrom || "bottom";
    const onScroll = item.dataset.onScroll !== "0";
    const delay = parseFloat(item.dataset.delay || "0.15");
    const ease = item.dataset.ease || "power2.out";

    const animVars: gsap.TweenVars = {
      opacity: 0,
      ease,
      duration,
      delay,
      x:
        direction === "left"
          ? -offset
          : direction === "right"
            ? offset
            : 0,
      y:
        direction === "top"
          ? -offset
          : direction === "bottom"
            ? offset
            : 0,
    };

    if (onScroll) {
      animVars.scrollTrigger = {
        trigger: item,
        start: "top 85%",
        toggleActions: "play none none none",
      };
    }

    gsap.from(item, animVars);
  });
};

// fixed-title-wrap
export const fixedTitleAnim = () => {
  const pc = gsap.matchMedia();

  pc.add("(min-width: 992px)", () => {
    const wrap = document.querySelector(".tp-fixed-title-wrap") as HTMLElement;
    const title = document.querySelector(".tp-fixed-title") as HTMLElement;

    if (!wrap || !title) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: () => `+=${wrap.clientHeight - title.clientHeight}`,
        pin: title,
        markers: false,
        pinSpacing: true,
        scrub: 1,
      }
    });

    return tl;
  });
};

// fixed-title-wrap
export const fixedTitleAnim2 = () => {
  const pc = gsap.matchMedia();
  pc.add("(min-width: 992px)", () => {
    gsap.timeline({
      scrollTrigger: {
        trigger: ".tp-fixed-title-wrap-3",
        start: 'top center-=450',
        end: "bottom 72%",
        pin: ".tp-fixed-title-3",
        markers: false,
        pinSpacing: false,
        scrub: 1,
      }
    })
  }
  );
};

//image cliping effect
export const imageClipingEffect = () => {
  const initialClipPaths = [
    "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
    "polygon(33.33% 0%, 33.33% 0%, 33.33% 0%, 33.33% 0%)",
    "polygon(65.66% 0%, 66.66% 0%, 66.66% 0%, 66.66% 0%)",
    "polygon(0% 33.33%, 0% 33.33%, 0% 33.33%, 0% 33.33%)",
    "polygon(33.33% 33.33%, 33.33% 33.33%, 33.33% 33.33%, 33.33% 33.33%)",
    "polygon(65.66% 33.33%, 66.66% 33.33%, 66.66% 33.33%, 66.66% 33.33%)",
    "polygon(0% 66.66%, 0% 66.66%, 0% 66.66%, 0% 66.66%)",
    "polygon(33.33% 66.66%, 33.33% 66.66%, 33.33% 66.66%, 33.33% 66.66%)",
    "polygon(65.66% 66.66%, 66.66% 66.66%, 66.66% 66.66%, 66.66% 66.66%)"
  ];
  const finalClipPaths = [
    "polygon(0% 0%, 34.33% 0%, 34.33% 34.33%, 0% 34.33%)",
    "polygon(32.33% 0%, 66.66% 0%, 66.66% 33.33%, 33.33% 34.33%)",
    "polygon(65.66% 0%, 100% 0%, 100% 33.33%, 65.66% 34.33%)",
    "polygon(0% 33.33%, 33.33% 33.33%, 33.33% 66.66%, 0% 66.66%)",
    "polygon(30.33% 33.33%, 66.66% 33.33%, 66.66% 66.66%, 33.33% 66.66%)",
    "polygon(65.66% 33.33%, 100% 32.33%, 100% 66.66%, 65.66% 66.66%)",
    "polygon(0% 65.66%, 33.33% 66.66%, 33.33% 100%, 0% 100%)",
    "polygon(30.33% 66.66%, 66.66% 65.66%, 66.66% 100%, 33.33% 100%)",
    "polygon(65.66% 66.66%, 100% 65.66%, 100% 100%, 65.66% 100%)"
  ];
  // Create mask divs for each wrapper
  document.querySelectorAll(".tp-clip-anim").forEach(wrapper => {
    const img = wrapper.querySelector(".tp-anim-img[data-animate='true']");
    if (!img) return;
    const url = (img as HTMLImageElement).src;

    // Remove old masks if any (reuse safe)
    wrapper.querySelectorAll(".mask").forEach(m => m.remove());

    for (let i = 0; i < 9; i++) {
      const mask = document.createElement("div");
      mask.className = `mask mask-${i + 1}`;
      Object.assign(mask.style, {
        backgroundImage: `url(${url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "absolute",
        inset: "0"
      });
      wrapper.appendChild(mask);
    }
  });

  // Animate masks
  gsap.utils.toArray<HTMLElement>(".tp-clip-anim").forEach(wrapper => {
    const masks = wrapper.querySelectorAll(".mask");
    if (!masks.length) return;

    gsap.set(masks, { clipPath: (i) => initialClipPaths[i] });

    const order = [
      [".mask-1"],
      [".mask-2", ".mask-4"],
      [".mask-3", ".mask-5", ".mask-7"],
      [".mask-6", ".mask-8"],
      [".mask-9"]
    ];

    const tl = gsap.timeline({
      scrollTrigger: { trigger: wrapper, start: "top 75%" }
    });

    order.forEach((targets, i) => {
      const validTargets = targets
        .map(c => wrapper.querySelector(c))
        .filter(el => el); // filter out nulls

      if (validTargets.length) {
        tl.to(validTargets, {
          clipPath: (j, el) => finalClipPaths[Array.from(masks).indexOf(el)],
          duration: 1,
          ease: "power4.out",
          stagger: 0.1
        }, i * 0.125);
      }
    });
  });

}

//split-title element
export const splitTitleAnim = () => {
  document.querySelectorAll(".tp-split-title").forEach(title => {
    const split = new SplitText(title, { type: "chars" });

    split.chars.forEach(char => char.classList.add("char"));

    gsap.to(split.chars, {
      scrollTrigger: {
        trigger: title,
        start: "top 80%",
      },
      duration: .8,
      clipPath: "inset(0% 0% 0% 0%)",
      x: 0,
      opacity: 1,
      ease: "power4.out",
      stagger: 0.03
    });
  })
};

// 28. text-bg color
export const textScrollBgAnim = (wrap?: HTMLElement) => {
  const container = wrap || document.body;

  const elements = container.querySelectorAll<HTMLElement>(".tp-text-revel");

  elements.forEach((el) => {
    const tpSplit = new SplitText(el, { type: "words, chars" });

    if (tpSplit.words.length > 0) {
      const firstWord = tpSplit.words[0] as HTMLElement;
      if (firstWord.firstElementChild) {
        firstWord.firstElementChild.classList.add("tp-first-char");
      }
    }
    // GSAP animation
    gsap.fromTo(
      tpSplit.chars,
      {
        position: "relative",
        display: "inline-block",
        opacity: 0.2,
        x: -5,
      },
      {
        opacity: 1,
        x: 0,
        stagger: 0.1,
        scrollTrigger: {
          trigger: el,
          toggleActions: "play pause reverse pause",
          start: "top 70%",
          end: "top 40%",
          scrub: 0.7,
        },
      }
    );
  });
}

// button hover animation
export const initHoverBtnAnim = () => {
  // all hover buttons
  const hoverBtns = document.querySelectorAll<HTMLElement>(".tp-hover-btn");
  const hoverBtnWrappers = document.querySelectorAll<HTMLElement>(".tp-hover-btn-wrapper");
  const hoverBtnItems = document.querySelectorAll<HTMLElement>(".tp-hover-btn-item");

  // circle dot hover effect
  hoverBtns.forEach((btn) => {
    const dot = btn.querySelector<HTMLElement>(".tp-btn-circle-dot");
    if (!dot) return;

    const moveDot = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      dot.style.top = `${y}px`;
      dot.style.left = `${x}px`;
    };

    btn.addEventListener("mouseenter", moveDot);
    btn.addEventListener("mouseout", moveDot);
  });

  // parallax hover effect
  hoverBtnWrappers.forEach((wrapper, i) => {
    const item = hoverBtnItems[i];
    if (!item) return;

    const parallaxIt = (e: MouseEvent, target: HTMLElement, movement: number) => {
      const rect = wrapper.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      gsap.to(target, {
        duration: 1,
        x: ((relX - rect.width / 2) / rect.width) * movement,
        y: ((relY - rect.height / 2) / rect.height) * movement,
        ease: "power2.out",
      });
    };

    wrapper.addEventListener("mousemove", (e) => {
      parallaxIt(e, item, 60);
    });

    wrapper.addEventListener("mouseleave", () => {
      gsap.to(item, {
        duration: 1,
        x: 0,
        y: 0,
        ease: "power2.out",
      });
    });
  });
};

// Hover Reveal award animation
export const useImageHoverReveal = () => {
  useEffect(() => {
    // Only run this effect on client side
    if (typeof window === 'undefined') return;

    const hoverItems = document.querySelectorAll<HTMLElement>(".hover-reveal-item");

    const moveImage = (e: MouseEvent, item: HTMLElement) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Using children[1] as in your original version
      const image = item.children[1] as HTMLElement;
      if (image) {
        image.style.transform = `translate(${x}px, ${y}px)`;
      }
    };

    // Properly typed event listener
    const handleMouseMove = (e: Event) => {
      moveImage(e as MouseEvent, e.currentTarget as HTMLElement);
    };

    hoverItems.forEach((item) => {
      item.addEventListener("mousemove", handleMouseMove as EventListener);
    });

    return () => {
      hoverItems.forEach((item) => {
        item.removeEventListener("mousemove", handleMouseMove as EventListener);
      });
    };
  }, []);
};

// portfolio animation start
export const portfolioAnimation = () => {
  gsap.set('.tp-item-anime-md.marque', {
    x: '2%'
  });
  gsap.timeline({
    scrollTrigger: {
      trigger: '.tp-item-anime-area-md ',
      start: '-100 20%',
      end: 'bottom 20%',
      scrub: true,
      invalidateOnRefresh: true
    }
  })
    .to('.tp-item-anime-md.marque ', {
      x: '-10%'
    });
}

//  tp-text-perspective
export const textPerspectiveAnim = () => {
  gsap.utils.toArray<HTMLElement>(".tp-text-perspective").forEach(splitTextLine => {
    const delay_value = parseFloat(splitTextLine.getAttribute("data-delay") || "0.5");
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: splitTextLine,
        start: 'top 85%',
        scrub: false,
        markers: false,
        toggleActions: 'play none none none'
      }
    });
    const itemSplitted = new SplitText(splitTextLine, { type: "lines" });
    gsap.set(splitTextLine, { perspective: 400 });
    itemSplitted.split({ type: "lines" });

    tl.from(itemSplitted.lines, {
      duration: 1,
      delay: delay_value,
      opacity: 0,
      rotationX: -80,
      force3D: true,
      transformOrigin: "top center -50",
      stagger: 0.1
    });
  })
};

// Work Pin Section
export const WorkPinAnimation = () => {
  const tl = gsap.timeline();
  const pr = gsap.matchMedia();
  pr.add("(min-width: 767px)", () => {
    const otherSections = document.querySelectorAll('.sa-work-panel')
    otherSections.forEach((section) => {
      gsap.set(otherSections, {
        scale: 1,
      });
      tl.to(section, {
        scale: .8,
        scrollTrigger: {
          trigger: section,
          pin: section,
          scrub: 1,
          start: 'top 0',
          end: "bottom 60%",
          endTrigger: '.sa-work-wrap',
          pinSpacing: false,
          markers: false,
        },
      })
    })
  })
}
// inner-service-3-panel
export const ServicePanelAnimation = () => {
  const tl = gsap.timeline();
  const pr = gsap.matchMedia();
  pr.add("(min-width: 769px)", () => {
    const otherSections = document.querySelectorAll('.inner-service-3-panel')
    otherSections.forEach((section) => {
      tl.to(section, {
        scrollTrigger: {
          trigger: section,
          pin: section,
          scrub: 1,
          start: 'top 10%',
          end: "bottom 100%",
          endTrigger: '.inner-service-3-pin-wrap',
          pinSpacing: false,
          markers: false,
        },
      })
    })
  });
}
// portfolio animation start
export const PortfolioAnimation = () => {
  const items = document.querySelectorAll<HTMLElement>(".tp-item-anime");
  const marqueeItems = document.querySelectorAll<HTMLElement>(
    ".tp-item-anime.marque"
  );
  const triggerEl = document.querySelector<HTMLElement>(
    ".tp-item-anime-area"
  );
  // if no items, do nothing
  if (!items.length || !triggerEl) return;

  // initial state
  gsap.set(marqueeItems, {
    x: "25%",
  });

  gsap.timeline({
    scrollTrigger: {
      trigger: triggerEl,
      start: "-1000 10%",
      end: "bottom 20%",
      scrub: true,
      invalidateOnRefresh: true,
    },
  }).to(marqueeItems, {
    x: "-100%",
  });
};

