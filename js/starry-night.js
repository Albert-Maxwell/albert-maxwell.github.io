/**
 * Starry Night Fluid Animation
 * Inspired by Van Gogh's masterpiece.
 * Implements a flow field particle system with mouse interaction.
 */

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.prepend(canvas);

canvas.id = 'starry-night-canvas';
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.style.background = '#0b1026'; // Deep dark blue background

let width, height;
let particles = [];
let flowField = [];
const rows = 50; // Grid resolution
const cols = 50;
let flowFieldScale = 0.01; // Noise scale
let time = 0;

// Mouse interaction
const mouse = { x: -1000, y: -1000, radius: 200 };

// Colors from Starry Night palette
const colors = [
    '#1a1a2e', // Deep Blue
    '#16213e', // Dark Blue
    '#0f3460', // Navy
    '#533483', // Purple-ish
    '#e94560', // Accent Red (subtle)
    '#fcd34d', // Star Yellow
    '#fbbf24', // Amber
    '#60a5fa', // Light Blue
    '#ffffff'  // White stars
];

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.size = Math.random() * 2 + 0.5;
        this.maxSpeed = Math.random() * 2 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = 0;
        this.age = Math.random() * 100;
        this.lifeSpan = Math.random() * 300 + 100;
    }

    update(flowGrid) {
        // Find grid position
        const col = Math.floor(this.x / (width / cols));
        const row = Math.floor(this.y / (height / rows));
        
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
            const angle = flowGrid[col + row * cols];
            
            // Add flow force
            this.vx += Math.cos(angle) * 0.1;
            this.vy += Math.sin(angle) * 0.1;
        }

        // Mouse interaction (Repel/Swirl)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            
            // Swirl effect
            const swirlX = -forceDirectionY * 2;
            const swirlY = forceDirectionX * 2;

            this.vx += (swirlX - forceDirectionX) * force * 0.5;
            this.vy += (swirlY - forceDirectionY) * force * 0.5;
        }

        // Friction
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.age++;

        // Wrap around edges
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;

        // Reset if too old (creates twinkling effect)
        if (this.age > this.lifeSpan) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.age = 0;
            this.vx = 0;
            this.vy = 0;
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

// Simplex Noise implementation (simplified for brevity)
// Source: https://github.com/jwagner/simplex-noise.js (Conceptually)
// Using a simple pseudo-random gradient noise for dependency-free implementation
function noise(x, y, z) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // Shuffle (omitted for static noise, but we want animation)
    // Using Math.sin for deterministic pseudo-randomness based on input
    return Math.sin(x * 12.9898 + y * 78.233 + z * 1.5) * 43758.5453 % 1; 
}

// Better Noise Function (Perlin-ish)
function getNoiseAngle(x, y, z) {
    // Super simple flow field function:
    // Combination of sine waves to create swirling patterns
    const scale = 0.005;
    return (Math.sin(x * scale + z) + Math.cos(y * scale + z)) * Math.PI * 2;
}

function init() {
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // Create particles
    const particleCount = Math.min(window.innerWidth * 0.5, 1000); // Responsive count
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    animate();
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function animate() {
    ctx.fillStyle = 'rgba(11, 16, 38, 0.1)'; // Trails
    ctx.fillRect(0, 0, width, height);

    // Update Flow Field
    flowField = new Float32Array(cols * rows);
    const xOff = width / cols;
    const yOff = height / rows;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const angle = getNoiseAngle(x * xOff, y * yOff, time * 0.0005);
            flowField[x + y * cols] = angle;
        }
    }

    particles.forEach(p => {
        p.update(flowField);
        p.draw(ctx);
    });

    time++;
    requestAnimationFrame(animate);
}

init();
