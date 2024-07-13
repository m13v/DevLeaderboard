import { supabase } from './supabaseClient';
import { User } from '../components/UsersTable'; // Ensure you have a User type defined

export const fetchUsers = async (): Promise<User[]> => {
  let allUsers: User[] = [];
  let from = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    console.log(`Fetching users from ${from} to ${from + limit - 1}`);
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(from, from + limit - 1);

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    if (count === null) {
      console.error('Error: count is null');
      return allUsers;
    }

    console.log(`Fetched ${data.length} users, total count: ${count}`);
    allUsers = allUsers.concat(data as User[]);
    from += limit;
    hasMore = from < count;
  }

  console.log('All users fetched successfully');
  return allUsers;
};