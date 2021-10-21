import { getAllGenData, getSchData } from "../fetchDataApi";
import { AllGenRespObj, SchRespObj, SchTsRowObj, interMediateAllGenDataStore } from "../respObj";
import { calculateMetrics} from './metricsCalculator'
declare var Choices: any;

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

    (document.getElementById("submitBtn") as HTMLButtonElement).onclick =
        fetchData;
};

const fetchData = async () => {
    //to display error msg
    const errorDiv = document.getElementById("errorDiv") as HTMLDivElement;

    //to display spinner 
    const spinnerDiv = document.getElementById("spinner") as HTMLDivElement;


    //get user inputs
    let startDateValue = (
        document.getElementById("startDate") as HTMLInputElement
    ).value;
    let endDateValue = (document.getElementById("endDate") as HTMLInputElement)
        .value;

    const generatorsOptions = (
        document.getElementById("generators") as HTMLSelectElement
    ).options;

    const selectedMetricVal = (document.getElementById("metricName") as HTMLSelectElement).value;

    // destroying datatable on every api call
    if ($.fn.dataTable.isDataTable('#metricsDataTbl')) {
        $('#metricsDataTbl').DataTable().destroy();
    }
    $('#metricsDataTbl thead').empty();
    $('#metricsDataTbl tbody').empty();
    
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
    } else {
        let allgenData: interMediateAllGenDataStore = {};
        let desiredTblData :string[][]= []
        //to store no. of rows of tbl
        let genDataLen =0

        //if reached this ,means no validation error ,emptying error div and making start date and end date in desired format
        errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger")
        errorDiv.innerHTML = "";
        startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00";
        endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59";

        //adding spinner class to spinner div
        spinnerDiv.classList.add("loader")

        try {
            //getting data for eachh generator one by one and adding key val pair to allgenData dict, where key is genId and val is List of SchTsRowObj
            for (let genInd = 0; genInd < selectedGeneratorsList.length; genInd++) {
                const genData: SchTsRowObj[] = await calculateMetrics(selectedMetricVal, selectedGeneratorsList[genInd].id, startDateValue, endDateValue)
                allgenData[selectedGeneratorsList[genInd].id] = genData
            }
            //no. of rows of table
            genDataLen = allgenData[selectedGeneratorsList[0].id].length

            for (let i = 0; i < genDataLen; i++) {
                //timestamp of row
                let singleTblROw = [allgenData[selectedGeneratorsList[0].id][i].schTime]
                for (const key of Object.keys(allgenData)) {
                    //now pushing each gen value for same index
                    singleTblROw.push(allgenData[key][i].schVal)   
                }
                desiredTblData.push(singleTblROw)
            }
            //removing spinnner
            spinnerDiv.classList.remove("loader")

            //creating columns for datatable
            let columns = [{title:'Timestamp'}]
            selectedGeneratorsList.forEach((genObj, ind) => {
                columns.push({ title: genObj.name })
            })
            //setting columns and data to datatable
            $(`#metricsDataTbl`).DataTable({ 
                    dom: "Bfrtip",
                    lengthMenu: [96, 192, 188],
                    data: desiredTblData,
                    columns: columns
                });
                 
        }
        catch (err) {
            errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
            errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>"
            console.log(err)
            // removing spinner class to spinner div
            spinnerDiv.classList.remove("loader")
        }
    }
};
