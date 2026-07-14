"use client";
import { useImageHoverReveal } from "@/hooks/useGsapAnimation";
import { ReactNode } from "react";

export default function ImageHoverRevealProvider({ children }: { children: ReactNode }) {
    useImageHoverReveal();
    return <>{children}</>;
}
