import React, { useState, useRef, useEffect } from 'react';
import type { ThemeName, Theme } from '../types';
import { PaletteIcon } from './icons/PaletteIcon';

interface ThemeSwitcherProps {
    currentTheme: ThemeName;
    setTheme: (theme: ThemeName) => void;
    themes: Record<ThemeName, Theme>;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, setTheme, themes }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const themeDisplayNames: Record<ThemeName, string> = {
        sky: 'أزرق سماوي',
        emerald: 'أخضر زمردي',
        rose: 'وردي',
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);


    return (
        <div className="relative" ref={wrapperRef}>
            <button onClick={() => setIsOpen(!isOpen)} className={`text-slate-400 hover:${themes[currentTheme].primaryText} transition-colors`} title="تغيير اللون">
                <PaletteIcon />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-40 p-2">
                    {Object.keys(themes).map((themeKey) => {
                        const themeName = themeKey as ThemeName;
                        return (
                            <button
                                key={themeName}
                                onClick={() => {
                                    setTheme(themeName);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-right p-2 rounded-md flex items-center gap-3 ${currentTheme === themeName ? `${themes[themeName].buttonBg} text-white` : 'hover:bg-slate-700'}`}
                            >
                                <span className={`w-4 h-4 rounded-full ${themes[themeName].buttonBg}`}></span>
                                <span>{themeDisplayNames[themeName]}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;