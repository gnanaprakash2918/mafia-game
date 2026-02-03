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
        <div className="grid-reveal-container">
            <h2 className="grid-reveal-title">Pick a Card</h2>
            <p className="grid-reveal-subtitle">
                Next player, pick a card!
            </p>

            {/* THE GRID */}
            <div className="card-grid">
                {players.map((_, i) => {
                    const isTaken = !availableCards.includes(i);
                    const isRevealed = revealedCard?.index === i;

                    // Determine class strings
                    let cardClass = "role-card";
                    if (isRevealed) cardClass += " revealed";
                    else if (isTaken) cardClass += " taken";
                    else cardClass += " available";

                    return (
                        <button
                            key={i}
                            className={cardClass}
                            onClick={() => !isTaken && handleCardClick(i)}
                            disabled={isTaken}
                            aria-label={isTaken ? "Card taken" : "Pick card"}
                            aria-pressed={isRevealed}
                            style={{
                                // Only dynamic style needed is the revealed role color
                                background: isRevealed && revealedCard.role.color
                                    ? revealedCard.role.color
                                    : undefined
                            }}
                        >
                            {/* Content could go here if we wanted numbers or icons */}
                        </button>
                    );
                })}
            </div>

            {/* REVEAL MODAL OVERLAY */}
            {revealedCard && (
                <div className="reveal-modal-overlay">
                    <h2 className="reveal-modal-title">You are the...</h2>
                    <h1
                        className="reveal-role-name"
                        style={{ color: revealedCard.role.color || 'white' }}
                    >
                        {revealedCard.role.name}
                    </h1>

                    <p className="reveal-role-desc">
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
