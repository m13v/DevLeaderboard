const { getLimitedUsers } = require('./db_users_data');
const { pushUserRepos } = require('./repo_queue_mgt');
const { getRepoDetails } = require('./get_repo_details');

async function processUserRepos() {
    try {
        // Fetch all users
        const users = await getLimitedUsers();
        console.log(`Fetched ${users.length} users from the database.`);

        for (const user of users) {
            const github_link = user.github_link;
            const userJson = user.rspjs2;

            if (!userJson) {
                console.log(`Skipping user with github_link: ${github_link} due to missing rspjs2.`);
                continue;
            }

            console.log(`Processing repos for github_link: ${github_link}`);

            // Add repos to the queue
            await pushUserRepos(userJson);

            console.log(`Finished processing repos for user: ${github_link}`);
        }

        console.log('All users processed successfully.');
    } catch (error) {
        console.error('Error processing user repos:', error);
    }
}

processUserRepos();