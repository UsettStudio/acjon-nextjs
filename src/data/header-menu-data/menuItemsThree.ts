type MenuItemThree = {
    title: string;
    link: string;
    static: boolean;
    subMenu?: { name: string; link: string }[];
};

/**
 * Hovedmenyen.
 *
 * Punkter som peker på "/#..." scroller til en seksjon på forsiden.
 * Punkter som peker på en ren sti er egne sider.
 *
 * «Tjenester» peker bevisst på en ekte side og ikke på en seksjon på forsiden.
 * En AI-modell siterer én URL som svarer på ett spørsmål – en ankerlenke til
 * en seksjon er ikke en URL modellen kan sende noen til.
 *
 * MERK: «Priser» er bevisst tatt UT av menyen, men siden /priser lever videre
 * og er fortsatt indeksert. Den nås fra hver av de åtte tjenestesidene
 * («Se alle priser og pakker») og ligger i sitemap.xml, så søkemotorer og
 * AI-modeller finner den som før. Det som endres er bare at kunder ikke
 * møter prisene som et menyvalg.
 *
 * Legg den tilbake ved å gjeninnføre dette punktet:
 *   { title: 'Priser', link: '/priser', static: true },
 */
export const menuItemsThree: MenuItemThree[] = [
    {
        title: 'Hjem',
        link: '/#top',
        static: true,
    },
    {
        title: 'Tjenester',
        link: '/tjenester',
        static: true,
    },
    {
        title: 'Prosjekter',
        link: '/#prosjekter',
        static: true,
    },
    {
        title: 'Om oss',
        link: '/#om-oss',
        static: false,
    },
    {
        title: 'Kontakt',
        link: '/#kontakt-skjema',
        static: false,
    },
];
