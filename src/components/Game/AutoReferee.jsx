import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { useTimer } from '../../hooks/useTimer';
import { Button } from '../Shared/Button';
import { GAME_PHASES } from '../../constants/roles';
import { WinDeclaration } from './WinDeclaration';
import { ActionLog } from './ActionLog';
import { RoleInfoPopup } from '../Shared/RoleInfoPopup';

// Night sequence steps with default durations
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

export const AutoReferee = () => {
    const { state, dispatch, nextPhase, checkWinCondition, declareWin, logAction } = useGame();
    const { players, settings, day, phase, logs, nightStep } = state;

    // Get night steps from settings or use defaults
    const NIGHT_STEPS = settings.nightSteps || DEFAULT_NIGHT_STEPS;

    // Night action tracking
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [selectedActor, setSelectedActor] = useState('');
    const [viewingRole, setViewingRole] = useState(null);
    const [showLogs, setShowLogs] = useState(false);

    // Track performed actions this round
    const [roundActions, setRoundActions] = useState({
        mafiaKill: null,      // { target: playerId, killer: name }
        detectiveCheck: null, // { target: playerId, detective: name }
        doctorSave: null,     // { target: playerId, doctor: name }
    });

    // Pending death (will be resolved at dawn unless saved)
    const [pendingDeath, setPendingDeath] = useState(null);

    // Players by role for dropdowns
    const aliveMafia = useMemo(() => players.filter(p => p.isAlive && p.role.team === 'MAFIA'), [players]);
    const aliveDetectives = useMemo(() => players.filter(p => p.isAlive && (p.role.id === 'detective' || p.role.id === 'pi')), [players]);
    const aliveDoctors = useMemo(() => players.filter(p => p.isAlive && p.role.id === 'doctor'), [players]);
    const alivePlayers = useMemo(() => players.filter(p => p.isAlive), [players]);

    // Timer - get duration based on current phase or step
    const getPhaseDuration = (targetPhase) => {
        const p = targetPhase || phase;
        if (p === GAME_PHASES.DISCUSSION) return settings.timers.discussion || 180;
        if (p === GAME_PHASES.VOTING) return settings.timers.voting || 60;
        if (p === GAME_PHASES.DAY_INTRO) return settings.timers.day || 5;
        return settings.timers.night || 15;
    };

    const getStepDuration = (stepId) => {
        const step = NIGHT_STEPS.find(s => s.id === stepId);
        return step?.duration || 15;
    };

    const { timeLeft, start: startTimer, reset: resetTimer, formattedTime, pause, isRunning } = useTimer(
        getPhaseDuration(), settings.timers.unlimited, () => { }
    );

    // Night step handler - starts timer with step-specific duration
    const setNightStep = (stepId) => {
        dispatch({ type: 'SET_NIGHT_STEP', payload: stepId });
        const step = NIGHT_STEPS.find(s => s.id === stepId);
        if (step) logAction(step.label);

        // Start timer with step-specific duration
        resetTimer(getStepDuration(stepId));
        startTimer();

        if (stepId === 'WAKE_ALL') {
            // Resolve pending death
            let someoneDied = false;
            if (pendingDeath && roundActions.doctorSave?.target !== pendingDeath.id) {
                dispatch({ type: 'UPDATE_PLAYER_STATUS', payload: { id: pendingDeath.id, updates: { isAlive: false, deathDay: day } } });
                logAction(`💀 ${pendingDeath.name} was killed by ${roundActions.mafiaKill?.killer || 'Mafia'}`);
                someoneDied = true;
            } else if (pendingDeath && roundActions.doctorSave?.target === pendingDeath.id) {
                logAction(`💉 ${pendingDeath.name} was saved by Doctor!`);
            } else if (!pendingDeath) {
                logAction(`☀ No one died tonight`);
            }

            // Summary: Who's still alive
            const updatedPlayers = players.map(p =>
                pendingDeath && p.id === pendingDeath.id && roundActions.doctorSave?.target !== pendingDeath.id
                    ? { ...p, isAlive: false } : p
            );
            const mafiaAlive = updatedPlayers.filter(p => p.isAlive && p.role.team === 'MAFIA').length;
            const villageAlive = updatedPlayers.filter(p => p.isAlive && p.role.team === 'VILLAGE').length;
            const deadPlayers = updatedPlayers.filter(p => !p.isAlive);

            logAction(`📊 Alive: ${mafiaAlive} Mafia, ${villageAlive} Village`);
            if (deadPlayers.length > 0) {
                logAction(`⚰️ Dead: ${deadPlayers.map(p => p.name).join(', ')}`);
            }

            // Reset round actions
            setRoundActions({ mafiaKill: null, detectiveCheck: null, doctorSave: null });
            setPendingDeath(null);

            dispatch({ type: 'INCREMENT_DAY' });
            nextPhase(GAME_PHASES.DAY_INTRO);
        }
    };

    const getCurrentStepIndex = () => NIGHT_STEPS.findIndex(s => s.id === nightStep);

    // Check if action already performed
    const hasMafiaActed = roundActions.mafiaKill !== null;
    const hasDetectiveActed = roundActions.detectiveCheck !== null;
    const hasDoctorActed = roundActions.doctorSave !== null;

    // Action handlers
    const openActionModal = (player, type) => {
        setSelectedPlayer(player);
        setActionType(type);
        let actors = [];
        if (type === 'KILL') actors = aliveMafia;
        else if (type === 'CHECK') actors = aliveDetectives;
        else if (type === 'SAVE') actors = aliveDoctors;

        setSelectedActor(actors.length === 1 ? actors[0].name : '');
        setShowActionModal(true);
    };

    const confirmAction = () => {
        if (!selectedPlayer) return;

        if (actionType === 'KILL') {
            // Mark as pending death instead of killing immediately
            setPendingDeath(selectedPlayer);
            setRoundActions(prev => ({ ...prev, mafiaKill: { target: selectedPlayer.id, killer: selectedActor || 'Mafia' } }));
            logAction(`Mafia targets ${selectedPlayer.name}`);
            setNightStep('MAFIA_CLOSE');
        } else if (actionType === 'KICK') {
            dispatch({ type: 'UPDATE_PLAYER_STATUS', payload: { id: selectedPlayer.id, updates: { isAlive: false, deathDay: day } } });
            logAction(`${selectedPlayer.name} voted out`);

            const updated = players.map(p => p.id === selectedPlayer.id ? { ...p, isAlive: false } : p);
            const win = checkWinCondition(updated, selectedPlayer, true);
            if (win) {
                declareWin(win.team, win.message);
            } else {
                setTimeout(() => {
                    dispatch({ type: 'SET_NIGHT_STEP', payload: 'IDLE' });
                    setRoundActions({ mafiaKill: null, detectiveCheck: null, doctorSave: null });
                    nextPhase(GAME_PHASES.NIGHT_INTRO);
                }, 500);
            }
        } else if (actionType === 'CHECK') {
            const isMafia = selectedPlayer.role.team === 'MAFIA';
            const result = isMafia ? '🔴 MAFIA' : '🟢 NOT MAFIA';
            setRoundActions(prev => ({ ...prev, detectiveCheck: { target: selectedPlayer.id, detective: selectedActor } }));
            logAction(`${selectedActor || 'Detective'} checked ${selectedPlayer.name} → ${result}`);
            setNightStep('DETECTIVE_CLOSE');
        } else if (actionType === 'SAVE') {
            setRoundActions(prev => ({ ...prev, doctorSave: { target: selectedPlayer.id, doctor: selectedActor } }));
            logAction(`${selectedActor || 'Doctor'} protects ${selectedPlayer.name}`);
            setNightStep('DOCTOR_CLOSE');
        }

        setShowActionModal(false);
        setSelectedPlayer(null);
    };

    const handleRevive = (player) => {
        dispatch({ type: 'UPDATE_PLAYER_STATUS', payload: { id: player.id, updates: { isAlive: true } } });
        logAction(`${player.name} revived`);
    };

    const advancePhase = (targetPhase) => {
        nextPhase(targetPhase);
        logAction(`Phase: ${targetPhase.replace(/_/g, ' ')}`);
        // Start timer for the new phase
        const duration = getPhaseDuration(targetPhase);
        resetTimer(duration);
        startTimer();
    };

    // Styles
    const btnStyle = { minHeight: '48px', fontSize: '0.95rem', padding: '12px 16px' };
    const isNight = phase === GAME_PHASES.NIGHT_INTRO || phase === GAME_PHASES.NIGHT_ACTIVE;
    const isMafiaWake = nightStep === 'MAFIA_WAKE';
    const isDetWake = nightStep === 'DETECTIVE_WAKE';
    const isDocWake = nightStep === 'DOCTOR_WAKE';

    return (
        <div className="fade-in" style={{ padding: '16px', paddingBottom: '60px' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '8px' }}>
                <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Referee</h2>
                <Button variant="secondary" onClick={() => { if (confirm('End game?')) dispatch({ type: 'RESET_GAME' }); }} style={{ ...btnStyle, width: 'auto', padding: '8px 12px' }}>
                    End
                </Button>
            </div>

            {/* TIMER DISPLAY */}
            <div style={{
                background: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                textAlign: 'center',
                border: '2px solid var(--primary)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)' }}>Day {day}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {isNight ? nightStep.replace(/_/g, ' ') : phase.replace(/_/g, ' ')}
                    </span>
                </div>

                <div style={{ fontSize: '4rem', fontFamily: 'monospace', fontWeight: 'bold', color: timeLeft < 10 && timeLeft > 0 ? 'var(--danger)' : 'white' }}>
                    {formattedTime}
                </div>

                {/* Main Controls - Icon only, single line */}
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '12px' }}>
                    <Button variant="secondary" onClick={() => {
                        if (phase === GAME_PHASES.DISCUSSION) advancePhase(GAME_PHASES.DAY_INTRO);
                        else if (phase === GAME_PHASES.VOTING) advancePhase(GAME_PHASES.DISCUSSION);
                        else if (phase === GAME_PHASES.DAY_INTRO) { dispatch({ type: 'SET_NIGHT_STEP', payload: 'IDLE' }); advancePhase(GAME_PHASES.NIGHT_INTRO); }
                        else if (isNight && getCurrentStepIndex() > 0) setNightStep(NIGHT_STEPS[getCurrentStepIndex() - 1].id);
                    }} style={{ padding: '10px 14px', minHeight: '40px' }}>⏮</Button>

                    <Button variant="secondary" onClick={isRunning ? pause : startTimer} style={{ padding: '10px 14px', minHeight: '40px' }}>
                        {isRunning ? '⏸' : '▶'}
                    </Button>

                    <Button variant="secondary" onClick={() => resetTimer(isNight ? getStepDuration(nightStep) : getPhaseDuration())} style={{ padding: '10px 14px', minHeight: '40px' }}>↺</Button>

                    <Button variant="secondary" onClick={() => {
                        if (phase === GAME_PHASES.DAY_INTRO) advancePhase(GAME_PHASES.DISCUSSION);
                        else if (phase === GAME_PHASES.DISCUSSION) advancePhase(GAME_PHASES.VOTING);
                        else if (phase === GAME_PHASES.VOTING) { dispatch({ type: 'SET_NIGHT_STEP', payload: 'IDLE' }); setRoundActions({ mafiaKill: null, detectiveCheck: null, doctorSave: null }); advancePhase(GAME_PHASES.NIGHT_INTRO); }
                        else if (isNight) setNightStep('WAKE_ALL');
                    }} style={{ padding: '10px 14px', minHeight: '40px' }}>⏭</Button>
                </div>

                {/* Night Steps - Swipe Style */}
                {isNight && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                        <Button
                            variant="secondary"
                            onClick={() => getCurrentStepIndex() > 0 && setNightStep(NIGHT_STEPS[getCurrentStepIndex() - 1].id)}
                            disabled={getCurrentStepIndex() <= 0}
                            style={{ padding: '8px 12px', opacity: getCurrentStepIndex() <= 0 ? 0.3 : 1 }}
                        >◀</Button>
                        <div style={{
                            background: 'var(--bg-tertiary)',
                            padding: '12px 20px',
                            borderRadius: 'var(--radius-md)',
                            minWidth: '160px',
                            textAlign: 'center',
                            border: '2px solid var(--primary)'
                        }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                {NIGHT_STEPS[getCurrentStepIndex()]?.label || 'Night'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {getCurrentStepIndex() + 1} / {NIGHT_STEPS.length}
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => getCurrentStepIndex() < NIGHT_STEPS.length - 1 && setNightStep(NIGHT_STEPS[getCurrentStepIndex() + 1].id)}
                            disabled={getCurrentStepIndex() >= NIGHT_STEPS.length - 1}
                            style={{ padding: '8px 12px', opacity: getCurrentStepIndex() >= NIGHT_STEPS.length - 1 ? 0.3 : 1 }}
                        >▶</Button>
                    </div>
                )}

                {/* Skip Action Buttons for Night */}
                {isNight && (isMafiaWake && !hasMafiaActed) && (
                    <Button variant="secondary" onClick={() => { logAction('Mafia skipped'); setRoundActions(prev => ({ ...prev, mafiaKill: { target: null, killer: 'None' } })); setNightStep('MAFIA_CLOSE'); }} style={{ ...btnStyle, marginTop: '8px', width: '100%', fontSize: '0.85rem' }}>Skip Kill</Button>
                )}
                {isNight && (isDetWake && !hasDetectiveActed) && (
                    <Button variant="secondary" onClick={() => { logAction('Detective skipped'); setRoundActions(prev => ({ ...prev, detectiveCheck: { target: null } })); setNightStep('DETECTIVE_CLOSE'); }} style={{ ...btnStyle, marginTop: '8px', width: '100%', fontSize: '0.85rem' }}>Skip Check</Button>
                )}
                {isNight && (isDocWake && !hasDoctorActed) && (
                    <Button variant="secondary" onClick={() => { logAction('Doctor skipped'); setRoundActions(prev => ({ ...prev, doctorSave: { target: null } })); setNightStep('DOCTOR_CLOSE'); }} style={{ ...btnStyle, marginTop: '8px', width: '100%', fontSize: '0.85rem' }}>Skip Save</Button>
                )}

                {/* Quick Phase Jumps */}
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '10px' }}>
                    <Button variant={isNight ? 'primary' : 'secondary'} onClick={() => { dispatch({ type: 'SET_NIGHT_STEP', payload: 'IDLE' }); advancePhase(GAME_PHASES.NIGHT_INTRO); }} style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px' }}>Night</Button>
                    <Button variant={phase === GAME_PHASES.DAY_INTRO ? 'primary' : 'secondary'} onClick={() => advancePhase(GAME_PHASES.DAY_INTRO)} style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px' }}>Day</Button>
                    <Button variant={phase === GAME_PHASES.DISCUSSION ? 'primary' : 'secondary'} onClick={() => advancePhase(GAME_PHASES.DISCUSSION)} style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px' }}>Talk</Button>
                    <Button variant={phase === GAME_PHASES.VOTING ? 'primary' : 'secondary'} onClick={() => advancePhase(GAME_PHASES.VOTING)} style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px' }}>Vote</Button>
                </div>
            </div>

            {/* ACTION LOG BUTTON */}
            <Button variant="secondary" onClick={() => setShowLogs(true)} style={{ ...btnStyle, marginBottom: '16px', width: '100%' }}>
                📜 View Action Log ({logs.length})
            </Button>

            {/* PLAYERS */}
            <h3 style={{ fontSize: '1rem', margin: '16px 0 12px' }}>Players</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {players.map(player => {
                    const isPendingDeath = pendingDeath?.id === player.id;
                    const canMafiaTarget = player.role.team !== 'MAFIA';
                    const canDetTarget = true; // Det can check anyone
                    const canDocTarget = true; // Doc can save anyone including self

                    return (
                        <div key={player.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '14px',
                            background: isPendingDeath ? 'rgba(239, 68, 68, 0.2)' : (player.isAlive ? 'var(--bg-tertiary)' : 'rgba(100,100,100,0.1)'),
                            borderRadius: 'var(--radius-md)',
                            borderLeft: `4px solid ${player.role.color || 'var(--text-muted)'}`,
                            opacity: player.isAlive ? 1 : 0.5
                        }}>
                            <div onClick={() => setViewingRole(player.role)} style={{ cursor: 'pointer' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.05rem', textDecoration: player.isAlive ? 'none' : 'line-through' }}>
                                    {player.name} {isPendingDeath && '💀'}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{player.role.name} 👁</div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {player.isAlive ? (
                                    <>
                                        {isMafiaWake && !hasMafiaActed && canMafiaTarget && (
                                            <Button variant="danger" onClick={() => openActionModal(player, 'KILL')} style={{ ...btnStyle, padding: '8px 12px' }}>Kill</Button>
                                        )}
                                        {isDetWake && !hasDetectiveActed && (
                                            <Button variant="secondary" onClick={() => openActionModal(player, 'CHECK')} style={{ ...btnStyle, padding: '8px 12px' }}>Check</Button>
                                        )}
                                        {isDocWake && !hasDoctorActed && (
                                            <Button variant="secondary" onClick={() => openActionModal(player, 'SAVE')} style={{ ...btnStyle, padding: '8px 12px' }}>Save</Button>
                                        )}
                                        {phase === GAME_PHASES.VOTING && (
                                            <Button variant="primary" onClick={() => openActionModal(player, 'KICK')} style={{ ...btnStyle, padding: '8px 12px' }}>Kick</Button>
                                        )}
                                    </>
                                ) : (
                                    player.deathDay === day && (
                                        <Button variant="secondary" onClick={() => handleRevive(player)} style={{ ...btnStyle, padding: '8px 12px' }}>Revive</Button>
                                    )
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <WinDeclaration />

            {/* ACTION MODAL */}
            {showActionModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '340px' }}>
                        <h3 style={{ marginBottom: '16px' }}>
                            {actionType === 'KILL' && `Kill ${selectedPlayer?.name}?`}
                            {actionType === 'KICK' && `Kick ${selectedPlayer?.name}?`}
                            {actionType === 'CHECK' && `Check ${selectedPlayer?.name}`}
                            {actionType === 'SAVE' && `Save ${selectedPlayer?.name}`}
                        </h3>

                        {actionType === 'KILL' && aliveMafia.length > 0 && (
                            <>
                                <p style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Who killed?</p>
                                <select value={selectedActor} onChange={e => setSelectedActor(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', background: 'var(--bg-tertiary)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)' }}>
                                    <option value="">Select...</option>
                                    {aliveMafia.map(p => <option key={p.id} value={p.name}>{p.name} ({p.role.name})</option>)}
                                </select>
                            </>
                        )}

                        {actionType === 'CHECK' && aliveDetectives.length > 1 && (
                            <>
                                <p style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Who checked?</p>
                                <select value={selectedActor} onChange={e => setSelectedActor(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', background: 'var(--bg-tertiary)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)' }}>
                                    <option value="">Select...</option>
                                    {aliveDetectives.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </>
                        )}

                        {actionType === 'SAVE' && aliveDoctors.length > 1 && (
                            <>
                                <p style={{ marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Who saved?</p>
                                <select value={selectedActor} onChange={e => setSelectedActor(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '16px', background: 'var(--bg-tertiary)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)' }}>
                                    <option value="">Select...</option>
                                    {aliveDoctors.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button variant="secondary" onClick={() => setShowActionModal(false)} style={btnStyle}>Cancel</Button>
                            <Button variant={actionType === 'KILL' || actionType === 'KICK' ? 'danger' : 'primary'} onClick={confirmAction} style={btnStyle}>Confirm</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTION LOG POPUP */}
            {showLogs && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '400px', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3>Action Log</h3>
                            <Button variant="secondary" onClick={() => setShowLogs(false)} style={{ width: 'auto', padding: '8px 12px' }}>✕</Button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {logs.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No actions yet</p>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} style={{ padding: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.time}</span>
                                        <div>{log.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <RoleInfoPopup role={viewingRole} onClose={() => setViewingRole(null)} />
        </div>
    );
};
