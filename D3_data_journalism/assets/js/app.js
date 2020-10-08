// Configuring SVG
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right
var height = svgHeight - margin.top - margin.bottom

// Inserting SVG wrapper element
var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

// Inserting chart area element
var chartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Plotting
d3.csv("assets/data/data.csv").then(data => {
    console.log(data);

    // Parse data
    data.forEach((state) => {
        state.age = +state.age;
        state.smokes = +state.smokes;
    });

    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.age)-1, d3.max(data, d => d.age)])
        .range([0, width]);

    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.smokes-1), d3.max(data, d => d.smokes)])
        .range([height, 0]);
    
    // Create axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale)

    // Append axis to chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    chartGroup.append("g")
        .call(leftAxis);

    // Add circles to chart
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.age))
        .attr("cy", d => yLinearScale(d.smokes))
        .attr("r", "15")
        .attr("fill", "blue")
        .attr("opacity", ".5");
    
    // Initialize tool tip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80,-60])
        .html(d => {
            return (`${d.state}<br>Age: ${d.age}<br>Smokes: ${d.smokes}`);
        });
    
    // Add tooltip to chart
    chartGroup.call(toolTip);

    // add event listeners
    circlesGroup.on("click", function(tip) {
        toolTip.show(tip, this);
    })
    circlesGroup.on("mouseover", function(tip) {
        toolTip.show(tip, this);
      });
    circlesGroup.on("mouseout", function(tip, index) {
        toolTip.hide(tip);
      });

    // Add abbreviation to center of circles
    chartGroup.append("g").selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d.age)-8)
        .attr("y", d => yLinearScale(d.smokes)+5)
        .text(d => d.abbr)
        .attr("font-size", "12px");
    
    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .text("Percent of Smokers");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .attr("text-anchor", "middle")
      .text("Age");

}).catch(error => console.log(error));