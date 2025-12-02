document.addEventListener("DOMContentLoaded", () => 
{
    const $ = id => document.getElementById(id);
    const exists = id => !!$(id);

    //subject list
    const SUBJECT_LIST = [
        "ACCT - Accounting",
        "ADSC - Applied Data Science",
        "ADVG - Adventure",
        "AGSC - Agricultural Science",
        "ANTH - Anthropology",
        "ARCH - Archaeology",
        "ARET - Architectural Engineering",
        "ASTR - Astronomy",
        "BIOL - Biology",
        "BLAW - Business Law",
        "BUSN - Business",
        "CENG - Computer Engineering",
        "CHBI - Chemical Biology",
        "CHEM - Chemistry",
        "CMNS - Communication Studies",
        "CNCS - Comp Netwk/Cybersecurity",
        "COAP - Cooking Apprentice",
        "COMP - Computing",
        "COOP - Cooperative Education",
        "CRWR - Creative Writing",
        "CYCA - Child and Youth Care",
        "DASC - Data Science",
        "ECED - Early Childhood Education",
        "ECON - Economics",
        "EDAR - Education Action Research",
        "EDCO - Education Communications",
        "EDCS - Educ Community Support",
        "EDEF - Education Foundations",
        "EDHC - Education Health & Career",
        "EDLL - Education Lang & Literacy",
        "EDMA - Education Math",
        "EDPR - Education Professional",
        "EDSC - Education Science",
        "EDSM - Education Science/Math",
        "EDSO - Education Social Studies",
        "EDTE - Education Trades Educ",
        "EDTL - Education Teach and Learn",
        "EDUC - Education",
        "ELGS - English Lang Grad Studies",
        "ENGL - English",
        "ENGR - Common Engineering",
        "ENST - Environmental Studies",
        "ENSU - Environmental Sustain",
        "ENTR - Entrepreneurship",
        "ENVS - Environmental Science",
        "EPHY - Engineering Physics",
        "ESAL - English As Second/Add Lan",
        "ESTR - Employment Skills Train",
        "EVNT - Event Management",
        "FILM - Film",
        "FIRE - Wildfire Science/Studies",
        "FNCE - Finance",
        "FNLG - First Nations Language",
        "FNST - First Nations Studies",
        "FRAN - Francais (French)",
        "GEOG - Geography",
        "GEOL - Geology",
        "GLBL - Global Competency",
        "HEAL - Health",
        "HIST - History",
        "JOUR - Journalism",
        "JUST - Police & Justice Studies",
        "LAWF - Law",
        "MATH - Mathematics",
        "MIST - Mngt Info Syst & Tech",
        "MKTG - Marketing",
        "MLAN - Modern Languages",
        "MNGT - Management",
        "MUSI - Music",
        "NRSC - Natural Resource Sciences",
        "NURS - Nursing",
        "ORGB - Organizational Behaviour",
        "PHED - Physical Education",
        "PHIL - Philosophy",
        "PHYS - Physics",
        "PNUR - Practical Nursing",
        "POLI - Political Science",
        "PSYC - Psychology",
        "RESL - Research Learning",
        "RESP - Respiratory Therapy",
        "RGEN - Regenerative Agriculture",
        "SCMN - Supply Chain Management",
        "SENG - Software Engineering",
        "SERV - Service Learning",
        "SOCI - Sociology",
        "SOCW - Social Work",
        "SPAN - Spanish",
        "SPEE - Speeches & Presentations",
        "SRCL - Service & Community Learn",
        "STAT - Statistics",
        "STSS - Study Skills",
        "TESL - Teaching ESL",
        "THTR - Theatre",
        "TMGT - Tourism Management",
        "VISA - Visual Arts",
        "VTEC - Veterinary Technology",
        "WTTP - Water Treatment Tech"
    ];
    //load user data
    const raw = localStorage.getItem("user");
    if (!raw) 
    {
        alert("You must sign in first.");
        window.location.href = "signin.html";
        return;
    }
    let user;

    try { user = JSON.parse(raw); } catch (e) { user = null; }
        if (!user) 
        {
            alert("User data corrupt. Sign in again.");
            window.location.href = "signin.html";
            return;
        }

    //normalize arrays
    if (!Array.isArray(user.classes)) {
        user.classes = typeof user.classes === "string" && user.classes.trim()
            ? user.classes.split(",").map(s => s.trim()).filter(Boolean)
            : [];
    }
    if (!Array.isArray(user.timeSlots)) user.timeSlots = [];

    //getting elements
    const fullNameDisplay = $("fullNameDisplay");
    const emailDisplay = $("emailDisplay");
    const profileCircleDisplay = $("profileCircleDisplay");

    const chipContainer = $("chipContainer1");
    const classesInput = $("classesInput");
    const classListMP = $("classListMP");
    const classSearchMP = $("classSearchMP");

    const daySelectMP = $("daySelectMP");
    const timeSelectMP = $("timeSelectMP");
    const addSlotMP = $("addSlotMP");
    const timeChipsMP = $("timeChipsMP");
    const editTimeContainer = $("edit-time");

    const studyPurposeMP = $("studyPurposeMP");
    const studyPurposeInput = $("studyPurposeInput");
    const studyPurposeDisplay = $("studyPurposeDisplay");

    const editBtn = $("edit-profile-btn");
    const saveBtn = $("saveChangesBtn");

    //hidden controls when not editing
    if (editTimeContainer) editTimeContainer.style.display = "none";
    if (addSlotMP) addSlotMP.style.display = "none";
    if (studyPurposeMP) studyPurposeMP.style.display = "none";
    if (studyPurposeInput) studyPurposeInput.style.display = "none";

    //populating basic info
    if (fullNameDisplay) fullNameDisplay.textContent = user.fullName || "No Name";
    if (emailDisplay) emailDisplay.textContent = user.email || "No Email";
    if (profileCircleDisplay) 
    {
        const initials = (user.fullName || "?").split(" ").map(n => n[0] || "").join("").toUpperCase();
        profileCircleDisplay.textContent = initials;
    }

    //render class chips function
    function renderClassChips() 
    {
        if (!chipContainer) return;
        chipContainer.innerHTML = "";
        if (!Array.isArray(user.classes) || user.classes.length === 0) 
        {
            chipContainer.innerHTML = `<p style="opacity:0.6;">No classes selected</p>`;
            return;
        }
        user.classes.forEach(c => 
        {
            const chip = document.createElement("div");
            chip.className = "chip1";
            chip.textContent = c;
            chipContainer.appendChild(chip);
        });
    }
    renderClassChips();

    //render time chips function
    function renderTimeChipsFromArray(arr) 
    {
        if (timeChipsMP) 
        {
            timeChipsMP.innerHTML = "";
            if (!arr || arr.length === 0) 
            {
                timeChipsMP.innerHTML = `<p style="opacity:0.6;">No free time set</p>`;
                return;
            }
            arr.forEach(slot => 
            {
                const chip = document.createElement("div");
                chip.className = "chip";
                const span = document.createElement("span");
                span.textContent = slot;
                chip.appendChild(span);
                timeChipsMP.appendChild(chip);
            });
        }
    }
    renderTimeChipsFromArray(user.timeSlots);

    //populating study purpose
    if (studyPurposeMP) 
    {
        studyPurposeMP.value = user.studyPurpose || "General study";
        studyPurposeMP.disabled = true;
    }
    if (studyPurposeInput) 
    {
        studyPurposeInput.value = user.studyPurpose || "";
        studyPurposeInput.disabled = true;
    }
    if (studyPurposeDisplay) 
    {
    studyPurposeDisplay.textContent = user.studyPurpose || "No study purpose set";
    }

    //editing state
    let editing = false;
    let editableTimeSlots = user.timeSlots.slice();
    let editableStudyPurpose = user.studyPurpose ||
        (studyPurposeMP ? studyPurposeMP.options[0].text :
        (studyPurposeInput ? studyPurposeInput.value : ""));

    //render editable time chips function
    function renderEditableTimeChips() 
    {
        if (timeChipsMP) 
        {
            timeChipsMP.innerHTML = "";
            if (!Array.isArray(editableTimeSlots) || editableTimeSlots.length === 0) 
            {
                timeChipsMP.innerHTML = `<p style="opacity:0.6;">No free time set</p>`;
            } else 
            {
                editableTimeSlots.forEach(slot => 
                {
                    const chip = document.createElement("div");
                    chip.className = "chip";
                    const span = document.createElement("span");
                    span.textContent = slot;
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.textContent = "×";
                    btn.addEventListener("click", () => 
                    {
                        editableTimeSlots = editableTimeSlots.filter(s => s !== slot);
                        renderEditableTimeChips();
                    });
                    chip.appendChild(span);
                    chip.appendChild(btn);
                    timeChipsMP.appendChild(chip);
                });
            }
        }
    }

    //set editing mode function
    function setEditing(enabled) 
    {
        editing = enabled;

        document.querySelector(".my-info-panel")?.classList.toggle("editing", enabled);

        if (enabled) beginClassEditing();
        else stopClassEditing();

        //free time visibility toggle
        if (editTimeContainer) editTimeContainer.style.display = enabled ? "block" : "none";
        if (addSlotMP) addSlotMP.style.display = enabled ? "inline-block" : "none";
        if (daySelectMP) daySelectMP.disabled = !enabled;
        if (timeSelectMP) timeSelectMP.disabled = !enabled;
        if (addSlotMP) addSlotMP.disabled = !enabled;

        //study purpose visibility toggle
        if (studyPurposeMP) studyPurposeMP.style.display = enabled ? "inline-block" : "none";
        if (studyPurposeInput) studyPurposeInput.style.display = enabled ? "inline-block" : "none";
        if (studyPurposeDisplay) studyPurposeDisplay.style.display = enabled ? "none" : "block";
        if (studyPurposeMP) studyPurposeMP.disabled = !enabled;
        if (studyPurposeInput) studyPurposeInput.disabled = !enabled;
        
        //save button visibility toggle
        if (saveBtn) saveBtn.style.display = enabled ? "inline-block" : "none";

        //populating editable fields
        if (enabled) 
        {
            editableTimeSlots = Array.isArray(user.timeSlots) ? user.timeSlots.slice() : [];
            editableStudyPurpose = user.studyPurpose || (studyPurposeMP ? studyPurposeMP.options[0].text : "");
            if (studyPurposeMP) studyPurposeMP.value = editableStudyPurpose;
            if (studyPurposeInput) studyPurposeInput.value = editableStudyPurpose;
            renderEditableTimeChips();
        } 
        else 
        {
            renderTimeChipsFromArray(user.timeSlots);
            if (studyPurposeMP) studyPurposeMP.value = user.studyPurpose || (studyPurposeMP.options[0].text);
            if (studyPurposeInput) studyPurposeInput.value = user.studyPurpose || "";
            if (studyPurposeDisplay) studyPurposeDisplay.textContent = user.studyPurpose || "No study purpose set";
        }
        if (enabled && classSearchMP) classSearchMP.focus && classSearchMP.focus();
    }

    //entering edit mode, show class chips and dropdown
    function beginClassEditing() 
    {
        const searchContainer = document.querySelector(".class-search");
        if (searchContainer) searchContainer.style.display = "flex";

        if (classSearchMP) classSearchMP.style.display = "block";
        classListMP.style.display = "none";
        classSearchMP.value = "";
        renderEditableClassChips();
    }

    //exiting edit mode, show class chips but hide dropdown
    function stopClassEditing() 
    {
        classSearchMP.style.display = "none";
        classListMP.style.display = "none";
        classListMP.innerHTML = "";
        renderClassChips();
    }

    //searchable class list logic
    if (classSearchMP && classListMP && chipContainer) 
    {

        //function to render editable class chips
        function renderEditableClassChips() 
        {
            chipContainer.innerHTML = "";
            if (user.classes.length === 0) 
            {
                chipContainer.innerHTML = `<p style="opacity:0.6;">No classes selected</p>`;
                return;
            }
            user.classes.forEach(c => 
            {
                const chip = document.createElement("div");
                chip.className = "chip1 selected";
                chip.textContent = c;

                const removeBtn = document.createElement("button");
                removeBtn.type = "button";
                removeBtn.textContent = "×";
                removeBtn.style.marginLeft = "6px";
                removeBtn.addEventListener("click", () => 
                {
                    user.classes = user.classes.filter(x => x !== c);
                    renderEditableClassChips();
                });

                chip.appendChild(removeBtn);
                chipContainer.appendChild(chip);
            });
        }

        //function to buuld class dropdown menu
        function filterClassDropdown() 
        {
            const query = classSearchMP.value.toLowerCase().trim();

            classListMP.innerHTML = "";

            //hide dropdown if not editing and search is empty
            if (!editing && query === "") 
            {
                classListMP.style.display = "none";
                return;
            }

            //show dropdown
            classListMP.style.display = "block";

            //filter subjects based on query
            const filtered = SUBJECT_LIST.filter(cls => cls.toLowerCase().includes(query));

            if (filtered.length === 0) 
            {
                const emptyItem = document.createElement("div");
                emptyItem.className = "dropdown-item";
                emptyItem.textContent = "No matches found";
                emptyItem.style.opacity = "0.6";
                classListMP.appendChild(emptyItem);
                return;
            }

            //building dropdown items
            filtered.forEach(cls => 
            {
                const item = document.createElement("div");
                item.className = "dropdown-item";
                item.textContent = cls;
                item.tabIndex = 0;

                item.addEventListener("click", () => 
                {
                    if (!user.classes.includes(cls)) 
                    {
                        user.classes.push(cls);
                        renderEditableClassChips();
                    }
                    classSearchMP.value = "";
                    classListMP.style.display = "none";
                });

                item.addEventListener("keydown", (e) => 
                {
                    if (e.key === "Enter" || e.key === " ") 
                    {
                        item.click();
                    }
                });

                classListMP.appendChild(item);
            });
        }

        //event listeners for class search input
        classSearchMP.addEventListener("input", filterClassDropdown);
        classSearchMP.addEventListener("focus", () => 
        {
            if (editing) filterClassDropdown();
        });
        }

        //edit button logic
        if (editBtn) 
        {
            editBtn.addEventListener("click", () => 
            {
                console.log("Edit button clicked");
                if (!editing) 
                {
                    setEditing(true);
                    editBtn.textContent = "Cancel";
                } else 
                {
                    setEditing(false);
                    editBtn.textContent = "Edit profile";
                }
            });
        }

        //add time slot logic
        if (addSlotMP) 
        {
            addSlotMP.addEventListener("click", () => 
            {
                const day = daySelectMP ? daySelectMP.value : "";
                const time = timeSelectMP ? timeSelectMP.value : "";
                if (!day || !time) { alert("Please select both a day and time!"); return; }
                const slot = `${day} ${time}`;
                if (editableTimeSlots.includes(slot)) { alert("That time slot is already added!"); return; }
                editableTimeSlots.push(slot);
                renderEditableTimeChips();
            });
        }

        //save button logic
        if (saveBtn) 
        {
            saveBtn.addEventListener("click", () => 
            {
                const newStudyPurpose = studyPurposeMP ? studyPurposeMP.value :
                    (studyPurposeInput ? studyPurposeInput.value : editableStudyPurpose);

                const newTimeSlots = editableTimeSlots.slice();
                user.timeSlots = newTimeSlots;
                user.studyPurpose = newStudyPurpose;

                localStorage.setItem("user", JSON.stringify(user));

                renderTimeChipsFromArray(user.timeSlots);
                if (studyPurposeMP) studyPurposeMP.value = user.studyPurpose ||
                    (studyPurposeMP.options[0] ? studyPurposeMP.options[0].text : "");
                if (studyPurposeInput) studyPurposeInput.value = user.studyPurpose || "";
                if (studyPurposeDisplay) studyPurposeDisplay.textContent = user.studyPurpose || "";

                setEditing(false);
                if (editBtn) editBtn.textContent = "Edit profile";
                alert("Profile updated!");
            });
        }
        //reverting changes on cancel
        setEditing(false);
    });

