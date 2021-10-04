var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getAllGenData } from "../fetchDataApi";
import { calculateSummary } from "./summaryDataCalculator";
import { roundToTwo, } from "./helperFunctions";
let intervalID = null;
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    document.getElementById("submitBtn").onclick =
        fetchData;
});
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    //to display error msg
    const errorDiv = document.getElementById("errorDiv");
    //to display spinner 
    const spinnerDiv = document.getElementById("spinner");
    //get user inputs
    let startDateValue = document.getElementById("startDate").value;
    let endDateValue = document.getElementById("endDate")
        .value;
    //validation checks, and displaying msg in error div
    if (startDateValue === "" || endDateValue === "") {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger");
        errorDiv.innerHTML = "<b> Please Enter a Valid Start Date/End Date</b>";
    }
    else if (startDateValue > endDateValue) {
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger");
        errorDiv.innerHTML =
            "<b> Ooops !! End Date should be greater or Equal to Start Date </b>";
    }
    else {
        //if reached this ,means no validation error ,emptying error div and making start date and end date in desired format
        errorDiv.innerHTML = "";
        errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger");
        startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00";
        endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59";
        //adding spinner class to spinner div
        spinnerDiv.classList.add("loader");
        //for storing summary page row for each station.
        let summaryPgAllRows = new Array();
        // get all generators
        const allGenData = yield getAllGenData();
        try {
            for (const singleGenObj of allGenData) {
                const genSummary = yield calculateSummary(startDateValue, endDateValue, singleGenObj);
                summaryPgAllRows.push(genSummary);
            }
            // for loop ends means nor error remove spinning class to spinning div
            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader");
        }
        catch (err) {
            errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger");
            errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>";
            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader");
        }
        //now drawing table from summaryPgAllRows
        $(`#summaryTbl`).DataTable().destroy();
        $(`#summaryTbl`).DataTable({
            dom: "Bfrtip",
            lengthMenu: [25, 192, 188],
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
                    $(api.column(ind).footer()).html(api
                        .column(ind)
                        .data()
                        .reduce(function (a, b) {
                        return roundToTwo(a + b);
                    }, 0));
                }
            },
        });
    }
});
