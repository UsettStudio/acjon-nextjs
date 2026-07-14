"use client";
import { menuItemsThree } from '@/data/header-menu-data/menuItemsThree';
import { scrollToSection } from '@/utils/scrollToSection';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const HOME_PATH = "/design-studio";

const MenuStyleTwo = ({ onNavigate }: { onNavigate?: () => void }) => {
    const [hoveredMenu, setHoveredMenu] = useState<number | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    const handleClick = (e: React.MouseEvent, link: string) => {
        const hashIndex = link.indexOf("#");
        // Anker-lenke til en seksjon på forsiden
        if (hashIndex !== -1) {
            const hash = link.substring(hashIndex);
            e.preventDefault();
            onNavigate?.(); // lukk offcanvas
            const onHome = pathname === HOME_PATH || pathname === "/";
            if (onHome) {
                // liten forsinkelse så offcanvas rekker å lukke / smoother resumer
                setTimeout(() => scrollToSection(hash), 250);
            } else {
                router.push(HOME_PATH + hash);
            }
            return;
        }
        // Vanlig sidelenke
        onNavigate?.();
    };

    return (
        <ul>
            {menuItemsThree.map((item, index) => (
                <li
                    key={`menu-${index}`}
                    className={`p-static ${hoveredMenu === index || hoveredMenu === null ? 'is-active-2' : ''}`}
                    onMouseEnter={() => setHoveredMenu(index)}
                    onMouseLeave={() => setHoveredMenu(null)}
                >
                    <Link href={item.link} onClick={(e) => handleClick(e, item.link)}>
                        {item.title}
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default MenuStyleTwo;
