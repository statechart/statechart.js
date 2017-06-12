import { Reader as $Reader } from 'protobufjs/minimal';
import { decode as decodeBitset } from '@statechart/scpb-bitset';
import {
  state as stateTypes,
  transition as transitionTypes,
  expression as expressionTypes,
} from './types';

export default function decodeDocument(reader, length) {
    if (!(reader instanceof $Reader))
        reader = $Reader.create(reader);
    var end = length === undefined ? reader.len : reader.pos + length, message = {
      states: [],
      transitions: [],
    };
    while (reader.pos < end) {
        var tag = reader.uint32();
        switch (tag >>> 3) {
        case 1:
            message.name = reader.string();
            break;
        case 2:
            message.states.push(decodeState(reader, reader.uint32()));
            break;
        case 3:
            message.transitions.push(decodeTransition(reader, reader.uint32()));
            break;
        case 4:
            message.datamodel = reader.string();
            break;
        default:
            reader.skipType(tag & 7);
            break;
        }
    }
    return message;
}

function decodeState(reader, length) {
    if (!(reader instanceof $Reader))
        reader = $Reader.create(reader);
    let end = length === undefined ? reader.len : reader.pos + length, message = {
      onEnter: [],
      onExit: [],
      invocations: [],
      data: [],
    };
    while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
        case 1:
            message.type = stateTypes[reader.uint32()];
            break;
        case 2:
            message.idx = reader.uint32();
            break;
        case 3:
            message.id = reader.string();
            break;
        case 4:
            message.onEnter.push(decodeExpression(reader, reader.uint32()));
            break;
        case 5:
            message.onExit.push(decodeExpression(reader, reader.uint32()));
            break;
        case 6:
            message.invocations.push(decodeInvocation(reader, reader.uint32()));
            break;
        case 7:
            message.data.push(decodeData(reader, reader.uint32()));
            break;
        case 8:
            message.parent = reader.uint32();
            break;
        case 9:
            message.children = decodeBitset(reader.bytes());
            break;
        case 10:
            message.ancestors = decodeBitset(reader.bytes());
            break;
        case 11:
            message.completion = decodeBitset(reader.bytes());
            break;
        case 12:
            message.transitions = decodeBitset(reader.bytes());
            break;
        case 13:
            message.hasHistory = reader.bool();
            break;
        default:
            reader.skipType(tag & 7);
            break;
        }
    }
    return message;
}

function decodeTransition(reader, length) {
    if (!(reader instanceof $Reader))
        reader = $Reader.create(reader);
    var end = length === undefined ? reader.len : reader.pos + length, message = {
      events: [],
      onTransition: [],
    };
    while (reader.pos < end) {
        var tag = reader.uint32();
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
            message.events.push(reader.string());
            break;
        case 5:
            message.condition = decodeExpression(reader, reader.uint32());
            break;
        case 6:
            message.onTransition.push(decodeExpression(reader, reader.uint32()));
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
        default:
            reader.skipType(tag & 7);
            break;
        }
    }
    return message;
}

function decodeExpression(reader, length) {
    if (!(reader instanceof $Reader))
        reader = $Reader.create(reader);
    let end = length === undefined ? reader.len : reader.pos + length, message = {
      children: [],
    }, key;
    while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
        case 1:
            message.type = expressionTypes[reader.uint32()];
            break;
        case 2:
            message.value = reader.string();
            break;
        case 3:
            reader.skip().pos++;
            if (!message.props)
                message.props = {};
            key = reader.string();
            reader.pos++;
            message.props[key] = decodeExpression(reader, reader.uint32());
            break;
        case 4:
            message.children.push(decodeExpression(reader, reader.uint32()));
            break;
        default:
            reader.skipType(tag & 7);
            break;
        }
    }
    return message;
}

function decodeInvocation(reader, length) {
    if (!(reader instanceof $Reader))
        reader = $Reader.create(reader);
    let end = length === undefined ? reader.len : reader.pos + length, message = {
      params: [],
      onExit: [],
    };
    while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
        case 1:
            message.type = decodeExpression(reader, reader.uint32());
            break;
        case 2:
            message.src = decodeExpression(reader, reader.uint32());
            break;
        case 3:
            message.id = decodeExpression(reader, reader.uint32());
            break;
        case 4:
            message.params.push(decodeExpression(reader, reader.uint32()));
            break;
        case 5:
            message.content = decodeExpression(reader, reader.uint32());
            break;
        case 6:
            message.onExit.push(decodeExpression(reader, reader.uint32()));
            break;
        case 7:
            message.autoforward = reader.bool();
            break;
        default:
            reader.skipType(tag & 7);
            break;
        }
    }
    return message;
}

function decodeData(reader, length) {
    if (!(reader instanceof $Reader))
        reader = $Reader.create(reader);
    let end = length === undefined ? reader.len : reader.pos + length, message = {};
    while (reader.pos < end) {
        let tag = reader.uint32();
        switch (tag >>> 3) {
        case 1:
            message.id = reader.string();
            break;
        case 2:
            message.value = decodeExpression(reader, reader.uint32());
            break;
        case 3:
            message.src = reader.string();
            break;
        default:
            reader.skipType(tag & 7);
            break;
        }
    }
    return message;
}
