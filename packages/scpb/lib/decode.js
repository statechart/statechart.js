var $protobuf = require('protobufjs/minimal');
var decodeBitset = require('@statechart/scpb-bitset').decode;
var types = require('./types');

var $Reader = $protobuf.Reader;

module.exports = decodeDocument;

function decodeDocument(reader, length) {
    if (!(reader instanceof $Reader))
        reader = $Reader.create(reader);
    var end = length === undefined ? reader.len : reader.pos + length, message = {};
    while (reader.pos < end) {
        var tag = reader.uint32();
        switch (tag >>> 3) {
        case 1:
            message.name = reader.string();
            break;
        case 2:
            if (!(message.states && message.states.length))
                message.states = [];
            message.states.push(decodeState(reader, reader.uint32()));
            break;
        case 3:
            if (!(message.transitions && message.transitions.length))
                message.transitions = [];
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

var stateTypes = types.state;
function decodeState(reader, length) {
    if (!(reader instanceof $Reader))
        reader = $Reader.create(reader);
    var end = length === undefined ? reader.len : reader.pos + length, message = {};
    while (reader.pos < end) {
        var tag = reader.uint32();
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
            if (!(message.onEnter && message.onEnter.length))
                message.onEnter = [];
            message.onEnter.push(decodeExpression(reader, reader.uint32()));
            break;
        case 5:
            if (!(message.onExit && message.onExit.length))
                message.onExit = [];
            message.onExit.push(decodeExpression(reader, reader.uint32()));
            break;
        case 6:
            message.parent = reader.uint32();
            break;
        case 7:
            message.children = decodeBitset(reader.bytes());
            break;
        case 8:
            message.ancestors = decodeBitset(reader.bytes());
            break;
        case 9:
            message.completion = decodeBitset(reader.bytes());
            break;
        case 10:
            message.transitions = decodeBitset(reader.bytes());
            break;
        case 11:
            message.hasHistory = reader.bool();
            break;
        default:
            reader.skipType(tag & 7);
            break;
        }
    }
    return message;
}

var transitionTypes = types.transition;
function decodeTransition(reader, length) {
    if (!(reader instanceof $Reader))
        reader = $Reader.create(reader);
    var end = length === undefined ? reader.len : reader.pos + length, message = {};
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
            if (!(message.events && message.events.length))
                message.events = [];
            message.events.push(reader.string());
            break;
        case 5:
            message.condition = decodeExpression(reader, reader.uint32());
            break;
        case 6:
            if (!(message.onTransition && message.onTransition.length))
                message.onTransition = [];
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
    var end = length === undefined ? reader.len : reader.pos + length, message = {};
    while (reader.pos < end) {
        var tag = reader.uint32();
        switch (tag >>> 3) {
        case 1:
            message["eval"] = reader.string();
            break;
        case 2:
            message.string = reader.string();
            break;
        case 3:
            if (!(message.children && message.children.length))
                message.children = [];
            message.children.push(decodeExpression(reader, reader.uint32()));
            break;
        case 4:
            message.document = decodeDocument(reader, reader.uint32());
            break;
        default:
            reader.skipType(tag & 7);
            break;
        }
    }
    return message;
}
