export type GameModel = {
  id: number;
  name: string;
  platforms: number[];
  involved_companies: number[];
};

export type PlatformModel = {
  id: number;
  name: string;
};

export type Involved_CompanyModel = {
  id: number;
  developer: boolean;
  publisher: boolean;
  porting: boolean;
  supporting: boolean;
  company: number;
};

export type CompanyModel = {
  id: number;
  name: string;
  developed: number[];
  published: number[];
};
