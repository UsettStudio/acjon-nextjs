"use client"
import DigitalMTestimonialItem from './subComponents/DigitalMTestimonialItem';
import { testimonial_swiper_params } from '@/constants/swiper';
import { useVideoModal } from '@/provider/VideoProvider';
import testimonialsData from '@/data/testimonialData';
import { Swiper, SwiperSlide } from 'swiper/react';
import { VideoPlayIcon } from '@/svg';
import Image from 'next/image';

const DigitalMTestimonial = () => {
    const { playVideo } = useVideoModal();
    return (
        <div className="tp-testimonial-area dgm-testimonial-style p-relative pt-140 pb-150 black-bg">
            <span className="tp-testimonial-shape-1">
                <Image width={220} height={140} src="/assets/img/digital-marketing/testimonial/testimonial-shape-1.jpg" alt="shape" />
            </span>
            <div className="container container-1510">
                <div className="dgm-testimonial-wrap mb-50">
                    <div className="row align-items-end">
                        <div className="col-xl-7">
                            <div className="dgm-testimonial-title-box">
                                <span className="tp-section-subtitle fs-13 st-unbounded st-dot st-border white-style">Testimonial</span>
                                <h4 className="tp-section-title tl-unbounded fs-42 tp-split-title text-white">
                                    Trusted by Innovators, <br /> Loved by Brands.
                                </h4>
                            </div>
                        </div>
                        <div className="col-xl-5">
                            <div className="dgm-testimonial-text tp-text-revel">
                                <p>
                                    we don&apos;t just create designs—we craft <br />
                                    experiences that leave a lasting impact Our <br />
                                    team of passionate designers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row gx-0">
                    <div className="col-lg-6">
                        <div className="tp-testimonial-left">
                            <div className="tp-testimonial-thumb tp-clip-anim p-relative">
                                <Image width={663} height={679} className="img-fluid w-100 h-100 tp-anim-img" data-animate="true"
                                    src="/assets/img/digital-marketing/testimonial/testimonial-1.jpg" alt="image" />
                                <button onClick={() => playVideo("VCPGMjCW0is")} className="tp-testimonial-play-btn popup-video z-index-3 video-animetion">
                                    <span>
                                        <VideoPlayIcon />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="tp-testimonial-right">
                            <div className="tp-testimonial-slider-wrap p-relative">
                                <Swiper
                                    className='tp-testimonial-active'
                                    {...testimonial_swiper_params}
                                >
                                    {testimonialsData.slice(3, 6).map((item, index) => (
                                        <SwiperSlide key={index}>
                                            <DigitalMTestimonialItem {...item} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                            <div className="tp-dot"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalMTestimonial;