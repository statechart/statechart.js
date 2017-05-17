import $protobuf from 'protobufjs/minimal';
import { encode as encodeBitset } from '@statechart/scpb-bitset';
import { state as stateTypes, transition as transitionTypes } from './types';

var $Writer = $protobuf.Writer;

export default function encodeDocument(message, writer) {
    if (!writer)
        writer = $Writer.create();
    if (message.name != null && message.hasOwnProperty("name"))
        writer.uint32(10).string(message.name);
    var states = message.states || [];
    var transitions = message.transitions || [];
    for (var i = 0, l = states.length; i < l; ++i)
        encodeState(states[i], writer.uint32(18).fork(), l, transitions.length).ldelim();
    for (var i = 0, l = transitions.length; i < l; ++i)
        encodeTransition(transitions[i], writer.uint32(26).fork(), states.length, l).ldelim();
    if (message.datamodel != null && message.hasOwnProperty("datamodel"))
        writer.uint32(34).string(message.datamodel);
    return writer;
}

function encodeState(message, writer, stateSize, transitionSize) {
    if (!writer)
        writer = $Writer.create();
    if (message.type != null && message.hasOwnProperty("type"))
        writer.uint32(8).uint32(stateTypes.indexOf(message.type));
    if (message.idx != null && message.hasOwnProperty("idx"))
        writer.uint32(16).uint32(message.idx);
    if (message.id != null && message.hasOwnProperty("id"))
        writer.uint32(26).string(message.id);
    if (message.onEnter != null && message.onEnter.length)
        for (var i = 0; i < message.onEnter.length; ++i)
            encodeExpression(message.onEnter[i], writer.uint32(34).fork()).ldelim();
    if (message.onExit != null && message.onExit.length)
        for (var i = 0; i < message.onExit.length; ++i)
            encodeExpression(message.onExit[i], writer.uint32(42).fork()).ldelim();
    if (message.parent != null && message.hasOwnProperty("parent"))
        writer.uint32(48).uint32(message.parent);
    if (message.children != null && message.hasOwnProperty("children"))
        writer.uint32(58).bytes(encodeBitset(message.children, stateSize));
    if (message.ancestors != null && message.hasOwnProperty("ancestors"))
        writer.uint32(66).bytes(encodeBitset(message.ancestors, stateSize));
    if (message.completion != null && message.hasOwnProperty("completion"))
        writer.uint32(74).bytes(encodeBitset(message.completion, stateSize));
    if (message.transitions != null && message.hasOwnProperty("transitions"))
        writer.uint32(82).bytes(encodeBitset(message.transitions, transitionSize));
    if (message.hasHistory != null && message.hasOwnProperty("hasHistory"))
        writer.uint32(88).bool(message.hasHistory);
    return writer;
}

function encodeTransition(message, writer, stateSize, transitionSize) {
    if (!writer)
        writer = $Writer.create();
    if (message.type != null && message.hasOwnProperty("type"))
        writer.uint32(8).uint32(transitionTypes.indexOf(message.type));
    if (message.idx != null && message.hasOwnProperty("idx"))
        writer.uint32(16).uint32(message.idx);
    if (message.source != null && message.hasOwnProperty("source"))
        writer.uint32(24).uint32(message.source);
    if (message.events != null && message.events.length)
        for (var i = 0; i < message.events.length; ++i)
            writer.uint32(34).string(message.events[i]);
    if (message.condition != null && message.hasOwnProperty("condition"))
        encodeExpression(message.condition, writer.uint32(42).fork()).ldelim();
    if (message.onTransition != null && message.onTransition.length)
        for (var i = 0; i < message.onTransition.length; ++i)
            encodeExpression(message.onTransition[i], writer.uint32(50).fork()).ldelim();
    if (message.targets != null && message.hasOwnProperty("targets"))
        writer.uint32(58).bytes(encodeBitset(message.targets, stateSize));
    if (message.conflicts != null && message.hasOwnProperty("conflicts"))
        writer.uint32(66).bytes(encodeBitset(message.conflicts, transitionSize));
    if (message.exits != null && message.hasOwnProperty("exits"))
        writer.uint32(74).bytes(encodeBitset(message.exits, stateSize));
    return writer;
}

function encodeExpression(message, writer) {
    if (!writer)
        writer = $Writer.create();
    if (message["eval"] != null && message.hasOwnProperty("eval"))
        writer.uint32(10).string(message["eval"]);
    if (message.string != null && message.hasOwnProperty("string"))
        writer.uint32(18).string(message.string);
    if (message.children != null && message.children.length)
        for (var i = 0; i < message.children.length; ++i)
            encodeExpression(message.children[i], writer.uint32(26).fork()).ldelim();
    if (message.document != null && message.hasOwnProperty("document"))
        encodeDocument(message.document, writer.uint32(34).fork()).ldelim();
    return writer;
}
