"use client";
import { TextArrowIcon } from "@/svg/ArrowIcon";
import { ButtonArrowIconTwo } from "@/svg";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const services = [
    { id: 1, title: "Website Design", count: "(04)", rel: "ma-service-list-thumb-1", link: "/service-details" },
    { id: 2, title: "Social Media Strategy", count: "(03)", rel: "ma-service-list-thumb-2", link: "/service-details" },
    { id: 3, title: "E-Commerce Solutions", count: "(07)", rel: "ma-service-list-thumb-3", link: "/service-details" },
    { id: 4, title: "Data & Analytics", count: "(06)", rel: "ma-service-list-thumb-4", link: "/service-details" },
];

const ModernAgencyService = () => {
    const [activeId, setActiveId] = useState(1);

    return (
        <div className="ma-service-ptb p-relative pt-120 pb-120" style={{ backgroundColor: "#C9F31D" }}>
            <div className="container container-1510">
                {/* Heading */}
                <div className="row align-items-end">
                    <div className="col-lg-8">
                        <div className="ma-service-heading mb-30">
                            <span className="tp-section-subtitle fs-16 tp-split-title">{`// Services`}</span>
                            <h3 className="tp-section-title fs-62 tl-unbounded mb-15 tp-split-title">
                                The services we <br /> provide make
                            </h3>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="ma-service-btn mb-40 text-lg-end tp_fade_anim" data-delay=".5">
                            <Link href="/service" className="tp-btn-green btn-black-bg tp-btn-anim btn-h-60">
                                <div className="tp-btn-text">See All Services</div>
                                <span>
                                    <ButtonArrowIconTwo fillColor="#F5F7F5" />
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Left Thumbnail */}
                    <div className="col-lg-5">
                        <div className="ma-service-list-thumb-wrap p-relative">
                            <div id="ma-service-thumb" className={`ma-service-list-thumb-${activeId}`}>
                                <Image width={303} height={440} className="ma-service-list-thumb-1"
                                    src="/assets/img/modern-agency/service/service.jpg" alt="service" />
                                <Image width={303} height={440} className="ma-service-list-thumb-2"
                                    src="/assets/img/modern-agency/service/service-2.jpg" alt="service" />
                                <Image width={303} height={440} className="ma-service-list-thumb-3"
                                    src="/assets/img/modern-agency/service/service-3.jpg" alt="service" />
                                <Image width={303} height={440} className="ma-service-list-thumb-4"
                                    src="/assets/img/modern-agency/service/service-4.jpg" alt="service" />
                                <Image width={303} height={440} className="ma-service-list-thumb-5"
                                    src="/assets/img/modern-agency/service/service-5.jpg" alt="service" />

                                {[1, 2, 3, 4, 5].map((n) => (
                                    <div
                                        key={n}
                                        className={`ma-service-thumb-shape shape-${n} ${activeId === n ? "current" : ""}`}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Service List */}
                    <div className="col-lg-7">
                        <div className="ma-service-wrapper">
                            <div className="ma-service-right-wrap">
                                {services.map(({ id, title, count, rel, link }) => (
                                    <Link
                                        key={id}
                                        href={link}
                                        rel={rel}
                                        onMouseEnter={() => setActiveId(id)}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveId(id);
                                        }}
                                        className={`ma-service-item d-flex align-items-center justify-content-between ${activeId === id ? "active" : ""
                                            }`}
                                    >
                                        <div className="ma-service-item-left">
                                            <h4 className="ma-service-item-title">
                                                {title} <span>{count}</span>
                                            </h4>
                                        </div>
                                        <div className="ma-service-item-right">
                                            <span className="ma-service-item-icon">
                                                <TextArrowIcon />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernAgencyService;
