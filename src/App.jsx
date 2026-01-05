import React from 'react';
import { useGame } from './context/GameContext';
import { SetupScreen } from './components/Setup/SetupScreen';
import { RoleReveal } from './components/Game/RoleReveal';
import { AutoReferee } from './components/Game/AutoReferee';
import { ManualReferee } from './components/Game/ManualReferee';
import { GAME_PHASES } from './constants/roles';

function App() {
    const { state } = useGame();

    const renderPhase = () => {
        switch (state.phase) {
            case GAME_PHASES.SETUP:
                return <SetupScreen />;
            case GAME_PHASES.ROLE_REVEAL:
                return <RoleReveal />;
            case GAME_PHASES.NIGHT_INTRO:
            case GAME_PHASES.NIGHT_ACTIVE:
            case GAME_PHASES.DAY_INTRO:
            case GAME_PHASES.DISCUSSION:
            case GAME_PHASES.VOTING:
                return state.settings.manualMode ? <ManualReferee /> : <AutoReferee />;
            default:
                return <div>Unknown Phase</div>;
        }
    };

    return (
        <div className="app-container">
            {renderPhase()}
        </div>
    );
}

export default App;
