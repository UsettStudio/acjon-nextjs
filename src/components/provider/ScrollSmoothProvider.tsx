"use client";

import React from "react";
import useScrollSmooth from "@/hooks/useScrollSmooth";

export default function ScrollSmoothProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useScrollSmooth(); 
  return <>{children}</>;
}
