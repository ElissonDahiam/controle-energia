const body = document.body;
const sideMenu = document.getElementById("side-menu");
const topMenu = document.getElementById("top-menu");

// ===== TEMA =====
function toggleTheme() {
    body.classList.toggle("dark");
    localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
}

// ===== MENU =====
function toggleMenu() {
    sideMenu.classList.toggle("hidden");
    topMenu.classList.toggle("hidden");

    localStorage.setItem(
        "menu",
        sideMenu.classList.contains("hidden") ? "top" : "side"
    );
}

// ===== CARREGAR PREFERÊNCIAS =====
(function init() {
    const theme = localStorage.getItem("theme");
    const menu = localStorage.getItem("menu");

    if (theme === "dark") body.classList.add("dark");

    if (menu === "top") {
        sideMenu.classList.add("hidden");
        topMenu.classList.remove("hidden");
    }
})();
