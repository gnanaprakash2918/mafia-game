import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { GAME_PHASES } from '../constants/roles';

const GameContext = createContext();

const initialState = {
    phase: GAME_PHASES.WELCOME,
    players: [], // { id, name, role, isAlive, status }
    settings: {
        playerCount: 5,
        roles: {}, // { [roleId]: count }
        timers: {
            night: 30,
            day: 10, // Day Intro/Overview
            discussion: 180,
            voting: 60,
            unlimited: false,
            autoStartNight: false, // User requested toggle
        },
    },
    winner: null, // { team: 'MAFIA'|'VILLAGE'|'NEUTRAL', message: '...' }
    currentTurnIndex: 0, // For role reveal or active night turn
    round: 1,
};

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_SETTINGS':
            return {
                ...state,
                settings: { ...state.settings, ...action.payload },
            };
        case 'SET_PLAYERS':
            return {
                ...state,
                players: action.payload,
            };
        case 'START_GAME':
            return {
                ...state,
                phase: GAME_PHASES.ROLE_REVEAL,
                currentTurnIndex: 0,
            };
        case 'NEXT_PHASE':
            return {
                ...state,
                phase: action.payload,
            };
        case 'UPDATE_PLAYER_STATUS':
            return {
                ...state,
                players: state.players.map((p) =>
                    p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
                ),
            };
        case 'INCREMENT_TURN':
            return {
                ...state,
                currentTurnIndex: state.currentTurnIndex + 1,
            };
        case 'DECLARE_WIN':
            return { ...state, winner: action.payload, phase: GAME_PHASES.GAME_OVER };
        case 'RESET_GAME':
            return initialState;
        default:
            return state;
    }
};

export const GameProvider = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const updateSettings = useCallback((settings) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    }, []);

    const setPlayers = useCallback((players) => {
        dispatch({ type: 'SET_PLAYERS', payload: players });
    }, []);

    const startGame = useCallback(() => {
        dispatch({ type: 'START_GAME' });
    }, []);

    const nextPhase = useCallback((phase) => {
        dispatch({ type: 'NEXT_PHASE', payload: phase });
    }, []);

    // Helper to check for win conditions
    const checkWinCondition = useCallback((currentPlayers) => {
        const activePlayers = currentPlayers.filter(p => p.isAlive);
        const mafiaCount = activePlayers.filter(p => p.role.team === 'MAFIA').length;
        const villageCount = activePlayers.filter(p => p.role.team === 'VILLAGE').length;
        const totalAlive = activePlayers.length;

        // Village Wins: No Mafia left
        if (mafiaCount === 0) {
            return { team: 'VILLAGE', message: 'All Mafia have been eliminated. Village Wins!' };
        }

        // Mafia Wins: Mafia Majority (>= 50% of living players usually, or simple majority)
        // Strictly > 50% for immediate win, or >= 50% depending on rules.
        // Usually if Mafia >= Non-Mafia, Mafia wins (as they can control vote).
        if (mafiaCount >= (totalAlive - mafiaCount)) {
            return { team: 'MAFIA', message: 'Mafia have gained majority control. Mafia Wins!' };
        }

        return null;
    }, []);

    const killPlayer = useCallback((playerId) => {
        // We need to access state to check win, but usually state is stale in callback.
        // Dispatch handles update. We can check win in Effect in App or here if we access latest state.
        // For simplicity: Update state, then App.jsx or AutoReferee checks win.
        dispatch({
            type: 'UPDATE_PLAYER_STATUS',
            payload: { id: playerId, updates: { isAlive: false } },
        });
    }, []);

    const declareWin = useCallback((team, message) => {
        dispatch({ type: 'DECLARE_WIN', payload: { team, message } });
    }, []);

    const value = {
        state,
        updateSettings,
        setPlayers,
        startGame,
        nextPhase,
        killPlayer,
        declareWin,
        checkWinCondition, // Exported for components to use
        dispatch,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
