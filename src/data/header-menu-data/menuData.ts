import { MenuItem } from "@/types/menu-d-t";

const menuData: MenuItem[] = [
  {
    id: 1,
    hasDropdown: true,
    active: true,
    megaMenu: true,
    children: true,
    title: "Home",
    pluseIncon: true,
    link: "/",
    submenus: [
      {
        link: "#",
        pluseIncon: true,
        megaMenu: [
          { title: "Digital Agency", link: "/", image: "/assets/img/menu-img/img-1.jpg" },
          { title: "Digital Marketing", link: "/digital-marketing", image: "/assets/img/menu-img/img-6.jpg" },
          { title: "Creative Agency", link: "/creative-agency", image: "/assets/img/menu-img/img-2.jpg" },
          { title: "Startup Agency", link: "/startup-agency", image: "/assets/img/menu-img/img-5.jpg" },
          { title: "Corporate Agency", link: "/corporate-agency", image: "/assets/img/menu-img/img-7.jpg" },
          { title: "Personal Portfolio", link: "/personal-portfolio", image: "/assets/img/menu-img/img-11.jpg" },
          { title: "Business Consulting", link: "/business-consulting", image: "/assets/img/menu-img/img-8.jpg" },
          { title: "Design Studio", link: "/design-studio", image: "/assets/img/menu-img/img-4.jpg" },
          { title: "Hr Consulting", link: "/hr-consulting", image: "/assets/img/menu-img/img-9.jpg" },
          { title: "Lawyer Agency", link: "/lawyer-agency", image: "/assets/img/menu-img/img-10.jpg" },
          { title: "Modern Agency", link: "/modern-agency", image: "/assets/img/menu-img/img-3.jpg" },
          { title: "Portfolio Webgl", link: "/portfolio-webgl-showcase", image: "/assets/img/menu-img/img-13.jpg" },
          { title: "Portfolio Creative Thumb", link: "/portfolio-creative-thumb", image: "/assets/img/menu-img/img-14.jpg" },
          { title: "Portfolio Interactive", link: "/portfolio-interactive-hover", image: "/assets/img/menu-img/img-15.jpg" },
          { title: "Shop Modern", link: "/shop-modern", image: "/assets/img/menu-img/img-12.jpg" }
        ]
      },
    ]
  },
  {
    id: 2,
    hasDropdown: true,
    active: true,
    children: true,
    title: "Pages",
    pluseIncon: true,
    link: "#",
    smallMenu: true,
    submenus: [
      {
        link: "#",
        pluseIncon: true,
        megaMenu: [
          { title: "About", link: "/about" },
          { title: "About Us", link: "/about-us" },
          { title: "About Me", link: "/about-me" },
          { title: "Career", link: "/career" },
          { title: "Career Details", link: "/career-details" }
        ]
      },
      {
        link: "#",
        pluseIncon: true,
        megaMenu: [
          { title: "Service", link: "/service" },
          { title: "Service Two", link: "/service-2" },
          { title: "Service Three", link: "/service-3" },
          { title: "Service Details", link: "/service-details" },
          { title: "Job Application", link: "/job-application-form" }
        ]
      },
      {
        link: "#",
        pluseIncon: true,
        megaMenu: [
          { title: "Team", link: "/team" },
          { title: "Team Details", link: "/team-details" },
          { title: "Pricing", link: "/pricing" },
          { title: "Faq", link: "/faq" },
          { title: "404 error", link: "/404" }
        ]
      }
    ]
  },
  {
    id: 3,
    hasDropdown: true,
    active: true,
    children: true,
    title: "Portfolio",
    pluseIncon: true,
    mediumMenu: true,
    link: "/project-single",
    submenus: [
      {
        link: "#",
        pluseIncon: true,
        megaMenu: [
          { title: "Project Two Column", link: "/project-two-column" },
          { title: "Project Three Column", link: "/project-three-column" },
          { title: "Project Full Page", link: "/project-full" },
          { title: "Project Grid 3", link: "/project-nogap" },
          { title: "Project Masonry", link: "/project-mesonary" },
          { title: "Project Metro", link: "/project-single" },
          { title: "Project List", link: "/project-list" }
        ]
      },
      {
        link: "#",
        pluseIncon: true,
        megaMenu: [
          { title: "Project Slider", link: "/project-slider" },
          { title: "Portfolio Webgl", link: "/portfolio-webgl-showcase" },
          { title: "Portfolio Skew Slider", link: "/portfolio-skew-slider" },
          { title: "Portfolio Thumb Slider", link: "/portfolio-creative-thumb" },
          { title: "Portfolio Interactive", link: "/portfolio-interactive-hover" },
          { title: "Project Details", link: "/project-details" },
          { title: "Project Details Two", link: "/project-details-2" }
        ]
      }
    ],
    menuThumb: {
      title: "Mega Menu Thumb",
      link: "#",
      pluseIncon: true,
      isThumb: true,
      thumbSrc: "/assets/img/menu-img/menu-sidebar-2.png",
      thumbAlt: "Portfolio showcase"
    }
  },
  {
    id: 4,
    hasDropdown: true,
    active: true,
    megaMenu: false,
    children: true,
    title: "Shop",
    pluseIncon: true,
    link: "/shop",
    submenus: [
      {
        title: "Shop Modern",
        link: "/shop-modern",
        pluseIncon: false
      },
      {
        title: "Shop Sidebar",
        link: "/shop",
        pluseIncon: false
      },
      {
        title: "Shop Details",
        link: "/product-details",
        pluseIncon: false
      },
      {
        title: "Cart",
        link: "/cart",
        pluseIncon: false
      },
      {
        title: "Checkout",
        link: "/checkout",
        pluseIncon: false
      },
      {
        title: "Login",
        link: "/login",
        pluseIncon: false
      },
      {
        title: "Register",
        link: "/register",
        pluseIncon: false
      }
    ]
  },
  {
    id: 5,
    hasDropdown: true,
    active: true,
    megaMenu: false,
    children: true,
    title: "Blog",
    pluseIncon: true,
    link: "/blog",
    submenus: [
      {
        title: "Blog",
        link: "/blog",
        pluseIncon: false
      },
      {
        title: "Blog Two",
        link: "/blog-2",
        pluseIncon: false
      },
      {
        title: "Blog Sidebar",
        link: "/blog-sidebar",
        pluseIncon: false
      },
      {
        title: "Blog Standard",
        link: "/blog-sidebar-2",
        pluseIncon: false
      },
      {
        title: "Blog Details",
        link: "/blog-details",
        pluseIncon: false
      },
      {
        title: "Blog Details Full Width",
        link: "/blog-details-2",
        pluseIncon: false
      }
    ]
  },
  {
    id: 6,
    hasDropdown: true,
    active: true,
    megaMenu: false,
    children: true,
    title: "Contact",
    pluseIncon: true,
    link: "/contact-us",
    submenus: [
      {
        title: "Contact Me",
        link: "/contact-me",
        pluseIncon: false
      },
      {
        title: "Contact Us",
        link: "/contact-us",
        pluseIncon: false
      }
    ]
  }
];

export default menuData;