'use client';

import React, { useEffect, useState } from "react";
import { BackToTopArrowIcon } from "@/svg";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 200px
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div
      className={`back-to-top-wrapper ${isVisible ? 'back-to-top-btn-show' : ''}`}
      onClick={scrollToTop}
    >
      <button id="back_to_top" type="button" className="back-to-top-btn">
        <BackToTopArrowIcon />
      </button>
    </div>
  );
}