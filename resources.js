// Función para cargar recursos desde data.json
async function loadResources() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        return data.resources;
    } catch (error) {
        console.error('Error loading resources:', error);
        return [];
    }
}

// Función para renderizar recursos en el DOM
function renderResources(resources, filter = 'all') {
    const container = document.getElementById('resourcesContainer');
    if (!container) return;

    // Filtrar recursos si es necesario
    const filteredResources = filter === 'all'
        ? resources
        : resources.filter(resource => resource.type === filter);

    // Limpiar contenedor
    container.innerHTML = '';

    // Crear cards para cada recurso
    filteredResources.forEach(resource => {
        const card = createResourceCard(resource);
        container.appendChild(card);
    });

    // Actualizar contador de recursos
    updateResourceCount(filteredResources.length);
}

// Función para crear una card de recurso
function createResourceCard(resource) {
    const card = document.createElement('div');
    card.className = `resource-card glass-card p-8 rounded-2xl card-hover`;
    card.dataset.category = resource.type;
    card.dataset.id = resource.id;

    const badgeHTML = getBadgeHTML(resource.badge, resource.badgeColor);
    const typeIcon = getTypeIcon(resource.type);
    const statsHTML = getResourceStats(resource);

    card.innerHTML = `
        <div class="flex items-start space-x-4 mb-4">
            <div class="${getResourceBadgeClass(resource.type)} text-white px-3 py-1 rounded-full text-sm font-bold flex-shrink-0">
                ${typeIcon}
            </div>
            <div class="flex-1">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${resource.title}</h3>
                <p class="text-gray-600 mb-4">${resource.description}</p>
                ${statsHTML}
                <a href="${resource.url}" target="_blank" class="inline-block mt-4 btn-gradient text-white px-6 py-2 rounded-full font-medium text-sm">
                    ${getButtonLabel(resource.type)}
                </a>
            </div>
        </div>
    `;

    return card;
}

// Función para obtener el HTML del badge
function getBadgeHTML(badge, color) {
    if (!badge) return '';
    const badgeClass = getBadgeColorClass(color);
    return `<span class="${badgeClass} text-white px-3 py-1 rounded-full text-sm font-bold ml-2">${badge}</span>`;
}

// Función para obtener la clase de color del badge
function getBadgeColorClass(color) {
    const colorClasses = {
        'youtube': 'youtube-badge',
        'blog': 'blog-badge',
        'reddit': 'reddit-badge',
        'github': 'github-badge'
    };
    return colorClasses[color] || 'bg-gray-500';
}

// Función para obtener el ícono del tipo
function getTypeIcon(type) {
    const icons = {
        'youtube': '📺',
        'blog': '📖',
        'reddit': '💬',
        'github': '🐙'
    };
    return icons[type] || '📄';
}

// Función para obtener las estadísticas del recurso
function getResourceStats(resource) {
    let statsHTML = '<div class="flex items-center space-x-4 text-sm text-gray-500">';

    if (resource.type === 'youtube') {
        statsHTML += `
            <span>📺 ${resource.duration}</span>
            <span>👁️ ${formatNumber(resource.views)}</span>
            <span>⭐ ${resource.rating}/5</span>
        `;
    } else if (resource.type === 'blog') {
        statsHTML += `
            <span>📖 ${resource.readTime}</span>
            <span>👁️ ${formatNumber(resource.views)}</span>
            <span>⭐ ${resource.rating}/5</span>
        `;
    } else if (resource.type === 'reddit') {
        if (resource.members) {
            statsHTML += `
                <span>👥 ${formatNumber(resource.members)} miembros</span>
            `;
        } else {
            statsHTML += `
                <span>⬆️ ${formatNumber(resource.upvotes)}</span>
                <span>💬 ${resource.comments}</span>
            `;
        }
        statsHTML += `<span>⭐ ${resource.rating}/5</span>`;
    } else if (resource.type === 'github') {
        statsHTML += `
            <span>⭐ ${formatNumber(resource.stars)}</span>
            <span>🍴 ${formatNumber(resource.forks)}</span>
            <span>⭐ ${resource.rating}/5</span>
        `;
    }

    statsHTML += '</div>';
    return statsHTML;
}

// Función para obtener el label del botón
function getButtonLabel(type) {
    const labels = {
        'youtube': 'Ver Video',
        'blog': 'Leer Artículo',
        'reddit': 'Ver Discusión',
        'github': 'Ver Repositorio'
    };
    return labels[type] || 'Ver Recurso';
}

// Función para obtener la clase del badge de tipo
function getResourceBadgeClass(type) {
    const classes = {
        'youtube': 'youtube-badge',
        'blog': 'blog-badge',
        'reddit': 'reddit-badge',
        'github': 'github-badge'
    };
    return classes[type] || 'bg-gray-500';
}

// Función para formatear números
function formatNumber(num) {
    if (typeof num === 'string') return num;
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Función para actualizar el contador de recursos
function updateResourceCount(count) {
    const countElement = document.getElementById('resourceCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Función de búsqueda
function searchResources(resources, searchTerm) {
    if (!searchTerm) return resources;

    const term = searchTerm.toLowerCase();
    return resources.filter(resource => {
        const titleMatch = resource.title.toLowerCase().includes(term);
        const descMatch = resource.description.toLowerCase().includes(term);
        const tagsMatch = resource.tags.some(tag => tag.toLowerCase().includes(term));
        const authorMatch = resource.author.toLowerCase().includes(term);

        return titleMatch || descMatch || tagsMatch || authorMatch;
    });
}

// Función para inicializar filtros
function initializeFilters(resources) {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover clase active de todos
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.classList.add('bg-gray-100');
            });

            // Agregar clase active al botón clickeado
            btn.classList.add('active');
            btn.classList.remove('bg-gray-100');

            const filter = btn.dataset.filter;
            renderResources(resources, filter);
        });
    });
}

// Función para inicializar búsqueda
function initializeSearch(resources) {
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            const filtered = searchResources(resources, searchTerm);

            // Limpiar filtros visuales
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('bg-gray-100');
            });

            // Renderizar resultados filtrados
            renderResources(filtered);
        });
    }
}

// Función principal de inicialización
async function initializeResources() {
    // Cargar recursos
    const resources = await loadResources();

    if (resources.length === 0) {
        console.error('No resources found');
        return;
    }

    // Inicializar filtros
    initializeFilters(resources);

    // Inicializar búsqueda
    initializeSearch(resources);

    // Renderizar todos los recursos inicialmente
    renderResources(resources, 'all');

    console.log(`Loaded ${resources.length} resources`);
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeResources);
} else {
    initializeResources();
}

// Exportar funciones para uso global
window.resourceManager = {
    loadResources,
    renderResources,
    searchResources,
    initializeResources
};
