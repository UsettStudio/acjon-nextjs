import ProjectBreadcrumb from "@/components/breadcrumb/ProjectBreadcrumb";
import AccordionItem from "@/components/faq/subComponents/AccordionItem";
import { faqData } from "@/data/faqData";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing - Digital Agency & Creative Portfolio",
};
const page = () => {
    return (
        <main>
            {/* Breadcrumb */}
            <ProjectBreadcrumb
                headingPrimary="Frequently Asked"
                headingSecondary="Questions"
                breadcrumbLabel="FAQ"
            />

            {/* FAQ Section */}
            <section className="tp-faq-ptb pb-160">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="tp-faq-accordion-wrap">
                                <div
                                    className="accordions"
                                    id="faqAccordion"
                                >
                                    {faqData.faq.map((item) => (
                                        <AccordionItem
                                            key={item.id}
                                            id={item.id}
                                            question={item.question}
                                            answer={item.answer}
                                            show={item.show}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default page;