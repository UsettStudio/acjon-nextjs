export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    show: boolean;
}
export interface FaqGroup {
    common: FaqItem[];
    faq: FaqItem[];
}

export const faqData: FaqGroup = {
    common: [
        {
            id: 'collapseOne',
            question: 'What services does your agency offer?',
            answer:
                'From branding to web development, their team delivered a seamless experience. The attention to detail, responsiveness,',
            show: true,
        },
        {
            id: 'collapseTwo',
            question: 'Do you provide custom website solutions?',
            answer:
                'From branding to web development, their team delivered a seamless experience. The attention to detail, responsiveness,',
            show: false,
        },
        {
            id: 'collapseThree',
            question: 'Can you redesign my existing website?',
            answer:
                'From branding to web development, their team delivered a seamless experience. The attention to detail, responsiveness,',
            show: false,
        },
        {
            id: 'collapseFour',
            question: 'Do you offer digital marketing solutions?',
            answer:
                'From branding to web development, their team delivered a seamless experience. The attention to detail, responsiveness,',
            show: false,
        },
        {
            id: 'collapseFive',
            question: 'Is there a consultation fee?',
            answer:
                'From branding to web development, their team delivered a seamless experience. The attention to detail, responsiveness,',
            show: false,
        },
    ],
    faq: [
        {
            id: "one",
            question: "What services does your agency offer?",
            answer:
                "Our team blends creativity with a deep understanding of start-up dynamics. We prioritize innovation, data driven decisions, and user-focused designs while offering a collaborative.",
            show: true,
        },
        {
            id: "two",
            question: "Do you provide custom website solutions?",
            answer:
                "Our team blends creativity with a deep understanding of start-up dynamics. We prioritize innovation, data driven decisions, and user-focused designs while offering a collaborative.",
            show: false,
        },
        {
            id: "three",
            question: "Can you redesign my existing website?",
            answer:
                "Our team blends creativity with a deep understanding of start-up dynamics. We prioritize innovation, data driven decisions, and user-focused designs while offering a collaborative.",
            show: false,
        },
        {
            id: "four",
            question: "Do you offer digital marketing solutions?",
            answer:
                "Our team blends creativity with a deep understanding of start-up dynamics. We prioritize innovation, data driven decisions, and user-focused designs while offering a collaborative.",
            show: false,
        },
        {
            id: "five",
            question: "Is there a consultation fee?",
            answer:
                "Our team blends creativity with a deep understanding of start-up dynamics. We prioritize innovation, data driven decisions, and user-focused designs while offering a collaborative.",
            show: false,
        },
    ]
};