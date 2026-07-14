import { FacebookIconThree, InstragramIconThree, LinkdinIcon, TwitorIconThree } from '@/svg/SocialIcons';
import DesignSFooterCopyright from './subComponents/DesignSFooterCopyright';
import { TextArrowIcon } from '@/svg/ArrowIcon';
import { siteConfig } from '@/data/siteConfig';
import Image from 'next/image';
import Link from 'next/link';

const DesignStudioFooter = () => {
    return (
        <footer className="ds-footer-area pt-150" style={{ backgroundColor: "#010103" }}>
            <div className="ds-footer-top-wrap">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="ds-footer-heading tp_fade_anim" data-delay=".3">
                                <h3 className="tp-section-title tl-unbounded">
                                    har du et
                                    prosjekt i tankene?
                                </h3>
                                <p>Enten du trenger fotorealistisk 3D-visualisering, 3D-skanning <br />
                                    eller 3D-animasjon – vi hjelper deg i mål.</p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="ds-footer-btn z-index-1 text-lg-end tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
                                <Link className="tp-btn-circle shadow-circle" href="#kontakt-skjema">
                                    <span>
                                        <TextArrowIcon />
                                    </span>
                                    ta kontakt
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ds-footer-bottom-warp pt-70 pb-45">
                <div className="container container-1510">
                    <div className="row">
                        <div className="col-lg-3 col-md-6">
                            <div className="ds-footer-widget tp_fade_anim" data-delay=".3">
                                <div className="tp-footer-logo mb-40">
                                    <Link href="/"><Image width={150} height={103} style={{ width: "150px", height: "auto" }} src="/assets/img/logo/logo-white-v2.png" alt="Usett logo" /></Link>
                                </div>
                                <div className="ds-footer-social mb-40">
                                    <Link href="#">
                                        <span>
                                            <FacebookIconThree />
                                        </span>
                                    </Link>
                                    <Link href="#">
                                        <span>
                                            <TwitorIconThree />
                                        </span>
                                    </Link>
                                    <Link href="#">
                                        <span>
                                            <InstragramIconThree />
                                        </span>
                                    </Link>
                                    <Link href="#">
                                        <span>
                                            <LinkdinIcon />
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="ds-footer-widget tp_fade_anim" data-delay=".4">
                                <div className="tp-footer-widget-info mb-30">
                                    <h4 className="tp-footer-widget-title ff-unbounded fs-18 fw-500 mb-25">Adresse</h4>
                                    <span>
                                        Høvreveien 6<br />
                                        1712 Grålum
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="ds-footer-widget tp_fade_anim" data-delay=".5">
                                <div className="tp-footer-widget-info mb-30">
                                    <h4 className="tp-footer-widget-title ff-unbounded fs-18 fw-500 mb-25">Kontakt</h4>
                                    <span>
                                        <Link href="mailto:Mikael@Usett.no">Mikael@Usett.no</Link>
                                    </span>
                                    <span className="tel">
                                        <Link href="tel:+4792806558">+47 92 80 65 58</Link>
                                    </span>
                                    {/* Org-nummer vises automatisk når det fylles inn i siteConfig.orgNumber */}
                                    {siteConfig.orgNumber && (
                                        <span className="ds-footer-orgnr">
                                            Org.nr: {siteConfig.orgNumber}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <div className="ds-footer-widget tp_fade_anim" data-delay=".6">
                                <h4 className="tp-footer-widget-title ff-unbounded fs-18 fw-500 mb-25">nyhetsbrev</h4>
                                <div className="ds-footer-widget-input p-relative">
                                    <input type="text" placeholder="Din e-postadresse" />
                                    <button className="tp-btn-green">Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ds-copyright-area">
                <div className="container container-1510">
                    <DesignSFooterCopyright />
                </div>
            </div>
        </footer>
    );
};

export default DesignStudioFooter;