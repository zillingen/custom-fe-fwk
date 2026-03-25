import type { VNode } from './h.types';
export type State = Record<string, unknown>;
export type Reducer = (state: State, payload: unknown) => State;
export interface App {
    state: State;
    view: (state: State, emit: EmitFunction) => VNode;
    reducers?: Record<string, Reducer>;
}
export interface AppInstance {
    mount(parentEl: HTMLElement): void;
    unmount(): void;
}
export type EmitFunction = (eventName: string, payload?: unknown) => void;
export declare function createApp({ state, view, reducers }: App): AppInstance;
//# sourceMappingURL=app.d.ts.map