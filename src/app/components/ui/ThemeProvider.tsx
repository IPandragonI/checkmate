"use client";
import { useEffect, useState } from "react";

export default function ThemeProvider({ children, theme: initialTheme }: { children: React.ReactNode, theme?: string }) {
    const [theme, setTheme] = useState(initialTheme || "bluechess");

    useEffect(() => {
        if (typeof window !== "undefined") {
            document.body.setAttribute("data-theme", theme);
        }
    }, [theme]);

    return <>{children}</>;
}
