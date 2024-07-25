@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

:root {
    --hero-bg: url('../images/hero-background.jpg');
    --about-bg: url('../images/about-background.jpg');
    --services-bg: url('../images/services-background.jpg');
    --technology-bg: url('../images/technology-background.jpg');
}

body {
    font-family: 'Roboto', sans-serif;
    background-color: #1a202c;
}

.gradient-text {
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.hero-section {
    background-image: var(--hero-bg);
    background-size: cover;
    background-position: center;
    position: relative;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
}

.about-section {
    background-image: var(--about-bg);
    background-size: cover;
    background-position: center;
}

.services-section {
    background-image: var(--services-bg);
    background-size: cover;
    background-position: center;
}

.technology-section {
    background-image: var(--technology-bg);
    background-size: cover;
    background-position: center;
}