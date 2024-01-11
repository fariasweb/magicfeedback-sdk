export class FormData {
    id: string;

    name: string;

    description: string;

    type: string;

    identity: string;

    status: string;

    createdAt: Date;

    updatedAt: Date;

    externalId?: string | null;

    companyId: string;

    productId: string;

    userId: string;

    setting: Record<string, any>;

    conf: Record<string, any>;

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
        conf: Record<string, any>
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
    }
}
