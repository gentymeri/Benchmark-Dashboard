
/*
The code below holds the logic
for the linegraph
*/


//Read the data
function drawScatterplot(data, selector) {

    // set the dimensions and margins of the graph
    var margin = {top: 50, right: 50, bottom: 50, left: 50},
        width = 750 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Pan and zoom
    var zoom = d3.zoom()
        .scaleExtent([.5, 20])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

// append the svg object to the body of the page
    var svg = d3.select(selector)
        .append("svg")
        .attr("style", "outline: thin solid grey;")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);

// add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // List of groups (here I have one group per column)
    var allGroup = ["New", "Old"]

    // Reformat the data: we need an array of arrays of {x, y} tuples
    var dataReady = allGroup.map( function(grpName) { // .map allows to do something for each element of the list
        return {
            name: grpName,
            values: data.map(function(d) {
                return {index: d.index, value: +d[grpName], benchmark: d.Benchmark, unit: d.Unit, suite: d.Suite};
            })
        };
    });

    // console.log(dataReady)

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(['#add8e6','#ff8c00']);

    // Calculate max value from dataset for x and y axis
    var maxRangeY = d3.max(data, function(d) { return Math.max(d.New, d.Old);} );
    console.log(maxRangeY);
    var maxRangeX = d3.max(data, function(d) { return Math.max(d.index);} );
    console.log(maxRangeX);

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0,maxRangeX])
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // add text label for the x axis
    svg.append("text")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height + margin.top - 10) + ")")
        .style("text-anchor", "middle")
        .text("ID (Index)");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain( [0,maxRangeY])
        .range([ height, 0 ]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add text label for the y axis
    // svg.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left)
    //     .attr("x",0 - (height / 2))
    //     .attr("dy", "1em")
    //     .style("text-anchor", "middle")
    //     .text("");

    // Add the lines
    var line = d3.line()
        .x(function(d) { return x(+d.index) })
        .y(function(d) { return y(+d.value) })
    svg.selectAll("myLines")
        .data(dataReady)
        .enter()
        .append("path")
        .attr("d", function(d){ return line(d.values) } )
        .attr("stroke", function(d){ return myColor(d.name) })
        .style("stroke-width", 2)
        .style("fill", "none")

    // Add the points
    svg
    // First we need to enter in a group
        .selectAll("myDots")
        .data(dataReady)
        .enter()
        .append('g')
        .style("fill", function(d){ return myColor(d.name) })
        // Second we need to enter in the 'values' part of this group
        .selectAll("myPoints")
        .data(function(d){ return d.values })
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.index) } )
        .attr("cy", function(d) { return y(d.value) } )
        .attr("r", 3)
        .attr("stroke", "white")
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip	.html("ID " + d.index + "<br/>" + "Suite:" + d.suite + "<br/>" + "Benchmark:" + d.benchmark + "<br/>" + (d.value) + " " + d.unit)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform)
        }))

    // draw legend
    var legend = svg.selectAll(".legend")
        .data(myColor.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", myColor);

    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})
}

    function zoomed() {
    // create new scale ojects based on event
        var new_xScale = d3.event.transform.rescaleX(xScale);
        var new_yScale = d3.event.transform.rescaleY(yScale);
    // update axes
        gX.call(xAxis.scale(new_xScale));
        gY.call(yAxis.scale(new_yScale));
        points.data(data)
            .attr('cx', function(d) {return new_xScale(d.x)})
            .attr('cy', function(d) {return new_yScale(d.y)});
    }

drawScatterplot(op_ms_data, '#plot_opms1');
drawScatterplot(ms_op_data, '#plot_msop1');


/*

The following function holds logic for Donut Chart

 */

function drawDonut(percent, selector){

    var duration = 1500,
        transition = 200,
        width = 250,
        height = 250;

    var dataset = {
            lower: calcPercent(0),
            upper: calcPercent(percent)
        },
        radius = Math.min(width, height) / 2.5,
        pie = d3.pie().sort(null),
        format = d3.format(".0%");

    var arc = d3.arc()
        .innerRadius(radius * .5)
        .outerRadius(radius);

    var svg = d3.select(selector).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

    var path = svg.selectAll("path")
        .data(pie(dataset.lower))
        .enter().append("path")
        .attr("class", function (d, i) {
            return "color" + i
        })
        .attr("d", arc)
        .each(function (d) {
            this._current = d;
        });

    var text = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", ".5em")

    var progress = 0;

    var timeout = setTimeout(function () {
        clearTimeout(timeout);
        path = path.data(pie(dataset.upper));
        path.transition().duration(duration).attrTween("d", function (a) {
            var i = d3.interpolate(this._current, a);
            var i2 = d3.interpolate(progress, percent)
            this._current = i(0);
            return function (t) {
                // check if number is negative or positive
                if((i2(t)) < 0){
                    numPos = Math.abs(i2(t))
                    text.text(format((numPos) / 100) + " Decrease");
                    return arc(i(t));
                }
                else{
                    text.text((format(i2(t) / 100)) + " Increase");
                    return arc(i(t));
                }
            }
        });
    }, 200);

    function calcPercent(percent) {
        return [percent, 100 - percent];
    }
};

drawDonut(calc_perf_op_ms,'#donut1');
drawDonut(calc_perf_ms_op, '#donut2');




/*

The following function hold logic for Bar chart plot

 */

function BarChart(csv, selector, selectorSuite, selectorSort) {

    var keys = Object.keys(csv[0]).slice(2);

    var suite = [...new Set(csv.map(d => d.Suite))]
    var indexes = [...new Set(csv.map(d => d.index))]

    var options = d3.select(selectorSuite).selectAll("option")
        .data(suite)
        .enter().append("option")
        .text(d => d)

    var svg = d3.select(selector),
        margin = {top: 35, left: 35, bottom: 0, right: 0},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand()
        .range([margin.left, width - margin.right])
        .padding(0.1)

    var y = d3.scaleLinear()
        .rangeRound([height - margin.bottom, margin.top])

    var xAxis = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr("class", "x-axis")

    var yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "y-axis")

    var z = d3.scaleOrdinal()
        .range(["steelblue", "darkorange", "lightblue"])
        .domain(keys);

    update(d3.select(selectorSuite).property("value"), 0)

    function update(input, speed) {

        var data = csv.filter(f => f.Suite == input)

        data.forEach(function(d) {
            d.total = d3.sum(keys, k => +d[k])
            return d
        })

        y.domain([0, d3.max(data, d => d3.sum(keys, k => +d[k]))]).nice();

        svg.selectAll(".y-axis").transition().duration(speed)
            .call(d3.axisLeft(y).ticks(null, "s"))

        data.sort(d3.select(selectorSort).property("checked")
            ? (a, b) => b.total - a.total
            : (a, b) => indexes.indexOf(a.index) - indexes.indexOf(b.index))

        x.domain(data.map(d => d.index));

        svg.selectAll(".x-axis").transition().duration(speed)
            .call(d3.axisBottom(x).tickSizeOuter(0))

        var group = svg.selectAll("g.layer")
            .data(d3.stack().keys(keys)(data), d => d.key)

        group.exit().remove()

        group.enter().append("g")
            .classed("layer", true)
            .attr("fill", d => z(d.key));

        var bars = svg.selectAll("g.layer").selectAll("rect")
            .data(d => d, e => e.data.index);

        bars.exit().remove()

        bars.enter().append("rect")
            .attr("width", x.bandwidth())
            .merge(bars)
            .transition().duration(speed)
            .attr("x", d => x(d.data.index))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))

        // var text = svg.selectAll(".text")
        //     .data(data, d => d.index);
        //
        // text.exit().remove()

        // text.enter().append("text")
        //         //     .attr("class", "text")
        //         //     .attr("text-anchor", "middle")
        //         //     .merge(text)
        //         //     .transition().duration(speed)
        //         //     .attr("x", d => x(d.index) + x.bandwidth() / 2)
        //         //     .attr("y", d => y(d.total) - 5)
        //         //     .text(d => d.total)
    }

    var select = d3.select(selectorSuite)
        .on("change", function() {
            update(this.value, 750)
        })

    var checkbox = d3.select(selectorSort)
        .on("click", function() {
            update(select.property("value"), 750)
        })
}

BarChart(op_ms_data, '#BarChart1','#Suite', '#sort');
BarChart(ms_op_data, '#BarChart2','#Suite1', '#sort1');



