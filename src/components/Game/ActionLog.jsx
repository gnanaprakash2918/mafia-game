import React from 'react';

export const ActionLog = ({ logs }) => {
    return (
        <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginTop: '24px',
            maxHeight: '200px',
            overflowY: 'auto'
        }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Action Log</h3>
            {logs.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem' }}>No actions recorded yet.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {logs.map((log, index) => (
                        <div key={index} style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{log.message}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{log.time}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
