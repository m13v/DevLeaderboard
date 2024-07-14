require('dotenv').config({ path: '/Users/matthewdi/Desktop/jamba_hackathon/.env' });

async function callSambaverseAPI(userInput, systemPrompt = "", examples = []) {
  // Ensure examples is an array
  if (!Array.isArray(examples)) {
    throw new TypeError('examples must be an array');
  }

  const url = 'https://hazba8dyu8vwhe6j.snova.ai/api/v1/chat/completion';
  const apiKey = process.env.SAMBA_API_KEY;

  if (!apiKey) {
    throw new Error('SAMBA_API_KEY is not set in the environment variables');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${apiKey}`
  };

  const data = {
    inputs: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput }
    ],
    max_tokens: 800,
    stop: ["\n"],
    model: "llama3-70b"
  };

  // console.log('Sending request to:', url);
  // console.log('Request headers:', headers);
  // console.log('Request body:', JSON.stringify(data, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    // process.stdout.write('AI: ');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // console.log('Raw chunk:', chunk); // Debugging line to see the raw chunk

      // Extract JSON part from the chunk
      const jsonString = chunk.split('\n').find(line => line.startsWith('data: '));
      if (jsonString) {
        try {
          const jsonChunk = JSON.parse(jsonString.slice(6)); // Remove 'data: ' prefix
          const streamToken = jsonChunk.stream_token;
          if (streamToken) {
            // process.stdout.write(streamToken);
            fullResponse += streamToken;
          }
        } catch (error) {
          console.error('Error parsing JSON chunk:', error); // Debugging line for parsing errors
        }
      }
    }

    // console.log('\n'); // New line after all tokens are printed
    console.log(fullResponse);
    return fullResponse;
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = callSambaverseAPI;

// Example usage
// callSambaverseAPI("Hello, how are you?").then(result => {
//   console.log('Final result:', result);
// });