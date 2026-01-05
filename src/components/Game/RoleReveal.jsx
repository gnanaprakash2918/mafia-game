import React, { useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { GAME_PHASES } from '../../constants/roles';

export const RoleReveal = () => {
    const { state, dispatch, nextPhase } = useGame();
    const { players, currentTurnIndex } = state;
    const [isRevealed, setIsRevealed] = useState(false);
    const [slideProgress, setSlideProgress] = useState(0);
    const sliderRef = useRef(null);

    const currentPlayer = players[currentTurnIndex];

    // Find partners if current player is Mafia
    const partners = currentPlayer?.role?.team === 'MAFIA'
        ? players.filter(p => p.id !== currentPlayer.id && p.role.team === 'MAFIA')
        : [];

    const handleSliderChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setSlideProgress(value);
        if (value >= 95) {
            setIsRevealed(true);
        }
    };

    const handleNext = () => {
        setIsRevealed(false);
        setSlideProgress(0);
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
            textAlign: 'center',
            padding: '24px'
        }}>
            <div className="fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                {!isRevealed ? (
                    <>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Pass the phone to</h2>
                        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '32px', fontWeight: '800' }}>
                            {currentPlayer.name}
                        </h1>
                        <p style={{ marginBottom: '40px', color: 'var(--text-muted)', fontSize: '1rem' }}>
                            Make sure no one else is looking!
                        </p>

                        {/* SWIPE TO REVEAL SLIDER */}
                        <div style={{
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '8px',
                            position: 'relative',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'rgba(255,255,255,0.3)',
                                fontWeight: 'bold',
                                pointerEvents: 'none',
                                fontSize: '0.9rem'
                            }}>
                                → Slide to Reveal →
                            </div>
                            <input
                                ref={sliderRef}
                                type="range"
                                min="0"
                                max="100"
                                value={slideProgress}
                                onChange={handleSliderChange}
                                onMouseUp={() => slideProgress < 95 && setSlideProgress(0)}
                                onTouchEnd={() => slideProgress < 95 && setSlideProgress(0)}
                                style={{
                                    width: '100%',
                                    height: '50px',
                                    appearance: 'none',
                                    background: `linear-gradient(to right, var(--primary) ${slideProgress}%, transparent ${slideProgress}%)`,
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <div className="card-flip-enter" style={{
                        background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary))',
                        padding: '32px 24px',
                        borderRadius: 'var(--radius-lg)',
                        border: `2px solid ${currentPlayer.role.color || 'var(--primary)'}`,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>You are the</h2>
                        <h1 style={{
                            fontSize: '3rem',
                            color: currentPlayer.role.color || (currentPlayer.role.team === 'MAFIA' ? 'var(--danger)' : 'var(--success)'),
                            marginBottom: '16px',
                            textShadow: '0 0 30px rgba(0,0,0,0.5)'
                        }}>
                            {currentPlayer.role.name}
                        </h1>
                        <p style={{ fontSize: '1.1rem', marginBottom: '24px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                            {currentPlayer.role.description}
                        </p>

                        {partners.length > 0 && (
                            <div style={{
                                marginBottom: '32px',
                                padding: '16px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--danger)'
                            }}>
                                <h3 style={{ color: 'var(--danger)', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Partners</h3>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                                    {partners.map(p => p.name).join(', ')}
                                </div>
                            </div>
                        )}

                        <Button onClick={handleNext} style={{ marginTop: '16px' }}>
                            {currentTurnIndex < players.length - 1 ? 'Pass to Next Player' : 'Start Night'}
                        </Button>
                    </div>
                )}

                <div style={{ marginTop: '32px', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                    Player {currentTurnIndex + 1} of {players.length}
                </div>
            </div>
        </div>
    );
};
