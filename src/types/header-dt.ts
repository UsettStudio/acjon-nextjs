// Types and interfaces
export interface HeaderButtonConfig {
    wrapperClass: string;
    buttonClass?: string;
    linkClass?: string;
    text?: string;
    icon?: React.ReactNode;
    bars?: number[];
}

export interface HeaderButtonVariants {
    black: HeaderButtonConfig & { icon: React.ReactNode };
    default: {
        contactBtn: HeaderButtonConfig & { icon: React.ReactNode };
        menuBtn: HeaderButtonConfig & { bars: number[] };
    };
}

export interface CommonHeaderProps {
    btnVariantStyle?: 'black-menu-btn' | string;
    stickyHeaderColor?: string;
    menuStyle?: string;
    buttonColorCls?: string;
    differentLogo: 'black' | 'default';
    headerStyle?: 'blur' | 'solid' | 'border';
}
