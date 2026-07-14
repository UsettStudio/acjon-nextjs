"use client"
import Image from "next/image";
import Link from "next/link";
import React from "react";

// portfolio titles
const portfolio_titles = [
  {
    id: 1,
    title: "Silkvision",
    category: "Visual",
  },
  {
    id: 2,
    title: "Disefio Gräfico",
    category: "Creative",
  },
  {
    id: 3,
    title: "PSD Mockup",
    category: "Branding",
  },
  {
    id: 4,
    title: "Fastwire",
    category: "Branding",
  },
  {
    id: 5,
    title: "Tesla",
    category: "Mobile Application",
  },
  {
    id: 6,
    title: "Ecommerce",
    category: "Digital Design",
  },
  {
    id: 7,
    title: "Cosmetic",
    category: "Visual",
  },
  {
    id: 8,
    title: "Waves",
    category: "UI Design",
  },
];

// bg img
function BgImg({ imgSrc, id }: { imgSrc: string; id: string }) {
  return (
    <Image
      src={imgSrc}
      alt="bg-img"
      className={`tp-porfolio-10-bg-${id}`}
      width={1920}
      height={950}
    />
  );
}

export default function PortfolioHover() {
  const [activeBg, setActiveBg] = React.useState<string | null>('tp-porfolio-10-bg-4');
  function handleActiveBg(id: number) {
    setActiveBg(`tp-porfolio-10-bg-${id}`);

  }
  function handleDeactiveBg() {
    setActiveBg('tp-porfolio-10-bg-4');

  }
  return (
    <div className="tp-porfolio-10-area tp-porfolio-10-height p-relative fix">
      <div className="tp-porfolio-10-bg-wrap">
        <div id="tp-porfolio-10-bg-box" className={activeBg ? activeBg : ""}>
          <BgImg imgSrc="/assets/img/interactive-img/port-1.jpg" id="1" />
          <BgImg imgSrc="/assets/img/interactive-img/port-2.jpg" id="2" />
          <BgImg imgSrc="/assets/img/interactive-img/port-3.jpg" id="3" />
          <BgImg imgSrc="/assets/img/interactive-img/port-4.jpg" id="4" />
          <BgImg imgSrc="/assets/img/interactive-img/port-5.jpg" id="5" />
          <BgImg imgSrc="/assets/img/interactive-img/port-6.jpg" id="6" />
          <BgImg imgSrc="/assets/img/interactive-img/port-7.jpg" id="7" />
          <BgImg imgSrc="/assets/img/interactive-img/port-5.jpg" id="8" />
        </div>
      </div>
      <div className="container container-1380">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-porfolio-10-title-wrap z-index-5">
              <ul>
                {portfolio_titles.map((item) => (
                  <li
                    key={item.id}
                    onMouseEnter={() => handleActiveBg(item.id)}
                    onMouseLeave={() => handleDeactiveBg()}
                    className={
                      activeBg === `tp-porfolio-10-bg-${item.id}` ||
                        activeBg === null
                        ? "active"
                        : ""
                    }
                    rel={`tp-porfolio-10-bg-${item.id}`}
                  >
                    <Link href="/project-details">
                      <div className="tp-porfolio-10-title-box d-flex align-items-end">
                        <h2 className="tp-porfolio-10-title">{item.title}</h2>
                        <span className="tp-porfolio-10-category">
                          / {item.category}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
