import AboutSingleTeamItem from "./subComponents/AboutSingleTeamItem";
import teamMembers from "@/data/teamData";
import { ButtonArrowIcon } from "@/svg";
import Link from "next/link";

const AboutTeam = () => (
  <div className="tp-team-ptb pt-150 pb-120" style={{ backgroundColor: "#F6F6F9" }}>
    <div className="container container-1510">
      {/* Section Header */}
      <div className="tp-team-top-wrap mb-55">
        <div className="row align-items-end">
          <div className="col-xl-6 col-lg-8">
            <div className="tp-team-title-box">
              <span className="tp-section-subtitle st-unbounded st-dot st-border tp_fade_anim" data-delay=".3">Our Team</span>
              <h3 className="tp-section-title fs-42 tl-unbounded fw-600 tt-capitalize mb-0 tp-split-title">
                Introducing our <br /> skilled team!
              </h3>
            </div>
          </div>
          <div className="col-xl-6 col-lg-4">
            <div className="tp-team-btn text-lg-end tp_fade_anim" data-delay=".5" data-fade-from="top" data-ease="bounce">
              <Link className="tp-btn-green btn-black-bg tp-btn-anim btn-h-60" href="/team">
                <div className="tp-btn-text">Join Our Team</div>
                <span><ButtonArrowIcon /></span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="row">
        {teamMembers.slice(29, 33).map((member, idx) => (
          <AboutSingleTeamItem key={idx} {...member} />
        ))}
      </div>
    </div>
  </div>
);

export default AboutTeam;