import GameBoard from './components/GameBoard';
import LeaderboardPanel from './components/LeaderboardPanel';
import ScoreModal from './components/ScoreModal';
import useSnakeGame from './hooks/useSnakeGame';

function App() {
  const {
    playerName,
    setPlayerName,
    leaderboard,
    game,
    statusMessage,
    modalState,
    closeModal,
    playAgain,
    manejarClickCanvas,
    guardarJugador,
  } = useSnakeGame();

  return (
    <div className="app-shell">
      <h1>Snake Game in React</h1>
      <LeaderboardPanel
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        onSavePlayer={guardarJugador}
        leaderboard={leaderboard}
        status={playerName ? `Player: ${playerName}` : 'No player selected'}
      />
      <GameBoard
        game={game}
        onCanvasClick={manejarClickCanvas}
        score={game.score}
        status={statusMessage}
      />
      <ScoreModal
        isOpen={modalState.isOpen}
        message={modalState.message}
        onPlayAgain={playAgain}
        onClose={closeModal}
      />
    </div>
  );
}

export default App;
