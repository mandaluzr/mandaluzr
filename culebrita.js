/* CONSTANTES */

let DIRECCIONES = {
    ARRIBA: 1,
    ABAJO: 2,
    IZQUIERDA: 3,
    DERECHA: 4,
};

let FPS = 1000 / 15;

let JUEGO_CANVAS = document.getElementById("juegoCanvas");
let CTX = JUEGO_CANVAS.getContext("2d");

let CONTENEDOR_NINTENDO = document.getElementById("contenedorNintendo");
let PUNTOS_TEXTO = document.getElementById("puntos");
let BANNER_ROTAR_TELEFONO = document.getElementById("bannerRotarTelefono");
let TITULO = document.getElementById("titulo");
let BOTON_CERRAR_BANNER = document.getElementById("botonCerrarBanner");

let SONIDO_GANASTE_PUNTO = new Audio("ganaste_un_punto.wav");

let CSS_CLASE_SACUDIR_HORIZONTALMENTE = "shake-horizontal";
let CSS_CLASE_ESCONDER = "esconder";

let INPUT_USUARIO = document.getElementById("inputUsuario");
let BOTON_GUARDAR_USUARIO = document.getElementById("botonGuardarUsuario");
let LISTA_RANKING = document.getElementById("listaRanking");
let ESTADO_JUGADOR = document.getElementById("estadoJugador");
let STORAGE_KEY_RANKING = "snakeLeaderboard";
let STORAGE_KEY_JUGADOR = "snakeCurrentUser";

// AGREGAR PARA PROBAR SONIDO CUANDO PERDÉS -> EXTRA POINT por mí.

/* ESTADO DEL JUEGO */

let culebra;
let direccionActual;
let nuevaDireccion;
let comida;
let ciclo;
let puntos;
let jugadorActual = "";

function obtenerRanking() {
    try {
        const rankingGuardado = localStorage.getItem(STORAGE_KEY_RANKING);
        return rankingGuardado ? JSON.parse(rankingGuardado) : [];
    } catch (error) {
        console.warn("No se pudo leer el ranking", error);
        return [];
    }
}

function guardarRanking(ranking) {
    try {
        localStorage.setItem(STORAGE_KEY_RANKING, JSON.stringify(ranking));
    } catch (error) {
        console.warn("No se pudo guardar el ranking", error);
    }
}

function obtenerJugadorActual() {
    try {
        return localStorage.getItem(STORAGE_KEY_JUGADOR) || "";
    } catch (error) {
        console.warn("No se pudo leer el jugador actual", error);
        return "";
    }
}

function guardarJugadorActual(nombre) {
    try {
        localStorage.setItem(STORAGE_KEY_JUGADOR, nombre);
    } catch (error) {
        console.warn("No se pudo guardar el jugador actual", error);
    }
}

function actualizarEstadoJugador() {
    if (jugadorActual) {
        ESTADO_JUGADOR.innerText = `Player: ${jugadorActual}`;
    } else {
        ESTADO_JUGADOR.innerText = "No player selected";
    }
}

function registrarJugadorDesdeInput() {
    const nombre = (INPUT_USUARIO.value || "").trim();

    if (nombre) {
        jugadorActual = nombre;
        guardarJugadorActual(nombre);
        INPUT_USUARIO.value = nombre;
    } else if (!jugadorActual) {
        jugadorActual = "Player";
        guardarJugadorActual(jugadorActual);
    }

    actualizarEstadoJugador();
    return jugadorActual;
}

function renderRanking() {
    const ranking = obtenerRanking()
        .sort((a, b) => b.maxScore - a.maxScore)
        .slice(0, 10);

    LISTA_RANKING.innerHTML = "";

    if (ranking.length === 0) {
        const item = document.createElement("li");
        item.innerText = "No scores yet";
        LISTA_RANKING.appendChild(item);
        return;
    }

    ranking.forEach((entry, index) => {
        const item = document.createElement("li");
        item.innerText = `${index + 1}. ${entry.userName} - ${entry.maxScore} pts`;
        LISTA_RANKING.appendChild(item);
    });
}

function guardarPuntajeJugador(puntaje) {
    const nombre = registrarJugadorDesdeInput();
    const ranking = obtenerRanking();
    const jugadorExistente = ranking.find((entry) => entry.userName.toLowerCase() === nombre.toLowerCase());

    if (jugadorExistente) {
        jugadorExistente.maxScore = Math.max(jugadorExistente.maxScore, puntaje);
    } else {
        ranking.push({ userName: nombre, maxScore: puntaje });
    }

    guardarRanking(ranking);
    renderRanking();
}

jugadorActual = obtenerJugadorActual();
if (jugadorActual) {
    INPUT_USUARIO.value = jugadorActual;
}
actualizarEstadoJugador();
renderRanking();

/* DIBUJAR */


// function dibujarCuadricula(context) {
//     for (let x = 20; x < 600; x += 20) {
//         context.beginPath();
//         context.fillStyle = "black";
//         context.moveTo(x, 0);
//         context.lineTo(x, 600);
//         context.stroke();
//     }
        
//     for (let y = 20; y < 600; y += 20) {
//         context.beginPath();
//         context.fillStyle = "black";
//         context.moveTo(0, y);
//         context.lineTo(600, y);
//         context.stroke();
//     }
// }

function rellenarCuadrado(context, posX, posY) {
    context.beginPath();
    context.fillStyle = "#2e490b";
    context.fillRect(posX, posY, 20, 20);
    context.stroke();
}

function dibujarCulebra(context, culebra) {
    for (let i = 0; i < culebra.length; i++) {
        rellenarCuadrado(context, culebra[i].posX, culebra[i].posY);
    }
}
function dibujarComida(context, comida) {
    rellenarCuadrado(context, comida.posX, comida.posY);
}

function dibujarParedes(context) {
    context.beginPath();
    context.lineWidth = "2";
    context.rect(20, 20, 560, 560);
    context.stroke(); // sirve pa dibujar.
}

function dibujarTexto(context, texto, x, y) {
    context.font = "38px Arial";
    context.textAlign = "center";
    context.fillStyle = "black";
    context.fillText(texto, x, y);
}

/* CULEBRA */

function moverCulebra (direccion, culebra) {
    let cabezaPosX = culebra[0].posX;
    let cabezaPosY = culebra[0].posY;

    if(direccion === DIRECCIONES.DERECHA) {
        cabezaPosX += 20;
    } else if(direccion === DIRECCIONES.IZQUIERDA) {
        cabezaPosX -= 20;
    } else if(direccion === DIRECCIONES.ABAJO) {
        cabezaPosY +=20;
    } else if(direccion === DIRECCIONES.ARRIBA) {
        cabezaPosY -=20;
    }

    // agregamos la NUEVA cabeza al principio de la lista
    culebra.unshift({posX: cabezaPosX, posY: cabezaPosY});
    // borramos la COLA de la culebra
    return culebra.pop(); // {posX, posY}
}

function culebraComioComida(culebra, comida) {
    return culebra[0].posX === comida.posX && culebra[0].posY === comida.posY;
}

/* COMIDA */

function generarNuevaPosicionComida(culebra) {
    while (true) {
        // 0 <= Math.random() < 1
        let columnaX = Math.max(Math.floor(Math.random() * 29), 1);
        let columnaY = Math.max(Math.floor(Math.random() * 29), 1);

        let posX = columnaX * 20;
        let posY = columnaY * 20;

        for (let i = 0; i < culebra.length; i++) {
            if (culebra[i].posX === posX && culebra[i].posY === posY) {
                continue;
            }
        }
    
        return { posX: posX, posY: posY };      
    }
}

/* Colisiones */

function ocurrioColision(culebra) {
    let cabeza = culebra[0];

    if (
        cabeza.posX < 20 ||
        cabeza.posY < 20 || 
        cabeza.posX >= 580 || 
        cabeza.posY >= 580
        ) {
            console.log("colision occurió con pared");
            return true;
        } 

        if (culebra.length === 1) {
            return false;
        }

        for (let i = 1; i < culebra.length; i++) {
            if (cabeza.posX === culebra[i].posX && cabeza.posY === culebra[i].posY) {
                return true;
            }
        }

        return false;
    };

/* PUNTAJE   ANTES USABA ->
         puntos++;
        PUNTOS_TEXTO.innerText = "PUNTOS: " + puntos;*/

function mostrarPuntos(puntos) {
    const nombreJugador = jugadorActual ? ` | ${jugadorActual}` : "";
    PUNTOS_TEXTO.innerText = "PUNTOS: " + puntos + nombreJugador;
}

function incrementarPuntaje() {
    puntos++;
    mostrarPuntos(puntos)
    SONIDO_GANASTE_PUNTO.play();
}

/* RESPONSIVE */

BOTON_GUARDAR_USUARIO.addEventListener("click", function () {
    registrarJugadorDesdeInput();
    renderRanking();
});

window.addEventListener("orientationchange", function() {
    TITULO.classList.add(CSS_CLASE_ESCONDER);
    BANNER_ROTAR_TELEFONO.classList.remove(CSS_CLASE_ESCONDER);
});

BOTON_CERRAR_BANNER.addEventListener("click", function() {
    TITULO.classList.add(CSS_CLASE_ESCONDER);
    BANNER_ROTAR_TELEFONO.classList.add(CSS_CLASE_ESCONDER);
});

/* CICLO DEL JUEGO */

document.addEventListener("keydown", function(e) {


    if (e.code === "ArrowUp" && direccionActual !== DIRECCIONES.ABAJO) {
        nuevaDireccion = DIRECCIONES.ARRIBA;
    } else if (e.code === "ArrowDown" && direccionActual !== DIRECCIONES.ARRIBA) {
        nuevaDireccion = DIRECCIONES.ABAJO;
    } else if (e.code === "ArrowLeft" && direccionActual !== DIRECCIONES.DERECHA) {
        nuevaDireccion = DIRECCIONES.IZQUIERDA;
    } else if (e.code === "ArrowRight" && direccionActual !== DIRECCIONES.IZQUIERDA) {
        nuevaDireccion = DIRECCIONES.DERECHA;
    } else {
        return;
    }
});

function cicloDeJuego() {
    let colaDescartada = moverCulebra(direccionActual, culebra);
    direccionActual = nuevaDireccion;

    if (culebraComioComida(culebra, comida)) {
        culebra.push(colaDescartada);
        comida = generarNuevaPosicionComida(culebra);
        incrementarPuntaje();
    }

    if (ocurrioColision(culebra)) {
        gameOver();
        return;
    }

    CTX.clearRect(0, 0, 600, 600);
    dibujarParedes(CTX);
    dibujarCulebra(CTX, culebra);
    dibujarComida(CTX, comida);
}

function gameOver() {
    clearInterval(ciclo);
    ciclo = undefined;
    dibujarTexto(CTX, "End of game!", 300, 260);
    dibujarTexto(CTX, "Click to start again! ", 300, 310);
    CONTENEDOR_NINTENDO.classList.add(CSS_CLASE_SACUDIR_HORIZONTALMENTE);
    guardarPuntajeJugador(puntos);
}

function empezarJuego() {
    registrarJugadorDesdeInput();

    culebra = [
        {posX: 60, posY: 20},
        {posX: 40, posY: 20},
        {posX: 20, posY: 20}
    ];
    
    direccionActual = DIRECCIONES.DERECHA;
    nuevaDireccion = direccionActual;
    
    comida = generarNuevaPosicionComida(culebra);
    puntos = 0;

    mostrarPuntos(puntos);

    CONTENEDOR_NINTENDO.classList.remove(CSS_CLASE_SACUDIR_HORIZONTALMENTE);

    ciclo = setInterval(cicloDeJuego, FPS);
}

dibujarParedes(CTX);
dibujarTexto(CTX, "Click to start!", 300, 100);
dibujarTexto(CTX, "Desktop: Move with ↓ ↑ → ←", 300, 310);
dibujarTexto(CTX, "Móvil: Tap to move the snake", 300, 400);


JUEGO_CANVAS.addEventListener("click", function () {
    if(ciclo === undefined) {
        registrarJugadorDesdeInput();
        empezarJuego();
        return;
    }

    if (direccionActual === DIRECCIONES.ABAJO) {
        nuevaDireccion = DIRECCIONES.IZQUIERDA;
    } else if (direccionActual === DIRECCIONES.IZQUIERDA) {
        nuevaDireccion = DIRECCIONES.ARRIBA;
    } else if (direccionActual === DIRECCIONES.ARRIBA) {
        nuevaDireccion = DIRECCIONES.DERECHA;
    } else if (direccionActual === DIRECCIONES.DERECHA) {
        nuevaDireccion = DIRECCIONES.ABAJO;
    }
});
