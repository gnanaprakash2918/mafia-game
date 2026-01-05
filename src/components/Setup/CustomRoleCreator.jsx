import React, { useState } from 'react';
import { Button } from '../Shared/Button';
import { TEAMS } from '../../constants/roles';

export const CustomRoleCreator = ({ onAddRole, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [team, setTeam] = useState(TEAMS.VILLAGE);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !description) return;

        const newRole = {
            id: `custom-${Date.now()}`,
            name,
            description,
            team,
            wakeOrder: -1, // Default to passive/no-wake for simplicity in v1
            isCustom: true,
        };

        onAddRole(newRole);
        setName('');
        setDescription('');
    };

    return (
        <div className="fade-in" style={{
            background: 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary-glow)',
            marginBottom: '24px'
        }}>
            <h3 style={{ marginBottom: '16px' }}>Create Custom Role</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Role Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. The Juggernaut"
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-tertiary)', color: 'white' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What does this role do?"
                        style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-tertiary)', color: 'white', minHeight: '80px', fontFamily: 'inherit' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Team</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {Object.values(TEAMS).map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTeam(t)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: `1px solid ${team === t ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                    background: team === t ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                                    color: team === t ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={!name || !description}>Add Role</Button>
                </div>
            </form>
        </div>
    );
};
