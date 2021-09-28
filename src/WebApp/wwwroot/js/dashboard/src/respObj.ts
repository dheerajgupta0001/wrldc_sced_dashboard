//interfaces for api response object

export interface AllGenRespObj {
  name: string;
  id: number;
  vcPu: number;
  fuelType: string;
  avgPuCap: number;
  tmPu: number;
  rampUpPu: number;
  rampDownPu: number;
}

export interface SchRespObj {
  genSchedules: {
    [genId: number]: SchTsRowObj[];
  };
}
export interface interMediateAllGenDataStore {
  [genId: number]: SchTsRowObj[];
}
export interface SchTsRowObj {
  schTime: string;
  schVal: number;
}
