import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { GAME_PHASES } from '../../constants/roles';

export const GridReveal = () => {
    const { state, nextPhase, setPlayers } = useGame();
    const { players, settings } = state;
    const [revealedCard, setRevealedCard] = useState(null); // { index, role }
    const [assignments, setAssignments] = useState({}); // { [playerIndex]: role }
    const [availableCards, setAvailableCards] = useState(() => {
        // Initial available cards are just indices of the shuffled players array (which contains the shuffled roles)
        return players.map((_, i) => i);
    });

    // Determine current player index based on how many have picked
    const currentTurn = Object.keys(assignments).length;
    const currentPlayer = players[currentTurn];

    const handleCardClick = (cardIndex) => {
        if (revealedCard) return; // Wait for confirmation
        if (!availableCards.includes(cardIndex)) return; // Already taken

        const selectedRole = players[cardIndex].role;

        setRevealedCard({ index: cardIndex, role: selectedRole });
    };

    const handleConfirm = () => {
        const newAssignments = { ...assignments, [currentTurn]: revealedCard.role };
        setAssignments(newAssignments);

        // Remove card from available
        setAvailableCards(availableCards.filter(c => c !== revealedCard.index));
        setRevealedCard(null);

        // Check if done
        if (Object.keys(newAssignments).length === players.length) {
            finishReveal(newAssignments);
        }
    };

    const finishReveal = (finalAssignments) => {
        const newPlayers = players.map((p, i) => ({
            ...p,
            role: finalAssignments[i]
        }));

        setPlayers(newPlayers);
        nextPhase(GAME_PHASES.NIGHT_INTRO);
    };

    if (!currentPlayer) return null; // Should not happen if logic is correct

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px' }}>
            <h2 style={{ marginBottom: '8px' }}>Pick a Card</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Next player, pick a card!
            </p>

            {/* THE GRID */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                gap: '12px',
                width: '100%',
                maxWidth: '600px',
                flex: 1,
                alignContent: 'center'
            }}>
                {players.map((_, i) => {
                    const isTaken = !availableCards.includes(i);
                    const isRevealed = revealedCard?.index === i;

                    return (
                        <div key={i}
                            onClick={() => !isTaken && handleCardClick(i)}
                            style={{
                                aspectRatio: '2/3',
                                background: isRevealed
                                    ? (revealedCard.role.color || 'var(--bg-secondary)')
                                    : (isTaken ? 'transparent' : 'linear-gradient(135deg, var(--primary), var(--bg-tertiary))'),
                                border: isTaken ? '2px dashed var(--bg-tertiary)' : '2px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                cursor: isTaken ? 'default' : 'pointer',
                                opacity: isTaken ? 0.3 : 1,
                                transform: isRevealed ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                boxShadow: isRevealed ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
                            }}
                        >
                            {isRevealed ? '' : (isTaken ? '' : '')}
                        </div>
                    );
                })}
            </div>

            {/* REVEAL MODAL OVERLAY */}
            {revealedCard && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.95)', zIndex: 100,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '24px',
                    animation: 'fadeIn 0.2s'
                }}>
                    <h2 style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>You are the...</h2>
                    <h1 style={{
                        fontSize: '3.5rem',
                        color: revealedCard.role.color || 'white',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        {revealedCard.role.name}
                    </h1>

                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '400px', textAlign: 'center', marginBottom: '48px' }}>
                        {revealedCard.role.description}
                    </p>

                    <Button onClick={handleConfirm} style={{ maxWidth: '300px' }}>
                        I Understand
                    </Button>
                </div>
            )}
        </div>
    );
};
