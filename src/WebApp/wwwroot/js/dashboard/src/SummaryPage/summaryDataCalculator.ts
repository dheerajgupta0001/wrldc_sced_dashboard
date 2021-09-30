import { SchTsRowObj, AllGenRespObj, SchRespObj } from "../respObj";
import { getSchData } from "../fetchDataApi";
import { SummaryPgRow } from "./summaryPgIndex";
import {
    calculateMax,
    calculateSumEneMwh,
    calculateReserveMwh,
    calculateTechMin,
    calculateScedData,
    roundToTwo,
    ScedData,
} from "./helperFunctions";

export const calculateSummary = async (
    startDateValue: string,
    endDateValue: string,
    genObj: AllGenRespObj
): Promise<SummaryPgRow> => {
    let summaryPgRow: SummaryPgRow = {
        plantName: genObj.name,
        vc: genObj.vcPu,
        maxOnBarMw: 0,
        onBarEneMwh: 0,
        maxSchMw: 0,
        schEneMwh: 0,
        upResMwh: 0,
        downResMwh: 0,
        maxOptSchMw: 0,
        optSchEneMwh: 0,
        maxScedMw: 0,
        scedEneMwh: 0,
        minScedMw: 0,
        costIncured: 0,
        costSavings: 0,
        netSavings: 0,
    };

    const genSchFetcData: SchRespObj = await getSchData(
        genObj.id,
        "sch",
        0,
        startDateValue,
        endDateValue
    );
    const genSchData: SchTsRowObj[] = genSchFetcData.genSchedules[genObj.id];

    const genOptSchFetcData: SchRespObj = await getSchData(
        genObj.id,
        "opt",
        0,
        startDateValue,
        endDateValue
    );
    const genOptSchData: SchTsRowObj[] =
        genOptSchFetcData.genSchedules[genObj.id];

    const genOnbarDcFetcData: SchRespObj = await getSchData(
        genObj.id,
        "onbar",
        0,
        startDateValue,
        endDateValue
    );
    const genOnbarDcData: SchTsRowObj[] =
        genOnbarDcFetcData.genSchedules[genObj.id];

    const techMinData: SchTsRowObj[] = calculateTechMin(
        genOnbarDcData,
        genObj.tmPu,
        genObj.avgPuCap
    );
    //creating summary page row for single plant using helper function and from static data of genObj

    summaryPgRow["maxOnBarMw"] = roundToTwo(calculateMax(genOnbarDcData));
    summaryPgRow["onBarEneMwh"] = roundToTwo(calculateSumEneMwh(genOnbarDcData));
    summaryPgRow["maxSchMw"] = roundToTwo(calculateMax(genSchData));
    summaryPgRow["schEneMwh"] = roundToTwo(calculateSumEneMwh(genSchData));
    summaryPgRow["upResMwh"] = roundToTwo(
        calculateReserveMwh(genOnbarDcData, genSchData)
    );
    summaryPgRow["downResMwh"] = roundToTwo(
        calculateReserveMwh(genSchData, techMinData)
    );
    summaryPgRow["maxOptSchMw"] = roundToTwo(calculateMax(genOptSchData));
    summaryPgRow["optSchEneMwh"] = roundToTwo(calculateSumEneMwh(genOptSchData));

    let scedData: ScedData = calculateScedData(genOptSchData, genSchData, genObj);
    summaryPgRow["maxScedMw"] = roundToTwo(scedData.maxScedMw);
    summaryPgRow["minScedMw"] = roundToTwo(scedData.minScedMw);
    summaryPgRow["scedEneMwh"] = roundToTwo(scedData.scedEneMwh);
    summaryPgRow["costIncured"] = roundToTwo((scedData.costIncured) / 100000);
    summaryPgRow["costSavings"] = roundToTwo((scedData.costSavings) / 100000);
    summaryPgRow["netSavings"] = roundToTwo((scedData.netSavings) / 100000);
    //console.log(summaryPgRow);
    return summaryPgRow;
};
