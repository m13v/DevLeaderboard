import { supabaseClient } from './supabase_client.ts';

const supabase = supabaseClient;

interface UserData {
    github_link: string;
    // Add other fields as necessary
}

async function insertUserData(userData: UserData): Promise<void> {
    const { data, error } = await supabase
        .from('users')
        .upsert([userData], { onConflict: 'github_link' }) 
        .select();

    if (error) {
        console.error('Error inserting/updating data:', data, 'ERROR:', error);
    } else {
        console.log('Data inserted/updated successfully:', data);
    }
}

async function getAllUsers(): Promise<any[]> {
    const { data, error } = await supabase
        .from('users')
        .select('*'); 

    if (error) {
        console.error('Error fetching data:', error);
        return [];
    } else {
        return data;
    }
}

async function getUserByGithubLink(githubLink: string): Promise<any | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('github_link', githubLink);

    if (error) {
        console.error('Error fetching user data:', error);
        return null;
    } else {
        return data;
    }
}

async function getLimitedUsers(limit = 50, offset = 0): Promise<any[]> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('30day_commits', { ascending: false }) // Sort by 30day_commits in descending order
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching data:', error);
        return [];
    } else {
        return data;
    }
}

async function filterNewUsers(githubUrls: string[]): Promise<string[]> {
    const newUsers: string[] = [];
    for (const url of githubUrls) {
        const { data, error } = await supabase
            .from('users')
            .select('github_link')
            .eq('github_link', url);

        if (error) {
            console.error('Error fetching user data:', error);
            continue;
        }

        if (data.length === 0) {
            newUsers.push(url);
        }
    }
    return newUsers;
}

export { insertUserData, getAllUsers, getUserByGithubLink, getLimitedUsers, filterNewUsers };
