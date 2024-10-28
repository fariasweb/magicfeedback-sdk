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

        test('Test a simple tree with end route and conditions', async () => {
            const questions: NativeQuestion[] = [
                {
                    "id": "a223e5d0-7b26-11ef-aeb6-b58621afb324",
                    "title": "Hvor tilfreds er du overordnet med Club Matas?",
                    "ref": "1hvortilfredserduoverordnetmedclubmatas",
                    "refMetric": "Club Matas satisfaction",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 1,
                    "followup": false,
                    "assets": {
                        "min": "1",
                        "max": "5",
                        "minPlaceholder": "Slet ikke tilfreds",
                        "maxPlaceholder": "Meget tilfreds",
                        "extraOption": false,
                        "extraOptionText": "?"
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RATING_NUMBER" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "a220b180-7b26-11ef-aeb6-b58621afb324",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "4adddfe0-7fce-11ef-9d44-296ad8bb32b2",
                    "title": "Hvad er de vigtigste grunde til, at du er med i Club Matas?",
                    "ref": "hvaderdevigtigstegrundetilatduermediclubmatas",
                    "refMetric": "Club Matas",
                    "require": true,
                    "external_id": "",
                    "value": [
                        "Jeg kan optjene point med Club Matas",
                        "Jeg kan konvertere mine point til kontantrabatter i Matas, på matas.dk og i Club Matas app'en",
                        "Jeg kan deltage i spændende konkurrencer",
                        "Jeg kan komme til events i min Matas",
                        "Jeg får en tættere tilknytning til min lokale Matas",
                        "Jeg kan komme til eksklusive events som koncerter, biografture, skønhedsevents mm.",
                        "Jeg får gode og målrettede tilbud",
                        "Jeg får gode tips og råd, der er relevante for mig",
                        "Jeg hører om alle de vigtigste produktnyheder"
                    ],
                    "defaultValue": "",
                    "position": 2,
                    "followup": false,
                    "assets": {
                        "extraOption": false,
                        "extraOptionText": "Andet,noter her",
                        "maxOptions": 3,
                        "general": ""
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "MULTIPLECHOICE" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "4adaab90-7fce-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "4c8c7a40-7fce-11ef-9d44-296ad8bb32b2",
                    "title": "Hvor sandsynligt er det, at du vil anbefale Club Matas til en ven, kollega eller et familiemedlem?",
                    "ref": "hvorsandsynligterdetatduvilanbefaleclubmatastilenvenkollegaelleretfamiliemedlem",
                    "refMetric": "recommend friend",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 3,
                    "followup": false,
                    "assets": {
                        "min": "0",
                        "max": "10",
                        "minPlaceholder": "Vil helt sikkert ikke anbefale",
                        "maxPlaceholder": "Vil helt sikkert anbefale",
                        "extraOption": false,
                        "extraOptionText": "?"
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RATING_NUMBER" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "4c896d00-7fce-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "4e36f5f0-7fce-11ef-9d44-296ad8bb32b2",
                    "title": "Hvad synes du, vi kan forbedre?",
                    "ref": "hvadsynesduvikanforbedre",
                    "refMetric": "improve",
                    "require": false,
                    "external_id": "",
                    "value": [
                        "Club Matas appen",
                        "Bedre tilbud",
                        "Vareprøver i forbindelse med køb på Club Matas medlemskortet",
                        "Club Matas events i Matas butikkerne",
                        "Muligheden for at deltage i særlige events som koncerter, biografture og skønhedsevents",
                        "Muligheden for at deltage i relevante konkurrencer",
                        "Vilkår for optjening og brug af point",
                        "Flere og mere relevante fordele",
                        "Frekvensen af Club Matas e-mails og push -beskeder",
                        "Relevansen af indhold i Club Matas e-mails og push-beskeder",
                        "Relevansen af indhold på Facebook og Instagram",
                        "Hurtigere svar fra kundeservice"
                    ],
                    "defaultValue": "",
                    "position": 4,
                    "followup": false,
                    "assets": {
                        "extraOption": true,
                        "extraOptionText": "Andet,noter her",
                        "maxOptions": 3,
                        "general": ""
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "MULTIPLECHOICE" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "4e33c1a0-7fce-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "4f7ae7a0-7fce-11ef-9d44-296ad8bb32b2",
                    "title": "Hvad synes du, vi kan forbedre?",
                    "ref": "hvadsynesduvikanforbedre1",
                    "refMetric": "improve",
                    "require": false,
                    "external_id": "",
                    "value": [
                        "Club Matas appen",
                        "Bedre tilbud",
                        "Vareprøver i forbindelse med køb på Club Matas medlemskortet",
                        "Club Matas events i Matas butikkerne",
                        "Muligheden for at deltage i særlige events som koncerter, biografture og skønhedsevents",
                        "Muligheden for at deltage i relevante konkurrencer",
                        "Vilkår for optjening og brug af point",
                        "Flere og mere relevante fordele",
                        "Frekvensen af Club Matas e-mails og push -beskeder",
                        "Relevansen af indhold i Club Matas e-mails og push-beskeder",
                        "Relevansen af indhold på Facebook og Instagram",
                        " Hurtigere svar fra kundeservice"
                    ],
                    "defaultValue": "",
                    "position": 5,
                    "followup": false,
                    "assets": {
                        "extraOption": true,
                        "extraOptionText": "Andet,noter her",
                        "maxOptions": 3,
                        "general": ""
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "MULTIPLECHOICE" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "4f77b350-7fce-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "51009d40-7fce-11ef-9d44-296ad8bb32b2",
                    "title": "Hvad synes du, vi kan forbedre?",
                    "ref": "hvadsynesduvikanforbedre2",
                    "refMetric": "improve",
                    "require": false,
                    "external_id": "",
                    "value": [
                        "Club Matas appen",
                        "Bedre tilbud",
                        "Vareprøver i forbindelse med køb på Club Matas medlemskortet",
                        "Club Matas events i Matas butikkerne",
                        "Muligheden for at deltage i særlige events som koncerter, biografture og skønhedsevents",
                        "Muligheden for at deltage i relevante konkurrencer",
                        "Vilkår for optjening og brug af point",
                        "Flere og mere relevante fordele",
                        "Frekvensen af Club Matas e-mails og push -beskeder",
                        "Relevansen af indhold i Club Matas e-mails og push-beskeder",
                        "Relevansen af indhold på Facebook og Instagram",
                        "Hurtigere svar fra kundeservice"
                    ],
                    "defaultValue": "",
                    "position": 6,
                    "followup": false,
                    "assets": {
                        "extraOption": true,
                        "extraOptionText": "Andet,noter her",
                        "maxOptions": 3,
                        "general": ""
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "MULTIPLECHOICE" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "50fd68f0-7fce-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "52afacd0-7fce-11ef-9d44-296ad8bb32b2",
                    "title": "Hvordan er din tilfredshed med dit medlemskab i Club Matas sammenlignet med samme periode sidste år?",
                    "ref": "hvordanerdintilfredshedmedditmedlemskabiclubmatassammenlignetmedsammeperiodesidster",
                    "refMetric": "membership satisfaction",
                    "require": true,
                    "external_id": "",
                    "value": [
                        "Mere tilfreds end samme tidspunkt sidste år",
                        "Uændret",
                        "Mindre tilfreds end samme tidspunkt sidste år"
                    ],
                    "defaultValue": "",
                    "position": 7,
                    "followup": false,
                    "assets": {
                        "extraOption": false,
                        "extraOptionText": "I don't know",
                        "extraOptionPlaceholder": "Custom option",
                        "general": ""
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RADIO" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "52ac7880-7fce-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "54122300-7fce-11ef-9d44-296ad8bb32b2",
                    "title": "Angiv venligst, hvilken kanal du oftest anvender, når du opsøger information om tilbud, konkurrencer, events mm. fra Club Matas",
                    "ref": "angivvenligsthvilkenkanalduoftestanvendernrduopsgerinformationomtilbudkonkurrencereventsmmfraclubmatas",
                    "refMetric": "information channel",
                    "require": true,
                    "external_id": "",
                    "value": [
                        "Club Matas e-mail",
                        "Club Matas appen",
                        "matas.dk",
                        "Matas' Facebook side",
                        "Matas' Instagram profil"
                    ],
                    "defaultValue": "",
                    "position": 8,
                    "followup": false,
                    "assets": {
                        "extraOption": false,
                        "extraOptionText": "I don't know",
                        "extraOptionPlaceholder": "Custom option",
                        "general": ""
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RADIO" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "540f15c0-7fce-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "c8d4f760-7fd0-11ef-9d44-296ad8bb32b2",
                    "title": "Hvor tilfreds er du overordnet med Club Matas e-mails?",
                    "ref": "hvortilfredserduoverordnetmedclubmatasemails",
                    "refMetric": "email satisfaction",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 9,
                    "followup": false,
                    "assets": {
                        "min": "1",
                        "max": "5",
                        "minPlaceholder": "Slet ikke tilfreds\"",
                        "maxPlaceholder": "Meget tilfreds",
                        "extraOption": false,
                        "extraOptionText": "?"
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RATING_NUMBER" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "c8d1c310-7fd0-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "cae42850-7fd0-11ef-9d44-296ad8bb32b2",
                    "title": "Hvor relevante finder du de udsendte Club Matas e-mails?",
                    "ref": "hvorrelevantefinderdudeudsendteclubmatasemails",
                    "refMetric": "relevant Club Matas emails",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 10,
                    "followup": false,
                    "assets": {
                        "min": "1",
                        "max": "5",
                        "minPlaceholder": "Slet ikke tilfreds\"",
                        "maxPlaceholder": "Meget tilfreds",
                        "extraOption": false,
                        "extraOptionText": "?"
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RATING_NUMBER" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "cae0f400-7fd0-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "cc8702e0-7fd0-11ef-9d44-296ad8bb32b2",
                    "title": "Hvad synes du om frekvensen af Club Matas e-mails?",
                    "ref": "hvadsynesduomfrekvensenafclubmatasemails",
                    "refMetric": "frequency club matas emails",
                    "require": true,
                    "external_id": "",
                    "value": [
                        "Der kommer for få e-mails",
                        "Der kommer tilpas med e-mails",
                        "Der kommer for mange e-mails"
                    ],
                    "defaultValue": "",
                    "position": 11,
                    "followup": false,
                    "assets": {
                        "extraOption": false,
                        "extraOptionText": "I don't know",
                        "extraOptionPlaceholder": "Custom option",
                        "general": ""
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RADIO" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "cc83ce90-7fd0-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "ce4b4820-7fd0-11ef-9d44-296ad8bb32b2",
                    "title": "Hvor tilfreds er du med Club Matas appen?",
                    "ref": "hvortilfredserdumedclubmatasappen",
                    "refMetric": "app satisfaction",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 12,
                    "followup": false,
                    "assets": {
                        "min": "1",
                        "max": "5",
                        "minPlaceholder": "Slet ikke tilfreds\"",
                        "maxPlaceholder": "Meget tilfreds",
                        "extraOption": false,
                        "extraOptionText": "?"
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RATING_NUMBER" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "ce3c2cf0-7fd0-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "d062b670-7fd0-11ef-9d44-296ad8bb32b2",
                    "title": "Hvor tilfreds er du med matas.dk?",
                    "ref": "hvortilfredserdumedmatasdk",
                    "refMetric": "matas.dk satisfaction",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 13,
                    "followup": false,
                    "assets": {
                        "min": "1",
                        "max": "5",
                        "minPlaceholder": "Slet ikke tilfreds\"",
                        "maxPlaceholder": "Meget tilfreds",
                        "extraOption": false,
                        "extraOptionText": "?"
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RATING_NUMBER" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "d05f5b10-7fd0-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "d23098a0-7fd0-11ef-9d44-296ad8bb32b2",
                    "title": "Hvor tilfreds er du med Matas' Facebook side?",
                    "ref": "hvortilfredserdumedmatasfacebookside",
                    "refMetric": "Matas Facebook",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 14,
                    "followup": false,
                    "assets": {
                        "min": "1",
                        "max": "5",
                        "minPlaceholder": "Slet ikke tilfreds\"",
                        "maxPlaceholder": "Meget tilfreds",
                        "extraOption": false,
                        "extraOptionText": "?"
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RATING_NUMBER" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "d22d6450-7fd0-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "d3d9dbd0-7fd0-11ef-9d44-296ad8bb32b2",
                    "title": "Hvor tilfreds er du med Matas' Instagram profil?",
                    "ref": "hvortilfredserdumedmatasinstagramprofil",
                    "refMetric": "Matas Instagram",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 15,
                    "followup": false,
                    "assets": {
                        "min": "1",
                        "max": "5",
                        "minPlaceholder": "Slet ikke tilfreds\"",
                        "maxPlaceholder": "Meget tilfreds",
                        "extraOption": false,
                        "extraOptionText": "?"
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RATING_NUMBER" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "d3d6a780-7fd0-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "d5867a60-7fd0-11ef-9d44-296ad8bb32b2",
                    "title": "Har du inden for det sidste år været i kontakt med kundeservice?",
                    "ref": "harduindenfordetsidstervretikontaktmedkundeservice",
                    "refMetric": "customer service",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 16,
                    "followup": false,
                    "assets": {
                        "addIcon": false
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "BOOLEAN" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "d5836d20-7fd0-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                },
                {
                    "id": "d7327cb0-7fd0-11ef-9d44-296ad8bb32b2",
                    "title": "Hvor tilfreds var du med din kontakt til kundeservice?",
                    "ref": "hvortilfredsvardumeddinkontakttilkundeservice",
                    "refMetric": "customer service satisfaction",
                    "require": true,
                    "external_id": "",
                    "value": [],
                    "defaultValue": "",
                    "position": 17,
                    "followup": false,
                    "assets": {
                        "min": "1",
                        "max": "5",
                        "minPlaceholder": "Slet ikke tilfreds\"",
                        "maxPlaceholder": "Meget tilfreds",
                        "extraOption": false,
                        "extraOptionText": "?"
                    },
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "type": "RATING_NUMBER" as FEEDBACKAPPANSWERTYPE,
                    "integrationPageId": "d72f4860-7fd0-11ef-9d44-296ad8bb32b2",
                    "questionType": {
                        "conf": null
                    }
                }
            ];

            const pages: Page[] = [
                {
                    "id": "a220b180-7b26-11ef-aeb6-b58621afb324",
                    "position": 1,
                    "generatedAt": "2024-09-25T10:12:13.080Z",
                    "updatedAt": "2024-09-25T10:12:13.080Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[0]],
                    "integrationPageRoutes": [
                        {
                            "id": "a220b180-7b26-11ef-aeb6-b58621afb324-default",
                            "questionRef": "1hvortilfredserduoverordnetmedclubmatas",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "DEFAULT" as OperatorType,
                            "value": "",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "4adaab90-7fce-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "a220b180-7b26-11ef-aeb6-b58621afb324"
                        }
                    ]
                },
                {
                    "id": "4adaab90-7fce-11ef-9d44-296ad8bb32b2",
                    "position": 2,
                    "generatedAt": "2024-10-01T08:22:26.760Z",
                    "updatedAt": "2024-10-01T08:22:26.760Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[1]],
                    "integrationPageRoutes": [
                        {
                            "id": "4adaab90-7fce-11ef-9d44-296ad8bb32b2-default",
                            "questionRef": "hvaderdevigtigstegrundetilatduermediclubmatas",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "DEFAULT" as OperatorType,
                            "value": "",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "4c896d00-7fce-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "4adaab90-7fce-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "4c896d00-7fce-11ef-9d44-296ad8bb32b2",
                    "position": 3,
                    "generatedAt": "2024-10-01T08:22:29.584Z",
                    "updatedAt": "2024-10-01T08:22:29.584Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[2]],
                    "integrationPageRoutes": [
                        {
                            "id": "3f08ce00-802d-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvorsandsynligterdetatduvilanbefaleclubmatastilenvenkollegaelleretfamiliemedlem",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "LESSEQUAL" as OperatorType,
                            "value": "6",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "4e33c1a0-7fce-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "4c896d00-7fce-11ef-9d44-296ad8bb32b2"
                        },
                        {
                            "id": "4c0f9cf0-802d-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvorsandsynligterdetatduvilanbefaleclubmatastilenvenkollegaelleretfamiliemedlem",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "LESSEQUAL" as OperatorType,
                            "value": "8",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "4f77b350-7fce-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "4c896d00-7fce-11ef-9d44-296ad8bb32b2"
                        },
                        {
                            "id": "59594140-802d-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvorsandsynligterdetatduvilanbefaleclubmatastilenvenkollegaelleretfamiliemedlem",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "GREATEREQUAL" as OperatorType,
                            "value": "9",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "50fd68f0-7fce-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "4c896d00-7fce-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "4e33c1a0-7fce-11ef-9d44-296ad8bb32b2",
                    "position": 4,
                    "generatedAt": "2024-10-01T08:22:32.377Z",
                    "updatedAt": "2024-10-01T08:22:32.377Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[3]],
                    "integrationPageRoutes": [
                        {
                            "id": "c79c5610-802d-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvadsynesduvikanforbedre",
                            "typeCondition": "DIRECT" as ConditionType,
                            "typeOperator": "NOEQUAL" as OperatorType,
                            "value": " ",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "52ac7880-7fce-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "4e33c1a0-7fce-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "4f77b350-7fce-11ef-9d44-296ad8bb32b2",
                    "position": 5,
                    "generatedAt": "2024-10-01T08:22:34.501Z",
                    "updatedAt": "2024-10-01T08:22:34.501Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[4]],
                    "integrationPageRoutes": [
                        {
                            "id": "c34e58b0-802d-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvadsynesduvikanforbedre1",
                            "typeCondition": "DIRECT" as ConditionType,
                            "typeOperator": "NOEQUAL" as OperatorType,
                            "value": " ",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "52ac7880-7fce-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "4f77b350-7fce-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "50fd68f0-7fce-11ef-9d44-296ad8bb32b2",
                    "position": 6,
                    "generatedAt": "2024-10-01T08:22:37.055Z",
                    "updatedAt": "2024-10-01T08:22:37.055Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[5]],
                    "integrationPageRoutes": [
                        {
                            "id": "bcbfe130-802d-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvadsynesduvikanforbedre2",
                            "typeCondition": "DIRECT" as ConditionType,
                            "typeOperator": "NOEQUAL" as OperatorType,
                            "value": " ",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "52ac7880-7fce-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "50fd68f0-7fce-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "52ac7880-7fce-11ef-9d44-296ad8bb32b2",
                    "position": 7,
                    "generatedAt": "2024-10-01T08:22:39.880Z",
                    "updatedAt": "2024-10-01T08:22:39.880Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[6]],
                    "integrationPageRoutes": [
                        {
                            "id": "52ac7880-7fce-11ef-9d44-296ad8bb32b2-default",
                            "questionRef": "hvordanerdintilfredshedmedditmedlemskabiclubmatassammenlignetmedsammeperiodesidster",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "DEFAULT" as OperatorType,
                            "value": "",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "540f15c0-7fce-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "52ac7880-7fce-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "540f15c0-7fce-11ef-9d44-296ad8bb32b2",
                    "position": 8,
                    "generatedAt": "2024-10-01T08:22:42.203Z",
                    "updatedAt": "2024-10-01T08:22:42.203Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[7]],
                    "integrationPageRoutes": [
                        {
                            "id": "2d8d9880-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "angivvenligsthvilkenkanalduoftestanvendernrduopsgerinformationomtilbudkonkurrencereventsmmfraclubmatas",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "EQUAL" as OperatorType,
                            "value": "Club Matas e-mail",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "c8d1c310-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "540f15c0-7fce-11ef-9d44-296ad8bb32b2"
                        },
                        {
                            "id": "3bac1900-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "angivvenligsthvilkenkanalduoftestanvendernrduopsgerinformationomtilbudkonkurrencereventsmmfraclubmatas",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "EQUAL" as OperatorType,
                            "value": "Club Matas appen",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "ce3c2cf0-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "540f15c0-7fce-11ef-9d44-296ad8bb32b2"
                        },
                        {
                            "id": "456e6b50-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "angivvenligsthvilkenkanalduoftestanvendernrduopsgerinformationomtilbudkonkurrencereventsmmfraclubmatas",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "EQUAL" as OperatorType,
                            "value": "matas.dk",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "d05f5b10-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "540f15c0-7fce-11ef-9d44-296ad8bb32b2"
                        },
                        {
                            "id": "4efa9270-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "angivvenligsthvilkenkanalduoftestanvendernrduopsgerinformationomtilbudkonkurrencereventsmmfraclubmatas",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "EQUAL" as OperatorType,
                            "value": "Matas' Facebook side",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "d22d6450-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "540f15c0-7fce-11ef-9d44-296ad8bb32b2"
                        },
                        {
                            "id": "593919a0-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "angivvenligsthvilkenkanalduoftestanvendernrduopsgerinformationomtilbudkonkurrencereventsmmfraclubmatas",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "EQUAL" as OperatorType,
                            "value": "Matas' Instagram profil",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "d3d6a780-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "540f15c0-7fce-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "c8d1c310-7fd0-11ef-9d44-296ad8bb32b2",
                    "position": 9,
                    "generatedAt": "2024-10-01T08:40:17.089Z",
                    "updatedAt": "2024-10-01T08:40:17.089Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[8]],
                    "integrationPageRoutes": [
                        {
                            "id": "76c46c90-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvortilfredserduoverordnetmedclubmatasemails",
                            "typeCondition": "DIRECT" as ConditionType,
                            "typeOperator": "NOEQUAL" as OperatorType,
                            "value": " ",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "cae0f400-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "c8d1c310-7fd0-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "cae0f400-7fd0-11ef-9d44-296ad8bb32b2",
                    "position": 10,
                    "generatedAt": "2024-10-01T08:40:20.543Z",
                    "updatedAt": "2024-10-01T08:40:20.543Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[9]],
                    "integrationPageRoutes": [
                        {
                            "id": "83b8c4f0-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvorrelevantefinderdudeudsendteclubmatasemails",
                            "typeCondition": "DIRECT" as ConditionType,
                            "typeOperator": "NOEQUAL" as OperatorType,
                            "value": " ",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "cc83ce90-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "cae0f400-7fd0-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "cc83ce90-7fd0-11ef-9d44-296ad8bb32b2",
                    "position": 11,
                    "generatedAt": "2024-10-01T08:40:23.289Z",
                    "updatedAt": "2024-10-01T08:40:23.289Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[10]],
                    "integrationPageRoutes": [
                        {
                            "id": "90cf4b50-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvadsynesduomfrekvensenafclubmatasemails",
                            "typeCondition": "DIRECT" as ConditionType,
                            "typeOperator": "NOEQUAL" as OperatorType,
                            "value": " ",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "d5836d20-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "cc83ce90-7fd0-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "ce3c2cf0-7fd0-11ef-9d44-296ad8bb32b2",
                    "position": 12,
                    "generatedAt": "2024-10-01T08:40:26.175Z",
                    "updatedAt": "2024-10-01T08:40:26.175Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[11]],
                    "integrationPageRoutes": [
                        {
                            "id": "97cfbe80-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvortilfredserdumedclubmatasappen",
                            "typeCondition": "DIRECT" as ConditionType,
                            "typeOperator": "NOEQUAL" as OperatorType,
                            "value": " ",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "d5836d20-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "ce3c2cf0-7fd0-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "d05f5b10-7fd0-11ef-9d44-296ad8bb32b2",
                    "position": 13,
                    "generatedAt": "2024-10-01T08:40:29.760Z",
                    "updatedAt": "2024-10-01T08:40:29.760Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[12]],
                    "integrationPageRoutes": [
                        {
                            "id": "9d1d9fb0-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvortilfredserdumedmatasdk",
                            "typeCondition": "DIRECT" as ConditionType,
                            "typeOperator": "NOEQUAL" as OperatorType,
                            "value": " ",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "d5836d20-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "d05f5b10-7fd0-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "d22d6450-7fd0-11ef-9d44-296ad8bb32b2",
                    "position": 14,
                    "generatedAt": "2024-10-01T08:40:32.788Z",
                    "updatedAt": "2024-10-01T08:40:32.788Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[13]],
                    "integrationPageRoutes": [
                        {
                            "id": "a0f20040-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvortilfredserdumedmatasfacebookside",
                            "typeCondition": "DIRECT" as ConditionType,
                            "typeOperator": "NOEQUAL" as OperatorType,
                            "value": " ",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "d5836d20-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "d22d6450-7fd0-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "d3d6a780-7fd0-11ef-9d44-296ad8bb32b2",
                    "position": 15,
                    "generatedAt": "2024-10-01T08:40:35.576Z",
                    "updatedAt": "2024-10-01T08:40:35.576Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[14]],
                    "integrationPageRoutes": [
                        {
                            "id": "a5282fe0-802e-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "hvortilfredserdumedmatasinstagramprofil",
                            "typeCondition": "DIRECT" as ConditionType,
                            "typeOperator": "NOEQUAL" as OperatorType,
                            "value": " ",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "d5836d20-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "d3d6a780-7fd0-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "d5836d20-7fd0-11ef-9d44-296ad8bb32b2",
                    "position": 16,
                    "generatedAt": "2024-10-01T08:40:38.385Z",
                    "updatedAt": "2024-10-01T08:40:38.385Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[15]],
                    "integrationPageRoutes": [
                        {
                            "id": "f6d20f60-802d-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "harduindenfordetsidstervretikontaktmedkundeservice",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "EQUAL" as OperatorType,
                            "value": "Nej",
                            "transition": "FINISH" as TransitionType,
                            "transitionDestiny": "",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "d5836d20-7fd0-11ef-9d44-296ad8bb32b2"
                        },
                        {
                            "id": "f6d20f60-802d-11ef-8d28-ad2ad1c5fced",
                            "questionRef": "harduindenfordetsidstervretikontaktmedkundeservice",
                            "typeCondition": "LOGICAL" as ConditionType,
                            "typeOperator": "EQUAL" as OperatorType,
                            "value": "Ja",
                            "transition": "PAGE" as TransitionType,
                            "transitionDestiny": "d72f4860-7fd0-11ef-9d44-296ad8bb32b2",
                            "status": "ACTIVE" as StatusType,
                            "integrationPageId": "d5836d20-7fd0-11ef-9d44-296ad8bb32b2"
                        }
                    ]
                },
                {
                    "id": "d72f4860-7fd0-11ef-9d44-296ad8bb32b2",
                    "position": 17,
                    "generatedAt": "2024-10-01T08:40:41.190Z",
                    "updatedAt": "2024-10-01T08:40:41.190Z",
                    "status": "ACTIVE",
                    "integrationId": "a04a43d0-7b26-11ef-aeb6-b58621afb324",
                    "integrationQuestions": [questions[16]]
                }
            ];

            setGraphWithRoutes(pages)

            expect(graph.findMaxDepth()).toBe(11);
        });
    });
});
