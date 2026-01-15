document.addEventListener('DOMContentLoaded', () => {

    // Mobile Menu
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');

    function toggleMenu() {
        if (mobileMenu && overlay) {
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }

    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);

    // Hero Slider
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // --- Enhanced Animation System ---
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const anim = el.dataset.animate || 'fade-up';
                // Read Delay (default 0)
                const delay = el.dataset.delay || 0;

                // Apply specific animation props
                el.style.animationName = anim; // keyframe name
                el.style.animationDuration = '0.8s';
                el.style.animationTimingFunction = 'ease-out';
                el.style.animationFillMode = 'forwards';
                el.style.animationDelay = `${delay}ms`;

                // Add visible class to trigger if CSS handles generic 'visible' state
                el.classList.add('visible');
                // Ensure opacity is handled by keyframe, but if not started, set to 1 after
                // el.style.opacity = '1'; // Handled by keyframes (end state)

                // Counter Logic (if present inside)
                const counters = el.querySelectorAll('[data-counter]');
                if (eleHasCounter(el)) {
                    // If the element itself is a counter
                    runCounter(el);
                }
                counters.forEach(counter => runCounter(counter));

                animationObserver.unobserve(el);
            }
        });
    }, { threshold: 0.1 });

    function eleHasCounter(el) {
        return el.hasAttribute('data-counter');
    }

    function runCounter(counter) {
        const target = parseInt(counter.dataset.counter);
        if (isNaN(target)) return;

        let count = 0;
        const duration = 2000; // 2s
        const interval = 20;
        const steps = duration / interval;
        const increment = target / steps;

        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                counter.innerText = target; // Final clean number
                clearInterval(timer);
            } else {
                counter.innerText = Math.floor(count);
            }
        }, interval);
    }

    // Initialize all animated elements
    // We select both .fade-up (legacy) and [data-animate] elements
    // Note: Legacy .fade-up elements might not have data-animate, so we default to fade-up in observer
    const animElements = document.querySelectorAll('.fade-up, [data-animate], .animated');
    animElements.forEach(el => {
        el.style.opacity = '0'; // Ensure hidden initially
        animationObserver.observe(el);
    });

    // Tilt Effect (3D Hover)
    document.querySelectorAll('.tilt-effect').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation (max +/- 5 deg)
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'none';
        });

        card.style.transition = 'transform 0.1s ease-out';
    });


    // Before/After Slider
    const sliders = document.querySelectorAll('.before-after-slider');
    sliders.forEach(slider => {
        const move = (e) => {
            const rect = slider.getBoundingClientRect();
            // Handle both mouse and touch events
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;

            let x = clientX - rect.left;
            if (x < 0) x = 0;
            if (x > rect.width) x = rect.width;

            const percent = (x / rect.width) * 100;
            const afterImage = slider.querySelector('.after-image');
            const handle = slider.querySelector('.slider-handle');

            if (afterImage) afterImage.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
            if (handle) handle.style.left = `${percent}%`;
        };

        slider.addEventListener('mousemove', move);
        slider.addEventListener('touchmove', move);
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // Chat Widget
    const chatButton = document.getElementById('chatButton');
    const stickyChatBtn = document.getElementById('stickyChatBtn');
    const chatWindow = document.getElementById('chatWindow');
    const chatCloseBtn = document.getElementById('chatCloseBtn');

    function toggleChat() {
        if (chatWindow) chatWindow.classList.toggle('open');
    }

    if (chatButton) chatButton.addEventListener('click', toggleChat);
    if (stickyChatBtn) stickyChatBtn.addEventListener('click', toggleChat);
    if (chatCloseBtn) chatCloseBtn.addEventListener('click', toggleChat);

    // Sticky Action Bar Visibility
    const stickyBar = document.getElementById('stickyActionBar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (stickyBar) {
            // Show only after scrolling down 300px
            if (currentScroll > 300) {
                stickyBar.classList.remove('hidden');
            } else {
                stickyBar.classList.add('hidden');
            }
        }
    });

    // Countdown Modal
    const modal = document.getElementById('countdownModal');
    const modalClose = document.getElementById('countdownClose');

    if (modal && !sessionStorage.getItem('countdownShown')) {
        setTimeout(() => {
            modal.classList.add('visible');
            sessionStorage.setItem('countdownShown', 'true');
        }, 5000);
    }

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('visible');
        });
    }

    // Testimonial Slider
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');

    if (track && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -350, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: 350, behavior: 'smooth' });
        });
    }
});
