var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// import { appConfig } from "./config";
import $ from 'jquery';
import { getMonitorPgData } from "./fetchDataApi";
let intervalID = null;
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    document.getElementById("submitBtn").onclick =
        fetchData;
});
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    const dateValue = document.getElementById("date").value;
    const blockNo = document.getElementById("blockNo")
        .value;
    const errorDiv = document.getElementById("errorDiv");
    if (dateValue === "" || blockNo === "") {
        errorDiv.innerHTML = "<b> Please Enter a Valid Date/Block No. Value</b>";
    }
    else if (Number(blockNo) <= 0 || Number(blockNo) > 96) {
        errorDiv.innerHTML = "<b> Please Enter a Block No. Between 1 to 96</b>";
    }
    else {
        //emptying error div
        errorDiv.innerHTML = "";
        let fetchedData = yield getMonitorPgData(dateValue, Number(blockNo));
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
});
