
type MenuItemThree = {
    title: string;
    link: string;
    static: boolean;
    subMenu?: { name: string; link: string }[];
};

// One-page: alle punktene scroller til en seksjon på forsiden (/#...).
export const menuItemsThree: MenuItemThree[] = [
    {
        title: 'Hjem',
        link: '/#top',
        static: true,
    },
    {
        title: 'Tjenester',
        link: '/#tjenester',
        static: true,
    },
    {
        title: 'Prosjekter',
        link: '/#prosjekter',
        static: true,
    },
    {
        title: 'Byggeprosessen',
        link: '/#byggeprosessen',
        static: false,
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
