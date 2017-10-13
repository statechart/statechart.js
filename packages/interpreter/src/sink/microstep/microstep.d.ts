declare module '@statechart/interpreter-microstep' {
  export function init(backend: any, doc: any): any;
  export function handleEvent(backend: any, doc: any, state: any, event: any): any;
  export function synchronize(backend: any, doc: any, state: any): any;
}
