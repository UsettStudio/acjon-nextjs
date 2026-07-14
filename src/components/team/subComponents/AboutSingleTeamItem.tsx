import { FacebookIconTwo, InstragramIconTwo, PlusIcon, TwitorIcon } from "@/svg";
import { teamMemberDt } from "@/types/custom-dt";
import Image from "next/image";
import Link from "next/link";

const AboutSingleTeamItem:React.FC<teamMemberDt> = ({ id,name, role, image, delay, imgWidth, imgHeight }) => {
    const TeamSocialIcons = () => (
        <div className="tp-team-social-icon">
            <Link href="#"><FacebookIconTwo /></Link>
            <Link href="#"><TwitorIcon /></Link>
            <Link href="#"><InstragramIconTwo /></Link>
        </div>
    );
    return (
        <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="tp-team-item p-relative mb-30 tp_fade_anim" data-delay={`.${delay}`}>
                <div className="tp-team-thumb">
                    <Image width={imgWidth} height={imgHeight} src={image} alt={name} />
                </div>
                <div className="tp-team-content">
                    <h4 className="tp-team-title">
                        <Link className="tp-line-black" href={`/team-details/${id}`}>{name}</Link>
                    </h4>
                    <span>{role}</span>
                </div>
                <div className="tp-team-social">
                    <span className="tp-team-social-link"><PlusIcon /></span>
                    <TeamSocialIcons />
                </div>
            </div>
        </div>
    );
};

export default AboutSingleTeamItem;