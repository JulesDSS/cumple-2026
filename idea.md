Nivel 1: La Linterna (Exploración)
El objetivo es que la pantalla esté completamente oscura y los invitados tengan que arrastrar el dedo para "iluminar" pequeñas áreas y encontrar una pista (por ejemplo, tres símbolos geométricos que necesitarán más adelante, o una llave digital).

Cómo programarlo (El truco CSS + JS):
No necesitas canvas ni librerías pesadas. La forma más moderna y fluida de hacer esto es usando una máscara CSS (mask-image) sobre un div negro, y actualizar la posición con JavaScript.

El HTML: Tienes un contenedor con el fondo real (donde están dibujadas las pistas) y un div superpuesto que hace de oscuridad.

El CSS: Al div oscuro le aplicas un fondo negro y una máscara radial.

CSS
.oscuridad {
  position: absolute;
  inset: 0;
  background-color: #000;
  /* Hace un agujero transparente en el fondo negro */
  -webkit-mask-image: radial-gradient(circle 70px at 50% 50%, transparent 90%, black 100%);
  mask-image: radial-gradient(circle 70px at 50% 50%, transparent 90%, black 100%);
}
El JavaScript: Escuchas el evento touchmove (y mousemove para pruebas en PC) y actualizas las coordenadas X e Y del gradiente para que siga al dedo.

JavaScript
const overlay = document.querySelector('.oscuridad');

overlay.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  const x = touch.clientX;
  const y = touch.clientY;
  // Actualizas la posición del centro del círculo
  overlay.style.webkitMaskImage = `radial-gradient(circle 70px at ${x}px ${y}px, transparent 90%, black 100%)`;
});
Tip de UX: Al ser para celulares, asegúrate de ponerle touch-action: none; al contenedor principal en el CSS para evitar que la pantalla haga scroll o se recargue al arrastrar el dedo.

Nivel 2: Las Tres Puertas (El Acertijo Lógico)
Una vez que encuentran la pista en la oscuridad, la pantalla hace una transición a una habitación bien iluminada con tres puertas grandes (ideales para tocar con el pulgar) y un cartel en la pared.

Aquí la clave es el diseño del acertijo deductivo. Te propongo el clásico "Solo uno dice la verdad", que no falla y obliga a pensar un rato.

El Acertijo:
En la pared hay un letrero que dice: "Solo una de estas tres puertas dice la verdad. Las otras dos mienten. Tienes un solo intento".

Puerta 1: "La invitación está aquí."

Puerta 2: "La invitación no está aquí."

Puerta 3: "La invitación no está en la Puerta 1."

La Lógica (para ti):
La respuesta correcta es la Puerta 2. ¿Por qué?

Si la invitación estuviera en la 1: La Puerta 1 diría la verdad, y la Puerta 2 también diría la verdad. (Falso, porque solo una puede decir la verdad).

Si la invitación estuviera en la 3: La Puerta 2 diría la verdad y la Puerta 3 también diría la verdad. (Falso).

Si la invitación está en la 2: La Puerta 1 miente, la Puerta 2 miente, y solo la Puerta 3 dice la verdad. ¡Bingo!

La Mecánica Web:

Armas un estado simple en JS (let intentos = 1;).

A las puertas falsas (1 y 3) les pones un event listener. Si las tocan, saltas una alerta estilizada o un modal que diga "¡Trampa activada! Puerta incorrecta".

Para darle emoción de escape room, si se equivocan puedes agregar un setTimeout que bloquee la pantalla por 10 segundos con un contador hacia atrás antes de dejarlos volver a intentar.

Si tocan la Puerta 2, desencadenas una lluvia de confeti (hay librerías minúsculas como canvas-confetti que quedan geniales) y revelas el flyer final con la fecha, la dirección y la hora.