import React from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { GAME_PHASES } from '../../constants/roles';

export const WelcomeScreen = () => {
    const { nextPhase } = useGame();

    return (
        <div className="fade-in" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1 style={{
                fontSize: '4rem',
                fontWeight: '800',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.3))'
            }}>
                MAFIA
            </h1>
            <p style={{
                fontSize: '1.2rem',
                color: 'var(--text-muted)',
                maxWidth: '300px',
                marginBottom: '48px',
                lineHeight: '1.6'
            }}>
                By gnanaprakash2918
            </p>

            <Button onClick={() => nextPhase(GAME_PHASES.SETUP)} style={{ maxWidth: '300px' }}>
                Start New Game
            </Button>
        </div>
    );
};
