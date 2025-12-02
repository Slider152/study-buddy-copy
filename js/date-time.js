document.addEventListener("DOMContentLoaded", function() {
    // FREE TIME SLOT ADD FUNCTION
    const daySelect = document.getElementById("daySelect");     // Dropdown for days
    const timeSelect = document.getElementById("timeSelect");   // Dropdown for times
    const addButton = document.getElementById("addSlot");       // "Add" button
    const chipsContainer = document.getElementById("timeChips");// Container for chips

    if (addButton && daySelect && timeSelect && chipsContainer) {
        addButton.addEventListener("click", function() {
            const day = daySelect.value;
            const time = timeSelect.value;

            // If day or time is empty, show an alert
            if (day === "" || time === "") {
                alert("Please select both a day and time!");
                return;
            }

            // Check for duplicate chips (same day and time)
            const existing = chipsContainer.querySelectorAll(".chip");
            for (let i = 0; i < existing.length; i++) {
                if (existing[i].dataset.value === day + "-" + time) {
                    alert("That time slot is already added!");
                    return;
                }
            }

            // Create a new chip element
            const chip = document.createElement("span");
            chip.className = "chip";
            chip.dataset.value = day + "-" + time;
            chip.textContent = day + " " + time + " ";

            // Create a remove (×) button
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "×";
            removeBtn.type = "button";
            removeBtn.style.border = "none";
            removeBtn.style.background = "transparent";
            removeBtn.style.cursor = "pointer";
            removeBtn.style.marginLeft = "6px";

            // When the × button is clicked, remove the chip
            removeBtn.addEventListener("click", function() {
                chipsContainer.removeChild(chip);
            });

            // Add the remove button into the chip and show it in the container
            chip.appendChild(removeBtn);
            chipsContainer.appendChild(chip);
        });
    }
});
