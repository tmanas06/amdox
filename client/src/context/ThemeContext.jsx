import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

const defaultColors = {
    dark: {
        primaryColor: '#60a5fa',
        textColor: '#60a5fa',
        backgroundColor: '#030712',
        cardColor: 'rgba(15, 23, 42, 0.4)'
    },
    light: {
        primaryColor: '#3b82f6',
        textColor: '#1e3a8a',
        backgroundColor: '#f8fafc',
        cardColor: 'rgba(255, 255, 255, 0.8)'
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        const savedTheme = localStorage.getItem('theme') || localStorage.getItem('amdox-theme');
        return savedTheme || 'dark';
    });

    const [customColors, setCustomColors] = useState(() => {
        const saved = localStorage.getItem('amdox-custom-colors');
        return saved ? JSON.parse(saved) : null;
    });

    // Apply theme and colors to document
    useEffect(() => {
        localStorage.setItem('theme', theme);
        localStorage.setItem('amdox-theme', theme);

        // Handle auto theme
        let effectiveTheme = theme;
        if (theme === 'auto') {
            effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        document.documentElement.setAttribute('data-theme', effectiveTheme);

        // Only apply custom text color if it exists
        if (customColors?.textColor) {
            const root = document.documentElement;
            root.style.setProperty('--text-primary', customColors.textColor);
            root.style.setProperty('--text-secondary', customColors.textColor);
            root.style.setProperty('--text-muted', customColors.textColor);
        } else {
            // Remove custom properties to let theme.css defaults take over
            const root = document.documentElement;
            root.style.removeProperty('--text-primary');
            root.style.removeProperty('--text-secondary');
            root.style.removeProperty('--text-muted');
        }
    }, [theme, customColors]);

    // Listen for system theme changes when in auto mode
    useEffect(() => {
        if (theme !== 'auto') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const effectiveTheme = mediaQuery.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', effectiveTheme);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const updateCustomColor = (colorKey, value) => {
        setCustomColors(prev => {
            const updated = { ...(prev || {}), [colorKey]: value };
            localStorage.setItem('amdox-custom-colors', JSON.stringify(updated));
            return updated;
        });
    };

    const resetToDefaults = () => {
        setCustomColors(null);
        localStorage.removeItem('amdox-custom-colors');
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme,
            toggleTheme,
            customColors,
            updateCustomColor,
            resetToDefaults,
            defaultColors
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
