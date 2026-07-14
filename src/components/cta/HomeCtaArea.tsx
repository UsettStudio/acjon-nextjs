import Image from 'next/image';

const HomeCtaArea = () => {
    return (
        <div className="tp-cta-ptb pt-180 pb-155">
            <div className="container container-1510">
                <div className="row justify-content-center">
                    <div className="col-xl-12">
                        <div className="tp-cta-title-box text-center mb-30 tp_fade_anim" data-delay=".3">
                            <h4 className="tp-section-title tp-split-title fs-120 fw-120">
                                {`Let's Chat!`}
                                <Image className='img-fluid' width={266} height={140} src="/assets/img/digital-agency/cta/cta-1.png" alt="cta image" />
                                with us. <br /> Digital agency
                            </h4>
                        </div>
                    </div>
                    <div className="col-xl-5 col-lg-6">
                        <div className="tp-cta-input p-relative tp_fade_anim" data-delay=".7" data-duration="1" data-fade-from="top" data-ease="bounce">
                            <input type="text" placeholder="Enter your email" />
                            <button type="submit" className="tp-cta-btn tp-btn-green tp-btn-anim">
                                <span className="tp-btn-text">Subscribe</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeCtaArea;