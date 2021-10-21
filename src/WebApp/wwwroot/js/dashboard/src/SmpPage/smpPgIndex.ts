// declare var $:any;
// TODO complete this
declare var Choices: any;
import { getAllGenData, getSchData, getSmpData } from "../fetchDataApi";
import { AllGenRespObj, SchRespObj, SchTsRowObj } from "../respObj";
import { PlotData, PlotTrace, setPlotTraces } from "../plotUtils";

export interface SelectedGenObj {
    name: string;
    id: number;
}

let intervalID = null;
window.onload = async () => {
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

    // clearing earlier div(except for first api call)
    plotsWrapperDiv.innerHTML = "";

    //get user inputs
    let startDateValue = (
        document.getElementById("startDate") as HTMLInputElement
    ).value;
    let endDateValue = (document.getElementById("endDate") as HTMLInputElement)
        .value;

    //validation checks, and displaying msg in error div
    if (startDateValue === "" || endDateValue === "") {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "<b> Please Enter a Valid Start Date/End Date</b>";
    } else if (startDateValue > endDateValue) {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML =
            "<b> Ooops !! End Date should be greater or Equal to Start Date </b>";
    } else {
        //if reached this ,means no validation error ,emptying error div and making start date and end date in desired format
        errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "";
        startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00";
        endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59";

        //adding spinner class to spinner div
        spinnerDiv.classList.add("loader")

        try {
            let smpData: SchTsRowObj[] = [];
            smpData = await getSmpData(
               "g",
                0,
                startDateValue,
                endDateValue
            );
            let smpPlotData: PlotData = {
                title: `System Marginal Price(SMP)`,
                traces: [],

                yAxisTitle: "SMP"
            };

            let smpDataTrace: PlotTrace = {
                name: "SMP",
                data: smpData,
                type: "scatter",
                hoverYaxisDisplay: "",
                line: {
                    width: 4,
                    color: '#34A853'
                },
                fill: "tozeroy",
            };
            smpPlotData.traces.push(smpDataTrace);

            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader")

            setPlotTraces(
                `plotsWrapper`,
                smpPlotData
            );
            
        }
        catch (err) {
            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader")
            //adding error msg
            errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
            errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>"
           
        }
    }
};
