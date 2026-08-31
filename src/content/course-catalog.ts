import { buaSeedContent } from '@/content/seed';
import { lessonSchema, unitSchema } from '@/content/schemas';
import type { Lesson, Unit } from '@/types/domain';

const candidateUnits = [
  { id: 'unit-greetings', courseId: 'course-isi-zulu', title: 'Greetings', order: 1 },
  { id: 'unit-meeting-people', courseId: 'course-isi-zulu', title: 'Meeting people', order: 2 },
  { id: 'unit-getting-around', courseId: 'course-isi-zulu', title: 'Getting around', order: 3 },
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
      prompt: 'Choose the picture for family.',
      answer: 'umndeni',
      choices: [
        { id: 'picture-family', label: 'A family gathered together', correct: true },
        { id: 'picture-water-cup', label: 'A glass of water', correct: false },
        { id: 'picture-house-plain', label: 'A house', correct: false },
      ],
    },
    {
      id: 'activity-meeting-conversation',
      kind: 'conversation',
      order: 4,
      required: true,
      prompt: 'Ngubani igama lakho?',
      translation: "What's your name?",
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
      prompt: 'Choose the picture for house.',
      answer: 'indlu',
      choices: [
        { id: 'picture-house', label: 'A house', correct: true },
        { id: 'picture-bread-loaf', label: 'A loaf of bread', correct: false },
        { id: 'picture-family-group', label: 'A family', correct: false },
      ],
    },
    {
      id: 'activity-around-conversation',
      kind: 'conversation',
      order: 4,
      required: true,
      prompt: 'Iyaphi le bhasi?',
      translation: 'Where does this bus go?',
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

export const buaLessons: readonly Lesson[] = [
  buaSeedContent.lesson,
  meetingPeopleLesson,
  gettingAroundLesson,
].map((lesson) => lessonSchema.parse(lesson));

export function getLessonById(lessonId: string): Lesson | undefined {
  return buaLessons.find((lesson) => lesson.id === lessonId);
}

export function getUnitByLessonId(lessonId: string): Unit | undefined {
  const lesson = getLessonById(lessonId);
  return lesson ? buaUnits.find((unit) => unit.id === lesson.unitId) : undefined;
}
