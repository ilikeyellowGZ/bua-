export type GoalKind = 'colleagues' | 'family' | 'campus' | 'everyday';
export type StartingLevelChoice = 'new' | 'a-little' | 'conversation';

export type ActivityKind =
  | 'listen'
  | 'phrase-builder'
  | 'picture-match'
  | 'conversation'
  | 'comprehension'
  | 'dictation'
  | 'pronunciation'
  | 'speak'
  | 'sound-focus'
  | 'role-play';

export type AttemptStatus =
  'started' | 'answered' | 'correct' | 'incorrect' | 'skipped' | 'queued-for-sync' | 'synced';

export type UserProfile = {
  id: string;
  displayName: string;
  streakDays: number;
  dailyGoalMinutes: number;
  reminderLocalTime: string;
  startingLevelChoice: StartingLevelChoice;
};

export type Choice = {
  id: string;
  label: string;
  correct: boolean;
  imageKey?: string | undefined;
};

export type Activity = {
  id: string;
  kind: ActivityKind;
  order: number;
  required: boolean;
  prompt: string;
  translation?: string | undefined;
  answer?: string | undefined;
  choices?: Choice[] | undefined;
  audioAssetId?: string | undefined;
};

export type Lesson = {
  id: string;
  unitId: string;
  title: string;
  durationMinutes: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  activities: Activity[];
};

export type Unit = {
  id: string;
  courseId: string;
  title: string;
  order: number;
};

export type Course = {
  id: string;
  languageCode: string;
  languageName: string;
  title: string;
};

export type Attempt = {
  id: string;
  lessonRunId: string;
  activityId: string;
  status: AttemptStatus;
  createdAt: string;
};

export type PronunciationResult = {
  score: number;
  label: 'good-clarity' | 'keep-practicing';
  segmentScores: { segment: string; score: number; correct: boolean }[];
};

export type RolePlayTurn = {
  id: string;
  speaker: 'learner' | 'character' | 'coach';
  text: string;
  nextTurnIds: string[];
  translation?: string;
  /** For a learner turn: whether choosing it is the best reply. */
  correct?: boolean;
};

export type StreakState = {
  currentDays: number;
  longestDays: number;
  lastCompletedLocalDate: string;
};

export type Progress = {
  ownerId: string;
  totalXP: number;
  streak: StreakState;
};

export type ProgressUpdate = {
  progress: Progress;
  xpAwarded: number;
  streakExtended: boolean;
};

export type SpacedRepetitionItem = {
  itemId: string;
  ownerId: string;
  nextReviewAt: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
};

export type LessonCompletion = {
  id: string;
  lessonRunId: string;
  lessonId: string;
  userId: string;
  activeLearningSeconds: number;
  completedAt: string;
};

export type ContentPack = {
  id: string;
  version: number;
  checksum: string;
  lessonIds: string[];
};

export type SyncOperation = {
  id: string;
  ownerId: string;
  kind: 'attempt' | 'completion' | 'profile' | 'reminder' | 'purchase';
  aggregateId: string;
  payload: unknown;
  createdAt: string;
  attempts: number;
};
