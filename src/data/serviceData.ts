import { ConceptDesignIcon, ConsultingIcon, CorporateLawIcon, CreativeDirectionIcon, CriminalDefenceIcon, DataAnalyticsIcon, DataContentIcon, DiscoveryIcon, EmploymentLawIcon, EstatePlanningIcon, ImprovementIcon, InnovationIcon, OptimizationIcon, ResearchIcon, ServiceIcon, ServiceIconFour, ServiceIconThree, ServiceIconTwo, UIUXDesignIcon } from "@/svg";
import { AboutCreativeDirectionIcon, AboutDataAnalyticsIcon, AboutDataContentIcon, AboutUIUXDesignIcon } from "@/svg/ServiceIcons";
import { ServiceItemDt } from "@/types/custom-dt";

// Service data array
const servicesData: ServiceItemDt[] = [
    //home services data start
    {
        id: 1,
        icon: "/assets/img/digital-agency/service/service-icon-1.png",
        title: "Data content",
        description:
            "Our dedication to quality over quantity has earned us the trust of clients who value precision.",
    },
    {
        id: 2,
        icon: "/assets/img/digital-agency/service/service-icon-2.png",
        title: "UI/UX Design",
        description:
            "Our dedication to quality over quantity has earned us the trust of clients who value precision.",
    },
    {
        id: 3,
        icon: "/assets/img/digital-agency/service/service-icon-3.png",
        title: "Apps Branding",
        description:
            "Our dedication to quality over quantity has earned us the trust of clients who value precision.",
    },
    {
        id: 4,
        icon: "/assets/img/digital-agency/service/service-icon-4.png",
        title: "Content Creation",
        description:
            "Our dedication to quality over quantity has earned us the trust of clients who value precision.",
    },
    {
        id: 5,
        icon: "/assets/img/digital-agency/service/service-icon-5.png",
        title: "Visual Identity",
        description:
            "Our dedication to quality over quantity has earned us the trust of clients who value precision.",
    },
    {
        id: 6,
        icon: "/assets/img/digital-agency/service/service-icon-6.png",
        title: "Consistency",
        description:
            "Our dedication to quality over quantity has earned us the trust of clients who value precision.",
    },
    //home services data end
    {
        id: 7,
        svgIcon: ServiceIcon,
        title: "Data content",
        description: "In today’s digital landscape, data is the driving force behind innovation and success.",
    },
    {
        id: 8,
        svgIcon: ServiceIconTwo,
        title: "UI/UX Design",
        description: "In today’s digital landscape, data is the driving force behind innovation and success.",
    },
    {
        id: 9,
        svgIcon: ServiceIconThree,
        title: "Data content",
        description: "In today’s digital landscape, data is the driving force behind innovation and success.",
    },
    {
        id: 10,
        svgIcon: ServiceIconFour,
        title: "Apps Branding",
        description: "In today’s digital landscape, data is the driving force behind innovation and success.",
    },
    {
        id: 11,
        svgIcon: ServiceIcon,
        title: "Data content",
        description: "In today’s digital landscape, data is the driving force behind innovation and success.",
    },
    {
        id: 12,
        svgIcon: ServiceIconTwo,
        title: "UI/UX Design",
        description: "In today’s digital landscape, data is the driving force behind innovation and success.",
    },
    //digital marketing page process service data
    {
        id: 13,
        svgIcon: ConceptDesignIcon,
        num: "001",
        title: "Concept & Design",
        description: "Creating visually stunning and user friendly designs tailored to your brand identity.",
        delay: ".3",
    },
    {
        id: 14,
        svgIcon: ResearchIcon,
        num: "002",
        title: "Research",
        description: "Creating visually stunning and user friendly designs tailored to your brand identity.",
        delay: ".4",
    },
    {
        id: 15,
        svgIcon: DiscoveryIcon,
        num: "003",
        title: "Discovery",
        description: "Creating visually stunning and user friendly designs tailored to your brand identity.",
        delay: ".5",
    },
    {
        id: 16,
        svgIcon: ImprovementIcon,
        num: "004",
        title: "Improvement",
        description: "Creating visually stunning and user friendly designs tailored to your brand identity.",
        delay: ".6",
    },
    //digital marketing page process service end
    //creative agency page service data start
    {
        id: 17,
        icon: "/assets/img/creative-agency/service/service-1.svg",
        title: "Data content",
        delay: ".3",
        description: `Our dedication to quality over 
           quantity has earned us the trust of 
           clients who value precision.`,
    },
    {
        id: 18,
        icon: "/assets/img/creative-agency/service/service-2.svg",
        title: "UI/UX Design",
        delay: ".5",
        description: `Our dedication to quality over 
           quantity has earned us the trust of 
           clients who value precision.`,
    },
    {
        id: 19,
        icon: "/assets/img/creative-agency/service/service-3.svg",
        title: "Apps Branding",
        delay: ".7",
        description: `Our dedication to quality over 
           quantity has earned us the trust of 
           clients who value precision.`,
    },
    //creative agency page service data end
    // startup agency service data start
    {
        id: 20,
        title: "Creative Direction",
        svgIcon: CreativeDirectionIcon,
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
    },
    {
        id: 21,
        title: "Data & Analytics",
        svgIcon: DataAnalyticsIcon,
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
    },
    {
        id: 22,
        title: "UI/UX Design",
        svgIcon: UIUXDesignIcon,
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
    },
    {
        id: 23,
        title: "Data Content",
        svgIcon: DataContentIcon,
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
    },
    {
        id: 24,
        title: "Creative Direction",
        svgIcon: CreativeDirectionIcon,
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
    },
    {
        id: 25,
        title: "Data & Analytics",
        svgIcon: DataAnalyticsIcon,
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
    },
    {
        id: 26,
        title: "UI/UX Design",
        svgIcon: UIUXDesignIcon,
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
    },
    // startup agency service data end

    //corporate agency service data start
    {
        id: 27,
        category: 'Creativity',
        image: "/assets/img/corporate-agency/service/service-1.jpg",
        title: 'Digital Marketing',
        description: "In today's digital landscape, data is the <br /> driving force behind.",
    },
    {
        id: 28,
        category: 'Creativity',
        image: "/assets/img/corporate-agency/service/service-2.jpg",
        title: 'UI/UX Design',
        description: "In today's digital landscape, data is the <br /> driving force behind.",
    },
    {
        id: 29,
        category: 'Creativity',
        image: "/assets/img/corporate-agency/service/service-3.jpg",
        title: 'Brand Strategy',
        description: "In today's digital landscape, data is the <br /> driving force behind.",
    },
    {
        id: 30,
        category: 'Creativity',
        image: "/assets/img/corporate-agency/service/service-1.jpg",
        title: 'Creative Direction',
        description: "In today's digital landscape, data is the <br /> driving force behind.",
    },
    {
        id: 31,
        category: 'Creativity',
        image: "/assets/img/corporate-agency/service/service-2.jpg",
        title: 'Market Insights',
        description: "In today's digital landscape, data is the <br /> driving force behind.",
    },
    {
        id: 32,
        category: 'Creativity',
        image: "/assets/img/corporate-agency/service/service-3.jpg",
        title: 'Visual Identity',
        description: "In today's digital landscape, data is the <br /> driving force behind.",
    },
    //corporate agency service data end
    //personal portfolio service data start
    {
        id: 33,
        title: "UI/UX Design",
        num: "02",
        categories: ["UI/UX", "Webflow", "Envato"],
        description:
            "From branding to web development, their team delivered a seamless experience.",
    },
    {
        id: 34,
        title: "Development",
        num: "04",
        categories: ["UI/UX", "Webflow", "Envato"],
        description:
            "From branding to web development, their team delivered a seamless experience.",
    },
    {
        id: 35,
        title: "Digital Marketing",
        num: "05",
        categories: ["UI/UX", "Webflow", "Envato"],
        description:
            "From branding to web development, their team delivered a seamless experience.",
    },
    {
        id: 36,
        title: "Direction",
        num: "04",
        categories: ["UI/UX", "Webflow", "Envato"],
        description:
            "From branding to web development, their team delivered a seamless experience.",
    },
    //personal portfolio service data end
    //business consulting service data start
    {
        id: 37,
        svgIcon: InnovationIcon,
        title: "Leading Change, Driving <br> Innovation.",
        description: 'Business consulting services are designed to unlock the full potential of your company. With a deep understanding.',
        delay: ".3",
        num: "01",
    },
    {
        id: 38,
        svgIcon: ConsultingIcon,
        title: "Future - Ready Consulting <br> for Business Success.",
        description: 'Business consulting services are designed to unlock the full potential of your company. With a deep understanding.',
        delay: ".5",
        num: "02",
    },
    {
        id: 39,
        svgIcon: OptimizationIcon,
        title: "Innovate, Optimize, and <br> Grow with Confidence.",
        description: 'Business consulting services are designed to unlock the full potential of your company. With a deep understanding.',
        delay: ".7",
        num: "03",
    },
    //business consulting service data end
    //design studio service data start
    {
        id: 40,
        title: '3D-<br>visualisering',
        description: "Fotorealistiske renderinger som viser produktet eller konseptet ditt fra sin beste side.",
        image: '/assets/img/design-studio/service/service-icon-1.png',
    },
    {
        id: 41,
        title: '3D-skanning /<br>Digital Twin',
        description: "Nøyaktig 3D-skanning av bygg, rom og objekter – digitale tvillinger til planlegging, dokumentasjon og visning.",
        image: "/assets/img/design-studio/service/service-icon-4.png",
    },
    {
        id: 42,
        title: '3D-<br>animasjon',
        description: "Produktfilmer og animasjoner som forklarer, engasjerer og selger.",
        image: "/assets/img/design-studio/service/service-icon-2.png",
    },
    {
        id: 43,
        title: 'Prosjektsider og<br>boligvelger',
        description: "Interaktive prosjektsider og boligvelgere som gjør det enkelt for kjøpere å utforske og velge riktig enhet.",
        image: "/assets/img/design-studio/service/service-icon-3.png",
    },
    {
        id: 400,
        title: 'Hjemmesider',
        description: "Moderne, raske hjemmesider – gjerne med innebygd 3D og visualisering som løfter prosjektene dine.",
        image: "/assets/img/design-studio/service/service-icon-hjemmesider.png",
    },
    {
        id: 401,
        title: 'Dronefotograf',
        description: "Profesjonell dronefotografering – luftbilder og video av tomt, bygg og prosjekt.",
        image: "/assets/img/design-studio/service/service-icon-drone.png",
    },
    //design studio service data end
    //HR Consulting service data start
    {
        id: 44,
        num: '01',
        image: "/assets/img/hr-consulting/avater/avater-1.jpg",
        delay: '.5',
        title: 'Smart Design Thinking for Global Impact',
        description: 'An ever-evolving business landscape, ahead requires innovation',
    },
    {
        id: 45,
        num: '02',
        image: "/assets/img/hr-consulting/avater/avater-2.jpg",
        delay: '.7',
        title: 'Future-Ready Strategies for Sustainable Growth',
        description: 'An ever-evolving business landscape, ahead requires innovation',
    },
    {
        id: 46,
        num: '03',
        image: "/assets/img/hr-consulting/avater/avater-3.jpg",
        delay: '.9',
        title: 'Innovative Solutions for a Changing World',
        description: 'An ever-evolving business landscape, ahead requires innovation',
    },
    //HR Consulting service data end
    //lawyer agency service data start
    {
        id: 47,
        title: "Legal Consultations",
        image: "/assets/img/lawyer-agency/service/service-1.jpg",
        description: "In today's digital landscape, data is <br> the driving force behind.",
    },
    {
        id: 48,
        title: "Legal Services",
        image: "/assets/img/lawyer-agency/service/service-2.jpg",
        description: "In today's digital landscape, data is <br> the driving force behind.",
    },
    {
        id: 49,
        title: "Centric Digital Solutions",
        image: "/assets/img/lawyer-agency/service/service-3.jpg",
        description: "In today's digital landscape, data is <br> the driving force behind.",
    },
    {
        id: 50,
        title: "Legal Consultations",
        image: "/assets/img/lawyer-agency/service/service-1.jpg",
        description: "In today's digital landscape, data is <br> the driving force behind.",
    },
    {
        id: 51,
        title: "Legal Services",
        image: "/assets/img/lawyer-agency/service/service-2.jpg",
        description: "In today's digital landscape, data is <br> the driving force behind.",
    },
    {
        id: 52,
        title: "Centric Digital Solutions",
        image: "/assets/img/lawyer-agency/service/service-3.jpg",
        description: "In today's digital landscape, data is <br> the driving force behind.",
    },
    //lawyer agency service data end
    //lawyer agency service data two start
    {
        id: 53,
        num: "01",
        title: "Criminal Defence",
        svgIcon: CriminalDefenceIcon,
        description:
            "We craft unique brand identities that communicate your values, build recognition and create.",
    },
    {
        id: 54,
        num: "02",
        title: "Corporate Law",
        svgIcon: CorporateLawIcon,
        description:
            "We craft unique brand identities that communicate your values, build recognition and create.",
    },
    {
        id: 55,
        num: "03",
        title: "Employment Law",
        svgIcon: EmploymentLawIcon,
        description:
            "We craft unique brand identities that communicate your values, build recognition and create.",
    },
    {
        id: 56,
        num: "04",
        title: "Estate Planning",
        svgIcon: EstatePlanningIcon,
        description:
            "We craft unique brand identities that communicate your values, build recognition and create.",
    },
    {
        id: 57,
        num: "05",
        title: "Criminal Defence",
        svgIcon: CriminalDefenceIcon,
        description:
            "We craft unique brand identities that communicate your values, build recognition and create.",
    },
    {
        id: 58,
        num: "06",
        title: "Corporate Law",
        svgIcon: CorporateLawIcon,
        description:
            "We craft unique brand identities that communicate your values, build recognition and create.",
    },
    //about service data
    {
        id: 59,
        title: "Creative Direction",
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
        svgIcon: AboutCreativeDirectionIcon,
    },
    {
        id: 60,
        title: "Data & Analytics",
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
        svgIcon: AboutDataAnalyticsIcon,
    },
    {
        id: 61,
        title: "UI/UX Design",
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
        svgIcon: AboutUIUXDesignIcon,
    },
    {
        id: 62,
        title: "Data Content",
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
        svgIcon: AboutDataContentIcon,
    },
    {
        id: 63,
        title: "Data & Analytics",
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
        svgIcon: AboutDataAnalyticsIcon,
    },
    {
        id: 64,
        title: "UI/UX Design",
        description:
            "At Acjon, we are more than just a creative agency—we are innovators storytellers, and digital architects.",
        svgIcon: AboutUIUXDesignIcon,
    },
    //service main service data
    {
        id: 65,
        title: "Data Content",
        icon: "/assets/img/digital-agency/service/service-icon-1.png",
        description: "Our dedication to quality over <br> quantity has earned us the trust of <br> clients who value precision"
    },
    {
        id: 66,
        title: "UI/UX Design",
        icon: "/assets/img/digital-agency/service/service-icon-2.png",
        description: "Our dedication to quality over <br> quantity has earned us the trust of <br> clients who value precision"
    },
    {
        id: 67,
        title: "Content Creation",
        icon: "/assets/img/digital-agency/service/service-icon-5.png",
        description: "Our dedication to quality over <br> quantity has earned us the trust of <br> clients who value precision"
    },
    {
        id: 68,
        title: "Apps Branding",
        icon: "/assets/img/digital-agency/service/service-icon-3.png",
        description: "Our dedication to quality over <br> quantity has earned us the trust of <br> clients who value precision"
    },
    {
        id: 69,
        title: "Mobile App Design",
        icon: "/assets/img/digital-agency/service/service-icon-4.png",
        description: "Our dedication to quality over <br> quantity has earned us the trust of <br> clients who value precision"
    },
    {
        id: 70,
        title: "Content Creation",
        icon: "/assets/img/digital-agency/service/service-icon-6.png",
        description: "Our dedication to quality over <br> quantity has earned us the trust of <br> clients who value precision"
    },
    {
        id: 71,
        title: "Apps Branding",
        icon: "/assets/img/digital-agency/service/service-icon-7.png",
        description: "Our dedication to quality over <br> quantity has earned us the trust of <br> clients who value precision"
    },
    {
        id: 72,
        title: "Content Creation",
        icon: "/assets/img/digital-agency/service/service-icon-8.png",
        description: "Our dedication to quality over <br> quantity has earned us the trust of <br> clients who value precision"
    },
    {
        id: 73,
        title: "Content Creation",
        icon: "/assets/img/digital-agency/service/service-icon-9.png",
        description: "Our dedication to quality over <br> quantity has earned us the trust of <br> clients who value precision"
    },
];

export default servicesData;