import { buaSeedContent } from '@/content/seed';
import { generateLessonsForTopic } from '@/content/lesson-generator';
import { lessonSchema, unitSchema } from '@/content/schemas';
import { topics } from '@/content/vocabulary-bank';
import type { Lesson, Unit } from '@/types/domain';

const candidateUnits = [
  { id: 'unit-greetings', courseId: 'course-isi-zulu', title: 'Greetings', order: 1 },
  { id: 'unit-meeting-people', courseId: 'course-isi-zulu', title: 'Meeting people', order: 2 },
  { id: 'unit-getting-around', courseId: 'course-isi-zulu', title: 'Getting around', order: 3 },
  ...topics.map((topic, index) => ({
    id: `unit-${topic.id}`,
    courseId: 'course-isi-zulu',
    title: topic.title,
    order: index + 4,
  })),
] as const;

const meetingPeopleLesson = {
  id: 'lesson-meeting-people',
  unitId: 'unit-meeting-people',
  title: 'Meeting people',
  durationMinutes: 14,
  level: 'Intermediate',
  activities: [
    {
      id: 'activity-meeting-listen',
      kind: 'listen',
      order: 1,
      required: true,
      prompt: 'Sawubona! Unjani?',
      translation: 'Hello! How are you?',
      audioAssetId: 'audio-meeting-greeting',
    },
    {
      id: 'activity-meeting-phrase-builder',
      kind: 'phrase-builder',
      order: 2,
      required: true,
      prompt: "I'm fine, thank you.",
      answer: 'Ngikhona, ngiyabonga.',
      audioAssetId: 'audio-meeting-greeting',
    },
    {
      id: 'activity-meeting-picture-match',
      kind: 'picture-match',
      order: 3,
      required: true,
      prompt: 'Tap the picture for:',
      answer: 'umndeni',
      choices: [
        { id: 'picture-family', label: 'Family', correct: true, imageKey: 'family' },
        { id: 'picture-water-cup', label: 'Water', correct: false, imageKey: 'water' },
        { id: 'picture-house-plain', label: 'House', correct: false, imageKey: 'house' },
      ],
    },
    {
      id: 'activity-meeting-conversation',
      kind: 'conversation',
      order: 4,
      required: true,
      prompt: 'Ngubani igama lakho?',
      translation: "What's your name?",
      choices: [
        { id: 'meeting-reply-name', label: 'Igama lami nguSipho.', correct: true },
        { id: 'meeting-reply-wellbeing', label: 'Ngiyaphila, ngiyabonga.', correct: false },
        { id: 'meeting-reply-farewell', label: 'Hamba kahle.', correct: false },
      ],
    },
    {
      id: 'activity-meeting-comprehension',
      kind: 'comprehension',
      order: 5,
      required: true,
      prompt: 'Ngiyaphila, ngiyabonga. Wena unjani?',
      answer: "I'm well, thank you. How are you?",
      choices: [
        { id: 'meaning-well', label: "I'm well, thank you. How are you?", correct: true },
        { id: 'meaning-tired', label: "I'm tired today.", correct: false },
        { id: 'meaning-leaving', label: 'I have to go now.', correct: false },
      ],
    },
    {
      id: 'activity-meeting-dictation',
      kind: 'dictation',
      order: 6,
      required: true,
      prompt: 'Listen and type what you hear.',
      answer: 'Ngiyajabula ukukwazi.',
      audioAssetId: 'audio-meeting-pleasure',
    },
    {
      id: 'activity-meeting-pronunciation',
      kind: 'pronunciation',
      order: 7,
      required: true,
      prompt: 'Tap each part to practise.',
      answer: 'Ngiyajabula ukukwazi.',
      audioAssetId: 'audio-meeting-pleasure',
    },
    {
      id: 'activity-meeting-speak',
      kind: 'speak',
      order: 8,
      required: true,
      prompt: 'Say the phrase',
      answer: 'Ngikhona, ngiyabonga. Wena unjani?',
    },
  ],
} as const;

const gettingAroundLesson = {
  id: 'lesson-getting-around',
  unitId: 'unit-getting-around',
  title: 'Getting around',
  durationMinutes: 16,
  level: 'Advanced',
  activities: [
    {
      id: 'activity-around-listen',
      kind: 'listen',
      order: 1,
      required: true,
      prompt: 'Ngicela ukuya endaweni yamatekisi.',
      translation: "I'd like to go to the taxi rank, please.",
      audioAssetId: 'audio-around-taxi-request',
    },
    {
      id: 'activity-around-phrase-builder',
      kind: 'phrase-builder',
      order: 2,
      required: true,
      prompt: 'Where is the taxi rank?',
      answer: 'Ikuphi indawo yamatekisi?',
      audioAssetId: 'audio-around-taxi-request',
    },
    {
      id: 'activity-around-picture-match',
      kind: 'picture-match',
      order: 3,
      required: true,
      prompt: 'Tap the picture for:',
      answer: 'indlu',
      choices: [
        { id: 'picture-house', label: 'House', correct: true, imageKey: 'house' },
        { id: 'picture-bread-loaf', label: 'Bread', correct: false, imageKey: 'bread' },
        { id: 'picture-family-group', label: 'Family', correct: false, imageKey: 'family' },
      ],
    },
    {
      id: 'activity-around-conversation',
      kind: 'conversation',
      order: 4,
      required: true,
      prompt: 'Iyaphi le bhasi?',
      translation: 'Where does this bus go?',
      choices: [
        { id: 'around-reply-destination', label: 'Iya edolobheni.', correct: true },
        { id: 'around-reply-name', label: 'Igama lami nguSipho.', correct: false },
        { id: 'around-reply-thanks', label: 'Ngiyabonga kakhulu.', correct: false },
      ],
    },
    {
      id: 'activity-around-comprehension',
      kind: 'comprehension',
      order: 5,
      required: true,
      prompt: 'Jika ngakwesokudla emgwaqweni olandelayo.',
      answer: 'Turn right at the next street.',
      choices: [
        { id: 'meaning-turn-right', label: 'Turn right at the next street.', correct: true },
        { id: 'meaning-turn-left', label: 'Turn left at the robot.', correct: false },
        { id: 'meaning-straight', label: 'Go straight for two blocks.', correct: false },
      ],
    },
    {
      id: 'activity-around-dictation',
      kind: 'dictation',
      order: 6,
      required: true,
      prompt: 'Listen and type what you hear.',
      answer: 'Ngicela ukwehla lapha.',
      audioAssetId: 'audio-around-stop-request',
    },
    {
      id: 'activity-around-pronunciation',
      kind: 'pronunciation',
      order: 7,
      required: true,
      prompt: 'Tap each part to practise.',
      answer: 'Ngicela ukwehla lapha.',
      audioAssetId: 'audio-around-stop-request',
    },
    {
      id: 'activity-around-speak',
      kind: 'speak',
      order: 8,
      required: true,
      prompt: 'Say the phrase',
      answer: 'Ikuphi indawo yamatekisi?',
    },
  ],
} as const;

export const buaUnits: readonly Unit[] = candidateUnits.map((unit) => unitSchema.parse(unit));

const generatedLessons: readonly Lesson[] = topics.flatMap((topic) =>
  generateLessonsForTopic(topic, `unit-${topic.id}`),
);

export const buaLessons: readonly Lesson[] = [
  ...[buaSeedContent.lesson, meetingPeopleLesson, gettingAroundLesson].map((lesson) =>
    lessonSchema.parse(lesson),
  ),
  ...generatedLessons,
];

/**
 * Lessons generated on demand (the personalized review lesson) aren't part
 * of the static catalog above, but still need to be reachable through the
 * same `/lesson/[lessonId]/*` routes. The caller registers a freshly
 * generated lesson here before navigating to it, so `getLessonById` can find
 * it synchronously just like a catalog lesson.
 */
const ephemeralLessons = new Map<string, Lesson>();

export function registerEphemeralLesson(lesson: Lesson): void {
  ephemeralLessons.set(lesson.id, lesson);
}

export function getLessonById(lessonId: string): Lesson | undefined {
  return buaLessons.find((lesson) => lesson.id === lessonId) ?? ephemeralLessons.get(lessonId);
}

export function getUnitByLessonId(lessonId: string): Unit | undefined {
  const lesson = getLessonById(lessonId);
  return lesson ? buaUnits.find((unit) => unit.id === lesson.unitId) : undefined;
}
