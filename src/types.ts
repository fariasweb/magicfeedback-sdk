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
  id: string;
  type?: FEEDBACKAPPANSWERTYPE;
  value: string[];
};

export type NativeFeedbackProfile = {
  [key: string]: string;
};

export enum FEEDBACKAPPANSWERTYPE {
  TEXT = "TEXT",
  LONGTEXT = "LONGTEXT",
  NUMBER = "NUMBER",
  RADIO = "RADIO",
  MULTIPLECHOICE = "MULTIPLECHOICE",
  DATE = "DATE",
  BOOLEAN = "BOOLEAN",
  SELECT = "SELECT",
}

export type NativeQuestion = {
  id: string;
  title: string;
  type: FEEDBACKAPPANSWERTYPE;
  ref: string;
  require: string;
  external_id: string;
  value: string[];
  defaultValue: string;
  appId: string;
};

export type NativeAnswer = {
  id: string;
  type: string;
  value: string[];
};

export type generateFormOptions = {
  addButton?: boolean;
  tag?: generateFormOptionsTag;
  afterSubmitEvent?: Function;
  beforeSubmitEvent?: Function;
};

enum generateFormOptionsTag {
  FORM = "form",
  DIV = "div",
}
