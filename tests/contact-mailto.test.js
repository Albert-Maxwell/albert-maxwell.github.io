const test = require('node:test');
const assert = require('node:assert/strict');

const { buildContactMailtoUrl } = require('../js/contact-mailto.js');

test('buildContactMailtoUrl includes recipient, subject, and sender details', () => {
    const url = buildContactMailtoUrl({
        to: 'compliance.enlitech@gmail.com',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        subject: 'Partnership Inquiry',
        message: 'I would like to learn more about your compliance process.'
    });

    assert.equal(
        url,
        'mailto:compliance.enlitech@gmail.com?subject=Partnership%20Inquiry&body=Name%3A%20Ada%20Lovelace%0AEmail%3A%20ada%40example.com%0A%0AMessage%3A%0AI%20would%20like%20to%20learn%20more%20about%20your%20compliance%20process.'
    );
});
