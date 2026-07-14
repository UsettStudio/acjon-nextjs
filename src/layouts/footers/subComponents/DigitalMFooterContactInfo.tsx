import Link from 'next/link';

const DigitalMFooterContactInfo = () => {
    return (
        <div className="tp-footer-widget mb-40 tp-footer-3-col-1 tp_fade_anim" data-delay=".3">
            <div className="tp-footer-widget-info mb-30">
                <h4 className="tp-footer-widget-title ff-unbounded fs-16 fw-500 mb-30">Address</h4>
                <span>
                    <Link className="tp-line-black" href="#">
                        4517 Washington Ave. Manchester, <br />
                        Kentucky 39495
                    </Link>
                </span>
                <p>
                    Mail :
                    <Link className="tp-line-white" href="mailto:support@gmail.com"> support@gmail.com</Link>
                </p>
                <p>
                    Ph :
                    <Link className="tp-line-white" href="tel:012345678"> +452-(239) 555-010</Link>
                </p>
            </div>
        </div>
    );
};

export default DigitalMFooterContactInfo;