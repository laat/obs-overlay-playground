export type MutableState = {
  active: boolean;
  browserFPS: boolean;
};
export type State = {
  clientsConnected: number;
} & MutableState;
