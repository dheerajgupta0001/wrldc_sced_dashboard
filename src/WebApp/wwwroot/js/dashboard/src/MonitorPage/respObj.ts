//interfaces for api response object

export interface MonitorPgRespObj {
    genName: string;
    vc: number;
    fuelType: string;
    instCap: number;
    techMin: number;
    rampUp: number;
    rampDown: number;
    dcOnBar: number;
    sch: number;
    optSch: number;
    sced: number;
}

export interface MonitorPgRespObjList {
    monitorPgRespList: MonitorPgRespObj[];
}
