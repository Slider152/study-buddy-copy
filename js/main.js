document.addEventListener("DOMContentLoaded", function () {
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    // Common elements
    const signUpBtn = document.getElementById("signUpBtn");

    const profileMenu = document.getElementById("profileMenu");
    const profileBtn = document.getElementById("profileBtn");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const profileCircle = document.getElementById("profileCircle");
    const profileName = document.getElementById("profileName");
    const logoutBtn = document.getElementById("logoutBtn");

    // Dashboard elements (only exist in index.html)
    const bannerSubtitle = document.getElementById("bannerSubtitle");
    const dashboard = document.getElementById("dashboard");
    const dashboardName = document.getElementById("dashboardName");
    const dashboardMeta = document.getElementById("dashboardMeta");
    const statGroups = document.getElementById("statGroups");
    const statPopular = document.getElementById("statPopular");
    const statChats = document.getElementById("statChats");
    const myGroupList = document.getElementById("myGroupList");
    const recommendedList = document.getElementById("recommendedList");
    const newGroupBtn = document.getElementById("newGroupBtn");

    /* Home button logic */
    if (signUpBtn) {
        setupHomeButton(signUpBtn, !!user);
    }

    /* Profile menu (if logged in) */
    if (user) {
        setupProfileMenu({
            user,
            profileMenu,
            profileBtn,
            dropdownMenu,
            profileCircle,
            profileName,
            logoutBtn,
        });
    } else if (profileMenu) {
        profileMenu.style.display = "none";
    }

    /* Banner + Dashboard (Home page) */
    if (user) {
        if (bannerSubtitle) updateBanner(user, bannerSubtitle);
        if (dashboard && dashboardName && dashboardMeta) {
            setupDashboard({
                user,
                dashboard,
                dashboardName,
                dashboardMeta,
                statGroups,
                statPopular,
                statChats,
                myGroupList,
                recommendedList,
                newGroupBtn,
            });
        }
    }
});

/* Button on home: "Sign Up" or "Make a Group" */
function setupHomeButton(button, isLoggedIn) {
    if (isLoggedIn) {
        button.textContent = "Make a Group";
        button.classList.remove("btn-accent");
        button.classList.add("border-mint");

        button.addEventListener("click", () => {
            window.location.href = "./group.html";
        });
    } else {
        button.addEventListener("click", () => {
            window.location.href = "./signin.html";
        });
    }
}

/* Profile dropdown menu + logout */
function setupProfileMenu(opts) {
    const { user, profileMenu, profileBtn, dropdownMenu, profileCircle, profileName, logoutBtn } = opts;

    // Show profile menu
    profileMenu.style.display = "flex";

    // Initial letter
    if (profileCircle) {
        const initial = user.fullName ? user.fullName.charAt(0).toUpperCase() : "?";
        profileCircle.textContent = initial;
    }

    // Full name
    if (profileName) {
        profileName.textContent = user.fullName || "";
    }

    // Toggle dropdown
    if (profileBtn && dropdownMenu) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownMenu.style.display =
                dropdownMenu.style.display === "block" ? "none" : "block";
        });

        document.addEventListener("click", () => {
            dropdownMenu.style.display = "none";
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            window.location.href = "./signin.html";
        });
    }
}

/* Banner: short classes + study purpose */
function updateBanner(user, subtitleEl) {
    const classText = getShortClassText(user);
    const purposeText = user.studyPurpose || "Not set";

    subtitleEl.textContent = `Classes: ${classText} • Study purpose: ${purposeText}`;
}

/* Dashboard Section (Home page only) */
function setupDashboard(opts) {
    const {
        user,
        dashboard,
        dashboardName,
        dashboardMeta,
        statGroups,
        statPopular,
        statChats,
        myGroupList,
        recommendedList,
        newGroupBtn,
    } = opts;

    // Show dashboard
    dashboard.style.display = "block";

    // Welcome text
    dashboardName.textContent = user.fullName || "buddy";
    dashboardMeta.textContent =
        `Classes: ${getShortClassText(user)} • Study purpose: ${user.studyPurpose || "Not set"}`;

    /* Groups stored in localStorage */
    let allGroups = [];
    try {
        allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    } catch {
        allGroups = [];
    }

    const myEmail = user.email;
    const myGroups = allGroups.filter((g) =>
        Array.isArray(g.members) && g.members.includes(myEmail)
    );

    /* Dashboard stats */
    if (statGroups) statGroups.textContent = myGroups.length;
    if (statPopular) statPopular.textContent = allGroups.length;

    let chatCount = 0;
    try {
        const chats = JSON.parse(localStorage.getItem("chats") || "[]");
        if (Array.isArray(chats)) chatCount = chats.length;
    } catch {}
    if (statChats) statChats.textContent = chatCount;

    /* Render lists */
    if (myGroupList) {
        renderGroupList({
            targetEl: myGroupList,
            groups: myGroups,
            emptyText: "You don’t have any study groups yet.",
            markJoined: true,
        });
    }

    if (recommendedList) {
        const popularGroups = allGroups.slice(0, 3);
        renderGroupList({
            targetEl: recommendedList,
            groups: popularGroups,
            emptyText: "No recommendations yet.",
            markJoined: false,
            myGroups,
        });
    }

    /* New Group button (inside card) */
    if (newGroupBtn) {
        newGroupBtn.addEventListener("click", () => {
            window.location.href = "./group.html";
        });
    }
}

/* Short class summary text */
function getShortClassText(user) {
    const arr = Array.isArray(user.classes) ? user.classes : [];
    if (arr.length === 0) return "No classes added";

    const shortList = arr.slice(0, 3).join(", ");
    return arr.length > 3 ? `${shortList} ...` : shortList;
}

/* Render group list items (My Groups / Popular Groups) */
function renderGroupList(opts) {
    const { targetEl, groups, emptyText, markJoined, myGroups = [] } = opts;

    targetEl.innerHTML = "";

    if (!groups || groups.length === 0) {
        targetEl.innerHTML = `<li class="text-muted">${emptyText}</li>`;
        return;
    }

    groups.forEach((g) => {
        const li = document.createElement("li");
        li.className = "item-row";

        const members = Array.isArray(g.members) ? g.members.length : 0;
        const maxMembers = g.maxMembers || g.max || 0;

        const isJoined = markJoined
            ? true
            : myGroups.some((mg) => mg.id === g.id);

        li.innerHTML = `
            <strong>${g.name || g.title || "Study Group"}</strong><br>
            <span class="text-muted">${g.course || ""}${g.time ? " · " + g.time : ""}</span>
            ${maxMembers ? `<br><span class="text-muted">${members}/${maxMembers} members</span>` : ""}
            ${isJoined ? `<br><span class="text-muted">Joined</span>` : ""}
        `;

        targetEl.appendChild(li);
    });
}
