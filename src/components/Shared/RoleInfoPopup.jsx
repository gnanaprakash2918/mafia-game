import React from 'react';

export const RoleInfoPopup = ({ role, onClose }) => {
    if (!role) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-secondary)',
                padding: '32px',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '90%',
                width: '400px',
                border: `2px solid ${role.color || 'var(--primary)'}`
            }} onClick={e => e.stopPropagation()}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: role.color }}>{role.name}</h2>
                <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: role.color,
                    color: '#fff',
                    marginBottom: '24px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                }}>
                    {role.team} - {role.category}
                </div>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '32px' }}>
                    {role.description}
                </p>
                <button
                    onClick={onClose}
                    style={{
                        background: 'var(--bg-tertiary)',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-md)',
                        width: '100%',
                        fontWeight: 'bold'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};
