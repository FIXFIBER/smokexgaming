const switchCtn = document.querySelector("#switch-cnt");
const switchC1 = document.querySelector("#switch-c1");
const switchC2 = document.querySelector("#switch-c2");
const switchCircle = document.querySelectorAll(".switch__circle");
const switchBtn = document.querySelectorAll(".switch-btn");
const aContainer = document.querySelector("#a-container");
const bContainer = document.querySelector("#b-container");

let isSignIn = true;
let isVerifyingSignUp = false;
let currentResetEmail = "";

// Replace this with your actual Google Apps Script URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbym38ItogN-uwuFv3_jBhmi128a649Y5hUqx1oF4BcHI6ZdjOEdcJZ22ISz2RUxV89sNg/exec";

const changeForm = (instant = false) => {
    if (!instant && gsap.isTweening(switchCtn)) return;
    
    const mainElement = document.querySelector('.main');
    if (!mainElement) return;

    const isMobile = window.innerWidth <= 768;
    const mainWidth = mainElement.offsetWidth;
    const switchWidth = switchCtn.offsetWidth;
    
    if (isMobile) {
        // Simple toggle for mobile to keep it "clear"
        isSignIn = !isSignIn;
        const toHide = isSignIn ? aContainer : bContainer;
        const toShow = isSignIn ? bContainer : aContainer;

        toHide.classList.remove('is-active-form');
        toShow.classList.add('is-active-form');
        gsap.fromTo(toShow, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
        
        toShow.classList.add('is-active-form');
        return;
    }

    const moveDistance = mainWidth - switchWidth;
    const dur = instant ? 0 : 1.1;

    isSignIn = !isSignIn;
    const tl = gsap.timeline({ 
        defaults: { duration: dur, ease: "power4.inOut" },
        onStart: () => {
            // Remove active class from both during transition to prevent double-clicks
            aContainer.classList.remove('is-active-form');
            bContainer.classList.remove('is-active-form');
        }
    });

    // 1. Animate Switch Panel with a slight "stretch" effect
    tl.to(switchCtn, { 
        x: isSignIn ? 0 : moveDistance, 
        scaleX: 1.05, 
        duration: dur / 2 
    }, 0);
    tl.to(switchCtn, { scaleX: 1, duration: dur / 2 }, dur / 2);
    
    // 2. Animate Circles inside Switch for depth
    tl.to(switchCircle, { 
        rotation: isSignIn ? 0 : 270, 
        x: isSignIn ? 0 : 30, 
        duration: dur 
    }, 0);

    // 3. Swap Switch Content (Welcome vs New Member)
    const hiddenContent = switchCtn.querySelector(".switch__container.is-hidden");
    const visibleContent = switchCtn.querySelector(".switch__container:not(.is-hidden)");

    const yMove = isMobile ? 15 : 30;
    tl.to(visibleContent, { autoAlpha: 0, y: isSignIn ? yMove : -yMove, duration: dur * 0.4 }, 0);
    
    tl.set(hiddenContent, { y: isSignIn ? -yMove : yMove }, dur * 0.3);
    tl.to(hiddenContent, { autoAlpha: 1, y: 0, duration: dur * 0.5 }, dur * 0.4);

    tl.call(() => {
        visibleContent.classList.add("is-hidden");
        hiddenContent.classList.remove("is-hidden");
    }, 0.4);

    // 4. Transform Form Containers (Blocking Fix)
    const formShift = isMobile ? 0 : switchWidth; 

    if (isSignIn) {
        tl.to(aContainer, { x: 0, autoAlpha: 0, scale: 0.95, duration: dur }, 0);
        tl.to(bContainer, { x: 0, autoAlpha: 1, scale: 1, duration: dur }, 0);
        tl.call(() => bContainer.classList.add('is-active-form'), null, 0.6);
    } else {
        tl.to(bContainer, { x: -formShift, autoAlpha: 0, scale: 0.95, duration: dur }, 0);
        tl.to(aContainer, { x: -formShift, autoAlpha: 1, scale: 1, duration: dur }, 0);
        tl.call(() => aContainer.classList.add('is-active-form'), null, 0.6);
    }

    // Handle Z-Index swap mid-way through animation
    tl.set(isSignIn ? bContainer : aContainer, { zIndex: 100 }, 0.5);
    tl.set(isSignIn ? aContainer : bContainer, { zIndex: 0 }, 0.5);
};

const showMessage = (msg, isError = false) => {
    const container = document.getElementById('auth-message-container');
    const text = document.getElementById('auth-message-text');
    text.innerText = msg;
    container.classList.remove('error');
    if (isError) container.classList.add('error');
    
    container.classList.add('show');
    setTimeout(() => container.classList.remove('show'), 5000);
};

const setLoading = (btn, isLoading) => {
    if (isLoading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
};

const showResetForm = (targetId) => {
    const forms = [aContainer, bContainer, document.getElementById('c-container'), document.getElementById('d-container')];
    forms.forEach(f => { if(f) f.style.display = 'none'; f.classList.remove('is-active-form'); });
    
    const target = document.getElementById(targetId);
    target.style.display = 'flex';
    target.classList.add('is-active-form');
    
    // Hide the sliding switch when doing password resets for more room
    gsap.to(switchCtn, { autoAlpha: 0, duration: 0.3 });
};

const backToAuth = () => {
    document.getElementById('c-container').style.display = 'none';
    document.getElementById('d-container').style.display = 'none';
    bContainer.style.display = 'flex';
    bContainer.classList.add('is-active-form');
    gsap.to(switchCtn, { autoAlpha: 1, duration: 0.3 });
    if (!isSignIn) changeForm(true);
};

const handleSubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    setLoading(btn, true);

    let payload = {};
    const formId = e.target.id;
    const isSignUpForm = formId === "a-form";

    if (isSignUpForm) {
        payload = {
            action: "signup",
            username: document.querySelector("#up-user").value,
            email: document.querySelector("#up-email").value,
            password: document.querySelector("#up-pass").value,
            otp: isVerifyingSignUp ? document.querySelector("#up-otp").value : null
        };
    } else if (formId === "b-form") {
        payload = {
            action: "login",
            email: document.querySelector("#in-email").value,
            password: document.querySelector("#in-pass").value
        };
    } else if (formId === "forgot-form-auth") {
        currentResetEmail = document.querySelector("#forgot-email-auth").value;
        payload = { action: "forgotPassword", email: currentResetEmail };
    } else if (formId === "reset-form-auth") {
        const newPass = document.querySelector("#reset-new-pass-auth").value;
        const confirmPass = document.querySelector("#reset-confirm-pass-auth").value;

        if (newPass !== confirmPass) {
            setLoading(btn, false);
            showMessage("Passwords do not match!", true);
            return;
        }

        payload = { 
            action: "resetPassword", 
            email: currentResetEmail,
            otp: document.querySelector("#reset-otp-auth").value,
            newPassword: newPass
        };
    }

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (data.result === "otp_sent") {
            if (payload.action === "signup") {
                isVerifyingSignUp = true;
                const tl = gsap.timeline();
                tl.to("#signup-fields", { opacity: 0, scale: 0.9, y: -20, duration: 0.4, ease: "power2.in", display: "none" })
                  .set("#signup-otp-fields", { display: "block", opacity: 0, scale: 1.1 })
                  .to("#signup-otp-fields", { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" });
            } else if (payload.action === "forgotPassword") {
                showResetForm('d-container');
            }
            showMessage(data.message);
        } else if (data.result === "success") {
            if (payload.action === "signup") {
                showMessage("Account verified! Welcome to the Arena.");
                isVerifyingSignUp = false;
                changeForm();
            } else if (payload.action === "resetPassword") {
                showMessage("Password updated! Please sign in.");
                backToAuth();
            } else {
                localStorage.setItem('admin_session', 'active');
                localStorage.setItem('admin_user', data.username);
                // Double check: Ensure we save the email for Dashboard Identity Sync
                if(data.email) localStorage.setItem('admin_email', data.email);
                
                if (data.avatar) localStorage.setItem('admin_avatar', data.avatar);
                if (data.lockedGame) localStorage.setItem('smokex_locked_game', data.lockedGame);
                if (data.lockExpiry) localStorage.setItem('smokex_lock_expiry', data.lockExpiry);
                
                if (data.username.toLowerCase() === 'admin') {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "./dashboard.html";
                }
            }
        } else if (data.result === "error") {
            if (data.code === "EMAIL_NOT_FOUND") {
                showMessage("No account found with this email. Please create an account.", true);
            } else if (data.message.includes("permission")) {
                showMessage("Email service not authorized. Contact Admin.", true);
            } else {
                showMessage(data.message || "Request failed.", true);
            }
        }
    } catch (error) {
        console.error("Auth Error:", error);
        showMessage("Connection to Arena failed.", true);
    } finally {
        setLoading(btn, false);
    }
};

const initParticles = () => {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
            for (let j = i + 1; j < particles.length; j++) {
                let p2 = particles[j];
                let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (dist < 150) {
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                }
            }
        });
        requestAnimationFrame(animate);
    };
    animate();
};

const init = () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // HARD REDIRECT: If mobile user lands here, send them to the fresh mobile page
        window.location.replace(`auth-mobile.html${window.location.search}`);
        return;
    }

    // Set initial state
    gsap.set(aContainer, { autoAlpha: 0, x: 0 });
    
    bContainer.classList.add('is-active-form');

    document.querySelector("#a-form").addEventListener("submit", handleSubmit);
    document.querySelector("#b-form").addEventListener("submit", handleSubmit);
    document.querySelector("#forgot-form-auth").addEventListener("submit", handleSubmit);
    document.querySelector("#reset-form-auth").addEventListener("submit", handleSubmit);

    document.getElementById('auth-forgot-link').addEventListener('click', (e) => { e.preventDefault(); showResetForm('c-container'); });
    document.querySelectorAll('.back-to-signin-auth').forEach(link => {
        link.addEventListener('click', (e) => { e.preventDefault(); backToAuth(); });
    });

    for (var i = 0; i < switchBtn.length; i++) {
        switchBtn[i].addEventListener("click", changeForm);
    }
    initParticles();

    // Correctly handle redirection from Landing Page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('form') === 'signup') {
        setTimeout(() => changeForm(true), 100);
    }
};

window.addEventListener("load", init);