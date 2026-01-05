import React from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { GAME_PHASES } from '../../constants/roles';

export const WinDeclaration = () => {
    const { state, dispatch, nextPhase } = useGame();
    const { winner, players, settings } = state;

    if (!winner && state.phase !== GAME_PHASES.GAME_OVER) return null;

    const handleRestartFresh = () => {
        dispatch({ type: 'RESET_GAME' });
    };

    const handleRestartSame = () => {
        // Create new players but same names/roles (shuffled)
        const playerList = [];
        let rolePool = players.map(p => p.role.id);
        rolePool = rolePool.sort(() => Math.random() - 0.5);

        // Map original names to new roles
        // We need original names list. We can extract it from current players.
        players.forEach((p, index) => {
            // Re-fetch role definition to reset state
            // NOTE: This assumes role definitions didn't change (Custom roles persist in memory for session)
            // Ideally we'd look up from ROLES or keep the object.
            // Using p.role is risky if we mutated it.
            // Safer: Use settings.roles count and re-generate pool if needed.
            // Simpler: Just shuffle the role definitions we strictly have? 
            // Let's re-generate from settings for purity.
        });

        // Actually, easiest is to go to SETUP phase but pre-fill data.
        // But user wants "Quick Restart".
        // Let's implement fully automatic restart logic.

        // 1. Re-pool from Settings
        let pool = [];
        Object.entries(settings.roles).forEach(([rid, count]) => {
            for (let i = 0; i < count; i++) pool.push(rid);
        });
        pool.sort(() => Math.random() - 0.5);

        // 2. Map Names (reuse names from current players, sorted by ID or index implicitly)
        // We don't have original index. Let's just use current order.
        let newPlayers = players.map((p, i) => {
            // Find role def
            // We need to import ROLES, but we can't easily here without import.
            // We can just trust the ID is valid in the Context's logic if we moved this to Context.
            // BUT: We are in a component.
            // Let's dispatch a specialized RESTART_GAME action?
            return {};
        });

        // Dispatching a specialized restart is cleaner.
        dispatch({ type: 'RESTART_SAME_SETTINGS' });
    };

    return (
        <div className="fade-in" style={{
            background: 'var(--bg-secondary)',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            marginBottom: '24px',
            border: `2px solid ${winner?.team === 'MAFIA' ? 'var(--danger)' : 'var(--success)'}`
        }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
                {winner ? winner.message : 'Game Over'}
            </h2>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <Button onClick={handleRestartFresh}>New Setup</Button>
                <Button variant="secondary" onClick={handleRestartSame}>Play Again (Same Settings)</Button>
            </div>
        </div>
    );
};
