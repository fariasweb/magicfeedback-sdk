import {NativeQuestion} from "./types";
import {Page} from "./page";
import {PageRoute} from "./pageRoute";

export class PageNode{
    id: string;
    position: number;
    edges: PageRoute[];
    data: Page;
    questions: NativeQuestion[];
    // level: number;

    constructor(id: string,
                position: number,
                edges: PageRoute[],
                data: Page,
                questions: NativeQuestion[],
                // level: number
    ){
        this.id = id;
        this.position = position;
        this.edges = edges;
        this.data = data;
        this.questions = questions;
        // this.level = level;
    }

    /**
     * Get a list of followup questions ref
     * @returns list of followup questions ref
     **/
    getFollowupQuestions(): string[] {
        return this.questions.filter(question => question.followup).map(question => question.ref);
    }

    /**
     * Get a list of ref of the questions that are required in the page
     * @returns ref of the required questions ref
     **/
    getRequiredQuestions(){
        return this.questions.filter(question => question.require).map(question => question.ref);
    }
}