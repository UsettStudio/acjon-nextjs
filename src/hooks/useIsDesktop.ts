"use client";

import { useEffect, useState } from "react";

interface UseIsDesktopOptions {
    breakpoint?: number;
}

const useIsDesktop = ({ breakpoint = 1199 }: UseIsDesktopOptions = {}) => {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= breakpoint);
        };

        // initial check
        checkScreenSize();

        window.addEventListener("resize", checkScreenSize);

        return () => {
            window.removeEventListener("resize", checkScreenSize);
        };
    }, [breakpoint]);

    return isDesktop;
};

export default useIsDesktop;
