// declare var $:any;
declare var Choices: any;

import { getAllGenData } from "../fetchDataApi";
import { AllGenRespObj } from "../respObj";
import { calculateSummary } from "./summaryDataCalculator";
import {
    roundToTwo,
    
} from "./helperFunctions";

export interface SummaryPgRow {
    plantName: string;
    vc: number;
    maxOnBarMw: number;
    onBarEneMwh: number;
    maxSchMw: number;
    schEneMwh: number;
    upResMwh: number;
    downResMwh: number;
    maxOptSchMw: number;
    optSchEneMwh: number;
    maxScedMw: number;
    minScedMw: number;
    scedEneMwh: number;
    costIncured: number;
    costSavings: number;
    netSavings: number;
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

    // selecting other revision number input=number field(by default disabled)
    const otherRevNo = (document.getElementById("otherRevNo") as HTMLInputElement).value

    // selecting revno dropdown field
    let revNo = (document.getElementById("revNo") as HTMLSelectElement).value

    //get user inputs
    let startDateValue = (
        document.getElementById("startDate") as HTMLInputElement
    ).value;
    let endDateValue = (document.getElementById("endDate") as HTMLInputElement)
        .value;

    //validation checks, and displaying msg in error div
    if (startDateValue === "" || endDateValue === "") {
        errorDiv.classList.add("mt-4", "mb-4" ,"alert" ,"alert-danger")
        errorDiv.innerHTML = "<b> Please Enter a Valid Start Date/End Date</b>";
        
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
        errorDiv.innerHTML = "";
        errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger")
        startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00";
        endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59";

        //adding spinner class to spinner div
        spinnerDiv.classList.add("loader")

        // getting revision number value
        if (revNo == "-2") {
            revNo = otherRevNo
        }
        //for storing summary page row for each station.
        let summaryPgAllRows: SummaryPgRow[] = new Array();

        // get all generators
        const allGenData: AllGenRespObj[] = await getAllGenData();
        try {
            for (const singleGenObj of allGenData) {
                const genSummary: SummaryPgRow = await calculateSummary(
                    startDateValue,
                    endDateValue,
                    singleGenObj,
                    +revNo
                );
                summaryPgAllRows.push(genSummary);
            }
            // for loop ends means nor error remove spinning class to spinning div
            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader")
        }
        catch (err) {
            errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
            errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>"
            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader")
        }
        
        //now drawing table from summaryPgAllRows
        $(`#summaryTbl`).DataTable().destroy();
        $(`#summaryTbl`).DataTable({
            dom: "Bfrtip",
            lengthMenu: [100, 150, 200],
            data: summaryPgAllRows,
            order: [[15, "desc"]],
            columns: [
                { data: "plantName", title: "Plant Name" },
                { data: "vc", title: "VC (Paise Mwh)" },
                { data: "maxOnBarMw", title: "Max Onbar (MW)" },
                { data: "onBarEneMwh", title: "Onbar Energy (MWH)" },
                { data: "maxSchMw", title: "Max Inj Sche (MW)" },
                { data: "schEneMwh", title: "Inj. Sche Energy (MWH)" },
                { data: "upResMwh", title: "Up Reserve (MWH)" },
                { data: "downResMwh", title: "Down Res (MWH)" },
                { data: "maxOptSchMw", title: "Max Optimal Sche (MW)" },
                { data: "optSchEneMwh", title: "Opt Sche Energy (MWH)" },
                { data: "maxScedMw", title: "Max SCED (MW)" },
                { data: "minScedMw", title: "Min SCED (MW)" },
                { data: "scedEneMwh", title: "SCED Energy (MWH)" },
                { data: "costIncured", title: "Cost Incured (SCED Up) in Lakhs " },
                { data: "costSavings", title: "Cost Saved (SCED Down) in Lakhs" },
                { data: "netSavings", title: "Net Savings in Lakhs" },
            ],

            // for adding sum row in footer
            footerCallback: function (tfoot, data, start, end, display) {
                var api = this.api();
                //add column index in which you want to show
                let shownSumColInd = [3, 5, 6, 7, 9, 12, 13, 14, 15];
                $(api.column(0).footer()).html("Total");
                for (const ind of shownSumColInd) {
                    $(api.column(ind).footer()).html(
                        api
                            .column(ind)
                            .data()
                            .reduce(function (a, b) {
                                return roundToTwo(a + b);
                            }, 0)
                    );
                }
            },
        });
    }
};
