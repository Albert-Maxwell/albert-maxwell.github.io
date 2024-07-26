document.addEventListener('DOMContentLoaded', () => {
    setupSmoothScroll();

    setupCryptoPriceTicker();

    setupContactForm();
});

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
    tickerElement.className = 'crypto-ticker fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-2 text-sm';
    tickerElement.style.overflowX = 'hidden';
    document.body.appendChild(tickerElement);

    const currencies = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'LTCUSDT', 'ADAUSDT'];
    let tickerContent = '';

    for (const currency of currencies) {
        const price = await fetchPrice(currency);
        tickerContent += `${currency.replace('USDT', '')}: $${price} | `;
    }

    tickerElement.innerHTML = `<div class="ticker-content">${tickerContent.repeat(2)}</div>`;

    const tickerContentElement = tickerElement.querySelector('.ticker-content');
    tickerContentElement.style.display = 'inline-block';
    tickerContentElement.style.whiteSpace = 'nowrap';
    tickerContentElement.style.paddingLeft = '100%';
    tickerContentElement.style.animation = 'ticker 30s linear infinite';

    const style = document.createElement('style');
    style.textContent = `
        @keyframes ticker {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
        }
    `;
    document.head.appendChild(style);
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
