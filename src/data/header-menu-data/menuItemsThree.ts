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
 * «Tjenester» og «Priser» peker bevisst på ekte sider og ikke på seksjoner
 * på forsiden. En AI-modell siterer én URL som svarer på ett spørsmål –
 * en ankerlenke til en seksjon er ikke en URL modellen kan sende noen til.
 * Menylenkene er samtidig det som gjør at de nye sidene faktisk blir
 * oppdaget av crawlerne; et sitemap alene får dem indeksert langsommere.
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
        title: 'Priser',
        link: '/priser',
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
