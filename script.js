// Obtener el elemento canvas del HTML
const canvas = document.getElementById("canvas");

// Obtener el contexto 2D para dibujar
const ctx = canvas.getContext("2d");

// Obtener dimensiones de la ventana
const window_height = window.innerHeight;
const window_width = window.innerWidth;

// Ajustar tamaño del canvas
canvas.height = window_height;
canvas.width = window_width;

// Color de fondo
canvas.style.background = "#ff8";

// 🔵 Clase que define un círculo
class Circle {

    // Constructor: inicializa propiedades del círculo
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;          // posición en X
        this.posY = y;          // posición en Y
        this.radius = radius;   // radio
        this.color = color;     // color del borde
        this.text = text;       // número dentro del círculo
        this.speed = speed;     // velocidad

        // Dirección del movimiento
        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;
    }

    // Método para dibujar el círculo
    draw(context) {
        context.beginPath();

        context.strokeStyle = this.color;

        // Texto centrado
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);

        // Dibujar círculo
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
        context.stroke();

        context.closePath();
    }

    // Método para actualizar posición y manejar rebotes
    update(context) {

        // Rebote en paredes horizontales
        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }

        // Rebote en paredes verticales
        if ((this.posY + this.radius) > window_height || (this.posY - this.radius) < 0) {
            this.dy = -this.dy;
        }

        // Actualizar posición
        this.posX += this.dx;
        this.posY += this.dy;

        // Dibujar
        this.draw(context);
    }
}

// 🔁 Crear múltiples círculos
let circles = [];
let numCirculos = 10;

for (let i = 0; i < numCirculos; i++) {

    // Generar valores aleatorios
    let radius = Math.floor(Math.random() * 40 + 20);
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = Math.random() * (window_height - radius * 2) + radius;

    // Crear círculo y agregarlo al arreglo
    circles.push(new Circle(x, y, radius, "blue", i + 1, 2));
}

// 🔍 Función para detectar colisiones entre dos círculos
function detectarColision(c1, c2) {

    // Diferencias de posición
    let dx = c2.posX - c1.posX;
    let dy = c2.posY - c1.posY;

    // Distancia entre centros
    let distancia = Math.sqrt(dx * dx + dy * dy);

    // Verificar colisión
    return distancia <= (c1.radius + c2.radius);
}

// 🔄 Función de animación
function updateCircle() {

    // Llamar a la animación continuamente
    requestAnimationFrame(updateCircle);

    // Limpiar pantalla
    ctx.clearRect(0, 0, window_width, window_height);

    // Actualizar cada círculo
    for (let i = 0; i < circles.length; i++) {
        circles[i].color = "blue"; // reset color
        circles[i].update(ctx);
    }

    // Revisar colisiones entre todos los círculos
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {

            if (detectarColision(circles[i], circles[j])) {

                // Cambiar dirección (rebote)
                circles[i].dx = -circles[i].dx;
                circles[i].dy = -circles[i].dy;

                circles[j].dx = -circles[j].dx;
                circles[j].dy = -circles[j].dy;

                // Cambiar color para visualizar colisión
                circles[i].color = "red";
                circles[j].color = "red";
            }
        }
    }
}

// Iniciar animación
updateCircle();