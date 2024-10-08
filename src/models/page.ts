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

    constructor(
        id: string,
        position: number,
        integrationId: string,
        integrationQuestions: NativeQuestion[],
        integrationPageRoutes: PageRoute[],
    ) {
        this.id = id;
        this.position = position;
        this.generatedAt = new Date().toISOString();
        this.updatedAt = new Date().getTime();
        this.status = 'ACTIVE';
        this.integrationId = integrationId;
        this.integrationQuestions = integrationQuestions;
        this.integrationPageRoutes = integrationPageRoutes;
    }
}