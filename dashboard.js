// SECURITY CHECK: Redirect to auth if not logged in
if (localStorage.getItem('admin_session') !== 'active') {
    window.location.href = "auth.html";
}

// Apps Script URL for backend communication
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbym38ItogN-uwuFv3_jBhmi128a649Y5hUqx1oF4BcHI6ZdjOEdcJZ22ISz2RUxV89sNg/exec'; // REMEMBER TO REPLACE THIS

// Initialize User Data
const AVATAR_POOL = [
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Smile',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Angry',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Dizzy', // Represents Drunk/Confused
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Love',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Nervous',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Surprised',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Wink',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Grin',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Shades',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Thinking',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sleepy',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Laugh',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Shocked',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sweat',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Bored'
];

function syncUserInterface() {
    const username = localStorage.getItem('admin_user') || 'CHAMPION';
    const userAvatar = localStorage.getItem('admin_avatar');
    
    document.getElementById('display-username').innerText = username;
    document.getElementById('welcome-name').innerText = username;
    document.getElementById('settings-username').value = username;

    const iconContainers = document.querySelectorAll('.icon');
    let iconHTML = '';

    if (userAvatar) {
        iconHTML = `<img src="${userAvatar}" alt="Profile">`;
    } else {
        let initials = 'XP';
        if (username) {
            const nameParts = username.trim().split(/\s+/);
            initials = nameParts.length > 1 
                ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                : username.substring(0, 2).toUpperCase();
        }
        iconHTML = `<p style="color: var(--gold);">${initials}</p>`;
    }

    iconContainers.forEach(container => {
        container.innerHTML = iconHTML;
    });
}

// Mobile Sidebar Toggle Logic
const toggleSidebar = () => {
    const sidebar = document.querySelector('.leftside-menu');
    sidebar.classList.toggle('mobile-active');
};

// Add toggle button for mobile if it doesn't exist
document.addEventListener('DOMContentLoaded', () => {
    const welcomeName = document.getElementById('welcome-name');
    if (welcomeName) welcomeName.addEventListener('click', toggleSidebar);
});

syncUserInterface();
checkArenaLock();

// Real-time Clock & Date
function updateTime() {
    const now = new Date();
    
    // Time
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    });
    document.getElementById('time').innerText = timeStr;
    
    // Greeting
    const hours = now.getHours();
    let greeting = "GOOD EVENING";
    if (hours < 12) greeting = "GOOD MORNING";
    else if (hours < 17) greeting = "GOOD AFTERNOON";
    document.getElementById('greeting').innerText = greeting;
    
    // Date
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    document.getElementById('date').innerText = now.toLocaleDateString('en-US', options).toUpperCase();

    // Update Footer Year
    document.getElementById('footer-year').innerText = now.getFullYear();
}

setInterval(updateTime, 1000);
updateTime();

// Custom Message Display for Dashboard
const showMessage = (msg, isError = false, duration = 5000) => {
    const msgContainer = document.getElementById('dashboard-message-container');
    const msgText = document.getElementById('dashboard-message-text');

    if (!msgContainer || !msgText) {
        console.error("Dashboard message container or text element not found.");
        return;
    }

    msgText.innerText = msg;
    msgContainer.classList.remove('error', 'success');
    msgContainer.classList.add(isError ? 'error' : 'success');
    msgContainer.classList.add('show');

    setTimeout(() => {
        msgContainer.classList.remove('show');
    }, duration);
};

// Generic Loading Spinner Toggle
const setLoading = (btn, isLoading) => {
    if (isLoading) { btn.classList.add('loading'); btn.disabled = true; }
    else { btn.classList.remove('loading'); btn.disabled = false; }
};

// Logout Logic
document.querySelector('.logout-btn').addEventListener('click', () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_user');
    window.location.href = "auth.html";
});

// View Switching Logic
const homeView = document.getElementById('home-view');
const gamesView = document.getElementById('games-view');
const settingsView = document.getElementById('settings-view');
const avatarSelectionContainer = document.getElementById('avatar-selection-container');

document.getElementById('nav-home').addEventListener('click', () => {
    setActiveTab('nav-home');
    homeView.style.display = 'grid';
    gamesView.style.display = 'none';
    settingsView.style.display = 'none';
    avatarSelectionContainer.style.display = 'none'; // Hide avatar picker when leaving settings
    showMessage(''); // Clear messages
});

document.getElementById('nav-games').addEventListener('click', () => {
    setActiveTab('nav-games');
    homeView.style.display = 'none';
    gamesView.style.display = 'grid';
    settingsView.style.display = 'none';
    showMessage('');
});

document.getElementById('nav-settings').addEventListener('click', () => {
    setActiveTab('nav-settings');
    homeView.style.display = 'none';
    gamesView.style.display = 'none';
    settingsView.style.display = 'grid';
    showMessage(''); // Clear messages
    settingsView.scrollTop = 0; // Reset scroll position
    renderAvatarPicker();
});

function setActiveTab(id) {
    document.querySelectorAll('.menu li').forEach(li => li.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Toggle Avatar Picker Visibility
document.getElementById('settings-profile-icon').addEventListener('click', () => {
    avatarSelectionContainer.style.display = avatarSelectionContainer.style.display === 'none' ? 'block' : 'none';
});

// Arena Lock Logic (2 Months = 60 Days)
function checkArenaLock() {
    const lockedGame = localStorage.getItem('smokex_locked_game');
    const lockExpiry = localStorage.getItem('smokex_lock_expiry');
    const now = Date.now();

    if (lockedGame && lockExpiry && now < parseInt(lockExpiry)) {
        document.querySelectorAll('.game-card').forEach(card => {
            const btn = card.querySelector('.participate-btn');
            if (card.dataset.game === lockedGame) {
                card.classList.add('active-choice');
                btn.innerText = "SELECTED";
                btn.disabled = true;
            } else {
                card.classList.add('locked-out');
                btn.innerText = "LOCKED";
                btn.disabled = true;
            }
        });
        
        const daysLeft = Math.ceil((parseInt(lockExpiry) - now) / (1000 * 60 * 60 * 24));
        document.querySelector('.games-header-container p').innerText = 
            `ACTIVE DISCIPLINE: ${lockedGame} | LOCK EXPIRES IN ${daysLeft} DAYS`;
    }
}

let pendingArenaChoice = null;
const arenaOverlay = document.getElementById('arena-confirm-overlay');

document.querySelectorAll('.participate-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        pendingArenaChoice = e.target.closest('.game-card').dataset.game;
        document.getElementById('target-game-name').innerText = pendingArenaChoice;
        arenaOverlay.classList.add('active');
    });
});

document.getElementById('abort-arena').addEventListener('click', () => {
    arenaOverlay.classList.remove('active');
    pendingArenaChoice = null;
});

document.getElementById('confirm-arena').addEventListener('click', () => {
    if (pendingArenaChoice) {
        const sixtyDays = 60 * 24 * 60 * 60 * 1000;
        const expiryDate = Date.now() + sixtyDays;
        localStorage.setItem('smokex_locked_game', pendingArenaChoice);
        localStorage.setItem('smokex_lock_expiry', expiryDate.toString());
        showMessage(`Welcome to the ${pendingArenaChoice} Arena. Season Synced.`, false);
        
        // Global Cloud Sync for Arena Choice
        handleDashboardRequest({
            action: 'syncUserData',
            email: localStorage.getItem('admin_email'),
            lockedGame: pendingArenaChoice,
            lockExpiry: expiryDate.toString()
        });

        checkArenaLock();
        document.getElementById('nav-home').click();
    }
    arenaOverlay.classList.remove('active');
});

// Toggle Username Field Visibility
document.getElementById('toggle-username-field').addEventListener('click', () => {
    const userForm = document.getElementById('update-profile-form');
    userForm.style.display = userForm.style.display === 'none' ? 'block' : 'none';
});

// Toggle Password Fields Visibility
document.getElementById('toggle-password-fields').addEventListener('click', () => {
    const passForm = document.getElementById('change-password-form');
    passForm.style.display = passForm.style.display === 'none' ? 'block' : 'none';
});

// Avatar Selection
function renderAvatarPicker() {
    const picker = document.getElementById('avatar-picker');
    const currentAvatar = localStorage.getItem('admin_avatar');
    picker.innerHTML = '';

    AVATAR_POOL.forEach(url => {
        const div = document.createElement('div');
        div.className = `avatar-option ${currentAvatar === url ? 'selected' : ''}`;
        div.innerHTML = `<img src="${url}">`;
        div.onclick = () => {
            document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
            div.classList.add('selected');
            localStorage.setItem('admin_avatar', url);
            syncUserInterface();

            // Real-time Cloud Sync
            handleDashboardRequest({
                action: 'syncUserData',
                email: localStorage.getItem('admin_email'),
                avatar: url
            });
        };
        picker.appendChild(div);
    });
}

// Handle API requests
const handleDashboardRequest = async (data) => {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error("Dashboard API Failure:", error);
        return { result: 'error', message: 'Connection to Arena failed.' };
    }
};

// Save Gamertag Changes
document.getElementById('update-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-profile-settings');
    setLoading(btn, true);

    const newName = document.getElementById('settings-username').value.trim();
    if (newName) {
        const res = await handleDashboardRequest({
            action: 'syncUserData',
            email: localStorage.getItem('admin_email'),
            username: newName
        });

        if (res.result === 'success') {
            localStorage.setItem('admin_user', newName);
            syncUserInterface();
            document.getElementById('update-profile-form').style.display = 'none';
            showMessage('Gamertag synced to Arena successfully!', false);
        } else {
            showMessage('Cloud sync failed. Identity restricted.', true);
        }
    } else {
        showMessage('Gamertag cannot be empty!', true);
    }
    setLoading(btn, false);
});

// Change Password Form Submission
document.getElementById('change-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-password-settings');
    setLoading(btn, true);

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    const userEmail = localStorage.getItem('admin_email'); // Assuming email is stored in localStorage

    if (!userEmail) {
        showMessage('User email not found. Please log in again.', true);
        setLoading(btn, false);
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showMessage('New passwords do not match!', true);
        setLoading(btn, false);
        return;
    }

    const res = await handleDashboardRequest({
        action: 'changePassword',
        email: userEmail,
        currentPassword: currentPassword,
        newPassword: newPassword
    });

    if (res.result === 'success') {
        showMessage(res.message);
        e.target.reset(); // Clear form fields
    } else {
        showMessage(res.message, true);
    }
    setLoading(btn, false);
});