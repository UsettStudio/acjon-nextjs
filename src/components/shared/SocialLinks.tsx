import { FacebookIconThree, InstragramIconThree, InstragramIconFive, LinkdinIcon, TwitorIconThree, TwitorIconFour } from '@/svg/SocialIcons';
import { socialLinks, SocialKey } from '@/data/socials';
import { siteConfig } from '@/data/siteConfig';
import React from 'react';

/**
 * Ikoner for sosiale medier, styrt av siteConfig.socials.
 * Kontoer uten lenke vises ikke; er ingen fylt inn, rendres ingenting.
 *
 * variant "footer"    – små ikoner i runde rammer (span), som i bunnteksten
 * variant "offcanvas" – litt større ikoner, som i sidemenyen
 */

const icons: Record<"footer" | "offcanvas", Record<SocialKey, React.ReactNode>> = {
    footer: {
        facebook: <FacebookIconThree />,
        instagram: <InstragramIconThree />,
        linkedin: <LinkdinIcon />,
        x: <TwitorIconThree />,
    },
    offcanvas: {
        facebook: <FacebookIconThree width="8" height="16" />,
        instagram: <InstragramIconFive />,
        linkedin: <LinkdinIcon width="15" height="15" />,
        x: <TwitorIconFour />,
    },
};

type Props = { variant: "footer" | "offcanvas" };

const SocialLinks: React.FC<Props> = ({ variant }) => {
    if (!socialLinks.length) return null;

    return (
        <>
            {socialLinks.map(({ key, label, url }) => (
                <React.Fragment key={key}>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${siteConfig.shortName} på ${label}`}
                        title={label}
                    >
                        {variant === "footer" ? <span>{icons.footer[key]}</span> : icons.offcanvas[key]}
                    </a>
                    {variant === "offcanvas" && " "}
                </React.Fragment>
            ))}
        </>
    );
};

export const hasSocialLinks = socialLinks.length > 0;

export default SocialLinks;
