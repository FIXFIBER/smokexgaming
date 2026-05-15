const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbym38ItogN-uwuFv3_jBhmi128a649Y5hUqx1oF4BcHI6ZdjOEdcJZ22ISz2RUxV89sNg/exec";
let isVerifying = false;

const showMessage = (msg, isError = true) => {
    const container = document.getElementById('auth-message-container');
    document.getElementById('auth-message-text').innerText = msg;
    container.className = isError ? 'msg-container show' : 'msg-container show success';
    setTimeout(() => container.classList.remove('show'), 5000);
};

const handleRequest = async (payload) => {
    try {
        const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
        return await res.json();
    } catch (e) {
        return { result: 'error', message: 'Connection lost. Check signal.' };
    }
};

const switchView = (targetId) => {
    const currentView = document.querySelector('.auth-view.active');
    const nextView = document.getElementById(targetId);
    
    if (currentView === nextView) return;

    gsap.to(currentView, { 
        opacity: 0, 
        y: -10, 
        duration: 0.3, 
        onComplete: () => {
            currentView.classList.remove('active');
            nextView.classList.add('active');
            gsap.fromTo(nextView, 
                { opacity: 0, y: 10 }, 
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        } 
    });
};

// Tab Switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
        tab.classList.add('active');
        switchView(tab.dataset.target);
    });
});

// Forgot Pass Trigger
document.getElementById('m-forgot-btn').onclick = () => {
    switchView('forgot-view');
};

// Login
document.getElementById('mobile-login-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    const res = await handleRequest({
        action: 'login',
        email: document.getElementById('m-in-email').value,
        password: document.getElementById('m-in-pass').value
    });
    if (res.result === 'success') {
        localStorage.setItem('admin_session', 'active');
        localStorage.setItem('admin_user', res.username);
        window.location.href = res.username.toLowerCase() === 'admin' ? "admin.html" : "dashboard.html";
    } else {
        showMessage(res.message);
        btn.disabled = false;
    }
};

// Signup
document.getElementById('mobile-signup-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('m-signup-btn');
    btn.disabled = true;
    const payload = {
        action: 'signup',
        username: document.getElementById('m-up-user').value,
        email: document.getElementById('m-up-email').value,
        password: document.getElementById('m-up-pass').value,
        otp: isVerifying ? document.getElementById('m-up-otp').value : null
    };
    const res = await handleRequest(payload);
    if (res.result === 'otp_sent') {
        isVerifying = true;
        document.getElementById('m-signup-fields').style.display = 'none';
        document.getElementById('m-otp-fields').style.display = 'block';
        btn.innerText = "VERIFY CODE";
        showMessage(res.message, false);
    } else if (res.result === 'success') {
        showMessage("VERIFIED. PROCEED TO LOGIN.", false);
        setTimeout(() => location.reload(), 2000);
    } else {
        showMessage(res.message);
    }
    btn.disabled = false;
};

// Forgot Password
document.getElementById('mobile-forgot-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    const res = await handleRequest({
        action: 'forgotPassword',
        email: document.getElementById('m-forgot-email').value
    });
    if (res.result === 'otp_sent') {
        showMessage("Check email for reset code.", false);
        // Simplification: In a real flow, you'd show reset fields here
    } else {
        showMessage(res.message);
    }
    btn.disabled = false;
};

// Handle landing redirect params
window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('form') === 'signup') document.querySelector('[data-target="signup-view"]').click();
};