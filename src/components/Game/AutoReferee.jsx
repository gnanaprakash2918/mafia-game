import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useTimer } from '../../hooks/useTimer';
import { useTTS } from '../../hooks/useTTS';
import { Button } from '../Shared/Button';
import { GAME_PHASES } from '../../constants/roles';
import { WinDeclaration } from './WinDeclaration';

export const AutoReferee = () => {
    const { state, nextPhase, killPlayer, checkWinCondition, declareWin } = useGame();
    const { players, settings, round } = state;
    const { speak, cancel } = useTTS();

    // Local state
    const [currentNightRoleIndex, setCurrentNightRoleIndex] = useState(-1);
    const [nightAction, setNightAction] = useState('SLEEP'); // SLEEP, WAKE, ACTION, CLOSE
    const [votingSkipped, setVotingSkipped] = useState(false);

    // Filter and Sort Night Wake Order
    const wakingPlayers = players.filter(p => p.role.wakeOrder > 0 && p.isAlive);
    const sortedWakingRoles = wakingPlayers
        .map(p => p.role)
        .sort((a, b) => a.wakeOrder - b.wakeOrder);

    // Deduplicate roles (e.g. all Mafia wake once)
    const uniqueWakingSequences = [];
    const seenRoles = new Set();
    sortedWakingRoles.forEach(role => {
        if (!seenRoles.has(role.id)) {
            uniqueWakingSequences.push(role);
            seenRoles.add(role.id);
        }
    });

    // --- TIMERS ---
    const getPhaseDuration = () => {
        switch (state.phase) {
            case GAME_PHASES.DAY_INTRO: return settings.timers.day;
            case GAME_PHASES.DISCUSSION: return settings.timers.discussion;
            case GAME_PHASES.VOTING: return settings.timers.voting;
            case GAME_PHASES.NIGHT_ACTIVE: return settings.timers.night;
            default: return 30;
        }
    };

    const { timeLeft, start: startTimer, reset: resetTimer, formattedTime, pause: pauseTimer } = useTimer(
        getPhaseDuration(),
        settings.timers.unlimited,
        () => handleTimerComplete()
    );

    const handleTimerComplete = () => {
        if (state.phase === GAME_PHASES.DAY_INTRO) {
            nextPhase(GAME_PHASES.DISCUSSION); // Auto moves to discussion
        } else if (state.phase === GAME_PHASES.DISCUSSION) {
            nextPhase(GAME_PHASES.VOTING);
        }
    };

    // Update timer when phase changes
    useEffect(() => {
        resetTimer(getPhaseDuration());
        if (state.phase !== GAME_PHASES.NIGHT_INTRO && state.phase !== GAME_PHASES.SETUP) {
            startTimer();
        }
    }, [state.phase]);


    // --- NIGHT LOGIC ---
    useEffect(() => {
        if (state.phase === GAME_PHASES.NIGHT_INTRO) {
            // Wait for manual start if configured, else auto-start
            if (settings.timers.autoStartNight) {
                beginNight();
            }
        }
    }, [state.phase]);

    const beginNight = () => {
        speak("Everyone sleep. Close your eyes.", () => {
            nextPhase(GAME_PHASES.NIGHT_ACTIVE);
            setCurrentNightRoleIndex(0);
            setNightAction('WAKE');
        });
    };

    useEffect(() => {
        if (state.phase === GAME_PHASES.NIGHT_ACTIVE && currentNightRoleIndex >= 0) {
            if (currentNightRoleIndex >= uniqueWakingSequences.length) {
                // Night Over
                speak("Everyone wake up. It is now morning.", () => {
                    nextPhase(GAME_PHASES.DAY_INTRO);
                });
                return;
            }

            const role = uniqueWakingSequences[currentNightRoleIndex];

            if (nightAction === 'WAKE') {
                speak(`${role.name}, wake up.`, () => {
                    setNightAction('ACTION');
                    resetTimer(settings.timers.night);
                    startTimer();
                });
            } else if (nightAction === 'CLOSE') {
                speak(`${role.name}, close your eyes.`, () => {
                    setCurrentNightRoleIndex(prev => prev + 1);
                    setNightAction('WAKE');
                });
            }
        }
    }, [currentNightRoleIndex, nightAction, state.phase]);

    const handleNextNightStep = () => {
        if (nightAction === 'ACTION') setNightAction('CLOSE');
    };


    // --- VOTING LOGIC ---
    const handleKick = (player) => {
        killPlayer(player.id);
        const winResult = checkWinCondition([{ ...player, isAlive: false }, ...players.filter(p => p.id !== player.id)]);

        if (winResult) {
            declareWin(winResult.team, winResult.message);
        } else {
            // Go to Night after a kick
            nextPhase(GAME_PHASES.NIGHT_INTRO);
        }
    };

    const handleSkipVote = () => {
        setVotingSkipped(true);
        nextPhase(GAME_PHASES.NIGHT_INTRO);
    };


    // --- RENDERERS ---

    // 1. NIGHT INTRO (Manual Start Check)
    if (state.phase === GAME_PHASES.NIGHT_INTRO) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', marginTop: '40px' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '24px' }}>Night Approaching</h2>
                <p style={{ marginBottom: '32px', color: 'var(--text-muted)' }}>Get ready to sleep.</p>
                {!settings.timers.autoStartNight && (
                    <Button onClick={beginNight}>Start Night Sequence</Button>
                )}
            </div>
        );
    }

    // 2. NIGHT ACTIVE
    if (state.phase === GAME_PHASES.NIGHT_ACTIVE) {
        const currentRole = uniqueWakingSequences[currentNightRoleIndex];
        return (
            <div className="fade-in" style={{ textAlign: 'center', marginTop: '40px', background: '#050510', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '24px', color: '#818cf8' }}>Night Phase</h2>
                <div style={{ fontSize: '1.5rem', marginBottom: '40px', color: 'var(--text-muted)' }}>
                    {nightAction === 'ACTION' ? `${currentRole?.name} is acting...` : "Transitioning..."}
                </div>
                <div style={{ fontSize: '5rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '40px', color: '#818cf8' }}>
                    {formattedTime}
                </div>
                <Button onClick={handleNextNightStep} disabled={nightAction !== 'ACTION'}>
                    Next Role
                </Button>
            </div>
        );
    }

    // 3. DAY INTRO / DISCUSSION
    if (state.phase === GAME_PHASES.DAY_INTRO || state.phase === GAME_PHASES.DISCUSSION) {
        const isIntro = state.phase === GAME_PHASES.DAY_INTRO;
        return (
            <div className="fade-in" style={{ textAlign: 'center', marginTop: '40px' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '24px', color: 'var(--warning)' }}>Day {isIntro ? 'Intro' : 'Discussion'}</h2>
                <div style={{ fontSize: '6rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '40px', color: timeLeft < 10 && !settings.timers.unlimited ? 'var(--danger)' : 'white' }}>
                    {formattedTime}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {isIntro ? (
                        <Button onClick={() => nextPhase(GAME_PHASES.DISCUSSION)}>Start Discussion</Button>
                    ) : (
                        <Button onClick={() => nextPhase(GAME_PHASES.VOTING)}>Start Voting</Button>
                    )}
                </div>
                <h3 style={{ marginTop: '32px', color: 'var(--text-muted)' }}>Alive Players: {players.filter(p => p.isAlive).length}</h3>
            </div>
        );
    }

    // 4. VOTING
    if (state.phase === GAME_PHASES.VOTING) {
        return (
            <div className="fade-in" style={{ paddingBottom: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '3rem', color: 'var(--danger)' }}>Voting Time</h2>
                    <div style={{ fontSize: '4rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '16px' }}>
                        {formattedTime}
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr', marginBottom: '32px' }}>
                    {players.filter(p => p.isAlive).map(player => (
                        <div key={player.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid var(--text-muted)'
                        }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{player.name}</span>
                            <Button
                                variant="danger"
                                style={{ width: 'auto', padding: '8px 16px' }}
                                onClick={() => {
                                    if (confirm(`Are you sure you want to eliminate ${player.name}?`)) handleKick(player);
                                }}
                            >
                                Kick / Eliminate
                            </Button>
                        </div>
                    ))}
                </div>

                <div style={{ padding: '0 24px' }}>
                    <Button variant="secondary" onClick={handleSkipVote}>Skip Voting (No One Dies)</Button>
                </div>
            </div>
        );
    }

    return <div>Loading Phase... {state.phase}</div>;
};
