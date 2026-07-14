import { BreadcrumbTriangle, ServiceTwoShapeIcon } from "@/svg/ShapeIcons";

interface ProjectBreadcrumbProps {
  headingPrimary?: string;
  headingSecondary?: string;
  breadcrumbLabel?: string;
  description?: string;
}

const ProjectBreadcrumb = ({
  headingPrimary = "Our Creative",
  headingSecondary = "Real Projects",
  breadcrumbLabel = "Portfolio",
  description = "We are a forward-thinking digital creative agency dedicated to crafting impactful brand.",
}: ProjectBreadcrumbProps) => {
  return (
    <div className="tp-breadcrumb-s7-ptb tp-breadcrumb-s8-style position-relative">
      <span
        className="tp-breadcrumb-s7-shape d-none d-xl-block"
        data-speed=".9"
      >
        <ServiceTwoShapeIcon width="120" height="120" />
      </span>

      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="tp-breadcrumb-s7-title-wrap mb-35">
              <h4 className="tp-breadcrumb-s7-title text-uppercase tp-split-title">
                {headingPrimary}
                <br />
                <span className="mr-20">
                  <BreadcrumbTriangle width="59" height="54" />
                </span>{" "}
                {headingSecondary}
              </h4>
            </div>
          </div>

          <div className="col-xl-9 offset-xl-1">
            <div
              className="tp-breadcrumb-s7-content-wrap tp_fade_anim"
              data-delay=".5"
            >
              <div className="row">
                <div className="col-lg-3 col-md-3">
                  <div className="tp-breadcrumb-s7-subtitle">
                    <span className="tp-breadcrumb-s1-subtitle">
                      {breadcrumbLabel}
                    </span>
                  </div>
                </div>

                <div className="col-lg-5 col-md-8">
                  <div className="tp-breadcrumb-s7-content">
                    <p className="mb-5">{description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBreadcrumb;
