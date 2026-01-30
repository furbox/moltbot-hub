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

// Función para normalizar recursos del crawler al formato esperado
function normalizeResource(resource) {
    // Extraer metadata si existe
    const metadata = resource.metadata || {};

    // Mapear tipos
    const typeMap = {
        'youtube': 'youtube',
        'blog': 'blog',
        'reddit_link': 'reddit',
        'reddit_self': 'reddit',
        'reddit': 'reddit',
        'reddit_image': 'reddit',
        'github': 'github',
        'docs': 'blog',
        'website': 'blog',
        'tweet': 'tweet'
    };

    const normalizedType = typeMap[resource.type] || resource.type;

    // Extraer stats según el tipo
    let stats = {
        duration: null,
        views: null,
        rating: null,
        stars: null,
        forks: null,
        upvotes: null,
        comments: null,
        members: null,
        readTime: null
    };

    if (normalizedType === 'youtube') {
        stats.duration = metadata.duration || resource.duration || null;
        stats.views = metadata.views || resource.views || null;
        stats.rating = metadata.rating || resource.rating || null;
    } else if (normalizedType === 'github') {
        stats.stars = metadata.stars || resource.stars || null;
        stats.forks = metadata.forks || resource.forks || null;
    } else if (normalizedType === 'reddit') {
        stats.upvotes = metadata.upvotes || resource.upvotes || null;
        stats.comments = metadata.comments || resource.comments || null;
        stats.members = metadata.members || resource.members || null;
    } else if (normalizedType === 'blog') {
        stats.readTime = metadata.reading_time || resource.readTime || null;
        stats.views = metadata.views || resource.views || null;
    }

    // Generar badge basado en el tipo
    const badgeMap = {
        'youtube': 'Video',
        'blog': 'Artículo',
        'reddit': 'Discusión',
        'github': 'Repositorio',
        'tweet': 'Tweet'
    };

    return {
        ...resource,
        type: normalizedType,
        badge: badgeMap[normalizedType] || 'Recurso',
        badgeColor: normalizedType,
        author: metadata.author || metadata.uploader || resource.author || 'Desconocido',
        ...stats
    };
}

// Función para renderizar recursos en el DOM
function renderResources(resources, filter = 'all') {
    const container = document.getElementById('resourcesContainer');
    if (!container) return;

    // Normalizar recursos
    const normalizedResources = resources.map(r => normalizeResource(r));

    // Filtrar recursos si es necesario
    const filteredResources = filter === 'all'
        ? normalizedResources
        : normalizedResources.filter(resource => resource.type === filter);

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
        'github': '🐙',
        'tweet': '🐦'
    };
    return icons[type] || '📄';
}

// Función para obtener las estadísticas del recurso
function getResourceStats(resource) {
    let statsHTML = '<div class="flex items-center space-x-4 text-sm text-gray-500">';

    if (resource.type === 'youtube') {
        if (resource.duration) statsHTML += `<span>📺 ${resource.duration}</span>`;
        if (resource.views) statsHTML += `<span>👁️ ${formatNumber(resource.views)}</span>`;
        if (resource.rating) statsHTML += `<span>⭐ ${resource.rating}/5</span>`;
    } else if (resource.type === 'blog') {
        if (resource.readTime) statsHTML += `<span>📖 ${resource.readTime} min</span>`;
        if (resource.views) statsHTML += `<span>👁️ ${formatNumber(resource.views)}</span>`;
        if (resource.rating) statsHTML += `<span>⭐ ${resource.rating}/5</span>`;
    } else if (resource.type === 'reddit') {
        if (resource.members) {
            statsHTML += `<span>👥 ${formatNumber(resource.members)} miembros</span>`;
        } else {
            if (resource.upvotes) statsHTML += `<span>⬆️ ${formatNumber(resource.upvotes)}</span>`;
            if (resource.comments) statsHTML += `<span>💬 ${formatNumber(resource.comments)}</span>`;
        }
    } else if (resource.type === 'github') {
        if (resource.stars) statsHTML += `<span>⭐ ${formatNumber(resource.stars)}</span>`;
        if (resource.forks) statsHTML += `<span>🍴 ${formatNumber(resource.forks)}</span>`;
    } else if (resource.type === 'tweet') {
        if (resource.likes) statsHTML += `<span>❤️ ${formatNumber(resource.likes)}</span>`;
        if (resource.retweets) statsHTML += `<span>🔄 ${formatNumber(resource.retweets)}</span>`;
        if (resource.replies) statsHTML += `<span>💬 ${formatNumber(resource.replies)}</span>`;
        if (resource.author) statsHTML += `<span>👤 ${resource.author}</span>`;
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
        'github': 'Ver Repositorio',
        'tweet': 'Ver Tweet'
    };
    return labels[type] || 'Ver Recurso';
}

// Función para obtener la clase del badge de tipo
function getResourceBadgeClass(type) {
    const classes = {
        'youtube': 'youtube-badge',
        'blog': 'blog-badge',
        'reddit': 'reddit-badge',
        'github': 'github-badge',
        'tweet': 'tweet-badge'
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
        const tagsMatch = resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(term));
        const authorMatch = resource.author && resource.author.toLowerCase().includes(term);

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

    console.log(`Loaded ${resources.length} resources from crawler`);

    // Inicializar filtros
    initializeFilters(resources);

    // Inicializar búsqueda
    initializeSearch(resources);

    // Renderizar todos los recursos inicialmente
    renderResources(resources, 'all');
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
