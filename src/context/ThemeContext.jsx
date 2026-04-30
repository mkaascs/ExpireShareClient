import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() =>
        localStorage.getItem('theme') ?? 'dark'
    )

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggle = () => {
        document.documentElement.classList.add('theme-switching')
        setTheme(t => t === 'dark' ? 'light' : 'dark')
        setTimeout(() => document.documentElement.classList.remove('theme-switching'), 400)
    }

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
