// Sidebar toggle functionality
function initializeSidebarToggle() {
  const toggle = document.querySelector(".sidebar-toggle");
  if (!toggle) return;

  const body = document.body;
  const collapseIcon = toggle.querySelector(".collapse-icon");
  const expandIcon = toggle.querySelector(".expand-icon");
  const stored = localStorage.getItem("sidebar-collapsed");
  const isCollapsed = stored === "true";

  if (isCollapsed) {
    body.classList.add("sidebar-collapsed");
    toggle.setAttribute("aria-expanded", "false");
    collapseIcon.style.display = "none";
    expandIcon.style.display = "block";
  } else {
    toggle.setAttribute("aria-expanded", "true");
    collapseIcon.style.display = "block";
    expandIcon.style.display = "none";
  }

  toggle.addEventListener("click", () => {
    const nowCollapsed = !body.classList.contains("sidebar-collapsed");
    body.classList.toggle("sidebar-collapsed", nowCollapsed);
    localStorage.setItem("sidebar-collapsed", nowCollapsed ? "true" : "false");
    toggle.setAttribute("aria-expanded", nowCollapsed ? "false" : "true");
    collapseIcon.style.display = nowCollapsed ? "none" : "block";
    expandIcon.style.display = nowCollapsed ? "block" : "none";
  });
}

// Dark mode functionality
function toggleDarkMode() {
  const body = document.body;
  const toggle = document.querySelector(".dark-mode-toggle");
  const sunIcon = toggle.querySelector(".sun-icon");
  const moonIcon = toggle.querySelector(".moon-icon");

  body.classList.toggle("dark-mode");
  const isDarkMode = body.classList.contains("dark-mode");

  localStorage.setItem("dark-mode", isDarkMode);
  sunIcon.style.display = isDarkMode ? "none" : "block";
  moonIcon.style.display = isDarkMode ? "block" : "none";
}
