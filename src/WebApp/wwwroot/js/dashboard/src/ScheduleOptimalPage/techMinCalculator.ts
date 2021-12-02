import {
  SchTsRowObj,
  AllGenRespObj,
  SchRespObj,
  interMediateAllGenDataStore,
} from "../respObj";
import { getAllGenData, getSchData } from "../fetchDataApi";

export const calTmAllGenApi = async (
  startDateValue: string,
    endDateValue: string,
  revNo:number
): Promise<SchTsRowObj[]> => {
  let allGenIds: number[] = [];
  let timestampVal: string[] = [];
  let tmData: SchTsRowObj[] = [];
  let allgenTmData: interMediateAllGenDataStore = {};

  const allGenData: AllGenRespObj[] = await getAllGenData();
  const allGenOnBarData: SchRespObj = await getSchData(
    -1,
      "onbar",
      revNo,
    startDateValue,
    endDateValue
  );

  //calculating tech min for each generator blockwise
  allGenData.forEach((genObj: AllGenRespObj, index) => {
    //appending all generator IDs  to list.
    allGenIds.push(genObj.id);
    let genOnBarData: SchTsRowObj[] = allGenOnBarData.genSchedules[genObj.id];
    allgenTmData[genObj.id] = [];

    genOnBarData.forEach((genOnBarSingleData: SchTsRowObj, ind) => {
      let tm =
        Math.ceil((genOnBarSingleData.schVal * 0.95) / genObj.avgPuCap) *
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

  //now allGenTmData contains tmdata for each generator. now we have to sum blockwise
  timestampVal.forEach((timestamp: string, index) => {
    let tmObj: SchTsRowObj;
    let tmstore = 0;
    //accumulating tech min for a single timestamp.
    allGenIds.forEach((genId: number, ind) => {
      let data: SchTsRowObj[] = allgenTmData[genId].filter(
        (val) => val.schTime == timestamp
      );
      try {
        tmstore = tmstore + data[0].schVal;
      } catch (err) {
        console.log(err);
      }
    });
    tmObj = { schTime: timestamp, schVal: tmstore };
    tmData.push(tmObj);
  });
  //console.log(allgenTmData)
  return tmData;
};

export const calTmSingleGenApi = async (
  onBarDcData: SchTsRowObj[],
  genId: number
): Promise<SchTsRowObj[]> => {
  let tmPu: number;
  let avgPuCap: number;
  let tmData: SchTsRowObj[] = [];

  //get all generators
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
        onBarDcData.forEach((value: SchTsRowObj, index) => {
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
};
