export interface SocketResp<T> {
  time: string;
  data: T;
}

export interface HttpResp<T> {
  detail: string;
  data: T;
}
