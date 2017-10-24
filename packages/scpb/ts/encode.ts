/* tslint:disable:no-increment-decrement space-in-parens strict-boolean-expressions */
import { Writer as $Writer } from 'protobufjs/minimal';
import { encode as encodeBitset } from '@statechart/scpb-bitset';
import {
  Document,
  Invocation,
  State,
  Transition,
  state as stateTypes,
  transition as transitionTypes,
} from './types';

export function encode(document: Document) {
  const writer = $Writer.create(); // tslint:disable-line

  const {
    name,
    states,
    transitions,
    datamodel,
    meta,
  } = document;
  const stateSize = states.length;
  const transitionSize = transitions.length;

  if (name != null)
    writer.uint32(/* id 1, wireType 2 =*/10).string(name);
  for (let i = 0; i < states.length; ++i) {
    encodeState(
      states[i],
      writer.uint32(/* id 2, wireType 2 =*/18).fork(),
      stateSize,
      transitionSize,
    ).ldelim();
  }
  for (let i = 0; i < transitions.length; ++i) {
    encodeTransition(
      transitions[i],
      writer.uint32(/* id 3, wireType 2 =*/26).fork(),
      stateSize,
      transitionSize,
    ).ldelim();
  }
  if (datamodel)
    writer.uint32(/* id 4, wireType 2 =*/34).string(datamodel);
  if (meta != null) {
    for (let keys = Object.keys(meta), i = 0; i < keys.length; ++i) {
      writer.uint32(/* id 5, wireType 2 =*/42)
        .fork()
        .uint32(/* Id 1, wireType 2 =*/10)
        .string(keys[i])
        .uint32(/* Id 2, wireType 2 =*/18)
        .string(meta[keys[i]])
        .ldelim();
    }
  }

  return writer;
}

function encodeState(state: State, writer: $Writer, stateSize: number, transitionSize: number) {
  const {
    type,
    idx,
    id,
    onInit,
    onEnter,
    onExit,
    invocations,
    parent,
    children,
    ancestors,
    completion,
    transitions,
    hasHistory,
    name,
  } = state;

  writer.uint32(/* id 1, wireType 0 =*/8).uint32(stateTypes.indexOf(type));
  writer.uint32(/* id 2, wireType 0 =*/16).uint32(idx);
  if (id != null)
    writer.uint32(/* id 3, wireType 2 =*/26).string(id);
  for (let i = 0; i < onInit.length; ++i) {
    writer.uint32(/* id 4, wireType 2 =*/34).bytes(onInit[i]);
  }
  for (let i = 0; i < onEnter.length; ++i) {
    writer.uint32(/* id 5, wireType 2 =*/42).bytes(onEnter[i]);
  }
  for (let i = 0; i < onExit.length; ++i) {
    writer.uint32(/* id 6, wireType 2 =*/50).bytes(onExit[i]);
  }
  for (let i = 0; i < invocations.length; ++i) {
    encodeInvocation(invocations[i], writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
  }
  writer.uint32(/* id 8, wireType 0 =*/64).uint32(parent);
  writer.uint32(/* id 9, wireType 2 =*/74).bytes(encodeBitset(children, stateSize));
  writer.uint32(/* id 10, wireType 2 =*/82).bytes(encodeBitset(ancestors, stateSize));
  writer.uint32(/* id 11, wireType 2 =*/90).bytes(encodeBitset(completion, stateSize));
  writer.uint32(/* id 12, wireType 2 =*/98).bytes(encodeBitset(transitions, transitionSize));
  writer.uint32(/* id 13, wireType 0 =*/104).bool(hasHistory);
  if (name != null)
    writer.uint32(/* id 14, wireType 2 =*/114).string(name);

  return writer;
}

function encodeTransition(
  transition: Transition,
  writer: $Writer,
  stateSize: number,
  transitionSize: number,
) {
  const {
    type,
    idx,
    source,
    event,
    condition,
    onTransition,
    targets,
    conflicts,
    exits,
    name,
  } = transition;

  writer.uint32(/* id 1, wireType 0 =*/8).uint32(transitionTypes.indexOf(type));
  writer.uint32(/* id 2, wireType 0 =*/16).uint32(idx);
  writer.uint32(/* id 3, wireType 0 =*/24).uint32(source);
  if (event != null)
    writer.uint32(/* id 4, wireType 2 =*/34).bytes(event);
  if (condition != null)
    writer.uint32(/* id 5, wireType 2 =*/42).bytes(condition);
  for (let i = 0; i < onTransition.length; ++i) {
    writer.uint32(/* id 6, wireType 2 =*/50).bytes(onTransition[i]);
  }
  writer.uint32(/* id 7, wireType 2 =*/58).bytes(encodeBitset(targets, stateSize));
  writer.uint32(/* id 8, wireType 2 =*/66).bytes(encodeBitset(conflicts, transitionSize));
  writer.uint32(/* id 9, wireType 2 =*/74).bytes(encodeBitset(exits, stateSize));
  if (name != null)
    writer.uint32(/* id 10, wireType 2 =*/82).string(name);

  return writer;
}

function encodeInvocation(invocation: Invocation, writer: $Writer) {
  const {
    type,
    src,
    id,
    content,
    onExit,
    autoforward,
  } = invocation;

  writer.uint32(/* id 1, wireType 2 =*/10).bytes(type);
  writer.uint32(/* id 2, wireType 2 =*/18).bytes(src);
  writer.uint32(/* id 3, wireType 2 =*/26).bytes(id);
  writer.uint32(/* id 4, wireType 2 =*/34).bytes(content);
  for (let i = 0; i < onExit.length; ++i) {
    writer.uint32(/* id 5, wireType 2 =*/42).bytes(onExit[i]);
  }
  writer.uint32(/* id 6, wireType 0 =*/48).bool(autoforward);

  return writer;
}
