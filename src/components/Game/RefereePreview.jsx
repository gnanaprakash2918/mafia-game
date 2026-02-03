import React from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { GAME_PHASES } from '../../constants/roles';

export const RefereePreview = () => {
    const { state, setPlayers, nextPhase } = useGame();
    const { players } = state;

    const [selectedPlayer, setSelectedPlayer] = React.useState(null); // Player being edited

    const shuffleRoles = () => {
        const newPlayers = [...players];
        // Only shuffle roles, keep names in place
        for (let i = newPlayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tempRole = newPlayers[i].role;
            newPlayers[i].role = newPlayers[j].role;
            newPlayers[j].role = tempRole;
        }
        setPlayers(newPlayers);
    };

    // "Smart Swap": Assign desired role to selected player by swapping with current holder
    const handleRoleSelect = (targetRoleName) => {
        if (!selectedPlayer) return;

        // 1. Find the target role object (we need its full definition/color etc)
        // We look for ANY player who currently has this role
        const targetHolderIndex = players.findIndex(p => p.role.name === targetRoleName);

        if (targetHolderIndex === -1) return; // Should not happen if UI is correct

        const currentPlayerIndex = players.findIndex(p => p.id === selectedPlayer.id);

        if (currentPlayerIndex === -1) return;

        // If trying to swap with self (same role), do nothing
        if (players[currentPlayerIndex].role.name === targetRoleName) {
            setSelectedPlayer(null);
            return;
        }

        // 2. Perform Swap
        const newPlayers = [...players];
        const roleA = newPlayers[currentPlayerIndex].role;
        const roleB = newPlayers[targetHolderIndex].role;

        newPlayers[currentPlayerIndex] = { ...newPlayers[currentPlayerIndex], role: roleB };
        newPlayers[targetHolderIndex] = { ...newPlayers[targetHolderIndex], role: roleA };

        setPlayers(newPlayers);
        setSelectedPlayer(null);
    };

    // Get unique role types currently in the game for the modal list
    const availableRoleTypes = React.useMemo(() => {
        const unique = new Set(players.map(p => p.role.name));
        return Array.from(unique).sort();
    }, [players]);

    return (
        <div className="fade-in" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Referee Preview</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {state.settings.gridMode
                    ? 'Verify the deck. Players will pick cards to get roles.'
                    : 'Verify roles before passing to players.'}
            </p>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '24px' }}>
                Tap a player to change their role
            </p>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
                {players.map((p, i) => (
                    <div key={p.id}
                        onClick={() => setSelectedPlayer(p)}
                        style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px', marginBottom: '8px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: `4px solid ${p.role.color || 'var(--text-muted)'}`,
                            cursor: 'pointer'
                        }}>
                        <span style={{ fontWeight: 'bold' }}>{p.name}</span>
                        <span style={{ color: p.role.color || 'var(--text-muted)' }}>{p.role.name}</span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <Button variant="secondary" onClick={shuffleRoles}>Reshuffle Roles</Button>
                <Button onClick={() => nextPhase(GAME_PHASES.ROLE_REVEAL)}>Start Game</Button>
            </div>

            {/* ROLE SELECTION MODAL */}
            {selectedPlayer && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        background: 'var(--bg-secondary)', padding: '24px',
                        borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '340px',
                        maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'
                    }}>
                        <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>
                            Assign Role to {selectedPlayer.name}
                        </h3>
                        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {availableRoleTypes.map(roleName => {
                                const roleColor = players.find(p => p.role.name === roleName)?.role.color;
                                return (
                                    <button key={roleName} onClick={() => handleRoleSelect(roleName)}
                                        style={{
                                            padding: '12px',
                                            background: 'var(--bg-tertiary)',
                                            border: selectedPlayer.role.name === roleName ? `1px solid ${roleColor}` : '1px solid transparent',
                                            borderRadius: 'var(--radius-sm)',
                                            color: roleColor || 'white',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex', justifyContent: 'space-between'
                                        }}>
                                        {roleName}
                                        {selectedPlayer.role.name === roleName && <span>✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                        <Button variant="secondary" onClick={() => setSelectedPlayer(null)} style={{ marginTop: '16px' }}>Cancel</Button>
                    </div>
                </div>
            )}
        </div>
    );
};
