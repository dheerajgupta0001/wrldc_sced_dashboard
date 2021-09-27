import { SchRespObj, AllGenRespObj } from "./respObj";

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
    genId: string,
    schType: string,
    revNo: number,
    startDate: string,
    endDate: string
): Promise<SchRespObj[] | null> => {
    try {
        const resp = await fetch(
            `../api/schedules/get?genId=${genId}&schType=${schType}&rev=${revNo}&starttime=${startDate}&endtime=${endDate}`,
            {
                method: "get",
            }
        );
        const respJSON: SchRespObj[] = await resp.json();
        return respJSON;
    } catch (e) {
        console.error(e);
        return null;
    }
};
