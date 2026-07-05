export const DIRECCIONES = {
  ARRIBA: 1,
  ABAJO: 2,
  IZQUIERDA: 3,
  DERECHA: 4,
};

export const BOARD_SIZE = 600;
export const CELL_SIZE = 20;
export const INITIAL_SNAKE = [
  { posX: 60, posY: 20 },
  { posX: 40, posY: 20 },
  { posX: 20, posY: 20 },
];

export function generarNuevaPosicionComida(culebra) {
  while (true) {
    const columnaX = Math.max(Math.floor(Math.random() * 29), 1);
    const columnaY = Math.max(Math.floor(Math.random() * 29), 1);
    const posX = columnaX * 20;
    const posY = columnaY * 20;

    const ocupa = culebra.some((segmento) => segmento.posX === posX && segmento.posY === posY);
    if (!ocupa) {
      return { posX, posY };
    }
  }
}

export function moverCulebra(direccion, culebra) {
  const nuevaCulebra = culebra.map((segmento) => ({ ...segmento }));
  const cabeza = { ...nuevaCulebra[0] };

  if (direccion === DIRECCIONES.DERECHA) {
    cabeza.posX += CELL_SIZE;
  } else if (direccion === DIRECCIONES.IZQUIERDA) {
    cabeza.posX -= CELL_SIZE;
  } else if (direccion === DIRECCIONES.ABAJO) {
    cabeza.posY += CELL_SIZE;
  } else if (direccion === DIRECCIONES.ARRIBA) {
    cabeza.posY -= CELL_SIZE;
  }

  nuevaCulebra.unshift(cabeza);
  const colaDescartada = nuevaCulebra.pop();

  return { snake: nuevaCulebra, tail: colaDescartada };
}

export function culebraComioComida(culebra, comida) {
  return culebra[0].posX === comida.posX && culebra[0].posY === comida.posY;
}

export function ocurrioColision(culebra) {
  const cabeza = culebra[0];

  if (cabeza.posX < CELL_SIZE || cabeza.posY < CELL_SIZE || cabeza.posX >= BOARD_SIZE - CELL_SIZE || cabeza.posY >= BOARD_SIZE - CELL_SIZE) {
    return true;
  }

  if (culebra.length === 1) {
    return false;
  }

  return culebra.slice(1).some((segmento) => segmento.posX === cabeza.posX && segmento.posY === cabeza.posY);
}

export function createInitialGameState() {
  return {
    snake: INITIAL_SNAKE.map((segmento) => ({ ...segmento })),
    direction: DIRECCIONES.DERECHA,
    nextDirection: DIRECCIONES.DERECHA,
    food: generarNuevaPosicionComida(INITIAL_SNAKE),
    score: 0,
    gameOver: false,
  };
}

export function dibujarJuego(contexto, game) {
  contexto.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
  contexto.beginPath();
  contexto.lineWidth = 2;
  contexto.rect(CELL_SIZE, CELL_SIZE, BOARD_SIZE - 2 * CELL_SIZE, BOARD_SIZE - 2 * CELL_SIZE);
  contexto.stroke();

  game.snake.forEach((segmento) => dibujarCuadro(contexto, segmento.posX, segmento.posY));
  dibujarCuadro(contexto, game.food.posX, game.food.posY);

  if (game.gameOver) {
    contexto.font = '38px Arial';
    contexto.textAlign = 'center';
    contexto.fillStyle = 'black';
    contexto.fillText('End of game!', BOARD_SIZE / 2, 260);
    contexto.fillText('Click to start again!', BOARD_SIZE / 2, 310);
  }
}

function dibujarCuadro(contexto, posX, posY) {
  contexto.beginPath();
  contexto.fillStyle = '#2e490b';
  contexto.fillRect(posX, posY, CELL_SIZE, CELL_SIZE);
  contexto.stroke();
}
