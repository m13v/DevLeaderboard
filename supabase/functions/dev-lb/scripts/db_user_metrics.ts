import { supabaseClient } from './supabase_client.ts';

const supabase = supabaseClient;      

interface UserMetrics {
    // Define the structure of user_metrics table
    user_id: string;
    // Add other fields as necessary
}

async function getAllUserMetrics(): Promise<UserMetrics[] | null> {
    const { data, error } = await supabase
        .from<UserMetrics>('user_metrics')
        .select('*');

    if (error) {
        console.error('Error fetching user metrics:', error);
        return null;
    }

    return data;
}

async function getUserMetricsById(user_id: string): Promise<UserMetrics[] | null> {
    const { data, error } = await supabase
        .from<UserMetrics>('user_metrics')
        .select('*')
        .eq('user_id', user_id);

    if (error) {
        console.error('Error fetching user metrics:', error);
        return null;
    }

    return data;
}

async function getFollowersPercentile(followers: number): Promise<number | null> {
    const { data, error } = await supabase
        .rpc('get_followers_percentile', { followers_param: followers });

    if (error) {
        console.error('Error fetching followers percentile:', error);
        return null;
    }

    if (data && data.length > 0) {
        return data[0].followers_percentile;
    }

    return null;
}

async function getContributionsPercentile(total_contributions: number): Promise<number | null> {
    const { data, error } = await supabase
        .rpc('get_contributions_percentile', { contributions_param: total_contributions });

    if (error) {
        console.error('Error fetching contributions percentile:', error);
        return null;
    }

    if (data && data.length > 0) {
        return data[0].contributions_percentile;
    }

    return null;
}

async function getSymbolsPercentile(total_symbols: number): Promise<number | null> {
    const { data, error } = await supabase
        .rpc('get_symbols_percentile', { symbols_param: total_symbols });

    if (error) {
        console.error('Error fetching symbols percentile:', error);
        return null;
    }

    if (data && data.length > 0) {
        return data[0].symbols_percentile;
    }

    return null;
}

async function getRankByWeightedAveragePercentile(weighted_average_percentile: number): Promise<number | null> {
    const { data, error } = await supabase
        .rpc('get_rank_by_weighted_average_percentile', { weighted_average_param: weighted_average_percentile });

    if (error) {
        console.error('Error fetching rank by weighted average percentile:', error);
        return null;
    }

    if (data && data.length > 0) {
        return data[0].rank;
    }

    return null;
}

export {
    getAllUserMetrics,
    getUserMetricsById,
    getFollowersPercentile,
    getContributionsPercentile,
    getSymbolsPercentile,
    getRankByWeightedAveragePercentile
};