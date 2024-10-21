import {
    describe,
    expect,
    beforeEach,
    test
} from "@jest/globals";
import {PageGraph} from "../src/models/pageGrafs";
import {FEEDBACKAPPANSWERTYPE, NativeQuestion} from "../src/models/types";
import {Page} from "../src/models/page";
import {ConditionType, OperatorType, PageRoute, StatusType, TransitionType} from "../src/models/pageRoute";


describe('pageGrafs', () => {
    let graph: PageGraph = new PageGraph([]);

    const defaultQuestions = (position: number, followUp: boolean): NativeQuestion => {
        return <NativeQuestion>{
            id: position.toString(),
            title: `Question ${position}`,
            type: 'TEXT',
            questionType: {conf: {}},
            ref: position.toString(),
            require: true,
            external_id: position.toString(),
            value: [''],
            defaultValue: '',
            appId: '1',
            followup: followUp,
            position: position,
            assets: {}
        }
    }
    
    const setGraph = (questions: NativeQuestion[]) => {
        const pages: Page[] = [
            ...questions.map((q, index) =>
                new Page(index.toString(), index, 'integration', [q], questions[index + 1] ? [
                    new PageRoute(index.toString(), q.ref, OperatorType.NOEQUAL, '', TransitionType.PAGE, (index + 1).toString(), 'test'),
                ] : []))
        ];

        graph = new PageGraph(pages);
    }

    const setGraphWithRoutes = (pages: Page[]) => {
        graph = new PageGraph(pages);
    }

    beforeEach(() => {

    });

    describe('findMaxDepth', () => {
        test('No follow up => total: 5', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, false),
                defaultQuestions(2, false),
                defaultQuestions(3, false),
                defaultQuestions(4, false),
                defaultQuestions(5, false)
            ];

            setGraph(questions)

            expect(graph.findMaxDepth()).toBe(5);
        });

        test('Followup only (F) => total: 2', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, true)
            ];

            setGraph(questions)

            expect(graph.findMaxDepth()).toBe(2);
        });

        test('Followup start (F^3) => total: 6', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, true),
                defaultQuestions(2, true),
                defaultQuestions(3, true)
            ];

            setGraph(questions)

            expect(graph.findMaxDepth()).toBe(6);
        });

        test('Followup start (F-N) => total: 3', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, true),
                defaultQuestions(2, false)
            ];

            setGraph(questions)

            expect(graph.findMaxDepth()).toBe(3);
        });

        test('Followup end (N-F) => total: 3', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, false),
                defaultQuestions(2, true)
            ];

            setGraph(questions)
            
            expect(graph.findMaxDepth()).toBe(3);
        });

        test('Followup middle (N-F-N^3) => total: 6', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, false),
                defaultQuestions(2, true),
                defaultQuestions(3, false),
                defaultQuestions(4, false),
                defaultQuestions(5, false)
            ];

            setGraph(questions)

            expect(graph.findMaxDepth()).toBe(6);
        });

        test('Followup middle (N-F-N-F-N) => total: 7', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, false),
                defaultQuestions(2, true),
                defaultQuestions(3, false),
                defaultQuestions(4, true),
                defaultQuestions(5, false)
            ];

            setGraph(questions)

            expect(graph.findMaxDepth()).toBe(7);
        });

        test('Followup start (F-N-F-N) => total: 6', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, true),
                defaultQuestions(2, false),
                defaultQuestions(3, true),
                defaultQuestions(4, false)
            ];

            setGraph(questions)

            expect(graph.findMaxDepth()).toBe(6);
        });

        test('Followup end (N-F-N-F) => total: 6', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, false),
                defaultQuestions(2, true),
                defaultQuestions(3, false),
                defaultQuestions(4, true)
            ];

            setGraph(questions)

            expect(graph.findMaxDepth()).toBe(6);
        });

        test('Followup start (F-N-F-N-F) => total: 8', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, true),
                defaultQuestions(2, false),
                defaultQuestions(3, true),
                defaultQuestions(4, false),
                defaultQuestions(5, true)
            ];

            setGraph(questions)

            expect(graph.findMaxDepth()).toBe(8);
        });

        test('Followup middle (N-F-N-F-N-F) => total: 9', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, false),
                defaultQuestions(2, true),
                defaultQuestions(3, false),
                defaultQuestions(4, true),
                defaultQuestions(5, false),
                defaultQuestions(6, true)
            ];

            setGraph(questions)

            expect(graph.findMaxDepth()).toBe(9);
        });
    });

    describe('findMaxDeepWithConditions', () => {
        test('Test a simple tree with conditions', async () => {
            const questions: NativeQuestion[] = [
                {
                    "id": "e2c8fa70-8f81-11ef-ac6c-69b43cd19236",
                    "title": "Seleciona una opción :",
                    "ref": "selecionaunaopcin",
                    "refMetric": "select option",
                    "require": true,
                    "external_id": "",
                    "value": ["Magic", "Pokemon", "Digimon"],
                    "defaultValue": "",
                    "position": 1,
                    "followup": false,
                    "assets": {
                        "extraOption": false,
                        "extraOptionText": "I don't know",
                        "extraOptionPlaceholder": "Custom option",
                        "general": ""
                    },
                    "integrationId": "dd97c900-8f81-11ef-ac6c-69b43cd19236",
                    "type": FEEDBACKAPPANSWERTYPE.RADIO,
                    "integrationPageId": "e2c243b0-8f81-11ef-ac6c-69b43cd19236",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "e4935a30-8f81-11ef-ac6c-69b43cd19236",
                    "title": "Conoces Magic?",
                    "ref": "conocesmagic",
                    "refMetric": "Magic",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 2,
                    "followup": false,
                    "assets": {
                        "addIcon": false
                    },
                    "integrationId": "dd97c900-8f81-11ef-ac6c-69b43cd19236",
                    "type": FEEDBACKAPPANSWERTYPE.BOOLEAN,
                    "integrationPageId": "e48cca80-8f81-11ef-ac6c-69b43cd19236",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "e668b670-8f81-11ef-ac6c-69b43cd19236",
                    "title": "Conoces Pokemon?",
                    "ref": "conocespokemon",
                    "refMetric": "Pokemon",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 3,
                    "followup": false,
                    "assets": {
                        "addIcon": false
                    },
                    "integrationId": "dd97c900-8f81-11ef-ac6c-69b43cd19236",
                    "type": FEEDBACKAPPANSWERTYPE.BOOLEAN,
                    "integrationPageId": "e661ffb0-8f81-11ef-ac6c-69b43cd19236",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "e8316880-8f81-11ef-ac6c-69b43cd19236",
                    "title": "Conoces Digimon?",
                    "ref": "conocesdigimon",
                    "refMetric": "Digimon",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 4,
                    "followup": false,
                    "assets": {
                        "addIcon": false
                    },
                    "integrationId": "dd97c900-8f81-11ef-ac6c-69b43cd19236",
                    "type": FEEDBACKAPPANSWERTYPE.BOOLEAN,
                    "integrationPageId": "e82ad8d0-8f81-11ef-ac6c-69b43cd19236",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "e9fba130-8f81-11ef-ac6c-69b43cd19236",
                    "title": "Como valoras la industria detras de la franquicia ?",
                    "ref": "comovaloraslaindustriadetrasdelafranquicia",
                    "refMetric": "industry franchise",
                    "require": false,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 5,
                    "followup": false,
                    "assets": {
                        "minPlaceholder": "",
                        "maxPlaceholder": ""
                    },
                    "integrationId": "dd97c900-8f81-11ef-ac6c-69b43cd19236",
                    "type": FEEDBACKAPPANSWERTYPE.RATING_STAR,
                    "integrationPageId": "e9f4ea70-8f81-11ef-ac6c-69b43cd19236",
                    "questionType": {
                        "conf": null
                    }
                }
            ];

            const pages: Page[] = [
                {
                    "id": "e2c243b0-8f81-11ef-ac6c-69b43cd19236",
                    "position": 1,
                    "generatedAt": "2024-10-21T07:55:48.970Z",
                    "updatedAt": "2024-10-21T07:55:48.970Z",
                    "status": "ACTIVE",
                    "integrationId": "dd97c900-8f81-11ef-ac6c-69b43cd19236",
                    "integrationQuestions": [questions[0]],
                    "integrationPageRoutes": [
                        {
                            "id": "b8be0190-8f8f-11ef-889c-8762100ea0c6",
                            "questionRef": "selecionaunaopcin",
                            "typeCondition": ConditionType.LOGICAL,
                            "typeOperator": OperatorType.EQUAL,
                            "value": "Magic",
                            "transition": TransitionType.PAGE,
                            "transitionDestiny": "e48cca80-8f81-11ef-ac6c-69b43cd19236",
                            "status": StatusType.ACTIVE,
                            "generatedAt": new Date(),
                            "updatedAt": new Date(),
                            "integrationPageId": "e2c243b0-8f81-11ef-ac6c-69b43cd19236"
                        },
                        {
                            "id": "c16d3630-8f8f-11ef-889c-8762100ea0c6",
                            "questionRef": "selecionaunaopcin",
                            "typeCondition": ConditionType.LOGICAL,
                            "typeOperator": OperatorType.EQUAL,
                            "value": "Pokemon",
                            "transition": TransitionType.PAGE,
                            "transitionDestiny": "e661ffb0-8f81-11ef-ac6c-69b43cd19236",
                            "status": StatusType.ACTIVE,
                            "generatedAt": new Date(),
                            "updatedAt": new Date(),
                            "integrationPageId": "e2c243b0-8f81-11ef-ac6c-69b43cd19236"
                        },
                        {
                            "id": "c8ec4f40-8f8f-11ef-889c-8762100ea0c6",
                            "questionRef": "selecionaunaopcin",
                            "typeCondition": ConditionType.LOGICAL,
                            "typeOperator": OperatorType.EQUAL,
                            "value": "Digimon",
                            "transition": TransitionType.PAGE,
                            "transitionDestiny": "e82ad8d0-8f81-11ef-ac6c-69b43cd19236",
                            "status": StatusType.ACTIVE,
                            "generatedAt": new Date(),
                            "updatedAt": new Date(),
                            "integrationPageId": "e2c243b0-8f81-11ef-ac6c-69b43cd19236"
                        }
                    ]
                },
                {
                    "id": "e48cca80-8f81-11ef-ac6c-69b43cd19236",
                    "position": 2,
                    "generatedAt": "2024-10-21T07:55:51.975Z",
                    "updatedAt": "2024-10-21T07:55:51.975Z",
                    "status": "ACTIVE",
                    "integrationId": "dd97c900-8f81-11ef-ac6c-69b43cd19236",
                    "integrationQuestions": [questions[1]],
                    "integrationPageRoutes": [
                        {
                            "id": "09cc3d50-8f8f-11ef-889c-8762100ea0c6",
                            "questionRef": "conocesmagic",
                            "typeCondition": ConditionType.LOGICAL,
                            "typeOperator": OperatorType.EQUAL,
                            "value": "No",
                            "transition": TransitionType.FINISH,
                            "transitionDestiny": "https://magic.wizards.com/en",
                            "status": StatusType.ACTIVE,
                            "generatedAt": new Date(),
                            "updatedAt": new Date(),
                            "integrationPageId": "e48cca80-8f81-11ef-ac6c-69b43cd19236"
                        },
                        {
                            "id": "a73023e0-8f8f-11ef-889c-8762100ea0c6",
                            "questionRef": "conocesmagic",
                            "typeCondition": ConditionType.LOGICAL,
                            "typeOperator": OperatorType.EQUAL,
                            "value": "Yes",
                            "transition": TransitionType.PAGE,
                            "transitionDestiny": "e9f4ea70-8f81-11ef-ac6c-69b43cd19236",
                            "status": StatusType.ACTIVE,
                            "generatedAt": new Date(),
                            "updatedAt": new Date(),
                            "integrationPageId": "e48cca80-8f81-11ef-ac6c-69b43cd19236"
                        }
                    ]
                },
                {
                    "id": "e661ffb0-8f81-11ef-ac6c-69b43cd19236",
                    "position": 3,
                    "generatedAt": "2024-10-21T07:55:55.051Z",
                    "updatedAt": "2024-10-21T07:55:55.051Z",
                    "status": "ACTIVE",
                    "integrationId": "dd97c900-8f81-11ef-ac6c-69b43cd19236",
                    "integrationQuestions": [questions[2]],
                    "integrationPageRoutes": [
                        {
                            "id": "6f1b2540-8f8f-11ef-889c-8762100ea0c6",
                            "questionRef": "conocespokemon",
                            "typeCondition": ConditionType.LOGICAL,
                            "typeOperator": OperatorType.EQUAL,
                            "value": "No",
                            "transition": TransitionType.FINISH,
                            "transitionDestiny": "https://www.pokemon.com/es",
                            "status": StatusType.ACTIVE,
                            "generatedAt": new Date(),
                            "updatedAt": new Date(),
                            "integrationPageId": "e661ffb0-8f81-11ef-ac6c-69b43cd19236"
                        },
                        {
                            "id": "7f795c90-8f8f-11ef-889c-8762100ea0c6",
                            "questionRef": "conocespokemon",
                            "typeCondition": ConditionType.LOGICAL,
                            "typeOperator": OperatorType.EQUAL,
                            "value": "Yes",
                            "transition": TransitionType.PAGE,
                            "transitionDestiny": "e9f4ea70-8f81-11ef-ac6c-69b43cd19236",
                            "status": StatusType.ACTIVE,
                            "generatedAt": new Date(),
                            "updatedAt": new Date(),
                            "integrationPageId": "e661ffb0-8f81-11ef-ac6c-69b43cd19236"
                        }
                    ]
                },
                {
                    "id": "e82ad8d0-8f81-11ef-ac6c-69b43cd19236",
                    "position": 4,
                    "generatedAt": "2024-10-21T07:55:58.045Z",
                    "updatedAt": "2024-10-21T07:55:58.045Z",
                    "status": "ACTIVE",
                    "integrationId": "dd97c900-8f81-11ef-ac6c-69b43cd19236",
                    "integrationQuestions": [questions[3]],
                    "integrationPageRoutes": [
                        {
                            "id": "88503d70-8f8f-11ef-889c-8762100ea0c6",
                            "questionRef": "conocesdigimon",
                            "typeCondition": ConditionType.LOGICAL,
                            "typeOperator": OperatorType.EQUAL,
                            "value": "Yes",
                            "transition": TransitionType.PAGE,
                            "transitionDestiny": "e9f4ea70-8f81-11ef-ac6c-69b43cd19236",
                            "status": StatusType.ACTIVE,
                            "generatedAt": new Date(),
                            "updatedAt": new Date(),
                            "integrationPageId": "e82ad8d0-8f81-11ef-ac6c-69b43cd19236"
                        },
                        {
                            "id": "9337fcf0-8f8f-11ef-889c-8762100ea0c6",
                            "questionRef": "conocesdigimon",
                            "typeCondition": ConditionType.LOGICAL,
                            "typeOperator": OperatorType.EQUAL,
                            "value": "No",
                            "transition": TransitionType.REDIRECT,
                            "transitionDestiny": "https://digimon.fandom.com/wiki/Digimon",
                            "status": StatusType.ACTIVE,
                            "generatedAt": new Date(),
                            "updatedAt": new Date(),
                            "integrationPageId": "e82ad8d0-8f81-11ef-ac6c-69b43cd19236"
                        }
                    ]
                },
                {
                    "id": "e9f4ea70-8f81-11ef-ac6c-69b43cd19236",
                    "position": 5,
                    "generatedAt": "2024-10-21T07:56:01.047Z",
                    "updatedAt": "2024-10-21T07:56:01.047Z",
                    "status": "ACTIVE",
                    "integrationId": "dd97c900-8f81-11ef-ac6c-69b43cd19236",
                    "integrationQuestions": [questions[4]],
                    "integrationPageRoutes": []
                }
            ];

            setGraphWithRoutes(pages)

            expect(graph.findMaxDepth()).toBe(3);
        });

        test('Test a simple tree with followups and conditions', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, false),
                defaultQuestions(2, false),
                defaultQuestions(3, false),
                defaultQuestions(4, false),
            ];

            const pages: Page[] = [
                new Page('1', 1, 'integration', [questions[0]], [
                    new PageRoute('1', '1', OperatorType.EQUAL, 'A', TransitionType.PAGE, '2', '1', ConditionType.LOGICAL),
                    new PageRoute('2', '1', OperatorType.EQUAL, 'B', TransitionType.PAGE, '3', '1', ConditionType.LOGICAL),
                    new PageRoute('3', '1', OperatorType.EQUAL, 'C', TransitionType.PAGE, '4', '1', ConditionType.LOGICAL),
                ]),
                new Page('2', 2, 'integration', [questions[1]], []),
                new Page('3', 3, 'integration', [questions[2]], []),
                new Page('4', 4, 'integration', [questions[3]], []),
            ];

            setGraphWithRoutes(pages)

            expect(graph.findMaxDepth()).toBe(2);
        });

        test('Test a simple tree with followups and conditions', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, false),
                defaultQuestions(2, false),
                defaultQuestions(3, false),
                defaultQuestions(4, true),
            ];

            const pages: Page[] = [
                new Page('1', 1, 'integration', [questions[0]], [
                    new PageRoute('1', '1', OperatorType.EQUAL, 'A', TransitionType.PAGE, '2', '1', ConditionType.LOGICAL),
                    new PageRoute('2', '1', OperatorType.EQUAL, 'B', TransitionType.PAGE, '3', '1', ConditionType.LOGICAL),
                    new PageRoute('3', '1', OperatorType.EQUAL, 'C', TransitionType.PAGE, '4', '1', ConditionType.LOGICAL),
                ]),
                new Page('2', 2, 'integration', [questions[1]], []),
                new Page('3', 3, 'integration', [questions[2]], []),
                new Page('4', 4, 'integration', [questions[3]], []),
            ];

            setGraphWithRoutes(pages)

            expect(graph.findMaxDepth()).toBe(3);
        });

        test('Test a simple tree with end route and conditions', async () => {
            const questions: NativeQuestion[] = [
                defaultQuestions(1, false),
                defaultQuestions(2, false),
                defaultQuestions(3, false)
            ];

            const pages: Page[] = [
                new Page('1', 1, 'integration', [questions[0]], [
                    new PageRoute('1', '1', OperatorType.EQUAL, 'A', TransitionType.PAGE, '2', '1', ConditionType.LOGICAL),
                ]),
                new Page('2', 2, 'integration', [questions[1]], [
                    new PageRoute('1', '2', OperatorType.EQUAL, 'Yes', TransitionType.PAGE, '3', '2'),
                    new PageRoute('2', '2', OperatorType.EQUAL, 'No', TransitionType.FINISH, '', '2'),
                ]),
                new Page('3', 3, 'integration', [questions[2]], []),
            ];

            setGraphWithRoutes(pages)

            expect(graph.findMaxDepth()).toBe(3);
        });
    });
});
