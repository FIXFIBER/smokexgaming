document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(TextPlugin);

    const openNav = document.getElementById('openNav');
    const closeNav = document.getElementById('closeNav');
    const navOverlay = document.getElementById('navOverlay');

    openNav.addEventListener('click', () => navOverlay.classList.add('active'));
    closeNav.addEventListener('click', () => navOverlay.classList.remove('active'));
    
    // Close nav when a link is clicked
    navOverlay.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navOverlay.classList.remove('active')));

    // Toggle nested groups
    const groups = document.querySelectorAll('.nav-group');
    groups.forEach(group => {
        group.querySelector('.group-trigger').addEventListener('click', () => group.classList.toggle('open'));
    });

    // --- HERO ENTRANCE ANIMATION ---
    const tl = gsap.timeline({ defaults: { ease: "power4.out" }});
    tl.fromTo(".welcome-tag", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 })
      .fromTo(".nebula-title", { opacity: 0, scale: 0.9, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.5 }, "-=0.6")
      .fromTo(".nebula-subtitle", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1 }, "-=1")
      .add(() => initMeAvatarAnimation(), "-=0.5");

    function initMeAvatarAnimation() {
        const meTl = gsap.timeline({
            onComplete: addMouseEvent,
            delay: 0.2
        });

        gsap.set(".bg", { transformOrigin: "50% 50%" });
        gsap.set(".ear-right", { transformOrigin: "0% 50%" });
        gsap.set(".ear-left", { transformOrigin: "100% 50%" });
        gsap.set(".me", { opacity: 1 });

        meTl.from(".me", {
            duration: 1,
            yPercent: 100,
            ease: "elastic.out(0.5, 0.4)"
        }, 0.5)
        .from(".head , .hair , .shadow", {
            duration: 0.9,
            yPercent: 20,
            ease: "elastic.out(0.58, 0.25)"
        }, 0.6)
        .from(".ear-right", {
            duration: 1,
            rotate: 40,
            yPercent: 10,
            ease: "elastic.out(0.5, 0.2)"
        }, 0.7)
        .from(".ear-left", {
            duration: 1,
            rotate: -40,
            yPercent: 10,
            ease: "elastic.out(0.5, 0.2)"
        }, 0.7)
        .to(".glasses", {
            duration: 1,
            keyframes: [{ yPercent: -10 }, { yPercent: -0 }],
            ease: "elastic.out(0.5, 0.2)"
        }, 0.75)
        .from(".eyebrow-right , .eyebrow-left", {
            duration: 1,
            yPercent: 300,
            ease: "elastic.out(0.5, 0.2)"
        }, 0.7)
        .to(".eye-right , .eye-left", { duration: 0.01, opacity: 1 }, 0.85)
        .to(".eye-right-2 , .eye-left-2", { duration: 0.01, opacity: 0 }, 0.85);

        const blink = gsap.timeline({ repeat: -1, repeatDelay: 5 });
        blink.to(".eye-right, .eye-left", { duration: 0.01, opacity: 0 }, 0)
             .to(".eye-right-2, .eye-left-2", { duration: 0.01, opacity: 1 }, 0)
             .to(".eye-right, .eye-left", { duration: 0.01, opacity: 1 }, 0.15)
             .to(".eye-right-2 , .eye-left-2", { duration: 0.01, opacity: 0 }, 0.15);

        let xPosition, yPosition, height = window.innerHeight, width = window.innerWidth;
        let storedXPosition = 0, storedYPosition = 0;

        const dom = {
            face: document.querySelector(".face"),
            eye: document.querySelectorAll(".eye"),
            innerFace: document.querySelector(".inner-face"),
            hairFront: document.querySelector(".hair-front"),
            hairBack: document.querySelector(".hair-back"),
            shadow: document.querySelectorAll(".shadow"),
            ear: document.querySelectorAll(".ear"),
            eyebrowLeft: document.querySelector(".eyebrow-left"),
            eyebrowRight: document.querySelector(".eyebrow-right")
        };

        function animateFace() {
            if (!xPosition) return;
            if (storedXPosition === xPosition && storedYPosition === yPosition) return;

            let x = (100 * xPosition / width) - 50;
            let y = (100 * yPosition / height) - 50;
            let yHigh = (100 * yPosition / height) - 20;
            let yLow = (100 * yPosition / height) - 80;

            gsap.to(dom.face, { yPercent: yLow / 30, xPercent: x / 30 });
            gsap.to(dom.eye, { yPercent: yHigh / 3, xPercent: x / 2 });
            gsap.to(dom.innerFace, { yPercent: y / 6, xPercent: x / 8 });
            gsap.to(dom.hairFront, { yPercent: yHigh / 15, xPercent: x / 22 });
            gsap.to([dom.hairBack, dom.shadow], { yPercent: (yLow / 20) * -1, xPercent: (x / 20) * -1 });
            gsap.to(dom.ear, { yPercent: (y / 1.5) * -1, xPercent: (x / 10) * -1 });
            gsap.to([dom.eyebrowLeft, dom.eyebrowRight], { yPercent: y * 2.5 });

            storedXPosition = xPosition;
            storedYPosition = yPosition;
        }

        function addMouseEvent() {
            window.addEventListener("mousemove", (e) => {
                xPosition = e.clientX;
                yPosition = e.clientY;
            });
            // Add touch support for mobile interaction
            window.addEventListener("touchmove", (e) => {
                xPosition = e.touches[0].clientX;
                yPosition = e.touches[0].clientY;
            });
            gsap.ticker.add(animateFace);
        }
    }

    // --- VIDEO BACKGROUND STABILITY ---
    const video = document.querySelector('.video-bg');
    if (video) {
        const forcePlay = () => {
            video.play().catch(() => {
                // Fallback for strict mobile autoplay policies
                document.addEventListener('click', forcePlay, { once: true });
            });
        };
        forcePlay();
    }

    // --- NEBULA PARALLAX EFFECT ---
    const nebulaTitle = document.querySelector(".nebula-title");
    if (nebulaTitle) {
        window.addEventListener('mousemove', (e) => {
            const mouseX = e.pageX;
            const mouseY = e.pageY;
            const traX = ((4 * mouseX) / 570) + 40;
            const traY = ((4 * mouseY) / 570) + 50;
            nebulaTitle.style.backgroundPosition = `${traX}% ${traY}%`;
        });
    }
});