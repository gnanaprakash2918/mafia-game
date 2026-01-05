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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => onChange(Math.max(5, value - 5))} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer' }}>-</button>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                    width: '60px',
                    padding: '6px',
                    textAlign: 'center',
                    background: 'var(--bg-secondary)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'white',
                    fontSize: '0.9rem'
                }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>sec</span>
            <button onClick={() => onChange(value + 5)} style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer' }}>+</button>
        </div>
    </div>
);

// Default night steps
const DEFAULT_NIGHT_STEPS = [
    { id: 'SLEEP', label: 'Everyone Sleep', duration: 5 },
    { id: 'MAFIA_WAKE', label: 'Mafia Wake', duration: 8 },
    { id: 'MAFIA_CLOSE', label: 'Mafia Close', duration: 3 },
    { id: 'DETECTIVE_WAKE', label: 'Detective Wake', duration: 8 },
    { id: 'DETECTIVE_CLOSE', label: 'Detective Close', duration: 3 },
    { id: 'DOCTOR_WAKE', label: 'Doctor Wake', duration: 8 },
    { id: 'DOCTOR_CLOSE', label: 'Doctor Close', duration: 3 },
    { id: 'WAKE_ALL', label: 'Everyone Wake', duration: 5 },
];

const TimerConfigStep = ({ timers, setTimers, nightSteps, setNightSteps, onNext, onBack }) => {
    const updateTimer = (key, val) => setTimers({ ...timers, [key]: val });

    const updateStepDuration = (idx, val) => {
        const updated = [...nightSteps];
        updated[idx] = { ...updated[idx], duration: Math.max(0, parseInt(val) || 0) };
        setNightSteps(updated);
    };

    const moveStep = (idx, dir) => {
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= nightSteps.length) return;
        const updated = [...nightSteps];
        [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
        setNightSteps(updated);
    };

    const deleteStep = (idx) => {
        if (nightSteps.length <= 2) return;
        setNightSteps(nightSteps.filter((_, i) => i !== idx));
    };

    const addCustomStep = (label) => {
        if (!label.trim()) return;
        const newStep = { id: `CUSTOM_${Date.now()}`, label: label.trim(), duration: 8 };
        setNightSteps([...nightSteps.slice(0, -1), newStep, nightSteps[nightSteps.length - 1]]);
    };

    const setAllWakeDurations = (val) => {
        setNightSteps(nightSteps.map(s => s.id.includes('WAKE') && s.id !== 'WAKE_ALL' ? { ...s, duration: parseInt(val) || 0 } : s));
    };

    const setAllCloseDurations = (val) => {
        setNightSteps(nightSteps.map(s => s.id.includes('CLOSE') ? { ...s, duration: parseInt(val) || 0 } : s));
    };

    return (
        <div className="setup-step fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Game Settings</h2>

            {/* Phase Timers */}
            <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-muted)' }}>Phase Timers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <TimerEntry label="Day Intro" value={timers.day} onChange={(v) => updateTimer('day', v)} />
                <TimerEntry label="Discussion" value={timers.discussion} onChange={(v) => updateTimer('discussion', v)} />
                <TimerEntry label="Voting" value={timers.voting} onChange={(v) => updateTimer('voting', v)} />
            </div>

            {/* Bulk Edit */}
            <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-muted)' }}>Quick Set All</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.85rem' }}>Wake:</span>
                    <input type="number" defaultValue={8} onBlur={(e) => setAllWakeDurations(e.target.value)} style={{ width: '45px', padding: '4px', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white' }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>s</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '0.85rem' }}>Close:</span>
                    <input type="number" defaultValue={3} onBlur={(e) => setAllCloseDurations(e.target.value)} style={{ width: '45px', padding: '4px', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white' }} />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>s</span>
                </div>
            </div>

            {/* Night Steps Config */}
            <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-muted)' }}>Night Sequence</h3>
            <div style={{ maxHeight: '30vh', overflowY: 'auto', marginBottom: '12px' }}>
                {nightSteps.map((step, idx) => (
                    <div key={step.id} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px',
                        background: 'var(--bg-tertiary)', padding: '6px 10px', borderRadius: 'var(--radius-sm)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <button onClick={() => moveStep(idx, -1)} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.3 : 1, background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.6rem', padding: 0 }}>▲</button>
                            <button onClick={() => moveStep(idx, 1)} disabled={idx === nightSteps.length - 1} style={{ opacity: idx === nightSteps.length - 1 ? 0.3 : 1, background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.6rem', padding: 0 }}>▼</button>
                        </div>
                        <span style={{ flex: 1, fontSize: '0.85rem' }}>{step.label}</span>
                        <input
                            type="number"
                            value={step.duration}
                            onChange={(e) => updateStepDuration(idx, e.target.value)}
                            style={{ width: '45px', padding: '3px', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white', fontSize: '0.85rem' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>s</span>
                        {step.id.startsWith('CUSTOM_') && (
                            <button onClick={() => deleteStep(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Custom Step */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <input
                    type="text"
                    placeholder="Add custom step..."
                    id="customStepInput"
                    style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
                <Button variant="secondary" onClick={() => { const inp = document.getElementById('customStepInput'); addCustomStep(inp.value); inp.value = ''; }} style={{ padding: '8px 12px' }}>+ Add</Button>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="secondary" onClick={onBack}>Back</Button>
                <Button onClick={onNext}>Next: Names</Button>
            </div>
        </div>
    );
};
const NameEntryStep = ({ playerCount, names, setNames, onNext, onBack }) => (
    <div className="setup-step fade-in">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Enter Names</h2>
        <div style={{ height: '50vh', overflowY: 'auto', paddingRight: '12px', marginBottom: '24px' }}>
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
                            color: 'white', outline: 'none', fontSize: '1rem'
                        }}
                    />
                </div>
            ))}
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
    const [timers, setTimers] = useState({
        night: 15, day: 5, discussion: 180, voting: 60, unlimited: false, autoStartNight: false
    });
    const [nightSteps, setNightSteps] = useState(DEFAULT_NIGHT_STEPS);

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

        updateSettings({ playerCount: count, roles, timers, nightSteps });
        setPlayers(playerList);
        startGame();
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {step === 1 && <PlayerCountStep count={count} setCount={setCount} onNext={() => setStep(2)} />}
            {step === 2 && <RoleSelectionStep playerCount={count} roles={roles} setRoles={setRoles} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <TimerConfigStep timers={timers} setTimers={setTimers} nightSteps={nightSteps} setNightSteps={setNightSteps} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
            {step === 4 && <NameEntryStep playerCount={count} names={names} setNames={setNames} onNext={handleFinishSetup} onBack={() => setStep(3)} />}
        </div>
    );
};

