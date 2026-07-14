import { ContactShapeIcon } from "@/svg/ShapeIcons";
import ContactForm from "@/components/form/ContactForm";

/**
 * Kontakt-seksjon for one-page forsiden (#kontakt).
 * Gjenbruker samme skjema og stil som den egne kontaktsiden.
 */
const HomeKontakt = () => {
    return (
        <>
            <section className="tp-contact-us-top-ptb pt-150 pb-80 fix">
                <div className="container container-1480">
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="tp-contact-us-heading z-index-1">
                                <p className="tp-contact-us-subtitle">
                                    Har du et prosjekt eller en idé? Send oss en melding, <br />
                                    så hører du fra oss så snart som mulig.
                                </p>
                                <div className="tp-contact-us-shape pl-160">
                                    <span>
                                        <ContactShapeIcon />
                                    </span>
                                </div>
                                <h4 className="tp-contact-us-title tp-split-title">
                                    La oss ta <br /> en prat!
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div id="kontakt-skjema" className="tp-contact-us-form-ptb pb-160">
                <div className="container container-1480">
                    <div className="tp-contact-us-form-border">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="tp-contact-us-form-wrapper">
                                    <div className="tp-contact-us-form-heading text-center mb-50">
                                        <span className="tp-contact-us-form-subtitle">Ta kontakt</span>
                                        <h4 className="tp-contact-us-form-title">Hvordan kan vi hjelpe deg?</h4>
                                    </div>
                                    <div className="tp-contact-us-form-wrap">
                                        <ContactForm />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomeKontakt;
