// import { Sink } from '@most/types';

export type PARENT = '#_parent';
export const PARENT = '#_parent';

export interface Event<Data> {
  name: string;
  origin: string;
  sendid?: string;
  origintype: 'scxml';
  data?: Data;
  target: PARENT | string;
}
