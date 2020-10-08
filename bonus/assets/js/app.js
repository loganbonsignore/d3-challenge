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

// Initial Params
var chosenXAxis = "age";
var chosenYAxis = "smokes";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis])-1, d3.max(data, d => d[chosenXAxis])])
        .range([0, width]);

    return xLinearScale;
}

function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]-1), d3.max(data, d => d[chosenYAxis])])
        .range([height, 0]);
    
    return yLinearScale;
}

function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(500)
        .call(bottomAxis);
    
    return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(500)
        .call(leftAxis);
    
    return yAxis;
}

function renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis, data) {
    circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        // .transition()
        // .duration(750)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("fill", "blue")
        .attr("opacity", ".5");

    // Add abbreviation to center of circles
    chartGroup.append("g").classed("state_abbr", true).selectAll("text")
        .data(data)
        .enter()
        .append("text")
        // .transition()
        // .duration(750)
        .attr("x", d => xLinearScale(d[chosenXAxis])-8)
        .attr("y", d => yLinearScale(d[chosenYAxis])+5)
        .text(d => d.abbr)
        .attr("font-size", "12px");

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, chartGroup) {
    var xlabel, ylabel;
  
    if (chosenXAxis === "age") {
        xlabel = "Age";
    } else if (chosenXAxis === "poverty") {
        xlabel="In Poverty";
    } else {
        xlabel = "Income";
    }

    if (chosenYAxis === "smokes") {
        ylabel = "Smokes (%)";
    } else if (chosenYAxis === "healthcare") {
        ylabel="Healthcare (%)";
    } else {
        ylabel = "Obese (%)";
    }
  
    // Initialize tool tip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80,-60])
        .html(d => {
            return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
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
  
    return circlesGroup;
  }

// Plotting
d3.csv("assets/data/data.csv").then(data => {
    console.log(data);

    // Parse data
    data.forEach((state) => {
        state.age = +state.age;
        state.smokes = +state.smokes;
        state.income = +state.income;
        state.poverty = +state.poverty;
        state.obesity = +state.obesity;
        state.healthcare = +state.healthcare;
    });
    // Create scales
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);

    // Create axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append axis to chart
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Add initial circles to chart
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("fill", "blue")
        .attr("opacity", ".5");

    // Add abbreviation to center of circles
    chartGroup.append("g").classed("state_abbr", true).selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis])-8)
        .attr("y", d => yLinearScale(d[chosenYAxis])+5)
        .text(d => d.abbr)
        .attr("font-size", "12px");

    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, chartGroup);
   
    // Create axis label group
    var XlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    var ageLabel = XlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("value", "age") // value to grab for event listener
        .classed("active", true)
        .text("Age (Median)");
    var incomeLabel = XlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 35)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");
    var povertyLabel = XlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 55)
        .attr("value", "poverty") // value to grab for event listener
        .classed("inactive", true)
        .text("In Poverty (%)");

    var YlabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
    var smokesLabel = YlabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 70)
        .attr("value", "smokes") // value to grab for event listener
        .classed("active", true)
        .text("Smokes (%)");
    var healthcareLabel = YlabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 50)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");
    var obeseLabel = YlabelsGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 0 - margin.left + 30)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese (%)");

    // x axis labels event listener
    XlabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
            // Delete old circles
            if (!circlesGroup.empty()) {
                circlesGroup.remove();
            };
            // Delete old state abbreviations
            var stateAbbreviationGroup = chartGroup.selectAll(".state_abbr")
            if (!stateAbbreviationGroup.empty()) {
                stateAbbreviationGroup.remove();
            }
            // replaces chosenXAxis with value
            chosenXAxis = value;

            // updates x scale for new data
            xLinearScale = xScale(data, chosenXAxis);

            // updates axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new state abbreviations
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis, data)

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, chartGroup);

            // changes classes to change bold text
            if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);                    
            } else if (chosenXAxis === "income") {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true); 
            } else {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false); 
            };
        };
    });

    // x axis labels event listener
    YlabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
            // Delete old stuff
            if (!circlesGroup.empty()) {
                circlesGroup.remove();
            }
            // Delete old state abbreviations
            var stateAbbreviationGroup = chartGroup.selectAll(".state_abbr")
            if (!stateAbbreviationGroup.empty()) {
                stateAbbreviationGroup.remove();
            }
            // replaces chosenXAxis with value
            chosenYAxis = value;

            // updates x scale for new data
            yLinearScale = yScale(data, chosenYAxis);

            // updates axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new state abbreviations
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis, data)

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, chartGroup);

            // changes classes to change bold text
            if (chosenYAxis === "smokes") {
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true);                    
            } else if (chosenYAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obeseLabel
                    .classed("active", false)
                    .classed("inactive", true); 
            } else {
            obeseLabel
                .classed("active", true)
                .classed("inactive", false);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true); 
            };
        };
    });
}).catch(error => console.log(error));