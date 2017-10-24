import {
  Document,
  State,
  Transition,
  Invocation,
} from '@statechart/scexe';

export type Transformer<From, To> = (executable: From) => To;

export function transform<From, To>(
  document: Document<From>,
  transformer: Transformer<From, To>,
): Document<To> {
  return {
    ...document,
    states: document.states.map(s => loadState(s, transformer)),
    transitions: document.transitions.map(t => loadTransition(t, transformer)),
  };
}

function safeLoad<From, To>(value: From, transformer: Transformer<From, To>): To | undefined {
  return value === undefined ? undefined : transformer(value);
}

function loadState<From, To>(
  state: State<From>,
  transformer: Transformer<From, To>,
): State<To> {
  const {
    onInit,
    onEnter,
    onExit,
    invocations,
  } = state;

  return {
    ...state,
    onInit: onInit.map(transformer),
    onEnter: onEnter.map(transformer),
    onExit: onExit.map(transformer),
    invocations: invocations.map(i => invocation(i, transformer)),
  };
}

function loadTransition<From, To>(
  transition: Transition<From>,
  transformer: Transformer<From, To>,
): Transition<To> {
  const {
    onTransition,
    event,
    condition,
  } = transition;

  return {
    ...transition,
    onTransition: onTransition.map(transformer),
    event: safeLoad(event, transformer),
    condition: safeLoad(condition, transformer),
  };
}

function invocation<From, To>(
   invocation: Invocation<From>,
   transformer: Transformer<From, To>,
): Invocation<To> {
  const {
    type,
    id,
    src,
    content,
    onExit,
  } = invocation;

  return {
    ...invocation,
    type: transformer(type),
    src: transformer(src),
    id: transformer(id),
    content: transformer(content),
    onExit: onExit.map(transformer),
  };
}
