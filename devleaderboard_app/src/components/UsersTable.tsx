"use client"; // Ensure this line is present

import { useEffect, useState } from 'react';
import { fetchUsers } from '../lib/fetchUsers';
import { fetchUserCommitStats } from '../lib/fetchUserCommitStats';
import { fetchUserMetrics } from '../lib/fetchUserMetrics'; // Import the new method
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '../components/ui/table';

interface User {
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

const UsersTable = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      const usersData: User[] = await fetchUsers();
      const commitStats = await fetchUserCommitStats();
      const userMetrics = await fetchUserMetrics(); // Fetch the new data

      // Extract user_id from github_link
      const extractUserId = (githubLink: string) => githubLink.split('/').pop() || '';

      // Merge the commit stats and user metrics with the user data
      const mergedData = usersData.map(user => {
        const userId = extractUserId(user.github_link);
        return {
          ...user,
          name: user.name || userId, // Insert username if name is not available
          ...commitStats.find((stat: { user_id: string }) => stat.user_id === userId), // Explicitly type 'stat'
          rank: userMetrics.find((metric: { user_id: string }) => metric.user_id === userId)?.rank || user.rank // Populate rank
        };
      });

      // Sort by rank in ascending order
      mergedData.sort((a, b) => a.rank - b.rank);

      setUsers(mergedData);
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
