import { FeatureIcon, FeatureIconTwo, FeatureIconThree } from '@/svg/FeatureIcons';

const HRConsultingFeatureItem = () => {
    const features = [
        {
            id: 1,
            icon: <FeatureIcon />,
            title: 'People value',
            description: 'Our dedication to quality over quantity has earned us the trust of clients.'
        },
        {
            id: 2,
            icon: <FeatureIconTwo />,
            title: 'Societal value',
            description: 'Our dedication to quality over quantity has earned us the trust of clients.'
        },
        {
            id: 3,
            icon: <FeatureIconThree />,
            title: 'Sales value',
            description: 'Our dedication to quality over quantity has earned us the trust of clients.'
        },
    ];

    return (
        <div className="row gx-0">
            {features.map(({ id, icon, title, description }) => (
                <div key={id} className="col-xl-4 col-lg-4 col-md-6">
                    <div className="hr-feature-item d-flex align-items-start">
                        <span className="hr-feature-icon">{icon}</span>
                        <div className="hr-feature-content">
                            <h4 className="hr-feature-title">{title}</h4>
                            <p>
                                {description.split('<br />').join(' ')}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HRConsultingFeatureItem;
