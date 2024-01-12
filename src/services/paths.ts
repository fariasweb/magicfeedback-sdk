export const endpoints = {
    sdk: {
        app: (appId: string, publicKey: string) => `sdk/app/${appId}/${publicKey}`,
        app_info: (appId: string, publicKey: string) => `sdk/app/${appId}/${publicKey}/info`,
        feedback: 'sdk/feedback',
        followUpQuestion: 'sdk/followUpQuestion',
    }
}
