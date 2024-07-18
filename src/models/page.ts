import {NativeQuestion} from "./types";
import {PageRoute} from "./pageRoute";

export class Page {
    id: string;
    position: number;
    generatedAt: string;
    updatedAt: number;
    status: string;
    integrationId: string;
    integrationQuestions: NativeQuestion[];
    integrationPageRoutes: PageRoute[];
    questions: NativeQuestion[];

    constructor(
        id: string,
        position: number,
        generatedAt: string,
        updatedAt: number,
        status: string,
        integrationId: string,
        integrationQuestions: NativeQuestion[],
        integrationPageRoutes: PageRoute[],
        questions: NativeQuestion[]
    ) {
        this.id = id;
        this.position = position;
        this.generatedAt = generatedAt;
        this.updatedAt = updatedAt;
        this.status = status;
        this.integrationId = integrationId;
        this.integrationQuestions = integrationQuestions;
        this.integrationPageRoutes = integrationPageRoutes;
        this.questions = questions;
    }
}