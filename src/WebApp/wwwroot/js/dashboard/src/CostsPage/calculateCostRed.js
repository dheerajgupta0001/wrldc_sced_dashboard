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
export const calCostRedForAllGen = (startDateValue, endDateValue) => __awaiter(void 0, void 0, void 0, function* () {
    let allGenIds = [];
    let timestampVal = [];
    let costRedData = [];
    let allgenCostRedData = {};
    const allGenData = yield getAllGenData();
    const allGenSchData = yield getSchData(-1, "sch", 0, startDateValue, endDateValue);
    const allGenOptSchData = yield getSchData(-1, "opt", 0, startDateValue, endDateValue);
    //calculating cost reduction for each generator blockwise
    allGenData.forEach((genObj, index) => {
        //appending all generator IDs  to list.
        allGenIds.push(genObj.id);
        let genSchData = allGenSchData.genSchedules[genObj.id];
        let genOptSchData = allGenOptSchData.genSchedules[genObj.id];
        allgenCostRedData[genObj.id] = [];
        genOptSchData.forEach((genOptSchSingleObj, ind) => {
            let costRed = (genOptSchSingleObj.schVal - genSchData[ind].schVal) *
                2.5 *
                genObj.vcPu;
            allgenCostRedData[genObj.id].push({
                schTime: genOptSchSingleObj.schTime,
                schVal: costRed,
            });
            //appending timestamp values to list
            timestampVal.push(genOptSchSingleObj.schTime);
        });
    });
    // getting unique values
    timestampVal = [...new Set(timestampVal)];
    //now allgenCostRedData contains cost reduction for each generator. now we have to sum blockwise
    timestampVal.forEach((timestamp, index) => {
        let costRedObj;
        let coststore = 0;
        allGenIds.forEach((genId, ind) => {
            let data = allgenCostRedData[genId].filter((val) => val.schTime === timestamp);
            try {
                coststore = coststore + data[0].schVal;
            }
            catch (err) {
                console.log(err);
            }
        });
        costRedObj = { schTime: timestamp, schVal: coststore };
        costRedData.push(costRedObj);
    });
    //console.log(costRedData);
    return costRedData;
});
export const calCostRedForSingleGen = (optSchData, schData, currGenInd) => __awaiter(void 0, void 0, void 0, function* () {
    //to store cost reduction data
    let costRedData = [];
    let varCost;
    //get all generators
    const fetchedGeneratorsData = yield getAllGenData();
    fetchedGeneratorsData.forEach((genObj, index) => {
        if (genObj.id == currGenInd) {
            varCost = genObj.vcPu;
        }
    });
    //check lenght of optimal schedule data and schedule data is equal or not
    if (optSchData.length == schData.length) {
        optSchData.forEach((val, index) => {
            let optCost = (val.schVal - schData[index].schVal) * 2.5 * varCost;
            costRedData.push({ schTime: val.schTime, schVal: optCost });
        });
    }
    return costRedData;
});
