"use client";
import CorporateATestiIteam from './subComponents/CorporateATestiIteam';
import { testimonial_two_slider_params } from '@/constants/swiper';
import testimonialsData from '@/data/testimonialData';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';

const shapes = [
    { src: "/assets/img/corporate-agency/testimonial/testi-1.png", className: "cr-testimonial-shape-1", speed: "1.1", alt: "testi1" },
    { src: "/assets/img/corporate-agency/testimonial/testi-2.png", className: "cr-testimonial-shape-2", speed: "1.2", alt: "testi2" },
    { src: "/assets/img/corporate-agency/testimonial/testi-3.png", className: "cr-testimonial-shape-3", speed: ".8", alt: "testi3" },
];

const CorporateATestimonial = () => {
    return (
        <div
            className="cr-testimonial-area cr-testimonial-style p-relative pt-120 pb-120"
            style={{ backgroundColor: "#093535" }}
        >
            <div className="cr-testimonial-bg">
                <Image width={1905} height={913} src="/assets/img/corporate-agency/testimonial/testimonial-bg.png" alt="bg image" />
            </div>
            <div className="cr-testimonial-shape">
                <Image width={258} height={260} src="/assets/img/corporate-agency/testimonial/testimonial-shape.png" alt="shape" />
            </div>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-8">
                        <div className="cr-testimonial-title-box text-center mb-40">
                            <span className="tp-section-subtitle st-dot white-style text-white tp-split-title">
                                Our Testimonial
                            </span>
                            <h4 className="tp-section-title tl-spacegro text-white fs-60 tp-split-title">
                                What our clients say <br /> about Us
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="row justify-content-center">
                    <div className="col-xl-10">
                        <div className="ds-testimonial-wrapper p-relative">
                            {/* floating shapes */}
                            {shapes.map((shapeItem, i) => (
                                <span className={shapeItem.className} key={i}>
                                    <Image className='img-fluid w-auto h-auto'
                                        width={250} height={250} data-speed={shapeItem.speed}
                                        src={shapeItem.src} alt={shapeItem.alt} />
                                </span>
                            ))}

                            <div className="ds-testimonial-slider-wrapper text-center">
                                <div className="cr-testimonial-active mb-35">
                                    <Swiper
                                        {...testimonial_two_slider_params}
                                    >
                                        {testimonialsData.slice(20, 24).map((item, i) => (
                                            <SwiperSlide key={i}>
                                                <CorporateATestiIteam {...item} />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                                <div className="cr-testimonial-dot"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateATestimonial;
