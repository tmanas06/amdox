import React, { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeCustomizer.css';

const ThemeCustomizer = ({ isOpen, onClose }) => {
    const { customColors, updateCustomColor, resetToDefaults, defaultColors, theme } = useTheme();
    const modalRef = useRef(null);

    // Get effective theme for color defaults
    const getEffectiveTheme = () => {
        if (theme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return theme;
    };

    const effectiveTheme = getEffectiveTheme();
    const currentDefaults = defaultColors[effectiveTheme];

    // Current text color (custom or default)
    const currentTextColor = customColors?.textColor || currentDefaults.textColor;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="theme-customizer-overlay">
            <div className="theme-customizer-modal simple" ref={modalRef}>
                <div className="customizer-header">
                    <h2>🎨 Text Color</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="customizer-content simple">
                    <p className="section-description">Choose your preferred text color</p>

                    <div className="color-picker-simple">
                        <div className="color-input-wrapper">
                            <input
                                type="color"
                                value={currentTextColor}
                                onChange={(e) => updateCustomColor('textColor', e.target.value)}
                            />
                            <span className="color-value">{currentTextColor}</span>
                        </div>
                    </div>

                    <div className="color-preview">
                        <p style={{ color: currentTextColor }}>
                            This is how your text will look with the selected color.
                        </p>
                    </div>
                </div>

                <div className="customizer-footer">
                    <button className="reset-btn" onClick={resetToDefaults}>
                        Reset to Default
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeCustomizer;
