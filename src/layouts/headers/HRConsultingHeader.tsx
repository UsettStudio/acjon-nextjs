import { menuItemsThree } from '@/data/header-menu-data/menuItemsThree';
import { ArrowIconTwelve } from '@/svg';
import Image from 'next/image';
import Link from 'next/link';

const HRConsultingHeader = () => {
    return (
        <div className="hr-side-header z-index-5 d-none d-xl-flex flex-column justify-content-between">
            <div className="hr-side-header-logo">
                <Link href="/"><Image width={125} height={19} src="/assets/img/logo/logo-white.png" alt="logo white" /></Link>
            </div>
            <div className="hr-side-header-menu tp-header-dropdown">
                <nav className="tp-mobile-menu-active">
                    <ul>
                        {menuItemsThree.map((menu, index) => (
                            <li key={index} className="has-dropdown">
                                <Link href="#">{menu.title}</Link>
                                {menu.subMenu && (
                                    <ul className="tp-submenu submenu">
                                        {menu.subMenu.map((sub, subIndex) => (
                                            <li key={subIndex}>
                                                <Link href={sub.link}>{sub.name}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                )} 
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div className="hr-side-header-btn">
                <Link href="/service" className="tp-btn-green btn-h-60 br-8">
                    Free <br /> Consulting
                    <span>
                        <ArrowIconTwelve />
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default HRConsultingHeader;