import CorporateAFaqItem from './subComponents/CorporateAFaqItem';
import { PhoneIconTwo } from '@/svg/PhoneIcons';
import { faqDt } from '@/types/custom-dt';
import Image from 'next/image';
import Link from 'next/link';

const faqItems: faqDt[] = [
  {
    id: 'collapseOne',
    question: 'What services does your agency offer?',
    answer: `From branding to web development, their team delivered a seamless
             experience. The attention to detail, responsiveness,`,
    show: true,
  },
  {
    id: 'collapseTwo',
    question: 'Do you provide custom website solutions?',
    answer: `From branding to web development, their team delivered a seamless
             experience. The attention to detail, responsiveness,`,
  },
  {
    id: 'collapseThree',
    question: 'Can you redesign my existing website?',
    answer: `From branding to web development, their team delivered a seamless
             experience. The attention to detail, responsiveness,`,
  },
  {
    id: 'collapseFour',
    question: 'Do you offer digital marketing solutions?',
    answer: `From branding to web development, their team delivered a seamless
             experience. The attention to detail, responsiveness,`,
  },
  {
    id: 'collapseFive',
    question: 'Is there a consultation fee?',
    answer: `From branding to web development, their team delivered a seamless
             experience. The attention to detail, responsiveness,`,
  },
];

const CorporateAgencyFaq = () => {
  return (
    <div className="tp-faq-area cr-faq-style p-relative pt-120 pb-120">
      <div className="container container-1510">
        <div className="row">
          {/* Left Section */}
          <div className="col-lg-6">
            <div className="tp-faq-title-box p-relative mb-45">
              <span className="tp-section-subtitle st-spacegro fs-16 st-dot tp-split-title">
                Our Faq
              </span>
              <h3 className="tp-section-title tl-spacegro fw-700 fs-60 text-case-int mb-0 tp-split-title">
                Explore our frequently <br /> asked questions.
              </h3>
            </div>
            <div className="cr-faq-thumb">
              <Image
                className='img-fluid w-100 h-100'
                width={613}
                height={357}
                src="/assets/img/corporate-agency/faq/faq-1.jpg"
                alt="faq image"
              />
              <span className="cr-faq-tel d-flex align-items-center">
                <i>
                  <PhoneIconTwo />
                </i>
                <Link className="tp-line-white" href="tel:+125589(1452)025">
                  +125 589 (1452) 025
                </Link>
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-lg-6">
            <div className="tp-faq-accordion-wrap">
              <div className="accordions" id="accordionExample">
                {faqItems.map((item) => (
                  <CorporateAFaqItem key={item.id} {...item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateAgencyFaq;
