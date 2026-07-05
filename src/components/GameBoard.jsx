import { useEffect, useRef } from 'react';
import { BOARD_SIZE, dibujarJuego } from '../gameLogic';

function GameBoard({ game, onCanvasClick, score, status }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const contexto = canvas.getContext('2d');
    dibujarJuego(contexto, game);
  }, [game]);

  return (
    <div className="game-card">
      <div className="score">SCORE: {score}</div>
      <div className="status">{status}</div>
      <div className="game-console">
        <canvas
          ref={canvasRef}
          width={BOARD_SIZE}
          height={BOARD_SIZE}
          onClick={onCanvasClick}
          className="game-canvas"
        />
      </div>
    </div>
  );
}

export default GameBoard;
