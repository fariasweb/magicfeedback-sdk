export enum TransitionType {
    PAGE = "PAGE",
    FINISH = "FINISH",
    REDIRECT = "REDIRECT",
}

export enum ConditionType {
    LOGICAL = 'LOGICAL',
    DIRECT = 'DIRECT',
}

export enum OperatorType {
    EQUAL = "EQUAL",
    NOEQUAL = "NOEQUAL",
    GREATER = "GREATER",
    LESS = "LESS",
    GREATEREQUAL = "GREATEREQUAL",
    LESSEQUAL = "LESSEQUAL",
    INQ = "INQ",
    NINQ = "NINQ",
    DEFAULT = "DEFAULT",
}

export enum StatusType {
    ACTIVE = "ACTIVE",
    DEPRECATED = "DEPRECATED",
    DELETE = "DELETE",
}

export class PageRoute {
    id: string;
    questionRef: string;
    typeCondition: ConditionType;
    typeOperator: OperatorType;
    value: string | any; // Adjust type based on typeCondition
    transition: TransitionType;
    transitionDestiny: string;
    status: StatusType;
    generatedAt: Date;
    updatedAt: Date;
    integrationPageId: string;

    constructor(
        id: string,
        questionRef: string,
        typeOperator: OperatorType,
        value: string | any,
        transition: TransitionType,
        transitionDestiny: string,
        integrationPageId: string,
        typeCondition?: ConditionType
    ) {
        this.id = id;
        this.questionRef = questionRef;
        this.typeCondition = typeCondition || ConditionType.LOGICAL;
        this.typeOperator = typeOperator;
        this.value = value;
        this.transition = transition;
        this.transitionDestiny = transitionDestiny;
        this.status = StatusType.ACTIVE;
        this.generatedAt = new Date();
        this.updatedAt = new Date();
        this.integrationPageId = integrationPageId;
    }
}