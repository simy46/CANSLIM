export function listenToNavEvents() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.main-content section');

    // Fonction pour masquer toutes les sections
    function hideAllSections() {
        sections.forEach(section => {
            section.style.display = 'none';
        });
    }

    // Fonction pour afficher une section
    function showSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    }

    // Fonction pour gérer l'activation de la navigation
    function activateNavItem(navItem) {
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        navItem.classList.add('active');
    }

    // Ajouter des gestionnaires de clic aux éléments de navigation
    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            const navItemId = event.target.id;
            const sectionId = navItemId.replace('nav-', '') + '-section';

            hideAllSections();
            showSection(sectionId);
            activateNavItem(event.target);
        });
    });

    // Initialiser l'affichage pour montrer la section Overview par défaut
    hideAllSections();
    showSection('overview-section');
}