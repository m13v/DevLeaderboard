const { getLimitedUsers } = require('./db_users_data');
const { pushUserRepos } = require('./repo_queue_mgt');
const { getRepoDetails } = require('./get_repo_details');

async function processUserRepos() {
    let offset = 0;
    const limit = 50;

    while (true) {
        try {
            const users = await getLimitedUsers(limit, offset);
            if (users.length === 0) break; // No more users to process

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

            offset += limit; // Move to the next chunk
        } catch (error) {
            console.error('Error processing user repos:', error);
        }
    }

    console.log('All users processed successfully.');
}

processUserRepos();