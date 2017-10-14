import { Reader as $Reader } from 'protobufjs/minimal';
import { decode as decodeBitset } from '@statechart/scpb-bitset';
import {
  Document,
  State,
  Transition,
  Invocation,
  StateType,
  TransitionType,
  state as stateTypes,
  transition as transitionTypes,
} from './types';

export function decode(reader: $Reader, length?: number): Document {
  if (!(reader instanceof $Reader))
    reader = $Reader.create(reader);

  const end = length === undefined ? reader.len : reader.pos + length;
  const document = {
    states: [],
    transitions: [],
    meta: {},
  } as Document;

  while (reader.pos < end) {
    const tag = reader.uint32();
    switch (tag >>> 3) {
    case 1:
      document.name = reader.string();
      break;
    case 2:
      document.states.push(decodeState(reader, reader.uint32()));
      break;
    case 3:
      document.transitions.push(decodeTransition(reader, reader.uint32()));
      break;
    case 4:
      document.datamodel = reader.string();
      break;
    case 5:
      reader.skip().pos++;
      const key = reader.string();
      reader.pos++;
      (document.meta as any)[key] = reader.string();
      break;
    default:
      reader.skipType(tag & 7);
      break;
    }
  }
  return document;
}

function decodeState(reader: $Reader, length?: number): State {
  const end = length === undefined ? reader.len : reader.pos + length;
  const state = {
    type: StateType.ATOMIC,
    idx: -1,
    onInit: [],
    onEnter: [],
    onExit: [],
    invocations: [],
    parent: -1,
    children: [],
    ancestors: [],
    completion: [],
    transitions: [],
    hasHistory: false,
  } as State;

  while (reader.pos < end) {
    let tag = reader.uint32();
    switch (tag >>> 3) {
    case 1:
      state.type = stateTypes[reader.uint32()];
      break;
    case 2:
      state.idx = reader.uint32();
      break;
    case 3:
      state.id = reader.string();
      break;
    case 4:
      state.onInit.push(reader.bytes());
      break;
    case 5:
      state.onEnter.push(reader.bytes());
      break;
    case 6:
      state.onExit.push(reader.bytes());
      break;
    case 7:
      state.invocations.push(decodeInvocation(reader, reader.uint32()));
      break;
    case 8:
      state.parent = reader.uint32();
      break;
    case 9:
      state.children = decodeBitset(reader.bytes());
      break;
    case 10:
      state.ancestors = decodeBitset(reader.bytes());
      break;
    case 11:
      state.completion = decodeBitset(reader.bytes());
      break;
    case 12:
      state.transitions = decodeBitset(reader.bytes());
      break;
    case 13:
      state.hasHistory = reader.bool();
      break;
    case 14:
      state.name = reader.string();
      break;
    default:
      reader.skipType(tag & 7);
      break;
    }
  }
  return state;
}

function decodeTransition(reader: $Reader, length?: number): Transition {
  let end = length === undefined ? reader.len : reader.pos + length;
  let message = {
    type: TransitionType.EXTERNAL,
    idx: -1,
    source: -1,
    onTransition: [],
    targets: [],
    conflicts: [],
    exits: [],
  } as Transition;

  while (reader.pos < end) {
    let tag = reader.uint32();
    switch (tag >>> 3) {
    case 1:
      message.type = transitionTypes[reader.uint32()];
      break;
    case 2:
      message.idx = reader.uint32();
      break;
    case 3:
      message.source = reader.uint32();
      break;
    case 4:
      message.event = reader.bytes();
      break;
    case 5:
      message.condition = reader.bytes();
      break;
    case 6:
      message.onTransition.push(reader.bytes());
      break;
    case 7:
      message.targets = decodeBitset(reader.bytes());
      break;
    case 8:
      message.conflicts = decodeBitset(reader.bytes());
      break;
    case 9:
      message.exits = decodeBitset(reader.bytes());
      break;
    case 10:
      message.name = reader.string();
      break;
    default:
      reader.skipType(tag & 7);
      break;
    }
  }
  return message;
}

const emptyBytes = new Uint8Array(0);
function decodeInvocation(reader: $Reader, length?: number) {
  let end = length === undefined ? reader.len : reader.pos + length;
  let message = {
    type: emptyBytes,
    src: emptyBytes,
    id: emptyBytes,
    content: emptyBytes,
    onExit: [],
    autoforward: false,
  } as Invocation;

  while (reader.pos < end) {
    let tag = reader.uint32();
    switch (tag >>> 3) {
    case 1:
      message.type = reader.bytes();
      break;
    case 2:
      message.src = reader.bytes();
      break;
    case 3:
      message.id = reader.bytes();
      break;
    case 4:
      message.content = reader.bytes();
      break;
    case 5:
      message.onExit.push(reader.bytes());
      break;
    case 6:
      message.autoforward = reader.bool();
      break;
    default:
      reader.skipType(tag & 7);
      break;
    }
  }
  return message;
}
