import { getAllGenData } from "../fetchDataApi";
import { AllGenRespObj } from "../respObj";



let intervalID = null;
window.onload = async () => {
    (document.getElementById("submitBtn") as HTMLButtonElement).onclick =
        fetchData;
};

const fetchData = async () => {
    //to display spinner 
    const spinnerDiv = document.getElementById("spinner") as HTMLDivElement;

    //to display error msg
    const errorDiv = document.getElementById("errorDiv") as HTMLDivElement;

    //to store all generators data
    let allGenData: AllGenRespObj[] = []

    //adding spinner class to spinner div
    spinnerDiv.classList.add("loader")

    try {// get all generators
        allGenData = await getAllGenData();
        errorDiv.innerHTML = "";
        errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger")
        spinnerDiv.classList.remove("loader")
    } catch (err) {
        spinnerDiv.classList.remove("loader")
        errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "<b> Data Fetch Unsuccessfull</b>";
    }
    //now drawing table from allGenData
    $(`#staticTbl`).DataTable().destroy();
    $(`#staticTbl`).DataTable({
        dom: "Bfrtip",
        lengthMenu: [50, 100, 150],
        data: allGenData,
        //fixedHeader: true,
        //order: [[15, "desc"]],
        columns: [
            { data: "name", title: "Plant Name" },
            { data: "vcPu", title: "Variable-Cost(Paisa/MWH)" },
            { data: "fuelType", title: "Fuel-Type" },
            { data: "avgPuCap", title: "Average Per-Unit Capacity" },
            { data: "tmPu", title: "Tech-Min MW(Per-Unit)" },
            { data: "rampUpPu", title: "Ramp-Up MW/Blk(Per-Unit)" },
            { data: "rampDownPu", title: "Ramp-Down MW/Blk(Per-Unit)" },
        ],


    });
};