/**
 * Standardizes name formatting with proper capitalization and spacing
 * @param {string} name - The name to format
 * @returns {string} - Properly formatted name
 */
export const formatName = (name) => {
  if (!name || typeof name !== 'string') return '';

  const trimmed = name.trim().replace(/\s+/g, ' ');

  const words = trimmed.split(' ');
  for (let i = 0; i < words.length - 1; i++) {
    if (/^(Mac|Mc)$/i.test(words[i]) &&
      /^donald$/i.test(words[i + 1])) {
      words[i] = "Mc" + words[i + 1].charAt(0).toUpperCase() + words[i + 1].slice(1).toLowerCase();
      words.splice(i + 1, 1);
    }
  }

  return words
    .map(word => {
      if (!word) return '';

      if (word.includes('-')) {
        return word.split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join('-');
      }

      if (/^(mc|mac)/i.test(word)) {
        if (/^macdonald$/i.test(word) || /^mcdonald$/i.test(word)) {
          return "McDonald";
        }

        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      if (word.includes("'")) {
        const parts = word.split("'");
        return parts[0].charAt(0).toUpperCase() +
          parts[0].slice(1).toLowerCase() +
          "'" +
          parts[1].charAt(0).toUpperCase() +
          parts[1].slice(1).toLowerCase();
      }

      if (/^(IX|IV|V?I{0,3})$/i.test(word) || /^MBE$/i.test(word)) {
        return word.toUpperCase();
      }

      const lowerCasePrefixes = ['van', 'von', 'de', 'del', 'della', 'la', 'le', 'du', 'des', 'el', 'al'];
      for (const prefix of lowerCasePrefixes) {
        if (word.toLowerCase() === prefix) {
          return word.toLowerCase();
        }
        if (word.toLowerCase().startsWith(prefix + ' ')) {
          return prefix.toLowerCase() + ' ' +
            word.slice(prefix.length + 1).charAt(0).toUpperCase() +
            word.slice(prefix.length + 2).toLowerCase();
        }
      }

      if (word.includes('.')) {
        if (/^(jr|sr|st|mr|ms|dr|prof)\.$/i.test(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        if (/^([A-Za-z]\.)+$/.test(word) || /^([A-Za-z]\.)+[A-Za-z]$/.test(word)) {
          return word.toUpperCase();
        }

        if (/^[A-Za-z]+\.[A-Za-z]+\.$/i.test(word)) {
          if (/^ph\.d\.$/i.test(word)) {
            return "Ph.D.";
          }
          return word.toUpperCase();
        }

        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Format a full data row, applying name formatting to specified columns
 * @param {Array} row - Data row
 * @param {Array} nameColumnIndexes - Indexes of columns containing names
 * @returns {Array} - Formatted row
 */
export const formatDataRow = (row, nameColumnIndexes) => {
  if (!row || !Array.isArray(row)) return row;

  return row.map((cell, index) => {
    if (nameColumnIndexes.includes(index) && cell) {
      return formatName(cell);
    }
    return cell;
  });
};

/**
 * Helper function to determine if a column header likely contains name data
 * @param {string} header - The column header text
 * @returns {boolean} - Whether this column likely contains name data
 */
export const isNameColumn = (header) => {
  if (!header || typeof header !== 'string') return false;

  const nameRelatedTerms = [
    'name', 'player', 'golfer', 'participant',
    'member', 'person', 'first', 'last',
    'surname', 'player', 'competitor', 'amateur',
    'pro', 'professional', 'individual', 'entrant',
  ];

  const lowercaseHeader = header.toLowerCase();
  return nameRelatedTerms.some(term => lowercaseHeader.includes(term));
};