"use client";
import { MenuItemTwoDT } from "@/data/header-menu-data/menuItemTwo";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  menus: MenuItemTwoDT[];
}

const MobileMenus: React.FC<Props> = ({ menus }) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const toggleMenu = (id: number) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <ul>
      {menus?.map((menu) => {
        const isActive = activeMenu === menu.id;

        const hasDropdown =
          menu.type === "mega" ||
          (menu.type === "submenu" && !!menu.subItems?.length);

        return (
          <li
            key={menu.id}
            className={`has-dropdown ${isActive ? "active" : ""}`}
          >
            {/* MENU TITLE */}
            <a
              href={menu.href}
              className="tp-btn-anim"
              onClick={(e) => {
                if (hasDropdown) {
                  e.preventDefault();
                  toggleMenu(menu.id);
                }
              }}
            >
              {menu.title}
            </a>

            {/* + / × BUTTON */}
            {hasDropdown && (
              <button
                className="tp-menu-close"
                onClick={() => toggleMenu(menu.id)}
                aria-label="Toggle menu"
              >
                <i
                  className={`fa-solid ${isActive ? "fa-xmark" : "fa-plus"
                    }`}
                />
              </button>
            )}

            {/* ===== MEGA MENU ===== */}
            {menu.type === "mega" && (
              <div
                className={`tp-megamenu-wrapper ${menu.isScrollable ? " tp-home-image" : ""} mega-menu megamenu-white-bg`}
                style={{ display: isActive ? "block" : "none" }}
              >
                <div className="row gx-0">
                  {/* HOME IMAGE MEGA MENU */}
                  {menu.homeImages && (
                    <div className="col-12">
                      <ul className="tp-megamenu-img-list">
                        {menu.homeImages.map((item, i) => (
                          <li key={i}>
                            <div className="tp-home-menu-item mb-40">
                              <Link href={item.href}>
                                <div className="tp-home-menu-item-thumb">
                                  <Image width={350} height={350} src={item.img} alt={item.title} />
                                </div>
                                <h4 className="tp-home-menu-item-title">{item.title}</h4>
                              </Link>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* COLUMN MENU */}
                  {menu.columns?.map((col, i) => (
                    <div className="col-xl-4" key={i}>
                      <div className="tp-megamenu-list">
                        {/* TEXT LINKS */}
                        {col.items && (
                          <ul>
                            {col.items.map((item, j) => (
                              <li key={j}>
                                <Link href={item.href}>{item.title}</Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== SIMPLE SUBMENU ===== */}
            {menu.type === "submenu" && menu.subItems && (
              <ul
                className="tp-submenu submenu"
                style={{ display: isActive ? "block" : "none" }}
              >
                {menu.subItems.map((sub, i) => (
                  <li key={i}>
                    <Link href={sub.href}>{sub.title}</Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default MobileMenus;


