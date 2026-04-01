document.addEventListener('DOMContentLoaded', () => {
    setupSmoothScroll();
    setupCryptoPriceTicker();
    setupContactForm();
    setupScrollAnimations();
    setupCopyrightYear();
});

const CONTACT_EMAIL = '';

function setupCopyrightYear() {
    const copyright = document.getElementById('copyright');
    if (copyright) {
        const currentYear = new Date().getFullYear();
        const startYear = 2024;
        const yearText = currentYear > startYear ? `${startYear}-${currentYear}` : startYear;
        copyright.innerHTML = `&copy; ${yearText} Albert Maxwell. All rights reserved.`;
    }
}

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

    const currencies = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'LTCUSDT', 'DOGEUSDT'];

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
        const nameInput = form.querySelector('#contactName');
        const emailInput = form.querySelector('#contactEmail');
        const subjectInput = form.querySelector('#contactSubject');
        const messageInput = form.querySelector('#contactMessage');
        const statusElement = form.querySelector('#contactFormStatus');
        const submitButton = form.querySelector('button[type="submit"]');

        if (!CONTACT_EMAIL) {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.classList.add('opacity-60', 'cursor-not-allowed');
            }

            updateContactFormStatus(statusElement, 'Email contact is temporarily unavailable while we set up the inbox.', true);
            return;
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const isFormValid = [
                validateInput(nameInput),
                validateInput(emailInput),
                validateInput(subjectInput),
                validateInput(messageInput)
            ].every(Boolean);

            if (!isFormValid) {
                updateContactFormStatus(statusElement, 'Please complete all fields before sending your message.', true);
                return;
            }

            const mailtoUrl = window.ContactMailto.buildContactMailtoUrl({
                to: CONTACT_EMAIL,
                name: nameInput.value,
                email: emailInput.value,
                subject: subjectInput.value,
                message: messageInput.value
            });

            updateContactFormStatus(statusElement, 'Opening your email app with a pre-filled message.', false);
            window.location.href = mailtoUrl;
        });
    }
}

function validateInput(input) {
    if (input.value.trim() === '') {
        input.classList.add('border-red-500');
        input.setAttribute('aria-invalid', 'true');
        return false;
    } else {
        input.classList.remove('border-red-500');
        input.removeAttribute('aria-invalid');
        return true;
    }
}

function updateContactFormStatus(statusElement, message, isError) {
    if (!statusElement) {
        return;
    }

    statusElement.textContent = message;
    statusElement.classList.toggle('text-red-300', isError);
    statusElement.classList.toggle('text-slate-300', !isError);
}
