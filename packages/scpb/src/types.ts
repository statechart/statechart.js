import {
  Document,
  Invocation,
  State,
  StateType,
  Transition,
  TransitionType,
} from '@statechart/types';

export type Document = Document<Expression>;
export type State = State<Expression>;
export type Transition = Transition<Expression>;
export type Invocation = Invocation<Expression>;

export const enum ExpressionType {
  RAISE = 'raise',
  COND = 'cond',
  CLAUSE = 'clause',
  FOREACH = 'foreach',
  LOG = 'log',
  ASSIGN = 'assign',
  PARAM = 'param',
  SCRIPT = 'script',
  SEND = 'send',
  CANCEL = 'cancel',
  EXPR = 'expr',
  LITERAL = 'literal',
  LOCATION = 'location',
  SCRIPT_EXT = 'script_ext',
  EVAL = 'eval',
}

export interface Expression {
  type: ExpressionType;
  value: string;
  props: { [s: string]: Expression };
  children: Expression[];
}

export interface Data {
  id: string;
  value?: Expression;
  src?: string;
}

export const state = [
  StateType.COMPOUND,
  StateType.ATOMIC,
  StateType.PARALLEL,
  StateType.HISTORY_SHALLOW,
  StateType.HISTORY_DEEP,
  StateType.INITIAL,
  StateType.FINAL,
];

export const transition = [
  TransitionType.EXTERNAL,
  TransitionType.TARGETLESS,
  TransitionType.INTERNAL,
  TransitionType.SPONTANEOUS,
  TransitionType.HISTORY,
  TransitionType.INITIAL,
];

export const expression = [
  ExpressionType.RAISE,
  ExpressionType.COND,
  ExpressionType.CLAUSE,
  ExpressionType.FOREACH,
  ExpressionType.LOG,
  ExpressionType.ASSIGN,
  ExpressionType.PARAM,
  ExpressionType.SCRIPT,
  ExpressionType.SEND,
  ExpressionType.CANCEL,
  ExpressionType.EXPR,
  ExpressionType.LITERAL,
  ExpressionType.LOCATION,
  ExpressionType.SCRIPT_EXT,
  ExpressionType.EVAL,
];
