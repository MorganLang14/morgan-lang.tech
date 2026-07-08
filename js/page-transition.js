document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    body.classList.add('page-transition', 'is-visible');

    // Find the terminal text area and its wrapper
    const terminalLine = document.querySelector('.terminal-line');
    const terminalText = document.querySelector('.terminal-text');

    if (terminalLine && terminalText) {
        const phrases = terminalLine.getAttribute('data-words').split(',');
        let index = 0;

        // Type each character one by one to simulate a terminal prompt
        const typeText = (text, onComplete) => {
            terminalText.textContent = '';
            let i = 0;

            const tick = () => {
                if (i < text.length) {
                    terminalText.textContent += text.charAt(i);
                    i += 1;
                    window.setTimeout(tick, 45);
                } else if (onComplete) {
                    window.setTimeout(onComplete, 700);
                }
            };

            tick();
        };

        // Erase the current text one character at a time
        const eraseText = (onComplete) => {
            let current = terminalText.textContent;

            const tick = () => {
                if (current.length > 0) {
                    current = current.slice(0, -1);
                    terminalText.textContent = current;
                    window.setTimeout(tick, 28);
                } else if (onComplete) {
                    onComplete();
                }
            };

            tick();
        };

        // Cycle through the available terminal phrases continuously
        const runCycle = () => {
            const phrase = phrases[index].trim();
            index = (index + 1) % phrases.length;

            eraseText(() => {
                typeText(phrase, () => {
                    window.setTimeout(runCycle, 1400);
                });
            });
        };

        typeText(phrases[0].trim(), () => {
            window.setTimeout(runCycle, 1200);
        });
    }

    // Add a subtle page fade transition for internal links
    document.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href');

        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }

        link.addEventListener('click', (event) => {
            const target = event.currentTarget;
            const targetHref = target.getAttribute('href');

            if (!targetHref || targetHref.startsWith('#')) {
                return;
            }

            event.preventDefault();
            body.classList.remove('is-visible');
            body.classList.add('is-exiting');

            window.setTimeout(() => {
                window.location.href = targetHref;
            }, 220);
        });
    });
});
