import Image from "next/image";
import Link from "next/link";

/* ------------------ data ------------------ */

const contactInfoData = [
    {
        id: 1,
        country: "France",
        time: "12:00 pm GMT+2",
        image: "/assets/img/inner-image/contact/thumb-1.jpg",
        addressTitle: "Base Create",
        address: "Base Creative, 43 Appleton Lane, 3287 Hamilton",
        mapLink: "https://www.google.com/maps",
        phone: "(+91) 76001726",
        email: "Hello@contact.com",
    },
    {
        id: 2,
        country: "Germany",
        time: "12:00 pm GMT+2",
        image: "/assets/img/inner-image/contact/thumb-2.jpg",
        addressTitle: "Base Create",
        address: "Base Creative, 43 Appleton Lane, 3287 Hamilton",
        mapLink: "https://www.google.com/maps",
        phone: "(+91) 76001726",
        email: "Hello@contact.com",
    },
    {
        id: 3,
        country: "New Zealand",
        time: "12:00 pm GMT+2",
        image: "/assets/img/inner-image/contact/thumb-3.jpg",
        addressTitle: "Base Create",
        address: "Base Creative, 43 Appleton Lane, 3287 Hamilton",
        mapLink: "https://www.google.com/maps",
        phone: "(+91) 76001726",
        email: "Hello@contact.com",
    },
];

/* ------------------ component ------------------ */

const ContactInfoItem = () => {
    return (
        <>
            {contactInfoData.map((item, index) => {
                const isLast = index === contactInfoData.length - 1;

                return (
                    <div
                        key={item.id}
                        className={`cn-contact-info-item ${!isLast ? "mb-30" : ""}`}
                    >
                        <div className="row">
                            {/* Left */}
                            <div className="col-xl-7">
                                <div className="cn-contact-left d-flex flex-wrap align-items-center">
                                    <div className="cn-contact-info-thumb">
                                        <Image
                                            className="img-fluid"
                                            width={320}
                                            height={242}
                                            src={item.image}
                                            alt={item.country}
                                        />
                                    </div>

                                    <div className="cn-contact-left-info">
                                        <h4 className="cn-contact-left-title">
                                            {item.country}
                                        </h4>
                                        <span>
                                            <i className="fa-regular fa-clock"></i> {item.time}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right */}
                            <div className="col-xl-5">
                                <div className="cn-contact-right-wrap d-flex align-items-start justify-content-between">
                                    <div className="cn-contact-right">
                                        <div className="cn-contact-location">
                                            <span className="cn-contact-location-title">
                                                {item.addressTitle}
                                            </span>
                                            <Link href={item.mapLink} target="_blank">
                                                {item.address}
                                            </Link>
                                        </div>

                                        <div className="cn-contact-map">
                                            <Link href={item.mapLink} target="_blank">
                                                Google Maps
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="cn-contact-right-info text-start text-md-end">
                                        <Link href={`tel:${item.phone}`}>
                                            {item.phone}
                                        </Link>
                                        <br />
                                        <Link href={`mailto:${item.email}`}>
                                            {item.email}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default ContactInfoItem;
