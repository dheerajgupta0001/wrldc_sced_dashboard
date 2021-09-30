import { AllGenRespObj, SchTsRowObj } from "../respObj";

export const calculateScedData = (
  optSchData: SchTsRowObj[],
  schData: SchTsRowObj[]
): SchTsRowObj[] => {
  let scedDataList: SchTsRowObj[] = [];

  // checking if schedule arr and opt schedule arr is similar length and consisting atleast one values
  if (optSchData.length === schData.length && optSchData.length > 0) {
    optSchData.forEach((optschObj, index) => {
      let schObj: SchTsRowObj = schData[index];
      let scedVal: number = optschObj.schVal - schObj.schVal;
      scedDataList.push({ schTime: optschObj.schTime, schVal: scedVal });
    });
  }
  return scedDataList;
};
