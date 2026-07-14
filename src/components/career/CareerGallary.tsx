import Image from "next/image";

const CareerGallary = () => {
    return (
        <div className="tp-career-inner-gallery-ptb p-relative pb-130">
            <div className="tp-career-inner-gallery-shape" data-speed=".9">
                <Image width={49} height={48} src="/assets/img/inner-image/benefit/benefit-shape.png" alt="shape" />
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-lg-3">
                        <div className="tp-career-inner-gallery-item mb-30 mt-55 tp_fade_anim" data-delay=".3">
                            <Image className="img-fluid" width={314} height={329} src="/assets/img/inner-image/benefit/benefit-thumb-1.jpg" alt="thumb" />
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="tp-career-inner-gallery-item mb-30 tp_fade_anim" data-delay=".5">
                            <Image className="img-fluid" width={539} height={594} src="/assets/img/inner-image/benefit/benefit-thumb-2.jpg" alt="thumb 2" />
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="tp-career-inner-gallery-item mb-30 mt-25 tp_fade_anim" data-delay=".7">
                            <Image className="img-fluid" width={426} height={401} src="/assets/img/inner-image/benefit/benefit-thumb-3.jpg" alt="thumb 3" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerGallary;