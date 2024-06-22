const axios = require('axios');
require('dotenv').config();

async function summarizeCommitDetails(commitDetails_str) {

    let textToSummarize = `Summarize github commit details: ${commitDetails_str}`;
    // console.log(commitDetails_str);

    
    try {
        const response = await axios.post('https://api.ai21.com/studio/v1/summarize', {
            source: textToSummarize,
            sourceType: "TEXT"
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.AI21_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Summary:", response.data.summary);
    } catch (error) {
        console.error('Error summarizing commit details:', error);
    }
}

function main() {
    const commitDetails = {
        sha: '11cc5a970cb50acefd194cc8c82369192a4dc409',
        node_id: 'C_kwDOMMz4E9oAKDExY2M1YTk3MGNiNTBhY2VmZDE5NGNjOGM4MjM2OTE5MmE0ZGM0MDk',
        commit: {
          author: {
            name: 'matthew-heartful',
            email: 'matthew.heartful@gmail.com',
            date: '2024-06-22T21:04:18Z'
          },
          committer: {
            name: 'matthew-heartful',
            email: 'matthew.heartful@gmail.com',
            date: '2024-06-22T21:04:18Z'
          },
          message: 'Add .gitignore file',
          tree: {
            sha: 'b0fb4b90ea0d02dd2495c0bdcf73b5d8c7e56d35',
            url: 'https://api.github.com/repos/matthew-heartful/DevLeaderboard/git/trees/b0fb4b90ea0d02dd2495c0bdcf73b5d8c7e56d35'
          },
          url: 'https://api.github.com/repos/matthew-heartful/DevLeaderboard/git/commits/11cc5a970cb50acefd194cc8c82369192a4dc409',
          comment_count: 0,
          verification: {
            verified: false,
            reason: 'unsigned',
            signature: null,
            payload: null
          }
        },
        url: 'https://api.github.com/repos/matthew-heartful/DevLeaderboard/commits/11cc5a970cb50acefd194cc8c82369192a4dc409',
        html_url: 'https://github.com/matthew-heartful/DevLeaderboard/commit/11cc5a970cb50acefd194cc8c82369192a4dc409',
        comments_url: 'https://api.github.com/repos/matthew-heartful/DevLeaderboard/commits/11cc5a970cb50acefd194cc8c82369192a4dc409/comments',
        author: {
          login: 'matthew-heartful',
          id: 104702220,
          node_id: 'U_kgDOBj2hDA',
          avatar_url: 'https://avatars.githubusercontent.com/u/104702220?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/matthew-heartful',
          html_url: 'https://github.com/matthew-heartful',
          followers_url: 'https://api.github.com/users/matthew-heartful/followers',
          following_url: 'https://api.github.com/users/matthew-heartful/following{/other_user}',
          gists_url: 'https://api.github.com/users/matthew-heartful/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/matthew-heartful/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/matthew-heartful/subscriptions',
          organizations_url: 'https://api.github.com/users/matthew-heartful/orgs',
          repos_url: 'https://api.github.com/users/matthew-heartful/repos',
          events_url: 'https://api.github.com/users/matthew-heartful/events{/privacy}',
          received_events_url: 'https://api.github.com/users/matthew-heartful/received_events',
          type: 'User',
          site_admin: false
        },
        committer: {
          login: 'matthew-heartful',
          id: 104702220,
          node_id: 'U_kgDOBj2hDA',
          avatar_url: 'https://avatars.githubusercontent.com/u/104702220?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/matthew-heartful',
          html_url: 'https://github.com/matthew-heartful',
          followers_url: 'https://api.github.com/users/matthew-heartful/followers',
          following_url: 'https://api.github.com/users/matthew-heartful/following{/other_user}',
          gists_url: 'https://api.github.com/users/matthew-heartful/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/matthew-heartful/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/matthew-heartful/subscriptions',
          organizations_url: 'https://api.github.com/users/matthew-heartful/orgs',
          repos_url: 'https://api.github.com/users/matthew-heartful/repos',
          events_url: 'https://api.github.com/users/matthew-heartful/events{/privacy}',
          received_events_url: 'https://api.github.com/users/matthew-heartful/received_events',
          type: 'User',
          site_admin: false
        },
        parents: [
          {
            sha: 'f1c15e006b725a2557186e0ee565c7d1cef6daaa',
            url: 'https://api.github.com/repos/matthew-heartful/DevLeaderboard/commits/f1c15e006b725a2557186e0ee565c7d1cef6daaa',
            html_url: 'https://github.com/matthew-heartful/DevLeaderboard/commit/f1c15e006b725a2557186e0ee565c7d1cef6daaa'
          }
        ],
        stats: { total: 102, additions: 102, deletions: 0 },
        files: [
          {
            sha: 'a28b74310c10d32c1ded4f38ef54a07368e9fb4b',
            filename: '.gitignore',
            status: 'added',
            additions: 102,
            deletions: 0,
            changes: 102,
            blob_url: 'https://github.com/matthew-heartful/DevLeaderboard/blob/11cc5a970cb50acefd194cc8c82369192a4dc409/.gitignore',
            raw_url: 'https://github.com/matthew-heartful/DevLeaderboard/raw/11cc5a970cb50acefd194cc8c82369192a4dc409/.gitignore',
            contents_url: 'https://api.github.com/repos/matthew-heartful/DevLeaderboard/contents/.gitignore?ref=11cc5a970cb50acefd194cc8c82369192a4dc409',
            patch: '@@ -0,0 +1,102 @@\n' +
              '+# Byte-compiled / optimized / DLL files\n' +
              '+__pycache__/\n' +
              '+*.py[cod]\n' +
              '+*$py.class\n' +
              '+\n' +
              '+# C extensions\n' +
              '+*.so\n' +
              '+\n' +
              '+# Distribution / packaging\n' +
              '+.Python\n' +
              '+build/\n' +
              '+develop-eggs/\n' +
              '+dist/\n' +
              '+downloads/\n' +
              '+eggs/\n' +
              '+.eggs/\n' +
              '+lib/\n' +
              '+lib64/\n' +
              '+parts/\n' +
              '+sdist/\n' +
              '+var/\n' +
              '+wheels/\n' +
              '+*.egg-info/\n' +
              '+.installed.cfg\n' +
              '+*.egg\n' +
              '+MANIFEST\n' +
              '+\n' +
              '+# PyInstaller\n' +
              '+*.manifest\n' +
              '+*.spec\n' +
              '+\n' +
              '+# Installer logs\n' +
              '+pip-log.txt\n' +
              '+pip-delete-this-directory.txt\n' +
              '+\n' +
              '+# Unit test / coverage reports\n' +
              '+htmlcov/\n' +
              '+.tox/\n' +
              '+.coverage\n' +
              '+.coverage.*\n' +
              '+.cache\n' +
              '+nosetests.xml\n' +
              '+coverage.xml\n' +
              '+*.cover\n' +
              '+.hypothesis/\n' +
              '+.pytest_cache/\n' +
              '+\n' +
              '+# Translations\n' +
              '+*.mo\n' +
              '+*.pot\n' +
              '+\n' +
              '+# Django stuff:\n' +
              '+*.log\n' +
              '+local_settings.py\n' +
              '+db.sqlite3\n' +
              '+\n' +
              '+# Flask stuff:\n' +
              '+instance/\n' +
              '+.webassets-cache\n' +
              '+\n' +
              '+# Scrapy stuff:\n' +
              '+.scrapy\n' +
              '+\n' +
              '+# Sphinx documentation\n' +
              '+docs/_build/\n' +
              '+\n' +
              '+# PyBuilder\n' +
              '+target/\n' +
              '+\n' +
              '+# Jupyter Notebook\n' +
              '+.ipynb_checkpoints\n' +
              '+\n' +
              '+# pyenv\n' +
              '+.python-version\n' +
              '+\n' +
              '+# celery beat schedule file\n' +
              '+celerybeat-schedule\n' +
              '+\n' +
              '+# SageMath parsed files\n' +
              '+*.sage.py\n' +
              '+\n' +
              '+# Environments\n' +
              '+.env\n' +
              '+.venv\n' +
              '+env/\n' +
              '+venv/\n' +
              '+ENV/\n' +
              '+env.bak/\n' +
              '+venv.bak/\n' +
              '+\n' +
              '+# Spyder project settings\n' +
              '+.spyderproject\n' +
              '+.spyproject\n' +
              '+\n' +
              '+# Rope project settings\n' +
              '+.ropeproject\n' +
              '+\n' +
              '+# mkdocs documentation\n' +
              '+/site\n' +
              '+\n' +
              '+# mypy\n' +
              '+.mypy_cache/\n' +
              '\\ No newline at end of file'
          }
        ]
      };

    summarizeCommitDetails(JSON.stringify(commitDetails.files, null, 2));
}

main();