import { FeatureIconFive, FeatureIconFour, FeatureIconSeven, FeatureIconSix } from "@/svg/FeatureIcons";
import { FC, ReactNode } from "react";

type FeatureItem = {
  id: number;
  icon: ReactNode;
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  {
    id: 1,
    icon: <FeatureIconFour />,
    title: "Free Shipping",
    description: "Free Shipping for orders <br/> over $120",
  },
  {
    id: 2,
    icon: <FeatureIconFive />,
    title: "Refund",
    description: "Within 30 days for an <br/> exchange.",
  },
  {
    id: 3,
    icon: <FeatureIconSix />,
    title: "Support",
    description: "24 hours a day, 7 days <br/> a week",
  },
  {
    id: 4,
    icon: <FeatureIconSeven />,
    title: "Payment",
    description: "Pay with Multiple Credit <br/> Cards",
  },
];

const ShopFeature: FC = () => {
  return (
    <section className="features__area pt-80 pb-20">
      <div className="container">
        <div className="row">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="col-xl-3 col-lg-3 col-md-6 col-sm-6"
            >
              <div className="features__item-13 d-flex align-items-start mb-40">
                <div className="features__icon-13">
                  <span>{feature.icon}</span>
                </div>
                <div className="features__content-13">
                  <h3 className="features__title-13">{feature.title}</h3>
                  <p
                    dangerouslySetInnerHTML={{ __html: feature.description }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopFeature;
