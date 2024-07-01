import dotenv from 'npm:dotenv';
import axios from 'npm:axios';
import { getTotalContributions } from './get_ttl_cmt.ts';
import { insertUserData, getUserByGithubLink } from './db_users_data.ts';
// import { serve } from "https://deno.land/x/sift@0.3.0/mod.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import process from 'node:process';

// console.log(Deno.env.get('GITHUB_TOKEN'));

interface UserContributions {
    total: number;
    commits: number;
    issues: number;
    prs: number;
    reviews: number;
    avatar: string;
    followers: number;
    profileLink: string;
    totalRepositories: number;
    joined: string;
    location: string | null;
    email: string | null;
    name: string | null;
    bio: string | null;
    twitterUsername: string | null;
    websiteUrl: string | null;
    rspjs2: any;
}

interface UserData {
    avatar: string;
    followers: number;
    github_link: string;
    last_request: string;
    total_repo: number;
    total_contributions: number;
    joined: string;
    location?: string;
    email?: string;
    "30day_commits": number;
    "30day_issues": number;
    "30day_prs": number;
    "30day_reviews": number;
    name?: string;
    bio?: string;
    twitterUsername?: string;
    website?: string;
    rspjs2: any;
}

async function query(username: string): Promise<UserContributions | null> {
    // const token = Deno.env.get("GITHUB_TOKEN");
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('GITHUB_TOKEN is not set');
        return null;
    }
    const query = `
    query($userName: String!, $fromDate: DateTime!, $toDate: DateTime!) {
      user(login: $userName) {
        login
        name
        bio
        url
        avatarUrl
        company
        location
        email
        websiteUrl
        twitterUsername
        createdAt
        followers {
          totalCount
        }
        following {
          totalCount
        }
        contributionsCollection(from: $fromDate, to: $toDate) {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
          }
          commitContributionsByRepository {
            repository {
              name
            }
            contributions(first: 10) {
              nodes {
                commitCount
              }
            }
          }
        }
        repositories {
          totalCount
        }
        gists(first: 10) {
          nodes {
            name
            description
            url
            files {
              name
              language {
                name
              }
            }
          }
        }
        organizations(first: 10) {
          nodes {
            name
            url
          }
        }
        starredRepositories(first: 10) {
          nodes {
            name
            owner {
              login
            }
            stargazerCount
          }
        }
      }
    }`;
    const headers = {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json'
    };
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = new Date().toISOString();
    const variables = {
        userName: username,
        fromDate: fromDate,
        toDate: toDate
    };
    try {
        const response = await axios.post('https://api.github.com/graphql', {
            query,
            variables
        }, { headers });

        if (response.status === 200) {
            const user = response.data.data?.user;
            if (!user) {
                console.error('User not found in the response.');
                return null;
            }
            const contributions = user.contributionsCollection;
            const totalContributions = contributions.contributionCalendar.totalContributions;
            const commitContributions = contributions.totalCommitContributions;
            const issueContributions = contributions.totalIssueContributions;
            const prContributions = contributions.totalPullRequestContributions;
            const reviewContributions = contributions.totalPullRequestReviewContributions;

            return {
                total: totalContributions,
                commits: commitContributions,
                issues: issueContributions,
                prs: prContributions,
                reviews: reviewContributions,
                avatar: user.avatarUrl,
                followers: user.followers.totalCount,
                profileLink: user.url,
                totalRepositories: user.repositories.totalCount,
                joined: user.createdAt,
                location: user.location,
                email: user.email,
                name: user.name,
                bio: user.bio,
                twitterUsername: user.twitterUsername,
                websiteUrl: user.websiteUrl,
                rspjs2: response.data
            };
        } else {
            console.error(`Failed to fetch contributions: ${response.status} ${response.statusText}`);
            console.log('response.data=', response.data);
            return null;
        }
    } catch (error: any) { // or error: Error
        console.error(`Error: ${error.message}`);
        return null;
    }
}

export async function getContributionsLast30Days(username: string): Promise<UserContributions | null> {
    console.log(`getContributionsLast30Days(${username})`);

    const contributions = await query(username);
    if (contributions === null) {
        console.error("Failed to fetch contributions for the last 30 days.");
        return null;
    }

    const existingUser = await getUserByGithubLink(contributions.profileLink);
    let totalContributions: number;
    if (existingUser && existingUser.length > 0 && existingUser[0].total_contributions) {
        totalContributions = existingUser[0].total_contributions;
        console.log(`Total contributions already exist: ${totalContributions}`);
    } else {
        totalContributions = await getTotalContributions(username, contributions.joined) ?? 0;
        if (totalContributions === 0) {
            console.error("Failed to fetch total commits.");
            return null;
        }
    }

    const userData: UserData = {
        avatar: contributions.avatar,
        followers: contributions.followers,
        github_link: contributions.profileLink,
        last_request: new Date().toISOString(),
        total_repo: contributions.totalRepositories,
        total_contributions: totalContributions,
        joined: contributions.joined,
        location: contributions.location ?? undefined,
        email: contributions.email ?? undefined,
        "30day_commits": contributions.commits,
        "30day_issues": contributions.issues,
        "30day_prs": contributions.prs,
        "30day_reviews": contributions.reviews,
        name: contributions.name ?? undefined,
        bio: contributions.bio ?? undefined,
        twitterUsername: contributions.twitterUsername ?? undefined,
        website: contributions.websiteUrl ?? undefined,
        rspjs2: contributions.rspjs2
    };

    try {
        await insertUserData(userData);
    } catch (error) {
        console.error('Error inserting/updating data:', error);
        return null;
    }

    return contributions;
}

