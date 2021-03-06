var slide = "exercise"
// var firstRun = true;

// set the dimensions and margins of the graph
var margin = {top: 45, right: 200, bottom: 80, left: 100},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


function setupSVG() {
    document.getElementById("my_dataviz").setAttribute("current-slide", slide);

    async function loadAllData() {
        // if (document.getElementById("my_dataviz").getAttribute("current-slide") == "age") {
        //     data = await d3.csv("/data/obesity.csv");
        // }
        // else {
        data = await d3.csv("/data/obesity_groups_" + slide + ".csv");
        // }
        clearOldData();
        loadPageData();
    }

    function clearOldData() {
        d3.select("#scene-1-svg").remove();
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
        // NEEDS WORK
        // plot transitions (plotDataWithTransitions(newData))
    }

    function plotStackedBar(data) {
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
            var legend_title = "Weekly Exercise"
        }
        else if (slide == "age") {
            var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#fe4644','#ff881a', '#33a3ff', '#86d59c', "#3cfdea", "#ffff1a"])
            var legend_title = "Age Groups"
        }
        else if (slide == "tech") {
            var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(['#fe4644','#ff881a', '#33a3ff'])
            var legend_title = "Daily Tech Use"
        }
        // MORE COLORS (if necessary): "#fe4644", "#ff881a", "#86d59c", "#33a3ff", "#3cfdea", "#81adff", "#ffff1a"

        // Legend
        var offset_legend = 25;
        // Legend icons
        svg.selectAll("legend_rects")
            .data(subgroups)
            .enter()
            .append("rect")
                .attr("fill", function(d, i) { return color(subgroups[i]); })
                .attr("x", width + 20)
                .attr("y", function(d, i) { return margin.top + i * 25 + offset_legend - 5})
                .attr("height", 10)
                .attr("width", 10)
        // Legend labels
        svg.selectAll("legend_labels")
            .data(subgroups)
            .enter()
            .append("text")
                .style("fill", function (d, i) { return color(subgroups[i]); })
                .attr("x", width + 40)
                .attr("y", function (d, i) { return margin.top + i * 25 +  offset_legend})
                .text(function (d) { return d })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .style("font-size", width * 0.015)
        // Legend title
        svg.append("g")
            .append("text")
                .style("fill", "white")
                .attr("x", width + 40)
                .attr("y", margin.top + 5)
                .text(legend_title)
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .style("font-size", width * 0.0175)


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
            var groupName = d.data.obesity_level;
            // console.log(d.data.obesity_level)
            if (document.getElementById("my_dataviz").getAttribute("current-slide") == "exercise") {
                tooltip
                .html("Weekly Exercise: " + subgroupName + "<br>" + formatSuffixDecimal2(subgroupValue) + "% of individuals" + "<br>" + "Category: " + groupName)
                .style("opacity", 1);
            }
            else if (document.getElementById("my_dataviz").getAttribute("current-slide") == "age") {
                tooltip
                .html("Ages: " + subgroupName + "<br>" + formatSuffixDecimal2(subgroupValue) + "% of individuals" + "<br>" + "Category: " + groupName)
                .style("opacity", 1);
            }
            else {
                tooltip
                .html("Daily Tech Use: " + subgroupName + "<br>" + formatSuffixDecimal2(subgroupValue) + "% of individuals" + "<br>" + "Category: " + groupName)
                .style("opacity", 1);
            }
            
            // ----------------
            // Highlight a specific subgroup when hovered
            // ----------------
            // Reduce opacity of all rect to 0.2
            d3.selectAll(".myRect").style("opacity", 0.2)
            // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
            // d3.selectAll("."+subgroupName) <--- BROKEN
            d3.select(this.parentNode).style("opacity", 1)
        }
        var mousemove = function(d) {
            tooltip
            .style("left", (d3.mouse(this)[0] + 450) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1] + 130) + "px")
        }
        var mouseleave = function(d) {
            tooltip
                .style("opacity", 0);
            // Back to normal opacity: 0.8
            d3.selectAll(".myRect")
                .style("opacity",0.8)
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

        addAnnotationsStackedBar();
    }

    // NEEDS WORK
    function plotStackedBarTransition() {

    }

    // NEEDS WORK
    function plotScatter() {

    }

    function addAnnotationsStackedBar() {
        var svg = d3.select("#scene-1-svg");
        // console.log("addAnnotationsStackedBar is CALLED!")
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
                x: width * 0.1675,
                y: height * 0.115,
                // label/text coords
                dy: 250,
                dx: 670
            }]
        }        
        else if (document.getElementById("my_dataviz").getAttribute("current-slide") == "age")  {
            annotations = [{
                note: {
                    label: "Not many elderly people at or below normal weight",
                    title: "Fewer Elders"
                },
                // type: d3.annotationCalloutCircle,
                // subject: {
                //     radius: 100,
                //     radiusPadding: 10,
                // },
                // // ROI/subject x/y
                // x: width * 0.15,
                // y: height * 0.1,
                // // offset label/text from ROI
                // dy: 0,
                // dx: 110,

                // data: {
                //     color: ["white"]
                // }
                type: d3.annotationCalloutRect,
                subject: {
                    // ROI width/height
                    width: width * 0.275,
                    height: height * 0.2,
                },
                // ROI coords
                x: width * 0.1675,
                y: height * 0.075,
                // label/text coords
                dy: 125,
                dx: 200,
                data: { color: ["white"]}
            },
            {
                note: {
                    label: "More people ages 20-29 are obese than at or below normal weight",
                    title: "Obesity in Youth"
                },
                type: d3.annotationCalloutRect,
                subject: {
                    // ROI width/height
                    width: width * 0.275,
                    height: height * 0.88,
                },
                // ROI coords
                x: width * 0.862,
                y: height * 0.115,
                // label/text coords
                dy: 225,
                dx: 210,
                data: { color: ["white"]}
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
                    height: height * 0.6,
                },
                color: ["white"],
                // ROI coords
                x: width * 0.165,
                y: height * 0.075,
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
