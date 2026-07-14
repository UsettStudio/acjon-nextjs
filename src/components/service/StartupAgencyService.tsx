"use client";
import StartupAServiceItem from './subComponents/StartupAServiceItem';
import { sa_service_slide_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import servicesData from '@/data/serviceData';

const StartupAgencyService = () => {
    return (
        <div className="sa-service-area pt-110 pb-120" style={{ backgroundColor: "#010103" }}>
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-4">
                        <div className="sa-service-title-box mb-80">
                            <span className="tp-section-subtitle st-unbounded st-dot st-border">Services us</span>
                        </div>
                    </div>
                    <div className="col-lg-8">
                        <div className="sa-service-title-box mb-80">
                            <h3 className="tp-section-title fs-42 tl-unbounded fw-500 tp-split-title">
                                Creative Services That <br />
                                Business Growth.
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sa-service-wrapper tp_fade_anim" data-delay=".5">
                <Swiper
                    className='sa-service-slider-active fix'
                    {...sa_service_slide_params}
                >
                    {servicesData.slice(19, 26).map((service, index) => (
                        <SwiperSlide key={index}>
                            <StartupAServiceItem {...service} key={index} />
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="sa-service-dot"></div>
            </div>
        </div>
    );
};

export default StartupAgencyService;
