export type Key = string;

export type InitOptions = {
    env?: 'dev' | 'prod';
    debug?: boolean;
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
    EMAIL = "EMAIL",
    PASSWORD = "PASSWORD",
    RATING = "RATING",
    CONTACT = "CONTACT",
    WIDGET_RATING_EMOJI_0_10 = "WIDGET_RATING_EMOJI_0_10",
    WIDGET_RATING_EMOJI_1_5 = "WIDGET_RATING_EMOJI_1_5",
    WIDGET_RATING_NUMBER_0_10 = "WIDGET_RATING_NUMBER_0_10",
    WIDGET_RATING_NUMBER_1_5 = "WIDGET_RATING_NUMBER_1_5",
    WIDGET_RATING_STAR_1_5 = "WIDGET_RATING_STAR_1_5",
}

export type NativeQuestion = {
    id: string;
    title: string;
    type: FEEDBACKAPPANSWERTYPE;
    ref: string;
    require: boolean;
    external_id: string;
    value: string[];
    defaultValue: string;
    appId: string;
    followup: boolean;
    position: number;
};

export type NativeAnswer = {
    key: string;
    value: string[];
};

export type NativeFeedback = {
    text: string,
    answers: NativeAnswer[],
    profile: NativeAnswer[],
    metrics: NativeAnswer[],
    metadata: NativeAnswer[],
}

export type generateFormOptions = {
    addButton?: boolean;
    sendButtonText?: string;
    backButtonText?: string;
    nextButtonText?: string;
    addSuccessScreen?: boolean;
    successMessage?: string;
    questionFormat?: "standard" | "slim";
    getMetaData?: boolean;
    tag?: generateFormOptionsTag;
    afterSubmitEvent?: Function;
    beforeSubmitEvent?: Function;
    onLoadedEvent?: Function;
};

enum generateFormOptionsTag {
    FORM = "form",
    DIV = "div",
}
