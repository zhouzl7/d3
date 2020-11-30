//画布大小
const width = window.innerWidth * 0.8;
const height = window.innerHeight;

//画布周边的空白
var padding = {left:60, right:60, top:60, bottom:60};  

//在 body 里添加一个 SVG 画布   
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);  

//标题
svg.append('text')
    .attr('x', width / 2 - padding.left*2)
    .attr('y', padding.top/2)
    .attr('class', 'title')
    .text('PCAScatterPlotVis');

//x轴的比例尺
var offset = 0.05
var xScale = d3.scale.linear()
.domain([d3.min(data_x) - offset, d3.max(data_x) + offset])
.range([0, width - padding.left - padding.right]);

//y轴的比例尺
var yScale = d3.scale.linear()
    .domain([d3.min(data_y) - offset, d3.max(data_y) + offset])
    .range([height - padding.top - padding.bottom, 0]);

//x 轴
var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

//y 轴
var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

//颜色比例尺
var color = d3.scale.category20();

//添加散点
var points = svg.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("r", 5)
    .style("fill",function(d,i){
        return color(d[2]);
    })
    .on('mouseover', function (d, i) {
        d3.select(this)
          .attr('r', 12);
        d3.select('img')
          .attr('src',d[3]);
        d3.select('textarea')
          .text(d[0] + "\n" + d[1] + "\n" + d[2] + "\n" + d[3]);
    })
    .on("mouseout",function(d,i){
        d3.select(this)
            .transition()
            .duration(500)
            .attr("r", 5);
    })
    .attr('cx', function (d, i) {
        return xScale(d[0] + offset/2);
    })
    .attr("cy",function(d, i){
        var min = yScale.domain()[0];
        return yScale(min - offset/2);
    })
    .transition()
    .delay(function(d,i){
        return i*2;
    })
    .duration(2000)
    .ease("bounce")
    .attr('cy', function (d, i) {
        return yScale(d[1] - offset);
    });
        

//添加x轴
svg.append("g")
  .attr("class","axis")
  .attr("transform","translate(" + padding.left + "," + (height - padding.bottom) + ")")
  .call(xAxis); 

//添加y轴
svg.append("g")
  .attr("class","axis")
  .attr("transform","translate(" + padding.left + "," + padding.top + ")")
  .call(yAxis);