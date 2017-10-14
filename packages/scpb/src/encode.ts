import {Writer as $Writer} from "protobufjs/minimal";
import {encode as encodeBitset} from "@statechart/scpb-bitset";
import {
  Document,
  Invocation,
  State,
  Transition,
  Expression,
  Data,
  expression as expressionTypes,
  state as stateTypes,
  transition as transitionTypes
} from "./types";

export function encode(message: Document, writer: $Writer) {
  if (!writer) writer = $Writer.create();

  const {states = [], transitions = []} = message;
  const stateSize = states.length;
  const transitionSize = transitions.length;

  if (message.name != null && message.hasOwnProperty("name")) {
    writer.uint32(/* Id 1, wireType 2 =*/10).string(message.name);
  }
  if (states.length) {
    for (let i = 0; i < states.length; ++i) {
      encodeState(states[i], writer.uint32(/* Id 2, wireType 2 =*/18).fork(), stateSize, transitionSize).ldelim();
    }
  }
  if (transitions.length) {
    for (let i = 0; i < transitions.length; ++i) {
      encodeTransition(transitions[i], writer.uint32(/* Id 3, wireType 2 =*/26).fork(), stateSize, transitionSize).ldelim();
    }
  }
  if (message.datamodel != null && message.hasOwnProperty("datamodel")) {
    writer.uint32(/* Id 4, wireType 2 =*/34).string(message.datamodel);
  }
  if (message.meta != null && message.hasOwnProperty("meta")) {
    for (let keys = Object.keys(message.meta), i = 0; i < keys.length; ++i) {
      writer.uint32(/* Id 5, wireType 2 =*/42).fork().uint32(/* Id 1, wireType 2 =*/10).string(keys[i]).uint32(/* Id 2, wireType 2 =*/18).string(message.meta[keys[i]]).ldelim();
    }
  }

  return writer;
}

function encodeState(message: State, writer: $Writer, stateSize: number, transitionSize: number) {
  if (message.type != null && message.hasOwnProperty("type")) {
    writer.uint32(/* Id 1, wireType 0 =*/8).uint32(stateTypes.indexOf(message.type));
  }
  if (message.idx != null && message.hasOwnProperty("idx")) {
    writer.uint32(/* Id 2, wireType 0 =*/16).uint32(message.idx);
  }
  if (message.id != null && message.hasOwnProperty("id")) {
    writer.uint32(/* Id 3, wireType 2 =*/26).string(message.id);
  }
  if (message.onEnter != null && message.onEnter.length) {
    for (let i = 0; i < message.onEnter.length; ++i) {
      encodeExpression(message.onEnter[i], writer.uint32(/* Id 4, wireType 2 =*/34).fork()).ldelim();
    }
  }
  if (message.onExit != null && message.onExit.length) {
    for (let i = 0; i < message.onExit.length; ++i) {
      encodeExpression(message.onExit[i], writer.uint32(/* Id 5, wireType 2 =*/42).fork()).ldelim();
    }
  }
  if (message.invocations != null && message.invocations.length) {
    for (let i = 0; i < message.invocations.length; ++i) {
      encodeInvocation(message.invocations[i], writer.uint32(/* Id 6, wireType 2 =*/50).fork()).ldelim();
    }
  }
  if (message.data != null && message.data.length) {
    for (let i = 0; i < message.data.length; ++i) {
      encodeData(message.data[i], writer.uint32(/* Id 7, wireType 2 =*/58).fork()).ldelim();
    }
  }
  if (message.parent != null && message.hasOwnProperty("parent")) {
    writer.uint32(/* Id 8, wireType 0 =*/64).uint32(message.parent);
  }
  if (message.children != null && message.hasOwnProperty("children")) {
    writer.uint32(/* Id 9, wireType 2 =*/74).bytes(encodeBitset(message.children, stateSize));
  }
  if (message.ancestors != null && message.hasOwnProperty("ancestors")) {
    writer.uint32(/* Id 10, wireType 2 =*/82).bytes(encodeBitset(message.ancestors, stateSize));
  }
  if (message.completion != null && message.hasOwnProperty("completion")) {
    writer.uint32(/* Id 11, wireType 2 =*/90).bytes(encodeBitset(message.completion, stateSize));
  }
  if (message.transitions != null && message.hasOwnProperty("transitions")) {
    writer.uint32(/* Id 12, wireType 2 =*/98).bytes(encodeBitset(message.transitions, transitionSize));
  }
  if (message.hasHistory != null && message.hasOwnProperty("hasHistory")) {
    writer.uint32(/* Id 13, wireType 0 =*/104).bool(message.hasHistory);
  }
  if (message.name != null && message.hasOwnProperty("name")) {
    writer.uint32(/* Id 14, wireType 2 =*/114).string(message.name);
  }

  return writer;
}

function encodeTransition(message: Transition, writer: $Writer, stateSize: number, transitionSize: number) {
  if (message.type != null && message.hasOwnProperty("type")) {
    writer.uint32(/* Id 1, wireType 0 =*/8).uint32(transitionTypes.indexOf(message.type));
  }
  if (message.idx != null && message.hasOwnProperty("idx")) {
    writer.uint32(/* Id 2, wireType 0 =*/16).uint32(message.idx);
  }
  if (message.source != null && message.hasOwnProperty("source")) {
    writer.uint32(/* Id 3, wireType 0 =*/24).uint32(message.source);
  }
  if (message.events != null && message.events.length) {
    for (let i = 0; i < message.events.length; ++i) {
      writer.uint32(/* Id 4, wireType 2 =*/34).string(message.events[i]);
    }
  }
  if (message.condition != null && message.hasOwnProperty("condition")) {
    encodeExpression(message.condition, writer.uint32(/* Id 5, wireType 2 =*/42).fork()).ldelim();
  }
  if (message.onTransition != null && message.onTransition.length) {
    for (let i = 0; i < message.onTransition.length; ++i) {
      encodeExpression(message.onTransition[i], writer.uint32(/* Id 6, wireType 2 =*/50).fork()).ldelim();
    }
  }
  if (message.targets != null && message.hasOwnProperty("targets")) {
    writer.uint32(/* Id 7, wireType 2 =*/58).bytes(encodeBitset(message.targets, stateSize));
  }
  if (message.conflicts != null && message.hasOwnProperty("conflicts")) {
    writer.uint32(/* Id 8, wireType 2 =*/66).bytes(encodeBitset(message.conflicts, transitionSize));
  }
  if (message.exits != null && message.hasOwnProperty("exits")) {
    writer.uint32(/* Id 9, wireType 2 =*/74).bytes(encodeBitset(message.exits, stateSize));
  }
  if (message.name != null && message.hasOwnProperty("name")) {
    writer.uint32(/* Id 10, wireType 2 =*/82).string(message.name);
  }

  return writer;
}

function encodeInvocation(message: Invocation, writer: $Writer) {
  if (message.type != null && message.hasOwnProperty("type")) {
    encodeExpression(message.type, writer.uint32(/* Id 1, wireType 2 =*/10).fork()).ldelim();
  }
  if (message.src != null && message.hasOwnProperty("src")) {
    encodeExpression(message.src, writer.uint32(/* Id 2, wireType 2 =*/18).fork()).ldelim();
  }
  if (message.id != null && message.hasOwnProperty("id")) {
    encodeExpression(message.id, writer.uint32(/* Id 3, wireType 2 =*/26).fork()).ldelim();
  }
  if (message.params != null && message.params.length) {
    for (let i = 0; i < message.params.length; ++i) {
      encodeExpression(message.params[i], writer.uint32(/* Id 4, wireType 2 =*/34).fork()).ldelim();
    }
  }
  if (message.content != null && message.hasOwnProperty("content")) {
    encodeExpression(message.content, writer.uint32(/* Id 5, wireType 2 =*/42).fork()).ldelim();
  }
  if (message.onExit != null && message.onExit.length) {
    for (let i = 0; i < message.onExit.length; ++i) {
      encodeExpression(message.onExit[i], writer.uint32(/* Id 6, wireType 2 =*/50).fork()).ldelim();
    }
  }
  if (message.autoforward != null && message.hasOwnProperty("autoforward")) {
    writer.uint32(/* Id 7, wireType 0 =*/56).bool(message.autoforward);
  }

  return writer;
}

function encodeExpression (message: Expression, writer: $Writer) {
  if (message.type != null && message.hasOwnProperty("type")) {
    writer.uint32(/* Id 1, wireType 0 =*/8).uint32(expressionTypes.indexOf(message.type));
  }
  if (message.value != null && message.hasOwnProperty("value")) {
    writer.uint32(/* Id 2, wireType 2 =*/18).string(message.value);
  }
  if (message.props != null && message.hasOwnProperty("props")) {
    for (let keys = Object.keys(message.props), i = 0; i < keys.length; ++i) {
      const value = message.props[keys[i]];

      if (value == null) {
        continue;
      }
      writer.uint32(/* Id 3, wireType 2 =*/26).fork().uint32(/* Id 1, wireType 2 =*/10).string(keys[i]);
      encodeExpression(value, writer.uint32(/* Id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
    }
  }
  if (message.children != null && message.children.length) {
    for (let i = 0; i < message.children.length; ++i) {
      encodeExpression(message.children[i], writer.uint32(/* Id 4, wireType 2 =*/34).fork()).ldelim();
    }
  }

  return writer;
}

function encodeData(message: Data, writer: $Writer) {
  if (message.id != null && message.hasOwnProperty("id")) {
    writer.uint32(/* Id 1, wireType 2 =*/10).string(message.id);
  }
  if (message.value != null && message.hasOwnProperty("value")) {
    encodeExpression(message.value, writer.uint32(/* Id 2, wireType 2 =*/18).fork()).ldelim();
  }
  if (message.src != null && message.hasOwnProperty("src")) {
    writer.uint32(/* Id 3, wireType 2 =*/26).string(message.src);
  }

  return writer;
}
