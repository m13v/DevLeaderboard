import { supabase } from './supabaseClient';

// Function to fetch user metrics UI data from Supabase
export const fetchUserMetricsUI = async () => {
  // Query the 'user_metrics_ui' table and select all columns
  const { data, error } = await supabase.from('user_metrics_ui').select('*');

  // If there's an error, log it and return an empty array
  if (error) {
    console.error('Error fetching user metrics UI:', error);
    return [];
  }

  // If successful, return the fetched data
  return data;
};