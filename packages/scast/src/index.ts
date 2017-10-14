export const enum NodeType {
  SCXML = 'scxml',
  STATE = 'state',
  PARALLEL = 'parallel',
  TRANSITION = 'transition',
  INITIAL = 'initial',
  FINAL = 'final',
  ON_ENTRY = 'onentry',
  ON_EXIT = 'onexit',
  HISTORY = 'history',
  RAISE = 'raise',
  IF = 'if',
  ELSE_IF = 'elseif',
  ELSE = 'else',
  FOREACH = 'foreach',
  LOG = 'log',
  DATAMODEL = 'datamodel',
  DATA = 'data',
  ASSIGN = 'assign',
  DONE_DATA = 'donedata',
  CONTENT = 'content',
  PARAM = 'param',
  SCRIPT = 'script',
  SEND = 'send',
  CANCEL = 'cancel',
  INVOKE = 'invoke',
  FINALIZE = 'finalize',
}

export const enum Binding {
  EARLY = 'early',
  LATE = 'late',
}

export const enum TransitionType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export const enum HistoryType {
  SHALLOW = 'shallow',
  DEEP = 'deep',
}

export interface Point {
  line: number;
  column: number;
  offset?: number;
}

export interface Position {
  start: Point;
  end: Point;
  indent?: number;
}

export interface Node {
  type: NodeType;
  data?: { [s: string]: any };
  position?: Position;
}

export interface Parent extends Node {
  children: Node[];
}

export interface Text extends Node {
  value: string;
}

export interface SCXML extends Parent {
  type: NodeType.SCXML;
  initial: string[];
  datamodel?: string;
  binding: Binding;
}

export interface State extends Parent {
  type: NodeType.STATE;
  id?: string;
  initial: string[];
  name?: string;
}

export interface Parallel extends Parent {
  type: NodeType.PARALLEL;
  id?: string;
  name?: string;
}

export interface Transition<Executable> extends Parent {
  type: NodeType.TRANSITION;
  event: string[];
  target: string[] | false;
  t: TransitionType;
  cond?: Executable;
  name?: string;
}

export interface Initial extends Parent {
  type: NodeType.INITIAL;
  name?: string;
}

export interface Final extends Parent {
  type: NodeType.FINAL;
  id?: string;
  name?: string;
}

export interface OnEntry extends Parent {
  type: NodeType.ON_ENTRY;
}

export interface OnExit extends Parent {
  type: NodeType.ON_EXIT;
}

export interface History extends Parent {
  type: NodeType.HISTORY;
  id?: string;
  t: HistoryType;
  name?: string;
}

export interface Raise extends Parent {
  type: NodeType.RAISE;
  event: string;
}

export interface If<Executable> extends Parent {
  type: NodeType.IF;
  cond: Executable;
}

export interface ElseIf<Executable> extends Parent {
  type: NodeType.ELSE_IF;
  cond: Executable;
}

export interface Else extends Parent {
  type: NodeType.ELSE;
}

export interface Foreach<Executable> extends Parent {
  type: NodeType.FOREACH;
  item?: string;
  index?: string;
  array: Executable;
}

export interface Log<Executable> extends Parent {
  type: NodeType.LOG;
  label?: string;
  expr: Executable;
}

export interface Datamodel extends Parent {
  type: NodeType.DATAMODEL;
}

export interface Data<Executable> extends Parent {
  type: NodeType.DATA;
  id: string;
  src?: string;
  expr?: Executable;
}

export interface Assign<Executable> extends Parent {
  type: NodeType.ASSIGN;
  location: string;
  expr?: Executable;
}

export interface DoneData extends Parent {
  type: NodeType.DONE_DATA;
}

export interface Content<Executable> extends Parent {
  type: NodeType.CONTENT;
  expr?: Executable;
}

export interface Param<Executable> extends Parent {
  type: NodeType.PARAM;
  location: string;
  expr?: Executable;
}

export interface Script extends Parent {
  type: NodeType.SCRIPT;
  src?: string;
}

export interface Send<Executable> extends Parent {
  type: NodeType.SEND;
  namelist: string[];
  event: Executable;
  target: Executable;
  t: Executable;
  id: Executable;
  delay: Executable;
}

export interface Cancel<Executable> extends Parent {
  type: NodeType.CANCEL;
  sendid: Executable;
}

export interface Invoke<Executable> extends Parent {
  type: NodeType.SEND;
  namelist: string[];
  autoforward: boolean;
  t: Executable;
  src: Executable;
  id: Executable;
}

export interface Finalize extends Parent {
  type: NodeType.FINALIZE;
}
