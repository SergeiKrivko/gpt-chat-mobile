export interface ChatUpdate {
  name?: string | undefined;
  model?: string | undefined;
  context_size?: number | undefined;
  temperature?: number | undefined;
  pinned?: boolean | undefined;
  archived?: boolean | undefined;
}
