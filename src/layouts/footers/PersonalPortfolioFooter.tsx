import PersonalPFooterCopyright from './subComponents/PersonalPFooterCopyright';
import { ArrowIconSeven } from '@/svg/ArrowIcon';
import { ArrowIconTwo } from '@/svg';
import Link from 'next/link';
import Image from 'next/image';

interface AboutMeStyleProps {
    sectionPaddingClass?: string;
    sectionBgColor?: string;
    showDecorativeShape?: boolean;
    sectionWrapClass?: string;
}

const PersonalPortfolioFooter = ({
    sectionPaddingClass = "pt-50",
    sectionBgColor = "#17120A",
    showDecorativeShape = false,
    sectionWrapClass = "",

}: AboutMeStyleProps) => {
    return (
        <div className="d-flex align-items-end justify-content-center h-100"
            style={{ backgroundColor: sectionBgColor }}>
            <div className={`${sectionWrapClass} p-relative ${sectionPaddingClass} w-100`}>
                {showDecorativeShape && (
                    <div
                        className="tp-footer-10-shape z-index-1"
                        data-speed="1.1"
                    >
                        <Image
                            width={166}
                            height={382}
                            src="/assets/img/inner-image/footer/footer-shape.png"
                            alt="decorative shape"
                        />
                    </div>
                )}
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="tp-footer-10-wrapper text-center pb-180">
                                <div className="tp-footer-10-btn-box d-flex justify-content-center mb-50">
                                    <Link className="tp-footer-10-btn" href="/contact-me">
                                        Contact Me{" "}
                                        <span>
                                            <ArrowIconSeven />
                                        </span>
                                    </Link>
                                    <Link className="tp-footer-10-btn" href="assets/img/cv/mycv.docx">
                                        Download CV{" "}
                                        <span>
                                            <ArrowIconSeven />
                                        </span>
                                    </Link>
                                </div>
                                <div className="tp-footer-10-mail-box mb-70">
                                    <div className="tp-about-me-hero-work">
                                        <span>Open to work</span>
                                    </div>
                                    <h3 className="tp-footer-10-title"><Link href="mailto:themepure@gmail.com">themepure@gmail.com</Link></h3>
                                </div>
                                <div className="tp-footer-10-input-box">
                                    <div className="row row-cols-lg-4 row-cols-md-2 row-cols-1">
                                        <div className="col">
                                            <div className="tp-footer-10-input p-relative">
                                                <input type="text" placeholder="Facebook" />
                                                <button><ArrowIconTwo /></button>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="tp-footer-10-input p-relative">
                                                <input type="text" placeholder="Instagram" />
                                                <button><ArrowIconTwo /></button>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="tp-footer-10-input p-relative">
                                                <input type="text" placeholder="twitter" />
                                                <button><ArrowIconTwo /></button>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="tp-footer-10-input p-relative">
                                                <input type="text" placeholder="LinkedIn" />
                                                <button><ArrowIconTwo /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* copyright */}
                    <PersonalPFooterCopyright />
                </div>
            </div>
        </div>
    );
};

export default PersonalPortfolioFooter;