const extractCountFromCommit = (commitData) => {
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/g;

    const symbolsDetails = commitData.files.map(file => {
        if (!file.patch) {
            return {
                filename: file.filename,
                additions: '',
                symbol_count: 0,
                non_empty_lines: 0
            };
        }

        const additions = file.patch.split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++') && line.trim() !== '+');
        const additionsText = additions.join('\n');
        const cleanedText = additionsText.split('\n').map(line => line.replace(/^\+/, '')).join('\n');
        const symbolCount = cleanedText.length;
        const nonEmptyLines = additions.filter(line => line.trim().length > 0).length;

        return {
            filename: file.filename,
            additions: additionsText,
            symbol_count: symbolCount,
            non_empty_lines: nonEmptyLines 
        };
    });

    return symbolsDetails;
};

module.exports = extractCountFromCommit;