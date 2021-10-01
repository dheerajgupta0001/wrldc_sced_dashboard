var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAllGenData, getSchData } from "../fetchDataApi";
export const calTmAllGenApi = (startDateValue, endDateValue) => __awaiter(void 0, void 0, void 0, function* () {
    let allGenIds = [];
    let timestampVal = [];
    let tmData = [];
    let allgenTmData = {};
    const allGenData = yield getAllGenData();
    const allGenOnBarData = yield getSchData(-1, "onbar", 0, startDateValue, endDateValue);
    //calculating tech min for each generator blockwise
    allGenData.forEach((genObj, index) => {
        //appending all generator IDs  to list.
        allGenIds.push(genObj.id);
        let genOnBarData = allGenOnBarData.genSchedules[genObj.id];
        allgenTmData[genObj.id] = [];
        genOnBarData.forEach((genOnBarSingleData, ind) => {
            let tm = Math.ceil((genOnBarSingleData.schVal * 0.95) / genObj.avgPuCap) *
                genObj.tmPu;
            //adding tm and time to allgenTmData where key is current gen ID
            allgenTmData[genObj.id].push({
                schTime: genOnBarSingleData.schTime,
                schVal: tm,
            });
            //appending timestamp values to list
            timestampVal.push(genOnBarSingleData.schTime);
        });
    });
    // getting unique values
    timestampVal = [...new Set(timestampVal)];
    //now allGenSchData contains tmdata for each generator. now we have to sum blockwise
    timestampVal.forEach((timestamp, index) => {
        let tmObj;
        let tmstore = 0;
        //accumulating tech min for a single timestamp.
        allGenIds.forEach((genId, ind) => {
            let data = allgenTmData[genId].filter((val) => val.schTime == timestamp);
            try {
                tmstore = tmstore + data[0].schVal;
            }
            catch (err) {
                console.log(err);
            }
        });
        tmObj = { schTime: timestamp, schVal: tmstore };
        tmData.push(tmObj);
    });
    //console.log(allgenTmData)
    return tmData;
});
export const calTmSingleGenApi = (onBarDcData, genId) => __awaiter(void 0, void 0, void 0, function* () {
    let tmPu;
    let avgPuCap;
    let tmData = [];
    //get all generators
    const fetchedGeneratorsData = yield getAllGenData();
    //calculating tmdata in case of individual generator call
    fetchedGeneratorsData.forEach((genObj, index) => {
        if (genObj.id == genId) {
            tmPu = genObj.tmPu;
            avgPuCap = genObj.avgPuCap;
        }
    });
    // creating tmData list by using derived tmPu and avgPuCap
    if (tmPu != 0 && avgPuCap != 0) {
    }
    onBarDcData.forEach((value, index) => {
        try {
            let noUnits = Math.ceil((value.schVal * 0.95) / avgPuCap);
            let tmPerBlock = noUnits * tmPu;
            tmData.push({ schTime: value.schTime, schVal: tmPerBlock });
        }
        catch (err) {
            console.log(err);
        }
    });
    return tmData;
});
