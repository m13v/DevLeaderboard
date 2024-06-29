require('dotenv').config();
const { supabaseClient } = require('./supabase_client.js');

const supabase = supabaseClient;

async function getAllUserMetrics() {
    const { data, error } = await supabase
        .from('user_metrics')
        .select('*');

    if (error) {
        console.error('Error fetching user metrics:', error);
        return null;
    }

    return data;
}

async function getUserMetricsById(user_id) {
    const { data, error } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', user_id); // Filter by user_id

    if (error) {
        console.error('Error fetching user metrics:', error);
        return null;
    }

    return data;
}

async function getFollowersPercentile(followers) {
    const { data, error } = await supabase
        .rpc('get_followers_percentile', { followers_param: followers });

    if (error) {
        console.error('Error fetching followers percentile:', error);
        return null;
    }

    // Assuming the response is an array with one object
    if (data && data.length > 0) {
        return data[0].followers_percentile;
    }

    return null;
}

async function getContributionsPercentile(total_contributions) {
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

async function getSymbolsPercentile(total_symbols) {
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

async function getRankByWeightedAveragePercentile(weighted_average_percentile) {
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

module.exports = {
    getAllUserMetrics,
    getUserMetricsById,
    getFollowersPercentile,
    getContributionsPercentile,
    getSymbolsPercentile,
    getRankByWeightedAveragePercentile
};