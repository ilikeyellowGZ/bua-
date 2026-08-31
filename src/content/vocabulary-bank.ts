import type { Lesson } from '@/types/domain';

export type VocabEntry = {
  id: string;
  zulu: string;
  english: string;
  /** Key into the illustrated scene-art map (see core-activities.tsx's `scenes`).
   * Only water/bread/house/family have bespoke art — everything else falls
   * back to a text card in picture-match. */
  imageKey?: string;
};

export type PhraseEntry = {
  id: string;
  zulu: string;
  english: string;
};

export type Topic = {
  id: string;
  title: string;
  level: Lesson['level'];
  vocab: readonly VocabEntry[];
  /** 4 phrases per topic so 4 generated lessons per topic each get a
   * different "hero phrase" drilled across listen/phrase-builder/dictation/
   * pronunciation/speak. */
  phrases: readonly PhraseEntry[];
};

/**
 * Reused across every topic as the shared tail of each topic's phrase list —
 * high-frequency survival phrases are worth repeating across lessons
 * (real spaced-repetition value), and reusing a small, careful set keeps the
 * correctness surface small. See the isiZulu-content caveat in the plan:
 * this bank should get a native-speaker review pass before public launch.
 */
const globalSafePhrases: readonly PhraseEntry[] = [
  { id: 'global-wellbeing', zulu: 'Ngiyaphila, ngiyabonga.', english: "I'm fine, thank you." },
  { id: 'global-thanks', zulu: 'Ngiyabonga kakhulu.', english: 'Thank you very much.' },
  { id: 'global-price', zulu: 'Kubiza malini?', english: 'How much does it cost?' },
  { id: 'global-sorry', zulu: 'Ngiyaxolisa.', english: "I'm sorry." },
  { id: 'global-farewell', zulu: 'Hamba kahle.', english: 'Go well. (Goodbye)' },
];

function withGlobalTail(topicIndex: number, ...ownPhrases: PhraseEntry[]): PhraseEntry[] {
  const first = globalSafePhrases[topicIndex % globalSafePhrases.length];
  const second = globalSafePhrases[(topicIndex + 2) % globalSafePhrases.length];
  return [...ownPhrases, first, second].filter((entry): entry is PhraseEntry => Boolean(entry));
}

export const topics: readonly Topic[] = [
  {
    id: 'numbers',
    title: 'Numbers',
    level: 'Beginner',
    vocab: [
      { id: 'vocab-one', zulu: 'kunye', english: 'one' },
      { id: 'vocab-two', zulu: 'kubili', english: 'two' },
      { id: 'vocab-three', zulu: 'kuthathu', english: 'three' },
      { id: 'vocab-four', zulu: 'kune', english: 'four' },
    ],
    phrases: withGlobalTail(
      0,
      { id: 'numbers-one', zulu: 'Ngicela kunye.', english: 'One, please.' },
      { id: 'numbers-two', zulu: 'Ngifuna kubili.', english: 'I want two.' },
    ),
  },
  {
    id: 'family',
    title: 'Family',
    level: 'Beginner',
    vocab: [
      { id: 'vocab-mother', zulu: 'umama', english: 'mother', imageKey: 'family' },
      { id: 'vocab-father', zulu: 'ubaba', english: 'father' },
      { id: 'vocab-sister', zulu: 'udadewethu', english: 'my sister' },
      { id: 'vocab-brother', zulu: 'umfowethu', english: 'my brother' },
    ],
    phrases: withGlobalTail(
      1,
      { id: 'family-love-mother', zulu: 'Ngithanda umama wami.', english: 'I love my mother.' },
      {
        id: 'family-father-works',
        zulu: 'Ubaba wami usebenza kakhulu.',
        english: 'My father works a lot.',
      },
    ),
  },
  {
    id: 'food',
    title: 'Food',
    level: 'Beginner',
    vocab: [
      { id: 'vocab-water', zulu: 'amanzi', english: 'water', imageKey: 'water' },
      { id: 'vocab-bread', zulu: 'isinkwa', english: 'bread', imageKey: 'bread' },
      { id: 'vocab-meat', zulu: 'inyama', english: 'meat' },
      { id: 'vocab-milk', zulu: 'ubisi', english: 'milk' },
    ],
    phrases: withGlobalTail(
      2,
      { id: 'food-water-please', zulu: 'Ngicela amanzi.', english: 'Water, please.' },
      { id: 'food-delicious', zulu: 'Ukudla kumnandi.', english: 'The food is delicious.' },
    ),
  },
  {
    id: 'routine',
    title: 'Time & routine',
    level: 'Intermediate',
    vocab: [
      { id: 'vocab-home', zulu: 'ikhaya', english: 'home' },
      { id: 'vocab-work', zulu: 'umsebenzi', english: 'work' },
      { id: 'vocab-school', zulu: 'isikole', english: 'school' },
      { id: 'vocab-weekend', zulu: 'impelasonto', english: 'weekend' },
    ],
    phrases: withGlobalTail(
      3,
      { id: 'routine-going-to-work', zulu: 'Ngiya emsebenzini.', english: 'I am going to work.' },
      {
        id: 'routine-weekend-home',
        zulu: 'Ngihlala ekhaya ngempelasonto.',
        english: 'I stay at home on the weekend.',
      },
    ),
  },
  {
    id: 'weather',
    title: 'Weather & feelings',
    level: 'Intermediate',
    vocab: [
      { id: 'vocab-sun', zulu: 'ilanga', english: 'sun' },
      { id: 'vocab-rain', zulu: 'imvula', english: 'rain' },
      { id: 'vocab-wind', zulu: 'umoya', english: 'wind' },
      { id: 'vocab-cold', zulu: 'amakhaza', english: 'cold' },
    ],
    phrases: withGlobalTail(
      4,
      { id: 'weather-cold-today', zulu: 'Kuyabanda namuhla.', english: 'It is cold today.' },
      { id: 'weather-sun-hot', zulu: 'Ilanga liyashisa.', english: 'The sun is hot.' },
    ),
  },
  {
    id: 'shopping',
    title: 'Shopping',
    level: 'Intermediate',
    vocab: [
      { id: 'vocab-money', zulu: 'imali', english: 'money' },
      { id: 'vocab-shop', zulu: 'isitolo', english: 'shop' },
      { id: 'vocab-price', zulu: 'intengo', english: 'price' },
      { id: 'vocab-bag', zulu: 'ibhegi', english: 'bag' },
    ],
    phrases: withGlobalTail(
      0,
      { id: 'shopping-going', zulu: 'Ngiya esitolo.', english: 'I am going to the shop.' },
      {
        id: 'shopping-expensive',
        zulu: 'Le ntengo iphezulu kakhulu.',
        english: 'This price is very high.',
      },
    ),
  },
  {
    id: 'campus',
    title: 'Campus life',
    level: 'Intermediate',
    vocab: [
      { id: 'vocab-university', zulu: 'inyuvesi', english: 'university' },
      { id: 'vocab-book', zulu: 'incwadi', english: 'book' },
      { id: 'vocab-teacher', zulu: 'uthisha', english: 'teacher' },
      { id: 'vocab-student', zulu: 'umfundi', english: 'student' },
    ],
    phrases: withGlobalTail(
      1,
      { id: 'campus-study', zulu: 'Ngifunda enyuvesi.', english: 'I study at university.' },
      { id: 'campus-good-teacher', zulu: 'Uthisha wami muhle.', english: 'My teacher is good.' },
    ),
  },
  {
    id: 'transport',
    title: 'Directions & transport',
    level: 'Advanced',
    vocab: [
      { id: 'vocab-road', zulu: 'indlela', english: 'road' },
      { id: 'vocab-bus', zulu: 'ibhasi', english: 'bus' },
      { id: 'vocab-taxi', zulu: 'itekisi', english: 'taxi' },
      { id: 'vocab-station', zulu: 'isiteshi', english: 'station' },
    ],
    phrases: withGlobalTail(
      2,
      { id: 'transport-daily-bus', zulu: 'Ngigibela ibhasi nsuku zonke.', english: 'I take the bus every day.' },
      {
        id: 'transport-which-way',
        zulu: 'Iphi indlela eya edolobheni?',
        english: 'Which way goes to town?',
      },
    ),
  },
  {
    id: 'work',
    title: 'Work',
    level: 'Advanced',
    vocab: [
      { id: 'vocab-office', zulu: 'ihhovisi', english: 'office' },
      { id: 'vocab-boss', zulu: 'umqashi', english: 'boss' },
      { id: 'vocab-job', zulu: 'umsebenzi', english: 'job' },
      { id: 'vocab-computer', zulu: 'ikhompiyutha', english: 'computer' },
    ],
    phrases: withGlobalTail(
      3,
      { id: 'work-office', zulu: 'Ngisebenza ehhovisi.', english: 'I work in an office.' },
      { id: 'work-good-boss', zulu: 'Umqashi wami muhle.', english: 'My boss is good.' },
    ),
  },
  {
    id: 'health',
    title: 'Health',
    level: 'Advanced',
    vocab: [
      { id: 'vocab-doctor', zulu: 'udokotela', english: 'doctor' },
      { id: 'vocab-hospital', zulu: 'isibhedlela', english: 'hospital' },
      { id: 'vocab-medicine', zulu: 'umuthi', english: 'medicine' },
      { id: 'vocab-head', zulu: 'ikhanda', english: 'head' },
    ],
    phrases: withGlobalTail(
      4,
      { id: 'health-headache', zulu: 'Ikhanda lami liyabuhlungu.', english: 'My head hurts.' },
      { id: 'health-need-doctor', zulu: 'Ngidinga udokotela.', english: 'I need a doctor.' },
    ),
  },
];

/** Cycled by lesson index within a topic — topic-independent so any topic
 * can use them without needing bespoke conversational content. */
export const conversationTemplates = [
  {
    id: 'conv-help',
    prompt: 'Ngingakusiza?',
    translation: 'Can I help you?',
    correctReply: 'Yebo, ngicela usizo.',
    correctReplyEnglish: 'Yes, I would like help, please.',
    distractorReplies: ['Hamba kahle.', 'Ngiyaphila, ngiyabonga.'],
  },
  {
    id: 'conv-how-are-you',
    prompt: 'Unjani namuhla?',
    translation: 'How are you today?',
    correctReply: 'Ngiyaphila, ngiyabonga. Wena?',
    correctReplyEnglish: "I'm fine, thank you. And you?",
    distractorReplies: ['Kubiza malini?', 'Ngiyabonga kakhulu.'],
  },
] as const;
