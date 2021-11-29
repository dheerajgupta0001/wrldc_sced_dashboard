// declare var $:any;
declare var Choices: any;
import { getAllGenData, getSchData } from "../fetchDataApi";
import { AllGenRespObj, SchRespObj, SchTsRowObj } from "../respObj";
import { PlotData, PlotTrace, setPlotTraces } from "../plotUtils";
import {
    calCostRedForAllGen,
    calCostRedForSingleGen,
} from "./calculateCostRed";
import { calCostForAllGen, calCostForSingleGen } from "./calculateCost";
import { roundToThree } from "../SummaryPage/helperFunctions"
export interface SelectedGenObj {
    name: string;
    id: number;
}


window.onload = async () => {
    //dynamically populating generator dropdown using api
    let dropdown = document.getElementById("generators") as HTMLSelectElement;
    const fetchedGeneratorsData: AllGenRespObj[] = await getAllGenData();
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
    // selecting other revision number input=number field(by default hidden)
    const otherRevNo = document.getElementById("otherRevNo") as HTMLInputElement

    // selecting other revision number label elemne(by default hidden)
    const otherRevNoLabel = document.getElementById("otherRevNoLbl") as HTMLLabelElement

    // selecting revno dropdown field
    const revNo = document.getElementById("revNo") as HTMLSelectElement

    //enabling/disabling otherRevnumber(type= number) based on selection of value from revNo(0=DA, -1=current, -2=other manual revision)
    revNo.addEventListener('change', function () {
        if (this.value == "-2") {
            otherRevNo.hidden = false
            otherRevNoLabel.hidden = false
        }
        else {
            otherRevNo.hidden = true
            otherRevNoLabel.hidden = true
        }
    });
    (document.getElementById("submitBtn") as HTMLButtonElement).onclick =
        fetchData;
};

const fetchData = async () => {
    //to display error msg
    const errorDiv = document.getElementById("errorDiv") as HTMLDivElement;
    //to display spinner 
    const spinnerDiv = document.getElementById("spinner") as HTMLDivElement;
    // selecting plotswrapper div to generate div dynamically
    let plotsWrapperDiv = <HTMLDivElement>document.getElementById("plotsWrapper");

    // selecting other revision number input=number field(by default disabled)
    const otherRevNo = (document.getElementById("otherRevNo") as HTMLInputElement).value

    // selecting revno dropdown field
    let revNo = (document.getElementById("revNo") as HTMLSelectElement).value

    // clearing earlier div(except for first api call)
    plotsWrapperDiv.innerHTML = "";

    //get user inputs
    let startDateValue = (
        document.getElementById("startDate") as HTMLInputElement
    ).value;
    let endDateValue = (document.getElementById("endDate") as HTMLInputElement)
        .value;

    const generatorsOptions = (
        document.getElementById("generators") as HTMLSelectElement
    ).options;

    // storing user selected generators from dropdown in List
    let selectedGeneratorsList: SelectedGenObj[] = [];
    for (let option of generatorsOptions) {
        if (option.selected) {
            let selecetedGenObj: SelectedGenObj = {
                name: option.text,
                id: +option.value,
            };
            selectedGeneratorsList.push(selecetedGenObj);
        }
    }


    //validation checks, and displaying msg in error div
    if (startDateValue === "" || endDateValue === "") {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "<b> Please Enter a Valid Start Date/End Date</b>";
    } else if (selectedGeneratorsList.length == 0) {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "<b> Please Select Generators From Dropdown</b>";
    } else if (startDateValue > endDateValue) {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML =
            "<b> Ooops !! End Date should be greater or Equal to Start Date </b>";
    } else if (revNo === "-2" && otherRevNo === "") {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML =
            "<b> After selecting other revision no. please type other revision number </b>";
    } else {

        //if reached this ,means no validation error ,emptying error div and making start date and end date in desired format
        errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "";
        startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00";
        endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59";

        //adding spinner class to spinner div
        spinnerDiv.classList.add("loader")
        // getting revision number value
        if (revNo == "-2") {
            revNo = otherRevNo
        }
        console.log(revNo)
        //adding cost reduction div and schedule vs optimal cost div for each selected generators
        selectedGeneratorsList.forEach((value: SelectedGenObj, ind) => {

            // div for  cost reduction sum showing(red blinking)
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
                let schData: SchTsRowObj[] = [];
                let optSchData: SchTsRowObj[] = [];
                let costRedData: SchTsRowObj[] = [];
                let normalCost: SchTsRowObj[] = [];
                let optCost: SchTsRowObj[] = [];

                let schfetchedData: SchRespObj = await getSchData(
                    selectedGeneratorsList[genInd].id,
                    "sch",
                    +revNo,
                    startDateValue,
                    endDateValue
                );
                schData = schfetchedData.genSchedules[selectedGeneratorsList[genInd].id];

                let optFetchedData: SchRespObj = await getSchData(
                    selectedGeneratorsList[genInd].id,
                    "opt",
                    +revNo,
                    startDateValue,
                    endDateValue
                );
                optSchData =
                    optFetchedData.genSchedules[selectedGeneratorsList[genInd].id];

                if (selectedGeneratorsList[genInd].id == 0) {
                    costRedData = await calCostRedForAllGen(startDateValue, endDateValue, +revNo);
                } else {
                    costRedData = await calCostRedForSingleGen(
                        optSchData,
                        schData,
                        selectedGeneratorsList[genInd].id
                    );
                }

                let costReduPlotData: PlotData = {
                    title: `${selectedGeneratorsList[genInd].name} Cost Reduction `,
                    traces: [],
                    yAxisTitle: "Values(in Rs)",

                };

                let schDataTrace: PlotTrace = {
                    name: "Cost Reduction",
                    data: costRedData,
                    type: "scatter",
                    hoverYaxisDisplay: "Rs",
                    line: {
                        width: 4,
                        color: "#34A853"
                    },
                    fill: "tozeroy",
                };
                costReduPlotData.traces.push(schDataTrace);

                let totalCostRed = 0;
                costRedData.forEach((val, ind) => {
                    totalCostRed = totalCostRed + val.schVal;
                });
                //showing total cost reduction
                let totalCostredDIv = document.getElementById(
                    `${selectedGeneratorsList[genInd].name}_costRedSum`
                ) as HTMLDivElement;
                totalCostredDIv.innerHTML = `Total Cost Reduction for ${selectedGeneratorsList[genInd].name
                    } is ${roundToThree(totalCostRed / 100000)} Lakhs `;

                //setting plot traces
                setPlotTraces(
                    `${selectedGeneratorsList[genInd].name}_costRed`,
                    costReduPlotData
                );

                //now plotting for  schedule cost and optimal cost
                if (selectedGeneratorsList[genInd].id == 0) {
                    normalCost = await calCostForAllGen(
                        startDateValue,
                        endDateValue,
                        "sch"
                    );
                    optCost = await calCostForAllGen(startDateValue, endDateValue, "opt");
                }
                else {
                    normalCost = await calCostForSingleGen(
                        schData,
                        selectedGeneratorsList[genInd].id
                    );
                    optCost = await calCostForSingleGen(
                        optSchData,
                        selectedGeneratorsList[genInd].id
                    );
                }

                let costPlotData: PlotData = {
                    title: `${selectedGeneratorsList[genInd].name} Schedule Vs Optimal Cost  `,
                    traces: [],
                    yAxisTitle: "Values(in Rs)",

                };

                let normalCostTrace: PlotTrace = {
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

                let optCostTrace: PlotTrace = {
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
                setPlotTraces(
                    `${selectedGeneratorsList[genInd].name}_schVsOptCost`,
                    costPlotData
                );
            }

            //for loop ends means nor error remove spinning class to spinning div
            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader")

        }
        catch (err) {
            errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
            errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>"
            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader")
        }

    }
};
