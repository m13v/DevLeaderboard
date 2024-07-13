Open Source Dev Leaderboard (Live update)

# Overview

Right now it is quuite disintegrated repo, but there are a few scripts you can get started with.

Basically, we have the following logic:
1. We find open sources repositories in AI space (LLM checks if the repo is related to AI based on their bio and readme)
2. We get a list of their contibutors
3. We get profile and recent activities of each contributor
4. We get their recent commits
5. We calculate number of unempty, non-comment lines of code in the commits
6. We calculate number of symbols
7. We rank commits against each other using LLM to understand which one is better
8. We rank all users by the parameters above plus their number of folloers and number of stars
9. We pass the ranking into vercel APP

Users on their end can:
1. View the overall leaderboard
2. Check the score for themselves
3. Get a leaderboard among people who follow them and who they follow

# Getting started

## Backend - ongoing processes

0. Preqrequisits:

Clone repo:
```bash
git clone https://github.com/m13v/DevLeaderboard.git
```

Navigate to the folder
```bash
cd DevLeaderboard
```

Create .env file with:
```bash
touch .env
```

To get GitHub token you should create it in your profile:
1. got to: https://github.com/settings/tokens
2. Tokens (classic)
3. Generate new token (classic)
4. Add ticks on fields: 'repo', 'user' (i thinks that's enough)
5. Copy it to the command below

To get GROQ API KEY:
1. Sign up here: https://groq.com/
2. Navigate to: https://console.groq.com/keys
3. Generate API key
4. Insert below

```bash
echo "GITHUB_TOKEN=insert_your_key_here" > .env
echo "SUPABASE_URL=insert_your_key_here" > .env
echo "SUPABASE_ANON=insert_your_key_here" > .env
echo "SUPABASE_SERVICE_ROLE_KEY=insert_your_key_here" > .env
echo "GROQ_API_KEY=insert_your_key_here" > .env
```

1. Procee queue of AI repos to get users
```bash
node process_repo_queue.js
```

2. Process queue of users, meaning that we add their recent activity
```bash
node queue_mgt.js
```

3. Process queue of commits to get their details
```bash
node process_queue.js;
```

4. Show recent database activity
```bash
node db_stats.js
```

## Frontend

Folder:
devleaderboard_app

Run locally:
```bash
npm install
npm run dev
```
