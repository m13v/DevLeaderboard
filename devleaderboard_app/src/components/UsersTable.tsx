"use client"; // Enables client-side rendering for this component

import { useEffect, useState } from 'react'; // Hooks for side effects and state management
import { fetchUsers } from '../lib/fetchUsers'; // Function to fetch user data
import { fetchUserCommitStats } from '../lib/fetchUserCommitStats'; // Function to fetch user commit statistics
import { fetchUserMetrics } from '../lib/fetchUserMetrics'; // Function to fetch user metrics (e.g., rank)
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '../components/ui/table'; // UI components for table structure

// Define the structure for a User object
export interface User {
  rank: number;
  avatar: string;
  name: string;
  followers: number;
  total_contributions: number;
  total_repo: number;
  joined: string;
  github_link: string;
  total_commits: number;
  total_additions: number;
  total_non_empty_lines: number;
  total_symbol_count: number;
}

// Define the structure for UserMetric object
interface UserMetric {
  user_id: string;
  rank: number;
  // Add other fields as necessary
}

const UsersTable = () => {
  // State to store the list of users
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      // Fetch user metrics, basic user data, and commit stats
      const userMetrics = await fetchUserMetrics();
      const usersData: User[] = await fetchUsers();
      const commitStats = await fetchUserCommitStats();

      // Log fetched data for debugging
      console.log('Fetched User Metrics:', userMetrics);
      console.log('Fetched Users:', usersData);
      console.log('Fetched Commit Stats:', commitStats);

      const extractUserId = (githubLink: string) => githubLink.split('/').pop() || '';

      const mergedData = userMetrics.map((userMetric: UserMetric) => {
        const userId = userMetric.user_id;
        const user = usersData.find(user => extractUserId(user.github_link) === userId) || { name: '', avatar: '', followers: 0, total_contributions: 0, total_repo: 0, joined: '', github_link: '', total_commits: 0, total_additions: 0, total_non_empty_lines: 0, total_symbol_count: 0 };
        const commitStat = commitStats.find((stat: { user_id: string }) => stat.user_id === userId);

        console.log(`User ID: ${userId}`, { user, commitStat });

        return {
          ...user,
          name: user.name || userId,
          ...commitStat,
          rank: userMetric.rank
        };
      });

      // Sort by rank and limit to 300 rows
      const sortedAndLimitedData = mergedData.sort((a: User, b: User) => a.rank - b.rank).slice(0, 300);

      console.log('Sorted and Limited Data:', sortedAndLimitedData);

      setUsers(sortedAndLimitedData);
    };
    getUsers();
  }, []);

  return (
    <div>
      <p style={{ whiteSpace: 'pre-wrap' }}>
      <br />
        It&apos;s really hard to know who is a legit engineer, and I often don&apos;t know who the best person to follow is. 
        Even if I stumble upon a great engineer, it&apos;s hard to understand their recent stats just by looking at their GitHub profile. 
        My frustration grew to a point where I decided to fix that and created this developer leaderboard. 
        <br />
        <br />
        Things to do next: make it run continuously to search for new best performers and update existing ones. 
        Add LLM as a judge to rank commits by complexity. Adjust the algorithm to account for repetitive code. 
        Exclude commits that only update dependencies, types, names, CSS styles, etc. 
        <br />
        <br />
        Happy for your feedback. Discord: matthew.ddy, X: @MatthewHeartful, email: i@m13v.com
        <br />
        <br />
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Followers</TableHead>
            <TableHead>Total Contributions</TableHead>
            <TableHead>30 Day Commits</TableHead>
            <TableHead>30 Day Additions</TableHead>
            <TableHead>30 Day Non-Empty Non-Comments Lines</TableHead>
            {/* <TableHead>Total Symbol Count</TableHead> */}
            <TableHead>Joined</TableHead>
            <TableHead>Github</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.github_link}>
              <TableCell>{user.rank}</TableCell>
              <TableCell>
                <img src={user.avatar} alt="avatar" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.followers}</TableCell>
              <TableCell>{user.total_contributions}</TableCell>
              <TableCell>{user.total_commits}</TableCell>
              <TableCell>{user.total_additions}</TableCell>
              <TableCell>{user.total_non_empty_lines}</TableCell>
              {/* <TableCell>{user.total_symbol_count}</TableCell> */}
              <TableCell>{new Date(user.joined).toLocaleDateString()}</TableCell>
              <TableCell>
                <a href={user.github_link} target="_blank" rel="noopener noreferrer">
                    <img src="/github.svg" alt="Github" style={{ width: '20px', height: '20px' }} />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;