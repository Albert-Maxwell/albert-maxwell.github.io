(function (global) {
    function sanitizeField(value) {
        return String(value ?? '').trim();
    }

    function buildContactMailtoUrl({ to, name, email, subject, message }) {
        const recipient = sanitizeField(to);
        const emailSubject = sanitizeField(subject);
        const body = [
            `Name: ${sanitizeField(name)}`,
            `Email: ${sanitizeField(email)}`,
            '',
            'Message:',
            sanitizeField(message)
        ].join('\n');

        return `mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
    }

    const api = { buildContactMailtoUrl };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    global.ContactMailto = api;
})(typeof window !== 'undefined' ? window : globalThis);
