// js/homePageVideoSwiper.js
function initHomePageVideoSwiper() {
    console.log("Initializing Homepage Video Swiper");
    let currentSlide = 0;
    const slides = document.querySelectorAll("#video-swiper .video-slide");
    const indicators = document.querySelectorAll("#video-swiper .indicator");
    const swiper = document.getElementById("video-swiper");
    let startX = 0;
    let startY = 0;

    function showSlide(index) {
        if (!slides.length || !indicators.length || index < 0 || index >= slides.length) {
            console.warn("VideoSwiper: showSlide called with invalid index or missing elements.", { index, slidesLength: slides.length, indicatorsLength: indicators.length });
            return;
        }

        slides.forEach((slide) => {
            slide.classList.remove("active");
            const video = slide.querySelector("video");
            if (video) video.pause();
        });

        indicators.forEach((indicator) => {
            indicator.classList.remove("active");
        });

        if (slides[index] && indicators[index]) {
            slides[index].classList.add("active");
            indicators[index].classList.add("active");
            const currentVideo = slides[index].querySelector("video");
            if (currentVideo) {
                currentVideo.currentTime = 0;
                currentVideo.play().catch((e) => console.warn("VideoSwiper: Video play failed:", e));
            }
        }
        currentSlide = index;
    }

    if (swiper) {
        swiper.addEventListener("touchstart", function (e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        swiper.addEventListener("touchend", function (e) {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) { // Horizontal swipe
                if (diffX > 0) { // Swiped left
                    showSlide((currentSlide + 1) % slides.length);
                } else { // Swiped right
                    showSlide((currentSlide - 1 + slides.length) % slides.length);
                }
            }
        });
    } else {
        console.warn("VideoSwiper: Swiper element #video-swiper not found.");
    }

    indicators.forEach((indicator, index) => {
        indicator.addEventListener("click", () => {
            showSlide(index);
        });
    });

    if (slides.length > 0) {
        showSlide(0); // Initialize first slide
    } else {
        console.warn("VideoSwiper: No slides found for the swiper.");
    }
}
