document.addEventListener("DOMContentLoaded", async function () {
    const SUBJECTS = [ { "code": "ACCT", "description": "ACCT-Accounting" }, { "code": "ADSC", "description": "ADSC-Applied Data Science" }, { "code": "ADVG", "description": "ADVG-Adventure" }, { "code": "AGSC", "description": "AGSC-Agricultural Science" }, { "code": "ANTH", "description": "ANTH-Anthropology" }, { "code": "ARCH", "description": "ARCH-Archaeology" }, { "code": "ARET", "description": "ARET-Architectural Engineering" }, { "code": "ASTR", "description": "ASTR-Astronomy" }, { "code": "BIOL", "description": "BIOL-Biology" }, { "code": "BLAW", "description": "BLAW-Business Law" }, { "code": "BUSN", "description": "BUSN-Business" }, { "code": "CENG", "description": "CENG-Computer Engineering" }, { "code": "CHBI", "description": "CHBI-Chemical Biology" }, { "code": "CHEM", "description": "CHEM-Chemistry" }, { "code": "CMNS", "description": "CMNS-Communication Studies" }, { "code": "CNCS", "description": "CNCS-Comp Netwk/Cybersecurity" }, { "code": "COAP", "description": "COAP-Cooking Apprentice" }, { "code": "COMP", "description": "COMP-Computing" }, { "code": "COOP", "description": "COOP-Cooperative Education" }, { "code": "CRWR", "description": "CRWR-Creative Writing" }, { "code": "CYCA", "description": "CYCA-Child and Youth Care" }, { "code": "DASC", "description": "DASC - Data Science" }, { "code": "ECED", "description": "ECED-Early Childhood Education" }, { "code": "ECON", "description": "ECON-Economics" }, { "code": "EDAR", "description": "EDAR-Education Action Research" }, { "code": "EDCO", "description": "EDCO-Education Communications" }, { "code": "EDCS", "description": "EDCS-Educ Community Support" }, { "code": "EDEF", "description": "EDEF-Education Foundations" }, { "code": "EDHC", "description": "EDHC-Education Health &amp; Career" }, { "code": "EDLL", "description": "EDLL-Education Lang &amp; Literacy" }, { "code": "EDMA", "description": "EDMA-Education Math" }, { "code": "EDPR", "description": "EDPR-Education Professional" }, { "code": "EDSC", "description": "EDSC-Education Science" }, { "code": "EDSM", "description": "EDSM-Education Science/Math" }, { "code": "EDSO", "description": "EDSO-Education Social Studies" }, { "code": "EDTE", "description": "EDTE-Education Trades Educ" }, { "code": "EDTL", "description": "EDTL-Education Teach and Learn" }, { "code": "EDUC", "description": "EDUC-Education" }, { "code": "ELGS", "description": "ELGS-English Lang Grad Studies" }, { "code": "ENGL", "description": "ENGL-English" }, { "code": "ENGR", "description": "ENGR-Common Engineering" }, { "code": "ENST", "description": "ENST - Environmental Studies" }, { "code": "ENSU", "description": "ENSU-Environmental Sustain" }, { "code": "ENTR", "description": "ENTR-Entrepreneurship" }, { "code": "ENVS", "description": "ENVS-Environmental Science" }, { "code": "EPHY", "description": "EPHY-Engineering Physics" }, { "code": "ESAL", "description": "ESAL-English As Second/Add Lan" }, { "code": "ESTR", "description": "ESTR-Employment Skills Train" }, { "code": "EVNT", "description": "EVNT-Event Management" }, { "code": "FILM", "description": "FILM-Film" }, { "code": "FIRE", "description": "FIRE-Wildfire Science/Studies" }, { "code": "FNCE", "description": "FNCE-Finance" }, { "code": "FNLG", "description": "FNLG-First Nations Language" }, { "code": "FNST", "description": "FNST-First Nations Studies" }, { "code": "FRAN", "description": "FRAN-Francais (French)" }, { "code": "GEOG", "description": "GEOG-Geography" }, { "code": "GEOL", "description": "GEOL-Geology" }, { "code": "GLBL", "description": "GLBL-Global Competency" }, { "code": "HEAL", "description": "HEAL-Health" }, { "code": "HIST", "description": "HIST-History" }, { "code": "JOUR", "description": "JOUR-Journalism" }, { "code": "JUST", "description": "JUST-Police &amp; Justice Studies" }, { "code": "LAWF", "description": "LAWF-Law" }, { "code": "MATH", "description": "MATH-Mathematics" }, { "code": "MIST", "description": "MIST-Mngt Info Syst &amp; Tech" }, { "code": "MKTG", "description": "MKTG-Marketing" }, { "code": "MLAN", "description": "MLAN-Modern Languages" }, { "code": "MNGT", "description": "MNGT-Management" }, { "code": "MUSI", "description": "MUSI-Music" }, { "code": "NRSC", "description": "NRSC-Natural Resource Sciences" }, { "code": "NURS", "description": "NURS-Nursing" }, { "code": "ORGB", "description": "ORGB-Organizational Behaviour" }, { "code": "PHED", "description": "PHED-Physical Education" }, { "code": "PHIL", "description": "PHIL-Philosophy" }, { "code": "PHYS", "description": "PHYS-Physics" }, { "code": "PNUR", "description": "PNUR-Practical Nursing" }, { "code": "POLI", "description": "POLI-Political Science" }, { "code": "PSYC", "description": "PSYC-Psychology" }, { "code": "RESL", "description": "RESL-Research Learning" }, { "code": "RESP", "description": "RESP-Respiratory Therapy" }, { "code": "RGEN", "description": "RGEN-Regenerative Agriculture" }, { "code": "SCMN", "description": "SCMN-Supply Chain Management" }, { "code": "SENG", "description": "SENG-Software Engineering" }, { "code": "SERV", "description": "SERV-Service Learning" }, { "code": "SOCI", "description": "SOCI-Sociology" }, { "code": "SOCW", "description": "SOCW-Social Work" }, { "code": "SPAN", "description": "SPAN-Spanish" }, { "code": "SPEE", "description": "SPEE-Speeches &amp; Presentations" }, { "code": "SRCL", "description": "SRCL-Service &amp; Community Learn" }, { "code": "STAT", "description": "STAT-Statistics" }, { "code": "STSS", "description": "STSS-Study Skills" }, { "code": "TESL", "description": "TESL-Teaching ESL" }, { "code": "THTR", "description": "THTR-Theatre" }, { "code": "TMGT", "description": "TMGT-Tourism Management" }, { "code": "VISA", "description": "VISA-Visual Arts" }, { "code": "VTEC", "description": "VTEC -Veterinary Technology" }, { "code": "WTTP", "description": "WTTP-Water Treatment Tech" } ];

    const classListEl = document.getElementById("classList");
    const searchBox   = document.getElementById("classSearch");
    const hiddenClasses = document.getElementById("selectedClasses");

    /* only group page */
    const groupClassInput = document.getElementById("groupClassName");
    const isGroupPage = !!groupClassInput;
    /* only group page */


    const PAGE_SIZE = 10;
    let allSubjects = [];
    let filtered = [];
    let page = 0;
    const selected = new Set();

    // Load from local constant SUBJECTS
    async function fetchSubjects() {
        await new Promise(r => setTimeout(r, 200)); // simulate loading
        allSubjects = Array.isArray(SUBJECTS) ? SUBJECTS : [];
        applyFilter("");
    }

    // Render one row (checkbox + text)
    function renderItem(subj) {
        const label = document.createElement("label");
        label.className = "class-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = subj.code;
        checkbox.checked = selected.has(subj.code);

        checkbox.addEventListener("change", function () {
            if (isGroupPage) {
                if (checkbox.checked) {
                    selected.clear();
                    selected.add(subj.code);

                    if (classListEl) {
                        const allCheckboxes =
                            classListEl.querySelectorAll('input[type="checkbox"]');
                        allCheckboxes.forEach(cb => {
                            if (cb !== checkbox) cb.checked = false;
                        });

                        const allLabels = classListEl.querySelectorAll(".class-item");
                        allLabels.forEach(l => l.classList.remove("group_subject-selected"));
                    }

                    label.classList.add("group_subject-selected");

                    if (hiddenClasses) hiddenClasses.value = subj.code;
                    if (groupClassInput) groupClassInput.value = subj.code;
                } else {
                    selected.delete(subj.code);
                    if (hiddenClasses) hiddenClasses.value = "";
                    if (groupClassInput) groupClassInput.value = "";
                    label.classList.remove("group_subject-selected");
                }
            } else {
                // sign up
                if (checkbox.checked) selected.add(subj.code);
                else selected.delete(subj.code);
                if (hiddenClasses) hiddenClasses.value = Array.from(selected).join(",");
            }
        });

        // group
        if (isGroupPage) {
            label.addEventListener("click", function (e) {
                if (e.target === checkbox) return;

                e.preventDefault();
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event("change", { bubbles: true }));
            });
        }

        const text = document.createElement("span");
        text.textContent = subj.code + " - " + subj.description;

        label.appendChild(checkbox);
        label.appendChild(text);
        classListEl.appendChild(label);
    }


    // Render next page
    function renderNextPage() {
        const start = page * PAGE_SIZE;
        const end = Math.min(start + PAGE_SIZE, filtered.length);
        for (let i = start; i < end; i++) {
            renderItem(filtered[i]);
        }
        page++;
    }

    // When near the bottom of scroll, load next
    function setupInfiniteScroll() {
        classListEl.addEventListener("scroll", function () {
            const nearBottom =
                classListEl.scrollTop + classListEl.clientHeight >= classListEl.scrollHeight - 10;

            // When user scrolls to bottom
            if (nearBottom && page * PAGE_SIZE < filtered.length) {
                renderNextPage();
            }
        });
    }

    // Reset and render from start
    function resetAndRender() {
        classListEl.innerHTML = "";
        page = 0;
        if (filtered.length === 0) {
            const p = document.createElement("p");
            p.className = "list-loading";
            p.textContent = "No classes found.";
            classListEl.appendChild(p);
            return;
        }
        renderNextPage();
    }

    // Filter by keyword
    function applyFilter(keyword) {
        const q = keyword.toLowerCase().trim();
        filtered = !q
            ? allSubjects.slice()
            : allSubjects.filter(s =>
                (s.code + " " + s.description).toLowerCase().includes(q)
            );
        resetAndRender();
    }

    // Search box event
    if (searchBox) {
        searchBox.addEventListener("input", function () {
            applyFilter(searchBox.value);
        });
    }

    // Start
    await fetchSubjects();
    setupInfiniteScroll();
});

