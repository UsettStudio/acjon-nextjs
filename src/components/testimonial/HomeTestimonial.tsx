"use client"
import { StarIconThree, TestimonialArrowIcon, VideoPlayIcon } from "@/svg";
import HomeTestimonialItem from "./subComponents/HomeTestimonialItem";
import { testimonial_swiper_params } from "@/constants/swiper";
import { useVideoModal } from "@/provider/VideoProvider";
import testimonialsData from "@/data/testimonialData";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import Link from "next/link";

const HomeTestimonial = () => {
    const { playVideo } = useVideoModal();

    return (
        <div className="tp-testimonial-ptb pt-120 pb-120 theme-bg">
            <div className="container container-1510">
                <div className="row align-items-center">
                    {/* left */}
                    <div className="col-xl-6 col-lg-5">
                        <div className="tp-testimonial-left p-relative">
                            <div className="tp-testimonial-social-wrap">
                                <div className="tp-testimonial-social">
                                    <Link href="#">Facebook</Link>
                                    <Link href="#">Instagram</Link>
                                    <Link href="#">Twitter</Link>
                                    <Link href="#">LinkedIn</Link>
                                </div>
                            </div>
                            <div className="tp-testimonial-thumb p-relative fix tp-clip-anim">
                                <Image width={651} height={753} className="w-100 tp-anim-img" data-animate="true" data-speed=".8"
                                    src="/assets/img/digital-agency/testimonial/testi-1.jpg" alt="testimonial" />
                                <button onClick={() => playVideo("VCPGMjCW0is")} className="tp-testimonial-play-btn popup-video video-animetion z-index-3">
                                    <span>
                                        <VideoPlayIcon />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* right */}
                    <div className="col-xl-6 col-lg-7">
                        <div className="tp-testimonial-right p-relative">
                            <span className="tp-testimonial-shape-1">
                                <Image width={346} height={333} src="/assets/img/digital-agency/shape/shape-2.png" alt="shape" />
                            </span>
                            <div className="tp-testimonial-title-box mb-30">
                                <h3 className="tp-section-title tp-split-title">
                                    What Clients Say <br /> About Us
                                </h3>
                            </div>

                            <div className="tp-testimonial-slider-wrap mt-70">
                                <Swiper
                                    className="tp-testimonial-active mb-50"
                                    {...testimonial_swiper_params}
                                >
                                    {testimonialsData.map((item, index) => (
                                        <SwiperSlide key={index}>
                                            <HomeTestimonialItem item={item} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {/* rating & arrows */}
                                <div className="tp-testimonial-slider-action d-flex justify-content-between align-items-center">
                                    <div className="tp-testimonial-slider-ratting d-flex align-items-center">
                                        <h4 className="tp-testimonial-slider-ratting-num">4.9</h4>
                                        <div className="tp-testimonial-slider-ratting-info">
                                            <span>
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <i key={i}>
                                                        <StarIconThree />
                                                    </i>
                                                ))}
                                            </span>
                                            <p>2,488 Rating</p>
                                        </div>
                                    </div>
                                    <div className="tp-testimonial-slider-arrow d-flex align-items-center">
                                        <div className="tp_fade_anim" data-delay=".3" data-duration="1" data-fade-from="top" data-ease="bounce">
                                            <button className="tp-testimonial-prev">
                                                <span>
                                                    <TestimonialArrowIcon direction="left" />
                                                </span>
                                            </button>
                                        </div>
                                        <div className="tp_fade_anim" data-delay=".6" data-duration="1" data-fade-from="top" data-ease="bounce">
                                            <button className="tp-testimonial-next">
                                                <span>
                                                    <TestimonialArrowIcon direction="right" />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* end right */}
                </div>
            </div>
        </div>
    );
};

export default HomeTestimonial;
