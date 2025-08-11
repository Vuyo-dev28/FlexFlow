
'use client';

import { AppSettings, SignalCategory } from "@/types/signal";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const SETTINGS_KEY = 'signalStreamSettings';

const defaultSettings: AppSettings = {
    tradingStyle: 'Day Trading',
    accountSize: 10000,
    riskPerTrade: 1,
    currency: 'USD',
    pushNotifications: true,
    emailNotifications: false,
    categories: ['Crypto', 'Stock Indices', 'Forex', 'Metals', 'Volatility Indices'],
};

interface SettingsContextType {
    settings: AppSettings;
    setSettings: (settings: AppSettings) => void;
    hasSettings: boolean | undefined;
    setHasSettings: (hasSettings: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);
    const [hasSettings, setHasSettings] = useState<boolean | undefined>(undefined);

    const loadSettings = useCallback(() => {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_KEY);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setSettingsState({ ...defaultSettings, ...parsed });
                setHasSettings(true);
            } else {
                setSettingsState(defaultSettings);
                setHasSettings(false);
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
            setSettingsState(defaultSettings);
        }
    }, []);

    useEffect(() => {
        loadSettings();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === SETTINGS_KEY) {
                loadSettings();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadSettings]);

    const setSettings = (newSettings: AppSettings) => {
        setSettingsState(newSettings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    };

    return (
        <SettingsContext.Provider value={{ settings, setSettings, hasSettings, setHasSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
