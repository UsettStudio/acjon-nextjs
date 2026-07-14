
type MenuItemThree = {
    title: string;
    link: string;
    static: boolean;
    subMenu?: { name: string; link: string }[];
};

// One-page: alle punktene scroller til en seksjon på forsiden (/design-studio#...).
export const menuItemsThree: MenuItemThree[] = [
    {
        title: 'Hjem',
        link: '/design-studio#top',
        static: true,
    },
    {
        title: 'Tjenester',
        link: '/design-studio#tjenester',
        static: true,
    },
    {
        title: 'Prosjekter',
        link: '/design-studio#prosjekter',
        static: true,
    },
    {
        title: 'Byggeprosessen',
        link: '/design-studio#byggeprosessen',
        static: false,
    },
    {
        title: 'Om oss',
        link: '/design-studio#om-oss',
        static: false,
    },
    {
        title: 'Kontakt',
        link: '/design-studio#kontakt-skjema',
        static: false,
    },
];
