export interface Invocation<Content> {
  idx: number;
  type: string;
  src: string;
  id: string;
  autoforward: boolean;
  content: Content;
  source: number;
  depth: number;
}

export const enum InvocationCommandType {
  OPEN = 0,
  CLOSE = 1,
}

export interface InvocationCommand<Content> {
  type: InvocationCommandType;
  invocation: Invocation<Content>;
}
