const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.background = "#111";

const circles = [];
let numInicial = 20;

let mouse = { x: null, y: null };
let paused = false;
let collisionCount = 0;

// FPS
let lastTime = 0;
let fps = 0;

// 🖱️ mouse
canvas.addEventListener("mousemove", e => {
    mouse.x = e.x;
    mouse.y = e.y;
});

// teclado
document.addEventListener("keydown", e => {
    if (e.key === "p") paused = !paused;
    if (e.key === "r") reiniciar();
    if (e.key === "a") crearCirculo();
});

// GRID
const cellSize = 100;
let grid = {};

class Circle {
    constructor(x, y, radius, id) {
        this.posX = x;
        this.posY = y;
        this.baseRadius = radius;
        this.radius = radius;
        this.id = id;

        this.dx = (Math.random() - 0.5) * 4;
        this.dy = (Math.random() - 0.5) * 4;

        this.baseColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        this.color = this.baseColor;

        this.colliding = false;

        this.collisionTime = 0;
        this.scaleTime = 0; // 🔴 NUEVO
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "14px Arial";
        ctx.fillText(this.id, this.posX, this.posY);

        ctx.closePath();
    }

    update() {
        if (this.posX + this.radius > canvas.width || this.posX - this.radius < 0) {
            this.dx *= -1;
        }
        if (this.posY + this.radius > canvas.height || this.posY - this.radius < 0) {
            this.dy *= -1;
        }

        if (mouse.x && mouse.y) {
            let dx = this.posX - mouse.x;
            let dy = this.posY - mouse.y;
            let dist = dx * dx + dy * dy;

            if (dist < 10000) {
                this.dx += dx * 0.01;
                this.dy += dy * 0.01;
            }
        }

        const maxSpeed = 5;
        this.dx = Math.max(Math.min(this.dx, maxSpeed), -maxSpeed);
        this.dy = Math.max(Math.min(this.dy, maxSpeed), -maxSpeed);

        this.posX += this.dx;
        this.posY += this.dy;

        // 🔴 EFECTO COLOR
        if (this.collisionTime > 0) {
            this.color = "red";
            this.collisionTime--;
        } else {
            this.color = this.baseColor;
        }

        // 🔴 EFECTO ESCALA (impacto)
        if (this.scaleTime > 0) {
            this.radius = this.baseRadius * 1.3;
            this.scaleTime--;
        } else {
            this.radius = this.baseRadius;
        }

        this.colliding = false;

        this.draw();
    }
}

// detección
function detectarColision(c1, c2) {
    let dx = c2.posX - c1.posX;
    let dy = c2.posY - c1.posY;
    let dist2 = dx * dx + dy * dy;
    let radios = c1.radius + c2.radius;
    return dist2 <= radios * radios;
}

// colisión
function resolverColision(c1, c2) {
    if (!c1.colliding && !c2.colliding) {

        collisionCount++;

        c1.dx = -c1.dx;
        c1.dy = -c1.dy;

        c2.dx = -c2.dx;
        c2.dy = -c2.dy;

        c1.colliding = true;
        c2.colliding = true;

        // 🔴 EFECTOS
        c1.collisionTime = 10;
        c2.collisionTime = 10;

        c1.scaleTime = 5;
        c2.scaleTime = 5;
    }
}

// GRID
function getCell(x, y) {
    let col = Math.floor(x / cellSize);
    let row = Math.floor(y / cellSize);
    return `${col},${row}`;
}

function buildGrid() {
    grid = {};
    circles.forEach(c => {
        let key = getCell(c.posX, c.posY);
        if (!grid[key]) grid[key] = [];
        grid[key].push(c);
    });
}

function getNeighbors(cellKey) {
    let [col, row] = cellKey.split(",").map(Number);
    let vecinos = [];

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let key = `${col + i},${row + j}`;
            if (grid[key]) vecinos.push(...grid[key]);
        }
    }
    return vecinos;
}

// crear
function crearCirculo(x, y) {
    let radius = Math.random() * 30 + 15;
    let nuevo;
    let intentos = 0;

    do {
        let posX = x ?? Math.random() * canvas.width;
        let posY = y ?? Math.random() * canvas.height;

        nuevo = new Circle(posX, posY, radius, circles.length + 1);
        intentos++;
        if (intentos > 100) break;

    } while (circles.some(c => detectarColision(nuevo, c)));

    circles.push(nuevo);
}

// reiniciar
function reiniciar() {
    circles.length = 0;
    collisionCount = 0;
    for (let i = 0; i < numInicial; i++) {
        crearCirculo();
    }
}

// inicio
reiniciar();

// 🔴 UI MEJORADA
function drawUI() {
    // fondo
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(10, 10, 260, 110);

    ctx.fillStyle = "white";
    ctx.font = "18px Arial";

    ctx.fillText(`FPS: ${fps}`, 20, 35);
    ctx.fillText(`Colisiones: ${collisionCount}`, 20, 60);
    ctx.fillText(`Círculos: ${circles.length}`, 20, 85);

    ctx.font = "14px Arial";
    ctx.fillText(`P: Pausa | R: Reset | A: Agregar`, 20, 105);
}

// animación
function animate(time = 0) {
    requestAnimationFrame(animate);

    let delta = time - lastTime;
    lastTime = time;
    fps = Math.round(1000 / delta);

    if (paused) {
        drawUI();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    buildGrid();

    circles.forEach(c => c.update());

    circles.forEach(c => {
        let vecinos = getNeighbors(getCell(c.posX, c.posY));
        vecinos.forEach(other => {
            if (c !== other && detectarColision(c, other)) {
                resolverColision(c, other);
            }
        });
    });

    drawUI();
}

animate();