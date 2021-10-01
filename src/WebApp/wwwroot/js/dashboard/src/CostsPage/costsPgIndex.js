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
import { setPlotTraces } from "../plotUtils";
import { calCostRedForAllGen, calCostRedForSingleGen, } from "./calculateCostRed";
import { calCostForAllGen, calCostForSingleGen } from "./calculateCost";
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
    //to display spinner 
    const spinnerDiv = document.getElementById("spinner");
    // selecting plotswrapper div to generate div dynamically
    let plotsWrapperDiv = document.getElementById("plotsWrapper");
    // clearing earlier div(except for first api call)
    plotsWrapperDiv.innerHTML = "";
    //get user inputs
    let startDateValue = document.getElementById("startDate").value;
    let endDateValue = document.getElementById("endDate")
        .value;
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
        //if reached this ,means no validation error ,emptying error div and making start date and end date in desired format
        errorDiv.innerHTML = "";
        startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00";
        endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59";
        //adding spinner class to spinner div
        spinnerDiv.classList.add("loader");
        //adding schVsOpt div and upVsDwnReserve div for each selected generators
        selectedGeneratorsList.forEach((value, ind) => {
            // div for  cost reduction sum showing
            let costRedSumDiv = document.createElement("div");
            costRedSumDiv.id = `${value.name}_costRedSum`;
            costRedSumDiv.className = "important";
            plotsWrapperDiv.appendChild(costRedSumDiv);
            // div for plotting cost reduction
            let costRedDiv = document.createElement("div");
            costRedDiv.id = `${value.name}_costRed`;
            plotsWrapperDiv.appendChild(costRedDiv);
            // div for plotting horizontal rule
            let hrDiv1 = document.createElement("div");
            hrDiv1.className = "hrStyle";
            plotsWrapperDiv.appendChild(hrDiv1);
            // div for plotting schedule vs optimal cost
            let schVsOptCostDiv = document.createElement("div");
            schVsOptCostDiv.id = `${value.name}_schVsOptCost`;
            plotsWrapperDiv.appendChild(schVsOptCostDiv);
            // div for plotting horizontal rule
            let hrDiv2 = document.createElement("div");
            hrDiv2.className = "hrStyle";
            plotsWrapperDiv.appendChild(hrDiv2);
        });
        try {
            for (let genInd = 0; genInd < selectedGeneratorsList.length; genInd++) {
                let schData = [];
                let optSchData = [];
                let costRedData = [];
                let normalCost = [];
                let optCost = [];
                let schfetchedData = yield getSchData(selectedGeneratorsList[genInd].id, "sch", 0, startDateValue, endDateValue);
                schData = schfetchedData.genSchedules[selectedGeneratorsList[genInd].id];
                let optFetchedData = yield getSchData(selectedGeneratorsList[genInd].id, "opt", 0, startDateValue, endDateValue);
                optSchData =
                    optFetchedData.genSchedules[selectedGeneratorsList[genInd].id];
                if (selectedGeneratorsList[genInd].id == 0) {
                    costRedData = yield calCostRedForAllGen(startDateValue, endDateValue);
                }
                else {
                    costRedData = yield calCostRedForSingleGen(optSchData, schData, selectedGeneratorsList[genInd].id);
                }
                let costReduPlotData = {
                    title: `${selectedGeneratorsList[genInd].name} Cost Reduction `,
                    traces: [],
                    yAxisTitle: "Values(in Rs)",
                };
                let schDataTrace = {
                    name: "Cost Reduction",
                    data: costRedData,
                    type: "scatter",
                    hoverYaxisDisplay: "Rs",
                    line: {
                        width: 4,
                    },
                    fill: "tozeroy",
                };
                costReduPlotData.traces.push(schDataTrace);
                let totalCostRed = 0;
                costRedData.forEach((val, ind) => {
                    totalCostRed = totalCostRed + val.schVal;
                });
                //showing total cost reduction
                let totalCostredDIv = document.getElementById(`${selectedGeneratorsList[genInd].name}_costRedSum`);
                totalCostredDIv.innerHTML = `Total Cost Reduction for ${selectedGeneratorsList[genInd].name} is ${Math.round(totalCostRed)} Rs `;
                //setting plot traces
                setPlotTraces(`${selectedGeneratorsList[genInd].name}_costRed`, costReduPlotData);
                //now plotting for  schedule cost and optimal cost
                if (selectedGeneratorsList[genInd].id == 0) {
                    normalCost = yield calCostForAllGen(startDateValue, endDateValue, "sch");
                    optCost = yield calCostForAllGen(startDateValue, endDateValue, "opt");
                }
                else {
                    normalCost = yield calCostForSingleGen(schData, selectedGeneratorsList[genInd].id);
                    optCost = yield calCostForSingleGen(optSchData, selectedGeneratorsList[genInd].id);
                }
                let costPlotData = {
                    title: `${selectedGeneratorsList[genInd].name} Schedule Vs Optimal Cost  `,
                    traces: [],
                    yAxisTitle: "Values(in Rs)",
                };
                let normalCostTrace = {
                    name: "Normal Cost",
                    data: normalCost,
                    type: "scatter",
                    hoverYaxisDisplay: "Rs",
                    line: {
                        width: 4,
                    },
                    fill: "tozeroy",
                };
                costPlotData.traces.push(normalCostTrace);
                let optCostTrace = {
                    name: "Optimal Cost",
                    type: "scatter",
                    data: optCost,
                    hoverYaxisDisplay: "Rs",
                    line: {
                        width: 4,
                    },
                    fill: "tozeroy",
                };
                costPlotData.traces.push(optCostTrace);
                //setting plot traces
                setPlotTraces(`${selectedGeneratorsList[genInd].name}_schVsOptCost`, costPlotData);
            }
            //for loop ends means nor error remove spinning class to spinning div
            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader");
        }
        catch (err) {
            errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>";
            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader");
        }
    }
});
