import Link from 'next/link';

const HomeFooterContactInfo = () => {
    return (
        <div className="col-xl-3 col-lg-4 col-md-6">
            <div
                className="tp-footer-widget mb-40 tp_fade_anim"
                data-delay=".5"
            >
                <div className="tp-footer-widget-info mb-30">
                    <h4 className="tp-footer-widget-title mb-25">Get in touch</h4>
                    <span>
                        <Link href="mailto:support@gmail.com">support@gmail.com</Link>
                    </span>
                    <span>
                        <Link href="tel:452(239)555010">+452-(239) 555-010</Link>
                    </span>
                </div>
                <div className="tp-footer-widget-info mb-30">
                    <h4 className="tp-footer-widget-title mb-25">Location</h4>
                    <span>
                        <Link href="https://www.google.com/maps" target="_blank">
                            4517 Washington Ave. Manchester, <br />
                            Kentucky 39495
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default HomeFooterContactInfo;