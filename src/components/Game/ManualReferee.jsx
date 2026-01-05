import React from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../Shared/Button';
import { GAME_PHASES } from '../../constants/roles';

export const ManualReferee = () => {
    const { state, dispatch, nextPhase, killPlayer } = useGame();
    const { players, phase } = state;

    const toggleLife = (player) => {
        dispatch({
            type: 'UPDATE_PLAYER_STATUS',
            payload: {
                id: player.id,
                updates: { isAlive: !player.isAlive }
            },
        });
    };

    return (
        <div className="fade-in" style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '2rem' }}>Referee Dashboard</h2>
                <Button variant="secondary" onClick={() => nextPhase(GAME_PHASES.SETUP)} style={{ width: 'auto' }}>
                    End Game
                </Button>
            </div>

            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Game Control</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Button
                        variant="secondary"
                        onClick={() => nextPhase(GAME_PHASES.NIGHT_INTRO)}
                        disabled={phase === GAME_PHASES.NIGHT_INTRO || phase === GAME_PHASES.NIGHT_ACTIVE}
                    >Start Night</Button>
                    <Button
                        variant="secondary"
                        onClick={() => nextPhase(GAME_PHASES.DAY_INTRO)}
                        disabled={phase === GAME_PHASES.DAY_INTRO || phase === GAME_PHASES.DISCUSSION}
                    >Start Day</Button>
                    <Button
                        variant="secondary"
                        onClick={() => nextPhase(GAME_PHASES.VOTING)}
                        disabled={phase === GAME_PHASES.VOTING}
                    >Start Voting</Button>
                </div>
                <div style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 'bold' }}>
                    Current Phase: {phase}
                </div>
            </div>

            <h3 style={{ marginBottom: '16px' }}>Player Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {players.map(player => (
                    <div key={player.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        background: player.isAlive ? 'var(--bg-tertiary)' : 'rgba(239, 68, 68, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${player.role.team === 'MAFIA' ? 'var(--danger)' : 'var(--success)'}`
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: player.isAlive ? 'none' : 'line-through' }}>
                                {player.name}
                            </div>
                            <div style={{ color: player.isAlive ? 'var(--text-muted)' : 'var(--danger)' }}>
                                {player.role.name} ({player.role.team})
                            </div>
                        </div>

                        <Button
                            variant={player.isAlive ? "danger" : "secondary"}
                            onClick={() => toggleLife(player)}
                            style={{ width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}
                        >
                            {player.isAlive ? "Kill" : "Revive"}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};
