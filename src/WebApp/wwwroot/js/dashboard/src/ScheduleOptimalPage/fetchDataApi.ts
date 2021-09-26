import { SchRespObj, AllGenRespObj } from "./respObj";

export const getAllGenData = async (): Promise<AllGenRespObj[] | null> => {
    try {
        const resp = await fetch(`/api/allGenerators`, {
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
    revNo: string,
    startDate: string,
    endDate: string
): Promise<SchRespObj[] | null> => {
    try {
        const resp = await fetch(
            `/api/schVsOpt/${genId}/${schType}/${revNo}/${startDate}/${endDate}`,
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
