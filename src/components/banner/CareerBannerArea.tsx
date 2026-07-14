"use client";
import { scrollToSection } from "@/utils/scrollToSection";
import Image from "next/image";

const CareerBannerArea = () => {
    return (
        <div className="tp-career-inner-banner-ptb p-relative">
            <div className="tp-career-inner-shape smooth">
                <button
                    onClick={(e) =>
                        scrollToSection(e, {
                            target: "#b",
                            duration: 1,
                        })
                    }><Image width={134} height={134} src="/assets/img/inner-image/about/about-arrow.png" alt="arrow" /></button>
            </div>
            <div className="sa-banner-wrapper p-relative">
                <Image className="img-fluid" width={1905} height={1269} data-speed=".8" src="/assets/img/inner-image/about/about-banner-2.jpg" alt="about banner" />
            </div>
        </div>
    );
};

export default CareerBannerArea;