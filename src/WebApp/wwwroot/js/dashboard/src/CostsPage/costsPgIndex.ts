// declare var $:any;
declare var Choices: any;
import { getAllGenData, getSchData } from "../fetchDataApi";
import { AllGenRespObj, SchRespObj, SchTsRowObj } from "../respObj";
import { PlotData, PlotTrace, setPlotTraces } from "./costPlotUtils";
import {
  calCostRedForAllGen,
  calCostRedForSingleGen,
} from "./calculateCostRed";
import { calCostForAllGen, calCostForSingleGen } from "./calculateCost";

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
    errorDiv.innerHTML = "<b> Please Enter a Valid Start Date/End Date</b>";
  } else if (selectedGeneratorsList.length == 0) {
    errorDiv.innerHTML = "<b> Please Select Generators From Dropdown</b>";
  } else if (startDateValue > endDateValue) {
    errorDiv.innerHTML =
      "<b> Ooops !! End Date should be greater or Equal to Start Date </b>";
  } else {
    //if reached this ,means no validation error ,emptying error div and making start date and end date in desired format
      errorDiv.innerHTML = "";
      startDateValue = startDateValue.replace(/-/g, "_") + "_00_00_00";
      endDateValue = endDateValue.replace(/-/g, "_") + "_23_59_59";

    //adding schVsOpt div and upVsDwnReserve div for each selected generators
    selectedGeneratorsList.forEach((value: SelectedGenObj, ind) => {

      // div for  cost reduction sum showing
      let costRedSumDiv = document.createElement("div");
      costRedSumDiv.id = `${value.name}_costRedSum`;
      costRedSumDiv.className = "important";
      plotsWrapperDiv.appendChild(costRedSumDiv);

      // div for plotting cost reduction
      let costRedDiv = document.createElement("div");
      costRedDiv.id = `${value.name}_costRed`;
      plotsWrapperDiv.appendChild(costRedDiv);

      // div for plotting horizontal rule
      let hrDiv1 = document.createElement("div");
      hrDiv1.className = "hrStyle";
      plotsWrapperDiv.appendChild(hrDiv1);

      // div for plotting schedule vs optimal cost
      let schVsOptCostDiv = document.createElement("div");
      schVsOptCostDiv.id = `${value.name}_schVsOptCost`;
      plotsWrapperDiv.appendChild(schVsOptCostDiv);

      // div for plotting horizontal rule
      let hrDiv2 = document.createElement("div");
      hrDiv2.className = "hrStyle";
      plotsWrapperDiv.appendChild(hrDiv2);
    });
    for (let genInd = 0; genInd < selectedGeneratorsList.length; genInd++) {
      let schData: SchTsRowObj[] = [];
      let optSchData: SchTsRowObj[] = [];
      let costRedData: SchTsRowObj[] = [];
      let normalCost: SchTsRowObj[] = [];
      let optCost: SchTsRowObj[] = [];

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

      if (selectedGeneratorsList[genInd].id == 0) {
        costRedData = await calCostRedForAllGen(startDateValue, endDateValue);
      } else {
        costRedData = await calCostRedForSingleGen(
          optSchData,
          schData,
          selectedGeneratorsList[genInd].id
        );
      }

      let costReduPlotData: PlotData = {
        title: `${selectedGeneratorsList[genInd].name} Cost Reduction `,
        traces: [],
      };

      let schDataTrace: PlotTrace = {
        name: "Cost Reduction",
        line: {
          width: 4,
        },
        data: costRedData,
        fill: "tozeroy",
      };
      costReduPlotData.traces.push(schDataTrace);

      let totalCostRed = 0;
      costRedData.forEach((val, ind) => {
        totalCostRed = totalCostRed + val.schVal;
      });
      //showing total cost reduction
      let totalCostredDIv = document.getElementById(
        `${selectedGeneratorsList[genInd].name}_costRedSum`
      ) as HTMLDivElement;
      totalCostredDIv.innerHTML = `Total Cost Reduction for ${
        selectedGeneratorsList[genInd].name
      } is ${Math.round(totalCostRed)} Rs `;

      //setting plot traces
      setPlotTraces(
        `${selectedGeneratorsList[genInd].name}_costRed`,
        costReduPlotData
      );

      //now plotting for  schedule cost and optimal cost
      if (selectedGeneratorsList[genInd].id == 0) {
        normalCost = await calCostForAllGen(
          startDateValue,
          endDateValue,
          "sch"
        );
        optCost = await calCostForAllGen(startDateValue, endDateValue, "opt");
      } else {
        normalCost = await calCostForSingleGen(
          schData,
          selectedGeneratorsList[genInd].id
        );
        optCost = await calCostForSingleGen(
          optSchData,
          selectedGeneratorsList[genInd].id
        );
      }

      let costPlotData: PlotData = {
        title: `${selectedGeneratorsList[genInd].name} Schedule Vs Optimal Cost  `,
        traces: [],
      };

      let normalCostTrace: PlotTrace = {
        name: "Normal Cost",
        line: {
          width: 4,
        },
        data: normalCost,
        fill: "tozeroy",
      };
      costPlotData.traces.push(normalCostTrace);

      let optCostTrace: PlotTrace = {
        name: "Optimal Cost",
        line: {
          width: 4,
        },
        data: optCost,
        fill: "tozeroy",
      };
      costPlotData.traces.push(optCostTrace);

      //setting plot traces
      setPlotTraces(
        `${selectedGeneratorsList[genInd].name}_schVsOptCost`,
        costPlotData
      );
    }
  }
};
