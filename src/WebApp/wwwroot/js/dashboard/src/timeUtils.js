export const toDateObj = (timestampStr) => {
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
