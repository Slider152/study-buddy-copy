document.addEventListener("DOMContentLoaded", function () {
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (!user) {
        window.location.href = "./signin.html";
        return;
    }

    // List & empty state
    const groupListEl = document.getElementById("groupList");
    const emptyStateEl = document.getElementById("groupEmptyState");

    // Buttons that open the modal
    const topBtn = document.getElementById("groupOpenModalTop");
    const emptyBtn = document.getElementById("groupOpenModalEmpty");

    // Modal elements
    const backdrop = document.getElementById("groupModalBackdrop");
    const closeBtn = document.getElementById("groupModalClose");
    const cancelBtn = document.getElementById("groupCancelBtn");
    const form = document.getElementById("groupForm");

    const modalTitle = document.getElementById("groupModalTitle");
    const modalSubtitle = document.getElementById("groupModalSubtitle");
    const manageHeader = document.getElementById("groupManageHeader");

    // Fields
    const nameInput = document.getElementById("groupName");
    const classInput = document.getElementById("groupClassName");
    const timeSelect = document.getElementById("groupTimeSlot");
    const maxInput = document.getElementById("groupMaxMembers");
    const subjectPicker = document.getElementById("groupSubjectPicker");
    const hiddenClasses = document.getElementById("selectedClasses");

    // Members section (manage only)
    const membersSection = document.getElementById("groupMembersSection");
    const membersListEl = document.getElementById("groupMembersList");
    const membersTitleEl = document.getElementById("groupMembersTitle");
    const recommendSection = document.getElementById("groupRecommendedSection");

    // Actions
    const deleteBtn = document.getElementById("groupDeleteBtn");
    const submitBtn = document.getElementById("groupSubmitBtn");

    // State
    let mode = "create"; // "create" | "edit"
    let editingGroupId = null;
    let editingMembers = [];

    /*  storage helpers  */

    function loadGroups() {
        try {
            const raw = localStorage.getItem("groups");
            return raw ? JSON.parse(raw) : [];
        } catch (err) {
            console.error("Failed to read groups:", err);
            return [];
        }
    }

    function saveGroups(groups) {
        localStorage.setItem("groups", JSON.stringify(groups));
    }

    function isOwner(group) {
        const owner = group.ownerEmail || (Array.isArray(group.members) ? group.members[0] : "");
        return owner === user.email;
    }

    /*  members helpers  */

    function getDisplayName(email) {
        if (!email) return "Unknown";
        if (email === user.email && user.fullName) return user.fullName;
        const idx = email.indexOf("@");
        return idx > 0 ? email.slice(0, idx) : email;
    }

    function getInitial(name) {
        if (!name) return "?";
        return name.trim().charAt(0).toUpperCase();
    }

    function renderMembersList(maxMembers) {
        membersListEl.innerHTML = "";

        const ownerEmail = editingMembers[0]; // we keep creator at index 0
        const count = editingMembers.length;
        const maxText = maxMembers ? `(${count}/${maxMembers})` : `(${count})`;
        membersTitleEl.textContent = `Current Members ${maxText}`;

        editingMembers.forEach((email, index) => {
            const name = getDisplayName(email);
            const li = document.createElement("li");
            li.className = "group_member-item";

            const left = document.createElement("div");
            left.className = "group_member-left";
            left.innerHTML = `
                <div class="group_member-avatar">${getInitial(name)}</div>
                <div>
                    <div class="group_member-name">${name}</div>
                    <div class="group_member-email">${email}</div>
                </div>
            `;

            li.appendChild(left);

            // Only allow removing non-owner members
            if (email !== ownerEmail) {
                const removeBtn = document.createElement("button");
                removeBtn.type = "button";
                removeBtn.className = "group_member-remove";
                removeBtn.textContent = "×";
                removeBtn.title = "Remove member";

                removeBtn.addEventListener("click", function () {
                    editingMembers = editingMembers.filter(e => e !== email);
                    renderMembersList(maxMembers);
                });

                li.appendChild(removeBtn);
            }

            membersListEl.appendChild(li);
        });

        if (editingMembers.length === 0) {
            const p = document.createElement("p");
            p.className = "group_recommend-empty";
            p.textContent = "No members in this group yet.";
            membersListEl.appendChild(p);
        }
    }

    /*  render group list  */

    function renderGroups() {
        const allGroups = loadGroups();
        const myEmail = user.email;
        const myGroups = allGroups.filter(g =>
            Array.isArray(g.members) && g.members.includes(myEmail)
        );

        if (!myGroups.length) {
            emptyStateEl.style.display = "flex";
            groupListEl.style.display = "none";
            groupListEl.innerHTML = "";
            return;
        }

        emptyStateEl.style.display = "none";
        groupListEl.style.display = "flex";
        groupListEl.innerHTML = "";

        myGroups.forEach(group => {
            const li = document.createElement("li");
            li.className = "card group_group-card";

            const members = Array.isArray(group.members) ? group.members : [];
            const membersCount = members.length;
            const maxMembers = group.maxMembers || group.max || 0;
            const ownerEmail = group.ownerEmail || members[0];

            const membersHtml = members
                .map(email => {
                    const name = getDisplayName(email);
                    const initial = getInitial(name);
                    return `
                        <div class="group_group-member-chip">
                            <div class="group_group-member-avatar">${initial}</div>
                            <span class="group_group-member-name">${name}</span>
                        </div>
                    `;
                })
                .join("");

            li.innerHTML = `
                <div class="group_group-header">
                    <div>
                        <div class="group_group-title-row">
                            <h3 class="group_group-name">
                                ${group.name || "Study Group"}
                            </h3>
                            <span class="group_group-star" aria-hidden="true">★</span>
                        </div>
                        <p class="group_group-course">
                            ${group.course || "No class set"}
                        </p>
                    </div>

                    <button type="button"
                            class="group_group-settings-btn"
                            aria-label="Group settings">
                        ⚙︎
                    </button>
                </div>

                <div class="group_group-body">
                    <div class="group_group-row">
                        <span class="group_group-icon">📅</span>
                        <span class="group_group-text">
                            ${group.time || "Time not set"}
                        </span>
                    </div>

                    <div class="group_group-row group_group-members-row">
                        <div class="group_group-members-header">
                            <span class="group_group-icon">👥</span>
                            <span class="group_group-text">
                                Members (${membersCount}${maxMembers ? `/${maxMembers}` : ""})
                            </span>
                        </div>

                        <div class="group_group-members-list">
                            ${membersHtml}
                        </div>
                    </div>
                </div>

                <button type="button" class="btn group_group-details-btn">
                    View Details
                </button>
            `;

            const detailsBtn = li.querySelector(".group_group-details-btn");
            if (detailsBtn) {
                detailsBtn.addEventListener("click", function () {
                    localStorage.setItem("currentGroupId", group.id);
                    window.location.href = "./group-detail.html";
                });
            }

            // settings button: only owner can see & use
            const settingsBtn = li.querySelector(".group_group-settings-btn");
            if (ownerEmail === user.email) {
                settingsBtn.addEventListener("click", function () {
                    openEditModal(group);
                });
            } else {
                settingsBtn.style.visibility = "hidden";
            }

            groupListEl.appendChild(li);
        });
    }

    function resetSubjectPicker() {
        if (!subjectPicker) return;
        const active = subjectPicker.querySelector(".group_subject-selected");
        if (active) active.classList.remove("group_subject-selected");

        const cbs = subjectPicker.querySelectorAll('input[type="checkbox"]');
        cbs.forEach(cb => (cb.checked = false));

        if (hiddenClasses) hiddenClasses.value = "";
        if (classInput) classInput.value = "";
    }

    function openCreateModal() {
        mode = "create";
        editingGroupId = null;
        editingMembers = [user.email];

        if (form) form.reset();
        resetSubjectPicker();

        modalTitle.textContent = "Create Study Group";
        modalSubtitle.textContent = "Start a new study group and invite your classmates";
        manageHeader.style.display = "none";

        subjectPicker.style.display = "flex";
        classInput.readOnly = true;

        membersSection.style.display = "none";
        recommendSection.style.display = "none";
        deleteBtn.style.display = "none";

        submitBtn.textContent = "Create Group";

        backdrop.removeAttribute("hidden");
    }

    function openEditModal(group) {
        mode = "edit";
        editingGroupId = group.id;

        // Copy members, keep owner at index 0
        const members = Array.isArray(group.members) ? group.members.slice() : [user.email];
        const ownerEmail = group.ownerEmail || members[0] || user.email;
        if (!members.includes(ownerEmail)) members.unshift(ownerEmail);
        editingMembers = members;

        modalTitle.textContent = "Manage Group";
        modalSubtitle.textContent = "Edit group details, invite members, or delete the group";
        manageHeader.style.display = "flex";

        // Fill fields
        nameInput.value = group.name || "";
        classInput.value = group.course || "";
        classInput.readOnly = true;
        timeSelect.value = group.time || "";
        maxInput.value = group.maxMembers || "";

        subjectPicker.style.display = "none";

        membersSection.style.display = "block";
        recommendSection.style.display = "block";
        deleteBtn.style.display = "inline-flex";
        submitBtn.textContent = "Save Changes";

        renderMembersList(group.maxMembers);
        backdrop.removeAttribute("hidden");
    }

    function closeModal() {
        backdrop.setAttribute("hidden", "hidden");
    }

    if (topBtn) topBtn.addEventListener("click", openCreateModal);
    if (emptyBtn) emptyBtn.addEventListener("click", openCreateModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    if (backdrop) {
        backdrop.addEventListener("click", function (event) {
            if (event.target === backdrop) {
                closeModal();
            }
        });
    }

    /*  delete group  */

    if (deleteBtn) {
        deleteBtn.addEventListener("click", function () {
            if (mode !== "edit" || editingGroupId == null) return;

            const ok = confirm("Are you sure you want to delete this group?");
            if (!ok) return;

            const groups = loadGroups();
            const next = groups.filter(g => g.id !== editingGroupId);
            saveGroups(next);
            closeModal();
            renderGroups();
        });
    }

    /*  submit (create or edit)  */

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const groupName = nameInput.value.trim();
            let className = classInput.value.trim();
            const timeSlot = timeSelect.value;
            const maxMembers = parseInt(maxInput.value, 10) || 0;

            if (!className && hiddenClasses && hiddenClasses.value.trim()) {
                className = hiddenClasses.value.trim().split(",")[0];
            }

            if (!groupName || !className || !timeSlot) {
                alert("Please fill in Group Name, Class Name, and Time Slot.");
                return;
            }

            const groups = loadGroups();

            if (mode === "create") {
                const newGroup = {
                    id: Date.now(),
                    name: groupName,
                    course: className,
                    time: timeSlot,
                    maxMembers: maxMembers,
                    members: [user.email],
                    ownerEmail: user.email
                };

                groups.push(newGroup);
                saveGroups(groups);
            } else if (mode === "edit" && editingGroupId != null) {
                const index = groups.findIndex(g => g.id === editingGroupId);
                if (index !== -1) {
                    const g = groups[index];
                    g.name = groupName;
                    g.course = className;
                    g.time = timeSlot;
                    g.maxMembers = maxMembers;
                    g.members = editingMembers.slice();
                    if (!g.ownerEmail) g.ownerEmail = g.members[0] || user.email;
                    groups[index] = g;
                    saveGroups(groups);
                }
            }

            closeModal();
            renderGroups();
        });
    }

    // Initial render
    renderGroups();
});
