var margin = {top: 30, right: 30, bottom: 125, left: 80},
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

const svg = d3.select('svg')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

const render = data => {
    const title = 'User Score vs. Playtime';

    const xAxisLabel = 'Playtime(Hours)'
    const xValue = d => d.playtime;

    const yAxisLabel = 'User Score'
    const yValue = d => d.userscore;

    const cValue = d => d.price;

    const circleRadius = d=> d.tagweight/12;

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, xValue))
        .range([0, width])
        .nice();

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yValue))
        .range([height, 0])
        .nice();


    const cScale = d3.scaleThreshold()
        .domain([1, 3, 5, 7, 9, 10, 12])
        .range( d3.schemePurples[7] );

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const xAxis = d3.axisBottom(xScale)
        .tickSize(-height)
        .tickPadding(15);

    const yAxis = d3.axisLeft(yScale)
        .tickSize(-width)
        .tickPadding(10);

    const yAxisG = g.append('g').call(yAxis);

    yAxisG.selectAll('.domain').remove();

    yAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', -93)
        .attr('x', -height/2)
        .attr('fill', 'black')
        .attr('transform', `rotate(-90)`)
        .style('text-anchor', 'middle')
        .text(yAxisLabel);

    const xAxisG = g.append('g').call(xAxis)
        .attr('transform', `translate(0,${height})`);

    xAxisG.select('.domain').remove();

    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('y', 75)
        .attr('x', width/2)
        .attr('fill', 'black')
        .text(xAxisLabel);

    const clip = svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);

    var zoom = d3.zoom()
        .scaleExtent([.5, 20])
        .extent([[0, 0], [width, height]])
        .on("zoom", updateChart);

    g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(zoom);

    const scatter = g.append('g')
        .attr("clip-path", "url(#clip)");

    const circles = scatter.selectAll(".dot").data(data);

    circles
        .enter().append('circle')
        .attr("class", "dot")
        .attr('cy', d => yScale(yValue(d)))
        .attr('cx', d => xScale(xValue(d)))
        .attr('r', circleRadius)
        .attr('fill', d => cScale(cValue(d)))
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    g.append('text')
        .attr('class', 'title')
        .attr('x', 50)
        .attr('y', -15)
        .text(title);

    const legend = svg.append('g')
        .attr("class", "legend-group")
        .selectAll(".legend")
        .data(cScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(250," + (i+1) * 20 + ")"; });

    legend.append("rect")
        .attr("x", width/2 + 180)
        .attr("y", 25)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", (d,i)=> cScale(d-0.0001));

    legend.append("text")
        .attr("x", width/2 + 176)
        .attr("y", 35)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return "< $"+ d;});

    function handleMouseOver(d,i){
        d3.select(this)
            .attr('stroke', '#49fc03')
            .attr('stroke-width', 2)
            .attr('r', circleRadius);

       svg.append("text")
            .attr('id', "t" + d.x + "-" + d.y + "-" + i)
            .attr('fill', '#49fc03')
            .attr('font-size', '2em')
            .attr('stroke', 'black')
            .attr('stroke-width', 0.7)
            .attr('x', width/2 - 200)
            .attr('y', height/2 + 290)
            .text(function() {
                return d.tag + "(x:" + xValue(d) + ", y:" + yValue(d) + ",weight:" + circleRadius(d)*12 +")";
            });
    }

    function handleMouseOut(d,i){
        d3.select(this)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('r', circleRadius);

        d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();
    }

    function updateChart() {
        var newX = d3.event.transform.rescaleX(xScale);
        var newY = d3.event.transform.rescaleY(yScale);

        xAxisG.call(d3.axisBottom(newX));
        yAxisG.call(d3.axisLeft(newY));

        scatter
            .selectAll("circle")
            .attr('cx', function(d) {return newX(xValue(d))})
            .attr('cy', function(d) {return newY(yValue(d))});
    }
};

d3.csv('tagdata.csv')
    .then(data => {
        data.forEach(d => {
            d.tagcount = +d.tagcount;
            d.votescount = +d.votescount;
            d.tagweight = +d.tagweight;
            d.price = +d.price;
            d.userscore = +d.userscore;
            d.owners = +d.owners;
            d.playtime = +d.playtime;
        });
        render(data);
});
