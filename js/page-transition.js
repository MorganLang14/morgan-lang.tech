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

    // Reveal scroll sections with a gentle fade when they appear in view
    const fadeSections = document.querySelectorAll('.fade-on-scroll');
    if (fadeSections.length > 0) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            fadeSections.forEach((section) => observer.observe(section));
        } else {
            fadeSections.forEach((section) => section.classList.add('is-visible'));
        }
    }

    // No homepage-specific overlap behaviour — homepage uses a single hero card

    // Manage the certification carousel so it can be controlled by buttons, dots, arrows, and autoplay
    const certificationCarousel = document.querySelector('.certification-carousel');
    if (certificationCarousel) {
        const slides = Array.from(certificationCarousel.querySelectorAll('.certification-slide'));
        const prevButton = document.querySelector('.certification-nav.is-prev');
        const nextButton = document.querySelector('.certification-nav.is-next');
        const dotsContainer = document.querySelector('.certification-dots');
        let currentIndex = 0;
        let autoplayTimer = null;

        // Show the selected slide and update the active dot state, while keeping the neighboring cards in the background
        const updateCarousel = () => {
            slides.forEach((slide, index) => {
                const isActive = index === currentIndex;
                const isPrev = index === (currentIndex - 1 + slides.length) % slides.length;
                const isNext = index === (currentIndex + 1) % slides.length;

                slide.classList.toggle('is-active', isActive);
                slide.classList.toggle('is-prev', isPrev);
                slide.classList.toggle('is-next', isNext);
                slide.classList.toggle('is-hidden', !isActive && !isPrev && !isNext);
            });

            if (dotsContainer) {
                dotsContainer.querySelectorAll('.certification-dot').forEach((dot, index) => {
                    dot.classList.toggle('is-active', index === currentIndex);
                });
            }
        };

        // Move to the requested slide while wrapping around at the ends
        const showSlide = (index) => {
            currentIndex = (index + slides.length) % slides.length;
            updateCarousel();
        };

        // Restart the auto-advancing timer after any manual interaction so the carousel feels continuous
        const startAutoplay = () => {
            window.clearInterval(autoplayTimer);
            autoplayTimer = window.setInterval(() => {
                showSlide(currentIndex + 1);
            }, 7000);
        };

        if (slides.length > 1) {
            if (dotsContainer) {
                slides.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.type = 'button';
                    dot.className = 'certification-dot';
                    dot.setAttribute('aria-label', `Show certification ${index + 1}`);
                    dot.addEventListener('click', () => {
                        showSlide(index);
                        startAutoplay();
                    });
                    dotsContainer.appendChild(dot);
                });
            }

            prevButton?.addEventListener('click', () => {
                showSlide(currentIndex - 1);
                startAutoplay();
            });

            nextButton?.addEventListener('click', () => {
                showSlide(currentIndex + 1);
                startAutoplay();
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    showSlide(currentIndex - 1);
                    startAutoplay();
                }

                if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    showSlide(currentIndex + 1);
                    startAutoplay();
                }
            });

            startAutoplay();
        }

        updateCarousel();
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
