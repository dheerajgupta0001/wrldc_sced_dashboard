var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getSchData } from "../fetchDataApi";
import { calculateMax, calculateSumEneMwh, calculateReserveMwh, calculateTechMin, calculateScedData, roundToTwo, } from "./helperFunctions";
export const calculateSummary = (startDateValue, endDateValue, genObj) => __awaiter(void 0, void 0, void 0, function* () {
    let summaryPgRow = {
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
    const genSchFetcData = yield getSchData(genObj.id, "sch", 0, startDateValue, endDateValue);
    const genSchData = genSchFetcData.genSchedules[genObj.id];
    const genOptSchFetcData = yield getSchData(genObj.id, "opt", 0, startDateValue, endDateValue);
    const genOptSchData = genOptSchFetcData.genSchedules[genObj.id];
    const genOnbarDcFetcData = yield getSchData(genObj.id, "onbar", 0, startDateValue, endDateValue);
    const genOnbarDcData = genOnbarDcFetcData.genSchedules[genObj.id];
    const techMinData = calculateTechMin(genOnbarDcData, genObj.tmPu, genObj.avgPuCap);
    //creating summary page row for single plant using helper function and from static data of genObj
    summaryPgRow["maxOnBarMw"] = roundToTwo(calculateMax(genOnbarDcData));
    summaryPgRow["onBarEneMwh"] = roundToTwo(calculateSumEneMwh(genOnbarDcData));
    summaryPgRow["maxSchMw"] = roundToTwo(calculateMax(genSchData));
    summaryPgRow["schEneMwh"] = roundToTwo(calculateSumEneMwh(genSchData));
    summaryPgRow["upResMwh"] = roundToTwo(calculateReserveMwh(genOnbarDcData, genSchData));
    summaryPgRow["downResMwh"] = roundToTwo(calculateReserveMwh(genSchData, techMinData));
    summaryPgRow["maxOptSchMw"] = roundToTwo(calculateMax(genOptSchData));
    summaryPgRow["optSchEneMwh"] = roundToTwo(calculateSumEneMwh(genOptSchData));
    let scedData = calculateScedData(genOptSchData, genSchData, genObj);
    summaryPgRow["maxScedMw"] = roundToTwo(scedData.maxScedMw);
    summaryPgRow["minScedMw"] = roundToTwo(scedData.minScedMw);
    summaryPgRow["scedEneMwh"] = roundToTwo(scedData.scedEneMwh);
    summaryPgRow["costIncured"] = roundToTwo((scedData.costIncured) / 100000);
    summaryPgRow["costSavings"] = roundToTwo((scedData.costSavings) / 100000);
    summaryPgRow["netSavings"] = roundToTwo((scedData.netSavings) / 100000);
    //console.log(summaryPgRow);
    return summaryPgRow;
});
