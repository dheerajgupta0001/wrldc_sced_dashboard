var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAllGenData, getSchData } from "../fetchDataApi";
import { setPlotTraces } from "./scedStackedBarPlotUtils";
import { calculateScedData } from "./scedCalculator";
let intervalID = null;
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    //dynamically populating generator dropdown using api
    let dropdown = document.getElementById("generators");
    const fetchedGeneratorsData = yield getAllGenData();
    for (let i = 0; i < fetchedGeneratorsData.length; i++) {
        let option = document.createElement("option");
        option.text = fetchedGeneratorsData[i].name;
        option.value = `${fetchedGeneratorsData[i].id}`;
        dropdown.add(option);
    }
    // drop down in case of  all Generators
    let option = document.createElement("option");
    option.text = "ALL-GEN";
    option.value = "0";
    dropdown.add(option);
    //providing multiple selection options
    var multipleCancelButton = new Choices("#generators", {
        removeItemButton: true,
        maxItemCount: 50,
        searchResultLimit: 50,
        renderChoiceLimit: 50,
    });
    document.getElementById("submitBtn").onclick =
        fetchData;
});
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    //to display error msg
    const errorDiv = document.getElementById("errorDiv");
    //get user inputs
    let startDateValue = document.getElementById("startDate").value;
    let endDateValue = document.getElementById("endDate")
        .value;
    const generatorsOptions = document.getElementById("generators").options;
    // storing user selected generators from dropdown in List
    let selectedGeneratorsList = [];
    for (let option of generatorsOptions) {
        if (option.selected) {
            if (+option.value == 0) {
                selectedGeneratorsList = yield getAllGenData();
                break;
            }
            let selecetedGenObj = {
                name: option.text,
                id: +option.value,
            };
            selectedGeneratorsList.push(selecetedGenObj);
        }
    }
    //validation checks, and displaying msg in error div
    if (startDateValue === "" || endDateValue === "") {
        errorDiv.innerHTML = "<b> Please Enter a Valid Start Date/End Date</b>";
    }
    else if (selectedGeneratorsList.length == 0) {
        errorDiv.innerHTML = "<b> Please Select Generators From Dropdown</b>";
    }
    else if (startDateValue > endDateValue) {
        errorDiv.innerHTML =
            "<b> Ooops !! End Date should be greater or Equal to Start Date </b>";
    }
    else {
        //if reached this ,means no validation error ,emptying error div and making start date and end date in desired format
        errorDiv.innerHTML = "";
        startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00";
        endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59";
        let sumSced = [];
        let scedPlotData = {
            title: `SCED Comparison From ${startDateValue.substring(0, 10)} to ${endDateValue.substring(0, 10)} `,
            traces: [],
        };
        for (let genInd = 0; genInd < selectedGeneratorsList.length; genInd++) {
            let schData = [];
            let optSchData = [];
            let schfetchedData = yield getSchData(selectedGeneratorsList[genInd].id, "sch", 0, startDateValue, endDateValue);
            schData = schfetchedData.genSchedules[selectedGeneratorsList[genInd].id];
            let optFetchedData = yield getSchData(selectedGeneratorsList[genInd].id, "opt", 0, startDateValue, endDateValue);
            optSchData =
                optFetchedData.genSchedules[selectedGeneratorsList[genInd].id];
            // for first time loop , initialize sumSced(which store arithmetic sced sum) array
            if (genInd == 0) {
                optSchData.forEach((optScheSingleObj, ind) => {
                    sumSced.push({ schTime: optScheSingleObj.schTime, schVal: 0 });
                });
            }
            // calculate sced data for current generator
            let scedDataList = calculateScedData(optSchData, schData);
            // adding sced data to sumsced(which store arithmetic sced sum)
            scedDataList.forEach((scedSingleOnj, ind) => {
                sumSced[ind].schVal = sumSced[ind].schVal + scedSingleOnj.schVal;
            });
            // adding current generator bar plot trace
            let scedTrace = {
                name: `${selectedGeneratorsList[genInd].name}`,
                data: scedDataList,
                type: "bar",
            };
            scedPlotData.traces.push(scedTrace);
        }
        // adding current generator bar plot trace
        let scedSumTrace = {
            name: `Sum-SCED`,
            data: sumSced,
            type: "lines",
            line: {
                width: 4,
                color: "#979797",
            },
            //mode: "lines+markers",
        };
        scedPlotData.traces.push(scedSumTrace);
        setPlotTraces("stackedBarPlots", scedPlotData);
    }
});
//# sourceMappingURL=scedStackedBarPgIndex.js.map