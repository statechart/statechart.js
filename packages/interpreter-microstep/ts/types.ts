export interface Backend<Event, Executable> {
  query(executable: Executable): any;
  exec(executable: Executable): void;
  match(events: any, event: Event): boolean;
}

export type IdxSet = Set<number>;
export type Configuration = IdxSet;

export interface InterpreterState {
  configuration: IdxSet;
  history: IdxSet;
  initialized: IdxSet;
  isStable: boolean;
}
