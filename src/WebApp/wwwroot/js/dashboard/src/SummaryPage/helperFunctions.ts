import { AllGenRespObj, SchTsRowObj } from "../respObj";

export interface ScedData {
    maxScedMw: number;
    minScedMw: number;
    scedEneMwh: number;
    costIncured: number;
    costSavings: number;
    netSavings: number;
}

export const calculateMax = (dataList: SchTsRowObj[]): number => {
    //check if datalist is not empty. if empty retrun max =0 else return curMax
    if (dataList.length > 0) {
        let curMax = dataList[0].schVal;
        dataList.forEach((val, index) => {
            if (val.schVal > curMax) {
                curMax = val.schVal;
            }
        });
        return curMax;
    } else {
        return 0;
    }
};

export const calculateSumEneMwh = (dataList: SchTsRowObj[]): number => {
    //check if datalist is not empty. if empty retrun sum energy mwh else return curMax
    if (dataList.length > 0) {
        let accumulator = 0;
        dataList.forEach((val, index) => {
            accumulator = accumulator + val.schVal;
        });
        return accumulator / 4;
    } else {
        return 0;
    }
};

export const calculateReserveMwh = (
    sch1: SchTsRowObj[],
    sch2: SchTsRowObj[]
): number => {
    //check both aschedule length is equal or not, else return 0
    if (sch1.length === sch2.length && sch1.length > 0) {
        let accumulator = 0;
        sch1.forEach((sch1Obj: SchTsRowObj, index) => {
            const sch2Obj: SchTsRowObj = sch2[index];
            accumulator = accumulator + (sch1Obj.schVal - sch2Obj.schVal);
        });
        return accumulator/4;
    }
    return 0;
};

export const calculateTechMin = (
    onBarDcData: SchTsRowObj[],
    tmPu: number,
    avgPuCap: number
): SchTsRowObj[] => {
    let tmData: SchTsRowObj[] = [];

    // creating tmData list by using derived tmPu and avgPuCap
    if (onBarDcData.length > 0) {
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

export const calculateScedData = (
    optSchData: SchTsRowObj[],
    schData: SchTsRowObj[],
    genObj: AllGenRespObj
): ScedData => {
    let obtScedList: number[] = [];
    //to store all sced parameters
    let scedData: ScedData = {
        maxScedMw: 0,
        scedEneMwh: 0,
        minScedMw: 0,
        costIncured: 0,
        costSavings: 0,
        netSavings: 0,
    };
    //to hold current sch obj
    let schObj: SchTsRowObj;
    //to hold curr sced value
    let scedVal: number;
    //to store max of positive sced
    let maxScedMw: number = 0;
    //to store minimum of negative sced
    let minScedMw: number = 0;
    //to store sced eneregy Mwh
    let scedEneMwh: number = 0;
    //store cost incured, cost saved and netsavings
    let costIncured: number = 0;
    let costSaved: number = 0;
    let netSavings: number = 0;

    // checking if schedule arr and opt schedule arr is similar length and consisting atleast one values
    if (optSchData.length === schData.length && optSchData.length > 0) {
        optSchData.forEach((optschObj, index) => {
            schObj = schData[index];
            scedVal = optschObj.schVal - schObj.schVal;
            obtScedList.push(scedVal);
        });
        //getting max and min from obtScedList
        maxScedMw = Math.max(...obtScedList);
        minScedMw = Math.min(...obtScedList);

        //handling case if maximum is negativa, and minimum is positive
        //if (maxScedMw < 0) {
        //    maxScedMw = 0;
        //}
        //if (minScedMw > 0) {
        //    minScedMw = 0;
        //}

        obtScedList.forEach((val, ind) => {
            if (val >= 0) {
                costIncured = costIncured + val * genObj.vcPu * 2.5;
            } else {
                costSaved = costSaved + val * genObj.vcPu * 2.5;
            }
            scedEneMwh = scedEneMwh + val;
        });
        costSaved = costSaved * -1;
        costIncured = costIncured * -1;
        netSavings = costSaved + costIncured;
    }
    scedData.maxScedMw = maxScedMw;
    scedData.minScedMw = minScedMw;
    scedData.scedEneMwh = scedEneMwh / 4;
    scedData.costIncured = costIncured;
    scedData.costSavings = costSaved;
    scedData.netSavings = netSavings;

    return scedData;
};

export function roundToTwo(num: number) {
    return Math.round(num * 10) / 10
}