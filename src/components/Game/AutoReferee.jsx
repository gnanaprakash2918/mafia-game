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

    // Local state for Night sub-phases (which role is waking up)
    const [currentNightRoleIndex, setCurrentNightRoleIndex] = useState(-1);
    const [nightAction, setNightAction] = useState('SLEEP'); // SLEEP, WAKE, ACTION, CLOSE

    // Get unique waking roles sorted by wakeOrder
    const wakingRoles = [...new Set(
        players
            .filter(p => p.role.wakeOrder > 0)
            .map(p => p.role)
            .sort((a, b) => a.wakeOrder - b.wakeOrder)
    )];

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
        // Determine what happens when timer ends
        if (state.phase === GAME_PHASES.DISCUSSION) {
            nextPhase(GAME_PHASES.VOTING);
        } else if (state.phase === GAME_PHASES.NIGHT_ACTIVE) {
            // Auto-advance night if timer runs out (optional, maybe just warn)
            handleNextNightStep();
        }
    };

    // Orchestrate Night Phase
    useEffect(() => {
        if (state.phase === GAME_PHASES.NIGHT_INTRO) {
            speak("Everyone sleep. Close your eyes.", () => {
                nextPhase(GAME_PHASES.NIGHT_ACTIVE);
                setCurrentNightRoleIndex(0);
                setNightAction('WAKE');
            });
        }
    }, [state.phase]);

    // Orchestrate Night Steps
    useEffect(() => {
        if (state.phase === GAME_PHASES.NIGHT_ACTIVE && currentNightRoleIndex >= 0) {
            if (currentNightRoleIndex >= wakingRoles.length) {
                // Night over
                speak("Everyone wake up. It is now morning.", () => {
                    nextPhase(GAME_PHASES.DAY_INTRO);
                });
                return;
            }

            const role = wakingRoles[currentNightRoleIndex];

            if (nightAction === 'WAKE') {
                speak(`${role.name}, wake up.`, () => {
                    setNightAction('ACTION');
                    resetTimer(20); // Give 20s for action
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
            // Transition immediately to discussion after intro
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
        const currentRole = wakingRoles[currentNightRoleIndex];
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

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Phase: {state.phase}</h2>
            <Button onClick={() => nextPhase(GAME_PHASES.DISCUSSION)}>Force Next</Button>
        </div>
    );
};
