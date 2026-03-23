import { loadCards } from './data/store.js'
import { newCardDeck } from './ordering/cardproducer.js'
import { newCardShuffler } from './ordering/prioritization/cardshuffler.js'
import { newMostMistakesFirstSorter } from './ordering/prioritization/mostmistakes.js'
import { newRecentMistakesFirstSorter } from './ordering/prioritization/recentmistakes.js'
import { newNonRepeatingCardOrganizer, newRepeatingCardOrganizer } from './ordering/repetition/cardrepeater.js'
import { newCombinedCardOrganizer } from './ordering/cardorganizer.js'
import { newUI } from './ui.js'

// ─────────────────────────────────────────────────────
// Даалгавар 1: Командын мөрийн интерфэйс
// ─────────────────────────────────────────────────────

const VALID_ORDERS = ['random', 'worst-first', 'recent-mistakes-first']

function printHelp (): void {
  console.log(`
Usage: flashcard <cards-file> [options]

Options:
  --help                    Show this help message
  --order <order>           Card order (default: "random")
                            Options: random | worst-first | recent-mistakes-first
  --repetitions <num>       Times to answer correctly per card (default: 1)
  --invertCards             Swap question and answer (default: false)
`)
}

const args = process.argv.slice(2)

// --help: бусад сонголттой хослуулсан ч зөвхөн help харуулж гарна
if (args.includes('--help')) {
  printHelp()
  process.exit(0)
}

// Файл аргумент заавал шаардлагатай
if (args.length === 0) {
  console.error('Error: No cards file specified.')
  printHelp()
  process.exit(1)
}

const cardsFile = args[0]

// --order утга задлах (default: random)
const orderIndex = args.indexOf('--order')
const order = orderIndex !== -1 ? args[orderIndex + 1] : 'random'

if (!VALID_ORDERS.includes(order)) {
  console.error('Error: Invalid order "' + order + '". Valid options: ' + VALID_ORDERS.join(', '))
  process.exit(1)
}

// --repetitions утга задлах (default: 1)
const repIndex = args.indexOf('--repetitions')
const repetitions = repIndex !== -1 ? parseInt(args[repIndex + 1], 10) : 1

if (isNaN(repetitions) || repetitions < 1) {
  console.error('Error: --repetitions must be a positive integer.')
  process.exit(1)
}

// --invertCards тохиргоо
const invertCards = args.includes('--invertCards')

// ─────────────────────────────────────────────────────
// Картын файл уншина
// ─────────────────────────────────────────────────────
let store = loadCards(cardsFile)
if (invertCards) {
  store = store.invertCards()
}

// ─────────────────────────────────────────────────────
// Даалгавар 2: CardOrganizer сонгох (existing pattern)
// ─────────────────────────────────────────────────────
function buildOrderOrganizer () {
  if (order === 'worst-first') return newMostMistakesFirstSorter()
  if (order === 'recent-mistakes-first') return newRecentMistakesFirstSorter()
  return newCardShuffler()
}

const repetitionOrganizer = repetitions > 1
  ? newRepeatingCardOrganizer(repetitions)
  : newNonRepeatingCardOrganizer()

const combinedOrganizer = newCombinedCardOrganizer([
  buildOrderOrganizer(),
  repetitionOrganizer
])

const cardDeck = newCardDeck(store.getAllCards(), combinedOrganizer)

// ─────────────────────────────────────────────────────
// Ажиллуулна
// ─────────────────────────────────────────────────────
newUI().studyCards(cardDeck)
