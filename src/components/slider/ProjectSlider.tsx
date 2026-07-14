import { projectDt } from '@/types/custom-dt';
import React, { useEffect, useState } from 'react';

interface SliderProps {
    slides: projectDt[];
}

const ProjectSlider: React.FC<SliderProps> = ({ slides }) => {

    const hoverTextRefs: React.RefObject<HTMLDivElement | null>[] = [];
    const moveText = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
        const hoverTextRef = hoverTextRefs[index];

        if (hoverTextRef.current) {
            const item = hoverTextRef.current.getBoundingClientRect();
            const x = e.clientX - item.left; // Use item.left, not item.x
            const y = e.clientY - item.top;  // Use item.top, not item.y

            const children = hoverTextRef.current.children;
            if (children[0] && children[0].children[2]) {
                (children[0].children[2] as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
            }
        }
    };

    // 3d slider 
    const [activeIndex, setActiveIndex] = useState<number>(2);

    useEffect(() => {
        const tp3dSlideWrapper = document.getElementById('tp-3d-slide-wrapper');
        if (!tp3dSlideWrapper) return;

        const dir = document.documentElement.getAttribute('dir');
        let startX = 0;
        let endX = 0;

        const handleTouchStart = (event: TouchEvent) => {
            startX = event.touches[0].clientX;
        };

        const handleTouchEnd = (event: TouchEvent) => {
            endX = event.changedTouches[0].clientX;
            handleSwipe();
        };

        const handleSwipe = () => {
            const deltaX = endX - startX;
            const sensitivity = 50; // Adjust this value based on your desired sensitivity

            if (Math.abs(deltaX) > sensitivity) {
                if ((dir === 'rtl' && deltaX < 0) || (dir !== 'rtl' && deltaX > 0)) {
                    setActiveIndex((prev) => prev + 1);
                } else {
                    setActiveIndex((prev) => prev - 1);
                }
            }
        };

        tp3dSlideWrapper.addEventListener('touchstart', handleTouchStart);
        tp3dSlideWrapper.addEventListener('touchend', handleTouchEnd);

        const numberOfSlides = document.querySelectorAll('.tp-3d-slide').length;

        const handleArrowClick = (direction: 'left' | 'right') => {
            const nextIndex = direction === 'left' ? activeIndex - 1 : activeIndex + 1;
            if (nextIndex >= 0 && nextIndex < numberOfSlides) {
                setActiveIndex(nextIndex);
            }
        };

        const handleDotClick = (index: number) => {
            if (index >= 0 && index < numberOfSlides) {
                setActiveIndex(index);
            }
        };

        const updateSlides = () => {
            const slides = document.querySelectorAll('.tp-3d-slide');

            slides.forEach((slide, index) => {
                const classes = ['prev-1', 'prev-2', 'active', 'next-1', 'next-2'];
                slide.classList.remove(...classes);

                if (index === activeIndex) {
                    slide.classList.add('active');
                } else if (index === activeIndex - 1) {
                    slide.classList.add('prev-1');
                } else if (index === activeIndex - 2) {
                    slide.classList.add('prev-2');
                } else if (index === activeIndex + 1) {
                    slide.classList.add('next-1');
                } else if (index === activeIndex + 2) {
                    slide.classList.add('next-2');
                }
            });
        };

        const handleArrowClickWrapper = (event: Event) => {
            const target = event.currentTarget as HTMLDivElement;
            const direction = target.classList.contains('tp-3d-slide-arrow-left') ? 'left' : 'right';
            handleArrowClick(direction as 'left' | 'right');
        };

        const handleDotClickWrapper = (index: number) => {
            handleDotClick(index);
        };

        document.querySelectorAll('.tp-3d-slide-arrow-right, .tp-3d-slide-arrow-left').forEach((arrow) => {
            (arrow as HTMLDivElement).addEventListener('click', handleArrowClickWrapper);
        });

        document.querySelectorAll('.dots span').forEach((dot, index) => {
            dot.addEventListener('click', () => handleDotClickWrapper(index));
        });

        updateSlides();

        return () => {
            tp3dSlideWrapper.removeEventListener('touchstart', handleTouchStart);
            tp3dSlideWrapper.removeEventListener('touchend', handleTouchEnd);
            document.querySelectorAll('.tp-3d-slide-arrow-right, .tp-3d-slide-arrow-left').forEach((arrow) => {
                (arrow as HTMLDivElement).removeEventListener('click', handleArrowClickWrapper);
            });
            document.querySelectorAll('.dots span').forEach((dot, index) => {
                dot.removeEventListener('click', () => handleDotClickWrapper(index));
            });
        };
    }, [activeIndex]);


    return (
        <div className="tp-3d-slide-container position-relative">
            {/* Navigation Arrows */}
            <button
                className="tp-3d-slide-arrow tp-3d-slide-arrow-left z-index-9"
            >
                <span></span> PREV
            </button>

            <button
                className="tp-3d-slide-arrow tp-3d-slide-arrow-right z-index-9"
            >
                NEXT <span></span>
            </button>

            {/* Slide Wrapper */}
            <div className="tp-3d-slide-wrapper"
                id="tp-3d-slide-wrapper"

            >
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className="tp-3d-slide tp-hover-reveal-text"
                        ref={(element) => {
                            hoverTextRefs[index] = React.createRef();
                            hoverTextRefs[index].current = element;
                        }}
                        onMouseMove={(e) => moveText(e, index)}
                    >
                        {/* Your slide content here */}
                        <div
                            className="tp-portfolio-item-2 include-bg cursor-hide"
                            style={{ backgroundImage: `url(${slide.image})` }}
                            data-cursor="View<br/>Demo"
                        >
                            <div className="tp-portfolio-meta-2">
                                <span>{slide.category}</span>
                                <span>{slide.year}</span>
                            </div>
                            <h3 className="tp-portfolio-title-2">{slide.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectSlider;

