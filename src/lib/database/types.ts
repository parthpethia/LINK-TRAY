export type Link = {
  id: number;
  title: string;
  url: string;
  favicon: string | null;
  tags: string[];
  source: string | null;
  createdAt: number;
  updatedAt: number;
};

export type LinkInput = {
  id?: number;
  title: string;
  url: string;
  favicon?: string | null;
  tags?: string[];
  source?: string | null;
};
