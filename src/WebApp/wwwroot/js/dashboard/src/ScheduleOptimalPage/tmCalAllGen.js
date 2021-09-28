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
    const allGenData = yield getAllGenData();
    const allGenSchData = yield getSchData(-1, "onbar", 0, startDateValue, endDateValue);
    //calculating tech min for each generator blockwise
    allGenData.forEach((genObj, index) => {
        //appending all generator IDs  to list.
        allGenIds.push(genObj.id);
        let genSchData = allGenSchData.genSchedules[genObj.id];
        genSchData.forEach((genSchSingleData, ind) => {
            genSchSingleData.schVal =
                Math.ceil(genSchSingleData.schVal / genObj.avgPuCap) * genObj.tmPu;
            //appending timestamp values to list
            timestampVal.push(genSchSingleData.schTime);
        });
    });
    // getting unique values
    timestampVal = [...new Set(timestampVal)];
    //now allGenSchData contains tmdata for each generator. now we have to sum blockwise
    timestampVal.forEach((timestamp, index) => {
        let tmObj;
        let tmstore = 0;
        allGenIds.forEach((genId, ind) => {
            let data = allGenSchData.genSchedules[genId].filter((val) => val.schTime === timestamp);
            tmstore = tmstore + data[0].schVal;
        });
        tmObj = { schTime: timestamp, schVal: tmstore };
        tmData.push(tmObj);
    });
    console.log(allGenIds);
    console.log(timestampVal);
    return tmData;
});
//# sourceMappingURL=tmCalAllGen.js.map