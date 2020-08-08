var metadataResult = []
function init() {
  var selector = d3.select("#selDataset");

  d3.json("samples.json").then((data) => {
    console.log(data);
    let sampleNames = data.names;
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    const defaultSample = sampleNames[0];
    optionChanged(defaultSample);
  })
}

function optionChanged(newSample) {
  buildMetadata(newSample);
  buildCharts(newSample);
}

function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    let metadata = data.metadata;
    let resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    metadataResult = resultArray[0];
    let PANEL = d3.select("#sample-metadata");

    PANEL.html("");
    Object.entries(metadataResult).forEach(([key, value]) => {
      PANEL.append("h6").text(key + ': ' + value);
    });
  })
}

function buildCharts(sample) {
  // Grab data from samples.json and filter for selected ID
  d3.json("samples.json").then((data) => {
    var samples = data.samples;
    let resultArray = samples.filter(sampleObj => sampleObj.id == sample);
    let result = resultArray[0];

    //Create bubble chart for all OTU samples for selected ID
    buildBubbleChart(result)
    buildBarChart(result)
    buildGaugeChart(metadataResult)
  })
}

function buildBarChart(sample) {
  let dataObjects = []
  // Create array of dictionaries with id, value, and label for Bar Chart
  sample.otu_ids.forEach((id, i) => {
    dataObjects.push({
      id: id,
      value: sample.sample_values[i],
      label: sample.otu_labels[i]
    });
  });

  // Sort the 'dataObjects' array
  let sortedData = dataObjects.sort((a,b) => b.values - a.values);

  // Slice array to grab top ten values
  let topTenData = sortedData.slice(0,10)
  console.log(topTenData)

  let data = [{
    x: topTenData.map(row => row.value).reverse(),
    y: topTenData.map(row => "OTU ".concat(row.id)).reverse(),
    text: topTenData.map(row => row.label).reverse(),
    hoverinfo: 'text',
    type: "bar",
    orientation: 'h'
  }]

  Plotly.newPlot("bar", data)
}

function buildBubbleChart(sample) {
  let data = [{
    x: sample.otu_ids,
    y: sample.sample_values,
    mode: "markers",
    marker: {
      size: sample.sample_values,
      color: sample.otu_ids
    },
    text: sample.otu_labels
  }];

  // Create the layout for the bubble chart
  let layout = {
    xaxis: {
      autorange: true,
      type: "linear",
      title: "OTU_ID"
    },
    yaxis: {
      autorange: true,
      type: "linear"
    }
  };
  Plotly.newPlot("bubble", data, layout);
}

function buildGaugeChart(sample) {
  console.log(sample)
  var data = [
	{
		domain: { x: [0, 1], y: [0, 1] },
		value: sample.wfreq,
		title: { text: "Belly Button Washing Frequency" },
		type: "indicator",
		mode: "gauge+number+indicator",
    gauge: { axis: {range: [0, 9]}}
	}
];

var layout = {
  width: 600,
  height: 400,
  margin: { t: 0, b: 0 }
};
Plotly.newPlot('gauge', data, layout);
}

init();
