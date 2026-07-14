import { ContactShapeIcon } from "@/svg/ShapeIcons";

/* ------------------ component ------------------ */

const ContactUsTopArea = () => {
    return (
        <section className="tp-contact-us-top-ptb pt-200 pb-80 fix">
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
    );
};

export default ContactUsTopArea;
