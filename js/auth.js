// js/auth.js
document.addEventListener("DOMContentLoaded", function () {
    const signinForm = document.querySelector(".auth-form.signin");
    const signupForm = document.querySelector(".auth-form.signup");

    // sign in
    signinForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = signinForm.querySelector('input[type="email"]').value.trim();
        const password = signinForm.querySelector('input[type="password"]').value;

        // admin account
        if (email === "test@test.com" && password === "test") {
            const admin = {
                fullName: "Admin",
                email: email,
                role: "admin",
            };

            // set user
            localStorage.setItem("user", JSON.stringify(admin));

            window.location.href = "index.html";
            return;
        }

        // get user
        const saved = localStorage.getItem("user");
        if (!saved) {
            alert("No account found. Please sign up first!");
            return;
        }

        const user = JSON.parse(saved);

        if (email === user.email && password === user.password) {
            // go to index
            window.location.href = "index.html";
        } else {
            alert("Wrong email or password.");
        }
    });

    // sign up
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const fullName = signupForm.querySelector('input[type="text"]').value.trim();
        const email = signupForm.querySelector('input[type="email"]').value.trim();
        const password = signupForm.querySelector('input[type="password"]').value;

        const studyPurpose = signupForm.querySelector("select[required]").value;
        const timeChipsContainer = document.getElementById("timeChips");
        const timeSlots = Array.from(timeChipsContainer.children).map(chip =>
            chip.textContent.trim()
        );

        const classListContainer = document.getElementById("classList");
        let selectedClassEls = classListContainer.querySelectorAll(
            '[data-selected="true"], [aria-selected="true"], .selected'
        );
        if (selectedClassEls.length === 0) {
            selectedClassEls = classListContainer.children;
        }
        const classes = Array.from(selectedClassEls).map(item =>
            item.textContent.trim()
        );

        const newUser = {
            fullName,
            email,
            password,
            timeSlots,
            studyPurpose,
            classes,
            role: "user",
        };

        // set user
        localStorage.setItem("user", JSON.stringify(newUser));

        alert("Account created!");
        window.location.href = "index.html";
    });
});
