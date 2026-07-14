"use client";
import { useEffect } from "react";

export default function BootstrapLoader({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        import("bootstrap/dist/js/bootstrap.bundle.min").catch(() => { });
    }, []);

    return <>{children}</>;
}
