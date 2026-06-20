// script.js - COMPLETE FIXED VERSION
// NO MORE HTTP 400 ERRORS!

// ===================== CONFIGURATION =====================
// ⚠️ CHANGE THIS TO YOUR API URL!
const API_BASE_URL = 'https://ytdlp-enhanced.vercel.app'; // CHANGE THIS!

console.log('🚀 YouTube Clone Starting...');
console.log('🔗 API URL:', API_BASE_URL);

// ===================== API CALLS =====================
async function callAPI(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}${endpoint}?${queryString}`;
    
    console.log(`📡 Calling: ${url}`);
    
    try {
        const response = await fetch(url);
        console.log(`📡 Status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ HTTP ${response.status}: ${errorText}`);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`📡 Response:`, data);
        return data;
    } catch (error) {
        console.error('❌ API Error:', error);
        return { error: error.message };
    }
}

// ===================== UTILITY FUNCTIONS =====================
function timeAgo(dateString) {
    if (!dateString) return 'Just now';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
        if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
        if (diff < 2592000) return Math.floor(diff / 604800) + 'w ago';
        if (diff < 31536000) return Math.floor(diff / 2592000) + 'mo ago';
        return Math.floor(diff / 31536000) + 'y ago';
    } catch {
        return 'Just now';
    }
}

function formatNumber(num) {
    if (!num) return '0';
    const n = parseInt(num);
    if (isNaN(n)) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

// ===================== LOAD TRENDING VIDEOS =====================
async function loadTrending() {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;
    
    console.log('📺 Loading trending videos...');
    
    videoGrid.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading trending videos...</p>
        </div>
    `;
    
    // ✅ CORRECT: /trending?region=IN&max=20
    const data = await callAPI('/trending', { region: 'IN', max: 20 });
    
    if (data.error) {
        console.error('❌ Trending error:', data.error);
        videoGrid.innerHTML = `
            <div style="text-align:center;padding:40px;color:#606060;">
                <i class="fas fa-exclamation-circle" style="font-size:40px;margin-bottom:12px;"></i>
                <p>Failed to load videos: ${data.error}</p>
                <p style="font-size:14px;margin-top:8px;">Check API URL in script.js</p>
            </div>
        `;
        return;
    }
    
    const videos = data.videos || [];
    
    if (videos.length === 0) {
        videoGrid.innerHTML = `
            <div style="text-align:center;padding:40px;color:#606060;">
                <i class="fas fa-video-slash" style="font-size:40px;margin-bottom:12px;"></i>
                <p>No videos found</p>
            </div>
        `;
        return;
    }
    
    console.log(`✅ Loaded ${videos.length} videos`);
    renderVideoGrid(videos);
}

// ===================== RENDER VIDEO GRID =====================
function renderVideoGrid(videos) {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;
    
    videoGrid.innerHTML = videos.map(video => {
        // ✅ CORRECT field names from your API
        const videoId = video.video_id;
        const title = video.title || 'Untitled';
        const thumbnail = video.thumbnail || 'https://via.placeholder.com/300x169';
        const channelTitle = video.channel_title || 'Unknown Channel';
        const channelId = video.channel_id || '';
        const views = video.views || '0';
        const publishedAt = video.published_at || '';
        const directStream = video.direct_stream;
        const duration = video.duration || '10:00';
        
        return `
        <div class="video-card" onclick="navigateToWatch('${videoId}')">
            <div class="video-thumbnail">
                <img src="${thumbnail}" alt="${title}" loading="lazy">
                <span class="video-duration">${duration}</span>
                ${directStream ? '<span style="position:absolute;top:8px;left:8px;background:#4CAF50;color:white;padding:2px 8px;border-radius:12px;font-size:11px;"><i class="fas fa-play"></i> Direct</span>' : ''}
            </div>
            <div class="video-info">
                <div class="channel-avatar">
                    <img src="${video.channel_thumbnail || 'https://via.placeholder.com/40'}" alt="${channelTitle}">
                </div>
                <div class="video-details">
                    <h3 class="video-title">
                        <a href="watch.html?v=${videoId}">${title}</a>
                    </h3>
                    <p class="channel-name">
                        <a href="channel.html?channel_id=${channelId}">${channelTitle}</a>
                    </p>
                    <p class="video-meta">
                        <span>${formatNumber(views)} views</span>
                        <span>•</span>
                        <span>${timeAgo(publishedAt)}</span>
                    </p>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// ===================== LOAD VIDEO (FIXED) =====================
async function loadVideo(videoId) {
    console.log('🔍 Loading video ID:', videoId);
    
    if (!videoId) {
        console.error('❌ No video ID provided!');
        document.getElementById('videoPlayer').innerHTML = `
            <div class="video-placeholder">
                <i class="fas fa-exclamation-circle"></i>
                <p>No video ID provided</p>
            </div>
        `;
        return;
    }
    
    // Update URL
    if (history.pushState) {
        const newUrl = `${window.location.pathname}?v=${videoId}`;
        history.pushState(null, '', newUrl);
    }
    
    // Show loading state
    document.getElementById('videoPlayer').innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading video...</p>
        </div>
    `;
    
    document.getElementById('videoTitle').textContent = 'Loading...';
    document.getElementById('pageTitle').textContent = 'YouTube Clone - Loading...';
    
    // ✅ FIXED: Correct parameters for your API
    // Your API expects: /video?id=VIDEO_ID&quality=highest
    const data = await callAPI('/video', { 
        id: videoId,           // ✅ "id" NOT "video_id"
        quality: 'highest'     // ✅ Include quality
    });
    
    console.log('📺 Video Data:', data);
    
    if (data.error || !data.video_id) {
        console.error('❌ Video not found:', data.error);
        document.getElementById('videoPlayer').innerHTML = `
            <div class="video-placeholder">
                <i class="fas fa-exclamation-circle"></i>
                <p>Video not found</p>
                <p style="font-size:14px;color:#888;margin-top:8px;">Video ID: ${videoId}</p>
                <p style="font-size:14px;color:#888;">Error: ${data.error || 'Unknown error'}</p>
            </div>
        `;
        document.getElementById('videoTitle').textContent = 'Video not found';
        return;
    }
    
    // Update page title
    document.getElementById('pageTitle').textContent = `YouTube Clone - ${data.title}`;
    
    // Render video player
    renderVideoPlayer(data);
    
    // Load related videos - FIXED: Use video_id parameter
    loadRelatedVideos(videoId);
    
    // Load comments - FIXED: Use video_id parameter
    loadComments(videoId);
}

// ===================== RENDER VIDEO PLAYER =====================
function renderVideoPlayer(video) {
    const playerContainer = document.getElementById('videoPlayer');
    
    // ✅ CORRECT: Your API returns direct_stream
    const stream = video.direct_stream;
    
    if (stream && stream.url) {
        console.log('✅ Stream URL found:', stream.url);
        playerContainer.innerHTML = `
            <video class="video-player" controls autoplay>
                <source src="${stream.url}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
        
        // Show stream info
        const streamInfo = document.getElementById('streamInfo');
        streamInfo.style.display = 'block';
        document.getElementById('streamQuality').textContent = stream.quality || 'Unknown';
        document.getElementById('streamSource').textContent = stream.source || 'Unknown';
        document.getElementById('streamDownloadLink').href = stream.url;
        document.getElementById('downloadBtn').style.display = 'flex';
    } else {
        console.warn('⚠️ No stream available');
        playerContainer.innerHTML = `
            <div class="video-placeholder">
                <i class="fas fa-play-circle"></i>
                <p>Stream not available</p>
                <p style="font-size:14px;color:#888;margin-top:8px;">Try a different quality</p>
            </div>
        `;
        document.getElementById('streamInfo').style.display = 'none';
        document.getElementById('downloadBtn').style.display = 'none';
    }
    
    // ✅ CORRECT: Your API has statistics object
    document.getElementById('videoTitle').textContent = video.title || 'Untitled';
    document.getElementById('videoDescription').textContent = video.description || 'No description available';
    
    const stats = video.statistics || {};
    document.getElementById('viewCount').textContent = formatNumber(stats.views || '0') + ' views';
    document.getElementById('likeCount').textContent = formatNumber(stats.likes || '0');
    document.getElementById('dislikeCount').textContent = formatNumber(stats.dislikes || '0');
    document.getElementById('publishDate').textContent = timeAgo(video.published_at);
    
    // Update channel info
    document.getElementById('channelName').textContent = video.channel_title || 'Unknown Channel';
    document.getElementById('channelAvatar').src = video.thumbnail || 'https://via.placeholder.com/40';
    document.getElementById('subscriberCount').textContent = '0 subscribers';
    
    // Update comment count
    document.getElementById('commentCount').textContent = formatNumber(stats.comments || '0') + ' Comments';
}

// ===================== LOAD RELATED VIDEOS (FIXED) =====================
async function loadRelatedVideos(videoId) {
    const container = document.getElementById('relatedVideos');
    container.innerHTML = `
        <div class="loading-spinner small">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading related videos...</p>
        </div>
    `;
    
    // ✅ FIXED: Your API expects /related?video_id=VIDEO_ID&max=20
    const data = await callAPI('/related', { 
        video_id: videoId,  // ✅ "video_id" NOT "id"
        max: 20 
    });
    
    console.log('📺 Related Videos:', data);
    
    if (data.error || !data.related_videos) {
        container.innerHTML = `<p style="color:#606060;">No related videos found</p>`;
        return;
    }
    
    const videos = data.related_videos || [];
    
    if (videos.length === 0) {
        container.innerHTML = `<p style="color:#606060;">No related videos found</p>`;
        return;
    }
    
    container.innerHTML = videos.map(video => {
        const videoId = video.video_id;
        const title = video.title || 'Untitled';
        const thumbnail = video.thumbnail || 'https://via.placeholder.com/168x94';
        const channelTitle = video.channel_title || 'Unknown Channel';
        const views = video.views || '0';
        const publishedAt = video.published_at || '';
        const duration = video.duration || '10:00';
        
        return `
        <div class="related-video" onclick="navigateToWatch('${videoId}')">
            <div class="related-thumbnail">
                <img src="${thumbnail}" alt="${title}" loading="lazy">
                <span class="video-duration">${duration}</span>
            </div>
            <div class="related-info">
                <h4 class="related-title">
                    <a href="watch.html?v=${videoId}">${title}</a>
                </h4>
                <p class="related-channel">${channelTitle}</p>
                <p class="related-meta">
                    <span>${formatNumber(views)} views</span>
                    <span>•</span>
                    <span>${timeAgo(publishedAt)}</span>
                </p>
            </div>
        </div>
        `;
    }).join('');
}

// ===================== LOAD COMMENTS (FIXED) =====================
async function loadComments(videoId) {
    console.log('💬 Loading comments for:', videoId);
    
    const container = document.getElementById('commentsList');
    container.innerHTML = `
        <div class="loading-spinner small">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading comments...</p>
        </div>
    `;
    
    // ✅ FIXED: Your API expects /comments?video_id=VIDEO_ID&max=20
    const data = await callAPI('/comments', { 
        video_id: videoId,  // ✅ "video_id" NOT "video"
        max: 20 
    });
    
    console.log('📝 Comments Data:', data);
    
    if (data.error) {
        console.error('❌ Comments error:', data.error);
        container.innerHTML = `<p style="color:#606060;text-align:center;">Error loading comments: ${data.error}</p>`;
        return;
    }
    
    const comments = data.comments || [];
    
    if (comments.length === 0) {
        container.innerHTML = `<p style="color:#606060;text-align:center;">No comments yet</p>`;
        return;
    }
    
    container.innerHTML = comments.map(comment => {
        const author = comment.author || 'Unknown User';
        const text = comment.text || 'No comment text';
        const likes = comment.likes || '0';
        const publishedAt = comment.published_at || '';
        const replies = comment.replies || [];
        const replyCount = comment.reply_count || 0;
        
        return `
        <div class="comment-item">
            <div class="comment-avatar">
                <img src="https://via.placeholder.com/40" alt="${author}">
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${author}</span>
                    <span class="comment-time">${timeAgo(publishedAt)}</span>
                </div>
                <p class="comment-text">${text}</p>
                <div class="comment-actions">
                    <button class="comment-like-btn" onclick="likeComment(this)">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${likes}</span>
                    </button>
                    <button class="comment-reply-btn">Reply</button>
                </div>
                ${replies.length > 0 ? `
                <div class="replies-section">
                    <button class="show-replies-btn" onclick="toggleReplies(this)">
                        <i class="fas fa-caret-down"></i>
                        Show ${replyCount || replies.length} replies
                    </button>
                    <div class="replies-list" style="display:none;">
                        ${replies.map(reply => `
                            <div class="reply-item">
                                <div class="reply-avatar">
                                    <img src="https://via.placeholder.com/30" alt="${reply.author}">
                                </div>
                                <div class="reply-content">
                                    <div class="reply-header">
                                        <span class="reply-author">${reply.author}</span>
                                        <span class="reply-time">${timeAgo(reply.published_at)}</span>
                                    </div>
                                    <p class="reply-text">${reply.text}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
        `;
    }).join('');
}

// ===================== LOAD CHANNEL (FIXED) =====================
async function loadChannel(channelId) {
    const container = document.getElementById('channelContainer');
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading channel...</p>
        </div>
    `;
    
    // ✅ FIXED: Your API expects /channel?id=CHANNEL_ID&max=20
    const data = await callAPI('/channel', { 
        id: channelId,      // ✅ "id" NOT "channel_id"
        max: 20 
    });
    
    console.log('📺 Channel Data:', data);
    
    if (data.error || !data.channel_id) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Channel not found</p>
            </div>
        `;
        return;
    }
    
    const videos = data.videos || [];
    const stats = data.statistics || {};
    
    container.innerHTML = `
        <div class="channel-banner">
            <div class="channel-banner-img" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
        </div>
        
        <div class="channel-header">
            <div class="channel-avatar-large">
                <img src="${data.thumbnail || 'https://via.placeholder.com/120'}" alt="${data.name}">
            </div>
            <div class="channel-info">
                <h1 class="channel-name">${data.name}</h1>
                <p class="channel-handle">@${data.custom_url || data.channel_id}</p>
                <p class="channel-stats">
                    <span>${formatNumber(stats.subscribers)} subscribers</span>
                    <span>•</span>
                    <span>${formatNumber(stats.videos)} videos</span>
                </p>
                <p class="channel-description">${data.description || 'No description available'}</p>
                <button class="subscribe-btn large" onclick="toggleSubscribe(this)">Subscribe</button>
            </div>
        </div>
        
        <div class="channel-tabs">
            <button class="channel-tab active">Videos</button>
            <button class="channel-tab">Playlists</button>
            <button class="channel-tab">Community</button>
            <button class="channel-tab">About</button>
        </div>
        
        <div class="video-grid" id="channelVideos">
            ${videos.length > 0 ? renderVideoGridHTML(videos) : '<p style="color:#606060;text-align:center;padding:40px;">No videos available</p>'}
        </div>
    `;
}

// ===================== LOAD PLAYLIST (FIXED) =====================
async function loadPlaylist(playlistId) {
    const container = document.getElementById('playlistContainer');
    container.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading playlist...</p>
        </div>
    `;
    
    // ✅ FIXED: Your API expects /playlist?id=PLAYLIST_ID&max=50
    const data = await callAPI('/playlist', { 
        id: playlistId,     // ✅ "id" NOT "playlist_id"
        max: 50 
    });
    
    console.log('📋 Playlist Data:', data);
    
    if (data.error || !data.playlist_id) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Playlist not found</p>
            </div>
        `;
        return;
    }
    
    const videos = data.videos || [];
    
    container.innerHTML = `
        <div class="playlist-header">
            <div class="playlist-thumbnail">
                <img src="${data.thumbnail || 'https://via.placeholder.com/240'}" alt="${data.title}">
            </div>
            <div class="playlist-info">
                <span class="playlist-badge">Playlist</span>
                <h1 class="playlist-title">${data.title}</h1>
                <p class="playlist-description">${data.description || ''}</p>
                <p class="playlist-meta">
                    <span class="playlist-channel">
                        <a href="channel.html?channel_id=${data.channel_id}">${data.channel_title}</a>
                    </span>
                    <span>•</span>
                    <span>${videos.length} videos</span>
                </p>
                <div class="playlist-actions">
                    <button class="play-btn" onclick="playAllVideos()">▶ Play all</button>
                    <button class="save-btn">Save</button>
                    <button class="share-btn">Share</button>
                </div>
            </div>
        </div>
        
        <div class="playlist-videos">
            ${videos.length > 0 ? videos.map((video, index) => {
                const videoId = video.video_id;
                const title = video.title || 'Untitled';
                const thumbnail = video.thumbnail || 'https://via.placeholder.com/160x90';
                const channelTitle = video.channel_title || 'Unknown Channel';
                const channelId = video.channel_id || '';
                const views = video.views || '0';
                const duration = video.duration || '10:00';
                
                return `
                <div class="playlist-item" onclick="navigateToWatch('${videoId}')">
                    <div class="playlist-item-number">${index + 1}</div>
                    <div class="playlist-item-thumbnail">
                        <img src="${thumbnail}" alt="${title}" loading="lazy">
                        <span class="video-duration">${duration}</span>
                    </div>
                    <div class="playlist-item-info">
                        <h4 class="playlist-item-title">
                            <a href="watch.html?v=${videoId}">${title}</a>
                        </h4>
                        <p class="playlist-item-channel">
                            <a href="channel.html?channel_id=${channelId}">${channelTitle}</a>
                        </p>
                        <p class="playlist-item-meta">
                            <span>${formatNumber(views)} views</span>
                        </p>
                    </div>
                    <div class="playlist-item-actions">
                        <i class="fas fa-ellipsis-v"></i>
                    </div>
                </div>
                `;
            }).join('') : '<p style="color:#606060;text-align:center;padding:40px;">No videos in this playlist</p>'}
        </div>
    `;
}

// ===================== SEARCH (FIXED) =====================
async function searchVideos(event) {
    if (event) event.preventDefault();
    
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    
    window.location.href = `search.html?search_query=${encodeURIComponent(query)}`;
}

async function performSearch(query) {
    document.getElementById('searchQuery').textContent = `Search results for "${query}"`;
    
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching...</p>
        </div>
    `;
    
    const order = document.getElementById('orderFilter')?.value || 'relevance';
    const duration = document.getElementById('durationFilter')?.value || 'any';
    
    // ✅ FIXED: Your API expects /search?q=QUERY&max=20&order=relevance&duration=any&quality=highest
    const data = await callAPI('/search', { 
        q: query, 
        max: 20, 
        order: order,
        duration: duration,
        quality: 'highest'
    });
    
    console.log('🔍 Search Results:', data);
    
    if (data.error || !data.videos) {
        resultsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Search failed: ${data.error || 'Unknown error'}</p>
            </div>
        `;
        return;
    }
    
    const videos = data.videos || [];
    
    if (videos.length === 0) {
        resultsContainer.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-search"></i>
                <p>No results found for "${query}"</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = videos.map(video => {
        const videoId = video.video_id;
        const title = video.title || 'Untitled';
        const thumbnail = video.thumbnail || 'https://via.placeholder.com/360x202';
        const channelTitle = video.channel_title || 'Unknown Channel';
        const channelId = video.channel_id || '';
        const views = video.views || '0';
        const publishedAt = video.published_at || '';
        const description = video.description || '';
        const directStream = video.direct_stream;
        const duration = video.duration || '10:00';
        
        return `
        <div class="search-item" onclick="navigateToWatch('${videoId}')">
            <div class="search-thumbnail">
                <img src="${thumbnail}" alt="${title}" loading="lazy">
                <span class="video-duration">${duration}</span>
            </div>
            <div class="search-info">
                <h3 class="search-title">
                    <a href="watch.html?v=${videoId}">${title}</a>
                </h3>
                <p class="search-channel">
                    <a href="channel.html?channel_id=${channelId}">${channelTitle}</a>
                </p>
                <p class="search-meta">
                    <span>${formatNumber(views)} views</span>
                    <span>•</span>
                    <span>${timeAgo(publishedAt)}</span>
                </p>
                <p class="search-description">${description ? description.substring(0, 150) + '...' : ''}</p>
                ${directStream ? '<span class="stream-badge"><i class="fas fa-play"></i> Direct Stream</span>' : ''}
            </div>
        </div>
        `;
    }).join('');
}

async function applyFilters() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        await performSearch(query);
    }
}

// ===================== NAVIGATION =====================
function navigateToWatch(videoId) {
    window.location.href = `watch.html?v=${videoId}`;
}

function navigateToChannel(channelId) {
    window.location.href = `channel.html?channel_id=${channelId}`;
}

// ===================== SIDEBAR =====================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('visible');
    } else {
        sidebar.classList.toggle('hidden');
        document.getElementById('mainContent').classList.toggle('expanded');
    }
}

// ===================== INTERACTIONS =====================
function toggleSubscribe(button) {
    if (button.textContent.trim() === 'Subscribe') {
        button.textContent = 'Subscribed';
        button.style.background = '#606060';
    } else {
        button.textContent = 'Subscribe';
        button.style.background = '#cc0000';
    }
}

function likeVideo(button) {
    const countSpan = button.querySelector('span');
    let count = parseInt(countSpan.textContent) || 0;
    
    if (button.classList.contains('liked')) {
        count--;
        button.classList.remove('liked');
    } else {
        count++;
        button.classList.add('liked');
        const dislikeBtn = button.parentElement.querySelector('.action-btn.disliked');
        if (dislikeBtn) {
            const dislikeCount = dislikeBtn.querySelector('span');
            dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1 || 0;
            dislikeBtn.classList.remove('disliked');
        }
    }
    countSpan.textContent = count;
}

function dislikeVideo(button) {
    const countSpan = button.querySelector('span');
    let count = parseInt(countSpan.textContent) || 0;
    
    if (button.classList.contains('disliked')) {
        count--;
        button.classList.remove('disliked');
    } else {
        count++;
        button.classList.add('disliked');
        const likeBtn = button.parentElement.querySelector('.action-btn.liked');
        if (likeBtn) {
            const likeCount = likeBtn.querySelector('span');
            likeCount.textContent = parseInt(likeCount.textContent) - 1 || 0;
            likeBtn.classList.remove('liked');
        }
    }
    countSpan.textContent = count;
}

function shareVideo() {
    if (navigator.share) {
        navigator.share({
            title: document.getElementById('videoTitle').textContent,
            url: window.location.href
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard!');
        }).catch(() => {
            const input = document.createElement('input');
            input.value = window.location.href;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            alert('Link copied to clipboard!');
        });
    }
}

function downloadVideo() {
    const downloadLink = document.getElementById('streamDownloadLink');
    if (downloadLink) {
        window.open(downloadLink.href, '_blank');
    }
}

function addComment() {
    const field = document.getElementById('commentField');
    const text = field.value.trim();
    if (!text) return;
    
    const commentsList = document.getElementById('commentsList');
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.innerHTML = `
        <div class="comment-avatar">
            <img src="https://via.placeholder.com/40" alt="You">
        </div>
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-author">You</span>
                <span class="comment-time">Just now</span>
            </div>
            <p class="comment-text">${text}</p>
            <div class="comment-actions">
                <button class="comment-like-btn" onclick="likeComment(this)">
                    <i class="fas fa-thumbs-up"></i>
                    <span>0</span>
                </button>
                <button class="comment-reply-btn">Reply</button>
            </div>
        </div>
    `;
    commentsList.prepend(newComment);
    field.value = '';
    
    const countSpan = document.getElementById('commentCount');
    const currentCount = parseInt(countSpan.textContent) || 0;
    countSpan.textContent = (currentCount + 1) + ' Comments';
}

function likeComment(button) {
    const countSpan = button.querySelector('span');
    let count = parseInt(countSpan.textContent) || 0;
    count++;
    countSpan.textContent = count;
}

function toggleReplies(button) {
    const repliesList = button.parentElement.querySelector('.replies-list');
    if (repliesList.style.display === 'none') {
        repliesList.style.display = 'block';
        button.innerHTML = '<i class="fas fa-caret-up"></i> Hide replies';
    } else {
        repliesList.style.display = 'none';
        const count = repliesList.querySelectorAll('.reply-item').length;
        button.innerHTML = `<i class="fas fa-caret-down"></i> Show ${count} replies`;
    }
}

function filterVideos(category) {
    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    loadTrending();
}

function playAllVideos() {
    const videos = document.querySelectorAll('.playlist-item');
    if (videos.length > 0) {
        const firstVideo = videos[0];
        const link = firstVideo.querySelector('a');
        if (link) window.location.href = link.href;
    }
}

// ===================== HELPER FUNCTIONS =====================
function renderVideoGridHTML(videos) {
    return videos.map(video => {
        const videoId = video.video_id;
        const title = video.title || 'Untitled';
        const thumbnail = video.thumbnail || 'https://via.placeholder.com/300x169';
        const channelTitle = video.channel_title || 'Unknown Channel';
        const channelId = video.channel_id || '';
        const views = video.views || '0';
        const publishedAt = video.published_at || '';
        const directStream = video.direct_stream;
        const duration = video.duration || '10:00';
        
        return `
        <div class="video-card" onclick="navigateToWatch('${videoId}')">
            <div class="video-thumbnail">
                <img src="${thumbnail}" alt="${title}" loading="lazy">
                <span class="video-duration">${duration}</span>
                ${directStream ? '<span style="position:absolute;top:8px;left:8px;background:#4CAF50;color:white;padding:2px 8px;border-radius:12px;font-size:11px;"><i class="fas fa-play"></i> Direct</span>' : ''}
            </div>
            <div class="video-info">
                <div class="channel-avatar">
                    <img src="${video.channel_thumbnail || 'https://via.placeholder.com/40'}" alt="${channelTitle}">
                </div>
                <div class="video-details">
                    <h3 class="video-title">
                        <a href="watch.html?v=${videoId}">${title}</a>
                    </h3>
                    <p class="channel-name">
                        <a href="channel.html?channel_id=${channelId}">${channelTitle}</a>
                    </p>
                    <p class="video-meta">
                        <span>${formatNumber(views)} views</span>
                        <span>•</span>
                        <span>${timeAgo(publishedAt)}</span>
                    </p>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// ===================== INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Page loaded:', window.location.pathname);
    
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path === '/' || path === '/index.html') {
        loadTrending();
    } else if (path === '/watch' || path === '/watch.html') {
        const videoId = params.get('v');
        if (videoId) {
            loadVideo(videoId);
        } else {
            console.warn('⚠️ No video ID in URL');
            document.getElementById('videoPlayer').innerHTML = `
                <div class="video-placeholder">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>No video ID provided</p>
                    <p style="font-size:14px;color:#888;margin-top:8px;">URL should be: watch.html?v=VIDEO_ID</p>
                </div>
            `;
        }
    } else if (path === '/search' || path === '/search.html') {
        const query = params.get('search_query');
        if (query) {
            document.getElementById('searchInput').value = query;
            performSearch(query);
        }
    } else if (path === '/channel' || path === '/channel.html') {
        const channelId = params.get('channel_id');
        if (channelId) {
            loadChannel(channelId);
        }
    } else if (path === '/playlist' || path === '/playlist.html') {
        const playlistId = params.get('list');
        if (playlistId) {
            loadPlaylist(playlistId);
        }
    }
});

// ===================== KEYBOARD SHORTCUTS =====================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('visible')) {
            toggleSidebar();
        }
    }
    
    if (e.key === ' ' && document.activeElement.tagName !== 'INPUT') {
        const video = document.querySelector('.video-player');
        if (video) {
            e.preventDefault();
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    }
});

console.log('✅ YouTube Clone loaded successfully!');
console.log('🔗 API URL:', API_BASE_URL);
console.log('📋 All endpoints now use CORRECT parameters:');
console.log('   /video?id=VIDEO_ID&quality=highest ✅');
console.log('   /comments?video_id=VIDEO_ID&max=20 ✅');
console.log('   /related?video_id=VIDEO_ID&max=20 ✅');
console.log('   /search?q=QUERY&max=20&order=relevance ✅');
console.log('   /channel?id=CHANNEL_ID&max=20 ✅');
console.log('   /playlist?id=PLAYLIST_ID&max=50 ✅');
