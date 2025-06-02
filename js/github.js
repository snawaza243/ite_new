// Configuration - Update these values with your GitHub details
const GITHUB_USERNAME = 'snawaza243';
const REPO_NAME = 'ite_new'; // Repository where posts.json will be stored
const FILE_PATH = 'posts.json'; // Path to the file in the repository
const ACCESS_TOKEN = 'ghp_xxx'; // Keep this secure!

// Base URL for GitHub API
const GITHUB_API_BASE = 'https://api.github.com';

// Fetch all posts from GitHub
async function fetchPosts() {
    try {
        const url = `${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${ACCESS_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                // File doesn't exist yet, return empty array
                return [];
            }
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = atob(data.content); // Decode base64 content
        return JSON.parse(content);
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

// Save a new post to GitHub
async function savePost(newPost) {
    try {
        // First, get the current content to obtain the SHA (required for updates)
        let sha = null;
        let currentContent = [];

        try {
            const currentData = await fetchPosts();
            currentContent = Array.isArray(currentData) ? currentData : [];

            // Get SHA of the existing file
            const url = `${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${ACCESS_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                sha = data.sha;
            }
        } catch (error) {
            console.log('No existing file or error fetching SHA, will create new file');
        }

        // Add new post to the beginning of the array
        const updatedContent = [newPost, ...currentContent];
        const contentString = JSON.stringify(updatedContent, null, 2);
        const contentBase64 = btoa(unescape(encodeURIComponent(contentString)));

        // Prepare the request
        const url = `${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${ACCESS_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add new post: ${newPost.title}`,
                content: contentBase64,
                sha: sha // This will be null for a new file, which is fine
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API error: ${response.status} ${errorData.message}`);
        }

        return true;
    } catch (error) {
        console.error('Error saving post:', error);
        throw error;
    }
}

// Export functions to be used in other files
if (typeof module !== 'undefined' && module.exports) {
    // For Node.js testing
    module.exports = { fetchPosts, savePost };
}