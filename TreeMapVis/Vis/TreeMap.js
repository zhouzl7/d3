const width = window.innerWidth;
const height = window.innerHeight;

// 颜色比例尺 1 用于全图
var color = d3.scaleSequential()
              .domain([-1, 8])
              .interpolator(d3.interpolateSpectral);

// 颜色比例尺 2 用于子图
var color_zoomin = d3.scaleSequential()
                     .domain([8, 0])
                     .interpolator(d3.interpolateMagma);

// 判断是否为全图
var is_overview = true
// 视图路径
var view_path = dataset.name;
// 布局算法
var layout_algorithm = d3.treemapResquarify

// treemap 数据绑定
function treemap(data) {
    return d3.treemap()
			 .tile(layout_algorithm)
             .size([width, height])
             .paddingOuter(5)
             .paddingTop(20)
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

// 随机id
function randomId() {
    return 'xxxxxxx-zhouzl-xxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
    });
}

// 拉近放大
function zoomin(path, root) {
    is_overview = false
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

// 获取继承信息（路径、省市县）
function getPath(element, separator) {
    return element.ancestors().reverse().map(
        function(elem) {
            return elem.data.name;
        }
    ).join(separator);
}

// 绘图
function render(data) {
    const root = treemap(data);
    
    const svg    = d3.select('.treemap');
    const newSvg = d3.select('.temp')
                     .attr('viewBox', [0, 0, width, height]);

    // 遮蔽
    newSvg.append('filter')
          .attr('id', 'shadow')
          .append('feDropShadow')
          .attr('flood-opacity', 0.5)
          .attr('dx', 0)
          .attr('dy', 0)
          .attr('stdDeviation', 2);

    // 树节点
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
    
    // 标题
    node.append('title')
        .text(function(d) {
            const icon = d.children ?  '🌳' : '🍂';
            d.path = getPath(d, '.');
            return icon + getPath(d, '/') + '\n' + d.value;
        });

    // 矩形
    node.append('rect')
        .attr('id', function(d) {
            return  d.nodeId = randomId();
        })
        .attr('fill', function(d) {
            return  is_overview ? color(d.depth) : color_zoomin(d.height);
        })
        .attr('width', function(d) {
            return  d.x1 - d.x0;
        })
        .attr('height', function(d) {
            return d.y1 - d.y0;
        })
        .on('mouseover', function (e, d) {
            d3.select(this)
              .attr('width', function(d){
                  let width = d.x1 - d.x0;
                  return width < 15 ? width * 2 : width;
              })
              .attr('height', function(d){
                  let height = d.y1 - d.y0;
                  return height < 15 ? height * 2 : height;
              })
              .attr('fill', "steelblue");
        })
        .on("mouseout", function(e, d){
            d3.select(this)
                .transition()
                .duration(500)
                .attr('width', d.x1 - d.x0)
                .attr('height', d.y1 - d.y0)
                .attr('fill', is_overview ? color(d.depth) : color_zoomin(d.height));
        });

    // 标签的 clip path
    node.append('clipPath')
        .attr('id', function(d) {
            return d.clipId = randomId();
        })
        .append('use')
        .attr('href', function(d) {
            return '#' + d.nodeId;
        });
    
    // 标签
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
    
    // 非叶子节点位置
    node.filter(function(d) {
            return d.children;
        })
        .selectAll('tspan')
        .attr('dx', 5)
        .attr('y', 15);
    
    // 叶子节点位置
    node.filter(function(d) {
            return !d.children;
        })
        .selectAll('tspan')
        .attr('x', 3)
        .attr('y', function(d, i, nodes) {
            return i === nodes.length - 1 ? 30 : 15;
        })

    // 点击非叶子节点，非根节点
    node.filter(function(d) { 
            return d.children && d !== root;
        })
        .attr('cursor', 'pointer')
        .on('click', function(e, d) {
            // 拉近放大
            let path_list = view_path.split('.');
            let child_path_list = d.path.split('.');
            path_list = path_list.slice(0, path_list.length-1).concat(child_path_list);
            view_path = path_list.join('.');
            return zoomin(d.path, data);
        });
    
    // 点击根节点
    node.filter(function(d) { 
        return d.children && d == root;
    })
    .attr('cursor', 'pointer')
    .on('click', function() {
        // 拉远缩小
        let path_list = view_path.split('.');
        view_path = is_overview ? view_path : path_list.slice(0, path_list.length-1).join('.');
        let father_dataset = dataset;
        is_overview = true;
        for(let i = 1; i < path_list.length - 1; i++){
            is_overview = false;
            for(let j = 0; j < father_dataset["children"].length; j++) {
                if(father_dataset["children"][j].name == path_list[i]){
                    father_dataset = father_dataset["children"][j];
                }
            }
        }
        return render(father_dataset);
    });

    // 旧图淡出
    svg.transition()
       .duration(2000)
       .attrTween('opacity', function() {
           return d3.interpolate(1, 0);
       })

    // 新图渐入
    newSvg.transition()
          .duration(2000)
          .attrTween('opacity', function() { 
              return d3.interpolate(0, 1);
          })
          .attr('class', 'treemap')
          .on('end', function() {
              svg.attr('class', 'temp').selectAll('*').remove();
          });
    
    // 切换布局算法
    d3.select('select').on('change', function () {
        layout_algorithm = d3[d3.select(this).property('value')];
        render(data);
    });
}

// 绘制全图
is_overview = true;
view_path = dataset.name;
render(dataset);

// 绘制全图
d3.select('button').on('click', function(){
    // 绘制全图
    is_overview = true;
    view_path = dataset.name;
    render(dataset);
});
