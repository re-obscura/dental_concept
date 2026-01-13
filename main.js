// Init AOS Animation Library
AOS.init({
    once: true,
    offset: 50,
    duration: 800,
    easing: 'ease-out-cubic',
});

function updateThemeIcons(isDark) {
    const themeIcons = document.querySelectorAll('.theme-icon');
    themeIcons.forEach(icon => {
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeIcons(isDark);
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
}

// Run theme init early
initTheme();

// Mobile Menu Logic
const mobileBtn = document.getElementById('mobile-btn');
const mobileMenu = document.getElementById('mobile-menu');

function toggleMenu() {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
    const isExpanded = mobileMenu.classList.contains('flex');
    mobileBtn.setAttribute('aria-expanded', isExpanded);
    mobileMenu.setAttribute('aria-hidden', !isExpanded);

    const icon = mobileBtn.querySelector('i');
    if (isExpanded) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    }
}

function closeMenu() {
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
    mobileBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileBtn.querySelector('i').classList.add('fa-bars');
    mobileBtn.querySelector('i').classList.remove('fa-times');
}

mobileBtn.addEventListener('click', toggleMenu);

// === SMART STICKY NAVBAR LOGIC ===
const nav = document.getElementById('navbar');
const logoIcon = document.getElementById('logo-icon');
const logoText = document.getElementById('logo-text');

window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        // Scrolled State
        nav.classList.add('scrolled', 'shadow-md', 'h-16');
        nav.classList.remove('h-24');

        // Logo Shrink
        logoIcon.classList.add('scale-75');
        logoText.classList.add('opacity-0', 'w-0', 'h-0', 'overflow-hidden'); // Hide text for cleaner look, or just scale down
    } else {
        // Top State
        nav.classList.remove('scrolled', 'shadow-md', 'h-16');
        nav.classList.add('h-24');

        // Logo Restore
        logoIcon.classList.remove('scale-75');
        logoText.classList.remove('opacity-0', 'w-0', 'h-0', 'overflow-hidden');
    }
});

// === NUMBER COUNTER ANIMATION ===
const counters = document.querySelectorAll('.counter');
const speed = 200; // The lower the slower

const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;

            // Lower inc to slow and higher to slow
            const inc = target / speed;

            if (count < target) {
                // Add inc to count and output in counter
                counter.innerText = Math.ceil(count + inc);
                // Call function every ms
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

// Trigger Counter Animation when section is in view
let counted = false;
const statsSection = document.getElementById('stats-section');

window.addEventListener('scroll', () => {
    if (!statsSection) return;
    const sectionPos = statsSection.getBoundingClientRect().top;
    const screenPos = window.innerHeight / 1.3;

    if (sectionPos < screenPos && !counted) {
        animateCounters();
        counted = true;
    }
});

// === COMPARISON SLIDER SCRIPT (HOVER VERSION) ===
function initComparisons() {
    var x, i;
    x = document.getElementsByClassName("img-comp-overlay");
    for (i = 0; i < x.length; i++) {
        compareImages(x[i]);
    }

    function compareImages(img) {
        var slider, w, h, container, overlayImage;

        // Set initial width to container width
        w = img.offsetWidth;
        h = img.offsetHeight;

        // Explicitly set the width of the image inside the overlay to the full container width
        // This prevents the image from squishing when the overlay wrapper shrinks
        overlayImage = img.querySelector('img');
        if (overlayImage) {
            overlayImage.style.width = w + "px";
            overlayImage.style.maxWidth = "none"; // Ensure no CSS overrides this
        }

        // Initial slider position (50%)
        img.style.width = (w / 2) + "px";

        /* Get the container */
        container = img.parentElement;

        /*create slider:*/
        slider = document.createElement("DIV");
        slider.setAttribute("class", "img-comp-slider");
        slider.innerHTML = '<i class="fas fa-arrows-alt-h text-stone-400"></i>';

        container.insertBefore(slider, img);

        slider.style.top = (h / 2) + "px";
        slider.style.left = (w / 2) + "px";

        /* Events for the container to track movement */
        container.addEventListener("mousemove", slideMove);
        container.addEventListener("touchmove", slideMove); // Keep touch drag for mobile

        function slideMove(e) {
            var pos;
            // Prevent default only on touch to stop scrolling while sliding
            if (e.type === 'touchmove') {
                // e.preventDefault(); // Optional: might block scrolling page
            }

            pos = getCursorPos(e);
            if (pos < 0) pos = 0;
            if (pos > w) pos = w;
            slide(pos);
        }

        function getCursorPos(e) {
            var a, x = 0;
            e = (e.changedTouches) ? e.changedTouches[0] : e;
            a = img.getBoundingClientRect();
            x = e.pageX - a.left;
            x = x - window.pageXOffset;
            return x;
        }

        function slide(x) {
            img.style.width = x + "px";
            slider.style.left = x + "px";
        }
    }
}

// Run comparison script after load
window.addEventListener('load', initComparisons);

// === FORM HANDLING ===
function handleQuickContact(e) {
    e.preventDefault();
    const phoneInput = document.getElementById('contact-phone');
    const successMsg = document.getElementById('form-success-msg');

    if (phoneInput.value.length < 5) return; // Basic validation

    // Simulate API call
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;

    btn.innerText = 'Sending...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
        phoneInput.value = '';

        // Show success message
        successMsg.classList.remove('hidden');
        successMsg.classList.add('animate-fade-in');

        // Hide after 5 seconds
        setTimeout(() => {
            successMsg.classList.add('hidden');
        }, 5000);
    }, 1000);
}

// === BOOKING MODAL LOGIC ===
const bookingModal = document.getElementById('booking-modal');
const modalContent = document.getElementById('modal-content');
const modalForm = document.getElementById('modal-booking-form');
const modalSuccess = document.getElementById('modal-success');
const closeModalBtn = document.getElementById('close-modal');
const modalBackdrop = document.getElementById('modal-backdrop');

function openBookingModal() {
    bookingModal.classList.remove('hidden');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => {
        bookingModal.classList.add('modal-open');
    }, 10);
    // Focus first input or close button for accessibility
    const firstInput = modalForm ? modalForm.querySelector('input') : null;
    if (firstInput) firstInput.focus();
}

function closeBookingModal() {
    bookingModal.classList.remove('modal-open');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
        bookingModal.classList.add('hidden');
        // Reset form for next time
        if (modalForm) {
            modalForm.classList.remove('hidden');
            modalForm.reset();
        }
        if (modalSuccess) {
            modalSuccess.classList.add('hidden');
        }
    }, 300);
}

// Close on backdrop click
if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeBookingModal);
}

// Close on X button
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeBookingModal);
}

// Close on ESC key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal && !bookingModal.classList.contains('hidden')) {
        closeBookingModal();
    }
});

// Modal Form Submission
if (modalForm) {
    modalForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        const originalText = submitBtn.innerText;

        submitBtn.innerText = 'Processing...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            modalForm.classList.add('hidden');
            if (modalSuccess) {
                modalSuccess.classList.remove('hidden');
                modalSuccess.classList.add('animate-fade-in');
            }

            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
}
