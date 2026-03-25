export type Handler = (payload?: unknown) => void | undefined;
export declare class Dispatcher {
    #private;
    subscribe(commandName: string, handler: Handler): () => void;
    afterEveryCommand(handler: Handler): () => void;
    dispatch(commandName: string, payload: unknown): boolean;
    hasSubscribers(commandName: string): boolean;
    getSubscriberCount(commandName: string): number;
    clear(): void;
}
//# sourceMappingURL=dispatcher.d.ts.map