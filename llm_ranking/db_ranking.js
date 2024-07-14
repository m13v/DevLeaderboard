const { supabaseClient } = require('../supabase_client.js');

const supabase = supabaseClient;

async function getCommits() {
  const { data, error } = await supabaseClient
    .from('completed_shas')
    .select('*')
    .order('compared_to', { ascending: false }) // Prioritize NULLs first nullsFirst: true
    .limit(10);

  if (error) {
    console.error('Error fetching queue contents:', error);
    return [];
  }

  console.log(`Total records fetched: ${data.length}`);
  return data;
}

async function updateCommitFields(commitId, summary, rank, comparedTo) {
  const { data, error } = await supabaseClient
    .from('completed_shas')
    .update({ summary, rank, compared_to: comparedTo })
    .eq('id', commitId);

  if (error) {
    console.error('Error updating commit fields:', error);
    return null;
  }

  console.log(`Commit with ID ${commitId} updated successfully.`);
  return data;
}

module.exports = { getCommits, updateCommitFields };