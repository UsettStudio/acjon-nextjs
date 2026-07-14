import { Autoplay, FreeMode, Mousewheel, Navigation, Pagination, Scrollbar } from "swiper/modules";
import { SwiperOptions } from "swiper/types";

// --- Text slider ---
export const text_swiper_params: SwiperOptions = {
    modules: [Autoplay, FreeMode],
    loop: true,
    freeMode: true,
    slidesPerView: 'auto',
    spaceBetween: 10,
    centeredSlides: true,
    allowTouchMove: false,
    speed: 10000,
    autoplay: {
        delay: 1,
        disableOnInteraction: true,
    },
};

///testimonial-slider
export const testimonial_swiper_params: SwiperOptions = {
    modules: [Navigation, Pagination],
    spaceBetween: 40,
    centeredSlides: true,
    loop: true,
    speed: 500,
    navigation: {
        prevEl: '.tp-testimonial-prev',
        nextEl: '.tp-testimonial-next',
    },
    keyboard: {
        enabled: true,
    },
    pagination: {
        el: ".tp-dot",
        clickable: true,
    }
};
//home design studio testimonial swiper params
export const testimonial_swiper_two_params: SwiperOptions = {
    modules: [Navigation, Pagination],
    loop: true,
    spaceBetween: 40,
    centeredSlides: true,
    speed: 500,
    navigation: {
        prevEl: '.tp-testimonial-prev',
        nextEl: '.tp-testimonial-next',
    },
    pagination: {
        el: '#paginations',
        type: 'custom',
        renderCustom: function (swiper, current, total) {
            const html = `<div class="testimonial-progress-bar">
                      <span>${current}</span>
                      <span>/${total}</span>
                    </div>`;
            return html;
        },
    },
    on: {
        init: function (swiper) {
            swiper.pagination.render();
            swiper.pagination.update();
        },
    },
};


//service-slider
export const service_swiper_params: SwiperOptions = {
    spaceBetween: 30,
    loop: true,
    speed: 500,
    keyboard: { enabled: true },
    breakpoints: {
        '1400': { slidesPerView: 4 },
        '1200': { slidesPerView: 3 },
        '992': { slidesPerView: 2.8 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1.5 },
        '0': { slidesPerView: 1 },
    }
}

///project-slider
export const project_swiper_params: SwiperOptions = {
    modules: [Navigation],
    spaceBetween: 30,
    slidesPerView: 4,
    loop: true,
    speed: 500,
    navigation: {
        prevEl: '.dgm-portfolio-prev',
        nextEl: '.dgm-portfolio-next',
    },
    keyboard: {
        enabled: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 4 },
        '1200': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    }
};

///text-slider
export const portfolio_text_swiper_params: SwiperOptions = {
    modules: [Autoplay, FreeMode],
    loop: true,
    freeMode: true,
    slidesPerView: 'auto',
    spaceBetween: 10,
    centeredSlides: true,
    allowTouchMove: false,
    speed: 9000,
    autoplay: {
        delay: 1,
        disableOnInteraction: true,
    },
};


// Brand slider
export const dgm_brand_slide_params: SwiperOptions = {
    modules: [Autoplay, FreeMode],
    loop: true,
    freeMode: true,
    slidesPerView: 6,
    spaceBetween: 10,
    allowTouchMove: true,
    speed: 2000,
    autoplay: {
        delay: 1,
        disableOnInteraction: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 6 },
        '1200': { slidesPerView: 5 },
        '768': { slidesPerView: 3.8 },
        '576': { slidesPerView: 2.5 },
        '0': { slidesPerView: 2 },
    }
};

//thumb-slider
export const ca_thumb_slider_parms: SwiperOptions = {
    modules: [FreeMode, Scrollbar],
    loop: true,
    freeMode: true,
    spaceBetween: 24,
    centeredSlides: true,
    allowTouchMove: true,
    breakpoints: {
        '1400': { slidesPerView: 5 },
        '1200': { slidesPerView: 4 },
        '768': { slidesPerView: 3 },
        '576': { slidesPerView: 2.5 },
        '0': { slidesPerView: 1 },
    }
};

//ca-project-active
export const ca_project_active: SwiperOptions = {
    modules: [Navigation],
    spaceBetween: 30,
    loop: true,
    speed: 500,
    keyboard: {
        enabled: true,
    },
    navigation: {
        prevEl: '.ca-project-prev',
        nextEl: '.ca-project-next',
    },
    breakpoints: {
        '1400': { slidesPerView: 3 },
        '1200': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    }
};

//ca-testimoni-slide
export const ca_testimonial_params: SwiperOptions = {
    modules: [Autoplay, FreeMode],
    loop: true,
    freeMode: true,
    slidesPerView: 3.5,
    spaceBetween: 30,
    centeredSlides: true,
    allowTouchMove: false,
    speed: 5000,
    autoplay: {
        delay: 1,
        disableOnInteraction: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 3.5 },
        '1200': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    }
};

//Service slider
export const sa_service_slide_params: SwiperOptions = {
    modules: [Pagination],
    spaceBetween: 30,
    slidesPerView: 4,
    loop: true,
    speed: 500,
    pagination: {
        el: ".sa-service-dot",
        clickable: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 4 },
        '1200': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    }
};

//testimonial slider
export const sa_testimonial_slide_params: SwiperOptions = {
    modules: [Pagination],
    spaceBetween: 30,
    slidesPerView: 3,
    loop: true,
    speed: 500,
    centeredSlides: true,
    pagination: {
        el: ".sa-testimonial-dot",
        clickable: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 3 },
        '1200': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    }
};

// Service slider
export const cr_service_slider_params: SwiperOptions = {
    modules: [Navigation, Autoplay],
    loop: true,
    freeMode: true,
    slidesPerView: 3,
    spaceBetween: 30,
    allowTouchMove: true,
    speed: 1500,
    autoplay: false,
    navigation: {
        prevEl: '.cr-service-prv',
        nextEl: '.cr-service-next',
    },
    breakpoints: {
        '1400': { slidesPerView: 3 },
        '1200': { slidesPerView: 2.8 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    }
};

///testimonial-slider
export const testimonial_two_slider_params: SwiperOptions = {
    modules: [Pagination],
    spaceBetween: 30,
    slidesPerView: 1,
    loop: true,
    speed: 500,
    keyboard: {
        enabled: true,
    },
    pagination: {
        el: ".cr-testimonial-dot",
        clickable: true,
    }
};

//testimonial-slider
export const instagram_slider_params: SwiperOptions = {
    spaceBetween: 0,
    slidesPerView: 5,
    loop: true,
    speed: 500,
    keyboard: {
        enabled: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 6 },
        '1200': { slidesPerView: 5 },
        '768': { slidesPerView: 3 },
        '576': { slidesPerView: 2.5 },
        '0': { slidesPerView: 1 },
    }
};

///brand-slider
export const brand_slider_params: SwiperOptions = {
    modules: [FreeMode, Autoplay],
    loop: true,
    freeMode: true,
    slidesPerView: 'auto',
    spaceBetween: 30,
    centeredSlides: true,
    allowTouchMove: false,
    speed: 12000,
    autoplay: {
        delay: 1,
        disableOnInteraction: true,
    },
};
// portfolio-slider
export const portfolio_slider_params: SwiperOptions = {
    modules: [Navigation, Pagination],
    loop: true,
    spaceBetween: 24,
    slidesPerView: 4,
    speed: 500,
    navigation: {
        prevEl: '.tp-portfolio-prev',
        nextEl: '.tp-portfolio-next',
    },
    keyboard: {
        enabled: true,
    },
    pagination: {
        el: ".tp-dot",
        clickable: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 3.5 },
        '1200': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    },
};

// testimonial-slider
export const testimonial_slider_params: SwiperOptions = {
    modules: [Pagination],
    spaceBetween: 10,
    slidesPerView: 3,
    loop: true,
    speed: 500,
    centeredSlides: true,
    pagination: {
        el: ".bnc-testimonial-dot",
        clickable: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 3 },
        '1200': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    },
};

// Brand slider
export const brand2_slider_params: SwiperOptions = {
    modules: [FreeMode, Autoplay],
    loop: true,
    freeMode: true,
    slidesPerView: 6,
    spaceBetween: 10,
    centeredSlides: true,
    allowTouchMove: false,
    speed: 7000,
    autoplay: {
        delay: 1,
        disableOnInteraction: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 6 },
        '1200': { slidesPerView: 5 },
        '768': { slidesPerView: 3.8 },
        '576': { slidesPerView: 2.5 },
        '0': { slidesPerView: 2 },
    }
};
//HR Consulting Brand Slider Props
export const hr_brand_slide_params: SwiperOptions = {
    modules: [FreeMode, Autoplay],
    loop: true,
    freeMode: true,
    slidesPerView: 'auto',
    spaceBetween: 100,
    centeredSlides: true,
    allowTouchMove: false,
    speed: 2000,
    autoplay: {
        delay: 1,
        disableOnInteraction: true,
    },
};

// Team slider
export const hr_team_params: SwiperOptions = {
    modules: [Navigation],
    spaceBetween: 30,
    slidesPerView: 3,
    loop: true,
    speed: 500,
    keyboard: {
        enabled: true,
    },
    navigation: {
        prevEl: '.hr-team-prev',
        nextEl: '.hr-team-next',
    },
    breakpoints: {
        '1400': { slidesPerView: 3 },
        '1200': { slidesPerView: 3 },
        '992': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1.5 },
        '0': { slidesPerView: 1 },
    }
};

// testimonial-slider
export const hr_testimonial_swiper_params: SwiperOptions = {
    modules: [Navigation],
    spaceBetween: 40,
    centeredSlides: true,
    loop: true,
    speed: 500,
    navigation: {
        prevEl: '.tp-testimonial-prev',
        nextEl: '.tp-testimonial-next',
    },
    keyboard: {
        enabled: true,
    },
    pagination: {
        el: ".tp-dot",
        clickable: true,
    }
};

// lawyer agency service slider props
export const lw_service_swiper_params: SwiperOptions = {
    modules: [Navigation],
    spaceBetween: 30,
    slidesPerView: 3,
    loop: true,
    speed: 500,
    keyboard: {
        enabled: true,
    },
    navigation: {
        prevEl: '.lw-service-prev',
        nextEl: '.lw-service-next',
    },
    breakpoints: {
        '1400': { slidesPerView: 3 },
        '1200': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    }
};
// lawyer agency service two slider props
export const lw_service_swiper_params_two: SwiperOptions = {
    modules: [Pagination, Autoplay],
    loop: true,
    slidesPerView: 4,
    spaceBetween: 30,
    speed: 200,
    autoplay: true,
    pagination: {
        el: ".lw-service-dot",
        clickable: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 4 },
        '1200': { slidesPerView: 3.5 },
        '992': { slidesPerView: 2.8 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    }
};
// lawyer agency project slider props
export const lw_project_swiper_params: SwiperOptions = {
    modules: [Pagination, Autoplay],
    loop: true,
    slidesPerView: 4,
    spaceBetween: 30,
    speed: 200,
    autoplay: true,
    pagination: {
        el: ".lw-project-dot",
        clickable: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 4 },
        '1200': { slidesPerView: 3.5 },
        '992': { slidesPerView: 2.8 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    }
};

//lawyer agency testimonial slider params
export const lw_testimonial_swiper_params: SwiperOptions = {
    modules: [Pagination, Autoplay],
    loop: true,
    slidesPerView: 3,
    spaceBetween: 30,
    speed: 200,
    autoplay: true,
    pagination: {
        el: ".lw-testimonial-dot",
        clickable: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 3 },
        '1200': { slidesPerView: 3 },
        '992': { slidesPerView: 2 },
        '768': { slidesPerView: 1.6 },
        '576': { slidesPerView: 1 },
        '0': { slidesPerView: 1 },
    }
};

// Brand slider
export const dgm_brand_swiper_params: SwiperOptions = {
    modules: [FreeMode, Autoplay],
    loop: true,
    freeMode: true,
    slidesPerView: 6,
    spaceBetween: 0,
    allowTouchMove: true,
    speed: 2000,
    autoplay: {
        delay: 1,
        disableOnInteraction: true,
    },
    breakpoints: {
        '1400': { slidesPerView: 6 },
        '1200': { slidesPerView: 5 },
        '768': { slidesPerView: 3.8 },
        '576': { slidesPerView: 2.5 },
        '0': { slidesPerView: 2 },
    }
};
//about us testimonial slider
export const aboutUs_testimonial_params: SwiperOptions = {
    modules: [Pagination],
    spaceBetween: 30,
    slidesPerView: 1,
    loop: true,
    speed: 500,
    keyboard: {
        enabled: true,
    },
    pagination: {
        el: ".cr-testimonial-dot",
        clickable: true,
    }
};

// tp-project-showcase-slide-active
export const project_showcase_params: SwiperOptions = {
    modules: [Navigation, Mousewheel],
    slidesPerView: 1,
    loop: true,
    spaceBetween: 24,
    allowTouchMove: true,
    mousewheel: true,
    speed: 600,
    navigation: {
        nextEl: '.tp-project-showcase-next',
        prevEl: '.tp-project-showcase-prev',
    },
    breakpoints: {
        '1400': { slidesPerView: 4 },
        '1200': { slidesPerView: 3 },
        '991': { slidesPerView: 3 },
        '768': { slidesPerView: 2 },
        '576': { slidesPerView: 2 },
        '0': { slidesPerView: 1 },
    },
};
// blog postbox slide active params
export const blog_postbox_params: SwiperOptions = {
    modules: [Navigation],
    slidesPerView: 1,
    loop: true,
    autoplay: false,
    spaceBetween: 0,
    speed: 1000,
    breakpoints: {
        '1400': {
            slidesPerView: 1,
        }
    },
    // Navigation arrows
    navigation: {
        prevEl: '.postbox-arrow-prev',
        nextEl: '.postbox-arrow-next',
    },
};