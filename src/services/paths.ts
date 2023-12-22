export const endpoints = {
    sdk: {
        app: (appId: string, publicKey: string) => `sdk/app/${appId}/${publicKey}`,
        feedback: 'sdk/feedback',
    }
}
