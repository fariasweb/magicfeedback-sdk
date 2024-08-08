import {NativeQuestion} from "./types";
import {Page} from "./page";

export class FormData {
    id: string;

    name: string;

    description: string;

    type: string;

    identity: string;

    status: string;

    createdAt: Date;

    updatedAt: Date;

    savedAt?: Date;

    externalId?: string | null;

    companyId: string;

    productId: string;

    userId: string;

    setting: Record<string, any>;

    conf: Record<string, any>;

    questions: NativeQuestion[];

    lang: string[];

    style: Record<string, any>;

    pages: Page[];

    constructor(
        id: string,
        name: string,
        description: string,
        type: string,
        identity: string,
        status: string,
        createdAt: Date,
        updatedAt: Date,
        externalId: string | null,
        companyId: string,
        productId: string,
        userId: string,
        setting: Record<string, any>,
        conf: Record<string, any>,
        questions: NativeQuestion[],
        lang: string[],
        style: Record<string, any>,
        pages: Page[]
    ) {
        this.id = id
        this.name = name
        this.description = description
        this.type = type
        this.identity = identity
        this.status = status
        this.createdAt = createdAt
        this.updatedAt = updatedAt
        this.externalId = externalId
        this.companyId = companyId
        this.productId = productId
        this.userId = userId
        this.setting = setting
        this.conf = conf
        this.questions = questions
        this.lang = lang
        this.style = style
        this.pages = pages
    }
}
