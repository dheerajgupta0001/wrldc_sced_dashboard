// declare var $:any;
declare var Choices: any;
import { getAllGenData, getSchData } from "./fetchDataApi";
import { AllGenRespObj, SchRespObj } from "./respObj";
import { PlotData, PlotTrace, setPlotTraces } from "./plotUtils";

export interface SelectedGenObj {
    name: string;
    id: string;
}

let intervalID = null;
window.onload = async () => {
    //dynamically populating generator dropdown using api
    let dropdown = document.getElementById("generators") as HTMLSelectElement;
    const fetchedGeneratorsData: AllGenRespObj[] = await getAllGenData();
    for (let i = 0; i < fetchedGeneratorsData.length; i++) {
        let option = document.createElement("option");
        option.text = fetchedGeneratorsData[i].name;
        option.value = fetchedGeneratorsData[i].id;
        dropdown.add(option);
    }
    // drop down in case of  all Generators
    let option = document.createElement("option");
    option.text = "ALL";
    option.value = "ALL_GEN";
    dropdown.add(option);

    //providing multiple selection options
    var multipleCancelButton = new Choices("#generators", {
        removeItemButton: true,
        maxItemCount: 50,
        searchResultLimit: 50,
        renderChoiceLimit: 50,
    });

    (document.getElementById("submitBtn") as HTMLButtonElement).onclick =
        fetchData;
};

const fetchData = async () => {
    //to display error msg
    const errorDiv = document.getElementById("errorDiv") as HTMLDivElement;

    // selecting plotswrapper div to generate div dynamically
    let plotsWrapperDiv = <HTMLDivElement>document.getElementById("plotsWrapper");

    // clearing earlier div(except for first api call)
    plotsWrapperDiv.innerHTML = "";

    //get user inputs
    let startDateValue = (
        document.getElementById("startDate") as HTMLInputElement
    ).value;
    let endDateValue = (document.getElementById("endDate") as HTMLInputElement)
        .value;
    startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00"
    endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59"
    const generatorsOptions = (
        document.getElementById("generators") as HTMLSelectElement
    ).options;

    // storing user selected generators from dropdown in List
    let selectedGeneratorsList: SelectedGenObj[] = [];
    for (let option of generatorsOptions) {
        if (option.selected) {
            let selecetedGenObj: SelectedGenObj = {
                name: option.text,
                id: option.value,
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
        selectedGeneratorsList.forEach((value: SelectedGenObj, ind) => {
            // div for plotting schedule vs optimal schedule
            let schVsOptDiv = document.createElement("div");
            schVsOptDiv.id = `${value.name}_schVsOpt`;
            plotsWrapperDiv.appendChild(schVsOptDiv);

            // div for plotting Up vs Down Reserve
            let upVsDwnResDiv = document.createElement("div");
            upVsDwnResDiv.id = `${value.name}_upVsdwnRes`;
            plotsWrapperDiv.appendChild(upVsDwnResDiv);
        });

        for (let genInd = 0; genInd < selectedGeneratorsList.length; genInd++) {
            let schfetchedData: SchRespObj[] = await getSchData(
                selectedGeneratorsList[genInd].id,
                "sch",
                0,
                startDateValue,
                endDateValue
            );

            let optFetchedData: SchRespObj[] = await getSchData(
                selectedGeneratorsList[genInd].id,
                "opt",
                0,
                startDateValue,
                endDateValue
            );

            let onBarDcfetchedData: SchRespObj[] = await getSchData(
                selectedGeneratorsList[genInd].id,
                "onbar",
                0,
                startDateValue,
                endDateValue
            );

            let tmFetchedData: SchRespObj[] = await getSchData(
                selectedGeneratorsList[genInd].id,
                "onbar",
                0,
                startDateValue,
                endDateValue
            );
            // console.log(schfetchedData);
            // console.log(optFetchedData);
            // console.log(onBarDcfetchedData);
            // console.log(tmFetchedData);
            let plotData: PlotData = {
                title: `${selectedGeneratorsList[genInd].name} Schedule Vs Optimal `,
                traces: [],
            };

            let schDataTrace: PlotTrace = {
                name: "Schedule",
                line: {
                    width: 8,
                },
                data: schfetchedData,
                fill: "tozeroy",
            };
            plotData.traces.push(schDataTrace);

            let optSchTrace: PlotTrace = {
                name: "Optimal-Schedule",
                line: {
                    width: 8,
                },
                data: optFetchedData,
                fill: "tozeroy",
            };
            plotData.traces.push(optSchTrace);

            let onBarDcTrace: PlotTrace = {
                name: "Pmax",
                line: {
                    width: 8,
                },
                data: onBarDcfetchedData,
                fill: "tozeroy",
            };
            plotData.traces.push(onBarDcTrace);

            let tmTrace: PlotTrace = {
                name: "Pmin",
                line: {
                    width: 8,
                },
                data: tmFetchedData,
                fill: "tozeroy",
            };
            plotData.traces.push(tmTrace);

            setPlotTraces(
                `${selectedGeneratorsList[genInd].name}_schVsOpt`,
                plotData
            );
        }
    }
};
