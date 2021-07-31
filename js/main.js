var slide = "exercise"
// var firstRun = true;

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 80, left: 100},
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
    .attr("id", "scene-1-svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// COLORS & SUBGROUPS (MAY NEED TO MOVE TO FUNCTION ONCE DATA IS LOADED)

// // List of subgroups = header of the csv files = soil condition here
// var subgroups = data.columns.slice(1)
// // List of groups = obesity levels here = value of the first column called group -> I show them on the X axis
// var groups = d3.map(data, function(d){return(d.obesity_level)}).keys()

function setupSVG() {
    document.getElementById("my_dataviz").setAttribute("current-slide", slide);

    async function loadAllData() {
        if (document.getElementById("my_dataviz").getAttribute("current-slide") == "age") {
            data = await d3.csv("/data/obesity.csv");
        }
        else {
            data = await d3.csv("/data/obesity_groups_" + slide + ".csv");
        }

        loadPageData();
    }

    // NEED TO FINISH
    function loadPageData() {
        console.log("CLICK! Loading new data...")

        // FIX BOTH PLOTS
        // plot initial data (plotInitData)
        if (document.getElementById("my_dataviz").getAttribute("current-slide") == "age") {
            // plotScatter(data);
        }
        else {
            plotStackedBar(data);
        }

        // plot transitions (plotDataWithTransitions(newData))
    }

    function plotStackedBar(data) {
        addAnnotations();   // fix this function

        // List of subgroups = header of the csv files = soil condition here
        var subgroups = data.columns.slice(1)
        // List of groups = obesity levels here = value of the first column called group -> I show them on the X axis
        var groups = d3.map(data, function(d){return(d.obesity_level)}).keys()

        // Add X axis
        var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 100])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#fe4644','#ff881a', '#33a3ff'])
        // MORE COLORS (if necessary): "#fe4644", "#ff881a", "#86d59c", "#33a3ff", "#3cfdea", "#81adff", "#ffff1a"

        // Normalize the data -> sum of each group must be 100!
        // console.log(data)
        dataNormalized = []
        data.forEach(function(d){
            // Compute the total
            tot = 0
            for (i in subgroups){ name=subgroups[i] ; tot += +d[name] }
            // Now normalize
            for (i in subgroups){ name=subgroups[i] ; d[name] = d[name] / tot * 100}
        })

        //stack the data? --> stack per subgroup
        var stackedData = d3.stack()
            .keys(subgroups)
            (data)

        tooltipStackedBar();

        // TEST AS ITS OWN FUNCTION
        function tooltipStackedBar() {
            // ----------------
            // Create a tooltip
            // ----------------
            var tooltip = d3.select("#scene-1-viz")
                .append("div")
                .style("position","fixed")
                .style("opacity", 0)
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "10px")

            // Three function that change the tooltip when user hover / move / leave a cell
            var mouseover = function(d) {
                var subgroupName = d3.select(this.parentNode).datum().key;
                var subgroupValue = d.data[subgroupName];
                tooltip
                    .html("Daily Tech Use: " + subgroupName + "<br>" + formatSuffixDecimal2(subgroupValue) + "% of individuals")
                    .style("opacity", 1)
                // ----------------
                // Highlight a specific subgroup when hovered
                // ----------------
                // Reduce opacity of all rect to 0.2
                // d3.selectAll(".myRect").style("opacity", 0.2)
                // // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
                // d3.selectAll("."+subgroupName)
                // .style("opacity", 1)
            }
            var mousemove = function(d) {
                tooltip
                .style("left", (d3.mouse(this)[0] + 250) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                .style("top", (d3.mouse(this)[1] +130) + "px")
            }
            var mouseleave = function(d) {
                tooltip
                    .style("opacity", 0)
                // Back to normal opacity: 0.8
                // d3.selectAll(".myRect")
                //     .style("opacity",0.8)

            }
        }

        // // ----------------
        // // Create a tooltip
        // // ----------------
        // var tooltip = d3.select("#scene-1-viz")
        //     .append("div")
        //     .style("position","fixed")
        //     .style("opacity", 0)
        //     .attr("class", "tooltip")
        //     .style("background-color", "white")
        //     .style("border", "solid")
        //     .style("border-width", "1px")
        //     .style("border-radius", "5px")
        //     .style("padding", "10px")

        // // Three function that change the tooltip when user hover / move / leave a cell
        // var mouseover = function(d) {
        //     var subgroupName = d3.select(this.parentNode).datum().key;
        //     var subgroupValue = d.data[subgroupName];
        //     tooltip
        //         .html("Daily Tech Use: " + subgroupName + "<br>" + formatSuffixDecimal2(subgroupValue) + "% of individuals")
        //         .style("opacity", 1)
        //     // ----------------
        //     // Highlight a specific subgroup when hovered
        //     // ----------------
        //     // Reduce opacity of all rect to 0.2
        //     // d3.selectAll(".myRect").style("opacity", 0.2)
        //     // // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
        //     // d3.selectAll("."+subgroupName)
        //     // .style("opacity", 1)
        // }
        // var mousemove = function(d) {
        //     tooltip
        //     .style("left", (d3.mouse(this)[0] + 250) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        //     .style("top", (d3.mouse(this)[1] +130) + "px")
        // }
        // var mouseleave = function(d) {
        //     tooltip
        //         .style("opacity", 0)
        //     // Back to normal opacity: 0.8
        //     // d3.selectAll(".myRect")
        //     //     .style("opacity",0.8)

        // }

        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function(d) { return color(d.key); })
            .attr("class", function(d){ return "myRect " + d.key }) // Add a class to each subgroup: their name
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function(d) { return d; })
            .enter().append("rect")
                .attr("x", function(d) { return x(d.data.obesity_level); })
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); })
                .attr("width",x.bandwidth())
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    }

    // NEEDS WORK
    function plotStackedBarTransition() {

    }

    // NEEDS WORK
    function plotScatter() {

    }
    // NEEDS WORK
    function addAnnotations() {

    }

    loadAllData();
}

function updateSVG(chosenSlide) {
    slide = chosenSlide
    setupSVG();
}

function nextSlide() {
    if (slide == "exercise") {
        chosenSlide = "age";
    }
    else if (slide == "age") {
        chosenSlide = "tech"
    }
    else {
        return
    }
    updateSVG(chosenSlide)
}

function prevSlide() {
    if (slide == "age") {
        chosenSlide = "exercise";
    }
    else if (slide == "tech") {
        chosenSlide = "age";
    } else {
        return
    }
    updateSVG(chosenSlide)
}

// Pagination
var pageItem = $(".pagination li").not(".prev,.next");
var prev = $(".pagination li.prev");
var next = $(".pagination li.next");

pageItem.click(function () {
    pageItem.removeClass("active");
    $(this).not(".prev,.next").addClass("active");
});

next.click(function () {

    if ($('li.active').next().not(".next").length == 1) {
        $('li.active').removeClass('active').next().addClass('active');
    }
});

prev.click(function () {

    if ($('li.active').prev().not(".prev").length == 1) {
        $('li.active').removeClass('active').prev().addClass('active');
    }
});

// // Add X axis
// var x = d3.scaleBand()
//     .domain(groups)
//     .range([0, width])
//     .padding([0.2])
// svg.append("g")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x).tickSizeOuter(0))
//     .selectAll("text")
//         .attr("transform", "translate(-10,0)rotate(-45)")
//         .style("text-anchor", "end");

// // Add Y axis
// var y = d3.scaleLinear()
//     .domain([0, 100])
//     .range([ height, 0 ]);
// svg.append("g")
//     .call(d3.axisLeft(y));

// // color palette = one color per subgroup
// var color = d3.scaleOrdinal()
//     .domain(subgroups)
//     .range(['#fe4644','#ff881a', '#33a3ff'])
// // MORE COLORS (if necessary): "#fe4644", "#ff881a", "#86d59c", "#33a3ff", "#3cfdea", "#81adff", "#ffff1a"
