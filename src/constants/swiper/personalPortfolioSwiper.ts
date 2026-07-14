import { Mousewheel, Pagination, Scrollbar } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";

interface SwiperHandlers {
    onInit: (swiper: SwiperType) => void;
    onSlideChange: (swiper: SwiperType) => void;
}

export const personalPortfolioSwiperConfig = ({
    onInit,
    onSlideChange,
}: SwiperHandlers) => ({
    modules: [Mousewheel, Pagination, Scrollbar],
    direction: "horizontal" as const,
    slidesPerView: 1,
    spaceBetween: 0,
    loop: false,
    mousewheel: true,
    speed: 600,

    resistance: true,
    resistanceRatio: 0.85,
    followFinger: true,

    shortSwipes: true,
    longSwipes: true,
    longSwipesRatio: 0.5,
    longSwipesMs: 300,

    slideToClickedSlide: false,

    pagination: {
        el: ".pp-slider-pagination",
        clickable: true,
        type: "progressbar" as const,
    },

    on: {
        init: onInit,
        slideChange: onSlideChange,
        slideChangeTransitionStart: onSlideChange,
    },
});
