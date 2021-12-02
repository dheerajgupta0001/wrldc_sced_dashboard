import {
  SchTsRowObj,
  AllGenRespObj,
  SchRespObj,
  interMediateAllGenDataStore,
} from "../respObj";
import { getAllGenData, getSchData } from "../fetchDataApi";

export const calCostForAllGen = async (
  startDateValue: string,
  endDateValue: string,
    schType: string,
  revNo:number
): Promise<SchTsRowObj[]> => {
  let allGenIds: number[] = [];
  let timestampVal: string[] = [];
  let costRedData: SchTsRowObj[] = [];
  let allgenCostData: interMediateAllGenDataStore = {};

  const allGenData: AllGenRespObj[] = await getAllGenData();
  const allGenSchData: SchRespObj = await getSchData(
    -1,
      schType,
      revNo,
    startDateValue,
    endDateValue
  );

  //calculating cost reduction for each generator blockwise
  allGenData.forEach((genObj: AllGenRespObj, index) => {
    //appending all generator IDs  to list.
    allGenIds.push(genObj.id);
    let genSchData: SchTsRowObj[] = allGenSchData.genSchedules[genObj.id];
    allgenCostData[genObj.id] = [];

    genSchData.forEach((genSchSingleObj: SchTsRowObj, ind) => {
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
  timestampVal.forEach((timestamp: string, index) => {
    let costObj: SchTsRowObj;
    let coststore = 0;
    allGenIds.forEach((genId: number, ind) => {
      let data: SchTsRowObj[] = allgenCostData[genId].filter(
        (val) => val.schTime === timestamp
      );
      try {
        coststore = coststore + data[0].schVal;
      } catch (err) {
        console.log(err);
      }
    });
    costObj = { schTime: timestamp, schVal: coststore };
    costRedData.push(costObj);
  });
  //console.log(costRedData);
  return costRedData;
};

export const calCostForSingleGen = async (
  schData: SchTsRowObj[],
  currGenInd: number
): Promise<SchTsRowObj[]> => {
  //to store cost reduction data
  let costData: SchTsRowObj[] = [];
  let varCost: number;
  //get all generators
  const fetchedGeneratorsData: AllGenRespObj[] = await getAllGenData();
  fetchedGeneratorsData.forEach((genObj: AllGenRespObj, index) => {
    if (genObj.id == currGenInd) {
      varCost = genObj.vcPu;
    }
  });
  //check lenght of optimal schedule data and schedule data is equal or not
  schData.forEach((val: SchTsRowObj, index) => {
    let cost = val.schVal * 2.5 * varCost;
    costData.push({ schTime: val.schTime, schVal: cost });
  });

  return costData;
};
