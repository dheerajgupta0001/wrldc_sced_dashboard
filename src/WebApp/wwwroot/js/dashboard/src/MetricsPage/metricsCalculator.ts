import { getAllGenData, getSchData } from "../fetchDataApi";
import { SchRespObj, AllGenRespObj, SchTsRowObj } from "../respObj";
import { generateTimestamp } from "../timeUtils";

export const calculateMetrics = async (selectedMetricVal: string, genId: number, startTime: string, endTime: string): Promise<SchTsRowObj[] | null> => {

    if (selectedMetricVal === 'sch' || selectedMetricVal === 'opt' || selectedMetricVal === 'onbar') {
        let schData: SchTsRowObj[] = [];
        let schfetchedData: SchRespObj = await getSchData(
           genId,
            selectedMetricVal,
            0,
            startTime,
            endTime
        );
        schData = schfetchedData.genSchedules[genId];
        return schData
    }
    //if block in vase of technical minimum
    else if (selectedMetricVal === 'tm') {
        let onbarData: SchTsRowObj[] = [];
        let tmPu: number;
        let avgPuCap: number;
        let tmData: SchTsRowObj[] = [];

        //getting onbar data
        let onbarfetchedData: SchRespObj = await getSchData(
            genId,
            "onbar",
            0,
            startTime,
            endTime
        );
        onbarData = onbarfetchedData.genSchedules[genId];
        
        //getting all generators
        const fetchedGeneratorsData: AllGenRespObj[] = await getAllGenData();

        //calculating tmdata in case of individual generator call
        fetchedGeneratorsData.forEach((genObj: AllGenRespObj, index) => {
            if (genObj.id == genId) {
                tmPu = genObj.tmPu;
                avgPuCap = genObj.avgPuCap;
            }
        });
        // creating tmData list by using derived tmPu and avgPuCap
        if (avgPuCap != 0) {
            onbarData.forEach((value: SchTsRowObj, index) => {
                try {
                    let noUnits = Math.ceil((value.schVal * 0.95) / avgPuCap);
                    let tmPerBlock = noUnits * tmPu;
                    tmData.push({ schTime: value.schTime, schVal: tmPerBlock });
                } catch (err) {
                    console.log(err);
                }
            });
        }  
        return tmData;
    }
    //else block in case of rup, rdwn, avgpu
    else {
        //to hold single value for tmup, tmdwn, vc
        let metricVal;

        let metricResList: SchTsRowObj[] = []
       
        const fetchedGeneratorsData: AllGenRespObj[] = await getAllGenData();
        fetchedGeneratorsData.forEach((genObj, ind) => {
            if (genObj.id === genId) {
                metricVal = genObj[selectedMetricVal]
            }
        });
        const timestampList = generateTimestamp(startTime, endTime)
        timestampList.forEach((timestamp, ind) => {
            metricResList.push({ schTime: timestamp, schVal: metricVal })
        })
        return metricResList
    }
};

