import { useEffect, useState } from 'react';
import {
  DIRECCIONES,
  createInitialGameState,
  culebraComioComida,
  generarNuevaPosicionComida,
  moverCulebra,
  ocurrioColision,
} from '../gameLogic';

function useSnakeGame() {
  const [playerName, setPlayerName] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('snakeCurrentUser') || '';
    }
    return '';
  });
  const [leaderboard, setLeaderboard] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const rankingGuardado = window.localStorage.getItem('snakeLeaderboard');
        return rankingGuardado ? JSON.parse(rankingGuardado) : [];
      } catch (error) {
        return [];
      }
    }
    return [];
  });
  const [game, setGame] = useState(createInitialGameState);
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Click to start!');
  const [modalState, setModalState] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('snakeCurrentUser', playerName);
    }
  }, [playerName]);

  useEffect(() => {
    const manejarTecla = (event) => {
      const esFlecha = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code);
      if (!esFlecha) {
        return;
      }

      event.preventDefault();

      if (event.code === 'ArrowUp' && game.direction !== DIRECCIONES.ABAJO) {
        setGame((estadoAnterior) => ({ ...estadoAnterior, nextDirection: DIRECCIONES.ARRIBA }));
      } else if (event.code === 'ArrowDown' && game.direction !== DIRECCIONES.ARRIBA) {
        setGame((estadoAnterior) => ({ ...estadoAnterior, nextDirection: DIRECCIONES.ABAJO }));
      } else if (event.code === 'ArrowLeft' && game.direction !== DIRECCIONES.DERECHA) {
        setGame((estadoAnterior) => ({ ...estadoAnterior, nextDirection: DIRECCIONES.IZQUIERDA }));
      } else if (event.code === 'ArrowRight' && game.direction !== DIRECCIONES.IZQUIERDA) {
        setGame((estadoAnterior) => ({ ...estadoAnterior, nextDirection: DIRECCIONES.DERECHA }));
      }
    };

    window.addEventListener('keydown', manejarTecla);
    return () => window.removeEventListener('keydown', manejarTecla);
  }, [game.direction]);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const intervalo = window.setInterval(() => {
      setGame((estadoAnterior) => {
        const movimiento = moverCulebra(estadoAnterior.nextDirection, estadoAnterior.snake);
        let siguienteSnake = movimiento.snake;
        let siguienteComida = estadoAnterior.food;
        let siguientePuntaje = estadoAnterior.score;

        if (culebraComioComida(siguienteSnake, estadoAnterior.food)) {
          siguienteSnake = [...siguienteSnake, movimiento.tail];
          siguienteComida = generarNuevaPosicionComida(siguienteSnake);
          siguientePuntaje = estadoAnterior.score + 1;
        }

        if (ocurrioColision(siguienteSnake)) {
          const nombre = (playerName || 'Player').trim();
          const rankingActualizado = [...leaderboard];
          const jugadorExistente = rankingActualizado.find((entrada) => entrada.userName.toLowerCase() === nombre.toLowerCase());
          let isNewHighScore = false;

          if (jugadorExistente) {
            isNewHighScore = siguientePuntaje > jugadorExistente.maxScore;
            jugadorExistente.maxScore = Math.max(jugadorExistente.maxScore, siguientePuntaje);
          } else {
            isNewHighScore = siguientePuntaje > 0;
            rankingActualizado.push({ userName: nombre, maxScore: siguientePuntaje });
          }

          rankingActualizado.sort((a, b) => b.maxScore - a.maxScore);
          window.localStorage.setItem('snakeLeaderboard', JSON.stringify(rankingActualizado));
          setLeaderboard(rankingActualizado);
          setIsPlaying(false);
          setStatusMessage('Game over!');
          setModalState({
            isOpen: isNewHighScore,
            message: `${nombre}, you reached ${siguientePuntaje} points!`,
          });

          return {
            ...estadoAnterior,
            snake: siguienteSnake,
            direction: estadoAnterior.nextDirection,
            nextDirection: estadoAnterior.nextDirection,
            food: estadoAnterior.food,
            score: siguientePuntaje,
            gameOver: true,
          };
        }

        return {
          ...estadoAnterior,
          snake: siguienteSnake,
          direction: estadoAnterior.nextDirection,
          nextDirection: estadoAnterior.nextDirection,
          food: siguienteComida,
          score: siguientePuntaje,
          gameOver: false,
        };
      });
    }, 1000 / 15);

    return () => window.clearInterval(intervalo);
  }, [isPlaying, playerName, leaderboard]);

  const empezarJuego = () => {
    const nombre = (playerName || 'Player').trim() || 'Player';
    setPlayerName(nombre);
    setGame(createInitialGameState());
    setIsPlaying(true);
    setStatusMessage('Go!');
  };

  const manejarClickCanvas = () => {
    if (!isPlaying) {
      empezarJuego();
      return;
    }

    setGame((estadoAnterior) => {
      if (estadoAnterior.direction === DIRECCIONES.ABAJO) {
        return { ...estadoAnterior, nextDirection: DIRECCIONES.IZQUIERDA };
      }
      if (estadoAnterior.direction === DIRECCIONES.IZQUIERDA) {
        return { ...estadoAnterior, nextDirection: DIRECCIONES.ARRIBA };
      }
      if (estadoAnterior.direction === DIRECCIONES.ARRIBA) {
        return { ...estadoAnterior, nextDirection: DIRECCIONES.DERECHA };
      }
      return { ...estadoAnterior, nextDirection: DIRECCIONES.ABAJO };
    });
  };

  const guardarJugador = () => {
    const nombre = (playerName || '').trim() || 'Player';
    setPlayerName(nombre);
    setStatusMessage(`Player ready: ${nombre}`);
  };

  const closeModal = () => {
    setModalState({ isOpen: false, message: '' });
  };

  const playAgain = () => {
    closeModal();
    empezarJuego();
  };

  return {
    playerName,
    setPlayerName,
    leaderboard,
    game,
    isPlaying,
    statusMessage,
    modalState,
    closeModal,
    playAgain,
    manejarClickCanvas,
    guardarJugador,
  };
}

export default useSnakeGame;
