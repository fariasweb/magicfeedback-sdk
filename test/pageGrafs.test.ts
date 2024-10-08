import {
    describe,
    expect,
    beforeEach,
    test
} from "@jest/globals";
import {PageGraph} from "../src/models/pageGrafs";
import {NativeQuestion} from "../src/models/types";
import {Page} from "../src/models/page";


describe('pageGrafs', () => {
    let graph: PageGraph = new PageGraph([]);

    const defaultQuestions = (position: number, followUp: boolean): NativeQuestion => {
        return <NativeQuestion>{
            id: '1',
            title: 'Question 1',
            type: 'TEXT',
            questionType: {conf: {}},
            ref: '1',
            require: true,
            external_id: '1',
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
            ...questions.map((q, index) => new Page(index.toString(), index, 'integration', [q], []))
        ];

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
});
