//画布大小
var width = 400;
var height = 400;

//在 body 里添加一个 SVG 画布   
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

//画布周边的空白
 var padding = {left:30, right:30, top:20, bottom:20};

var dataset = [ 30 , 10 , 43 , 55 , 13 ];

var pie = d3.layout.pie();

var piedata = pie(dataset);

var outerRadius = 150; //外半径
var innerRadius = 100; //内半径，为0则中间没有空白

var arc = d3.svg.arc()  //弧生成器
    .innerRadius(innerRadius)   //设置内半径
    .outerRadius(outerRadius);  //设置外半径

var arcs = svg.selectAll("g")
    .data(piedata)
    .enter()
    .append("g")
    .attr("transform","translate("+ (width/2) +","+ (width/2) +")");

var color = d3.scale.category10(); 

arcs.append("path")
    .attr("fill",function(d,i){
        return color(i);
    })
    .attr("d",function(d){
        return arc(d);   //调用弧生成器，得到路径值
    });

arcs.append("text")
    .attr("transform",function(d){
        return "translate(" + arc.centroid(d) + ")";
    })
    .attr("text-anchor","middle")
    .text(function(d){
        return d.data;
    });




