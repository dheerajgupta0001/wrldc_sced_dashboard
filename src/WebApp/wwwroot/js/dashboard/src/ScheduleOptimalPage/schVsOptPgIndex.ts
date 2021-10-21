// declare var $:any;
declare var Choices: any;
import { getAllGenData, getSchData } from "../fetchDataApi";
import { AllGenRespObj, SchRespObj, SchTsRowObj } from "../respObj";
import { PlotData, PlotTrace, setPlotTraces } from "../plotUtils";
import { calculateReserve } from "./reserveCalculator";
import { calTmAllGenApi, calTmSingleGenApi } from "./techMinCalculator";

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
  
  const generatorsOptions = (
    document.getElementById("generators") as HTMLSelectElement
  ).options;

  // storing user selected generators from dropdown in List
  let selectedGeneratorsList: SelectedGenObj[] = [];
  for (let option of generatorsOptions) {
    if (option.selected) {
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
    //if reached this ,means no validation error ,emptying error div and making start date and end date in desired format
      errorDiv.classList.remove("mt-4", "mb-4", "alert", "alert-danger")
      errorDiv.innerHTML = "";
      startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00";
      endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59";

    //adding spinner class to spinner div
    spinnerDiv.classList.add("loader")

    //adding schVsOpt div and upVsDwnReserve div for each selected generators
    selectedGeneratorsList.forEach((value: SelectedGenObj, ind) => {

      // div for plotting schedule vs optimal schedule
      let schVsOptDiv = document.createElement("div");
      schVsOptDiv.id = `${value.name}_schVsOpt`;
      plotsWrapperDiv.appendChild(schVsOptDiv);

      // div for plotting horizontal rule
      let hrDiv1 = document.createElement("div");
      hrDiv1.className = "hrStyle";
      plotsWrapperDiv.appendChild(hrDiv1);

      // div for plotting Up vs Down Reserve
      let upVsDwnResDiv = document.createElement("div");
      upVsDwnResDiv.id = `${value.name}_upVsdwnRes`;
      plotsWrapperDiv.appendChild(upVsDwnResDiv);

      // div for plotting horizontal rule
      let hrDiv2 = document.createElement("div");
      hrDiv2.className = "hrStyle";
      plotsWrapperDiv.appendChild(hrDiv2);
    });
      try {
          for (let genInd = 0; genInd < selectedGeneratorsList.length; genInd++) {
              let tmData: SchTsRowObj[] = [];
              let onBarDcData: SchTsRowObj[] = [];
              let schData: SchTsRowObj[] = [];
              let optSchData: SchTsRowObj[] = [];

              let schfetchedData: SchRespObj = await getSchData(
                  selectedGeneratorsList[genInd].id,
                  "sch",
                  0,
                  startDateValue,
                  endDateValue
              );
              schData = schfetchedData.genSchedules[selectedGeneratorsList[genInd].id];

              let optFetchedData: SchRespObj = await getSchData(
                  selectedGeneratorsList[genInd].id,
                  "opt",
                  0,
                  startDateValue,
                  endDateValue
              );
              optSchData =
                  optFetchedData.genSchedules[selectedGeneratorsList[genInd].id];

              let onBarDcfetchedData: SchRespObj = await getSchData(
                  selectedGeneratorsList[genInd].id,
                  "onbar",
                  0,
                  startDateValue,
                  endDateValue
              );
              onBarDcData =
                  onBarDcfetchedData.genSchedules[selectedGeneratorsList[genInd].id];

              //checking request came for all generators or single generator
              if (selectedGeneratorsList[genInd].id == 0) {
                  //calculating tmdata in case of all generator call
                  tmData = await calTmAllGenApi(startDateValue, endDateValue);
              }
              else {
                  //calculating tmdata in case of single generator
                  tmData = await calTmSingleGenApi(
                      onBarDcData,
                      selectedGeneratorsList[genInd].id
                  );
              }

              let schVsOptPlotData: PlotData = {
                  title: `${selectedGeneratorsList[genInd].name} Schedule Vs Optimal `,
                  traces: [],

                  yAxisTitle: "MW"
              };

              let schDataTrace: PlotTrace = {
                  name: "Schedule",
                  data: schData,
                  type: "scatter",
                  hoverYaxisDisplay: "MW",
                  line: {
                      width: 4,
                  },
                  fill: "tozeroy",
              };
              schVsOptPlotData.traces.push(schDataTrace);

              let optSchTrace: PlotTrace = {
                  name: "Optimal-Schedule",
                  data: optSchData,
                  type: "scatter",
                  hoverYaxisDisplay: "MW",
                  line: {
                      width: 4,
                  },
                  fill: "tozeroy",
              };
              schVsOptPlotData.traces.push(optSchTrace);

              let onBarDcTrace: PlotTrace = {
                  name: "Pmax",
                  data: onBarDcData,
                  type: "scatter",
                  hoverYaxisDisplay: "MW",
                  line: {
                      width: 4,
                  },
                  visible: "legendonly",
                  fill: "tozeroy",

              };
              schVsOptPlotData.traces.push(onBarDcTrace);

              let tmTrace: PlotTrace = {
                  name: "Pmin",
                  data: tmData,
                  type: "scatter",
                  hoverYaxisDisplay: "MW",
                  line: {
                      width: 4,
                  },
                  visible: "legendonly",
                  fill: "tozeroy",
              };

              schVsOptPlotData.traces.push(tmTrace);

              setPlotTraces(
                  `${selectedGeneratorsList[genInd].name}_schVsOpt`,
                  schVsOptPlotData
              );

              //now plotting for  up and down reserve
              let upResData = calculateReserve(onBarDcData, schData);
              let downResData = calculateReserve(schData, tmData);

              let upDownResPlotData: PlotData = {
                  title: `${selectedGeneratorsList[genInd].name} Up Vs Down Reserve `,
                  traces: [],
                  yAxisTitle: "MW",

              };
              let upResTrace: PlotTrace = {
                  name: "UpRes",
                  data: upResData,
                  type: "scatter",
                  hoverYaxisDisplay: "MW",
                  line: {
                      width: 4,
                  },

                  fill: "tozeroy",
              };
              upDownResPlotData.traces.push(upResTrace);

              let downResTrace: PlotTrace = {
                  name: "DownRes",
                  data: downResData,
                  type: "scatter",
                  hoverYaxisDisplay: "MW",
                  line: {
                      width: 4,
                  },
                  fill: "tozeroy",
              };

              upDownResPlotData.traces.push(downResTrace);

              setPlotTraces(
                  `${selectedGeneratorsList[genInd].name}_upVsdwnRes`,
                  upDownResPlotData
              );
          }
          //for loop ends means nor error remove spinning class to spinning div
          // removing spinner class to spinner div

          spinnerDiv.classList.remove("loader")
      }
      catch (err) {
          errorDiv.classList.add("mt-4", "mb-4", "alert", "alert-danger")
          errorDiv.innerHTML = "<b>Oops !!! Data Fetch Unsuccessful For Selected Date. Please Try Again</b>"
          // removing spinner class to spinner div
          spinnerDiv.classList.remove("loader")
      }
  }
};
