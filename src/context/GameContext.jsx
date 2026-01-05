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
            discussion: 180, // seconds
            voting: 60,
            unlimited: false,
        },
    },
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

    const killPlayer = useCallback((playerId) => {
        dispatch({
            type: 'UPDATE_PLAYER_STATUS',
            payload: { id: playerId, updates: { isAlive: false } },
        });
    }, []);

    const value = {
        state,
        updateSettings,
        setPlayers,
        startGame,
        nextPhase,
        killPlayer,
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
