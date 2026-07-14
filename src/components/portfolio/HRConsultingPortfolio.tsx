import HRConsultingPortfolioItem from './subComponents/HRConsultingPortfolioItem';
import { ShapeTitleLine } from '@/svg/ShapeIcons';
import projectData from '@/data/projectData';

const HRConsultingPortfolio = () => {
    // Define tab buttons dynamically
    const tabs = [
        { id: 'home', label: 'All', active: true },
        { id: 'profile', label: 'Digital' },
        { id: 'contact', label: 'Branding' },
        { id: 'web', label: 'Web' },
    ];

    // Shared portfolio data slice
    const displayedProjects = projectData.slice(46, 49);

    return (
        <div className="hr-portfolio-ptb hr-gradient-bg pt-105 pb-105 pl-160 pr-160 z-index-1">
            {/* === Section Header === */}
            <div className="hr-portfolio-top mb-50">
                <div className="row align-items-end">
                    <div className="col-xl-6">
                        <div className="hr-portfolio-title-box">
                            <span
                                className="tp-section-subtitle st-dot st-border white-style tp_fade_anim"
                                data-delay=".3"
                            >
                                Our Latest Portfolio
                            </span>
                            <h4 className="tp-section-title tl-spacegro text-case-int text-white tp-split-title">
                                Shaping the future <br /> with{' '}
                                <span className="clr p-relative">
                                    creativity.{" "}
                                    <ShapeTitleLine />
                                </span>
                            </h4>
                        </div>
                    </div>

                    {/* === Dynamic Tabs === */}
                    <div className="col-xl-6">
                        <div className="hr-portfolio-tab-btn tp_fade_anim" data-delay=".3">
                            <ul
                                className="nav nav-tab justify-content-xl-end"
                                id="portfolioTabs"
                                role="tablist"
                            >
                                {tabs.map(({ id, label, active }) => (
                                    <li key={id} className="nav-item" role="presentation">
                                        <button
                                            className={`nav-links ${active ? 'active' : ''}`}
                                            id={`${id}-tab`}
                                            data-bs-toggle="tab"
                                            data-bs-target={`#${id}-tab-pane`}
                                            type="button"
                                            role="tab"
                                            aria-controls={`${id}-tab-pane`}
                                            aria-selected={active ? 'true' : 'false'}
                                        >
                                            {label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* === Tab Content === */}
            <div className="row">
                <div
                    className="hr-portfolio-content-wrap tp_fade_anim"
                    data-delay=".5"
                >
                    <div className="tab-content" id="portfolioTabsContent">
                        {tabs.map(({ id, active }) => (
                            <div
                                key={id}
                                className={`tab-pane fade ${active ? 'show active' : ''}`}
                                id={`${id}-tab-pane`}
                                role="tabpanel"
                                aria-labelledby={`${id}-tab`}
                                tabIndex={0}
                            >
                                <div className="row">
                                    {displayedProjects.map((portfolio, index) => (
                                        <HRConsultingPortfolioItem
                                            key={index}
                                            {...portfolio}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRConsultingPortfolio;
