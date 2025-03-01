import React from 'react';

const Greetings = () => {
  const currentHour = new Date().getHours();

  let greet;
  if (currentHour >= 5 && currentHour < 12) {
    greet = 'Good Morning';
  } else if (currentHour >= 12 && currentHour < 18) {
    greet = 'Good Afternoon';
  } else {
    greet = 'Good Evening';
  }

  return <div>{greet}!</div>;
};

export default Greetings;
