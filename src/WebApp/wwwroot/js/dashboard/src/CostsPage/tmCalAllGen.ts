import { SchTsRowObj, AllGenRespObj, SchRespObj } from "../respObj";
import { getAllGenData, getSchData } from "../fetchDataApi";

export const calTmAllGenApi = async (
  startDateValue: string,
  endDateValue: string
): Promise<SchTsRowObj[]> => {
  let allGenIds: number[] = [];
  let timestampVal: string[] = [];
  let tmData: SchTsRowObj[] = [];

  const allGenData: AllGenRespObj[] = await getAllGenData();
  const allGenSchData: SchRespObj = await getSchData(
    -1,
    "onbar",
    0,
    startDateValue,
    endDateValue
  );

  //calculating tech min for each generator blockwise
  allGenData.forEach((genObj: AllGenRespObj, index) => {
    //appending all generator IDs  to list.
    allGenIds.push(genObj.id);
    let genSchData: SchTsRowObj[] = allGenSchData.genSchedules[genObj.id];
    genSchData.forEach((genSchSingleData: SchTsRowObj, ind) => {
      genSchSingleData.schVal =
        Math.ceil(genSchSingleData.schVal / genObj.avgPuCap) * genObj.tmPu;
      //appending timestamp values to list
      timestampVal.push(genSchSingleData.schTime);
    });
  });
  // getting unique values
  timestampVal = [...new Set(timestampVal)];

  //now allGenSchData contains tmdata for each generator. now we have to sum blockwise
  timestampVal.forEach((timestamp: string, index) => {
    let tmObj: SchTsRowObj;
    let tmstore = 0;
    allGenIds.forEach((genId: number, ind) => {
      let data: SchTsRowObj[] = allGenSchData.genSchedules[genId].filter(
        (val) => val.schTime === timestamp
      );
      tmstore = tmstore + data[0].schVal;
    });
    tmObj = { schTime: timestamp, schVal: tmstore };
    tmData.push(tmObj);
  });
  console.log(allGenIds);
  console.log(timestampVal);
  return tmData;
};
