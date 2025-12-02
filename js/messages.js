document.addEventListener("DOMContentLoaded", () => {
    // Keys for shared storage
    const GROUPS_KEY = "sb_groups"; // maps groupName -> array of member names
    const DEFAULT_GROUPS = ["MATH", "COMPUTER"]; // fallback if user has no groups

    // Read current user from localStorage
    const savedUser = localStorage.getItem("user");

    // If no user exists, redirect to sign-in page
    if (!savedUser) {
        window.location.href = "./signin.html";
        return;
    }

    const user = JSON.parse(savedUser);

    // Determine groups for this user
    const userGroups = Array.isArray(user.groups) && user.groups.length > 0
        ? user.groups
        : DEFAULT_GROUPS;

    // DOM elements
    const conversationList = document.getElementById("conversationList");
    const convSearch = document.getElementById("searchGroups");

    const threadTitle = document.getElementById("threadTitle");
    const threadSubtitle = document.getElementById("threadSubtitle");
    const threadBody = document.getElementById("threadBody");
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");

    const membersBody = document.getElementById("membersBody");
    const memberCount = document.getElementById("memberCount");

    const sidebarPanel = document.getElementById("msgSidebar");
    const membersPanel = document.getElementById("msgMembers");
    const overlay = document.getElementById("msgOverlay");
    const openConversationsBtn = document.getElementById("openConversations");
    const openMembersBtn = document.getElementById("openMembers");

    // Keep track of current selected group
    let currentGroup = userGroups[0];

    /* Shared groups helpers */

    // Load global groups info from localStorage
    function loadGroups() {
        const raw = localStorage.getItem(GROUPS_KEY);
        if (!raw) return {};
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("Failed to parse groups:", e);
            return {};
        }
    }

    // Save global groups info
    function saveGroups(groups) {
        localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
    }

    // Make sure current user is added to each of their groups
    function ensureUserInGroups() {
        const groups = loadGroups();

        userGroups.forEach((g) => {
            if (!groups[g]) {
                groups[g] = [];
            }
            // Use fullName as identifier (you can switch to email if needed)
            if (!groups[g].includes(user.fullName)) {
                groups[g].push(user.fullName);
            }
        });

        saveGroups(groups);
    }

    /* Messages helpers per group */

    // Build the storage key for a specific group
    function messagesKey(groupName) {
        return `sb_messages_${groupName}`;
    }

    // Load messages array for a group
    function loadMessages(groupName) {
        const key = messagesKey(groupName);
        const raw = localStorage.getItem(key);
        if (!raw) {
            // No history yet → start with empty array
            return [];
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("Failed to parse messages:", e);
            return [];
        }
    }

    // Save messages for a group
    function saveMessages(groupName, messages) {
        const key = messagesKey(groupName);
        localStorage.setItem(key, JSON.stringify(messages));
    }

    /* UI render helpers */

    // Create one conversation list item for a group
    function createConversationItem(groupName, lastMessageText) {
        const li = document.createElement("li");
        li.className = "msg-conversation-item";
        li.dataset.group = groupName;

        const titleDiv = document.createElement("div");
        titleDiv.className = "msg-conversation-title";
        titleDiv.textContent = groupName;

        const lastDiv = document.createElement("div");
        lastDiv.className = "msg-conversation-last";
        lastDiv.textContent = lastMessageText || "No messages yet";

        const tagDiv = document.createElement("div");
        tagDiv.className = "msg-conversation-tag";
        tagDiv.textContent = groupName.toUpperCase();

        li.appendChild(titleDiv);
        li.appendChild(lastDiv);
        li.appendChild(tagDiv);

        // Click handler: switch active group
        li.addEventListener("click", () => {
            currentGroup = groupName;
            renderAllForGroup();
            // Mark active state
            document.querySelectorAll(".msg-conversation-item").forEach((item) => {
                item.classList.toggle("active", item === li);
            });
            // On mobile, close sidebar after select
            closeSidebar();
        });

        return li;
    }

    // Create one message row element
    function createMessageRow(msg) {
        const row = document.createElement("div");
        row.className = "msg-row " + (msg.fromCurrentUser ? "outgoing" : "incoming");

        const metaWrapper = document.createElement("div");

        const meta = document.createElement("div");
        meta.className = "msg-meta";

        const authorSpan = document.createElement("span");
        authorSpan.className = "msg-author";
        authorSpan.textContent = msg.author;

        const timeSpan = document.createElement("span");
        timeSpan.className = "msg-time";
        timeSpan.textContent = msg.time || "Just now";

        meta.appendChild(authorSpan);
        meta.appendChild(timeSpan);

        const bubble = document.createElement("div");
        bubble.className = "msg-bubble";
        bubble.textContent = msg.text;

        metaWrapper.appendChild(meta);
        metaWrapper.appendChild(bubble);

        const avatarDiv = document.createElement("div");
        avatarDiv.className = "msg-avatar";
        const initial =
            msg.author && msg.author.length > 0
                ? msg.author.charAt(0).toUpperCase()
                : "?";
        avatarDiv.textContent = initial;

        if (msg.fromCurrentUser) {
            row.appendChild(metaWrapper);
            row.appendChild(avatarDiv);
        } else {
            row.appendChild(avatarDiv);
            row.appendChild(metaWrapper);
        }

        return row;
    }

    // Render messages for the current group
    function renderMessages() {
        if (!threadBody) return;

        const messages = loadMessages(currentGroup);
        threadBody.innerHTML = "";

        messages.forEach((msg) => {
            const row = createMessageRow(msg);
            threadBody.appendChild(row);
        });

        threadBody.scrollTop = threadBody.scrollHeight;
    }

    // Render conversation list based on userGroups
    function renderConversationList() {
        if (!conversationList) return;

        conversationList.innerHTML = "";
        const groups = loadGroups();

        userGroups.forEach((groupName, index) => {
            const msgs = loadMessages(groupName);
            const last = msgs[msgs.length - 1];
            const lastText = last
                ? `${last.author}: ${last.text}`
                : "No messages yet";

            const item = createConversationItem(groupName, lastText);
            if (groupName === currentGroup || (index === 0 && !currentGroup)) {
                item.classList.add("active");
            }
            conversationList.appendChild(item);
        });
    }

    // Render members for the current group (avatar + name only)
    function renderMembers() {
        if (!membersBody || !memberCount) return;

        const groups = loadGroups();
        const members = Array.isArray(groups[currentGroup])
            ? groups[currentGroup]
            : [];

        // clear list
        membersBody.innerHTML = "";

        members.forEach((name) => {
            const row = document.createElement("div");
            row.className = "msg-member-row";

            // avatar with initial
            const avatar = document.createElement("div");
            avatar.className = "msg-member-avatar";
            const initial =
                name && name.length > 0 ? name.charAt(0).toUpperCase() : "?";
            avatar.textContent = initial;

            // name text
            const nameSpan = document.createElement("span");
            nameSpan.className = "msg-member-name";
            nameSpan.textContent = name;

            row.appendChild(avatar);
            row.appendChild(nameSpan);

            membersBody.appendChild(row);
        });

        memberCount.textContent =
            members.length === 1 ? "1 member" : `${members.length} members`;
    }


    // Render thread header (title / subtitle) for current group
    function renderThreadHeader() {
        if (threadTitle) threadTitle.textContent = currentGroup;
        if (threadSubtitle) threadSubtitle.textContent = currentGroup.toUpperCase();
    }

    // Render everything for current group
    function renderAllForGroup() {
        renderThreadHeader();
        renderMessages();
        renderMembers();
        renderConversationList();
    }

    /* Sending messages */

    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        const newMessage = {
            author: user.fullName,
            text,
            time: timeString,
            fromCurrentUser: true,
        };

        const messages = loadMessages(currentGroup);
        messages.push(newMessage);
        saveMessages(currentGroup, messages);

        // Append to UI
        const row = createMessageRow(newMessage);
        threadBody.appendChild(row);
        threadBody.scrollTop = threadBody.scrollHeight;

        // Update conversation preview snippet
        renderConversationList();

        // Clear input
        messageInput.value = "";
    }

    if (sendBtn && messageInput && threadBody) {
        sendBtn.addEventListener("click", sendMessage);
        messageInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    /* Search filter for groups (optional) */

    if (convSearch) {
        convSearch.addEventListener("input", () => {
            const q = convSearch.value.trim().toLowerCase();
            document.querySelectorAll(".msg-conversation-item").forEach((item) => {
                const groupName = item.dataset.group.toLowerCase();
                item.style.display = groupName.includes(q) ? "" : "none";
            });
        });
    }

    /* Mobile side panels toggle */
    function openSidebar() {
        if (sidebarPanel && overlay) {
            // close members panel if it is open
            if (membersPanel) {
                membersPanel.classList.remove("open");
            }
            sidebarPanel.classList.add("open");
            overlay.classList.add("active");
        }
    }

    function closeSidebar() {
        if (sidebarPanel && overlay) {
            sidebarPanel.classList.remove("open");
            // remove overlay only if members panel is also closed
            if (!membersPanel || !membersPanel.classList.contains("open")) {
                overlay.classList.remove("active");
            }
        }
    }

    function openMembersPanel() {
        if (membersPanel && overlay) {
            // close sidebar if it is open
            if (sidebarPanel) {
                sidebarPanel.classList.remove("open");
            }
            membersPanel.classList.add("open");
            overlay.classList.add("active");
        }
    }

    function closeMembersPanel() {
        if (membersPanel && overlay) {
            membersPanel.classList.remove("open");
            if (!sidebarPanel || !sidebarPanel.classList.contains("open")) {
                overlay.classList.remove("active");
            }
        }
    }

    if (openConversationsBtn) {
        openConversationsBtn.addEventListener("click", () => {
            // toggle sidebar panel
            if (sidebarPanel.classList.contains("open")) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (openMembersBtn) {
        openMembersBtn.addEventListener("click", () => {
            // toggle members panel
            if (membersPanel.classList.contains("open")) {
                closeMembersPanel();
            } else {
                openMembersPanel();
            }
        });
    }

    if (overlay) {
        overlay.addEventListener("click", () => {
            closeSidebar();
            closeMembersPanel();
        });
    }

    /*  Initialization */

    // Ensure the current user is part of their groups
    ensureUserInGroups();

    // Initial render for the default group
    renderAllForGroup();
});
