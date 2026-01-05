import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
    const baseStyle = {
        padding: '16px 24px',
        borderRadius: 'var(--radius-md)',
        fontWeight: '600',
        fontSize: '1rem',
        width: '100%',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    };

    const variants = {
        primary: {
            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
            color: 'white',
            boxShadow: 'var(--shadow-glow)',
        },
        secondary: {
            background: 'var(--bg-tertiary)',
            color: 'var(--text-main)',
            border: '1px solid rgba(255,255,255,0.1)',
        },
        danger: {
            background: 'var(--danger)',
            color: 'white',
        },
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{ ...baseStyle, ...variants[variant] }}
            className={className}
        >
            {children}
        </button>
    );
};
