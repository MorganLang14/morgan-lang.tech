document.addEventListener('DOMContentLoaded', () => {
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

    // Closing the terminal shrinks it away, scrolls on to the next section, then puts it back for the way up
    const terminalWindow = document.querySelector('.terminal-window');
    const terminalClose = document.querySelector('.terminal-button.is-close');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (terminalWindow && terminalClose) {
        terminalClose.addEventListener('click', (event) => {
            if (reduceMotion.matches) {
                return;
            }
            event.preventDefault();
            const target = document.querySelector(terminalClose.getAttribute('href'));
            terminalWindow.classList.add('is-closing');
            window.setTimeout(() => {
                target?.scrollIntoView();
                history.replaceState(null, '', terminalClose.getAttribute('href'));
                window.setTimeout(() => terminalWindow.classList.remove('is-closing'), 1000);
            }, 250);
        });
    }

    // Keep the CSS navbar height in sync so anchored sections are not hidden behind the sticky bar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const syncNavHeight = () => {
            document.documentElement.style.setProperty('--nav-height', `${navbar.offsetHeight}px`);
        };
        syncNavHeight();
        window.addEventListener('resize', syncNavHeight);

        // Give the navbar a backing once the page has scrolled off the home photo's sky
        const syncScrolled = () => {
            navbar.classList.toggle('is-scrolled', window.scrollY > 8);
        };
        syncScrolled();
        window.addEventListener('scroll', syncScrolled, { passive: true });
    }

    // Load the other section photos once the page itself has finished loading
    const backdrop = document.querySelector('.backdrop');
    if (backdrop) {
        const loadBackdrops = () => backdrop.classList.add('is-loaded');
        if (document.readyState === 'complete') {
            loadBackdrops();
        } else {
            window.addEventListener('load', loadBackdrops);
        }
    }
    const backdropLayers = Array.from(document.querySelectorAll('.backdrop-layer'));

    // Highlight the menu link and show the photo for whichever section is in the middle of the screen
    const navLinks = Array.from(document.querySelectorAll('.navbar-nav .nav-link[href^="#"]'));
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (sections.length > 0 && 'IntersectionObserver' in window) {
        const setActive = (id) => {
            navLinks.forEach((link) => {
                const isActive = link.getAttribute('href') === `#${id}`;
                link.classList.toggle('active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'true');
                } else {
                    link.removeAttribute('aria-current');
                }
            });

            backdropLayers.forEach((layer) => {
                layer.classList.toggle('is-active', layer.dataset.section === id);
            });
        };

        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActive(entry.target.id);
                }
            });
        }, { rootMargin: '-50% 0px -50% 0px' });

        sections.forEach((section) => spy.observe(section));
    }

    // Open grid photos full size in the viewer, with buttons and arrow keys to move between them
    const photoViewer = document.querySelector('.photo-viewer');
    const photoLinks = Array.from(document.querySelectorAll('.photo-grid .photo-link'));
    if (photoViewer && photoLinks.length > 0 && typeof photoViewer.showModal === 'function') {
        const viewerImage = photoViewer.querySelector('.photo-viewer-image');
        let photoIndex = 0;

        const showPhoto = (index) => {
            photoIndex = (index + photoLinks.length) % photoLinks.length;
            const link = photoLinks[photoIndex];
            viewerImage.src = link.getAttribute('href');
            viewerImage.alt = link.querySelector('img')?.getAttribute('alt') || '';
        };

        photoLinks.forEach((link, index) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                showPhoto(index);
                photoViewer.showModal();
            });
        });

        // With only one photo there is nothing to step through
        photoViewer.querySelectorAll('.photo-viewer-button.is-prev, .photo-viewer-button.is-next').forEach((button) => {
            button.hidden = photoLinks.length < 2;
        });

        photoViewer.querySelector('.photo-viewer-button.is-close')?.addEventListener('click', () => photoViewer.close());
        photoViewer.querySelector('.photo-viewer-button.is-prev')?.addEventListener('click', () => showPhoto(photoIndex - 1));
        photoViewer.querySelector('.photo-viewer-button.is-next')?.addEventListener('click', () => showPhoto(photoIndex + 1));

        // Clicking the dark area around the photo closes the viewer
        photoViewer.addEventListener('click', (event) => {
            if (event.target === photoViewer) {
                photoViewer.close();
            }
        });

        photoViewer.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                showPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
            }
        });
    }

    // Manage the certification carousel so it can be controlled by buttons, dots, arrows, and autoplay
    const certificationCarousel = document.querySelector('.certification-carousel');
    if (certificationCarousel) {
        const slides = Array.from(certificationCarousel.querySelectorAll('.certification-slide'));
        const prevButton = document.querySelector('.certification-nav.is-prev');
        const nextButton = document.querySelector('.certification-nav.is-next');
        const dotsContainer = document.querySelector('.certification-dots');
        let currentIndex = 0;
        let autoplayTimer = null;

        // Show the selected slide and update the active dot state, while keeping the neighbouring cards in the background
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
                // Leave the arrow keys to the photo viewer while it is open
                if (document.querySelector('dialog[open]')) {
                    return;
                }

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
});
