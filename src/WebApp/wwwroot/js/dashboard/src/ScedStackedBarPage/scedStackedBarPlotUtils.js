import Plotly from "plotly.js-dist";
import { toDateObj } from "../timeUtils";
export const getPlotXYArrays = (measData) => {
    let timestamps = [];
    let vals = [];
    for (var i = 0; i < measData.length; i = i + 1) {
        timestamps.push(toDateObj(measData[i].schTime));
        vals.push(measData[i].schVal);
    }
    return { timestamps: timestamps, vals: vals };
};
export const setPlotTraces = (divId, plotData) => {
    let traceData = [];
    const layout = {
        title: {
            text: plotData.title,
            font: {
                size: 28,
            },
        },
        // plot_bgcolor:"black",
        // paper_bgcolor:"#FFF3",
        showlegend: true,
        barmode: "relative",
        legend: {
            orientation: "h",
            y: -0.3,
            x: 0.1,
            font: {
                family: "sans-serif",
                size: 15,
            },
        },
        //autosize: true,
        height: 750,
        width: 1500,
        xaxis: {
            showgrid: false,
            zeroline: true,
            showspikes: true,
            spikethickness: 1,
            showline: true,
            titlefont: { color: "#000", size: 22 },
            tickfont: { color: "#000", size: 15 },
            //tickmode: "linear",
            //dtick: 180 * 60 * 1000,
            automargin: true,
            tickangle: 283,
        },
        yaxis: {
            title: "SCED(MW) ",
            showgrid: true,
            zeroline: true,
            showspikes: true,
            spikethickness: 1,
            showline: true,
            titlefont: { color: "#000" },
            tickfont: { color: "#000", size: 18 },
            tickformat: "digits",
        },
    };
    for (var traceIter = 0; traceIter < plotData.traces.length; traceIter++) {
        const trace = plotData.traces[traceIter];
        const xyData = getPlotXYArrays(trace.data);
        // creating different graph for bias error  , which is 2nd index of plotdata.traces
        let traceObj = {
            x: xyData.timestamps,
            y: xyData.vals,
            name: trace.name,
            //width: 10,
            hovertemplate: "(%{x}" + ", %{y:.0f}Mw)",
        };
        if (trace.line != null) {
            traceObj["line"] = trace.line;
        }
        if (trace.type != null) {
            traceObj["type"] = trace.type;
        }
        if (trace.mode != null) {
            traceObj["mode"] = trace.mode;
        }
        traceData.push(traceObj);
    }
    Plotly.newPlot(divId, traceData, layout);
};
//# sourceMappingURL=scedStackedBarPlotUtils.js.map