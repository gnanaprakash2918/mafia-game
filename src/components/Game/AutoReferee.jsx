import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { useTimer } from '../../hooks/useTimer';
import { useTTS } from '../../hooks/useTTS';
import { Button } from '../Shared/Button';
import { GAME_PHASES } from '../../constants/roles';

export const AutoReferee = () => {
    const { state, nextPhase } = useGame();
    const { players, settings } = state;
    const { speak, cancel } = useTTS();

    // Local state for Night sub-phases
    const [currentNightRoleIndex, setCurrentNightRoleIndex] = useState(-1);
    const [nightAction, setNightAction] = useState('SLEEP'); // SLEEP, WAKE, ACTION, CLOSE

    // Calculate unique waking sequence
    // 1. Filter players with roles that have wakeOrder > 0
    // 2. Sort by wakeOrder
    // 3. Deduplicate by Role ID (so all Mafias wake once together)
    const wakingPlayers = players.filter(p => p.role.wakeOrder > 0 && p.isAlive);
    const sortedWakingRoles = wakingPlayers
        .map(p => p.role)
        .sort((a, b) => a.wakeOrder - b.wakeOrder);

    // Dedupe logic: Keep first instance of each role ID
    const uniqueWakingSequences = [];
    const seenRoles = new Set();

    sortedWakingRoles.forEach(role => {
        if (!seenRoles.has(role.id)) {
            uniqueWakingSequences.push(role);
            seenRoles.add(role.id);
        }
    });

    // Timers
    const {
        timeLeft,
        start: startTimer,
        reset: resetTimer,
        formattedTime
    } = useTimer(
        state.phase === GAME_PHASES.DISCUSSION ? settings.timers.discussion : 30, // Default 30s for night actions
        settings.timers.unlimited,
        () => handleTimerComplete()
    );

    const handleTimerComplete = () => {
        if (state.phase === GAME_PHASES.DISCUSSION) {
            nextPhase(GAME_PHASES.VOTING);
        } else if (state.phase === GAME_PHASES.NIGHT_ACTIVE) {
            // Optional: Auto-closing logic could go here, but manual next is safer for night
        }
    };

    // Orchestrate Night Phase Start
    useEffect(() => {
        if (state.phase === GAME_PHASES.NIGHT_INTRO) {
            speak("Everyone sleep. Close your eyes.", () => {
                nextPhase(GAME_PHASES.NIGHT_ACTIVE);
                setCurrentNightRoleIndex(0);
                setNightAction('WAKE');
            });
        }
    }, [state.phase]);

    // Orchestrate Night Steps (Wake/Action/Close loop)
    useEffect(() => {
        if (state.phase === GAME_PHASES.NIGHT_ACTIVE && currentNightRoleIndex >= 0) {
            // Check if we are done
            if (currentNightRoleIndex >= uniqueWakingSequences.length) {
                speak("Everyone wake up. It is now morning.", () => {
                    nextPhase(GAME_PHASES.DAY_INTRO);
                });
                return;
            }

            const role = uniqueWakingSequences[currentNightRoleIndex];

            if (nightAction === 'WAKE') {
                speak(`${role.name}, wake up.`, () => {
                    setNightAction('ACTION');
                    resetTimer(20);
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


    // Orchestrate Day Phase
    useEffect(() => {
        if (state.phase === GAME_PHASES.DAY_INTRO) {
            nextPhase(GAME_PHASES.DISCUSSION);
            resetTimer(settings.timers.discussion);
            startTimer();
        }
    }, [state.phase]);


    const handleNextNightStep = () => {
        if (nightAction === 'ACTION') {
            setNightAction('CLOSE');
        }
    };

    if (state.phase === GAME_PHASES.NIGHT_ACTIVE) {
        const currentRole = uniqueWakingSequences[currentNightRoleIndex];
        return (
            <div className="fade-in" style={{ textAlign: 'center', marginTop: '40px' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '24px' }}>Night Phase</h2>
                <div style={{ fontSize: '1.5rem', marginBottom: '40px', color: 'var(--text-muted)' }}>
                    {nightAction === 'ACTION' ? `${currentRole?.name} is acting...` : "Transitioning..."}
                </div>

                <div style={{ fontSize: '5rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '40px' }}>
                    {formattedTime}
                </div>

                <Button onClick={handleNextNightStep} disabled={nightAction !== 'ACTION'}>
                    Next Role
                </Button>
            </div>
        );
    }

    if (state.phase === GAME_PHASES.DISCUSSION) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', marginTop: '40px' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '24px' }}>Discussion</h2>
                <div style={{ fontSize: '6rem', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '40px', color: timeLeft < 10 && !settings.timers.unlimited ? 'var(--danger)' : 'white' }}>
                    {formattedTime}
                </div>
                <Button onClick={() => nextPhase(GAME_PHASES.VOTING)}>Start Voting</Button>
            </div>
        );
    }

    // Voting Phase (Auto-Referee View)
    if (state.phase === GAME_PHASES.VOTING) {
        return (
            <div className="fade-in" style={{ textAlign: 'center', marginTop: '40px' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '24px' }}>Voting Time</h2>
                <div style={{ fontSize: '1.2rem', marginBottom: '40px', color: 'var(--text-muted)' }}>
                    Ask players to vote. Eliminate the loser manually if needed using Referee controls.
                </div>
                <Button onClick={() => nextPhase(GAME_PHASES.NIGHT_INTRO)}>End Day (Start Night)</Button>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Phase: {state.phase}</h2>
            <Button onClick={() => nextPhase(GAME_PHASES.DISCUSSION)}>Force Next</Button>
        </div>
    );
};
