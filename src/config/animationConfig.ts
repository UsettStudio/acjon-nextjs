// Create a central animation configuration object
// Each key represents a route (page path)
// Each value is an array of animation functions to run on that route

import { buttonTextAnim, charAnimation, fixedTitleAnim, fixedTitleAnim2, imageClipingEffect, initHoverBtnAnim, PortfolioAnimation, portfolioAnimation, ServicePanelAnimation, textPerspectiveAnim, textScrollBgAnim, WorkPinAnimation } from "@/hooks/useGsapAnimation";

export const animationConfig: Record<string, (() => void)[]> = {
    //home page animation
    "/digital-agency": [buttonTextAnim, charAnimation, fixedTitleAnim, textScrollBgAnim, imageClipingEffect, initHoverBtnAnim],
    //digital marketing page
    "/digital-marketing": [buttonTextAnim, imageClipingEffect, initHoverBtnAnim, textScrollBgAnim],
    //creative agency page
    "/creative-agency": [charAnimation, buttonTextAnim, fixedTitleAnim, imageClipingEffect, textScrollBgAnim, initHoverBtnAnim, portfolioAnimation, PortfolioAnimation],
    //startup agency page
    "/startup-agency": [buttonTextAnim, imageClipingEffect, textScrollBgAnim, initHoverBtnAnim, textPerspectiveAnim, WorkPinAnimation],
    //corporate agency page
    "/corporate-agency": [buttonTextAnim, imageClipingEffect],
    //business consulting page
    "/business-consulting": [buttonTextAnim, imageClipingEffect, textScrollBgAnim, textPerspectiveAnim],
    //design studio page
    "/design-studio": [buttonTextAnim, fixedTitleAnim2, imageClipingEffect],
    //hr consulting page
    "/hr-consulting": [buttonTextAnim, imageClipingEffect],
    //lawyer agency page
    "/lawyer-agency": [buttonTextAnim, imageClipingEffect],
    //modern agency page
    "/modern-agency": [buttonTextAnim, imageClipingEffect, textScrollBgAnim],
    //about page
    "/about": [initHoverBtnAnim, imageClipingEffect],
    //about us page
    "/about-us": [textScrollBgAnim],
    //about me page
    "/about-me": [textScrollBgAnim, textPerspectiveAnim],
    //career page
    "/career": [textPerspectiveAnim],
    //career page
    "/service": [charAnimation, textScrollBgAnim],
    //service 2 page
    "/service-2": [fixedTitleAnim],
    //service 3 page
    "/service-3": [ServicePanelAnimation],
    //service details page
    "/service-details": [imageClipingEffect, textPerspectiveAnim],
    //pricing page
    "/pricing": [imageClipingEffect, textPerspectiveAnim],
    //project pages
    "/project-two-column": [initHoverBtnAnim],
    "/project-three-column": [initHoverBtnAnim],
    "/project-full": [ServicePanelAnimation],
    "/project-mesonary": [initHoverBtnAnim],
    "/project-single": [fixedTitleAnim],
    //blog pages
    "/blog": [imageClipingEffect],
    "/blog-sidebar": [imageClipingEffect],
}