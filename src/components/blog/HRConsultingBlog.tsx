"use client";
import HRConsultingBlogItem from './subComponents/HRConsultingBlogItem';
import { hr_team_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ShapeTitleLine } from '@/svg/ShapeIcons';
import { ArrowIconTwelve } from '@/svg';
import blogData from '@/data/blogData';

const HRConsultingBlog = () => {
    return (
        <div className="hr-blog-ptb pt-120 pb-90 pl-160 pr-160 z-index-1" style={{ backgroundColor: "#fff" }}>
            <div className="hr-blog-top mb-60">
                <div className="row align-items-end">
                    <div className="col-xl-8">
                        <div className="hr-blog-title-box">
                            <span className="tp-section-subtitle st-dot st-border tp_fade_anim" data-delay=".3">
                                Our Latest Blog
                            </span>
                            <h4 className="tp-section-title tl-spacegro text-case-int tp-split-title">
                                Your Source for <br /> Business &
                                <span className="p-relative">
                                    Creativity.
                                    <ShapeTitleLine />
                                </span>
                            </h4>
                        </div>
                    </div>
                    <div className="col-xl-4">
                        <div className="hr-team-arrow text-xl-end tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                            <button className="hr-team-prev">
                                <span>
                                    <ArrowIconTwelve direction='left' />
                                </span>
                            </button>{" "}
                            <button className="hr-team-next">
                                <span>
                                    <ArrowIconTwelve direction='right' />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hr-blog-slider-wrap tp_fade_anim" data-delay=".5">
                <div className="swiper hr-team-active">
                        <Swiper
                            {...hr_team_params}
                        >
                            {blogData.slice(20, 25).map((post) => (
                                <SwiperSlide key={post.id}>
                                    <HRConsultingBlogItem {...post} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                </div>
            </div>
        </div>
    );
};

export default HRConsultingBlog;