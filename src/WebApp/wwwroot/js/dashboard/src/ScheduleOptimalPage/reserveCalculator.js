export const calculateReserve = (sch1, sch2) => {
    let reserveData = [];
    sch1.forEach((sch1Obj, index) => {
        const sch2Obj = sch2[index];
        let upresObj = {
            schTime: sch1Obj.schTime,
            schVal: sch1Obj.schVal - sch2Obj.schVal,
        };
        reserveData.push(upresObj);
    });
    return reserveData;
};
//# sourceMappingURL=reserveCalculator.js.map