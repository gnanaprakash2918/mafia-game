import React, { useEffect } from 'react';
import { useGame, GameProvider } from './context/GameContext';
import { SetupScreen } from './components/Setup/SetupScreen';
import { RoleReveal } from './components/Game/RoleReveal';
import { RefereeConfirmation } from './components/Game/RefereeConfirmation';
import { AutoReferee } from './components/Game/AutoReferee';
import { RefereePreview } from './components/Game/RefereePreview';
import { GridReveal } from './components/Game/GridReveal';
import { WelcomeScreen } from './components/Setup/WelcomeScreen';
import { WinDeclaration } from './components/Game/WinDeclaration';
import { GAME_PHASES } from './constants/roles';

const GameContent = () => {
    const { state } = useGame();

    // 2. Warn on Refresh/Exit
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Only warn if game is in progress (not Welcome or Setup)
            if (state.phase !== GAME_PHASES.WELCOME && state.phase !== GAME_PHASES.SETUP) {
                e.preventDefault();
                e.returnValue = ''; // Standard browser requirement
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [state.phase]);

    const renderPhase = () => {
        switch (state.phase) {
            case GAME_PHASES.WELCOME:
                return <WelcomeScreen />;
            case GAME_PHASES.SETUP:
                return <SetupScreen />;
            case GAME_PHASES.REFEREE_PREVIEW:
                return <RefereePreview />;
            case GAME_PHASES.ROLE_REVEAL:
                if (state.settings.gridMode) {
                    return <GridReveal />;
                }
                return <RoleReveal />;
            case GAME_PHASES.REFEREE_CONFIRMATION:
                return <RefereeConfirmation />;
            case GAME_PHASES.GAME_OVER:
                return <WinDeclaration />;
            case GAME_PHASES.NIGHT_INTRO:
            case GAME_PHASES.NIGHT_ACTIVE:
            case GAME_PHASES.DAY_INTRO:
            case GAME_PHASES.DISCUSSION:
            case GAME_PHASES.VOTING:
                return <AutoReferee />;
            default:
                return <AutoReferee />;
        }
    };

    return (
        <div className="app-container">
            {renderPhase()}
        </div>
    );
};

function App() {
    return (
        <GameProvider>
            <GameContent />
        </GameProvider>
    );
}

export default App;
