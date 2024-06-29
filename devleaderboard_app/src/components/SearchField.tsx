"use client"; // Add this line to make it a client component

import React from 'react';
import { callHelloWorldFunction } from '../lib/hello-world';

const SomeComponent = () => {
  const handleClick = async () => {
    const response = await callHelloWorldFunction('Matthew');
    console.log('Function response:', response);
  };

  return (
    <div>
      <button onClick={handleClick}>Call Hello World Function</button>
    </div>
  );
};

export default SomeComponent;