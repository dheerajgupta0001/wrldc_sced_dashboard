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
export const calCostForAllGen = (startDateValue, endDateValue, schType) => __awaiter(void 0, void 0, void 0, function* () {
    let allGenIds = [];
    let timestampVal = [];
    let costRedData = [];
    let allgenCostData = {};
    const allGenData = yield getAllGenData();
    const allGenSchData = yield getSchData(-1, schType, 0, startDateValue, endDateValue);
    //calculating cost reduction for each generator blockwise
    allGenData.forEach((genObj, index) => {
        //appending all generator IDs  to list.
        allGenIds.push(genObj.id);
        let genSchData = allGenSchData.genSchedules[genObj.id];
        allgenCostData[genObj.id] = [];
        genSchData.forEach((genSchSingleObj, ind) => {
            let cost = genSchSingleObj.schVal * 2.5 * genObj.vcPu;
            allgenCostData[genObj.id].push({
                schTime: genSchSingleObj.schTime,
                schVal: cost,
            });
            //appending timestamp values to list
            timestampVal.push(genSchSingleObj.schTime);
        });
    });
    // getting unique values
    timestampVal = [...new Set(timestampVal)];
    //now allgenCostRedData contains cost reduction for each generator. now we have to sum blockwise
    timestampVal.forEach((timestamp, index) => {
        let costObj;
        let coststore = 0;
        allGenIds.forEach((genId, ind) => {
            let data = allgenCostData[genId].filter((val) => val.schTime === timestamp);
            try {
                coststore = coststore + data[0].schVal;
            }
            catch (err) {
                console.log(err);
            }
        });
        costObj = { schTime: timestamp, schVal: coststore };
        costRedData.push(costObj);
    });
    //console.log(costRedData);
    return costRedData;
});
export const calCostForSingleGen = (schData, currGenInd) => __awaiter(void 0, void 0, void 0, function* () {
    //to store cost reduction data
    let costData = [];
    let varCost;
    //get all generators
    const fetchedGeneratorsData = yield getAllGenData();
    fetchedGeneratorsData.forEach((genObj, index) => {
        if (genObj.id == currGenInd) {
            varCost = genObj.vcPu;
        }
    });
    //check lenght of optimal schedule data and schedule data is equal or not
    schData.forEach((val, index) => {
        let cost = val.schVal * 2.5 * varCost;
        costData.push({ schTime: val.schTime, schVal: cost });
    });
    return costData;
});
