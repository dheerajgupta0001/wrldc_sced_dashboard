import { SchRespObj, AllGenRespObj, SchTsRowObj } from "./respObj";

export const getAllGenData = async (): Promise<AllGenRespObj[] | null> => {
    try {
        const resp = await fetch(`../api/generators/get`, {
            method: "get",
        });
        const respJSON: AllGenRespObj[] = await resp.json();
        return respJSON;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const getSchData = async (
    genId: number,
    schType: string,
    revNo: number,
    startDate: string,
    endDate: string
): Promise<SchRespObj | null> => {
    try {
        const resp = await fetch(
            `../api/schedules/get?genId=${genId}&schType=${schType}&rev=${revNo}&starttime=${startDate}&endtime=${endDate}`,
            {
                method: "get",
            }
        );
        const respJSON: SchRespObj = await resp.json();
        return respJSON;
    } catch (e) {
        console.error(e);
        return null;
    }
};

// https://localhost:44387/api/smp/get?starttime=2020_10_01_00_00_00&endtime=2020_10_02_00_00_00
export const getSmpData = async (
    regionTag: string,
    revNo: number,
    startDate: string,
    endDate: string
): Promise<SchTsRowObj[] | null> => {
    try {
        const resp = await fetch(
            `../api/smp/get?starttime=${startDate}&endtime=${endDate}&regionTag=${regionTag}&rev=${revNo}`,
            {
                method: "get",
            }
        );
        const respJSON: SchTsRowObj[] = await resp.json();
        return respJSON;
    } catch (e) {
        console.error(e);
        return null;
    }
};
