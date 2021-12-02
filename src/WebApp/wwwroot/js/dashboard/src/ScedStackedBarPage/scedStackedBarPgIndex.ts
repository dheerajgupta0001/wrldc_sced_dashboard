// declare var $:any;
declare var Choices: any;
import { getAllGenData, getSchData } from "../fetchDataApi";
import { AllGenRespObj, SchRespObj, SchTsRowObj } from "../respObj";
import { PlotData, PlotTrace, setPlotTraces } from "../plotUtils";
import { calculateScedData } from "./scedCalculator";

export interface SelectedGenObj {
    name: string;
    id: number;
}

let intervalID = null;
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
    //clearing any plots present before new request
    const stackedBarPlotsDiv = document.getElementById("stackedBarPlots") as HTMLDivElement;

    // selecting other revision number input=number field(by default disabled)
    const otherRevNo = (document.getElementById("otherRevNo") as HTMLInputElement).value
    // selecting revno dropdown field
    let revNo = (document.getElementById("revNo") as HTMLSelectElement).value

    stackedBarPlotsDiv.innerHTML = "";

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
            if (+option.value == 0) {
                selectedGeneratorsList = await getAllGenData();
                break;
            }
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
        //if reached this ,means no validation error ,emptying error div, and emptying earlier plots and making start date and end date in desired format
        errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "";

        startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00";
        endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59";

        //adding loader class to spinner div
        spinnerDiv.classList.add("loader")

        // getting revision number value
        if (revNo == "-2") {
            revNo = otherRevNo
        }
        let sumSced: SchTsRowObj[] = [];

        let scedPlotData: PlotData = {
            title: `SCED Comparison From ${startDateValue.substring(
                0,
                10
            )} To ${endDateValue.substring(0, 10)} `,
            traces: [],
            yAxisTitle: "MW",
            barmode: "relative"
        };


        try {
            for (let genInd = 0; genInd < selectedGeneratorsList.length; genInd++) {
                let schData: SchTsRowObj[] = [];
                let optSchData: SchTsRowObj[] = [];

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

                // for first time loop , initialize sumSced(which store arithmetic sced sum) array
                if (genInd == 0) {
                    optSchData.forEach((optScheSingleObj, ind) => {
                        sumSced.push({ schTime: optScheSingleObj.schTime, schVal: 0 });
                    });
                }
                // calculate sced data for current generator
                let scedDataList: SchTsRowObj[] = calculateScedData(optSchData, schData);

                // adding sced data to sumsced(which store arithmetic sced sum)
                scedDataList.forEach((scedSingleOnj, ind) => {
                    sumSced[ind].schVal = sumSced[ind].schVal + scedSingleOnj.schVal;
                });

                // adding current generator bar plot trace
                let scedTrace: PlotTrace = {
                    name: `${selectedGeneratorsList[genInd].name}`,
                    data: scedDataList,
                    type: "bar",
                    hoverYaxisDisplay: "MW",

                };
                scedPlotData.traces.push(scedTrace);
            }
        }
        catch (err) {
            errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
            errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again </b>"
            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader")
        }


        // adding sum sced line trace
        let scedSumTrace: PlotTrace = {
            name: `Sum-SCED`,
            data: sumSced,
            type: "lines",
            line: {
                width: 3,
                color: "#696969",
            },
            hoverYaxisDisplay: "MW"
        };

        scedPlotData.traces.push(scedSumTrace);

        // removing spinner class to spinner div
        spinnerDiv.classList.remove("loader")

        setPlotTraces("stackedBarPlots", scedPlotData);
    }
};
