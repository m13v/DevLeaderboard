const extractCountFromCommit = (commitData) => {
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/g;

    const symbolsDetails = commitData.files.map(file => {
        const additions = file.patch.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++'));
        const symbols = additions.join('\n').match(symbolRegex) || [];
        const symbolCount = symbols.length;
        const nonEmptyLines = additions.filter(line => line.trim().length > 0).length;

        return {
            filename: file.filename,
            additions: additions.join('\n'),
            symbol_count: symbolCount,
            non_empty_lines: nonEmptyLines 
        };
    });

    return symbolsDetails;
};

module.exports = extractCountFromCommit;