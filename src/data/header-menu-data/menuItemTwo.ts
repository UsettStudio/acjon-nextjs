
// types/menu-d-t.ts
export interface MenuImageItem {
    title: string;
    href: string;
    img: string;
}

export interface MenuColumn {
    items?: {
        title: string;
        href: string;
    }[];
    image?: string;
}

export interface MenuItemTwoDT {
    id: number;
    title: string;
    href: string;
    type: "mega" | "submenu";
    isScrollable: boolean;
    homeImages?: MenuImageItem[];
    columns?: MenuColumn[];
    subItems?: {
        title: string;
        href: string;
    }[];
}


const menuItemsTwo: MenuItemTwoDT[] = [
    {
        id: 1,
        title: "Home",
        href: "/",
        type: "mega",
        isScrollable: true,
        homeImages: [
            { title: "Digital Agency", href: "/", img: "/assets/img/menu-img/img-1.jpg" },
            { title: "Digital Marketing", href: "/digital-marketing", img: "/assets/img/menu-img/img-6.jpg" },
            { title: "Creative Agency", href: "/creative-agency", img: "/assets/img/menu-img/img-2.jpg" },
            { title: "Startup Agency", href: "/startup-agency", img: "/assets/img/menu-img/img-5.jpg" },
            { title: "Corporate Agency", href: "/corporate-agency", img: "/assets/img/menu-img/img-7.jpg" },
            { title: "Personal Portfolio", href: "/personal-portfolio", img: "/assets/img/menu-img/img-11.jpg" },
            { title: "Business Consulting", href: "/business-consulting", img: "/assets/img/menu-img/img-8.jpg" },
            { title: "Design Studio", href: "/design-studio", img: "/assets/img/menu-img/img-4.jpg" },
            { title: "Hr Consulting", href: "/hr-consulting", img: "/assets/img/menu-img/img-9.jpg" },
            { title: "Lawyer Agency", href: "/lawyer-agency", img: "/assets/img/menu-img/img-10.jpg" },
            { title: "Modern Agency", href: "/modern-agency", img: "/assets/img/menu-img/img-3.jpg" },
            { title: "Portfolio Webgl", href: "/portfolio-webgl-showcase", img: "/assets/img/menu-img/img-13.jpg" },
            { title: "Portfolio Creative Thumb", href: "/portfolio-creative-thumb-slider", img: "/assets/img/menu-img/img-14.jpg" },
            { title: "Portfolio Interactive", href: "/portfolio-interactive-with-hover", img: "/assets/img/menu-img/img-15.jpg" },
            { title: "Shop Modern", href: "/shop", img: "/assets/img/menu-img/img-12.jpg" },
        ],
    },

    {
        id: 2,
        title: "Pages",
        href: "#",
        type: "mega",
        isScrollable: false,
        columns: [
            {
                items: [
                    { title: "About", href: "/about" },
                    { title: "About Us", href: "/about-us" },
                    { title: "About Me", href: "/about-me" },
                    { title: "Career", href: "/career" },
                    { title: "Career Details", href: "/career-details" },
                ],
            },
            {
                items: [
                    { title: "Service", href: "/service" },
                    { title: "Service Two", href: "/service-2" },
                    { title: "Service Three", href: "/service-3" },
                    { title: "Service Details", href: "/service-details" },
                    { title: "Job Application", href: "/job-application-form" },
                ],
            },
            {
                items: [
                    { title: "Team", href: "/team" },
                    { title: "Team Details", href: "/team-details" },
                    { title: "Pricing", href: "/pricing" },
                    { title: "Faq", href: "/faq" },
                    { title: "404 error", href: "/404" },
                ],
            },
        ],
    },

    {
        id: 3,
        title: "Portfolio",
        href: "/project-single",
        type: "mega",
        isScrollable: false,
        columns: [
            {
                items: [
                    { title: "Project Two Column", href: "/project-two-column" },
                    { title: "Project Three Column", href: "/project-three-column" },
                    { title: "Project Full Page", href: "/project-full" },
                    { title: "Project Grid 3", href: "/project-nogap" },
                    { title: "Project Masonry", href: "/project-mesonary" },
                    { title: "Project Metro", href: "/project-single" },
                    { title: "Project Pinterest", href: "/project-list" },
                ],
            },
            {
                items: [
                    { title: "Project Slider", href: "/project-slider" },
                    { title: "Portfolio Webgl", href: "/portfolio-webgl-showcase" },
                    { title: "Portfolio Skew Slider", href: "/portfolio-creative-skew-slider" },
                    { title: "Portfolio Thumb Slider", href: "/portfolio-creative-thumb-slider" },
                    { title: "Portfolio Interactive", href: "/portfolio-interactive-with-hover" },
                    { title: "Project Details", href: "/project-details" },
                    { title: "Project Details Two", href: "/project-details-2" },
                ],
            },
        ],
    },

    {
        id: 4,
        title: "Shop",
        href: "/shop",
        type: "submenu",
        isScrollable: false,
        subItems: [
            { title: "Shop Modern", href: "/index-shop" },
            { title: "Shop Sidebar", href: "/shop" },
            { title: "Shop Details", href: "/product-details" },
            { title: "Cart", href: "/cart" },
            { title: "Checkout", href: "/checkout" },
            { title: "Login", href: "/login" },
            { title: "Register", href: "/register" },
        ],
    },

    {
        id: 5,
        title: "Blog",
        href: "/blog",
        type: "submenu",
        isScrollable: false,
        subItems: [
            { title: "Blog", href: "/blog" },
            { title: "Blog Two", href: "/blog-2" },
            { title: "Blog Sidebar", href: "/blog-sidebar" },
            { title: "Blog Standard", href: "/blog-sidebar-2" },
            { title: "Blog Details", href: "/blog-details" },
            { title: "Blog Details Full Width", href: "/blog-details-2" },
        ],
    },

    {
        id: 6,
        title: "Contact",
        href: "/contact-us",
        type: "submenu",
        isScrollable: false,
        subItems: [
            { title: "Contact Me", href: "/contact-me" },
            { title: "Contact Us", href: "/contact-us" },
        ],
    },
];

export default menuItemsTwo;
