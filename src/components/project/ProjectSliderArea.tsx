"use client";
import { project_showcase_params } from "@/constants/swiper";
import { ArrowProjectNextPrevIcon } from "@/svg/ArrowIcon";
import { Swiper, SwiperSlide } from "swiper/react";
import projectData from "@/data/projectData";
import Image from "next/image";
import Link from "next/link";

const ProjectSliderArea = () => {
    // Display specific project items from projectData
    const displayProjectItems = projectData.slice(91, 97);

    return (
        <div className="tp-project-slide-area fix tp-project-slide-spacing">
            <div className="container-fluid p-0">
                <div className="row">
                    <div className="col-12">
                        <Swiper
                            className="tp-project-showcase-slide-active"
                            {...project_showcase_params}
                        >
                            {displayProjectItems.map((slide) => (
                                <SwiperSlide key={slide.id}>
                                    <div className="tp-project-slide-thumb position-relative">
                                        <Image
                                            width={462} height={576}
                                            className="img-fluid w-100"
                                            src={slide.image}
                                            alt={slide.title}
                                        />
                                        <div className="tp-project-slide-wrap">
                                            <div className="tp-project-slide-content">
                                                <h3 className="tp-project-slide-title">
                                                    <Link
                                                        href={`/project-details/${slide.id}`}
                                                        className="tp-line-black"
                                                    >
                                                        {slide.title}
                                                    </Link>
                                                </h3>
                                                <span>{slide.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="tp-project-showcase-pagenation pt-60">
                <div className="container-fluid container-1510">
                    <div className="row">
                        <div className="col-12">
                            <div className="tp-project-showcase-nav d-flex justify-content-between">
                                <span className="tp-project-showcase-prev">
                                    <span className="mr-15">
                                        <ArrowProjectNextPrevIcon direction="left" />
                                    </span>
                                    Prev
                                </span>

                                <span className="tp-project-showcase-next">
                                    Next
                                    <span className="ml-15">
                                        <ArrowProjectNextPrevIcon direction="right" />
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectSliderArea;
