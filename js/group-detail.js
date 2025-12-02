document.addEventListener("DOMContentLoaded", function () {
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (!user) {
        window.location.href = "./signin.html";
        return;
    }

    // profile menu
    setupProfileMenuOnDetail(user);

    // read current group id
    const idRaw = localStorage.getItem("currentGroupId");
    const currentId = idRaw ? Number(idRaw) : null;

    const groups = loadGroups();
    const group = groups.find(g => g.id === currentId) || groups[0];

    if (!group) {
        window.location.href = "./group.html";
        return;
    }

    // back button
    const backBtn = document.getElementById("groupDetailBack");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.location.href = "./group.html";
        });
    }

    // group info elements
    const nameEl = document.getElementById("detailGroupName");
    const courseEl = document.getElementById("detailGroupCourse");
    const timeEl = document.getElementById("detailGroupTime");
    const badgeEl = document.getElementById("detailMembersBadge");
    const creatorCard = document.getElementById("detailCreatorCard");
    const membersCountText = document.getElementById("detailMembersCountText");
    const membersListEl = document.getElementById("detailMembersList");

    const members = Array.isArray(group.members) ? group.members : [];
    const maxMembers = group.maxMembers || 0;
    const ownerEmail = group.ownerEmail || members[0];

    // fill group info
    nameEl.textContent = group.name || "Study Group";
    courseEl.textContent = group.course || "No class set";
    timeEl.textContent = group.time || "Time not set";

    const countText = `${members.length}${maxMembers ? ` / ${maxMembers}` : ""} Members`;
    badgeEl.textContent = countText;
    membersCountText.textContent = `${members.length}${maxMembers ? ` of ${maxMembers}` : ""} members`;

    // creator
    if (creatorCard && ownerEmail) {
        const creatorName = getDisplayName(ownerEmail, user);
        creatorCard.innerHTML = `
            <div class="group_member-left">
                <div class="group_member-avatar">${getInitial(creatorName)}</div>
                <div>
                    <div class="group_member-name">${creatorName}</div>
                    <div class="group_member-email">${ownerEmail}</div>
                </div>
            </div>
        `;
    }

    // members on right card
    if (membersListEl) {
        membersListEl.innerHTML = "";
        members.forEach(email => {
            const name = getDisplayName(email, user);
            const div = document.createElement("div");
            div.className = "group_detail-member-row";

            const isCreator = email === ownerEmail;

            div.innerHTML = `
                <div class="group_member-left">
                    <div class="group_member-avatar">${getInitial(name)}</div>
                    <div>
                        <div class="group_member-name">
                            ${name}
                            ${isCreator ? '<span class="group_detail-badge">Creator</span>' : ""}
                        </div>
                        <div class="group_member-email">${email}</div>
                    </div>
                </div>
            `;
            membersListEl.appendChild(div);
        });
    }

    // session notes
    const sessionListEl = document.getElementById("groupSessionList");

    let sessions = loadSessions(group.id);
    if (sessions.length === 0) {
        sessions.push(makeEmptySession(1));
    }

    // note modal elements
    const noteBackdrop = document.getElementById("groupNoteBackdrop");
    const noteForm = document.getElementById("groupNoteForm");
    const noteTitleEl = document.getElementById("groupNoteTitle");
    const noteSummaryEl = document.getElementById("groupNoteSummary");
    const noteFileEl = document.getElementById("groupNoteFile");
    const noteCloseBtn = document.getElementById("groupNoteClose");
    const noteCancelBtn = document.getElementById("groupNoteCancel");

    let activeSessionIndex = null;

    function openNoteModal(index) {
        activeSessionIndex = index;
        const session = sessions[index];

        noteTitleEl.textContent = `Add Note - ${session.title}`;
        noteSummaryEl.value = session.summary || "";
        if (noteFileEl) {
            noteFileEl.value = ""; // reset
        }

        noteBackdrop.removeAttribute("hidden");
    }

    function closeNoteModal() {
        noteBackdrop.setAttribute("hidden", "hidden");
        activeSessionIndex = null;
    }

    if (noteCloseBtn) noteCloseBtn.addEventListener("click", closeNoteModal);
    if (noteCancelBtn) noteCancelBtn.addEventListener("click", closeNoteModal);
    if (noteBackdrop) {
        noteBackdrop.addEventListener("click", function (e) {
            if (e.target === noteBackdrop) closeNoteModal();
        });
    }

    // save note
    if (noteForm) {
        noteForm.addEventListener("submit", function (e) {
            e.preventDefault();
            if (activeSessionIndex == null) return;

            const summary = noteSummaryEl.value.trim();
            if (!summary) {
                alert("Please write a short summary.");
                return;
            }

            const fileNames = [];
            if (noteFileEl && noteFileEl.files) {
                Array.from(noteFileEl.files).forEach(f => {
                    fileNames.push(f.name);
                });
            }

            const session = sessions[activeSessionIndex];
            session.summary = summary;
            session.files = fileNames;

            // auto-create next session if this is the last one
            const isLast = activeSessionIndex === sessions.length - 1;
            if (isLast) {
                const nextIndex = sessions.length + 1;
                sessions.push(makeEmptySession(nextIndex));
            }

            saveSessions(group.id, sessions);
            renderSessions();
            closeNoteModal();
        });
    }

    // delete a session
    function deleteSession(index) {
        if (sessions.length === 1) {
            // keep at least one; just clear it
            sessions[0].summary = "";
            sessions[0].files = [];
        } else {
            sessions.splice(index, 1);
            // re-number
            sessions.forEach((s, i) => {
                s.title = `Session ${i + 1}`;
            });
        }
        saveSessions(group.id, sessions);
        renderSessions();
    }

    function renderSessions() {
        sessionListEl.innerHTML = "";

        sessions.forEach((session, index) => {
            const hasNote = !!session.summary;

            const wrapper = document.createElement("article");
            wrapper.className = "group_session-item";

            const header = document.createElement("div");
            header.className = "group_session-item-header";

            header.innerHTML = `
                <div>
                    <h3 class="group_session-item-title">${session.title}</h3>
                    <p class="group_session-item-status text-muted">
                        ${hasNote ? "Note added" : "No notes yet"}
                    </p>
                </div>
            `;

            const btnRow = document.createElement("div");
            btnRow.className = "group_session-item-buttons";

            const addBtn = document.createElement("button");
            addBtn.type = "button";
            addBtn.className = "btn group_session-add-btn";
            addBtn.textContent = hasNote ? "Edit Note" : "Add Note";
            addBtn.addEventListener("click", () => openNoteModal(index));

            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "btn group_session-delete-btn";
            delBtn.textContent = "Delete Session";
            delBtn.addEventListener("click", () => {
                const ok = confirm("Delete this session?");
                if (ok) deleteSession(index);
            });

            btnRow.appendChild(addBtn);
            btnRow.appendChild(delBtn);
            header.appendChild(btnRow);
            wrapper.appendChild(header);

            // body
            const body = document.createElement("div");
            body.className = "group_session-item-body";

            if (hasNote) {
                const summaryP = document.createElement("p");
                summaryP.className = "group_session-summary";
                summaryP.textContent = session.summary;
                body.appendChild(summaryP);

                if (session.files && session.files.length > 0) {
                    const filesList = document.createElement("ul");
                    filesList.className = "group_session-files";

                    session.files.forEach(name => {
                        const li = document.createElement("li");
                        li.className = "group_session-file-row";
                        li.innerHTML = `
                            <span class="group_session-file-name">${name}</span>
                            <!-- fake download button, you can swap icon later -->
                            <button type="button" class="group_session-download-btn">
                                Download
                            </button>
                        `;
                        filesList.appendChild(li);
                    });

                    body.appendChild(filesList);
                }
            } else {
                const emptyP = document.createElement("p");
                emptyP.className = "group_session-empty text-muted";
                emptyP.textContent = "No notes yet";
                body.appendChild(emptyP);
            }

            wrapper.appendChild(body);
            sessionListEl.appendChild(wrapper);
        });
    }

    // helpers for storage and names
    function loadGroups() {
        try {
            return JSON.parse(localStorage.getItem("groups") || "[]");
        } catch {
            return [];
        }
    }

    function getDisplayName(email, me) {
        if (!email) return "Unknown";
        if (me && email === me.email && me.fullName) return me.fullName;
        const idx = email.indexOf("@");
        return idx > 0 ? email.slice(0, idx) : email;
    }

    function getInitial(name) {
        if (!name) return "?";
        return name.trim().charAt(0).toUpperCase();
    }

    function makeEmptySession(index) {
        return {
            id: Date.now() + index,
            title: `Session ${index}`,
            summary: "",
            files: []
        };
    }

    function loadSessions(groupId) {
        try {
            const key = `groupSessions_${groupId}`;
            return JSON.parse(localStorage.getItem(key) || "[]");
        } catch {
            return [];
        }
    }

    function saveSessions(groupId, arr) {
        const key = `groupSessions_${groupId}`;
        localStorage.setItem(key, JSON.stringify(arr));
    }

    // small wrapper to reuse main.js profile setup
    function setupProfileMenuOnDetail(user) {
        const profileMenu = document.getElementById("profileMenu");
        const profileBtn = document.getElementById("profileBtn");
        const dropdownMenu = document.getElementById("dropdownMenu");
        const profileCircle = document.getElementById("profileCircle");
        const profileName = document.getElementById("profileName");
        const logoutBtn = document.getElementById("logoutBtn");

        if (!profileMenu) return;

        setupProfileMenu({
            user,
            profileMenu,
            profileBtn,
            dropdownMenu,
            profileCircle,
            profileName,
            logoutBtn,
        });
    }

    // first render
    renderSessions();
});
