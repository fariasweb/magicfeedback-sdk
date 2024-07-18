enum TransitionType {
    PAGE = 'PAGE',
    // Add other possible transition types if needed
}

enum ConditionType {
    LOGICAL = 'LOGICAL',
    // Add other possible condition types if needed
}

enum OperatorType {
    EQUAL = 'EQUAL',
    // Add other possible operator types if needed
}

enum StatusType {
    ACTIVE = 'ACTIVE',
    // Add other possible status types if needed
}

export interface PageRoute {
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
}