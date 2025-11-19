document.addEventListener('DOMContentLoaded', () => {
    setupSmoothScroll();
    setupCryptoPriceTicker();
    setupContactForm();
    setupScrollAnimations();
});

function setupScrollAnimations() {
    // Options for the observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    // Create the observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once animated
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Target sections and other elements
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('reveal');
        
        // Also animate children for specific sections
        const container = section.querySelector('.container');
        if (container) {
            // Check if it has a grid or flex container inside
            const grid = container.querySelector('.grid, .flex');
            if (grid) {
                grid.classList.add('reveal-children');
                observer.observe(grid);
            }
        }
        
        observer.observe(section);
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

async function setupCryptoPriceTicker() {
    const tickerElement = document.createElement('div');
    tickerElement.className = 'crypto-ticker glass-ticker fixed bottom-0 left-0 right-0 text-white py-2 text-sm';
    tickerElement.style.overflowX = 'hidden';
    tickerElement.style.whiteSpace = 'nowrap';
    document.body.appendChild(tickerElement);

    const currencies = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'LTCUSDT', 'DOGEUSDT', 'BOMEUSDT'];

    async function updateTicker() {
        let tickerContent = '';
        for (const currency of currencies) {
            const price = await fetchPrice(currency);
            tickerContent += `${currency.replace('USDT', '')}: $${price} | `;
        }
        
        // Create a span for the content to measure and animate it
        const contentSpan = document.createElement('span');
        contentSpan.className = 'ticker-content';
        contentSpan.style.display = 'inline-block';
        contentSpan.textContent = tickerContent;
        
        // Clear previous content
        tickerElement.innerHTML = '';
        tickerElement.appendChild(contentSpan);

        // Calculate duration based on width for consistent speed (e.g., 50 pixels per second)
        const containerWidth = window.innerWidth;
        const contentWidth = contentSpan.offsetWidth;
        const totalDistance = containerWidth + contentWidth;
        const speed = 100; // pixels per second
        const duration = totalDistance / speed;

        // Reset position to right side
        contentSpan.style.transform = `translateX(${containerWidth}px)`;
        contentSpan.style.transition = 'none';

        // Force reflow
        contentSpan.offsetHeight;

        // Animate to left side
        contentSpan.style.transition = `transform ${duration}s linear`;
        contentSpan.style.transform = `translateX(-${contentWidth}px)`;

        // Wait for animation to finish + 1 second pause
        setTimeout(() => {
            // Recursively call to update prices and restart animation
            updateTicker();
        }, (duration * 1000) + 1000);
    }

    // Start the loop
    updateTicker();
}

async function fetchPrice(symbol) {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    const data = await response.json();
    return parseFloat(data.price).toFixed(2);
}

function setupContactForm() {
    const form = document.querySelector('#contactForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = form.querySelector('input[type="text"]');
            const emailInput = form.querySelector('input[type="email"]');
            const messageInput = form.querySelector('textarea');

            if (validateInput(nameInput) && validateInput(emailInput) && validateInput(messageInput)) {
                alert('Form submitted successfully!');
                form.reset();
            }
        });
    }
}

function validateInput(input) {
    if (input.value.trim() === '') {
        input.classList.add('border-red-500');
        return false;
    } else {
        input.classList.remove('border-red-500');
        return true;
    }
}
