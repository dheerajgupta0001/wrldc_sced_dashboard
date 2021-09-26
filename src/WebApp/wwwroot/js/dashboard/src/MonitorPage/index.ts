// import { getSoFarHighestData } from "./fetchDataApi";
// import { appConfig } from "./config";
// // declare var $:any;

// //interface for api response object
// export interface RespObj {
//   displayName?: string;
//   soFarHighest: number;
//   soFarHighestTimestamp: string;
//   prevSoFarHighest: number;
//   prevSoFarHighestTimestamp: string;
// }

// interface Accumulator {
//   accumulatorList: RespObj[];
// }

// let intervalID = null;
// window.onload = async () => {
//   intervalID = setInterval(refreshData, 1000 * 60 * 30);
//   (document.getElementById("refreshBtn") as HTMLButtonElement).onclick =
//     refreshData;
//   refreshData();
// };

// const refreshData = async () => {
//   const nowTime = new Date();
//   const currDate = nowTime.toISOString().substring(0, 10);
//   // iterating through each tableId in appConfig
//   for (let tableInd = 0; tableInd < appConfig.length; tableInd++) {
//     // accumulator for all the metrices for a single table
//     let accumulator: Accumulator = { accumulatorList: [] };

//     // iterating through each metricId corresponidng to a table
//     for (
//       let metricInd = 0;
//       metricInd < appConfig[tableInd]["metrics"].length;
//       metricInd++
//     ) {
//       let fetchedData: RespObj = await getSoFarHighestData(
//         appConfig[tableInd]["metrics"][metricInd]["dataSource"],
//         appConfig[tableInd]["metrics"][metricInd]["metricName"]
//       );
//       fetchedData["displayName"] =
//         appConfig[tableInd]["metrics"][metricInd]["displayName"];
//       accumulator.accumulatorList.push(fetchedData);
//     }
//     // console.log(accumulator);
//     $(`#${appConfig[tableInd]["tblId"]}`).DataTable().destroy();
//     $(`#${appConfig[tableInd]["tblId"]}`).DataTable({
//       dom: "",
//       data: accumulator.accumulatorList,

//       createdRow: function (row, data, dataIndex) {
//         if (data["soFarHighestTimestamp"].substring(0, 10) == currDate) {
//           $(row).addClass("important");
//         }
//       },
//       order: [[2, "desc"]],
//       columns: [
//         { data: "displayName", title: "Metric Name" },
//         { data: "soFarHighest", title: "Highest" },
//         { data: "soFarHighestTimestamp", title: "Time Highest" },
//         { data: "prevSoFarHighest", title: "Prev Highest" },
//         { data: "prevSoFarHighestTimestamp", title: "Time Prev Highest" },
//       ],
//     });
//   }
// };
