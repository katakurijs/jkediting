// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax effect for floating cards
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const cards = document.querySelectorAll('.floating-card');
    
    cards.forEach((card, index) => {
        const speed = 0.5 + (index * 0.2);
        const yPos = -(scrollY * speed);
        card.style.transform = `translate(-50%, calc(-50% + ${yPos}px))`;
    });
    
    lastScrollY = scrollY;
});

// Animate stats on scroll
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const animateStats = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const stats = entry.target.querySelectorAll('.stat-number');
            stats.forEach(stat => {
                const finalValue = stat.textContent;
                stat.textContent = '0';
                
                const isPercentage = finalValue.includes('%');
                const numericValue = parseFloat(finalValue.replace(/[^\d.]/g, ''));
                const duration = 2000;
                const increment = numericValue / (duration / 16);
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= numericValue) {
                        stat.textContent = finalValue;
                        clearInterval(timer);
                    } else {
                        if (isPercentage) {
                            stat.textContent = current.toFixed(1) + '%';
                        } else if (finalValue.includes('K')) {
                            stat.textContent = Math.floor(current) + 'K+';
                        } else if (finalValue.includes('M')) {
                            stat.textContent = current.toFixed(1) + 'M+';
                        } else {
                            stat.textContent = Math.floor(current);
                        }
                    }
                }, 16);
            });
            
            observer.unobserve(entry.target);
        }
    });
};

const statsObserver = new IntersectionObserver(animateStats, observerOptions);
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Fade in feature cards on scroll
const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            fadeInObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    fadeInObserver.observe(card);
});

// Add navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(15, 15, 30, 0.95)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(15, 15, 30, 0.8)';
        navbar.style.boxShadow = 'none';
    }
});