/**
 * Standardizes name formatting with proper capitalization and spacing
 * @param {string} name - The name to format
 * @returns {string} - Properly formatted name
 */
export const formatName = (name) => {
  if (!name || typeof name !== 'string') return '';

  // Trim excess spaces and reduce multiple spaces to single
  const trimmed = name.trim().replace(/\s+/g, ' ');

  // Convert to title case (capitalize first letter of each word)
  return trimmed.split(' ')
    .map(word => {
      if (!word) return '';

      // Handle hyphenated names (Smith-Jones)
      if (word.includes('-')) {
        return word.split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join('-');
      }

      // Handle Mc and Mac prefixes specially (e.g., McDonald, MacIntosh)
      if (/^(mc|mac)/i.test(word)) {
        const prefix = word.substring(0, word.startsWith('Mac') ? 3 : 2);
        const rest = word.substring(word.startsWith('Mac') ? 3 : 2);
        return prefix.charAt(0).toUpperCase() +
          prefix.slice(1).toLowerCase() +
          rest.charAt(0).toUpperCase() +
          rest.slice(1).toLowerCase();
      }

      // Special case for names with internal capitals like O'Reilly, D'Angelo
      if (word.includes("'")) {
        const parts = word.split("'");
        return parts[0].charAt(0).toUpperCase() +
          parts[0].slice(1).toLowerCase() +
          "'" +
          parts[1].charAt(0).toUpperCase() +
          parts[1].slice(1).toLowerCase();
      }

      // Handle Roman numerals (II, III, IV, etc.)
      if (/^(IX|IV|V?I{0,3})$/i.test(word)) {
        return word.toUpperCase();
      }

      // Handle common name prefixes (van, von, de, la, etc.)
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

      // Handle names with periods (St., Jr., Sr., etc.)
      if (word.includes('.')) {
        const parts = word.split('.');
        return parts.map((part, index) => {
          if (part === '') return '.';
          // If it's a single letter followed by a period (like A.B.C.)
          if (part.length === 1 && index < parts.length - 1) {
            return part.toUpperCase() + '.';
          }
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() +
            (index < parts.length - 1 ? '.' : '');
        }).join('');
      }

      // Default case: capitalize first letter, lowercase the rest
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
    'surname', 'player', 'competitor'
  ];

  const lowercaseHeader = header.toLowerCase();
  return nameRelatedTerms.some(term => lowercaseHeader.includes(term));
};