// js/homePageHeroAnimations.js
function initHomePageHeroAnimations() {
    console.log("Initializing Homepage Hero Animations");
    const finleyHeading = document.querySelector(".finley-animated-heading");
    if (finleyHeading) {
        const finleyLetters = finleyHeading.querySelectorAll("span");
        finleyLetters.forEach((span, index) => {
            span.style.animationDelay = `${index * 0.1}s`;
            span.classList.add("fade-in-letter-anim");
        });

        const finleyAnimationTimePerLetter = 0.5; // seconds
        const finleyLastLetterDelay = finleyLetters.length > 0 ? (finleyLetters.length - 1) * 0.1 : 0;
        const totalFinleyAnimationDuration = (finleyLastLetterDelay + finleyAnimationTimePerLetter) * 1000; // milliseconds

        const initialStatsData = [
            { name: "10m Sprint", value: "2.00s", label: "AUSGEZEICHNET" },
            { name: "20m Sprint", value: "3.59s", label: "SEHR GUT" },
            { name: "Gewandtheit", value: "7.81s", label: "AUSGEZEICHNET" },
            { name: "Dribbling", value: "10.27s", label: "AUSGEZEICHNET" },
            { name: "Balljonglieren", value: "0.00", label: "UNTERDURCHSCHNITTLICH" },
            { name: "Ballkontrolle", value: "10.82s", label: "DURCHSCHNITTLICH" },
        ];

        const gesamtleistungData = {
            name: "Gesamtleistung",
            value: "101.80",
            label: "SEHR GUT"
        };

        const elementsToRender = [];
        initialStatsData.forEach(stat => {
            elementsToRender.push({ type: "stat", data: stat });
            // Add divider after "Ballkontrolle" or before "Gesamtleistung"
            if (stat.name === "Ballkontrolle") {
                elementsToRender.push({ type: "divider" });
            }
        });
        elementsToRender.push({ type: "stat", data: gesamtleistungData, isSummary: true });

        const statsContainer = document.querySelector(".statistics-container");

        if (statsContainer) {
            const statsAnimationStartTime = totalFinleyAnimationDuration + 200; // Start stats after Finley animation + buffer

            setTimeout(() => {
                elementsToRender.forEach((element, index) => {
                    const rowBaseDelay = index * 350; // Stagger animation for each element

                    if (element.type === "stat") {
                        const stat = element.data;
                        const item = document.createElement("div");
                        item.classList.add("statistic-item");
                        if (element.isSummary) {
                            item.classList.add("statistic-item-summary");
                        }

                        const nameSpan = document.createElement("span");
                        nameSpan.classList.add("stat-exercise-name");
                        nameSpan.textContent = stat.name;

                        const ratingContainer = document.createElement("span");
                        ratingContainer.classList.add("stat-rating-container");
                        const ratingText = document.createElement("span");
                        ratingText.classList.add("stat-rating-text");
                        ratingText.textContent = stat.label;

                        // Apply label classes based on rating
                        if (stat.label === "AUSGEZEICHNET") ratingText.classList.add("label-ausgezeichnet");
                        else if (stat.label === "SEHR GUT") ratingText.classList.add("label-sehr-gut");
                        else if (stat.label === "DURCHSCHNITTLICH") ratingText.classList.add("label-durchschnittlich");
                        else if (stat.label === "UNTERDURCHSCHNITTLICH") ratingText.classList.add("label-unterdurchschnittlich");

                        ratingContainer.appendChild(ratingText);

                        const valueSpan = document.createElement("span");
                        valueSpan.classList.add("stat-result");
                        valueSpan.textContent = stat.value;

                        item.appendChild(nameSpan);
                        item.appendChild(ratingContainer);
                        item.appendChild(valueSpan);
                        statsContainer.appendChild(item);

                        // Animation trigger
                        setTimeout(() => {
                            item.style.opacity = "1"; // Make item visible for animations
                            nameSpan.classList.add("animate-slide-in-left");
                            valueSpan.classList.add("animate-slide-in-right");

                            const nameValueAnimationDuration = 600; // Duration of slide-in animations
                            const ratingBuffer = 100; // Buffer before rating animation starts

                            setTimeout(() => {
                                ratingContainer.classList.add("animate-rating-drop-in");
                            }, nameValueAnimationDuration + ratingBuffer);
                        }, rowBaseDelay);

                    } else if (element.type === "divider") {
                        const dividerElement = document.createElement("div");
                        dividerElement.classList.add("divider", "divider-margins", "divider-prominent");
                        dividerElement.style.opacity = "0"; // Start transparent for fade-in
                        statsContainer.appendChild(dividerElement);

                        setTimeout(() => {
                            dividerElement.style.transition = "opacity 0.5s ease-in-out 0.1s"; // 0.1s delay
                            dividerElement.style.opacity = "1";
                        }, rowBaseDelay);
                    }
                });
            }, statsAnimationStartTime);
        } else {
            console.warn("HeroAnimations: Statistics container .statistics-container not found.");
        }
    } else {
        console.warn("HeroAnimations: Finley heading .finley-animated-heading not found.");
    }
}
