interface PortfolioItem {
    id: number;
    image: string;
    smallImage: string;
    name: string;
    link: string;
}

export const portfolioThumbSliderItems: PortfolioItem[] = [
    {
        id: 1,
        image: "/assets/img/project-slider-img/cr-slider-1.jpg",
        smallImage: "/assets/img/project-slider-img/cr-slider-1.jpg",
        name: 'Jon Piterson',
        link: '/project-details'
    },
    {
        id: 2,
        image: "/assets/img/project-slider-img/cr-slider-6.jpg",
        smallImage: "/assets/img/project-slider-img/cr-slider-small-6.jpg",
        name: 'Jean Gomez',
        link: '/project-details'
    },
    {
        id: 3,
        image: "/assets/img/project-slider-img/cr-slider-7.jpg",
        smallImage: "/assets/img/project-slider-img/cr-slider-small-7.jpg",
        name: 'Katia Ivanova',
        link: '/project-details'
    },
    {
        id: 4,
        image: "/assets/img/project-slider-img/cr-slider-8.jpg",
        smallImage: "/assets/img/project-slider-img/cr-slider-small-8.jpg",
        name: 'Adaora Musa',
        link: '/project-details'
    },
    {
        id: 5,
        image: "/assets/img/project-slider-img/cr-slider-9.jpg",
        smallImage: "/assets/img/project-slider-img/cr-slider-small-9.jpg",
        name: 'Mia Tobez',
        link: '/project-details'
    },
    {
        id: 6,
        image: "/assets/img/project-slider-img/cr-slider-10.jpg",
        smallImage: "/assets/img/project-slider-img/cr-slider-small-10.jpg",
        name: 'Anni Marire',
        link: '/project-details'
    }
];

// slider images
export const sliderImages = [
    "/assets/img/webgl/webgl-1.jpg",
    "/assets/img/webgl/webgl-1.jpg",
    "/assets/img/webgl/webgl-3.jpg",
    "/assets/img/webgl/webgl-4.jpg",
    "/assets/img/webgl/webgl-5.jpg",
    "/assets/img/webgl/webgl-6.jpg"
];
// Portfolio WebGL slides data
export const portfolioWebglSlides = [
    { id: 0, active: true, title: "Top Paddock" },
    { id: 1, active: false, title: "Stickers Pack" },
    { id: 2, active: false, title: "Diseno Grafico" },
    { id: 3, active: false, title: "Bright Cap" },
    { id: 4, active: false, title: "Grafico Jan" },
    { id: 5, active: false, title: "Bright Cap" }
].map(item => ({
    ...item,
    categories: ["UI", "Web Design"],
    link: "/project-details"
}));
