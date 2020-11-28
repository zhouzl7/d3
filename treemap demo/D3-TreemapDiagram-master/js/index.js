const padding = { left: 10, top: 10, right: 10, bottom: 20 }
const width = 1000;
const height = 500;

let legendContainer;
let container;

let data_storage = {
  kick: '',
  movie: '',
  video: ''
}

let fader = (color) => d3.interpolateRgb(color, "#fff")(0.2);
let color = d3.scaleOrdinal(d3.schemeCategory10.map(fader));

let tooltip_block = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

/* data fetching and formatting */
d3.queue()
  .defer(d3.json, 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json')
  .defer(d3.json, 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json')
  .defer(d3.json, 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json')
  .await(render_data);

function render_data(error, kick, movie, video, user_input) {
  if (error) {
    console.log(error);
  }
  if (data_storage.kick === '') {
    data_storage.kick = kick;
    data_storage.movie = movie;
    data_storage.video = video;
    render(data_storage.kick)
  } else {
    container.remove();
    legendContainer.remove();
    render(data_storage[user_input]);
  }

}
/* Data rendering */
function render(data) {
  /* Setting variable and default values */
  let titleName = "Kickstarter";
  let subtitle = "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category";

  switch (data.name) {
    case "Kickstarter":
      titleName = data.name;
      subtitle = "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category"
      break;
    case "Movies":
      titleName = data.name;
      subtitle = "Top 100 Highest Grossing Movies Grouped By Genre"
      break;
    case "Video Game Sales Data Top 100":
      titleName = "Video Games";
      subtitle = "Top 100 Most Sold Video Games Grouped by Platform"
      break;
  }
  document.querySelector("#title").innerHTML = titleName;
  document.querySelector("#subtitle").innerHTML = subtitle;

  container = d3.select('.graph').append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr("id", "description");

  let root = d3.hierarchy(data)
    .sum((d) => d.value)
    .sort(function (a, b) {
      return b.height - a.height
        || b.value - a.value;
    });

  let treemap = d3.treemap()
    .size([width, height])
    .paddingInner(1);

  treemap(root);

  let cell = container.selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr("transform", (d) => {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    });

  let tile = cell.append("rect")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("class", "tile")
    .attr("data-name","testing")
    .attr("data-category", "testing")
    .attr("data-value", "testing")
    .attr('fill', (d) => color(d.data.category))
    .on("mousemove", (d) => {
      tooltip_block.style("opacity", 0.9);
      tooltip_block.html(
        'Name: ' + d.data.name +
        '</br>Category: ' + d.data.category +
        '</br>Value: ' + d.data.value
      )
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
    })
    .on("mouseout", function (d) {
      tooltip_block.transition()
        .duration(150).style('opacity', 0);
    });

  const bodySelector = document.querySelector("body");
  const bodyStyles = window.getComputedStyle(bodySelector);
  const fontSize = bodyStyles.getPropertyValue("font-size").slice(0, -2);
  const fontPadding = 10;

  cell.append("text")
    .selectAll("tspan")
    .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter().append("tspan")
    .attr("x", fontPadding)
    .attr("y", (d, i) => fontSize * i + 10)
    .text(function (d) { return d; });

  var categories = root.leaves().map(function (nodes) {
    return nodes.data.category;
  });
  categories = categories.filter(function (category, index, self) {
    return self.indexOf(category) === index;
  })

  legendContainer = d3.select('#legend').append('svg')
    .attr('width', width)
    .attr('height', height / 4)


  let legend = legendContainer.append('g')
    .selectAll('g')
    .data(categories)
    .enter().append('g');

  legend.append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr("class","legend-item")
    .attr('x', (d, i) => position = (85) * i)
    .attr('y', 10)
    .attr('fill', (d) => color(d));

  legend.append('text')
    .attr('transform', 'translate(0, 10)')
    .attr('x', (d, i) => position = (85) * i)
    .attr('y', 25)
    .text((d => d))

}
