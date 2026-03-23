import type { EventHandler } from './h.types';
export declare class Dispatcher {
    #private;
    subscribe(commandName: string, handler: EventHandler): () => void;
    afterEveryCommand(handler: EventHandler): () => void;
    dispatch(commandName: string, payload: unknown): void;
}
//# sourceMappingURL=dispatcher.d.ts.map