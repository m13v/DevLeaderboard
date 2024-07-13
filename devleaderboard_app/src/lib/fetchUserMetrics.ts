import { supabase } from './supabaseClient';

export const fetchUserMetrics = async () => {
  const { data, error } = await supabase.from('user_metrics').select('*');
  if (error) {
    console.error('Error fetching user metrics:', error);
    return [];
  }
  return data;
};