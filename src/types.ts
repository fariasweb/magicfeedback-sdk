export type Key = string;

export type InitOptions = {
  url?: string;
  debug?: boolean;
};

export type NativeFeedback = {
  appId: string;
  answers: NativeFeedbackAnswer[];
  profile?: NativeFeedbackProfile;
};

export type NativeFeedbackAnswer = {
  id: string,
  type?: FEEDBACKAPPANSWERTYPE
  value: string[]
}

export type NativeFeedbackProfile = {
  [key: string]: string;
}

export enum FEEDBACKAPPANSWERTYPE {
  TEXT = 'TEXT',
  LONGTEXT = 'LONGTEXT',
  NUMBER = 'NUMBER',
  RADIO = 'RADIO',
  MULTIPLECHOICE = 'MULTIPLECHOICE',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN'
}