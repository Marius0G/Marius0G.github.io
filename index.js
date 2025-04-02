// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get all sections that we want to track
    const sections = document.querySelectorAll('section[id]');
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Function to update active menu item
    function highlightCurrentSection() {
        // Get current scroll position
        let scrollPosition = window.scrollY;
        
        // Loop through sections to find which one is in view
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // Offset for earlier highlight
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to the corresponding nav link
                document.querySelector(`.nav-link[href="#${sectionId}"]`).classList.add('active');
            }
        });
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', highlightCurrentSection);
    
    // Call once on page load to set initial state
    highlightCurrentSection();
});