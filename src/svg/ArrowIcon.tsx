export const ButtonArrowIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="8" viewBox="0 0 21 8" fill="none">
            <path d="M0 6.99626L19 7L10.208 1" stroke="currentColor" />
        </svg>
    );
};
export const ButtonArrowIconTwo = ({ direction = "right", fillColor = "#010103" }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="11" viewBox="0 0 28 11" fill="none">
            <path d={direction === "right" ? "M0 9.00012L25.2915 9.0051L13.5882 1.00842" : "M28.0004 9.00012L2.70898 9.0051L14.4123 1.00842"} stroke={fillColor} strokeWidth="1.5" />
        </svg>
    );
};

export const TextArrowIcon = ({ width = "14", height = "12", strokeWidth = "1.5" }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 14 12" fill="none">
            <path d="M1.01301 10.9362L10.9225 1.65031L3.41074 2.83889" stroke="currentColor" strokeWidth={strokeWidth} />
        </svg>
    );
};
export const TextArrowIconTwo = () => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.75847 3.7738C6.82792 3.49509 12.1248 1.77781 16 0C14.2215 3.87444 12.5035 9.17057 12.2255 13.24L9.55153 7.53521L1.31164 15.7756C1.16743 15.9195 0.972007 16.0002 0.768319 16C0.616352 16 0.467807 15.9549 0.341461 15.8704C0.215114 15.786 0.116638 15.666 0.0584877 15.5256C0.000336834 15.3852 -0.0148807 15.2307 0.0147576 15.0817C0.044396 14.9326 0.117562 14.7957 0.225002 14.6882L8.46486 6.44846L2.75847 3.7738Z" fill="currentColor"></path>
        </svg>
    );
};
export const TestimonialArrowIcon = ({ direction = "right" }) => {
    return (
        <svg width="28" height="10" viewBox="0 0 28 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={direction === "right" ?
                "M0 8.99951L25.2915 9.00449L13.5882 1.00781"
                :
                "M28 8.99951L2.70855 9.00449L14.4118 1.00781"
            }
                stroke="currentcolor" strokeWidth="1.5" />
        </svg>
    );
};

export const BackToTopArrowIcon = () => {
    return (
        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 6L6 1L1 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                strokeLinejoin="round" />
        </svg>
    );
};
export const DropdownArrowIcon = () => {
    return (
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.06445L8 8.06445L15 1.06445" stroke="black" strokeWidth="1.5" />
        </svg>
    );
};
export const DropdownArrowIconTwo = () => {
    return (
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.06445L8 8.06445L15 1.06445" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
};
export const BottomArrowIcon = () => {
    return (
        <svg width="104" height="68" viewBox="0 0 104 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M82.6357 19.1429L82.8175 17.6539L82.7269 17.6429H82.6357V19.1429ZM90.9393 67.0607C91.5251 67.6464 92.4749 67.6464 93.0607 67.0607L102.607 57.5147C103.192 56.9289 103.192 55.9792 102.607 55.3934C102.021 54.8076 101.071 54.8076 100.485 55.3934L92 63.8787L83.5147 55.3934C82.9289 54.8076 81.9792 54.8076 81.3934 55.3934C80.8076 55.9792 80.8076 56.9289 81.3934 57.5147L90.9393 67.0607ZM0 2V3.5H59.9313V2V0.5H0V2ZM0 36.2857V37.7857H37.457V36.2857V34.7857H0V36.2857ZM0.37457 19.1429V20.6429H82.6357V19.1429V17.6429H0.37457V19.1429ZM82.6357 19.1429L82.454 20.6318C83.6928 20.783 85.7082 21.5219 87.4048 23.2944C89.066 25.0298 90.5 27.8384 90.5 32.2857H92H93.5C93.5 27.133 91.8126 23.5607 89.572 21.2199C87.3669 18.9162 84.7001 17.8837 82.8175 17.6539L82.6357 19.1429ZM92 32.2857H90.5V66H92H93.5V32.2857H92Z" fill="white" />
        </svg>
    );
};
export const ServiceArrowIcon = ({ direction = "right" }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="14" viewBox="0 0 26 14" fill="none">

            <path d={direction === "right" ?
                "M11.9778 0C15.5611 2.80304 21.3414 5.44996 26 7.00085C21.3414 8.55066 15.5611 11.1965 11.9785 14L14.4761 7.80444L0.894853 7.80481C0.657469 7.80454 0.429916 7.71972 0.26219 7.56898C0.136982 7.45659 0.0517224 7.31341 0.0171903 7.15754C-0.0173418 7.00167 0.000400054 6.84012 0.0681814 6.6933C0.135962 6.54649 0.250735 6.421 0.397989 6.3327C0.545242 6.24441 0.718369 6.19727 0.895477 6.19724L14.4762 6.19731L11.9778 0Z"
                :
                "M14.0222 0C10.4389 2.80304 4.6586 5.44996 0 7.00085C4.65858 8.55066 10.4389 11.1965 14.0215 14L11.5239 7.80444L25.1051 7.80481C25.3425 7.80454 25.5701 7.71972 25.7378 7.56898C25.863 7.45659 25.9483 7.31341 25.9828 7.15754C26.0173 7.00167 25.9996 6.84012 25.9318 6.6933C25.864 6.54649 25.7493 6.421 25.602 6.3327C25.4548 6.24441 25.2816 6.19727 25.1045 6.19724L11.5238 6.19731L14.0222 0Z"
            }
                fill="currentcolor" />
        </svg>
    );
};
export const ArrowIcon = () => {
    return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.82732 6.60415C11.9489 6.11641 21.2184 3.11117 28 0C24.8876 6.78027 21.8811 16.0485 21.3945 23.1699L16.7152 13.1866L2.29536 27.6073C2.043 27.859 1.70101 28.0003 1.34456 28C1.07862 27.9999 0.818662 27.921 0.597556 27.7733C0.37645 27.6255 0.204117 27.4155 0.102353 27.1698C0.000589459 26.9241 -0.0260412 26.6537 0.0258259 26.3929C0.077693 26.1321 0.205733 25.8925 0.393754 25.7044L14.8135 11.2848L4.82732 6.60415Z" fill="#010103" />
        </svg>
    );
};
export const ArrowIconTwo = ({ width = "14", height = "14" }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.41363 3.30208C5.97436 3.05821 10.6091 1.55558 13.9998 0C12.4436 3.39014 10.9404 8.02425 10.6972 11.585L8.3575 6.59331L1.14767 13.8037C1.02149 13.9295 0.850496 14.0001 0.672272 14C0.539302 14 0.409327 13.9605 0.298775 13.8866C0.188223 13.8128 0.102058 13.7077 0.0511761 13.5849C0.000294726 13.462 -0.0130205 13.3269 0.0129128 13.1965C0.0388461 13.066 0.102865 12.9462 0.196875 12.8522L7.40667 5.64241L2.41363 3.30208Z" fill="currentcolor" />
        </svg>
    );
};
export const ArrowIconThree = () => {
    return (
        <svg width="23" height="14" viewBox="0 0 23 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.2774 0.306152C13.3521 2.98661 18.3118 5.51778 22.3091 7.00085C18.3118 8.48288 13.3521 11.013 10.278 13.6939L12.4212 7.76929L0.767822 7.76965C0.564137 7.76939 0.368886 7.68827 0.22497 7.54413C0.117536 7.43665 0.04438 7.29973 0.01475 7.15068C-0.01488 7.00163 0.000343252 6.84714 0.0585025 6.70675C0.116661 6.56635 0.215141 6.44635 0.341491 6.36191C0.467841 6.27748 0.616391 6.2324 0.768357 6.23238L12.4212 6.23245L10.2774 0.306152Z" fill="#010103" />
        </svg>
    );
};
export const AwardArrowIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="6" viewBox="0 0 14 6" fill="none">
            <path d="M0 4.99751L12 5L6.44716 1" stroke="currentColor" />
        </svg>
    );
};
export const ArrowIconFour = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="36" viewBox="0 0 50 36" fill="none">
            <path d="M35.3179 10.5714L35.4693 9.33064L35.3939 9.32143H35.3179V10.5714ZM39.1161 34.8839C39.6043 35.372 40.3957 35.372 40.8839 34.8839L48.8388 26.9289C49.327 26.4408 49.327 25.6493 48.8388 25.1612C48.3507 24.673 47.5592 24.673 47.0711 25.1612L40 32.2322L32.9289 25.1612C32.4408 24.673 31.6493 24.673 31.1612 25.1612C30.673 25.6493 30.673 26.4408 31.1612 26.9289L39.1161 34.8839ZM0 3.25H29.9656V0.75H0V3.25ZM0 20.3929H18.7285V17.8929H0V20.3929ZM0.187285 11.8214H35.3179V9.32143H0.187285V11.8214ZM35.1664 11.8122C35.6785 11.8747 36.5776 12.1952 37.3412 12.9929C38.0752 13.7597 38.75 15.0368 38.75 17.1429H41.25C41.25 14.449 40.3641 12.5355 39.1472 11.2642C37.9599 10.0238 36.5179 9.45862 35.4693 9.33064L35.1664 11.8122ZM38.75 17.1429V34H41.25V17.1429H38.75Z" fill="#010103" />
        </svg>
    );
};
export const ArrowIconFive = ({ fillColor = "#010103" }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 18 10" fill="none">
            <path d="M8.29231 0C10.773 2.00217 14.7748 3.89283 18 5.00061C14.7748 6.10761 10.7731 7.99749 8.29278 10L10.0219 5.5746L0.619514 5.57487C0.455171 5.57467 0.297634 5.51408 0.181516 5.40642C0.0948336 5.32613 0.0358078 5.22386 0.011901 5.11253C-0.0120059 5.0012 0.00027696 4.8858 0.0472025 4.78093C0.0941274 4.67606 0.173586 4.58643 0.275531 4.52336C0.377475 4.46029 0.497332 4.42662 0.619946 4.4266L10.022 4.42665L8.29231 0Z" fill={fillColor}></path>
        </svg>
    );
};
export const ArrowIconSix = () => {
    return (
        <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.0132 6C6.55096 4.79602 9.01702 3.65729 11 2.98914C9.0411 2.32842 6.61614 1.19883 5.12217 0L6.13079 2.65337L0.384883 2.66338C0.284449 2.66367 0.187519 2.7002 0.115388 2.76492C0.061543 2.81318 0.0243603 2.87461 0.00854059 2.94144C-0.00727914 3.00826 -0.00102722 3.07749 0.0265096 3.14036C0.054046 3.20323 0.101629 3.25692 0.163243 3.29466C0.224857 3.33239 0.297737 3.35246 0.372666 3.35234L6.11833 3.34214L5.0132 6Z" fill="currentColor" />
        </svg>
    );
};
export const ArrowIconSeven = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
            <path d="M1 11.4648L11 1.46484M11 1.46484H1M11 1.46484V11.4648" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
export const ArrowIconEight = () => {
    return (
        <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.0132 6C6.55096 4.79602 9.01702 3.65729 11 2.98914C9.0411 2.32842 6.61614 1.19883 5.12217 0L6.13079 2.65337L0.384883 2.66338C0.284449 2.66367 0.187519 2.7002 0.115388 2.76492C0.061543 2.81318 0.0243603 2.87461 0.00854059 2.94144C-0.00727914 3.00826 -0.00102722 3.07749 0.0265096 3.14036C0.054046 3.20323 0.101629 3.25692 0.163243 3.29466C0.224857 3.33239 0.297737 3.35246 0.372666 3.35234L6.11833 3.34214L5.0132 6Z" fill="currentColor" />
        </svg>
    );
};
export const ArrowIconNine = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3.47322 13.351C7.9008 13.8237 13.7205 15.9087 18 18C15.908 13.7213 13.8222 7.90238 13.3503 3.47488L10.6873 9.5535L1.40117 0.266835C1.23867 0.104711 1.02323 0.00895886 0.80221 0.00061264C0.637305 -0.00570854 0.477999 0.0370027 0.344427 0.123351C0.210856 0.209698 0.109015 0.335802 0.0517861 0.485724C-0.00544294 0.635645 -0.0154938 0.80265 0.0229026 0.965628C0.0612989 1.1286 0.146421 1.28024 0.267504 1.40135L9.55357 10.6873L3.47322 13.351Z" fill="currentColor" />
        </svg>
    );
};
export const ArrowIconTen = ({ color = "#C9F31D" }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="10" viewBox="0 0 18 10" fill="none">
            <path d="M8.29231 10C10.773 7.99783 14.7748 6.10717 18 4.99939C14.7748 3.89239 10.7731 2.00251 8.29278 0L10.0219 4.4254L0.619514 4.42513C0.455171 4.42533 0.297634 4.48592 0.181516 4.59358C0.0948337 4.67387 0.0358078 4.77614 0.011901 4.88747C-0.0120059 4.9988 0.000276999 5.1142 0.0472025 5.21907C0.0941274 5.32394 0.173586 5.41357 0.275531 5.47664C0.377475 5.53971 0.497332 5.57338 0.619945 5.5734L10.022 5.57335L8.29231 10Z" fill={color} />
        </svg>
    );
};
export const ArrowIconEleven = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7.80843 10.3786C7.75025 10.324 7.68104 10.2806 7.60477 10.2509C7.52851 10.2213 7.44671 10.2061 7.3641 10.2061C7.28148 10.2061 7.19969 10.2213 7.12342 10.2509C7.04716 10.2806 6.97795 10.324 6.91977 10.3786L4.64805 12.4964V0.583398C4.64805 0.428671 4.58212 0.280281 4.46475 0.170873C4.34739 0.0614649 4.18821 0 4.02223 0C3.85625 0 3.69708 0.0614649 3.57971 0.170873C3.46235 0.280281 3.39641 0.428671 3.39641 0.583398V12.4905L1.13095 10.3786C1.07731 10.3103 1.00835 10.2536 0.928843 10.2126C0.849341 10.1716 0.761212 10.1472 0.67058 10.1411C0.579949 10.1351 0.488989 10.1475 0.404023 10.1775C0.319056 10.2075 0.242122 10.2544 0.178566 10.315C0.115009 10.3755 0.0663563 10.4482 0.0359877 10.5281C0.00561905 10.6079 -0.00573671 10.6929 0.00270981 10.7773C0.0111563 10.8616 0.0392023 10.9432 0.0848988 11.0164C0.130595 11.0897 0.192846 11.1527 0.267324 11.2012L2.72053 13.4882C3.07255 13.8159 3.54974 14 4.04726 14C4.54479 14 5.02197 13.8159 5.374 13.4882L7.8272 11.2012C7.9413 11.0896 8.00338 10.9405 7.99986 10.7863C7.99634 10.6322 7.92752 10.4856 7.80843 10.3786Z" fill="white" />
        </svg>
    );
};
export const ArrowIconTwelve = ({ direction = "right" }) => {
    return (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={direction == "right" ?
                "M1 8.07107H15.1421M15.1421 8.07107L8.07107 1M15.1421 8.07107L8.07107 15.1421"
                :
                "M16 8.07107H1.85786M1.85786 8.07107L8.92893 1M1.85786 8.07107L8.92893 15.1421"} stroke="#0C2E34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
export const ArrowIconThirteen = ({ direction = "right" }) => {
    return (
        <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={direction == 'right' ?
                "M1.86914 9.00076H15.9993M15.9993 9.00076L8.93423 1.92969M15.9993 9.00076L8.93423 16.0718" :
                "M16.0703 9.00076H1.92818M1.92818 9.00076L8.99924 1.92969M1.92818 9.00076L8.99924 16.0718"
            } stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
export const ArrowIconFourteen = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 9L9 1M9 1H1M9 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
export const ArrowIconFifteen = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="76" height="45" viewBox="0 0 76 45" fill="none">
            <path d="M58.25 14.4194L72.2902 28.4597L58.25 42.4999" stroke="#fff" strokeWidth="5" />
            <path d="M0 26.009H12.9499C16.541 26.009 19.4521 23.0978 19.4521 19.5067V12.7887C19.4521 5.72569 25.1778 0 32.2408 0V0V0C40.1222 0 46.5113 6.38908 46.5113 14.2704V19.5067C46.5113 23.0978 49.4224 26.009 53.0135 26.009H69.7582V30.9105H54.593C47.2402 30.9105 41.2264 25.0519 41.0343 17.7016L40.898 12.4869C40.7817 8.03841 37.142 4.49263 32.692 4.49263V4.49263C28.1584 4.49263 24.4832 8.16784 24.4832 12.7014V17.7016C24.4832 24.9967 18.5693 30.9105 11.2742 30.9105H0V26.009Z" fill="#fff" />
        </svg>
    );
};
export const ArrowIconSixteen = () => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 15L15 1M15 1H1M15 1V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export const ArrowNextPrevIcon = ({ direction = 'right', strokeColor = 'white' }) => (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d={direction === 'right' ? "M1 13L7 7L1 1" : "M7 1L1 7L7 13"}
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
export const ArrowProjectNextPrevIcon = ({ direction = 'right' }) => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d={direction === 'right' ? "M0.999999 9L17 9M17 9L9 17M17 9L9 1" : "M17 8.99994L0.999999 8.99994M0.999999 8.99994L9 16.9999M0.999998 8.5L8.5 0.5"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const ArrowIconSeventeen = () => {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 1L13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
export const AwardArrowIconTwo = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="12" viewBox="0 0 11 12" fill="none">
            <path d="M1.50136 3.17749C4.16229 3.0706 7.58943 2.05905 10.0827 0.983154C9.02059 3.44686 8.03635 6.82733 7.96339 9.44339L6.05677 5.72136L0.875108 10.8818C0.784411 10.9719 0.658439 11.0204 0.524873 11.0166C0.425224 11.0139 0.326608 10.9822 0.241492 10.9256C0.156375 10.8689 0.0885781 10.7899 0.0466752 10.6984C0.00477223 10.6069 -0.00935692 10.5072 0.00607293 10.4117C0.0215028 10.3162 0.0658005 10.2293 0.133364 10.162L5.31502 5.00201L1.50136 3.17749Z" fill="currentColor" />
        </svg>
    );
};
export const ProjectArrowIcon = () => {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.34375 12.6568L12.6575 1.34314M12.6575 1.34314L1.34375 1.34314M12.6575 1.34314L12.6575 12.6568" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
export const BackToTopArrowIconTwo = () => {
    return (
        <svg width="16" height="28" viewBox="0 0 16 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.29289 27.7071C7.68342 28.0976 8.31658 28.0976 8.70711 27.7071L15.0711 21.3431C15.4616 20.9526 15.4616 20.3195 15.0711 19.9289C14.6805 19.5384 14.0474 19.5384 13.6569 19.9289L8 25.5858L2.34315 19.9289C1.95262 19.5384 1.31946 19.5384 0.928933 19.9289C0.538409 20.3195 0.538409 20.9526 0.928933 21.3431L7.29289 27.7071ZM8 0L7 4.37114e-08L7 27L8 27L9 27L9 -4.37114e-08L8 0Z" fill="black" />
        </svg>
    );
};
export const PaginationNextPrevIcon = ({ direction = 'right' }) => {
    return (
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={direction === 'right' ? "M9.82422 1L14.3767 5.5525L9.82422 10.105" : "M6.17749 10.105L1.62499 5.55248L6.17749 0.999981"} stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.3767 5.55249L1.75421 5.55249" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
export const BlogNextPrevIcon = ({ direction = 'right' }) => {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={direction === 'right' ? "M1 7H13M13 7L7 1M13 7L7 13" : "M13 7H1M1 7L7 1M1 7L7 13"} stroke="currentcolor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
export const ProjectArrowIconTwo = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
            <path d="M0.685303 13.1809L12.6102 1.26074L3.3235 3.00806" stroke="currentColor" strokeWidth="1.5"></path>
        </svg>
    );
};
export const ArrowIconEighteen = () => {
    return (
        <svg width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 6.3278L16.861 6.33112L9.05877 1" stroke="currentcolor" strokeWidth="1.5" />
        </svg>
    );
};

