import { WorkLineIcon } from '@/svg/ShapeIcons';
import Image from 'next/image';
import Link from 'next/link';

const workItems = [
  {
    id: 1,
    thumb: "/assets/img/startup-agancy/work/work-thumb-1.jpg",
    href: "/project-details",
    hideCursor: true,
  },
  {
    id: 2,
    thumb: "/assets/img/startup-agancy/work/work-thumb-2.jpg",
    href: "/project-details",
    hideCursor: true,
  },
  {
    id: 3,
    thumb: "/assets/img/startup-agancy/work/work-thumb-3.jpg",
    href: "/project-details",
    hideCursor: true,
  },
];

const StartupAgencyWorkArea = () => {
  return (
    <div className="sa-work-ptb pt-150 mb-200">
      <div className="container container-1510">
        <div className="row">
          <div className="col-lg-12">
            <div className="sa-work-title-box text-center mb-70">
              <span className="sa-work-subtitle">
                Our Recent Work
                <WorkLineIcon />
              </span>
              <h4 className="sa-work-title tp-text-perspective">Work</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="sa-work-wrap">
        {workItems.map(({ id, thumb, href, hideCursor }) => (
          <div
            key={id}
            className={`sa-work-item sa-work-panel p-relative mb-60 ${hideCursor ? "not-hide-cursor" : ""
              }`}
            data-cursor="View<br>Demo"
          >
            <div className="sa-work-portfolio-thumb">
              <Link className={`d-block ${hideCursor ? "cursor-hide" : ""}`} href={href}>
                <Image className='img-fluid' width={1905} height={943} src={thumb} alt={`Work ${id}`} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StartupAgencyWorkArea;
