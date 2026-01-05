import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { GAME_PHASES } from '../../constants/roles';

export const RoleReveal = () => {
    const { state, dispatch, nextPhase } = useGame();
    const { players, currentTurnIndex } = state;
    const [isRevealed, setIsRevealed] = useState(false);

    const currentPlayer = players[currentTurnIndex];

    const handleReveal = () => {
        setIsRevealed(true);
    };

    const handleNext = () => {
        setIsRevealed(false);
        if (currentTurnIndex < players.length - 1) {
            dispatch({ type: 'INCREMENT_TURN' });
        } else {
            nextPhase(GAME_PHASES.NIGHT_INTRO);
        }
    };

    if (!currentPlayer) return null;

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <div className="fade-in" style={{ width: '100%' }}>
                {!isRevealed ? (
                    <>
                        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Pass the phone to</h2>
                        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '48px', fontWeight: '800' }}>
                            {currentPlayer.name}
                        </h1>
                        <p style={{ marginBottom: '32px', color: 'var(--text-muted)' }}>
                            Make sure no one else is looking!
                        </p>
                        <Button onClick={handleReveal}>Reveal Role</Button>
                    </>
                ) : (
                    <div className="card-flip-animation">
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--text-muted)' }}>You are</h2>
                        <h1 style={{
                            fontSize: '3.5rem',
                            color: currentPlayer.role.team === 'MAFIA' ? 'var(--danger)' : 'var(--success)',
                            marginBottom: '16px',
                            textShadow: '0 0 20px rgba(0,0,0,0.5)'
                        }}>
                            {currentPlayer.role.name}
                        </h1>
                        <p style={{ fontSize: '1.2rem', marginBottom: '48px', lineHeight: '1.6' }}>
                            {currentPlayer.role.description}
                        </p>
                        <Button onClick={handleNext}>
                            {currentTurnIndex < players.length - 1 ? 'Pass to Next Player' : 'Start Night'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
