"use client"
import DigitalMServiceItem from './subComponents/DigitalMServiceItem';
import { service_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import servicesData from '@/data/serviceData';

const DigittalMarketingService = () => {
    return (
            <div className="dgm-service-area dgm-service-pt p-relative pb-40">
                <span className="dgm-service-bg"></span>
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="dgm-service-active">
                                <Swiper
                                    {...service_swiper_params}
                                >
                                    {servicesData.slice(6, 12).map((item) => (
                                        <SwiperSlide key={item.id}>
                                            <DigitalMServiceItem service={item} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default DigittalMarketingService;
