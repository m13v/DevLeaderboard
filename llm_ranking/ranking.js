const callSambaverseAPI = require('./llm_call.js');
const { getCommits, updateCommitFields } = require('./db_ranking.js');
const { prompt_compare, prompt_summarize, prompt_aggregate, systemPrompt_compare, examples_comparison } = require('./prompt.js');

function chunkStringByWords(str, wordLimit) {
    const words = str.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += wordLimit) {
        chunks.push(words.slice(i, i + wordLimit).join(' '));
    }
    return chunks;
}

function countWords(str) {
    return str.trim().split(/\s+/).length;
}

async function processCommits() {
    try {
        while (true) {
            const commits = await getCommits();
            if (commits.length < 2) {
                console.log('Not enough commits data');
                continue;
            }

            for (let i = 0; i < commits.length - 1; i += 2) {
                let commitData1 = commits[i].additions_data;
                // console.log('commitData1:',commitData1);
                let commitData2 = commits[i + 1].additions_data;
                // console.log('commitData2:',commitData2);


                // Store rank and summary fields in separate variables, assigning 0 if rank is null
                let commitRank1 = commits[i].rank ?? 0;
                let commitSummary1 = commits[i].summary;
                let commitRank2 = commits[i + 1].rank ?? 0;
                let commitSummary2 = commits[i + 1].summary;

                // Ensure commitData1 and commitData2 are strings
                if (typeof commitData1 !== 'string') {
                    commitData1 = JSON.stringify(commitData1);
                }
                if (typeof commitData2 !== 'string') {
                    commitData2 = JSON.stringify(commitData2);
                }

                // Skip chunk processing if summaries are not empty
                if (!commitSummary1) {
                    // Split commit data into chunks of 8000 words each
                    const chunks1 = chunkStringByWords(commitData1, 8000);

                    // Process chunks1
                    let responses1 = [];
                    for (const chunk of chunks1) {
                        let call_prompt = `${prompt_summarize}: ${chunk}`;
                        console.log('call_prompt len=', call_prompt.length);
                        // console.log('call_prompt=', call_prompt);
                        const response = await callSambaverseAPI(call_prompt);
                        responses1.push(response);
                    }
                    commitSummary1 = responses1.join(' ');
                }

                if (!commitSummary2) {
                    // Split commit data into chunks of 8000 words each
                    const chunks2 = chunkStringByWords(commitData2, 8000);

                    // Process chunks2
                    let responses2 = [];
                    for (const chunk of chunks2) {
                        let call_prompt = `${prompt_summarize}: ${chunk}`;
                        console.log('call_prompt len=', call_prompt.length);
                        // console.log('call_prompt=', call_prompt);
                        const response = await callSambaverseAPI(call_prompt);
                        responses2.push(response);
                    }
                    commitSummary2 = responses2.join(' ');
                }

                console.log('Combined Response 1:', commitSummary1);
                console.log('Combined Response 2:', commitSummary2);

                const chunks1 = chunkStringByWords(commitData1, 8000);
                const chunks2 = chunkStringByWords(commitData2, 8000);

                if (chunks1.length > 1) {
                    const aggregatePrompt1 = `${prompt_aggregate} RESPONSES: ${commitSummary1}`;
                    const aggregateResponse1 = await callSambaverseAPI(aggregatePrompt1);
                    commitSummary1 = aggregateResponse1;
                }

                if (chunks2.length > 1) {
                    const aggregatePrompt2 = `${prompt_aggregate} RESPONSES: ${commitSummary2}`;
                    const aggregateResponse2 = await callSambaverseAPI(aggregatePrompt2);
                    commitSummary2 = aggregateResponse2;
                }

                // Combine chunks into a single array of strings
                const combinedChunks = chunkStringByWords(commitData1, 8000).concat(chunkStringByWords(commitData2, 8000));

                // Calculate number of words and symbols
                const combinedData = combinedChunks.join(' ');
                const wordCountC = combinedData.trim().split(/\s+/).length;
                const symbolCount = combinedData.replace(/\s+/g, '').length;

                console.log(`Number of words: ${wordCountC}`);
                console.log(`Number of symbols: ${symbolCount}`);

                let combinedData_final;
                if (countWords(commitData1) < 8000 && countWords(commitData2) < 8000) {
                    combinedData_final = `${prompt_compare} """"COMMIT "1":${commitSummary1}, ${commitData1}"""", """"COMMIT "2"${commitSummary2}, ${commitData2}"""" `;
                } else {
                    combinedData_final = `${prompt_compare} """"COMMIT "1":${commitSummary1}"""", """"COMMIT "2"${commitSummary2}"""" `;
                }

                const combinedDataResponse = await callSambaverseAPI(combinedData_final); // , systemPrompt_compare, examples_comparison
                // console.log('combinedDataResponse=', combinedDataResponse);

                const firstDigitMatch = combinedDataResponse.match(/[12]/);
                if (firstDigitMatch) {
                    const firstDigit = firstDigitMatch[0];
                    // console.log('First digit found:', firstDigit);

                    if (firstDigit === '1') {
                        commitRank1 += 1;
                        commitRank2 -= 1;
                    } else if (firstDigit === '2') {
                        commitRank1 -= 1;
                        commitRank2 += 1;
                    }

                    console.log('Updated commitRank1:', commitRank1);
                    console.log('Updated commitRank2:', commitRank2);
                } else {
                    console.log('No digit 1 or 2 found in the response.');
                }

                // Increment the comparedTo field for each commit
                let comparedTo1 = commits[i].comparedTo ?? 0;
                let comparedTo2 = commits[i + 1].comparedTo ?? 0;
                comparedTo1 += 1;
                comparedTo2 += 1;

                // Update commit fields in the database
                updateCommitFields(commits[i].id, commitSummary1, commitRank1, comparedTo1);
                updateCommitFields(commits[i + 1].id, commitSummary2, commitRank2, comparedTo2);
            }
        }
    } catch (error) {
        console.error('Error processing commits:', error);
    }
}

// Call the function to process commits
processCommits();