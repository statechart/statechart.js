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

export interface Node<_Executable> {
  type: NodeType;
  data?: { [s: string]: any };
  position?: Position;
}

export interface Parent<Executable> extends Node<Executable> {
  children: Node<Executable>[];
}

export interface Text<Executable> extends Node<Executable> {
  value: string;
}

export interface SCXML<Executable> extends Parent<Executable> {
  type: NodeType.SCXML;
  initial: string[];
  datamodel?: string;
  binding: Binding;
}

export interface State<Executable> extends Parent<Executable> {
  type: NodeType.STATE;
  id?: string;
  initial: string[];
  name?: string;
}

export interface Parallel<Executable> extends Parent<Executable> {
  type: NodeType.PARALLEL;
  id?: string;
  name?: string;
}

export interface Transition<Executable> extends Parent<Executable> {
  type: NodeType.TRANSITION;
  event: string[];
  target: string[] | false;
  t: TransitionType;
  cond?: Executable;
  name?: string;
}

export interface Initial<Executable> extends Parent<Executable> {
  type: NodeType.INITIAL;
  name?: string;
}

export interface Final<Executable> extends Parent<Executable> {
  type: NodeType.FINAL;
  id?: string;
  name?: string;
}

export interface OnEntry<Executable> extends Parent<Executable> {
  type: NodeType.ON_ENTRY;
}

export interface OnExit<Executable> extends Parent<Executable> {
  type: NodeType.ON_EXIT;
}

export interface History<Executable> extends Parent<Executable> {
  type: NodeType.HISTORY;
  id?: string;
  t: HistoryType;
  name?: string;
}

export interface Raise<Executable> extends Parent<Executable> {
  type: NodeType.RAISE;
  event: string;
}

export interface If<Executable> extends Parent<Executable> {
  type: NodeType.IF;
  cond: Executable;
}

export interface ElseIf<Executable> extends Parent<Executable> {
  type: NodeType.ELSE_IF;
  cond: Executable;
}

export interface Else<Executable> extends Parent<Executable> {
  type: NodeType.ELSE;
}

export interface Foreach<Executable> extends Parent<Executable> {
  type: NodeType.FOREACH;
  item?: string;
  index?: string;
  array: Executable;
}

export interface Log<Executable> extends Parent<Executable> {
  type: NodeType.LOG;
  label?: string;
  expr: Executable;
}

export interface Datamodel<Executable> extends Parent<Executable> {
  type: NodeType.DATAMODEL;
}

export interface Data<Executable> extends Parent<Executable> {
  type: NodeType.DATA;
  id: string;
  src?: string;
  expr?: Executable;
}

export interface Assign<Executable> extends Parent<Executable> {
  type: NodeType.ASSIGN;
  location: string;
  expr?: Executable;
}

export interface DoneData<Executable> extends Parent<Executable> {
  type: NodeType.DONE_DATA;
}

export interface Content<Executable> extends Parent<Executable> {
  type: NodeType.CONTENT;
  expr?: Executable;
}

export interface Param<Executable> extends Parent<Executable> {
  type: NodeType.PARAM;
  location: string;
  expr?: Executable;
}

export interface Script<Executable> extends Parent<Executable> {
  type: NodeType.SCRIPT;
  src?: string;
}

export const enum LiteralType {
  LITERAL = 'SCAST_LITERAL',
}

export interface Literal {
  type: LiteralType;
  value: string;
}

export interface Send<Executable> extends Parent<Executable> {
  type: NodeType.SEND;
  namelist: string[];
  event: Executable | Literal;
  target: Executable | Literal;
  t: Executable | Literal;
  id: Executable | Literal;
  delay: Executable | Literal;
}

export interface Cancel<Executable> extends Parent<Executable> {
  type: NodeType.CANCEL;
  sendid: Executable | Literal;
}

export interface Invoke<Executable> extends Parent<Executable> {
  type: NodeType.SEND;
  namelist: string[];
  autoforward: boolean;
  t: Executable | Literal;
  src: Executable | Literal;
  id: Executable | Literal;
}

export interface Finalize<Executable> extends Parent<Executable> {
  type: NodeType.FINALIZE;
}
