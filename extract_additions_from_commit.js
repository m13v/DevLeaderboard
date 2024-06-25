const extractCountFromCommit = require('./count_symbols_in_additions.js');

function excludeComments(lines) {
  const singleLineCommentPatterns = [
    /^\s*\/\//,  // JavaScript, C++, Java, etc.
    /^\s*#/,     // Python, Ruby, Shell, etc.
    /^\s*--/,    // SQL, Ada, etc.
    /^\s*;/,     // Lisp, Assembly, etc.
    /^\s*%/,     // Prolog, LaTeX, etc.
  ];

  const multiLineCommentPatterns = [
    { start: /^\s*\/\*/, end: /\*\// },  // JavaScript, C++, Java, etc.
    { start: /^\s*<!--/, end: /-->/ },   // HTML
    { start: /^\s*"""/, end: /"""/ },    // Python
    { start: /^\s*\/\*/, end: /\*\// },  // CSS
  ];

  let inMultiLineComment = false;
  let multiLineCommentEndPattern = null;

  return lines.filter(line => {
    if (inMultiLineComment) {
      if (multiLineCommentEndPattern.test(line)) {
        inMultiLineComment = false;
        multiLineCommentEndPattern = null;
      }
      return false;
    }

    for (const pattern of singleLineCommentPatterns) {
      if (pattern.test(line)) {
        return false;
      }
    }

    for (const { start, end } of multiLineCommentPatterns) {
      if (start.test(line)) {
        inMultiLineComment = true;
        multiLineCommentEndPattern = end;
        return false;
      }
    }

    return true;
  });
}

async function extractAdditionsFromCommit(commitData) {
    if (!commitData || !commitData.files) {
        throw new Error('Invalid commit data');
    }

    const additions = commitData.files
        .filter(file => file.status === 'added' || file.status === 'modified')
        .map(file => file.patch)
        .filter(patch => patch)
        .map(patch => patch.split('\n'))
        .flat()
        .filter(line => line.startsWith('+') && !line.startsWith('+++'));

    let filteredAdditions = excludeComments(additions);

    let extractedData = commitData.files.map(file => ({
        filename: file.filename,
        additions: filteredAdditions.join('\n')
    }));

    extractedData = extractCountFromCommit({ files: commitData.files });
    return extractedData;
}

module.exports = { extractAdditionsFromCommit };
