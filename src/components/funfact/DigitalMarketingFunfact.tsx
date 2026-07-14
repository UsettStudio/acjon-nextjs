"use client"
import { portfolio_text_swiper_params } from '@/constants/swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { StarIconFive } from '@/svg';

const slides = [
    "Digital Agency -",
    "Digital Agency -",
    "Digital Agency -",
    "Digital Agency -",
    "Digital Agency -",
    "Digital Agency -"
];

const funfacts = [
    {
        id: 1,
        icon: <StarIconFive />,
        value: null,
        label: null,
        className: "mr-50"
    },
    {
        id: 2,
        icon: null,
        value: <><em>14</em>k</>,
        label: "Complete project",
        className: "mr-30"
    },
    {
        id: 3,
        icon: null,
        value: <><em>20</em>+</>,
        label: "Top Agency Awards",
        className: ""
    }
];

const DigitalMarketingFunfact = () => {
    return (
        <div className="dgm-funfact-ptb pt-135 pb-120">
            <div className="container-fluid">
                <div className="row align-items-center">

                    {/* Slider Section */}
                    <div className="col-xl-7">
                        <div className="dgm-funfact-slider-wrap mr-70">
                            <Swiper
                                className='dgm-portfolio-text-active slide-transtion'
                                {...portfolio_text_swiper_params}
                            >
                                {slides.map((text, index) => (
                                    <SwiperSlide key={index}>
                                        <div className="dgm-portfolio-slider-item">
                                            <p>{text}</p>
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>

                    {/* Funfact Section */}
                    <div className="col-xl-5">
                        <div className="dgm-funfact-wrap d-flex align-items-center">
                            {funfacts.map(({ id, icon, value, label, className }) => (
                                <div key={id} className={`dgm-funfact-item ${className}`}>
                                    {icon && <i className="dgm-funfact-icon">{icon}</i>}
                                    {value && <h4>{value}</h4>}
                                    {label && <span>{label}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DigitalMarketingFunfact;
