document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links li');
    const pages = document.querySelectorAll('.page');
    const checkboxes = document.querySelectorAll('.prog-chk');

    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Handle Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Ignore if clicking checkbox directly
            if (e.target.tagName === 'INPUT') return;

            // Remove active from all
            navLinks.forEach(nav => nav.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));

            // Add active to clicked
            link.classList.add('active');
            const targetId = link.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            // Close sidebar on mobile after clicking
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Handle Progress Tracking (localStorage)
    checkboxes.forEach(chk => {
        const id = chk.getAttribute('data-id');
        // Load saved state
        if (localStorage.getItem('cg_prog_' + id) === 'true') {
            chk.checked = true;
            chk.parentElement.style.opacity = '0.6';
            chk.parentElement.style.textDecoration = 'line-through';
        }

        // Save state on change
        chk.addEventListener('change', () => {
            localStorage.setItem('cg_prog_' + id, chk.checked);
            if (chk.checked) {
                chk.parentElement.style.opacity = '0.6';
                chk.parentElement.style.textDecoration = 'line-through';
            } else {
                chk.parentElement.style.opacity = '1';
                chk.parentElement.style.textDecoration = 'none';
            }
            window.dispatchEvent(new Event('analytics-update'));
        });
    });
});
