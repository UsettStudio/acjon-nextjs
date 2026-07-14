import gsap from "gsap";

export default function cursorAnimation(): void {
    if (typeof window === "undefined") return;

    const body = document.body;
    if (!body.classList.contains("tp-magic-cursor") || body.classList.contains("is-mobile")) return;

    

    // Wrap .tp-magnetic-item elements
    document.querySelectorAll<HTMLElement>(".tp-magnetic-item").forEach((item) => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("tp-magnetic-wrap");
        const parent = item.parentNode;
        if (parent) {
            parent.insertBefore(wrapper, item);
            wrapper.appendChild(item);
        }
    });

    // Add .not-hide-cursor to anchor items
    document.querySelectorAll<HTMLAnchorElement>("a.tp-magnetic-item").forEach((a) => {
        a.classList.add("not-hide-cursor");
    });

    // Cursor properties
    const ball = document.getElementById("ball") as HTMLElement | null;
    const ballWidth = 14;
    const ballHeight = 14;
    const ballScale = 1;
    const ballOpacity = 1;
    const ballBorderWidth = 1;
    const ratio = 0.15;

    if (!ball) return; // Prevent null crash

    let active = false;
    const mouse = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };

    gsap.set(ball, {
        xPercent: -50,
        yPercent: -50,
        width: ballWidth,
        height: ballHeight,
        borderWidth: ballBorderWidth,
        opacity: ballOpacity,
    });


    // Update mouse position
    document.addEventListener("mousemove", (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // GSAP ticker for smooth follow
    gsap.ticker.add(() => {
        if (!active) {
            pos.x += (mouse.x - pos.x) * ratio;
            pos.y += (mouse.y - pos.y) * ratio;
            gsap.set(ball, { x: pos.x, y: pos.y });
        }
    });

    // Magnetic hover movement
    function parallaxIt(
        e: MouseEvent,
        parent: HTMLElement,
        target: HTMLElement | null,
        movement: number
    ): void {
        if (!target) return;
        const rect = parent.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        gsap.to(target, {
            duration: 0.3,
            x: ((relX - rect.width / 2) / rect.width) * movement,
            y: ((relY - rect.height / 2) / rect.height) * movement,
            ease: "power2.out",
        });
    }

    function parallaxCursor(e: MouseEvent, parent: HTMLElement, movement: number): void {
        const rect = parent.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        pos.x = rect.left + rect.width / 2 + (relX - rect.width / 2) / movement;
        pos.y = rect.top + rect.height / 2 + (relY - rect.height / 2) / movement;
        gsap.to(ball, { duration: 0.3, x: pos.x, y: pos.y });
    }

    // Hover animation for magnetic wraps
    document.querySelectorAll<HTMLElement>(".tp-magnetic-wrap").forEach((wrap) => {
        const item = wrap.querySelector<HTMLElement>(".tp-magnetic-item");

        wrap.addEventListener("mousemove", (e: MouseEvent) => {
            parallaxCursor(e, wrap, 2);
            parallaxIt(e, wrap, item, 25);
        });

        wrap.addEventListener("mouseenter", () => {
            gsap.to(ball, { duration: 0.3, scale: 2, borderWidth: 1, opacity: ballOpacity });
            active = true;
        });

        wrap.addEventListener("mouseleave", () => {
            gsap.to(ball, { duration: 0.3, scale: ballScale, borderWidth: ballBorderWidth, opacity: ballOpacity });
            if (item) gsap.to(item, { duration: 0.3, x: 0, y: 0, clearProps: "all" });
            active = false;
        });
    });

    // Cursor view on hover (data-cursor)
    document.querySelectorAll<HTMLElement>("[data-cursor]").forEach((el) => {
        el.addEventListener("mouseenter", () => {
            if (!ball.querySelector(".ball-view")) {
                ball.classList.add("with-blur");
                const viewDiv = document.createElement("div");
                viewDiv.classList.add("ball-view");
                const text = el.getAttribute("data-cursor");
                if (text) viewDiv.innerHTML = text;
                ball.appendChild(viewDiv);

                gsap.to(ball, {
                    duration: 0.3,
                    yPercent: -75,
                    width: 110,
                    height: 110,
                    opacity: 1,
                    borderWidth: 0,
                    zIndex: 1,
                    backdropFilter: "blur(14px)",
                    backgroundColor: "#fff",
                    boxShadow: "0px 1px 3px rgba(18, 20, 32, 0.14)",
                });
                gsap.to(viewDiv, { duration: 0.3, scale: 1, autoAlpha: 1 });
            }
        });

        el.addEventListener("mouseleave", () => {
            gsap.to(ball, {
                duration: 0.3,
                yPercent: -50,
                width: ballWidth,
                height: ballHeight,
                opacity: ballOpacity,
                borderWidth: ballBorderWidth,
                backgroundColor: "#000",
            });
            const view = ball.querySelector<HTMLElement>(".ball-view");
            if (view) {
                gsap.to(view, {
                    duration: 0.3,
                    scale: 0,
                    autoAlpha: 0,
                    clearProps: "all",
                    onComplete: () => view.remove(),
                });
            }
        });

        el.classList.add("not-hide-cursor");
    });

    // Hide cursor on links & buttons
    document.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>("a, button").forEach((el) => {
        if (!el.classList.contains("cursor-hide")) {
            el.addEventListener("mouseenter", () => {
                gsap.to(ball, { duration: 0.3, scale: 0, opacity: 0 });
            });
            el.addEventListener("mouseleave", () => {
                gsap.to(ball, { duration: 0.3, scale: ballScale, opacity: ballOpacity });
            });
        }
    });

    // Hide cursor on click (normal links only)
    document.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
        const href = link.getAttribute("href") ?? "";
        const isClickable =
            !link.classList.contains("cursor-hide") &&
            !link.classList.contains("lg-trigger") &&
            !link.closest(".tp-btn-disabled") &&
            link.target !== "_blank" &&
            !href.startsWith("#") &&
            !href.startsWith("mailto") &&
            !href.startsWith("tel");

        if (isClickable) {
            link.addEventListener("click", () => {
                gsap.to(ball, { duration: 0.3, scale: 1.3, autoAlpha: 0 });
            });
        }
    });

    // Show/hide on document enter/leave
    const magicCursor = document.getElementById("magic-cursor") as HTMLElement | null;
    if (magicCursor) {
        document.addEventListener("mouseleave", () => {
            gsap.to(magicCursor, { duration: 0.3, autoAlpha: 0 });
        });
        document.addEventListener("mouseenter", () => {
            gsap.to(magicCursor, { duration: 0.3, autoAlpha: 1 });
        });
        document.addEventListener("mousemove", () => {
            gsap.to(magicCursor, { duration: 0.3, autoAlpha: 1 });
        });
    }
}
