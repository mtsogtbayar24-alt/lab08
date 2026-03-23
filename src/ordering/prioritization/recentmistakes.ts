import { CardStatus } from '../../cards/cardstatus.js'
import { CardOrganizer } from '../cardorganizer.js'

function newRecentMistakesFirstSorter (): CardOrganizer {
  /**
   * Checks whether the last recorded result for a card was incorrect.
   * Cards with no results are treated as correct (not recent mistakes).
   *
   * @param cardStatus The {@link CardStatus} to check.
   * @return {@code true} if the most recent answer was incorrect.
   */
  function lastAnswerWasWrong (cardStatus: CardStatus): boolean {
    const results = cardStatus.getResults()
    if (results.length === 0) return false
    return !results[results.length - 1]
  }

  return {
    /**
     * Orders the cards so that those with a most-recent incorrect answer appear first.
     * The relative order within each group (wrong/correct) is preserved (stable sort).
     *
     * @param cards The {@link CardStatus} objects to order.
     * @return The ordered cards: recent mistakes first, then the rest.
     */
    reorganize: function (cards: CardStatus[]): CardStatus[] {
      const mistakes = cards.filter(c => lastAnswerWasWrong(c))
      const correct = cards.filter(c => !lastAnswerWasWrong(c))
      return [...mistakes, ...correct]
    }
  }
}

export { newRecentMistakesFirstSorter }
