import { FlashCard } from './cards/flashcard.js'
import { CardStatus } from './cards/cardstatus.js'
import { CardDeck } from './ordering/cardproducer.js'
import readline from 'readline-sync'

interface UI {
  studyCards: (producer: CardDeck) => void
}

function newUI (): UI {
  // ─────────────────────────────────────────────────────
  // Даалгавар 3: Achievements — санах ойд хадгалах тоолуур
  // ─────────────────────────────────────────────────────

  // REPEAT: нэг картад хэдэн удаа хариулсан (нийт)
  const totalAnswerCounts = new Map<FlashCard, number>()
  // CONFIDENT: нэг картад хэдэн удаа ЗӨВ хариулсан (нийт)
  const totalCorrectCounts = new Map<FlashCard, number>()

  function updateStats (card: FlashCard, correct: boolean): void {
    totalAnswerCounts.set(card, (totalAnswerCounts.get(card) ?? 0) + 1)
    if (correct) {
      totalCorrectCounts.set(card, (totalCorrectCounts.get(card) ?? 0) + 1)
    }
  }

  // CORRECT: тойрогт бүх карт зөв хариулагдсан эсэх шалгана
  function checkCorrect (cards: CardStatus[]): boolean {
    return cards.every(cs => {
      const results = cs.getResults()
      return results.length > 0 && results[results.length - 1]
    })
  }

  // REPEAT: нэг картад 5-аас олон удаа хариулсан
  function checkRepeat (): boolean {
    for (const count of totalAnswerCounts.values()) {
      if (count > 5) return true
    }
    return false
  }

  // CONFIDENT: нэг картад дор хаяж 3 удаа ЗӨВ хариулсан
  function checkConfident (): boolean {
    for (const count of totalCorrectCounts.values()) {
      if (count >= 3) return true
    }
    return false
  }

  function printAchievements (cards: CardStatus[]): void {
    if (checkCorrect(cards)) {
      console.log('🏆 Achievement unlocked: CORRECT — All cards answered correctly this round!')
    }
    if (checkRepeat()) {
      console.log('🔁 Achievement unlocked: REPEAT — Answered one card more than 5 times!')
    }
    if (checkConfident()) {
      console.log('💪 Achievement unlocked: CONFIDENT — Answered one card correctly 3+ times!')
    }
  }

  // ─────────────────────────────────────────────────────
  // Картуудыг асуух
  // ─────────────────────────────────────────────────────

  function cueCard (card: FlashCard): boolean {
    console.log('\nNext cue: ' + card.getQuestion())
    const line = readline.question('answer> ')
    const success = card.checkSuccess(line)
    if (success) {
      console.log("That's correct!")
    } else {
      console.log('That is incorrect; the correct response was: ' + card.getAnswer())
    }
    return success
  }

  function cueAllCards (producer: CardDeck): CardStatus[] {
    const snapshot = producer.getCards()
    for (const cardStatus of snapshot) {
      const card = cardStatus.getCard()
      const correct = cueCard(card)
      cardStatus.recordResult(correct)
      // Achievements тоолуур шинэчлэнэ
      updateStats(card, correct)
    }
    return snapshot
  }

  return {
    /**
     * Prompts the user with FlashCard cards until the CardDeck is exhausted.
     * Checks achievements after each round.
     *
     * @param producer The CardDeck to use for organizing cards.
     */
    studyCards (producer: CardDeck): void {
      while (!producer.isComplete()) {
        console.log(`\n${producer.countCards()} cards to go...`)
        const roundCards = cueAllCards(producer)

        // Даалгавар 3: Тойрог бүрийн эцэст achievements шалгана
        printAchievements(roundCards)

        console.log('Reached the end of the card deck, reorganizing...')
        producer.reorganize()
      }
      console.log('Finished all cards. Yay.')
    }
  }
}

export { newUI }
