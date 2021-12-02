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

    //validation checks, and displaying msg in error div
    if (startDateValue === "" || endDateValue === "") {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "<b> Please Enter a Valid Start Date/End Date</b>";
    } else if (startDateValue > endDateValue) {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML =
            "<b> Ooops !! End Date should be greater or Equal to Start Date </b>";
    } else if (revNo === "-2" && otherRevNo === "") {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML =
            "<b> After selecting other revision no. please type other revision number </b>";
    }else {
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

        try {
            let smpData: SchTsRowObj[] = [];
            smpData = await getSmpData(
                "g",
                +revNo,
                startDateValue,
                endDateValue
            );

            smpData.forEach((smpSingleData, ind) => {
                if (smpSingleData.schVal > 800) {
                    smpSingleData.schVal=449
                }
                if (smpSingleData.schVal <= 0) {
                    smpSingleData.schVal = 75
                }
            })
            let smpPlotData: PlotData = {
                title: `System Marginal Price(SMP)`,
                traces: [],

                yAxisTitle: "SMP(Paise/Kwh)"
            };

            let smpDataTrace: PlotTrace = {
                name: "SMP",
                data: smpData,
                type: "scatter",
                hoverYaxisDisplay: "SMP(Paise/Kwh)",
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
