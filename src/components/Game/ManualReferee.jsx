import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { GAME_PHASES, ROLES } from '../../constants/roles';
import { WinDeclaration } from './WinDeclaration';
import { ActionLog } from './ActionLog';
import { useTimer } from '../../hooks/useTimer';
import { RoleInfoPopup } from '../Shared/RoleInfoPopup';

// Night step sequence
const NIGHT_STEPS = [
    { id: 'SLEEP', label: '☽ Everyone Sleep', tts: 'Everyone close your eyes and go to sleep.' },
    { id: 'MAFIA_WAKE', label: '🔫 Mafia Wake', tts: 'Mafia, wake up.' },
    { id: 'MAFIA_CLOSE', label: '🔫 Mafia Close', tts: 'Mafia, close your eyes.' },
    { id: 'DETECTIVE_WAKE', label: '🔍 Detective Wake', tts: 'Detective, wake up.' },
    { id: 'DETECTIVE_CLOSE', label: '🔍 Detective Close', tts: 'Detective, close your eyes.' },
    { id: 'DOCTOR_WAKE', label: '💉 Doctor Wake', tts: 'Doctor, wake up.' },
    { id: 'DOCTOR_CLOSE', label: '💉 Doctor Close', tts: 'Doctor, close your eyes.' },
    { id: 'WAKE_ALL', label: '☀ Everyone Wake', tts: 'Everyone wake up. It is now morning.' },
];

export const ManualReferee = () => {
    const { state, dispatch, nextPhase, logAction, checkWinCondition, declareWin } = useGame();
    const { players, phase, settings, logs, day, nightStep } = state;
    const [selectedPlayerForAction, setSelectedPlayerForAction] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [killerRole, setKillerRole] = useState('');
    const [viewingRole, setViewingRole] = useState(null);

    // Get alive mafia roles for killer dropdown
    const aliveKillerRoles = useMemo(() => {
        const killers = players.filter(p => p.isAlive && (p.role.team === 'MAFIA' || p.role.id === 'vigilante'));
        const uniqueRoles = [...new Set(killers.map(p => p.role.name))];
        return uniqueRoles;
    }, [players]);

    // Timer
    const getPhaseDuration = () => {
        switch (phase) {
            case GAME_PHASES.DAY_INTRO: return settings.timers.day;
            case GAME_PHASES.DISCUSSION: return settings.timers.discussion;
            case GAME_PHASES.VOTING: return settings.timers.voting;
            case GAME_PHASES.NIGHT_ACTIVE: return settings.timers.night;
            default: return 0;
        }
    };

    const { formattedTime, start: startTimer, reset: resetTimer, pause, isRunning } = useTimer(
        getPhaseDuration() || 60, settings.timers.unlimited, () => { }
    );

    useEffect(() => {
        if (getPhaseDuration() > 0) {
            resetTimer(getPhaseDuration());
            startTimer();
        } else {
            resetTimer(0);
        }
    }, [phase]);

    // --- NIGHT STEP CONTROLS ---
    const setNightStep = (step) => {
        dispatch({ type: 'SET_NIGHT_STEP', payload: step });
        logAction(NIGHT_STEPS.find(s => s.id === step)?.label || step);

        if (step === 'WAKE_ALL') {
            nextPhase(GAME_PHASES.DAY_INTRO);
        }
    };

    // --- ACTION LOGIC ---
    const initiateKillOrKick = (player) => {
        setSelectedPlayerForAction(player);
        setKillerRole('');
        setShowActionModal(true);
    };

    const confirmAction = () => {
        if (!selectedPlayerForAction) return;
        const player = selectedPlayerForAction;
        const isVoting = phase === GAME_PHASES.VOTING;

        dispatch({
            type: 'UPDATE_PLAYER_STATUS',
            payload: { id: player.id, updates: { isAlive: false } },
        });

        const reason = isVoting ? 'Voted Out' : (killerRole || 'Unknown');
        logAction(`${player.name} was eliminated (${reason})`);

        setShowActionModal(false);
        setSelectedPlayerForAction(null);

        // Check win condition
        const updatedPlayers = players.map(p => p.id === player.id ? { ...p, isAlive: false } : p);
        const winResult = checkWinCondition(updatedPlayers);
        if (winResult) {
            declareWin(winResult.team, winResult.message);
        }
    };

    const handleRevive = (player) => {
        dispatch({
            type: 'UPDATE_PLAYER_STATUS',
            payload: { id: player.id, updates: { isAlive: true } },
        });
        logAction(`${player.name} was revived`);
    };

    const advancePhase = (targetPhase) => {
        nextPhase(targetPhase);
        logAction(`Phase: ${targetPhase}`);
        if (targetPhase === GAME_PHASES.DAY_INTRO) {
            dispatch({ type: 'INCREMENT_DAY' });
        }
    };

    // --- UI ---
    const isNightPhase = phase === GAME_PHASES.NIGHT_INTRO || phase === GAME_PHASES.NIGHT_ACTIVE;
    const isVotingPhase = phase === GAME_PHASES.VOTING;

    return (
        <div className="fade-in" style={{ paddingBottom: '40px' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.4rem' }}>Referee Dashboard</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" onClick={() => { if (confirm('End game?')) dispatch({ type: 'RESET_GAME' }) }} style={{ width: 'auto', padding: '8px 12px', fontSize: '0.8rem' }}>
                        End
                    </Button>
                </div>
            </div>

            {/* DAY & PHASE INDICATOR */}
            <div style={{
                background: isNightPhase ? '#0c0c20' : 'var(--bg-tertiary)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                textAlign: 'center',
                border: `2px solid ${isNightPhase ? '#4338ca' : 'var(--warning)'}`
            }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Day {day}</div>
                <h2 style={{ fontSize: '1.8rem', color: isNightPhase ? '#818cf8' : 'var(--warning)', marginBottom: '8px' }}>
                    {phase.replace(/_/g, ' ')}
                </h2>
                {getPhaseDuration() > 0 && (
                    <div style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {formattedTime}
                    </div>
                )}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                    <Button variant="secondary" onClick={isRunning ? pause : startTimer} style={{ width: 'auto', padding: '6px 12px' }}>
                        {isRunning ? '⏸' : '▶'}
                    </Button>
                    <Button variant="secondary" onClick={() => resetTimer(getPhaseDuration())} style={{ width: 'auto', padding: '6px 12px' }}>
                        ↺
                    </Button>
                </div>
            </div>

            {/* NIGHT STEP CONTROLS (Only during Night) */}
            {isNightPhase && (
                <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Night Sequence</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {NIGHT_STEPS.map(step => (
                            <Button
                                key={step.id}
                                variant={nightStep === step.id ? 'primary' : 'secondary'}
                                onClick={() => setNightStep(step.id)}
                                style={{ padding: '10px 14px', fontSize: '0.85rem', flex: '1 1 45%' }}
                            >
                                {step.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* DAY PHASE CONTROLS */}
            {!isNightPhase && (
                <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Phase Control</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Button variant={phase === GAME_PHASES.DAY_INTRO ? 'primary' : 'secondary'} onClick={() => advancePhase(GAME_PHASES.DAY_INTRO)} style={{ flex: 1 }}>Day Intro</Button>
                        <Button variant={phase === GAME_PHASES.DISCUSSION ? 'primary' : 'secondary'} onClick={() => advancePhase(GAME_PHASES.DISCUSSION)} style={{ flex: 1 }}>Discussion</Button>
                        <Button variant={phase === GAME_PHASES.VOTING ? 'primary' : 'secondary'} onClick={() => advancePhase(GAME_PHASES.VOTING)} style={{ flex: 1 }}>Voting</Button>
                        <Button variant="secondary" onClick={() => { dispatch({ type: 'SET_NIGHT_STEP', payload: 'IDLE' }); advancePhase(GAME_PHASES.NIGHT_INTRO); }} style={{ flex: 1 }}>Start Night</Button>
                    </div>
                </div>
            )}

            <ActionLog logs={logs} />

            {/* PLAYERS LIST */}
            <h3 style={{ marginBottom: '12px', marginTop: '20px', fontSize: '1rem' }}>Players</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {players.map(player => (
                    <div key={player.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px',
                        background: player.isAlive ? 'var(--bg-tertiary)' : 'rgba(100,100,100,0.1)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${player.role.color || 'var(--text-muted)'}`,
                        opacity: player.isAlive ? 1 : 0.5
                    }}>
                        <div onClick={() => setViewingRole(player.role)} style={{ cursor: 'pointer' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', textDecoration: player.isAlive ? 'none' : 'line-through' }}>
                                {player.name}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {player.role.name} <span style={{ opacity: 0.5 }}>👁</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            {player.isAlive ? (
                                <Button
                                    variant={isVotingPhase ? 'primary' : 'danger'}
                                    onClick={() => initiateKillOrKick(player)}
                                    style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}
                                >
                                    {isVotingPhase ? 'Kick' : 'Kill'}
                                </Button>
                            ) : (
                                <Button variant="secondary" onClick={() => handleRevive(player)} style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}>
                                    Revive
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <WinDeclaration />

            {/* ACTION MODAL */}
            {showActionModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '320px' }}>
                        <h3 style={{ marginBottom: '16px' }}>
                            {isVotingPhase ? 'Kick' : 'Kill'} {selectedPlayerForAction?.name}?
                        </h3>

                        {!isVotingPhase && (
                            <>
                                <p style={{ marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Who killed them?</p>
                                <select
                                    value={killerRole}
                                    onChange={e => setKillerRole(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px', marginBottom: '16px',
                                        background: 'var(--bg-tertiary)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 'var(--radius-sm)', fontSize: '1rem'
                                    }}
                                >
                                    <option value="">Select Killer...</option>
                                    {aliveKillerRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                    <option value="Unknown">Unknown</option>
                                </select>
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button variant="secondary" onClick={() => setShowActionModal(false)}>Cancel</Button>
                            <Button variant={isVotingPhase ? 'primary' : 'danger'} onClick={confirmAction}>
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <RoleInfoPopup role={viewingRole} onClose={() => setViewingRole(null)} />
        </div>
    );
};
