import React from 'react';
import projectData from "@/data/projectData";
import ProjectSlider from '../slider/ProjectSlider';

const PersonalPortfolioProject: React.FC = () => {
  const slides = projectData.slice(25, 35);

  return (
    <section
      className="d-flex align-items-center justify-content-start position-relative z-index-1 fix pt-100 pb-100 h-100"
      style={{ backgroundColor: "#17120A" }}
    >
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <ProjectSlider slides={slides} />
            {/* Big Title */}
            <h2 className="tp-3d-slide-bigtitle d-none d-xl-block">Work</h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalPortfolioProject;