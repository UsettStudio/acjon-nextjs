import { BreadcrumbIcon } from "@/svg/ShapeIcons";

const CareerBreadcrumb = () => {
    return (
        <div className="tp-breadcrumb-s1-ptb pt-220 pb-120" style={{ backgroundColor: "#010103" }}>
            <div className="container container-1230">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="tp-breadcrumb-s3-content p-relative">
                            <div className="tp-breadcrumb-s3-shape">
                                <span><BreadcrumbIcon/></span>
                            </div>
                            <h4 className="tp-breadcrumb-s1-title text-center tp_fade_anim" data-delay=".3">
                                Create Impact. Inspire <br /> Together through design.
                            </h4>
                            <div className="tp-breadcrumb-s1-wrap tp_fade_anim" data-delay=".5">
                                <div className="tp-breadcrumb-s1-subtitle">Career</div>
                                <div className="tp-breadcrumb-s1-text">
                                    <p>We are a forward-thinking digital creative agency <br />
                                        dedicated to crafting impactful brand.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerBreadcrumb;