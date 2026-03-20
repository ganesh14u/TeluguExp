"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent browser from restoring scroll position on reload
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
        
        // Force scroll to top on initial load/hard refresh
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (!mounted) return;
        // Scroll to top on client-side routing
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, [pathname, mounted]);

    return null;
}
