// ArsipBelajar - Leitner 5-Box Spaced Repetition System (SRS)

export const BOX_INTERVALS_DAYS = {
  1: 1,
  2: 2,
  3: 5,
  4: 9,
  5: 14
};

/**
 * Format Date to YYYY-MM-DD in local time
 * @param {Date} date
 * @returns {string}
 */
export function formatDateISO(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate next Leitner box and due date
 * @param {number} currentBox (1 - 5)
 * @param {boolean} isRemembered
 * @param {Date|string} [fromDate]
 * @returns {{ box: number, dueAt: string }}
 */
export function calculateNextReview(currentBox, isRemembered, fromDate = new Date()) {
  const baseDate = new Date(fromDate);
  let newBox;

  if (isRemembered) {
    newBox = Math.min(5, Math.max(1, (currentBox || 1) + 1));
  } else {
    newBox = 1;
  }

  const intervalDays = BOX_INTERVALS_DAYS[newBox] || 1;
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    box: newBox,
    dueAt: formatDateISO(nextDate)
  };
}

/**
 * Update a card after a review session
 * @param {object} card
 * @param {boolean} isRemembered
 * @param {Date|string} [fromDate]
 * @returns {object} updated card
 */
export function reviewCard(card, isRemembered, fromDate = new Date()) {
  const { box, dueAt } = calculateNextReview(card.box, isRemembered, fromDate);
  return {
    ...card,
    box,
    dueAt
  };
}

/**
 * Check if a card is due for review today
 * @param {object} card
 * @param {Date|string} [today]
 * @returns {boolean}
 */
export function isDue(card, today = new Date()) {
  if (!card.dueAt) return true;
  const todayStr = formatDateISO(today);
  return card.dueAt <= todayStr;
}

/**
 * Filter cards that are due for review
 * @param {Array} cards
 * @param {Date|string} [today]
 * @returns {Array}
 */
export function getDueCards(cards, today = new Date()) {
  if (!Array.isArray(cards)) return [];
  return cards.filter(c => isDue(c, today));
}
