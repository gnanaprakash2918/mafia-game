import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { ROLES } from '../../constants/roles';
import { CustomRoleCreator } from './CustomRoleCreator';

// Sub-components can be defined here or separated later for cleanliness.
// For now, keeping them internal for context access simplicity.

const PlayerCountStep = ({ count, setCount, onNext }) => (
    <div className="setup-step fade-in">
        <h2 style={{ fontSize: '2rem', marginBottom: '32px', textAlign: 'center' }}>How many players?</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '48px' }}>
            <Button variant="secondary" onClick={() => setCount(Math.max(3, count - 1))} style={{ width: '60px' }}>-</Button>
            <span style={{ fontSize: '4rem', fontWeight: 'bold', minWidth: '80px', textAlign: 'center' }}>{count}</span>
            <Button variant="secondary" onClick={() => setCount(count + 1)} style={{ width: '60px' }}>+</Button>
        </div>
        <Button onClick={onNext}>Next: Choose Roles</Button>
    </div>
);

const RoleSelectionStep = ({ playerCount, roles, setRoles, onNext, onBack }) => {
    const totalAssigned = Object.values(roles).reduce((a, b) => a + b, 0);
    const remaining = playerCount - totalAssigned;

    const [showCustomCreator, setShowCustomCreator] = useState(false);

    const updateRole = (roleId, delta) => {
        const current = roles[roleId] || 0;
        const newVal = Math.max(0, current + delta);

        // Prevent adding if no remaining slots (unless removing)
        if (delta > 0 && remaining <= 0) return;

        setRoles({ ...roles, [roleId]: newVal });
    };

    const handleCreateCustomRole = (newRole) => {
        // Add to global roles (This modifies the exported constant for this session)
        ROLES[newRole.id.toUpperCase()] = newRole;
        setRoles({ ...roles, [newRole.id]: 1 }); // Auto-add 1
        setShowCustomCreator(false);
    };

    return (
        <div className="setup-step fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Assign Roles</h2>
                <span style={{ color: remaining === 0 ? 'var(--success)' : 'var(--accent)', fontWeight: 'bold' }}>
                    {remaining} left
                </span>
            </div>

            {showCustomCreator ? (
                <CustomRoleCreator
                    onAddRole={handleCreateCustomRole}
                    onCancel={() => setShowCustomCreator(false)}
                />
            ) : (
                <>
                    <Button
                        variant="secondary"
                        onClick={() => setShowCustomCreator(true)}
                        style={{ marginBottom: '24px', borderStyle: 'dashed' }}
                    >
                        + Create Custom Role
                    </Button>

                    <div style={{ height: '40vh', overflowY: 'auto', paddingRight: '12px', marginBottom: '24px' }}>
                        {Object.values(ROLES).map((role) => (
                            <div key={role.id} style={{
                                background: 'var(--bg-tertiary)',
                                padding: '16px',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{role.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role.team}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        onClick={() => updateRole(role.id, -1)}
                                        style={{
                                            width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                                            background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer'
                                        }}
                                    >-</button>
                                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{roles[role.id] || 0}</span>
                                    <button
                                        onClick={() => updateRole(role.id, 1)}
                                        style={{
                                            width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                                            background: 'var(--primary)', color: 'white', cursor: 'pointer',
                                            opacity: remaining === 0 ? 0.3 : 1
                                        }}
                                    >+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="secondary" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={remaining !== 0}>Next: Enter Names</Button>
            </div>
        </div>
    );
};

const NameEntryStep = ({ playerCount, names, setNames, onNext, onBack }) => {
    const handleChange = (index, value) => {
        const newNames = [...names];
        newNames[index] = value;
        setNames(newNames);
    };

    return (
        <div className="setup-step fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Enter Names</h2>
            <div style={{ height: '50vh', overflowY: 'auto', paddingRight: '12px', marginBottom: '24px' }}>
                {Array.from({ length: playerCount }).map((_, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                        <input
                            type="text"
                            placeholder={`Player ${i + 1}`}
                            value={names[i] || ''}
                            onChange={(e) => handleChange(i, e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="secondary" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={names.filter(n => n.trim()).length !== playerCount}>Start Game</Button>
            </div>
        </div>
    );
};

export const SetupScreen = () => {
    const { updateSettings, setPlayers, startGame } = useGame();
    const [step, setStep] = useState(1);
    const [count, setCount] = useState(5);
    const [roles, setRoles] = useState({});
    const [names, setNames] = useState([]);
    const [manualMode, setManualMode] = useState(false);

    // Ensure names array resize if count changes
    React.useEffect(() => {
        setNames(prev => {
            const newArr = new Array(count).fill('');
            prev.forEach((n, i) => { if (i < count) newArr[i] = n; });
            return newArr;
        });
    }, [count]);

    const handleFinishSetup = () => {
        // 1. Create player objects consistently
        const playerList = [];
        let rolePool = [];

        // Flatten roles into a pool
        Object.entries(roles).forEach(([roleId, quantity]) => {
            for (let i = 0; i < quantity; i++) {
                rolePool.push(roleId);
            }
        });

        // Shuffle roles
        rolePool = rolePool.sort(() => Math.random() - 0.5);

        // Assign to players
        names.forEach((name, index) => {
            const roleId = rolePool[index];
            const roleDef = ROLES[Object.keys(ROLES).find(k => ROLES[k].id === roleId)];

            playerList.push({
                id: `p-${index}-${Date.now()}`,
                name: name.trim() || `Player ${index + 1}`,
                role: roleDef,
                isAlive: true,
                status: {}
            });
        });

        updateSettings({ playerCount: count, roles, manualMode });
        setPlayers(playerList);
        startGame();
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {step === 1 && (
                <PlayerCountStep count={count} setCount={setCount} onNext={() => setStep(2)} />
            )}
            {step === 2 && (
                <RoleSelectionStep
                    playerCount={count}
                    roles={roles}
                    setRoles={setRoles}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                />
            )}
            {step === 3 && (
                <NameEntryStep
                    playerCount={count}
                    names={names}
                    setNames={setNames}
                    onNext={handleFinishSetup}
                    onBack={() => setStep(2)}
                />
            )}
            {step === 3 && (
                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                    <input
                        type="checkbox"
                        id="manualMode"
                        checked={manualMode}
                        onChange={(e) => setManualMode(e.target.checked)}
                        style={{ width: '20px', height: '20px' }}
                    />
                    <label htmlFor="manualMode" style={{ fontSize: '1.1rem', cursor: 'pointer' }}>Enable Manual Referee Mode</label>
                </div>
            )}
        </div>
    );
};
