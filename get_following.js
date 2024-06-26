const axios = require('axios');
require('dotenv').config();

async function getFollowing(username) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('GITHUB_TOKEN is not set.');
        return [];
    }

    const headers = {
        'Authorization': `token ${token}`
    };
    const apiUrl = `https://api.github.com/users/${username}/following`;

    try {
        const response = await axios.get(apiUrl, { headers });
        if (response.status === 200) {
            return response.data.map(user => user.login);
        } else {
            console.error(`Failed to fetch following list: ${response.status}`);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching following list: ${error.message}`);
        return [];
    }
}

module.exports = getFollowing;

// Example usage
// (async () => {
//     const username = process.argv[2]; // Get username from command line arguments
//     if (!username) {
//         console.error('Please provide a GitHub username as a command line argument.');
//         process.exit(1);
//     }
//     const following = await getFollowing(username);
//     console.log(`Users followed by ${username}:`, following);
// })();