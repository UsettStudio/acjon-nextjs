import projectData from "@/data/projectData";
import Image from "next/image";
import Link from "next/link";

// Alle Usett-prosjektbildene (robust: filtrerer på bildesti i stedet for
// skjøre array-indekser). Sikrer at ALLE 9 vises.
const usettProjects = projectData.filter(
    (p) => typeof p.image === "string" && p.image.includes("/design-studio/portfolio/usett-")
);

const DesignStudioPortfolio = () => {
    return (
        <div className="ds-portfolio-area">
            <div className="container-fluid gx-0">
                <div className="row gx-0">
                    {usettProjects.map((item, index) => (
                        <div key={index} className="col-lg-4 col-md-6">
                            <div className="ds-portfolio-item">
                                <div className="ds-portfolio-item-thumb">
                                    <Link className="tp-clip-anim" href="#kontakt-skjema">
                                        <Image
                                            width={635}
                                            height={712}
                                            className="tp-anim-img "
                                            src={item.image}
                                            alt={item.title}
                                            loading="eager"
                                            data-animate="true"
                                        />
                                    </Link>
                                </div>
                                <div className="ds-portfolio-item-content tp_fade_anim" data-delay=".6">
                                    <div className="ds-portfolio-item-content-hide">
                                        <span>
                                            {item.year} · {item.category}
                                        </span>
                                        <h3 className="ds-portfolio-item-title">
                                            <Link className="tp-line-black" href="#kontakt-skjema">
                                                {item.title}
                                            </Link>
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DesignStudioPortfolio;
