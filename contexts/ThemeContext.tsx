import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('intelliheal-theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('intelliheal-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// Theme color utilities
export const themeColors = {
    light: {
        // Backgrounds
        bg: {
            primary: '#FFFFFF',
            secondary: '#F8FAFC',
            tertiary: '#F1F5F9',
            elevated: '#FFFFFF',
            overlay: 'rgba(15, 23, 42, 0.5)',
        },
        // Text
        text: {
            primary: '#0F172A',
            secondary: '#475569',
            tertiary: '#64748B',
            inverse: '#FFFFFF',
            accent: '#0EA5E9',
        },
        // Borders
        border: {
            light: '#E2E8F0',
            medium: '#CBD5E1',
            heavy: '#94A3B8',
        },
        // Medical colors
        medical: {
            primary: '#0EA5E9',    // Sky blue
            secondary: '#14B8A6',  // Teal
            success: '#10B981',    // Green
            warning: '#F59E0B',    // Amber
            danger: '#EF4444',     // Red
            info: '#3B82F6',       // Blue
        },
        // Status
        status: {
            low: '#10B981',        // Green
            moderate: '#F59E0B',   // Amber
            high: '#F97316',       // Orange
            critical: '#EF4444',   // Red
        },
    },
    dark: {
        // Backgrounds
        bg: {
            primary: '#0F0A1E',
            secondary: '#1A1429',
            tertiary: '#251C3B',
            elevated: '#2D2440',
            overlay: 'rgba(0, 0, 0, 0.7)',
        },
        // Text
        text: {
            primary: '#F8FAFC',
            secondary: '#CBD5E1',
            tertiary: '#94A3B8',
            inverse: '#0F172A',
            accent: '#38BDF8',
        },
        // Borders
        border: {
            light: 'rgba(255, 255, 255, 0.05)',
            medium: 'rgba(255, 255, 255, 0.1)',
            heavy: 'rgba(255, 255, 255, 0.2)',
        },
        // Medical colors
        medical: {
            primary: '#38BDF8',    // Sky blue
            secondary: '#2DD4BF',  // Teal
            success: '#34D399',    // Green
            warning: '#FBBF24',    // Amber
            danger: '#F87171',     // Red
            info: '#60A5FA',       // Blue
        },
        // Status
        status: {
            low: '#34D399',        // Green
            moderate: '#FBBF24',   // Amber
            high: '#FB923C',       // Orange
            critical: '#F87171',   // Red
        },
    },
};
