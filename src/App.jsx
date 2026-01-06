import React from 'react';
import { useGame } from './context/GameContext';
import { SetupScreen } from './components/Setup/SetupScreen';
import { RoleReveal } from './components/Game/RoleReveal';
import { RefereeConfirmation } from './components/Game/RefereeConfirmation';
import { AutoReferee } from './components/Game/AutoReferee';
import { WelcomeScreen } from './components/Setup/WelcomeScreen';
import { WinDeclaration } from './components/Game/WinDeclaration';
import { GAME_PHASES } from './constants/roles';

function App() {
    const { state } = useGame();

    const renderPhase = () => {
        switch (state.phase) {
            case GAME_PHASES.WELCOME:
                return <WelcomeScreen />;
            case GAME_PHASES.SETUP:
                return <SetupScreen />;
            case GAME_PHASES.ROLE_REVEAL:
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
                // Fallback to AutoReferee instead of showing Unknown Phase
                return <AutoReferee />;
        }
    };

    return (
        <div className="app-container">
            {renderPhase()}
        </div>
    );
}

export default App;
