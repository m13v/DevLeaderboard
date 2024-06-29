import React from 'react';
import UsersTable from '../components/UsersTable';
import SomeComponent from '../components/SearchField';

const HomePage = () => {
  return (
    <div>
      <h1>Open Source Developer Leaderboard</h1>
      <SomeComponent />
      <UsersTable />
    </div>
  );
};

export default HomePage;