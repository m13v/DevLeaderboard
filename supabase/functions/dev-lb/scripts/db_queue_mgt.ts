import { supabaseClient } from './supabase_client.ts';

const supabase = supabaseClient;

interface CommitData {
    additions_data: any;
    total_additions: number;
    total_symbol_count: number;
    total_non_empty_lines: number;
}

async function insertData(commitUrls: string[], username: string): Promise<void> {
    for (const url of commitUrls) {
        const row = {
            commit_url: url,
            user: username,
        };

        try {
            const { data: queueData, error: queueError } = await supabase
                .from('queue')
                .insert(row)
                .select();

            if (queueError) {
                if (queueError.code === '23505') {
                    console.log(`Duplicate entry for ${url}, skipping.`);
                } else {
                    console.error(`Error inserting ${url} into queue:`, queueError);
                }
            } else {
                console.log(`Inserted ${url} into queue:`, queueData);
            }
        } catch (error) {
            console.error(`Unexpected error inserting ${url} into queue:`, error);
        }
    }
}

async function filterNewCommits(commit_urls: string[]): Promise<string[]> {
    const { data: completedData, error: completedError } = await supabase
        .from('completed_shas')
        .select('commit_url')
        .in('commit_url', commit_urls);

    if (completedError) {
        console.error('Error checking completed commit existence:', completedError);
        return commit_urls;
    }

    const completedUrls = completedData.map((row: { commit_url: string }) => row.commit_url);
    console.log('Completed URLs:', completedUrls);

    const { data: queueData, error: queueError } = await supabase
        .from('queue')
        .select('commit_url')
        .in('commit_url', commit_urls);

    if (queueError) {
        console.error('Error checking queue commit existence:', queueError);
        return commit_urls;
    }

    const queueUrls = queueData.map((row: { commit_url: string }) => row.commit_url);
    console.log('Queue URLs:', queueUrls);

    const existingUrls = [...completedUrls, ...queueUrls];
    console.log('Existing URLs:', existingUrls);

    const newCommitUrls = commit_urls.filter(url => !existingUrls.includes(url));
    console.log('New Commit URLs:', newCommitUrls);

    return newCommitUrls;
}

async function get50QueueContents(): Promise<any[]> {
    const { data, error } = await supabase
        .from('queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching queue contents:', error);
        return [];
    }

    return data;
}

async function moveCommitToCompleted(commit_url: string, commitData: CommitData): Promise<void> {
    const { data: queueData, error: queueError } = await supabase
        .from('queue')
        .select('*')
        .eq('commit_url', commit_url)
        .single();

    if (queueError) {
        console.error('Error fetching from queue:', queueError);
        return;
    }

    const { user, commit_url: commitUrl } = queueData;
    const { additions_data, total_additions, total_symbol_count, total_non_empty_lines } = commitData;

    const { data: completedData, error: completedError } = await supabase
        .from('completed_shas')
        .insert([{
            users: user,
            commit_url: commitUrl,
            commit_data: commitData,
            additions_data,
            total_additions,
            total_symbol_count,
            total_non_empty_lines
        }]);

    if (completedError) {
        console.error('Error inserting into completed_shas:', completedError);
        return;
    }

    const { error: deleteError } = await supabase
        .from('queue')
        .delete()
        .eq('commit_url', commitUrl);

    if (deleteError) {
        console.error('Error deleting from queue:', deleteError);
    } else {
        console.log('Moved sha to completed_shas:', commit_url);
    }
}

async function delete_commit_from_queue(commit_url: string): Promise<void> {
    const { error } = await supabase
        .from('queue')
        .delete()
        .eq('commit_url', commit_url);

    if (error) {
        console.error('Error deleting commit from queue:', error);
    } else {
        console.log('Deleted commit from queue:', commit_url);
    }
}

async function commitExistsInCompletedShas(commit_url: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('completed_shas')
        .select('commit_url')
        .eq('commit_url', commit_url)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            console.log('No rows returned for commit existence check.');
            return false;
        }
        console.error('Error checking commit existence in completed_shas:', error);
        return false;
    }

    return data !== null;
}

export { insertData, filterNewCommits, get50QueueContents, moveCommitToCompleted, delete_commit_from_queue, commitExistsInCompletedShas };