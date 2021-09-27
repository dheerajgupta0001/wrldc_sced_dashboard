var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAllGenData, getSchData } from "./fetchDataApi";
import { setPlotTraces } from "./plotUtils";
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
    option.text = "ALL";
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
    // selecting plotswrapper div to generate div dynamically
    let plotsWrapperDiv = document.getElementById("plotsWrapper");
    // clearing earlier div(except for first api call)
    plotsWrapperDiv.innerHTML = "";
    //get user inputs
    let startDateValue = document.getElementById("startDate").value;
    let endDateValue = document.getElementById("endDate")
        .value;
    startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00";
    endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59";
    const generatorsOptions = document.getElementById("generators").options;
    // storing user selected generators from dropdown in List
    let selectedGeneratorsList = [];
    for (let option of generatorsOptions) {
        if (option.selected) {
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
        //if reached this ,means no validation error ,emptying error div
        errorDiv.innerHTML = "";
        //adding schVsOpt div and upVsDwnReserve div for each selected generators
        selectedGeneratorsList.forEach((value, ind) => {
            // div for plotting schedule vs optimal schedule
            let schVsOptDiv = document.createElement("div");
            schVsOptDiv.id = `${value.name}_schVsOpt`;
            plotsWrapperDiv.appendChild(schVsOptDiv);
            // div for plotting Up vs Down Reserve
            let upVsDwnResDiv = document.createElement("div");
            upVsDwnResDiv.id = `${value.name}_upVsdwnRes`;
            plotsWrapperDiv.appendChild(upVsDwnResDiv);
        });
        console.log(selectedGeneratorsList);
        for (let genInd = 0; genInd < selectedGeneratorsList.length; genInd++) {
            let schfetchedData = yield getSchData(selectedGeneratorsList[genInd].id, "sch", 0, startDateValue, endDateValue);
            let optFetchedData = yield getSchData(selectedGeneratorsList[genInd].id, "opt", 0, startDateValue, endDateValue);
            let onBarDcfetchedData = yield getSchData(selectedGeneratorsList[genInd].id, "onbar", 0, startDateValue, endDateValue);
            let tmFetchedData = yield getSchData(selectedGeneratorsList[genInd].id, "onbar", 0, startDateValue, endDateValue);
            // console.log(schfetchedData);
            // console.log(optFetchedData);
            // console.log(onBarDcfetchedData);
            // console.log(tmFetchedData);
            let plotData = {
                title: `${selectedGeneratorsList[genInd].name} Schedule Vs Optimal `,
                traces: [],
            };
            let schDataTrace = {
                name: "Schedule",
                line: {
                    width: 8,
                },
                data: schfetchedData[selectedGeneratorsList[genInd].id],
                fill: "tozeroy",
            };
            plotData.traces.push(schDataTrace);
            let optSchTrace = {
                name: "Optimal-Schedule",
                line: {
                    width: 8,
                },
                data: optFetchedData[selectedGeneratorsList[genInd].id],
                fill: "tozeroy",
            };
            plotData.traces.push(optSchTrace);
            let onBarDcTrace = {
                name: "Pmax",
                line: {
                    width: 8,
                },
                data: onBarDcfetchedData[selectedGeneratorsList[genInd].id],
                fill: "tozeroy",
            };
            plotData.traces.push(onBarDcTrace);
            let tmTrace = {
                name: "Pmin",
                line: {
                    width: 8,
                },
                data: tmFetchedData[selectedGeneratorsList[genInd].id],
                fill: "tozeroy",
            };
            plotData.traces.push(tmTrace);
            setPlotTraces(`${selectedGeneratorsList[genInd].name}_schVsOpt`, plotData);
        }
    }
});
//# sourceMappingURL=schVsOptPgIndex.js.map