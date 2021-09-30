export const calculateScedData = (optSchData, schData) => {
    let scedDataList = [];
    // checking if schedule arr and opt schedule arr is similar length and consisting atleast one values
    if (optSchData.length === schData.length && optSchData.length > 0) {
        optSchData.forEach((optschObj, index) => {
            let schObj = schData[index];
            let scedVal = optschObj.schVal - schObj.schVal;
            scedDataList.push({ schTime: optschObj.schTime, schVal: scedVal });
        });
    }
    return scedDataList;
};
//# sourceMappingURL=scedCalculator.js.map