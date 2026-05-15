document.addEventListener('DOMContentLoaded', () => {
    // MOBILE REDIRECT: Ensure mobile users get the dedicated experience
    if (window.innerWidth <= 768) {
        window.location.replace('landing-mobile.html');
        return;
    }

    // --- CORE PERFECTION: WAIT FOR FONTS ---
    // This prevents the "straight text" jump by ensuring layout is calculated with correct fonts
    if (document.fonts) {
        document.fonts.ready.then(() => {
            initializeAllSystems();
        });
    } else {
        initializeAllSystems();
    }

    // --- API CONFIGURATION ---
    // REPLACE THIS WITH YOUR DEPLOYED APPS SCRIPT URL
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbym38ItogN-uwuFv3_jBhmi128a649Y5hUqx1oF4BcHI6ZdjOEdcJZ22ISz2RUxV89sNg/exec';

    function initializeAllSystems() {
    // 0. Initialize Splitting immediately for text effects
    if (typeof Splitting !== 'undefined') Splitting();

    const mainGrid = document.querySelector('.main-grid');
    const satellites = document.querySelectorAll('.box:not(.powered-by-box)');
    
    // Update Footer Year
    if(document.getElementById('footer-year')) document.getElementById('footer-year').innerText = new Date().getFullYear();
    
    if (mainGrid) {
        // Mouse parallax disabled to stop "shaking" as requested

        // Independent "Breathing" for satellites
        satellites.forEach((sat, i) => {
            gsap.to(sat, {
                y: "random(-15, 15)",
                x: "random(-15, 15)",
                duration: "random(3, 5)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: i * 0.5
            });
        });
    }

    // Core Optimization: Sequential high-performance reveal
    function revealHeroSection() {
        const tl = gsap.timeline({
            defaults: { ease: "power4.out", duration: 1.5 }
        });

        tl.to(".info-section", { autoAlpha: 1, duration: 0.5 })
          .from(".portal-scroll-content", { y: -50, opacity: 0 }, 0.2)
          .from(".welcome-tag", { opacity: 0, y: 20, duration: 1.2 }, "-=0.5") /* Simpler entrance for "WELCOME TO" */
          .from(".text-overlap .char", { 
              opacity: 0,
              y: 100,
              rotateX: -90,
              stagger: 0.02,
              filter: "blur(15px)",
              duration: 1.2,
              ease: "back.out(1.7)"
          }, "-=1")
          .from(".hero-mission-statement", { opacity: 0, y: 20 }, "-=0.8")
          .from(".hero-action-stack", { 
              opacity: 0, 
              y: 40, 
              stagger: 0.2 
          }, "-=0.6");
    }

    // --- HUD 3D NAVIGATION LOGIC ---
    const navItems = document.querySelectorAll('.nav-item');
    const carousel = document.querySelector('.hud-carousel');
    let activeIndex = Math.floor(navItems.length / 2); // Start at the middle item (index 3)

    const isMobile = () => window.innerWidth <= 768;

    const staggerSubMenu = (item) => {
        const spans = item.querySelectorAll('.sub-menu span');
        if (spans.length > 0) {
            gsap.fromTo(spans, 
                { opacity: 0, x: -5, scale: 0.9 }, 
                { opacity: 1, x: 0, scale: 1, stagger: 0.08, duration: 0.5, ease: "power2.out", overwrite: true }
            );
        }
    };

    const updateNav = () => {
        if (isMobile()) {
            // Disable 3D carousel logic on mobile to prevent layout issues
            gsap.set(carousel, { x: 0 });
            navItems.forEach(item => {
                gsap.set(item, { opacity: 1, scale: 1, filter: "none", x: 0 });
            });
            return;
        }
        const activeItem = navItems[activeIndex];
        const offset = activeItem.offsetLeft + (activeItem.offsetWidth / 2);
        const containerCenter = carousel.offsetWidth / 2;

        // Slide the whole track to center the active item
        gsap.to(carousel, {
            x: -offset + containerCenter,
            duration: 0.8,
            ease: "power4.out"
        });

        navItems.forEach((item, i) => {
            const isActive = i === activeIndex;

            gsap.to(item, {
                opacity: isActive ? 1 : 0.8,
                scale: isActive ? 1.1 : 0.95,
                filter: "none",
                duration: 0.8,
                ease: "power4.out",
                overwrite: true
            });

            if (isActive && !item.classList.contains('active')) {
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                staggerSubMenu(item);
            }
        });
    };

    // Initial positioning
    updateNav();

    // Navigation controls
    document.querySelector('.nav-arrow.next').addEventListener('click', () => {
        // Infinite Loop Logic
        if (activeIndex < navItems.length - 1) {
            activeIndex++;
        } else {
            activeIndex = 0;
        }
        updateNav();
    });

    document.querySelector('.nav-arrow.prev').addEventListener('click', () => {
        // Infinite Loop Logic
        if (activeIndex > 0) {
            activeIndex--;
        } else {
            activeIndex = navItems.length - 1;
        }
        updateNav();
    });

    // --- HAMBURGER TRANSITION LOGIC ---
    const navContainer = document.querySelector('.hud-nav-container');
    const hamburger = document.querySelector('.hamburger-toggle');

    const toggleHamburgerMode = (isHamburger) => {
        const tl = gsap.timeline();
        if (isHamburger) {
            // Deconstruct effect: Items fly inward and fade
            tl.to(navItems, { 
                z: -1000, 
                opacity: 0, 
                scale: 0.5, 
                stagger: 0.02, 
                duration: 0.6, 
                ease: "expo.in" 
            })
            .to(".nav-controls", { opacity: 0, y: 20, duration: 0.4 }, "-=0.4")
            .set(".hud-carousel", { pointerEvents: 'none' })
            .to(hamburger, { 
                opacity: 1, 
                scale: 1, 
                rotate: 180, 
                duration: 0.8, 
                ease: "back.out(1.7)", 
                pointerEvents: 'auto' 
            }, "-=0.2");
        } else {
            // Reconstruct effect: Items explode back into 3D space
            tl.to(hamburger, { opacity: 0, scale: 0.5, rotate: 0, duration: 0.4, pointerEvents: 'none' })
              .set(".hud-carousel", { pointerEvents: 'auto' })
              .to(".nav-controls", { opacity: 0.5, y: 0, duration: 0.6 })
              .add(() => updateNav(), "-=0.4"); // Triggers the GSAP updateNav for the "explode" positions
            
            gsap.from(navItems, {
                z: -1000, opacity: 0, scale: 0, stagger: 0.05, duration: 1.2, ease: "elastic.out(1, 0.75)"
            });
        }
    };

    // Double click any item to collapse
    navItems.forEach(item => {
        item.addEventListener('dblclick', () => toggleHamburgerMode(true));
    });

    // --- MOBILE INFINITE SCROLL SETUP ---
    if (isMobile()) {
        const itemsToClone = Array.from(carousel.querySelectorAll('.nav-item'));
        // Triple cloning for seamless bi-directional loop
        itemsToClone.forEach(item => {
            carousel.appendChild(item.cloneNode(true));
            carousel.insertBefore(item.cloneNode(true), carousel.firstChild);
        });

        carousel.addEventListener('scroll', () => {
            const sectionWidth = carousel.scrollWidth / 3;
            // If we scroll too far left
            if (carousel.scrollLeft < 5) {
                carousel.scrollLeft += sectionWidth;
            } 
            // If we scroll too far right
            else if (carousel.scrollLeft > sectionWidth * 2 - 5) {
                carousel.scrollLeft -= sectionWidth;
            }
        });

        // Center the scroll position on the middle set
        requestAnimationFrame(() => {
            carousel.scrollLeft = carousel.scrollWidth / 3;
        });
    }

    // Click hamburger to restore
    hamburger.addEventListener('click', () => {
        if (isMobile()) {
            const navContainer = document.querySelector('.hud-nav-container');
            const isOpen = navContainer.classList.toggle('nav-open');
            const bars = hamburger.querySelectorAll('.bar');
            const allMobileItems = carousel.querySelectorAll('.nav-item');

            if (isOpen) {
                // Animate bars to X
                gsap.to(bars[0], { rotation: 45, y: 11, duration: 0.3 });
                gsap.to(bars[1], { opacity: 0, duration: 0.3 });
                gsap.to(bars[2], { rotation: -45, y: -11, duration: 0.3 });
                
                // Stagger items in horizontally
                gsap.fromTo(allMobileItems, 
                    { opacity: 0, x: -20 }, 
                    { opacity: 1, x: 0, stagger: 0.03, duration: 0.4, ease: "power2.out", delay: 0.1 }
                );
            } else {
                // Animate bars back to hamburger
                gsap.to(bars, { rotation: 0, y: 0, opacity: 1, duration: 0.3 });
                
                // Quickly hide items
                gsap.to(allMobileItems, { opacity: 0, duration: 0.2 });
            }
        } else {
            toggleHamburgerMode(false);
        }
    });

    // Trigger stagger on Hover for active items
    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (item.classList.contains('active')) {
                staggerSubMenu(item);
            }
        });
    });

    // --- NAV LINKING LOGIC ---
    const gamesLink = document.getElementById('nav-link-games');
    if (gamesLink) {
        gamesLink.addEventListener('click', (e) => {
            document.querySelector('.upcoming-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- Background Video Logic ---
    const videoPlayer = document.getElementById('bg-video');
    const videoSource = document.getElementById('video-source');
    
    if (videoPlayer) {
        const videoPool = [
            'https://image2url.com/r2/default/videos/1775845726029-9aae2e02-3cba-403f-b6c8-cc36f08ba99a.mp4',
            'https://image2url.com/r2/default/videos/1775855750685-eb6971fd-1e0d-4037-8931-90634cefbb2d.mp4',
            'https://image2url.com/r2/default/videos/1775931286802-26fe7c97-cfa4-4e85-bcab-c1b0b11c215a.mp4'
        ];

        // Get the video used in the intro
        const introVideo = sessionStorage.getItem('smokex_selected_video');
        
        // Pick a NEW video for the landing page that ISN'T the intro video
        const otherVideos = videoPool.filter(v => v !== introVideo);
        let selectedVideo = otherVideos.length > 0 
            ? otherVideos[Math.floor(Math.random() * otherVideos.length)]
            : videoPool[0];

        // Update session storage so the landing page "playlist" starts from this new video
        sessionStorage.setItem('smokex_selected_video', selectedVideo);

        // Force streaming attributes
        videoPlayer.muted = true;
        videoPlayer.defaultMuted = true;
        videoPlayer.loop = false; // Disable loop to allow 'ended' event to fire
        videoPlayer.setAttribute('playsinline', '');
        videoPlayer.setAttribute('webkit-playsinline', '');
        
        // Robust Playback function
        const playVideo = (url) => {
            if (videoSource) videoSource.removeAttribute('src');
            videoPlayer.src = url;
            videoPlayer.load();
            
            const forcePlay = () => {
                const playPromise = videoPlayer.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => setTimeout(forcePlay, 500));
                }
            };
            forcePlay();
        };

        // Fade the video in smoothly once it actually starts moving
        videoPlayer.onplaying = () => {
            videoPlayer.style.opacity = '0.35';
        };

        // Anti-Pause Safety Net: Ensure the "stream" doesn't stop
        videoPlayer.onpause = (e) => {
            if (!videoPlayer.ended) {
                videoPlayer.play().catch(() => {});
            }
        };

        // Handle video progression
        videoPlayer.addEventListener('ended', () => {
            let currentIndex = videoPool.indexOf(selectedVideo);
            let nextIndex = (currentIndex + 1) % videoPool.length;
            selectedVideo = videoPool[nextIndex];
            
            // Save progress so refresh continues from the new video
            sessionStorage.setItem('smokex_selected_video', selectedVideo);
            playVideo(selectedVideo);
        });
        
        playVideo(selectedVideo);
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.normalizeScroll({ 
        allowNestedScroll: true, 
        momentum: false,
        type: "touch,wheel,pointer",
        smoothing: 0.05
    });
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Core Stability: Fixed Hero transition logic
    // Using fromTo ensures the section always returns to full visibility on scroll up
    gsap.fromTo(".video-container, .info-section, .hud-nav-container", 
        { autoAlpha: 1, scale: 1 },
        {
        scrollTrigger: {
            trigger: ".dark-section",
            start: "top bottom", 
            end: "top top",     
            scrub: true,
            onLeave: () => gsap.set(".info-section, .hud-nav-container", { pointerEvents: "none" }),
            onEnterBack: () => gsap.set(".info-section, .hud-nav-container", { pointerEvents: "auto" })
        },
        autoAlpha: 0,
        scale: 0.9,
        ease: "none"
    });

    // Advanced Batch Reveal for all White Sections (2 & 4)
    gsap.utils.toArray(".dark-section").forEach(section => {
        gsap.from(section.querySelectorAll(".story-container, .video-embed-container"), {
            scrollTrigger: {
                trigger: section,
                start: "top 70%",
            },
            y: 50,
            opacity: 0,
            stagger: 0.15,
            duration: 1,
            ease: "power3.out"
        });

        // High-Performance Parallax using QuickSetter
        const decoElements = section.querySelectorAll('.white-section-deco > div, .deco-ghost-seal');
        section.addEventListener('mousemove', (e) => {
            const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
            const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;
            decoElements.forEach((el, i) => {
                const depth = (i + 1) * 20;
                gsap.to(el, { x: xPercent * depth, y: yPercent * depth, duration: 1, ease: "power2.out" });
            });
        });
    });

    // --- PARTNER INTERACTION LOGIC ---
    const partnerCircles = document.querySelectorAll('.partner-circle');
    const partnerDesc = document.querySelector('.partner-desc-display');
    const defaultPartnerText = "Hover over a partner to learn more about our strategic alliances.";
    const mobilePartnerText = "Tap a partner to learn more about our strategic alliances.";

    if (isMobile()) partnerDesc.innerText = mobilePartnerText;

    partnerCircles.forEach(circle => {
        const showInfo = () => {
            const text = circle.getAttribute('data-description');
            gsap.to(partnerDesc, {
                opacity: 0,
                y: 10,
                duration: 0.2,
                onComplete: () => {
                    partnerDesc.innerText = text;
                    partnerDesc.style.color = "var(--gold)";
                    if (!isMobile()) partnerDesc.style.borderLeft = "1px solid var(--gold)";
                    gsap.to(partnerDesc, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
                }
            });
        };

        const hideInfo = () => {
            gsap.to(partnerDesc, { opacity: 0.6, y: 0, duration: 0.4, onStart: () => {
                partnerDesc.innerText = isMobile() ? mobilePartnerText : defaultPartnerText;
                partnerDesc.style.color = "rgba(255, 255, 255, 0.6)";
                partnerDesc.style.borderLeft = "1px solid transparent";
            }});
        };

        if (isMobile()) {
            circle.addEventListener('click', (e) => {
                e.stopPropagation();
                showInfo();
            });
        } else {
            circle.addEventListener('mouseenter', showInfo);
            circle.addEventListener('mouseleave', hideInfo);
        }
    });

    if (isMobile()) {
        document.addEventListener('click', () => {
            gsap.to(partnerDesc, { opacity: 0.6, y: 0, duration: 0.4, onStart: () => {
                partnerDesc.innerText = mobilePartnerText;
                partnerDesc.style.color = "rgba(255, 255, 255, 0.6)";
                partnerDesc.style.borderLeft = "1px solid transparent";
            }});
        });
    }

    // --- AUTH MODAL SYSTEM ---
    const authOverlay = document.getElementById('authOverlay');
    const loginTriggers = document.querySelectorAll('.login-btn');
    const regTriggers = document.querySelectorAll('.signup-btn');
    const closeAuth = document.querySelector('.close-auth');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    const openAuth = (targetForm = 'login-form') => {
        const formParam = targetForm === 'register-form' ? 'signup' : 'login';
        if (isMobile()) {
            window.location.href = `auth-mobile.html?form=${formParam}`;
        } else {
            window.location.href = `auth.html?form=${formParam}`;
        }
    };

    const closeAuthModal = () => {
        gsap.to(authOverlay, { autoAlpha: 0, duration: 0.4, ease: "power4.in" });
    };

    const switchTab = (formId) => {
        authTabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-target') === formId);
        });
        authForms.forEach(form => {
            form.classList.toggle('active', form.id === formId);
        });
    };

    loginTriggers.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuth('login-form');
    }));
    regTriggers.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuth('register-form');
    }));
    closeAuth.addEventListener('click', closeAuthModal);

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.getAttribute('data-target')));
    });

    // --- ADVANCED AUTH LOGIC ---
    const forgotLink = document.getElementById('forgot-password-link');
    const backToLogin = document.querySelectorAll('.back-to-login');
    
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('forgot-form');
    });

    backToLogin.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('login-form');
    }));

    const showMessage = (msg, isError = false, duration = 5000) => {
        const msgContainer = document.getElementById('auth-message-container');
        const msgText = document.getElementById('auth-message-text');

        if (!msgContainer || !msgText) {
            console.error("Message container or text element not found.");
            return; // Fail silently or log
        }

        msgText.innerText = msg;
        msgContainer.classList.remove('error', 'success');
        msgContainer.classList.add(isError ? 'error' : 'success');
        msgContainer.classList.add('show');

        // Automatically hide the message after 'duration'
        setTimeout(() => {
            msgContainer.classList.remove('show');
        }, duration);
    };

    const setLoading = (form, isLoading) => {
        const btn = form.querySelector('button[type="submit"]');
        if (isLoading) {
            btn.classList.add('loading');
        } else {
            btn.classList.remove('loading');
        }
    };

    const handleAuthRequest = async (data) => {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error("Auth Failure:", error);
            return { result: 'error', message: 'Connection to Arena failed.' };
        }
    };

    // Login Submission
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(e.target, true);
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-pass').value;
        
        const res = await handleAuthRequest({ action: 'login', email, password });
        if (res.result === 'success') {
            sessionStorage.setItem('username', res.username);
            window.location.href = 'dashboard.html'; // Or wherever users go
        } else {
            showMessage(res.message, true);
        }
        setLoading(e.target, false);
    });

    // Signup Submission (Multi-stage)
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(e.target, true);
        const username = document.getElementById('reg-user').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-pass').value;
        const otp = document.getElementById('reg-otp').value;
        
        const payload = { action: 'signup', username, email, password };
        if (otp) payload.otp = otp;

        const res = await handleAuthRequest(payload);
        
        if (res.result === 'otp_sent') {
            document.getElementById('reg-otp-group').style.display = 'block';
            document.getElementById('reg-submit-btn').innerText = 'VERIFY & JOIN';
            showMessage(res.message);
        } else if (res.result === 'success') {
            showMessage('Welcome to the Elite, ' + username);
            switchTab('login-form');
        } else if (res.code === 'EMAIL_EXISTS') {
            if (confirm(res.message + " Would you like to reset your password?")) {
                document.getElementById('forgot-email').value = email;
                switchTab('forgot-form');
            }
        } else {
            showMessage(res.message, true);
        }
        setLoading(e.target, false);
    });

    // Forgot Password Submission
    document.getElementById('forgot-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(e.target, true);
        const email = document.getElementById('forgot-email').value;
        const res = await handleAuthRequest({ action: 'forgotPassword', email });
        
        setLoading(e.target, false);
        if (res.result === 'otp_sent') {
            showMessage(res.message);
            switchTab('reset-form');
        } else {
            showMessage(res.message, true);
        }
    });

    // Reset Password Submission
    document.getElementById('reset-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(e.target, true);
        const email = document.getElementById('forgot-email').value;
        const otp = document.getElementById('reset-otp').value;
        const newPassword = document.getElementById('reset-new-pass').value;
        
        const res = await handleAuthRequest({ 
            action: 'resetPassword', 
            email, 
            otp, 
            newPassword 
        });
        
        setLoading(e.target, false);
        if (res.result === 'success') {
            showMessage(res.message);
            switchTab('login-form');
            e.target.reset(); // Clear fields
        } else {
            showMessage(res.message, true);
        }
    });

    // Close on overlay click
    authOverlay.addEventListener('click', (e) => {
        if (e.target === authOverlay) closeAuthModal();
    });

    // Escape key handling
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAuthModal();
    });

    // Reveal Footer with Premium Animation
    gsap.from(".elite-footer .story-container > *, .elite-footer .footer-brand, .elite-footer .footer-copyright", {
        scrollTrigger: {
            trigger: ".elite-footer",
            start: "top bottom",
        },
        y: 30,
        opacity: 0,
        stagger: 0.2,
        duration: 1.2,
        ease: "power4.out"
    });

    gsap.to(".header-main-title", {
        scrollTrigger: {
            trigger: ".upcoming-section",
            start: "top 60%",
            toggleActions: "play none none reverse"
        },
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power4.out"
    });

    gsap.from(".header-line", {
        scrollTrigger: { trigger: ".upcoming-section", start: "top 40%", toggleActions: "play none none reverse" },
        scaleX: 0,
        duration: 1.5,
        ease: "expo.out"
    });

    gsap.set(".upcoming-section", { opacity: 0, scale: 1.1 });
    gsap.to(".upcoming-section", {
        scrollTrigger: {
            trigger: ".upcoming-section",
            start: "top 80%",
            end: "top top",
            scrub: 1,
        },
        opacity: 1,
        scale: 1,
        ease: "expo.out"
    });

    const gameData = [
        {
            place: 'COMPETITIVE FPS',
            title: 'FREEFIRE', title2: '',
            description: 'Free Fire is a fast-paced, mobile-first battle royale that prioritizes accessibility and quick action over the slower, more tactical pace seen in some of its competitors. Developed by 111dots Studio and published by Garena, it has become a massive global phenomenon, particularly in regions like Southeast Asia, Latin America, and India.',
            image: 'https://image2url.com/r2/default/files/1775911818740-954c6c76-e294-471c-8709-22a922696438.jpg',
            bgImage: 'images/img7.jpg'
        },
        {
            place: 'SPORT',
            title: 'FIFA MOBILE', title2: '',
            description: 'FIFA Mobile has recently evolved into EA Sports FC Mobile, following the major rebranding of the entire franchise. While the name has changed, it remains the most comprehensive football simulation on mobile, focusing on team building, live events, and competitive multiplayer.',
            image: 'images/img9.jpg',
            bgImage: 'images/img9.jpg'
        },
        {
            place: 'SPORT',
            title: 'E-FOOTBALL', title2: '',
            description: 'eFootball Mobile is a dedicated realistic football simulator that prioritizes physics, player movement, and tactical depth over the "card-collecting" arcade feel of its competitors.While other games focus on flashy menus and fast-paced mini-games, eFootball is built on a console-grade engine designed to mimic the weight and rhythm of a real match.',
            image: 'images/img11.jpg',
            bgImage: 'images/img10.jpg'
        },
    ];

    const initGallery = () => {
        const demo = document.getElementById('demo');
        const upcomingImg = document.getElementById('upcoming-bg-image');
        
        if (!demo) return;

        demo.innerHTML = gameData.map((i, index) => `<div class="gallery-card" id="gallery-card${index}" style="background-image:url(${i.image})"></div>`).join('');
        
        let order = gameData.map((_, i) => i);
        let isAnimating = false;
        let detailsEven = true;
        
        // Dynamic Dimensions for Responsiveness
        const isMobile = window.innerWidth < 768;
        const fWidth = isMobile ? window.innerWidth * 0.65 : 350;
        const fHeight = isMobile ? fWidth * 1.3 : 500;
        const tWidth = isMobile ? 80 : 150;
        const tHeight = isMobile ? 110 : 220;
        const gap = isMobile ? 15 : 30;
        const ease = "sine.inOut";

        const initPositions = () => {
            const h = window.innerHeight, w = window.innerWidth;
            
            // Focal point for the featured card (Right Center)
            const featuredX = isMobile ? (w - fWidth) / 2 : w * 0.62; 
            const featuredY = (h / 2) - (fHeight / 2);
            
            // Starting point for the queue (Far Right Bottom)
            const queueX = w * 0.82;
            const queueY = h - tHeight - 120;

            gsap.set("#pagination", { opacity: 1, visibility: 'visible' });
            
            order.forEach((i, idx) => {
                const isFirst = idx === 0;
                gsap.set(`#gallery-card${i}`, { 
                    x: isFirst ? featuredX : queueX + (idx - 1) * (tWidth + gap), 
                    y: isFirst ? featuredY : queueY, 
                    width: isFirst ? fWidth : tWidth, 
                    height: isFirst ? fHeight : tHeight, 
                    zIndex: isFirst ? 40 : 30 - idx,
                    borderRadius: 16,
                    opacity: idx > 3 ? 0 : 1
                });
                gsap.set(`#gallery-content-${i}`, { opacity: 0 });
            });

            // Clean start: Only show the 'even' details box and hide the 'odd' one
            gsap.set("#details-odd", { opacity: 0, visibility: 'hidden', y: 20 });
            gsap.set("#details-even", { opacity: 1, visibility: 'visible', y: 0 });

            // Initial Background Image
            if (upcomingImg) {
                upcomingImg.src = gameData[order[0]].bgImage;
                gsap.set(upcomingImg, { opacity: 1 }); 
            }

            updateDetailsContent(order[0], "#details-even");
            
            // REVEAL EVERYTHING ONLY AFTER POSITIONING IS CALCULATED
            gsap.to(".gallery-card, #pagination", { autoAlpha: 1, duration: 0.8, stagger: 0.05, ease: "power2.out" });
        };

        const updateDetailsContent = (index, containerId) => {
            const data = gameData[index];
            const container = document.querySelector(containerId);
            container.querySelector('.place-box .text').innerText = data.place;
            container.querySelector('.title-1').innerText = data.title;
            container.querySelector('.title-2').innerText = data.title2;
            container.querySelector('.desc span').innerText = data.description;

            // Trigger the "Fill" animation immediately on the new text
            const span = container.querySelector('.desc span');
            gsap.set(span, { backgroundSize: "0% 200%" });
            gsap.to(span, { 
                backgroundSize: "200% 200%", 
                duration: 2, 
                ease: "power2.inOut",
                delay: 0.2 
            });
        };

        const step = (direction = 'next') => {
            if (isAnimating) return;
            isAnimating = true;

            if (direction === 'next') {
                order.push(order.shift());
            } else {
                order.unshift(order.pop());
            }

            detailsEven = !detailsEven;
            const activeDetails = detailsEven ? "#details-even" : "#details-odd";
            const inactiveDetails = detailsEven ? "#details-odd" : "#details-even";

            // Update content before showing
            updateDetailsContent(order[0], activeDetails);

            gsap.set(activeDetails, { zIndex: 25, opacity: 0, visibility: 'visible', y: 20 });
            gsap.to(activeDetails, { opacity: 1, y: 0, duration: 0.6, ease: "power4.out" });
            gsap.to(inactiveDetails, { opacity: 0, duration: 0.4, onComplete: () => gsap.set(inactiveDetails, { visibility: 'hidden' }) });

            const h = window.innerHeight, w = window.innerWidth;
            const featuredX = isMobile ? (w - fWidth) / 2 : w * 0.62, featuredY = (h / 2) - (fHeight / 2);
            const queueX = w * 0.82, queueY = h - tHeight - 120;

            order.forEach((i, idx) => {
                const isFirst = idx === 0;
                gsap.to(`#gallery-card${i}`, { 
                    x: isFirst ? featuredX : queueX + (idx - 1) * (tWidth + gap), 
                    y: isFirst ? featuredY : queueY,
                    width: isFirst ? fWidth : tWidth,
                    height: isFirst ? fHeight : tHeight,
                    zIndex: isFirst ? 40 : 30 - idx,
                    opacity: idx > 3 ? 0 : 1,
                    duration: 1.4, 
                    ease: "expo.inOut",
                    overwrite: 'auto',
                    onComplete: isFirst ? () => { isAnimating = false; } : null
                });
            });
            
            // Dynamic Background Image Transition
            if (upcomingImg) {
                const tl = gsap.timeline();
                tl.to(upcomingImg, { 
                    opacity: 0, filter: "blur(20px) brightness(2)", 
                    duration: 0.3, 
                    overwrite: true, 
                    onComplete: () => {
                        if (upcomingImg) upcomingImg.src = gameData[order[0]].bgImage;
                    tl.to(upcomingImg, { opacity: 1, filter: "blur(0px) brightness(1)", duration: 0.6 });
                }});
            }
        };

        initPositions();

        document.querySelector('.arrow-right').addEventListener('click', () => step('next'));
        document.querySelector('.arrow-left').addEventListener('click', () => step('prev'));
    };

function initTournamentPopup() {
    // Core Security: Check if already shown this session or if user is logged in
    if (localStorage.getItem('admin_session') === 'active' || sessionStorage.getItem('tournament_intel_dismissed')) return;
    
    setTimeout(() => {
        const popup = document.createElement('div');
        popup.className = 'hud-popup-center';
        popup.innerHTML = `
            <div class="hud-popup-overlay"></div>
            <div class="hud-popup-content">
                <div class="hud-header">
                    <div class="hud-tag">UPCOMING TOURNAMENT</div>
                    <div class="hud-tag" style="opacity: 0.5;">STATUS: OPEN</div>
                </div>
                <h3 class="hud-title">FREE FIRE CHAMPIONSHIP</h3>
                <div class="hud-prizes">
                    <div class="hud-prize-row"><span class="pos">1ST PLACE</span> <span class="val">$90.00 USD</span></div>
                    <div class="hud-prize-row"><span class="pos">2ND PLACE</span> <span class="val">$30.00 USD</span></div>
                    <div class="hud-prize-row"><span class="pos">3RD PLACE</span> <span class="val">300 DIAMONDS CARRY FIRST VOUCHER</span></div>
                </div>
                <div class="hud-actions">
                    <a href="auth.html" class="hud-btn-primary">REGISTER NOW</a>
                    <button class="hud-btn-secondary close-hud">MAYBE LATER</button>
                </div>
                <div class="hud-footer-deco">LOGIN TO PARTICIPATE</div>
            </div>
        `;
        document.body.appendChild(popup);

        // Advanced Reveal Animation
        const tl = gsap.timeline({ defaults: { ease: "expo.out" }});
        tl.fromTo(popup.querySelector('.hud-popup-overlay'), { opacity: 0 }, { opacity: 1, duration: 1 })
          .fromTo(popup.querySelector('.hud-popup-content'), 
            { scale: 0.8, opacity: 0, filter: "blur(20px)" }, 
            { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.2 }, "-=0.5")
          .from(".hud-prize-row", { x: -30, opacity: 0, stagger: 0.1, duration: 0.8 }, "-=0.6");

        const closePopup = () => {
            sessionStorage.setItem('tournament_intel_dismissed', 'true');
            gsap.to(popup, { 
                opacity: 0, 
                scale: 1.1, 
                filter: "blur(10px)", 
                duration: 0.6, 
                onComplete: () => popup.remove() 
            });
        };

        popup.querySelector('.close-hud').onclick = closePopup;
        popup.querySelector('.hud-popup-overlay').onclick = closePopup;
    }, 120000);
}

function initYouTubeSwitcher() {
    const mainIframe = document.querySelector('.video-embed-container:not(.perks-grid *) iframe');
    const thumbnails = document.querySelectorAll('.perks-grid .video-embed-container');

    if (!mainIframe || thumbnails.length === 0) return;

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const thumbIframe = thumb.querySelector('iframe');
            if (!thumbIframe) return;

            // Extract YouTube ID from src
            const extractId = (url) => {
                const match = url.match(/\/embed\/([^/?]+)/);
                return match ? match[1] : null;
            };

            const videoId = extractId(thumbIframe.src);
            const currentId = extractId(mainIframe.src);

            if (videoId && videoId !== currentId) {
                gsap.to(mainIframe, {
                    opacity: 0,
                    duration: 0.4,
                    onComplete: () => {
                        mainIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
                        gsap.to(mainIframe, { opacity: 1, duration: 0.6 });
                        thumbnails.forEach(t => t.classList.remove('active-thumb'));
                        thumb.classList.add('active-thumb');
                    }
                });
            }
        });
    });
}

    initGallery();
    revealHeroSection(); // Finally call reveal now that everything is ready
    initTournamentPopup();
    initYouTubeSwitcher();
    }
});