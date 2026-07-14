
import CreativeAAwardItem from "./subComponents/CreativeAAwardItem";
import awardData from "@/data/awardData";

const CreativeAgencyAward = ({ customCls = "", spacingCustomCls = "pt-130" }) => {
    return (
        <div className={`ca-award-ptb ${customCls} ${spacingCustomCls}`}>
            <div className="container container-1410">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="ca-award-item-wrap">
                            {awardData.slice(6, 12).map((award, index) => (
                                <CreativeAAwardItem {...award} key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreativeAgencyAward;
