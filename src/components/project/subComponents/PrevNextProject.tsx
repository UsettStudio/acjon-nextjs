import GridIcon from "@/svg/GridIcon";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type NavProject = {
    label: string;
    category: string;
    title: string;
    image: string;
    align: "left" | "right";
};

const navProjects: NavProject[] = [
    {
        label: "Prev project",
        category: "Branding",
        title: "The Innovation\nBlueprint",
        image: "/assets/img/inner-image/project/details/nav.jpg",
        align: "left",
    },
    {
        label: "Next project",
        category: "Branding",
        title: "The Innovation\nBlueprint",
        image: "/assets/img/inner-image/project/details/nav-2.jpg",
        align: "right",
    },
];

const ProjectNavItem: React.FC<NavProject> = ({
    label,
    category,
    title,
    image,
    align,
}) => {
    const isRight = align === "right";

    return (
        <div
            className={`tp-project-navigation-btn-wrap mb-30 ${isRight ? "text-end" : ""
                }`}
        >
            <Link
                href="#"
                className="tp-project-navigation-btn mb-30 d-inline-block"
            >
                {label}
            </Link>

            <div
                className={`tp-project-navigation-thumb d-flex align-items-center ${isRight ? "justify-content-end" : ""
                    }`}
            >
                {!isRight && (
                    <Image
                        width={193}
                        height={148}
                        className="img-fluid mr-30"
                        src={image}
                        alt={title}
                    />
                )}

                <div>
                    <span className="mb-10">{category}</span>
                    <h5 className="tp-project-navigation-title">
                        {title.split("\n").map((line, i) => (
                            <React.Fragment key={i}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </h5>
                </div>

                {isRight && (
                    <Image
                        width={193}
                        height={148}
                        className="ml-30"
                        src={image}
                        alt={title}
                    />
                )}
            </div>
        </div>
    );
};

const PrevNextProject = ({ paddingSpacingCls = "" }) => {
    return (
        <div className={`tp-project-navigation-wrap ${paddingSpacingCls}`}>
            <div className="row align-items-center">
                <div className="col-lg-5">
                    <ProjectNavItem {...navProjects[0]} />
                </div>

                <div className="col-lg-2">
                    <div className="tp-project-navigation-grid text-center mb-30">
                        <Link href="#">
                            <GridIcon />
                        </Link>
                    </div>
                </div>

                <div className="col-lg-5">
                    <ProjectNavItem {...navProjects[1]} />
                </div>
            </div>
        </div>
    );
};

export default PrevNextProject;
