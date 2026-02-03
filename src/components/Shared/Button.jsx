import React from 'react';

export const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    disabled = false,
    style = {}
}) => {
    const sizeClass = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg',
    }[size] || 'btn-md';

    const variantClass = `btn-${variant}`;
    const widthClass = fullWidth ? 'btn-full' : '';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`btn ${variantClass} ${sizeClass} ${widthClass} ${className}`}
            style={style}
        >
            {children}
        </button>
    );
};
