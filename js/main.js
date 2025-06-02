// Shared functions that might be used across multiple pages
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Render posts (used in index.html)
function renderPosts(posts, containerId = 'posts-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (posts.length === 0) {
        container.innerHTML = '<p>No posts yet. <a href="write.html">Write your first post!</a></p>';
        return;
    }

    posts.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'post-preview';
        postElement.innerHTML = `
            <h2><a href="post.html?id=${post.id}">${post.title}</a></h2>
            <div class="post-date">${formatDate(post.date)}</div>
            <div class="post-excerpt">${post.content.substring(0, 100)}...</div>
            <a href="post.html?id=${post.id}" class="read-more">Read more</a>
        `;
        container.appendChild(postElement);
    });
}

// Load a single post (used in post.html)
async function loadPost(postId) {
    try {
        const posts = await fetchPosts();
        const post = posts.find(p => p.id === postId);
        
        if (!post) {
            throw new Error('Post not found');
        }

        document.title = post.title + ' | My Blog';
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-date').textContent = formatDate(post.date);
        document.getElementById('post-body').innerHTML = post.content;
    } catch (error) {
        console.error('Error loading post:', error);
        document.getElementById('post-content').innerHTML = `
            <h2>Error</h2>
            <p>${error.message}</p>
            <a href="index.html">Return to home</a>
        `;
    }
}