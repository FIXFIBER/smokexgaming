// SECURITY CHECK: Redirect to auth if not logged in
if (localStorage.getItem('admin_session') !== 'active') {
    window.location.href = "auth.html";
}

const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item => {
    const li = item.parentElement;

    item.addEventListener('click', function () {
        allSideMenu.forEach(i => {
            i.parentElement.classList.remove('active');
        })
        li.classList.add('active');
    })
});

// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');
});

// Sidebar Responsiveness Handler
function adjustSidebar() {
    if (window.innerWidth <= 576) {
        sidebar.classList.add('hide');
    } else {
        sidebar.classList.remove('hide');
    }
}

window.addEventListener('load', adjustSidebar);
window.addEventListener('resize', adjustSidebar);

// Search Toggle for Mobile
const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
    if (window.innerWidth < 768) {
        e.preventDefault();
        searchForm.classList.toggle('show');
        if (searchForm.classList.contains('show')) {
            searchButtonIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchButtonIcon.classList.replace('bx-x', 'bx-search');
        }
    }
});

// Dark Mode Logic
const switchMode = document.getElementById('switch-mode');
switchMode.addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
});

// Dropdown Menus logic
const notificationIcon = document.getElementById('notificationIcon');
const profileIcon = document.getElementById('profileIcon');
const notificationMenu = document.getElementById('notificationMenu');
const profileMenu = document.getElementById('profileMenu');

notificationIcon.addEventListener('click', function (e) {
    e.preventDefault();
    notificationMenu.classList.toggle('show');
    profileMenu.classList.remove('show');
});

profileIcon.addEventListener('click', function (e) {
    e.preventDefault();
    profileMenu.classList.toggle('show');
    notificationMenu.classList.remove('show');
});

// Close menus if clicked outside
window.addEventListener('click', function (e) {
    if (!notificationIcon.contains(e.target) && !notificationMenu.contains(e.target)) {
        notificationMenu.classList.remove('show');
    }
    if (!profileIcon.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove('show');
    }
});

// Logout logic
document.querySelector('.logout').addEventListener('click', (e) => {
    localStorage.removeItem('admin_session');
    window.location.href = "auth.html";
});