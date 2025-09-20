export type Turn = {
  speaker: string;
  content: string;
  timestamp?: string;
  round?: number;
  is_conclusion?: boolean;
};

export type Discussion = {
  id: string;
  topic: string;
  transcript: Turn[];
  conclusion?: string;
  created_at: string;
};
