function isValidUrl(string) {
  try {
      new URL(string);
      return true;
  } catch (err) {
      return false;
  }
}

function createGithubUrl(repoName) {
  const baseUrl = 'https://github.com/';
  return `${baseUrl}${repoName}`;
}

module.exports = { isValidUrl, createGithubUrl };

// // Example usage
// const repoName = 'matthew-heartful/DevLeaderboard';
// const repoUrl = createGithubUrl(repoName);

// console.log(isValidUrl(repoUrl)); // true
// console.log(repoUrl); // https://github.com/matthew-heartful/DevLeaderboard
