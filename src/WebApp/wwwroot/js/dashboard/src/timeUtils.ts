export const toDateObj = (timestampStr: string): Date => {
    // convert 2021_09_15_04_15_00 to javascript dateobject
    let year = Number(timestampStr.substring(0, 4));
    let month = Number(timestampStr.substring(5, 7));
    let day = Number(timestampStr.substring(8, 10));
    let hour = Number(timestampStr.substring(11, 13));
    let minute = Number(timestampStr.substring(14, 16));
    let second = Number(timestampStr.substring(17, 19));
    let newTimestamp = new Date(year, month - 1, day, hour, minute, second);
    return newTimestamp;
};

export const convertDateTimeToStr = (inp: Date): string => {
    return `${inp.getFullYear()}_${ensureTwoDigits(inp.getMonth() + 1)}_${ensureTwoDigits(inp.getDate())}_${ensureTwoDigits(inp.getHours())}_${ensureTwoDigits(inp.getMinutes())}_${ensureTwoDigits(inp.getSeconds())}`;
}

export const ensureTwoDigits = (num: number): string => {
    if (num < 10) {
        return "0" + num;
    }
    return "" + num;
}

export const generateTimestamp = (startTime: string, endTime: string): string[] => {
   
    let currTimeObj: Date = toDateObj(startTime)
    const endTimeObj: Date = toDateObj(endTime)
    
    let timestampList = []

    while (currTimeObj.getTime() <= endTimeObj.getTime()) {
        
        const currTimeStr = convertDateTimeToStr(currTimeObj)
        timestampList.push(currTimeStr)
        currTimeObj = new Date(currTimeObj.getTime() + 15 * 60000);
    }
    return timestampList
}