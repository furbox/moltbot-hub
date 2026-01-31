// Función para normalizar recursos del crawler al formato esperado
export function normalizeResource(resource) {
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
        'docs': 'docs',
        'website': 'docs',
        'tweet': 'tweet'
    };

    const normalizedType = typeMap[resource.type] || resource.type;

    // Extraer video ID de YouTube si existe
    let videoId = null;
    if (normalizedType === 'youtube' && resource.url) {
        const match = resource.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (match) {
            videoId = match[1];
        }
    }

    // Generar badge basado en el tipo
    const badgeMap = {
        'youtube': '📺 Video',
        'blog': '📖 Artículo',
        'reddit': '💬 Discusión',
        'github': '🐙 Repositorio',
        'docs': '📚 Documentación',
        'tweet': '🐦 Tweet'
    };

    return {
        id: resource.id || resource.url,
        title: resource.title,
        description: resource.description || resource.snippet || '',
        url: resource.url,
        type: normalizedType,
        badge: badgeMap[normalizedType] || '📄 Recurso',
        author: metadata.author || metadata.uploader || resource.author || null,
        date: resource.publishedAt || resource.date || null,
        videoId: videoId,
        source: resource.source_project || resource.source || 'crawler',
        metadata: metadata,
        // Stats
        duration: metadata.duration || resource.duration || null,
        views: metadata.views || resource.views || null,
        rating: metadata.rating || resource.rating || null,
        stars: metadata.stars || resource.stars || null,
        forks: metadata.forks || resource.forks || null,
        upvotes: metadata.upvotes || resource.upvotes || null,
        comments: metadata.comments || resource.comments || null,
        likes: metadata.likes || resource.likes || null,
        retweets: metadata.retweets || resource.retweets || null,
        replies: metadata.replies || resource.replies || null,
        members: metadata.members || resource.members || null,
        readTime: metadata.reading_time || resource.readTime || null
    };
}

// Función para cargar recursos desde data.json
export async function loadResources() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Si data tiene una propiedad resources, usarla, si no, data es el array
        const resources = data.resources || data;
        
        // Normalizar todos los recursos
        return resources.map(r => normalizeResource(r));
    } catch (error) {
        console.error('Error loading resources:', error);
        return [];
    }
}

// Función para formatear números
export function formatNumber(num) {
    if (typeof num === 'string') return num;
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Función para crear una card de recurso (para compatibilidad)
export function createResourceCard(resource) {
    const card = document.createElement('div');
    card.className = `resource-card glass-card p-6 rounded-2xl card-hover`;
    card.dataset.category = resource.type;
    card.dataset.id = resource.id;

    const badgeClass = `badge-${resource.type}`;
    const typeIcon = {
        'youtube': '📺',
        'blog': '📖',
        'reddit': '💬',
        'github': '🐙',
        'docs': '📚',
        'tweet': '🐦'
    }[resource.type] || '📄';

    // YouTube video embed
    let videoEmbed = '';
    if (resource.type === 'youtube' && resource.videoId) {
        videoEmbed = `
            <lite-youtube videoid="${resource.videoId}" videotitle="${resource.title}" videoplay="Ver Video">
                <a class="lite-youtube-fallback" href="${resource.url}" target="_blank">
                    Ver en YouTube
                </a>
            </lite-youtube>
        `;
    }

    // Stats HTML
    let statsHTML = '<div class="flex items-center gap-3 text-xs text-gray-500 mb-3">';
    
    if (resource.type === 'youtube') {
        if (resource.duration) statsHTML += `<span>⏱️ ${resource.duration}</span>`;
        if (resource.views) statsHTML += `<span>👁️ ${formatNumber(resource.views)}</span>`;
    } else if (resource.type === 'blog' || resource.type === 'docs') {
        if (resource.readTime) statsHTML += `<span>📖 ${resource.readTime} min</span>`;
        if (resource.views) statsHTML += `<span>👁️ ${formatNumber(resource.views)}</span>`;
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
    }
    
    statsHTML += '</div>';

    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <span class="badge ${badgeClass}">${typeIcon} ${resource.type.toUpperCase()}</span>
            <span class="text-xs text-gray-500">${resource.source || 'manual'}</span>
        </div>
        
        <h3 class="text-lg font-bold text-white mb-3 leading-tight">${resource.title}</h3>
        
        ${resource.description ? `<p class="text-gray-400 text-sm mb-3 line-clamp-3">${resource.description}</p>` : ''}
        
        ${resource.author ? `<p class="text-xs text-gray-500 mb-3">Por: ${resource.author}</p>` : ''}
        
        ${statsHTML}
        
        ${videoEmbed}
        
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <a href="${resource.url}" target="_blank" class="text-purple-400 hover:text-purple-300 text-sm font-medium transition">
                Ver recurso →
            </a>
            ${resource.date ? `<span class="text-xs text-gray-500">${new Date(resource.date).toLocaleDateString('es-ES')}</span>` : ''}
        </div>
    `;

    return card;
}

// Función de búsqueda
export function searchResources(resources, searchTerm) {
    if (!searchTerm) return resources;

    const term = searchTerm.toLowerCase();
    return resources.filter(resource => {
        const titleMatch = resource.title && resource.title.toLowerCase().includes(term);
        const descMatch = resource.description && resource.description.toLowerCase().includes(term);
        const authorMatch = resource.author && resource.author.toLowerCase().includes(term);

        return titleMatch || descMatch || authorMatch;
    });
}

// Exportar funciones para uso global (compatibilidad con código no-module)
if (typeof window !== 'undefined') {
    window.resourceManager = {
        loadResources,
        normalizeResource,
        createResourceCard,
        searchResources,
        formatNumber
    };
}
