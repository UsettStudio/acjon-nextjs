"use client";
import { useCursorAndBackground } from "@/hooks/useCursorAndBackground";
import React, { ReactNode } from "react";

type CustomCursorProviderProps = {
  children: ReactNode;
  bgColor?: string; 
};

export default function CursorAndBackgroundProvider({ children, bgColor }: CustomCursorProviderProps) {
  useCursorAndBackground({ bgColor }); 
  return <>{children}</>;
}