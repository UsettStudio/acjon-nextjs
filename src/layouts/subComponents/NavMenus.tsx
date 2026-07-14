"use client";
import menuData from "@/data/header-menu-data/menuData";
import { MegaMenuItem } from "@/types/menu-d-t";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function NavMenus({ bgClassName = "megamenu-white-bg" }: { bgClassName?: string }) {
  const [hoveredMenu, setHoveredMenu] = useState<number | null>(menuData[0]?.id || null);

  // Render mega menu items with images for Home menu
  const renderMegaMenuWithImages = (megaMenu: MegaMenuItem[] = []) => {
    return (
      <div className="tp-home-menu">
        <div className="row row-cols-1 row-cols-xl-4 row-cols-xxl-5">
          {megaMenu.map((item, index) => (
            <div key={index} className="col">
              <div className="tp-home-menu-item mb-40">
                <Link href={item.link}>
                  <div className="tp-home-menu-item-thumb">
                    {item.image && (
                      <Image
                        width={333}
                        height={333}
                        style={{ width: "100%", height: "auto" }}
                        src={item.image}
                        alt={item.title}
                      />
                    )}
                  </div>
                  <h4 className="tp-home-menu-item-title">{item.title}</h4>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render regular mega menu items
  const renderRegularMegaMenu = (megaMenu: MegaMenuItem[] = []) => {
    return (
      <ul>
        {megaMenu.map((item, j) => (
          <li key={j}>
            <Link href={item.link}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ul>
      {menuData.map((menu) => (
        <li
          key={menu.id}
          className={`has-dropdown ${menu.megaMenu || menu.smallMenu || menu.mediumMenu ? "p-static" : ""} ${hoveredMenu === menu.id ? 'active' : ''}`}
          onMouseEnter={() => setHoveredMenu(menu.id)}
          onMouseLeave={() => setHoveredMenu(null)}
        >
          <Link href={menu.link}>
            {menu.title}
            {menu.pluseIncon && (
              <span className="dropdown-btn"></span>
            )}
          </Link>

          {/* Mega Menu for Home */}
          {menu.megaMenu && menu.title === "Home" && menu.submenus?.[0]?.megaMenu && (
            <div className={`tp-megamenu-wrapper tp-home-image mega-menu ${bgClassName}`}>
              {renderMegaMenuWithImages(menu.submenus[0].megaMenu)}
            </div>
          )}

          {/* Mega Menu for Pages (smallMenu) */}
          {menu.smallMenu && menu.submenus && (
            <div className={`tp-megamenu-wrapper mega-menu container-1000 ${bgClassName}`}>
              <div className="row gx-0">
                {menu.submenus.map((submenu, i) => (
                  <div key={i} className="col-xl-3">
                    <div className="tp-megamenu-list">
                      {submenu.megaMenu && renderRegularMegaMenu(submenu.megaMenu)}
                    </div>
                  </div>
                ))}
                {/* Add thumbnail column for Pages menu */}
                <div className="col-xl-3">
                  <div className="tp-megamenu-list-thumb">
                    <Image
                      width={259}
                      height={385}
                      src="/assets/img/menu-img/menu-sidebar.png"
                      alt="Menu Sidebar"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mega Menu for Portfolio (mediumMenu) */}
          {menu.mediumMenu && menu.submenus && (
            <div className={`tp-megamenu-wrapper mega-menu container-1000 ${bgClassName}`}>
              <div className="row gx-0">
                {menu.submenus.map((submenu, i) => (
                  <div key={i} className="col-xl-4">
                    <div className="tp-megamenu-list">
                      {submenu.megaMenu && renderRegularMegaMenu(submenu.megaMenu)}
                    </div>
                  </div>
                ))}
                {/* Menu Thumbnail */}
                {menu.menuThumb?.isThumb && (
                  <div className="col-xl-4">
                    <div className="tp-megamenu-list-thumb">
                      <Image
                        style={{ width: "auto", height: "auto" }}
                        width={341}
                        height={512}
                        src={menu.menuThumb.thumbSrc}
                        alt={menu.menuThumb.thumbAlt || ""}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Regular Dropdown for Shop, Blog, Contact */}
          {!menu.megaMenu && !menu.smallMenu && !menu.mediumMenu && menu.submenus && (
            <ul className="tp-submenu submenu">
              {menu.submenus.map((submenu, i) => (
                <li key={i}>
                  <Link href={submenu.link || "#"}>
                    {submenu.title}
                  </Link>
                  {/* Nested submenus */}
                  {submenu.submenus && (
                    <ul className="tp-submenu submenu">
                      {submenu.submenus.map((nestedSubmenu, j) => (
                        <li key={j}>
                          <Link href={nestedSubmenu.link || "#"}>
                            {nestedSubmenu.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}