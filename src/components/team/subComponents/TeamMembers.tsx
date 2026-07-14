import teamMembers from "@/data/teamData";
import CommonTeamCard from "./CommonTeamCard";

const TeamMembers = () => {
    return (
        <div className="tp-team-ptb pt-160 pb-130" style={{ backgroundColor: "#010103" }}>
            <div className="container container-1480">
                <div className="tp-team-inner-wrap">
                    <div className="row">
                            {teamMembers.slice(33, 41).map((member, index) => (
                                <div key={index} className="col-xl-3 col-lg-4 col-md-6">
                                    <CommonTeamCard {...member} />
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamMembers;