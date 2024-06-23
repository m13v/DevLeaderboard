function countSymbolsExcludingComments(code, language) {
    // Define comment patterns for different languages
    const commentPatterns = {
        'python': /^\s*#/,
        'js': /^\s*\/\//,
        'html': /^\s*<!--.*?-->/,
        'cpp': /^\s*\/\//,
        'rust': /^\s*\/\//
    };

    // Select the appropriate comment pattern
    const pattern = commentPatterns[language.toLowerCase()];
    if (!pattern) {
        throw new Error(`Unsupported language: ${language}`);
    }

    // Remove comments and count symbols
    let symbolCount = 0;
    code.split('\n').forEach(line => {
        if (line.trim() && !pattern.test(line.trim())) {
            // Remove whitespace and count remaining characters
            symbolCount += line.replace(/\s/g, '').length;
        }
    });

    return symbolCount;
}

// Example usage
// const codeSnippet = `
// def hello_world():
//     print("Hello, world!")  # This is a comment

// # Another comment
// hello_world()
// `;

// console.log(countSymbolsExcludingComments(codeSnippet, 'python'));  // Output: 34