import { SchTsRowObj } from "../respObj";
export const calculateReserve = (
  sch1: SchTsRowObj[],
  sch2: SchTsRowObj[]
): SchTsRowObj[] => {
  let reserveData: SchTsRowObj[] = [];
  sch1.forEach((sch1Obj: SchTsRowObj, index) => {
    const sch2Obj: SchTsRowObj = sch2[index];
    let upresObj: SchTsRowObj = {
      schTime: sch1Obj.schTime,
      schVal: sch1Obj.schVal - sch2Obj.schVal,
    };
    reserveData.push(upresObj);
  });
  return reserveData;
};
