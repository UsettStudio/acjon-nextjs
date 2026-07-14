"use client"
import { ArrowIconSeventeen } from "@/svg/ArrowIcon";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

const slider_data = [
  {
    id: 1,
    pre_title: (
      <>
        Best Ear <br /> Headphones
      </>
    ),
    title: (
      <>
        Find Best <br /> Matley Sound.
      </>
    ),
    img: "/assets/img/shop/shop-home/slider-1.png",
  },
  {
    id: 2,
    pre_title: (
      <>
        Best Ear <br /> Headphones
      </>
    ),
    title: (
      <>
        Find Best <br /> Matley Sound.
      </>
    ),
    img: "/assets/img/shop/shop-home/slider-1.png",
  },
  {
    id: 3,
    pre_title: (
      <>
        Best Ear <br /> Headphones
      </>
    ),
    title: (
      <>
        Find Best <br /> Matley Sound.
      </>
    ),
    img: "/assets/img/shop/shop-home/slider-1.png",
  },
  {
    id: 4,
    pre_title: (
      <>
        Best Ear <br /> Headphones
      </>
    ),
    title: (
      <>
        Find Best <br /> Matley Sound.
      </>
    ),
    img: "/assets/img/shop/shop-home/slider-1.png",
  },
];

const ShopHeroBanner = () => {
  return (
    <>
      <section className="slider__area">
        <Swiper
          className="slider__active slider__active-13 swiper-container"
          slidesPerView={1}
          spaceBetween={0}
          effect="fade"
          modules={[EffectFade]}
        >
          {slider_data.map((item) => (
            <SwiperSlide
              key={item.id}
              className="slider__item-13 slider__height-13 grey-bg-17 d-flex align-items-end"
            >
              <div className="container">
                <div className="row align-self-end">
                  <div className="col-xl-6 col-lg-6">
                    <div className="slider__content-13">
                      <span className="slider__title-pre-13">
                        {item.pre_title}
                      </span>
                      <h3 className="slider__title-13">{item.title}</h3>

                      <div className="slider__btn-13 ">
                        <Link href="/shop" className="tp-btn-border">
                          Shop Now {" "}
                          <span>
                            <ArrowIconSeventeen />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-6 col-lg-6">
                    <div className="slider__thumb-13 text-end mr-40">
                      <span className="slider__thumb-13-circle-1"></span>
                      <span className="slider__thumb-13-circle-2"></span>
                      <Image
                        src={item.img}
                        alt="slider img"
                        width={460}
                        height={525}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </>
  );
};

export default ShopHeroBanner;
