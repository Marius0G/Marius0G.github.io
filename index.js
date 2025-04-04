// Enhanced JavaScript for project cards functionality
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.querySelector('.menu-toggle');
    const body = document.body;
    const sidebar = document.querySelector('.sidebar');
    
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    body.appendChild(overlay);
    
    function toggleSidebar() {
        body.classList.toggle('sidebar-active');
    }
    
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }
    
    overlay.addEventListener('click', () => {
        body.classList.remove('sidebar-active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                body.classList.remove('sidebar-active');
            }
        });
    });
    
    function highlightCurrentSection() {
        let scrollPosition = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && body.classList.contains('sidebar-active')) {
            body.classList.remove('sidebar-active');
        }
    });
    
    // Project cards animation on scroll
    function animateProjectCards() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach((card, index) => {
            setTimeout(() => {
     
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                
           
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                            observer.unobserve(card);
                        }
                    });
                }, { threshold: 0.1 });
                
                observer.observe(card);
            }, index * 100); 
        });
    }
    
    
    if (document.querySelectorAll('.project-card').length > 0) {
        animateProjectCards();
    }
    
    window.addEventListener('scroll', highlightCurrentSection);
    highlightCurrentSection();
});