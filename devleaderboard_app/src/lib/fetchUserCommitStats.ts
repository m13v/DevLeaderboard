import { supabase } from './supabaseClient';

export const fetchUserCommitStats = async () => {
  const { data, error } = await supabase.from('user_commit_stats').select('*');
  if (error) {
    console.error('Error fetching user commit stats:', error);
    return [];
  }
  return data;
};