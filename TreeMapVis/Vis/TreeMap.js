const width = window.innerWidth;
const height = window.innerHeight;

const animationSpeed = 500;

var color = d3.scaleSequential([8, 0], d3.interpolateMagma);

function treemap(data) {
    return d3.treemap()
             .size([width, height])
             .paddingOuter(5)
             .paddingTop(25)
             .paddingInner(2)
             .round(true)
             (d3.hierarchy(data)
                .sum(function(d){
                    return d.value;
                })
                .sort(function(a, b) { 
                    return b.value - a.value; 
                })
             );
}

function randomId() {
    return 'xxxxxxx-zhouzl-xxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    });
}

function zoomin(path, root) {
    const name = path.split('.').splice(-1)[0];
    const normalizedPath = path.split('.')
                               .slice(1)
                               .join('.');

    const treemapData = normalizedPath.split('.').reduce(
        function(obj, path) {
            let returnObject;
        
            obj.forEach(
                function(node) {
                    if (node.name === path) {
                        returnObject = node.children;
                    }
                }
            );
        
            return returnObject;
        },
    root.children);

    render({
        name,
        children: treemapData
    });
}

function getPath(element, separator) {
    return element.ancestors().reverse().map(
        function(elem) {
            return elem.data.name;
        }
    ).join(separator);
}

function render(data) {
    const root = treemap(data);
    
    const svg    = d3.select('.treemap');
    const newSvg = d3.select('.temp')
                     .attr('viewBox', [0, 0, width, height]);

    // Create shadow
    newSvg.append('filter')
          .attr('id', 'shadow')
          .append('feDropShadow')
          .attr('flood-opacity', 0.5)
          .attr('dx', 0)
          .attr('dy', 0)
          .attr('stdDeviation', 2);

    // Create node
    const node = newSvg.selectAll('g')
                       .data(d3.group(root, function(d) {
                           return d.height;
                        }))
                       .join('g')
                       .attr('filter', 'url(#shadow)')
                       .selectAll('g')
                       .data(function(d) {
                           return d[1];
                        })
                       .join('g')
                       .attr('transform', function(d) {
                           return 'translate(' + d.x0 + ',' + d.y0 + ')'
                        });
    
    // Create title
    node.append('title')
        .text(function(d) {
            const icon = d.children ?  '🗂️' : '📋';
            d.path = getPath(d, '.');
            return icon + getPath(d, '/') + '\n' + d.value;
        });

    // Create rectangle
    node.append('rect')
        .attr('id', function(d) {
            return  d.nodeId = randomId();
        })
        .attr('fill', function(d) {
            return  color(d.height);
        })
        .attr('width', function(d) {
            return  d.x1 - d.x0;
        })
        .attr('height', function(d) {
            return d.y1 - d.y0;
        });

    // Create clip path for text
    node.append('clipPath')
        .attr('id', function(d) {
            return d.clipId = randomId();
        })
        .append('use')
        .attr('href', function(d) {
            return '#' + d.nodeId;
        });
    
    // Create labels
    node.append('text')
        .attr('clip-path', function(d) {
            return 'url(#' + d.clipId + ')';
        })
        .selectAll('tspan')
        .data(function(d) {
            return [d.data.name, d.value];
        })
        .join('tspan')
        .attr('fill-opacity', function(d, i, nodes) {
            return i === nodes.length - 1 ? 0.75 : null;
        })
        .text(function(d) {
            return d;
        });
    
    // Set position for parents
    node.filter(function(d) {
            return d.children;
        })
        .selectAll('tspan')
        .attr('dx', 5)
        .attr('y', 15);
    
    // Set position for everything else that doesn't have children
    node.filter(function(d) {
            return !d.children;
        })
        .selectAll('tspan')
        .attr('x', 3)
        .attr('y', function(d, i, nodes) {
            return i === nodes.length - 1 ? 30 : 15;
        } )

    // Add click event
    node.filter(function(d) { 
            return d.children && d !== root;
        })
        .attr('cursor', 'pointer')
        .on('click', function(e, d) { 
            return zoomin(d.path, data);
        });

    // Fade out old svg
    svg.transition()
    // .ease(d3.easeCubicIn)
       .duration(animationSpeed)
       .attrTween('opacity', function() {
           return d3.interpolate(1, 0);
        })

    // Fade in new svg
    newSvg.transition()
    // .ease(d3.easeCubicOut)
          .duration(animationSpeed)
          .attrTween('opacity', function() { 
              return d3.interpolate(0, 1);
            })
          .attr('class', 'treemap')
          .on('end', function() {
              // At the very end, swap classes and remove everything from the temporary svg
              svg.attr('class', 'temp').selectAll('*').remove();
          });
}

// overview
render(dataset);

// zoom out
d3.select('button').on('click', function(){
    // overview
    render(dataset);
});
