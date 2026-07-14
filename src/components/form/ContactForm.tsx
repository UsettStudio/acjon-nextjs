"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { siteConfig } from "@/data/siteConfig";
import { ArrowIconTwo } from "@/svg";

/* ------------------ TypeScript Form Values ------------------ */
interface FormValues {
    name: string;
    email: string;
    subject?: string;
    number: string;
    service?: string;
    message: string;
}

/* ------------------ data ------------------ */

type FieldDef = {
    id: number;
    col: string;
    label: string;
    name: keyof FormValues;
    type: string;
    placeholder?: string;
    options?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rules?: any;
};

const formFields: FieldDef[] = [
    {
        id: 1,
        col: "col-lg-6",
        label: "Fullt navn*",
        name: "name",
        type: "text",
        placeholder: "Ola Nordmann",
        rules: {
            required: "Fullt navn er påkrevd",
        },
    },
    {
        id: 2,
        col: "col-lg-6",
        label: "E-postadresse*",
        name: "email",
        type: "email",
        placeholder: "Din e-postadresse",
        rules: {
            required: "E-postadresse er påkrevd",
            pattern: {
                value: /^\S+@\S+$/i,
                message: "Ugyldig e-postadresse",
            },
        },
    },
    {
        id: 3,
        col: "col-lg-6",
        label: "Firma",
        name: "subject",
        type: "text",
        placeholder: "F.eks. Eksempel AS",
    },
    {
        id: 4,
        col: "col-lg-6",
        label: "Telefonnummer*",
        name: "number",
        type: "text",
        placeholder: "+47 900 00 000",
        rules: {
            required: "Telefonnummer er påkrevd",
            minLength: {
                value: 7,
                message: "Telefonnummeret er for kort",
            },
        },
    },
    {
        id: 5,
        col: "col-lg-12",
        label: "Hvilken pakke er du interessert i?",
        name: "service",
        type: "select",
        placeholder: "Velg pakke",
        options: ["Basis", "Proff", "Komplett"],
    },
];

/* ------------------ component ------------------ */

const ContactForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormValues>();

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        // Uten access-key kan vi ikke sende – gi tydelig fallback til e-post.
        if (!siteConfig.web3formsAccessKey) {
            toast.info("Skjemaet er straks klart. Send gjerne e-post direkte til Mikael@Usett.no i mellomtiden.");
            return;
        }
        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({
                    access_key: siteConfig.web3formsAccessKey,
                    subject: `Ny henvendelse fra Usett.no – ${data.name}`,
                    from_name: "Usett – kontaktskjema",
                    Navn: data.name,
                    "E-post": data.email,
                    Firma: data.subject || "—",
                    Telefon: data.number,
                    "Valgt pakke": data.service || "—",
                    Melding: data.message,
                }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success(`Takk, ${data.name}! Meldingen din er sendt.`);
                reset();
            } else {
                toast.error("Noe gikk galt. Prøv igjen, eller send e-post direkte til Mikael@Usett.no.");
            }
        } catch {
            toast.error("Kunne ikke sende meldingen. Sjekk nettforbindelsen og prøv igjen.");
        }
    };

    return (
        <form id="contact-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
                {/* Inputs */}
                {formFields.map((field) => (
                    <div key={field.id} className={field.col}>
                        <div className="tp-contact-us-form-input mb-30">
                            <label>{field.label}</label>
                            {field.type === "select" ? (
                                <select defaultValue="" {...register(field.name, field.rules)}>
                                    <option value="" disabled>
                                        {field.placeholder}
                                    </option>
                                    {field.options?.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    {...register(field.name, field.rules)}
                                />
                            )}
                            {errors[field.name] && (
                                <p className="error-text">
                                    {errors[field.name]?.message}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {/* Textarea */}
                <div className="col-lg-12">
                    <div className="tp-contact-us-form-input mb-30">
                        <label>Om prosjektet</label>
                        <textarea
                            placeholder="Fortell oss kort om prosjektet ditt"
                            {...register("message", {
                                required: "Beskrivelse av prosjektet er påkrevd",
                                minLength: {
                                    value: 10,
                                    message: "Meldingen må være på minst 10 tegn",
                                },
                            })}
                        />
                        {errors.message && (
                            <p className="error-text">{errors.message.message}</p>
                        )}
                    </div>

                    {/* Button */}
                    <div className="tp-contact-us-form-btn">
                        <button type="submit" className="tp-btn-green tp-btn-anim">
                            <span className="tp-btn-text">Send melding</span>
                            <span>
                                <ArrowIconTwo width="11" height="12" />
                            </span>
                        </button>
                        <p className="ajax-response mt-5"></p>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ContactForm;
