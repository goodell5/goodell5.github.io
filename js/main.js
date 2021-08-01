var slide = "exercise"
// var firstRun = true;

// set the dimensions and margins of the graph
var margin = {top: 40, right: 200, bottom: 80, left: 100},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
    .attr("id", "scene-1-svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1050 800")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function setupSVG() {
    document.getElementById("my_dataviz").setAttribute("current-slide", slide);

    async function loadAllData() {
        // if (document.getElementById("my_dataviz").getAttribute("current-slide") == "age") {
        //     data = await d3.csv("/data/obesity.csv");
        // }
        // else {
        data = await d3.csv("/data/obesity_groups_" + slide + ".csv");
        // }
        loadPageData();
    }

    // NEED TO FINISH
    function loadPageData() {
        // console.log("CLICK! Loading new data...")

        // FIX BOTH PLOTS
        // plot initial data (plotInitData)
        if (document.getElementById("my_dataviz").getAttribute("current-slide") == "age") {
            // plotScatter(data);
            plotStackedBar(data);
        }
        else {
            plotStackedBar(data);
        }

        // plot transitions (plotDataWithTransitions(newData))
    }

    function plotStackedBar(data) {

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
            // .attr("class", "axisText")
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
            // .attr("class", "axis")
            // .attr("class", "Y-axis")
            .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        if (slide == "exercise") {
            var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#fe4644','#ff881a', '#33a3ff', '#86d59c'])
        }
        else if (slide == "age") {
            var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#fe4644','#ff881a', '#33a3ff', '#86d59c', "#3cfdea", "#ffff1a"])
        }
        else if (slide == "tech") {
            var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#fe4644','#ff881a', '#33a3ff'])
        }
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

        // ----------------
        // Create a tooltip
        // ----------------

        // Format sig figs
        var formatSuffixDecimal2 = d3.format(".2f");

        // original
        var tooltip = d3.select("#my_dataviz")
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
            if (document.getElementById("my_dataviz").getAttribute("current-slide") == "exercise") {
                tooltip
                .html("Weekly Exercise: " + subgroupName + "<br>" + formatSuffixDecimal2(subgroupValue) + "% of individuals")
                .style("opacity", 1)
            }
            else if (document.getElementById("my_dataviz").getAttribute("current-slide") == "age") {
                tooltip
                .html("Ages: " + subgroupName + "<br>" + formatSuffixDecimal2(subgroupValue) + "% of individuals")
                .style("opacity", 1)
            }
            else {
                tooltip
                .html("Daily Tech Use: " + subgroupName + "<br>" + formatSuffixDecimal2(subgroupValue) + "% of individuals")
                .style("opacity", 1)
            }
            
            // ----------------
            // Highlight a specific subgroup when hovered (BROKEN)
            // ----------------
            // Reduce opacity of all rect to 0.2
            // d3.selectAll(".myRect").style("opacity", 0.2)
            // // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
            // d3.selectAll("."+subgroupName)
            // .style("opacity", 1)
        }
        var mousemove = function(d) {
            tooltip
            .style("left", (d3.mouse(this)[0] + 450) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1] + 130) + "px")
        }
        var mouseleave = function(d) {
            tooltip
                .style("opacity", 0)
            // Back to normal opacity: 0.8 (BROKEN with highlight feature above)
            // d3.selectAll(".myRect")
            //     .style("opacity",0.8)
        }

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

        addAnnotationsStackedBar();   // fix this function
    }

    // NEEDS WORK
    function plotStackedBarTransition() {

    }

    // NEEDS WORK
    function plotScatter() {

    }

    function addAnnotationsStackedBar() {
        svg.selectAll(".annotation-group").remove()

        if (document.getElementById("my_dataviz").getAttribute("current-slide") == "exercise") {
            annotations = [{
                note: {
                    label: "As obesity level increases, amount of exercise decreases",
                    title: "More Exercise, Less Obesity"
                },
                type: d3.annotationCalloutRect,
                subject: {
                    // ROI width/height
                    width: width * 0.83,
                    height: height * 0.375,
                },
                color: ["white"],
                // ROI coords
                x: width * 0.015,
                y: height * 0.015,
                // label/text coords
                dy: 250,
                dx: 670
            }]
        }
        
        // NEEDS WORK (once slide 2 is ready)
        else if (document.getElementById("my_dataviz").getAttribute("current-slide") == "age")  {
            annotations = [{
                note: {
                    label: "Not many people at or below normal weight",
                    title: "Age Annotation Title"
                },
                type: d3.annotationCalloutCircle,
                subject: {
                    radius: 80, // circle radius
                    radiusPadding: 20, // white space around circle befor connector
                },
                data: {
                    color: ["white"],
                    x: width * 0.75,
                    y: height * 0.35,
                    dy: -30,
                    dx: 150
                }
            },
            {
                note: {
                    label: "More people ages 20-29 are obese than at or below normal weight",
                    title: "Age Annotation Title"
                },
                type: d3.annotationCalloutRect,
                subject: {
                    // ROI width/height
                    width: width * 0.8,
                    height: height * 0.4,
                },
                data:
                {
                    color: ["white"],
                    // ROI coords
                    x: width * 0.015,
                    y: height * 0.4,
                    // label/text coords
                    dy: 500,
                    dx: 670
                }
            }]
        }
        else {
            annotations = [{
                note: {
                    label: "Not quite. Tech use varies across all obesity levels",
                    title: "Tech Leads to Obesity?"
                },
                type: d3.annotationCalloutRect,
                subject: {
                    // ROI width/height
                    width: width * 0.83,
                    height: height * 0.5,
                },
                color: ["white"],
                // ROI coords
                x: width * 0.015,
                y: height * 0.015,
                // label/text coords
                dy: 250,
                dx: 670
            }]
        }
        // Add annotation to the chart
        const makeAnnotations = d3.annotation()
            .textWrap(265) // changes text wrap width
            .annotations(annotations)

        svg.append('g')
        .attr('class', 'annotation-group')
        .call(makeAnnotations)
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
