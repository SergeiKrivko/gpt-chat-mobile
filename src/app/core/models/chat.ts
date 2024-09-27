export interface Chat {
  uuid: string;
  created_at: string;
  deleted_at: string;
  name: string;
  model: string;
  context_size: number,
  temperature: number;
  archived: boolean;
  pinned: boolean;
}
