/* === JS: js/script.js === */
window.addEventListener("scroll", function() {
    let hero = document.querySelector(".hero");
    let scrollPosition = window.scrollY;
    hero.style.backgroundPositionY = scrollPosition * 0.5 + "px";
});
