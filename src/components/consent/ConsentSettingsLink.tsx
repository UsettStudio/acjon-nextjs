"use client";

import { CONSENT_OPEN_EVENT } from "./CookieBanner";

type Props = {
    className?: string;
    label?: string;
};

/**
 * Knapp som åpner samtykkebanneret på nytt. Brukes i footeren og på
 * personvernsiden, slik at brukeren når som helst kan endre valget sitt –
 * et krav etter GDPR (samtykke skal være like lett å trekke tilbake som å gi).
 */
const ConsentSettingsLink = ({
    className = "",
    label = "Endre samtykke for informasjonskapsler",
}: Props) => {
    return (
        <button
            type="button"
            className={className}
            onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
            style={{
                background: "none",
                border: "none",
                padding: 0,
                font: "inherit",
                color: "inherit",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
            }}
        >
            {label}
        </button>
    );
};

export default ConsentSettingsLink;
