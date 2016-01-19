


var draw = (function(data) {

    function LightenDarkenColor(col, amt) {

        var usePound = false;

        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }

        var num = parseInt(col,16);

        var r = (num >> 16) + amt;

        if (r > 255) r = 255;
        else if  (r < 0) r = 0;

        var b = ((num >> 8) & 0x00FF) + amt;

        if (b > 255) b = 255;
        else if  (b < 0) b = 0;

        var g = (num & 0x0000FF) + amt;

        if (g > 255) g = 255;
        else if (g < 0) g = 0;

        return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
    }

    var margin = {top: 40, right: 10, bottom: 0, left: 0};
    var w = 1000,
        h = 500;
    var datafull = JSON.parse(data.top);
    var dataset = Array.prototype.slice.call(datafull, 0, 3);
    var $total = $('.total');
    var total = data.total;
    $total.append("Всего сообщений: <strong>" + total + "</strong>");
    var y = d3.scale.linear()
        .domain([1, d3.max(dataset, function (d) {
            return d[1]
        })])
        .range([10, h]);
    var x = d3.scale.ordinal().domain(dataset).rangeRoundBands([0, w], .7, .2);

    var tip = d3.tip()
        .attr('class', 'stats-tip')
        .offset([28, 0])
        .html(function (d) {
            return d[1];
        });

    var topSvg = d3.select(".draw-top").select('svg')
        .attr('height', h - margin.top)
        .attr('width', w)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    topSvg.call(tip);

    var gradient = topSvg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .selectAll("stop")
        .data([
            {offset: "0%", color: "#7EC7E7"},
            {offset: "50%", color: "#7EC7E7"},
        ])
        .enter().append("stop")
        .attr("offset", function (d) {
            return d.offset;
        })
        .attr("stop-color", function (d) {
            return d.color;
        });


    topSvg.selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .attr("x", function (d, i) {
            //return i * (w / dataset.length);
            return x(d);
        })
        .attr('fill', '#7EC7E7')
        .attr("stroke", "#DDEEF5")
        .attr("stroke-width", 15)
        .attr("y", function (d, i) {
            return h - y(d[1]);
        })
        .attr("width", function (d) {
            return x.rangeBand();
        })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .attr("opacity", function (d, i) {
            return 0;
        })
        .transition()
        .duration(1000)
        .delay(100)
        .attr("opacity", 1)
        .attr("height", function (d, i) {
            return y(d[1]);
        });


    topSvg.selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .text(function (d, i) {
            return d[0]
        })
        .attr('fill', '#327796')
        .attr('text-anchor', 'end')
        .attr('startOffset', '100%')
        .attr('x', function (d, i) {
            return x(d);
        })
        .attr('y', function (d, i) {
            return h - y(d[1]) - 20;
        });


//Let's draw a circle diagram(pie)
    var yb_tip = d3.tip().attr('class', 'stats-tip')
        .offset([28, 0])
        .html(function (d) {
            return d.data[1];
        });

    var radius = Math.min(w, h) / 2;
    var color = d3.scale.ordinal().range(["#3498db", "#e74c3c", "#f1c40f", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
    var arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);
    var labelArc = d3.svg.arc().outerRadius(radius - 60).innerRadius(radius - 40);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d[1];
        });


    var youtubeDiagram = d3.select('.youtube-diagram')
        .attr('height', h)
        .attr('width', w)
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");
    youtubeDiagram.call(yb_tip);
    var youtube_top = Array.prototype.slice.call(JSON.parse(data.common_videos), 0, 3);
    var yb_g = youtubeDiagram.selectAll(".yb-arc")
        .data(pie(youtube_top))
        .enter()
        .append('g')
        .attr("class", "yb-arc");
    yb_g.append("path")
        .attr("d", arc)
        .style("fill", function (d) {
            return color(d.data[0]);
        })
        .on("mouseover", function (d) {
            yb_tip.show(d);
            var clr = LightenDarkenColor(color(d.data[0]), 20);
            d3.select(this).style("fill", clr);
        })
        .on("mouseout", function (d) {
            yb_tip.hide(d);
            d3.select(this).style("fill", color(d.data[0]));
        });
    yb_g.append("text")
        .style("fill", "#2c3e50")
        .attr("transform", function (d) {
            return "translate(" + labelArc.centroid(d) + ")";
        })
        .on("click", function (d) {
            window.open("http://youtube.com/watch?v=" + d.data[0], "_target");
        })
        .attr("dy", ".35em")
        .text(function (d) {
            return d.data[0];
        });

    function to_array(dict) {
        var result = [];
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                var temp = [];
                Array.prototype.push.apply(temp, [key, dict[key]]);
                result.push(temp);
            }
        }
        return result;
    }

    (function () {


        //function time_format(d) {
        //    var hours = format_two_digits(d.getHours());
        //    var minutes = format_two_digits(d.getMinutes());
        //    return hours + ":" + minutes;
        //}
        //
        //function format_two_digits(n) {
        //    return n < 10 ? '0' + n : n;
        //}


        var today = new Date();
        var DATES = {
            'NIGHT': 'Ночь',
            'EVENING': 'Вечер',
            'EARLIER_MORNING': 'Раннее утро',
            'NOON': 'Полдень',
            'AFTERNOON': 'После полудня',
            'MORNING': 'Утро'
        };


        var margin = {top: 20, right: 30, bottom: 30, left: 70},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;


        var activity = to_array(JSON.parse(data.activity));
        var _data = activity.map(function (item) {
            return item[1];
        });
        _data.push(["Раннее утро", _data[0][1]]);


        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function (d, i) {
                return _data[i][0];
            });

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");


        var line = d3.svg.line()
            .x(function (d, i) {
                return x(i);
            })
            .y(function (d) {
                return y(d[1]);
            });

        var svg = d3.select(".activity-diagram")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom + 40)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        //activity.sort(function(a, b){
        //    return a - b;
        //});
        var tooltip = d3.select("body")
            .append("div")
            .attr('class', 'stats-tip')
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .text("a simple tooltip");

        x.domain(d3.range(0, _data.length));

        y.domain(d3.extent(_data, function (d) {
            return d[1];
        }));

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Сообщения");

        svg.append("path")
            .datum(_data)
            .attr("class", "line")
            .attr("d", line);
        svg.selectAll("circle")
            .data(_data).enter().append("circle")
            .attr("cx", function (d, i) {
                console.log(x(i));
                return x(i);
            })
            .attr("cy", function (d) {
                return y(d[1])
            })
            .attr("fill", "#8e44ad").attr("r", 6)
            .on("mouseover", function (d) {
                tooltip.text(d[1]);
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function () {
                return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", function () {
                return tooltip.style("visibility", "hidden");
            });
    })(data);
});


