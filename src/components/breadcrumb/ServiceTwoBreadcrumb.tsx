import Link from "next/link";

const ServiceTwoBreadcrumb = () => {
    return (
        <div className="tp-breadcrumb-s1-ptb tp-breadcrumb-s6-ptb">
            <div className="container container-1510">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="tp-breadcrumb-s6-content">
                            <ul>
                                <li>Acjon <i className="fa-solid fa-angle-right"></i></li>
                                <li><Link href="/">Home</Link> <i className="fa-solid fa-angle-right"></i></li>
                                <li>Services</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceTwoBreadcrumb;