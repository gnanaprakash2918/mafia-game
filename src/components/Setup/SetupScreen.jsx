import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { ROLES, CATEGORIES } from '../../constants/roles';
import { CustomRoleCreator } from './CustomRoleCreator';
import { RoleInfoPopup } from '../Shared/RoleInfoPopup';

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
    const [expandedCategory, setExpandedCategory] = useState(CATEGORIES.CLASSIC);
    const [selectedRoleInfo, setSelectedRoleInfo] = useState(null);

    const updateRole = (roleId, delta) => {
        const current = roles[roleId] || 0;
        const newVal = Math.max(0, current + delta);
        if (delta > 0 && remaining <= 0) return;
        setRoles({ ...roles, [roleId]: newVal });
    };

    const handleCreateCustomRole = (newRole) => {
        // NOTE: Direct mutation of ROLES constant is not ideal but used here for simple session persistence.
        // In a real app, custom roles should be stored in GameContext settings.
        try {
            // Attempt to write, but if it fails (strict mode), we ignore or handle.
            // For now, we'll try to use a safer way if possible, or keep it if it works in non-strict.
            // But to prevent white-screen crashes, we wrap in try-catch.
            const roleWithCat = { ...newRole, category: CATEGORIES.CUSTOM };
            ROLES[roleWithCat.id.toUpperCase()] = roleWithCat;
            setRoles({ ...roles, [roleWithCat.id]: 1 });
            setShowCustomCreator(false);
            setExpandedCategory(CATEGORIES.CUSTOM);
        } catch (e) {
            console.error("Failed to add custom role", e);
            alert("Custom roles are limited in this version.");
            setShowCustomCreator(false);
        }
    };

    // Group roles by category
    const rolesByCategory = Object.values(ROLES).reduce((acc, role) => {
        const cat = role.category || 'Custom';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(role);
        return acc;
    }, {});

    return (
        <div className="setup-step fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
                        {Object.values(CATEGORIES).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setExpandedCategory(cat)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--primary)',
                                    background: expandedCategory === cat ? 'var(--primary)' : 'transparent',
                                    color: 'white',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div style={{ height: '40vh', overflowY: 'auto', paddingRight: '12px', marginBottom: '24px' }}>
                        {(rolesByCategory[expandedCategory] || []).map((role) => (
                            <div key={role.id} style={{
                                background: 'var(--bg-tertiary)',
                                padding: '16px',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setSelectedRoleInfo(role)}>
                                    <div style={{ fontWeight: 'bold', color: role.color || 'white' }}>{role.name} ℹ️</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role.description}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
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

            <Button
                variant="secondary"
                onClick={() => setShowCustomCreator(true)}
                style={{ marginBottom: '12px', borderStyle: 'dashed', padding: '12px' }}
            >
                + Custom Role
            </Button>

            <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="secondary" onClick={onBack}>Back</Button>
                <Button onClick={onNext} disabled={remaining !== 0}>Next</Button>
            </div>

            <RoleInfoPopup role={selectedRoleInfo} onClose={() => setSelectedRoleInfo(null)} />
        </div>
    );
};

const TimerEntry = ({ label, value, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
        <span style={{ fontWeight: 'bold' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => onChange(Math.max(5, value - 5))} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}>-</button>
            <span style={{ minWidth: '30px', textAlign: 'center' }}>{value}s</span>
            <button onClick={() => onChange(value + 5)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', border: 'none', color: 'white' }}>+</button>
        </div>
    </div>
);

const TimerConfigStep = ({ timers, setTimers, onNext, onBack }) => {
    const updateTimer = (key, val) => setTimers({ ...timers, [key]: val });

    return (
        <div className="setup-step fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Game Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <TimerEntry label="Day Intro" value={timers.day} onChange={(v) => updateTimer('day', v)} />
                <TimerEntry label="Discussion" value={timers.discussion} onChange={(v) => updateTimer('discussion', v)} />
                <TimerEntry label="Voting" value={timers.voting} onChange={(v) => updateTimer('voting', v)} />
                <TimerEntry label="Night Actions" value={timers.night} onChange={(v) => updateTimer('night', v)} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <span>Auto-Start Night</span>
                    <input
                        type="checkbox"
                        checked={timers.autoStartNight}
                        onChange={(e) => updateTimer('autoStartNight', e.target.checked)}
                        style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="secondary" onClick={onBack}>Back</Button>
                <Button onClick={onNext}>Next: Names</Button>
            </div>
        </div>
    );
};

const NameEntryStep = ({ playerCount, names, setNames, onNext, onBack, manualMode, setManualMode }) => (
    <div className="setup-step fade-in">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Enter Names</h2>
        <div style={{ height: '40vh', overflowY: 'auto', paddingRight: '12px', marginBottom: '24px' }}>
            {Array.from({ length: playerCount }).map((_, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                    <input
                        type="text"
                        placeholder={`Player ${i + 1}`}
                        value={names[i] || ''}
                        onChange={(e) => {
                            const newNames = [...names];
                            newNames[i] = e.target.value;
                            setNames(newNames);
                        }}
                        style={{
                            width: '100%', padding: '16px', background: 'var(--bg-tertiary)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)',
                            color: 'white', outline: 'none'
                        }}
                    />
                </div>
            ))}
        </div>

        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
            <input
                type="checkbox"
                id="manualMode"
                checked={manualMode}
                onChange={(e) => setManualMode(e.target.checked)}
                style={{ width: '20px', height: '20px' }}
            />
            <label htmlFor="manualMode" style={{ fontSize: '1.1rem', cursor: 'pointer' }}>Enable Manual Referee Mode</label>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={onBack}>Back</Button>
            <Button onClick={onNext} disabled={names.filter(n => n?.trim()).length !== playerCount}>Start Game</Button>
        </div>
    </div>
);

export const SetupScreen = () => {
    const { updateSettings, setPlayers, startGame } = useGame();
    const [step, setStep] = useState(1);
    const [count, setCount] = useState(5);
    const [roles, setRoles] = useState({});
    const [names, setNames] = useState([]);
    const [manualMode, setManualMode] = useState(false);
    const [timers, setTimers] = useState({
        night: 30, day: 10, discussion: 180, voting: 60, unlimited: false, autoStartNight: false
    });

    React.useEffect(() => {
        setNames(prev => {
            const newArr = new Array(count).fill('');
            prev.forEach((n, i) => { if (i < count) newArr[i] = n; });
            return newArr;
        });
    }, [count]);

    const handleFinishSetup = () => {
        const playerList = [];
        let rolePool = [];
        Object.entries(roles).forEach(([roleId, quantity]) => {
            for (let i = 0; i < quantity; i++) rolePool.push(roleId);
        });
        rolePool = rolePool.sort(() => Math.random() - 0.5);

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

        updateSettings({ playerCount: count, roles, manualMode, timers });
        setPlayers(playerList);
        startGame();
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {step === 1 && <PlayerCountStep count={count} setCount={setCount} onNext={() => setStep(2)} />}
            {step === 2 && <RoleSelectionStep playerCount={count} roles={roles} setRoles={setRoles} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <TimerConfigStep timers={timers} setTimers={setTimers} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
            {step === 4 && <NameEntryStep playerCount={count} names={names} setNames={setNames} onNext={handleFinishSetup} onBack={() => setStep(3)} manualMode={manualMode} setManualMode={setManualMode} />}
        </div>
    );
};
