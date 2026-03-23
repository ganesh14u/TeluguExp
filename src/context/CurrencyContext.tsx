"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CountryCurrency = {
    code: string;
    flag: string;
    name: string;
    currency: string;
    symbol: string;
};

export const COUNTRIES: CountryCurrency[] = [
    { code: "IN", flag: "🇮🇳", name: "India", currency: "INR", symbol: "₹" },
    { code: "US", flag: "🇺🇸", name: "USA", currency: "USD", symbol: "$" },
    { code: "GB", flag: "🇬🇧", name: "UK", currency: "GBP", symbol: "£" },
    { code: "AE", flag: "🇦🇪", name: "UAE", currency: "AED", symbol: "د.إ" },
];

interface CurrencyContextType {
    selectedCountry: CountryCurrency;
    changeCountry: (code: string) => void;
    formatPrice: (price: number, qty?: number) => string;
    convertPrice: (price: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CACHE_KEY = "exchangeRatesCache";
const CACHE_TIME = 60 * 60 * 1000; // 1 hour

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [selectedCountry, setSelectedCountry] = useState<CountryCurrency>(COUNTRIES[0]);
    const [rates, setRates] = useState<Record<string, number>>({ INR: 1, USD: 0.012, GBP: 0.009, AED: 0.044 }); 
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedCountry = localStorage.getItem("selectedCountry");
        if (storedCountry) {
            const country = COUNTRIES.find((c) => c.code === storedCountry);
            if (country) setSelectedCountry(country);
        } else {
            // Auto-detect country if not set
            fetch("https://api.country.is")
                .then(res => res.json())
                .then(data => {
                    if (data && data.country) {
                        const country = COUNTRIES.find(c => c.code === data.country);
                        if (country) {
                            setSelectedCountry(country);
                            localStorage.setItem("selectedCountry", country.code);
                        }
                    }
                })
                .catch(err => console.error("IP detection failed", err));
        }

        const fetchRates = async () => {
            try {
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const { timestamp, data } = JSON.parse(cachedData);
                    if (Date.now() - timestamp < CACHE_TIME) {
                        setRates(data.rates);
                        return;
                    }
                }

                const res = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
                const data = await res.json();
                if (data && data.rates) {
                    setRates(data.rates);
                    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
                }
            } catch (error) {
                console.error("Failed to fetch exchange rates", error);
            }
        };

        fetchRates();
    }, []);

    const changeCountry = (code: string) => {
        const country = COUNTRIES.find((c) => c.code === code);
        if (country) {
            setSelectedCountry(country);
            localStorage.setItem("selectedCountry", code);
        }
    };

    const convertPrice = (priceInINR: number) => {
        const rate = rates[selectedCountry.currency] || 1;
        const converted = priceInINR * rate;
        
        if (selectedCountry.currency === "INR") {
            return Math.round(converted);
        } else {
            return Number(converted.toFixed(2));
        }
    };

    const formatPrice = (priceInINR: number, qty: number = 1) => {
        if (!mounted) return `₹${(priceInINR * qty).toLocaleString("en-IN")}`; 
        
        const converted = convertPrice(priceInINR * qty);
        
        if (selectedCountry.currency === "INR") {
            return `${selectedCountry.symbol}${converted.toLocaleString("en-IN")}`;
        } else {
            return `${selectedCountry.symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    };

    return (
        <CurrencyContext.Provider value={{ selectedCountry, changeCountry, formatPrice, convertPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
};
