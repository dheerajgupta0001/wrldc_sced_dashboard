//interfaces for api response object

export interface AllGenRespObj {
    name: string;
    id: number;
}

export interface SchRespObj {
    genSchedules: {
        [genId: number]: SchTsRowObj[]
    };
}

export interface SchTsRowObj {
    schTime: string;
    schVal: number;
}
