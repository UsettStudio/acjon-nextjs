import { pricePlanDt, PricingTier } from "@/types/custom-dt";

// Home Design studio pricing Data
export const pricingData: PricingTier = {
    monthly: [
        {
            id: 'monthly-basic',
            name: 'Basic',
            description: 'Ideal for small businesses or startups.',
            price: '$00',
            period: '/Free',
            features: [
                'Basic Branding Package',
                'Custom 5-Page Website',
                'SEO Optimization Basics',
                'Full Brand Strategy & Design',
                'Social Media Setup'
            ]
        },
        {
            id: 'monthly-standard',
            name: 'Standard',
            description: 'Ideal for small businesses or startups.',
            price: '$55',
            period: '/monthly',
            isPopular: true,
            features: [
                'Basic Branding Package',
                'Custom 5-Page Website',
                'SEO Optimization Basics',
                'Full Brand Strategy & Design',
                'On-Demand Design Revisions'
            ]
        },
        {
            id: 'monthly-advanced',
            name: 'Advanced',
            description: 'Ideal for small businesses or startups.',
            price: '$79',
            period: '/Yearly',
            features: [
                'Basic Branding Package',
                'Custom 5-Page Website',
                'SEO Optimization Basics',
                'Full Brand Strategy & Design',
                'On-Demand Design Revisions'
            ]
        }
    ],
    yearly: [
        {
            id: 'pakke-basis',
            name: 'Basis',
            description: 'Perfekt for et enkelt prosjekt med interiør og eksteriør.',
            price: '24 000 kr',
            period: '/prosjekt',
            features: [
                '2 × interiørbilder',
                '1 × eksteriør fra bakkeplan',
                '1 × oppstart og teksturering'
            ]
        },
        {
            id: 'pakke-proff',
            name: 'Proff',
            description: 'Vår mest populære pakke – flere visninger og eksteriør i dronefoto.',
            price: '39 000 kr',
            period: '/prosjekt',
            isPopular: true,
            features: [
                '3 × interiørbilder',
                '1 × eksteriør fra bakkeplan',
                '1 × eksteriør plassert i dronefoto',
                '1 × oppstart og teksturering'
            ]
        },
        {
            id: 'pakke-komplett',
            name: 'Komplett',
            description: 'Full pakke med flest visninger og eksteriør plassert i dronefoto.',
            price: '53 500 kr',
            period: '/prosjekt',
            features: [
                '4 × interiørbilder',
                '2 × eksteriør fra bakkeplan',
                '1 × eksteriør plassert i dronefoto',
                '1 × oppstart og teksturering'
            ]
        }
    ]
};

//pricing data 
export const pricingDataTwo: Record<"monthly" | "yearly", pricePlanDt[]> = {
  monthly: [
    {
      id: 1,
      title: "Basic",
      desc: "Ideal for small businesses of startups.",
      price: "$00",
      duration: "/Free",
      features: [
        "Basic Branding Package",
        "Custom 5-Page Website",
        "SEO Optimization Basics",
        "Full Brand Strategy & Design",
        "Social Media Setup",
      ],
    },
    {
      id: 2,
      title: "Standard",
      desc: "Ideal for small businesses of startups.",
      price: "$55",
      duration: "/monthly",
      popular: true,
      active: true,
      features: [
        "Basic Branding Package",
        "Custom 5-Page Website",
        "SEO Optimization Basics",
        "Full Brand Strategy & Design",
        "On-Demand Design Revisions",
      ],
    },
    {
      id: 3,
      title: "Advanced",
      desc: "Ideal for small businesses of startups.",
      price: "$79",
      duration: "/Yearly",
      features: [
        "Basic Branding Package",
        "Custom 5-Page Website",
        "SEO Optimization Basics",
        "Full Brand Strategy & Design",
        "On-Demand Design Revisions",
      ],
    },
  ],
  yearly: [
    {
      id: 4,
      title: "Basic",
      desc: "Ideal for small businesses of startups.",
      price: "$20",
      duration: "/Free",
      features: [
        "Basic Branding Package",
        "Custom 5-Page Website",
        "SEO Optimization Basics",
        "Full Brand Strategy & Design",
        "Social Media Setup",
      ],
    },
    {
      id: 5,
      title: "Standard",
      desc: "Ideal for small businesses of startups.",
      price: "$75",
      duration: "/monthly",
      popular: true,
      active: true,
      features: [
        "Basic Branding Package",
        "Custom 5-Page Website",
        "SEO Optimization Basics",
        "Full Brand Strategy & Design",
        "On-Demand Design Revisions",
      ],
    },
    {
      id: 6,
      title: "Advanced",
      desc: "Ideal for small businesses of startups.",
      price: "$95",
      duration: "/Yearly",
      features: [
        "Basic Branding Package",
        "Custom 5-Page Website",
        "SEO Optimization Basics",
        "Full Brand Strategy & Design",
        "On-Demand Design Revisions",
      ],
    },
  ],
};
