import Link from "next/link";
import React from "react";

type FooterMenuProps = {
    items: { label: string; href?: string; className?: string }[];
};

const FooterMenu: React.FC<FooterMenuProps> = ({ items }) => {
    return (
        <ul>
            {items.map((item, index) =>
                item.href ? (
                    <li key={index}>
                        <Link
                            href={item.href}
                            className={`tp-hover-line-white border-up ${item.className || ""}`}
                        >
                            {item.label}
                        </Link>
                    </li>
                ) : (
                    <li key={index}>{item.label}</li>
                )
            )}
        </ul>
    );
};

export default FooterMenu;
