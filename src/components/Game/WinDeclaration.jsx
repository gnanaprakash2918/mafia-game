import React from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { TEAMS, GAME_PHASES } from '../../constants/roles';

export const WinDeclaration = () => {
    const { nextPhase } = useGame();

    const declareWin = (team) => {
        // ideally update status to GAME_OVER or just reset
        alert(`${team} Wins!`); // Placeholder for now or a modal
        nextPhase(GAME_PHASES.WELCOME);
    };

    return (
        <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginTop: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Declare Winner</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="danger" onClick={() => declareWin('MAFIA')} style={{ padding: '8px' }}>Mafia Wins</Button>
                <Button variant="primary" onClick={() => declareWin('VILLAGE')} style={{ padding: '8px', background: 'var(--success)' }}>Village Wins</Button>
            </div>
        </div>
    );
};
