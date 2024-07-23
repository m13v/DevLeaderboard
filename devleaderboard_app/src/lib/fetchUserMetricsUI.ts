import { supabase } from './supabaseClient';

export const fetchUserMetricsUI = async () => {
  const { data, error } = await supabase.from('user_metrics_ui').select('*');
  if (error) {
    console.error('Error fetching user metrics UI:', error);
    return [];
  }
  return data;
};
