// import { appConfig } from "./config";
import $ from 'jquery';
import { getMonitorPgData } from "./fetchDataApi";
import { MonitorPgRespObjList, MonitorPgRespObj } from "./respObj";

let intervalID = null;
window.onload = async () => {
    (document.getElementById("submitBtn") as HTMLButtonElement).onclick =
        fetchData;
};

const fetchData = async () => {
    const dateValue = (document.getElementById("date") as HTMLInputElement).value;
    const blockNo = (document.getElementById("blockNo") as HTMLInputElement)
        .value;
    const errorDiv = document.getElementById("errorDiv") as HTMLDivElement;
    if (dateValue === "" || blockNo === "") {
        errorDiv.innerHTML = "<b> Please Enter a Valid Date/Block No. Value</b>";
    } else if (Number(blockNo) <= 0 || Number(blockNo) > 96) {
        errorDiv.innerHTML = "<b> Please Enter a Block No. Between 1 to 96</b>";
    } else {
        //emptying error div
        errorDiv.innerHTML = "";
        let fetchedData: MonitorPgRespObj[] = await getMonitorPgData(
            dateValue,
            Number(blockNo)
        );
        console.log(fetchedData);
        $(`#monitorTbl`).DataTable().destroy();
        $(`#monitorTbl`).DataTable({
            dom: "",
            data: fetchedData,
            columns: [
                { data: "genName", title: "Generator Name" },
                { data: "vc", title: "Variable Cost" },
                { data: "fuelType", title: "Fuel" },
                { data: "instCap", title: "Ins Cap" },
                { data: "techMin", title: "TM" },
                { data: "rampUp", title: "Ramp Up" },
                { data: "rampDown", title: "Ramp Down" },
                { data: "dcOnBar", title: "DC onBar" },
                { data: "sch", title: "Schedule" },
                { data: "optSch", title: "Optimal Sch" },
                { data: "sced", title: "SCED" },
            ],
        });
    }
};
