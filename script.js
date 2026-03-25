const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.speed = speed;

        this.dx = 1 * this.speed;
        this.dy = 1 * this.speed;
    }

    draw(context) {
        context.beginPath();

        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);

        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
        context.stroke();

        context.closePath();
    }

    update(context) {
        // Rebote en paredes
        if ((this.posX + this.radius) > window_width || (this.posX - this.radius) < 0) {
            this.dx = -this.dx;
        }

        if ((this.posY + this.radius) > window_height || (this.posY - this.radius) < 0) {
            this.dy = -this.dy;
        }

        this.posX += this.dx;
        this.posY += this.dy;

        this.draw(context);
    }
}

// 🔁 Crear N círculos
let circles = [];
let numCirculos = 10;

for (let i = 0; i < numCirculos; i++) {
    let radius = Math.floor(Math.random() * 40 + 20);
    let x = Math.random() * (window_width - radius * 2) + radius;
    let y = Math.random() * (window_height - radius * 2) + radius;

    circles.push(new Circle(x, y, radius, "blue", i + 1, 2));
}

// 🔍 DETECCIÓN DE COLISIÓN (INCISO B)
function detectarColision(c1, c2) {
    let dx = c2.posX - c1.posX;
    let dy = c2.posY - c1.posY;

    let distancia = Math.sqrt(dx * dx + dy * dy);

    return distancia <= (c1.radius + c2.radius);
}

// 🔄 animación
function updateCircle() {
    requestAnimationFrame(updateCircle);
    ctx.clearRect(0, 0, window_width, window_height);

    // actualizar círculos
    for (let i = 0; i < circles.length; i++) {
        circles[i].color = "blue";
        circles[i].update(ctx);
    }

    // 🔴 SOLO detectar (sin rebote aún)
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {

            if (detectarColision(circles[i], circles[j])) {
                circles[i].color = "red";
                circles[j].color = "red";
            }
        }
    }
}

updateCircle();