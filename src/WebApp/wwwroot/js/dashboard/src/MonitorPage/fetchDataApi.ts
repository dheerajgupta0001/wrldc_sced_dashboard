import { MonitorPgRespObjList, MonitorPgRespObj } from "./respObj";

export const getMonitorPgData = async (
    dateValue: string,
    blockNo: number
): Promise<MonitorPgRespObj[] | null> => {
    try {
        const resp = await fetch(`/api/monitorPg/${dateValue}/${blockNo}`, {
            method: "get",
        });
        const respJSON: MonitorPgRespObj[] = await resp.json();
        return respJSON;
    } catch (e) {
        console.error(e);
        return null;
    }
};
