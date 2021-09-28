import {
  SchTsRowObj,
  AllGenRespObj,
  SchRespObj,
  interMediateAllGenDataStore,
} from "../respObj";
import { getAllGenData, getSchData } from "../fetchDataApi";

export const calCostRedForAllGen = async (
  startDateValue: string,
  endDateValue: string
): Promise<SchTsRowObj[]> => {
  let allGenIds: number[] = [];
  let timestampVal: string[] = [];
  let costRedData: SchTsRowObj[] = [];
  let allgenCostRedData: interMediateAllGenDataStore = {};

  const allGenData: AllGenRespObj[] = await getAllGenData();
  const allGenSchData: SchRespObj = await getSchData(
    -1,
    "sch",
    0,
    startDateValue,
    endDateValue
  );
  const allGenOptSchData: SchRespObj = await getSchData(
    -1,
    "opt",
    0,
    startDateValue,
    endDateValue
  );

  //calculating cost reduction for each generator blockwise
  allGenData.forEach((genObj: AllGenRespObj, index) => {
    //appending all generator IDs  to list.
    allGenIds.push(genObj.id);
    let genSchData: SchTsRowObj[] = allGenSchData.genSchedules[genObj.id];
    let genOptSchData: SchTsRowObj[] = allGenOptSchData.genSchedules[genObj.id];
    allgenCostRedData[genObj.id] = [];

    genOptSchData.forEach((genOptSchSingleObj: SchTsRowObj, ind) => {
      let costRed =
        (genOptSchSingleObj.schVal - genSchData[ind].schVal) *
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
  timestampVal.forEach((timestamp: string, index) => {
    let costRedObj: SchTsRowObj;
    let coststore = 0;
    allGenIds.forEach((genId: number, ind) => {
      let data: SchTsRowObj[] = allgenCostRedData[genId].filter(
        (val) => val.schTime === timestamp
      );
      try {
        coststore = coststore + data[0].schVal;
      } catch (err) {
        console.log(err);
      }
    });
    costRedObj = { schTime: timestamp, schVal: coststore };
    costRedData.push(costRedObj);
  });
  //console.log(costRedData);
  return costRedData;
};

export const calCostRedForSingleGen = async (
  optSchData: SchTsRowObj[],
  schData: SchTsRowObj[],
  currGenInd: number
): Promise<SchTsRowObj[]> => {
  //to store cost reduction data
  let costRedData: SchTsRowObj[] = [];
  let varCost;
  //get all generators
  const fetchedGeneratorsData: AllGenRespObj[] = await getAllGenData();
  fetchedGeneratorsData.forEach((genObj: AllGenRespObj, index) => {
    if (genObj.id == currGenInd) {
      varCost = genObj.vcPu;
    }
  });
  //check lenght of optimal schedule data and schedule data is equal or not
  if (optSchData.length == schData.length) {
    optSchData.forEach((val: SchTsRowObj, index) => {
      let optCost = (val.schVal - schData[index].schVal) * 2.5 * varCost;
      costRedData.push({ schTime: val.schTime, schVal: optCost });
    });
  }
  return costRedData;
};
