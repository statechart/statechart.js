import { transform, Node as INode } from 'unist-util-transform';
import {
  Assign,
  Binding,
  Cancel,
  Content,
  Data,
  Datamodel,
  DoneData,
  Else,
  ElseIf,
  Final,
  Finalize,
  Foreach,
  History,
  HistoryType,
  If,
  Initial,
  Invoke,
  Literal,
  LiteralType,
  Log,
  Node,
  NodeType,
  OnEntry,
  OnExit,
  Parallel,
  Param,
  Position,
  Raise,
  Script,
  SCXML,
  Send,
  State,
  Transition,
  TransitionType,
} from '@statechart/scast';

export interface HastNode extends INode {
  tagName: string;
  properties?: Record<string, any>;
  data?: Record<string, any>;
  children?: HastNode[];
  position?: Position;
}

interface TransformNode extends INode {
  type: NodeType;
  properties: Record<string, any>;
  data?: Record<string, any>;
  children?: TransformNode[];
}

type propLoc = (name: string, fallback?: string) => Position | undefined;

type Transform<Executable> =
  (
    node: TransformNode,
    propLoc: propLoc,
  ) => Node<Executable>;

const tags = {
  scxml<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;
    return {
      ...node,
      type: NodeType.SCXML,
      initial: parseStringList(properties.initial),
      datamodel: properties.datamodel,
      binding: properties.binding === Binding.EARLY ?
        Binding.EARLY :
        Binding.LATE,
      name: properties.name,
      data: {
        ...data,
        properties: {
          initial: propLoc('initial'),
          datamodel: propLoc('datamodel'),
          binding: propLoc('binding'),
          name: propLoc('name'),
        },
      },
    } as SCXML<Executable>;
  },

  state<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.STATE,
      id: properties.id,
      initial: parseStringList(properties.initial),
      name: properties.name,
      data: {
        ...data,
        properties: {
          id: propLoc('id'),
          initial: propLoc('initial'),
          name: propLoc('name'),
        },
      },
    } as State<Executable>;
  },

  parallel<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.PARALLEL,
      id: properties.id,
      name: properties.name,
      data: {
        ...data,
        properties: {
          id: propLoc('id'),
          name: propLoc('name'),
        },
      },
    } as Parallel<Executable>;
  },

  transition<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.TRANSITION,
      event: parseStringList(properties.event),
      target: parseStringList(properties.target),
      t: properties.type === TransitionType.INTERNAL ?
        TransitionType.INTERNAL :
        TransitionType.EXTERNAL,
      cond: properties.cond,
      name: properties.name,
      data: {
        ...data,
        properties: {
          event: propLoc('event'),
          target: propLoc('target'),
          t: propLoc('type'),
          cond: propLoc('cond'),
          name: propLoc('name'),
        },
      },
    } as Transition<Executable>;
  },

  initial<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.INITIAL,
      name: properties.name,
      data: {
        ...data,
        properties: {
          name: propLoc('name'),
        },
      },
    } as Initial<Executable>;
  },

  final<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.FINAL,
      id: properties.id,
      name: properties.name,
      data: {
        ...data,
        properties: {
          id: propLoc('id'),
          name: propLoc('name'),
        },
      },
    } as Final<Executable>;
  },

  onentry<Executable>(
    node: TransformNode,
  ) {
    return {
      ...node,
      type: NodeType.ON_ENTRY,
    } as OnEntry<Executable>;
  },

  onexit<Executable>(
    node: TransformNode,
  ) {
    return {
      ...node,
      type: NodeType.ON_EXIT,
    } as OnExit<Executable>;
  },

  onevent<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    const event = parseStringList(properties.event);
    if (event.length === 0) event.push('*');

    return {
      ...node,
      event,
      type: NodeType.TRANSITION,
      target: false,
      t: TransitionType.INTERNAL,
      cond: properties.cond,
      name: properties.name,
      data: {
        ...data,
        properties: {
          event: propLoc('event'),
          cond: propLoc('cond'),
          name: propLoc('name'),
        },
      },
    } as Transition<Executable>;
  },

  history<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.HISTORY,
      id: properties.id,
      t: properties.type === HistoryType.DEEP ?
        HistoryType.DEEP :
        HistoryType.SHALLOW,
      name: properties.name,
      data: {
        ...data,
        properties: {
          id: propLoc('id'),
          t: propLoc('type'),
          name: propLoc('name'),
        },
      },
    } as History<Executable>;
  },

  raise<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.RAISE,
      event: properties.event,
      data: {
        ...data,
        properties: {
          event: propLoc('event'),
        },
      },
    } as Raise<Executable>;
  },

  if<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.IF,
      cond: properties.cond,
      data: {
        ...data,
        properties: {
          cond: propLoc('cond'),
        },
      },
    } as If<Executable>;
  },

  elseif<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.ELSE_IF,
      cond: properties.cond,
      data: {
        ...data,
        properties: {
          cond: propLoc('cond'),
        },
      },
    } as ElseIf<Executable>;
  },

  else<Executable>(
    node: TransformNode,
  ) {
    return {
      ...node,
      type: NodeType.ELSE,
    } as Else<Executable>;
  },

  foreach<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.FOREACH,
      item: properties.item,
      index: properties.index,
      array: properties.array,
      data: {
        ...data,
        properties: {
          item: propLoc('item'),
          index: propLoc('index'),
          array: propLoc('array'),
        },
      },
    } as Foreach<Executable>;
  },

  log<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.LOG,
      label: properties.label,
      expr: properties.expr,
      data: {
        ...data,
        properties: {
          label: propLoc('label'),
          expr: propLoc('expr'),
        },
      },
    } as Log<Executable>;
  },

  datamodel<Executable>(
    node: TransformNode,
  ) {
    return {
      ...node,
      type: NodeType.DATAMODEL,
    } as Datamodel<Executable>;
  },

  data<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.DATA,
      id: properties.id,
      src: properties.src,
      expr: properties.expr,
      data: {
        ...data,
        properties: {
          id: propLoc('id'),
          src: propLoc('src'),
          expr: propLoc('expr'),
        },
      },
    } as Data<Executable>;
  },

  assign<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.ASSIGN,
      location: properties.location,
      expr: properties.expr,
      data: {
        ...data,
        properties: {
          location: propLoc('location'),
          expr: propLoc('expr'),
        },
      },
    } as Assign<Executable>;
  },

  donedata<Executable>(
    node: TransformNode,
  ) {
    return {
      ...node,
      type: NodeType.DONE_DATA,
    } as DoneData<Executable>;
  },

  content<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.CONTENT,
      expr: properties.expr,
      data: {
        ...data,
        properties: {
          expr: propLoc('expr'),
        },
      },
    } as Content<Executable>;
  },

  param<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.PARAM,
      name: properties.name,
      location: properties.location,
      expr: properties.expr,
      data: {
        ...data,
        properties: {
          name: propLoc('name'),
          location: propLoc('location'),
          expr: propLoc('expr'),
        },
      },
    } as Param<Executable>;
  },

  script<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.SCRIPT,
      src: properties.src,
      data: {
        ...data,
        properties: {
          src: propLoc('src'),
        },
      },
    } as Script<Executable>;
  },

  send<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.SEND,
      namelist: parseStringList(properties.namelist),
      event: parseExecutableProp(properties, 'event', 'eventexpr'),
      target: parseExecutableProp(properties, 'target', 'targetexpr'),
      t: parseExecutableProp(properties, 'type', 'typeexpr'),
      id: parseExecutableProp(properties, 'id', 'idlocation'),
      delay: parseExecutableProp(properties, 'delay', 'delayexpr'),
      data: {
        ...data,
        properties: {
          namelist: propLoc('namelist'),
          event: propLoc('event', 'eventexpr'),
          target: propLoc('target', 'targetexpr'),
          t: propLoc('type', 'typeexpr'),
          id: propLoc('id', 'idlocation'),
          delay: propLoc('delay', 'delayexpr'),
        },
      },
    } as Send<Executable>;
  },

  cancel<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.CANCEL,
      sendid: parseExecutableProp(properties, 'sendid', 'sendidexpr'),
      data: {
        ...data,
        properties: {
          sendid: propLoc('sendid', 'sendidexpr'),
        },
      },
    } as Cancel<Executable>;
  },

  invoke<Executable>(
    node: TransformNode,
    propLoc: propLoc,
  ) {
    const { properties = {}, data = {} } = node;

    return {
      ...node,
      type: NodeType.SEND,
      namelist: parseStringList(properties.namelist),
      autoforward: parseBool(properties.autoforward),
      t: parseExecutableProp(properties, 'type', 'typeexpr'),
      src: parseExecutableProp(properties, 'src', 'srcexpr'),
      id: parseExecutableProp(properties, 'id', 'idlocation'),
      data: {
        ...data,
        properties: {
          namelist: propLoc('namelist'),
          autoforward: propLoc('autoforward'),
          t: propLoc('type', 'typeexpr'),
          src: propLoc('src', 'srcexpr'),
          id: propLoc('id', 'idlocation'),
        },
      },
    } as Invoke<Executable>;
  },

  finalize<Executable>(
    node: TransformNode,
  ) {
    return {
      ...node,
      type: NodeType.FINALIZE,
    } as Finalize<Executable>;
  },
};

export default () => <Executable>(ast: HastNode) => transform(ast, {
  types: 'element',

  exit(node: HastNode) {
    const { tagName, ...rest } = node;
    const fn = (tags as Record<string, Transform<Executable>>)[tagName];
    const propLoc = propLocation(node);
    return fn !== undefined ? fn(rest as TransformNode, propLoc) : node;
  },
});

const propLocation =
  (node: HastNode) =>
    function extract(name: string, fallback?: string): Position | undefined {
      const { data = {}, position: nodePosition } = node;
      const { position = {} } = data;
      const {
        opening: openPosition = nodePosition,
        properties: propPositions = {},
      } = position;
      const res = propPositions[name] || openPosition;
      if (res === undefined && fallback !== undefined) return extract(fallback);
      return res;
    };

function parseStringList(string: string | undefined) {
  return typeof string === 'string' ?
    string
      .split(/\s+/)
      .filter(el => el !== '') :
    [];
}

function parseBool(value: string | undefined) {
  return typeof value === 'string' ?
    value
      .trim()
      .toLowerCase() === 'true' :
    false;
}

function parseExecutableProp(props: Record<string, any>, name: string, fallback: string) {
  const value = props[name];
  if (value !== undefined) return { value, type: LiteralType.LITERAL } as Literal;
  return props[fallback];
}
