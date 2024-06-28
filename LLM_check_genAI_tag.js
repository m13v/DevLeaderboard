const Groq = require('groq-sdk');
const dotenv = require('dotenv');
dotenv.config();

const groq = new Groq();

async function isGenAIRepo(repoJson) {
  const { name, description, owner, html_url, organization, topics, readme } = repoJson;
  const ownerLogin = owner?.login;
  const orgHtmlUrl = organization?.html_url;

  const repoInfo = `
    Name: ${name}
    Description: ${description}
    Owner: ${ownerLogin}
    Repo URL: ${html_url}
    Org URL: ${orgHtmlUrl}
    Topics: ${topics}
    README: ${readme ? readme.substring(0, 500) : 'No README available'}
  `;

  try {
    // First call to generate a text summary
    const textSummaryCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: `Is the following repository related to generative AI or machine learning? ${repoInfo}` }],
      model: 'llama3-70b-8192',
      temperature: 0.5,
      max_tokens: 100,
    });

    const textSummary = textSummaryCompletion.choices[0].message.content.trim();

    // Second call to get a JSON response based on the text summary
    const jsonCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: `Is the following repository related to generative AI? ${textSummary} Answer in json format with {"related_to_generative_ai": "yes"} or {"related_to_generative_ai": "no"}.` }],
      model: 'llama3-70b-8192',
      temperature: 0.0,
      max_tokens: 10,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(jsonCompletion.choices[0].message.content.trim());
    console.log(`Repo: ${name} | Summary: ${textSummary.substring(0, 100)} | Response: ${JSON.stringify(response)}`);
    return response.related_to_generative_ai === 'yes' ? 'yes' : 'no';
  } catch (error) {
    if (error.status === 429) {
      const retryAfter = parseInt(error.headers['retry-after'], 10) * 1000;
      console.log(`Rate limit reached. Retrying after ${retryAfter / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      return isGenAIRepo(repoJson); // Retry the function
    } else {
      throw error;
    }
  }
}

module.exports = { isGenAIRepo };
