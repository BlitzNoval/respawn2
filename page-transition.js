document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-loaded');

    const transitionLinks = document.querySelectorAll('.page-transition');
    const overlay = document.querySelector('.page-transition-overlay');

    transitionLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');

            if (overlay) {
                overlay.classList.add('active');
            }

            setTimeout(() => {
                window.location.href = target;
            }, 500);
        });
    });
});
