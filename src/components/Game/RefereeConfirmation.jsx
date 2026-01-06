import React from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { GAME_PHASES } from '../../constants/roles';

export const RefereeConfirmation = () => {
    const { nextPhase } = useGame();

    const handleConfirm = () => {
        nextPhase(GAME_PHASES.NIGHT_INTRO);
    };

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px'
        }}>
            <div className="fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Role Reveal Complete</h2>
                <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '32px', fontWeight: '800' }}>
                    Pass to Referee
                </h1>
                <p style={{ marginBottom: '40px', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
                    Please pass the device back to the game referee. do not proceed until the device is in their hands.
                </p>

                <div style={{
                    padding: '24px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>👮</span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Referee Section Ahead
                    </p>
                </div>

                <Button onClick={handleConfirm} style={{ width: '100%' }}>
                    I am the Referee
                </Button>
            </div>
        </div>
    );
};
