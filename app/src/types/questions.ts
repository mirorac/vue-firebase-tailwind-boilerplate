import { Timestamp } from '@firebase/firestore-types'

export type Question = {
  id: string
  themes: string[]
  type: 'matching' | 'open-ended' | 'get-to-know'
  text: string
}

export type QuestionBundle<T extends Question | AcquiredQuestion = Question> = {
  id: string
  title: string
  description: string
  themes: string[]
  questions: { [questionId: string]: T }
  createdAt: Timestamp
}

export type AcquiredQuestion = Question & {
  answers: {
    [user: string]: {
      answer: string
      createdAt: Timestamp
    }
  }
}

export type AcquiredQuestionBundle = {
  bundleId: string
  linkId: string
  users: string[]
  bundle: QuestionBundle<AcquiredQuestion>
  createdAt: Timestamp
}
