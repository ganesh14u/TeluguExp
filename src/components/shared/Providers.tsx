"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {children}
            <Toaster
                position="bottom-right"
                expand={false}
                visibleToasts={1}
                duration={2000}
                className="font-sans"
                toastOptions={{
                    style: { fontFamily: 'var(--font-geist-sans)' },
                    classNames: {
                        toast: 'font-sans',
                        title: 'font-bold',
                        description: 'text-xs text-muted-foreground'
                    }
                }}
                style={{ right: '120px', bottom: '20px' }}
                richColors
            />
        </SessionProvider>
    );
}
