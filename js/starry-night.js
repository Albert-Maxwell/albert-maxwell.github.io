/**
 * Starry Night Fluid Animation
 * Inspired by Van Gogh's masterpiece.
 * Implements a flow field particle system with "brush stroke" rendering.
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
const rows = 60; // Increased resolution for finer details
const cols = 60;
let flowFieldScale = 0.008; // Adjusted scale for larger swirls
let time = 0;

// Mouse interaction
const mouse = { x: -1000, y: -1000, radius: 300 };

// Colors from Starry Night palette (Oil Painting Tones)
const colors = [
    '#1a3c7a', // Deep Prussian Blue
    '#2c5aa0', // Medium Blue
    '#4b7bc6', // Lighter Blue
    '#88b3c8', // Sky Blue
    '#f4d03f', // Vibrant Yellow (Stars)
    '#f1c40f', // Golden Yellow
    '#d4ac0d', // Darker Gold
    '#e59866', // Warm Orange/Brown hint
    '#ffffff', // White highlights
    '#0a192f'  // Very Dark Blue (Depth)
];

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.size = Math.random() * 3 + 1; // Thicker strokes
        this.length = Math.random() * 15 + 5; // Length of the brush stroke
        this.maxSpeed = Math.random() * 1.5 + 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = 0;
        this.age = Math.random() * 100;
        this.lifeSpan = Math.random() * 300 + 100;
        this.alpha = Math.random() * 0.5 + 0.5; // Varying opacity for texture
    }

    update(flowGrid) {
        // Find grid position
        const col = Math.floor(this.x / (width / cols));
        const row = Math.floor(this.y / (height / rows));
        
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
            const angle = flowGrid[col + row * cols];
            
            // Add flow force
            this.vx += Math.cos(angle) * 0.05; // Gentle force
            this.vy += Math.sin(angle) * 0.05;
            this.angle = angle; // Align stroke with flow
        }

        // Mouse interaction (Repel/Swirl)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            
            // Swirl effect - stronger near mouse
            const swirlX = -forceDirectionY * 3;
            const swirlY = forceDirectionX * 3;

            this.vx += (swirlX - forceDirectionX) * force * 0.2;
            this.vy += (swirlY - forceDirectionY) * force * 0.2;
        }

        // Friction
        this.vx *= 0.96;
        this.vy *= 0.96;

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

        // Reset if too old
        if (this.age > this.lifeSpan) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.age = 0;
            this.vx = 0;
            this.vy = 0;
            this.alpha = Math.random() * 0.5 + 0.5;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Rotate to match velocity or flow angle
        const rotation = Math.atan2(this.vy, this.vx);
        ctx.rotate(rotation);
        
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        // Draw a "brush stroke" (rounded rectangle/ellipse)
        ctx.moveTo(0, 0);
        ctx.lineTo(this.length, 0);
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        ctx.restore();
    }
}

// Better Noise Function (Perlin-ish)
function getNoiseAngle(x, y, z) {
    // Complex swirling pattern
    const scale = 0.003;
    const angle1 = (Math.sin(x * scale + z) + Math.cos(y * scale + z)) * Math.PI;
    const angle2 = (Math.sin(x * scale * 2 + z) + Math.cos(y * scale * 2 + z)) * Math.PI;
    return angle1 + angle2 * 0.5;
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

    // Create particles - more particles for denser look
    const particleCount = Math.min(window.innerWidth * 0.8, 1500); 
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
    // Trail effect - use a dark blue with low opacity to create "smear"
    ctx.fillStyle = 'rgba(11, 16, 38, 0.15)'; 
    ctx.fillRect(0, 0, width, height);

    // Update Flow Field
    flowField = new Float32Array(cols * rows);
    const xOff = width / cols;
    const yOff = height / rows;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const angle = getNoiseAngle(x * xOff, y * yOff, time * 0.0003);
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
