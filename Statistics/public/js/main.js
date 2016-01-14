(function(){
    function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
        var csrftoken = getCookie('csrftoken');

        function csrfSafeMethod(method) {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }

        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });

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

    $(document).on('click', '.update-button', function(){
        $.ajax({
            url: '',
            method: 'post',
            success: function(data){
                alert("Ok");
            }
        });
    });
    $.ajax({
        url: '/get-data/',
        method: 'post',
        success: function(data){
            var margin = {top: 40, right: 10, bottom: 0, left: 0};
            var w = 1000,
                h = 500;
            var datafull = JSON.parse(data.top);
            var dataset = Array.prototype.slice.call(datafull, 0, 3);
            var $total = $('.total');
            var total = data.total;
            $total.append("Всего сообщений: <strong>" + total + "</strong>");
            var y = d3.scale.linear()
                .domain([1, d3.max(dataset, function(d){ return d[1]})])
                .range([10, h]);
            var x = d3.scale.ordinal().domain(dataset).rangeRoundBands([0, w],.7,.2);

            var tip = d3.tip()
                .attr('class', 'stats-tip')
                .offset([28, 0])
                .html(function(d){
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
                      .attr("offset", function(d) { return d.offset; })
                      .attr("stop-color", function(d) { return d.color; });


            topSvg.selectAll('rect')
                .data(dataset)
                .enter()
                .append('rect')
                .attr("x", function(d, i){
                    //return i * (w / dataset.length);
                    return x(d);
                })
                .attr('fill', '#7EC7E7')
                .attr("stroke", "#DDEEF5")
                .attr("stroke-width", 15)
                .attr("y", function(d, i){
                    return h-y(d[1]);
                })
                .attr("width", function(d){
                    return x.rangeBand();
                })
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide)
                .attr("opacity", function(d, i){
                    return 0;
                })
                .transition()
                .duration(1000)
                .delay(100)
                .attr("opacity", 1)
                .attr("height", function(d, i){
                    return y(d[1]);
                });



            topSvg.selectAll("text")
                .data(dataset)
                .enter()
                .append("text")
                .text(function(d, i){
                    return d[0]
                })
                .attr('fill', '#327796')
                .attr('text-anchor', 'end')
                .attr('startOffset', '100%')
                .attr('x', function(d, i){
                    return x(d);
                })
                .attr('y', function(d, i){
                    return h-y(d[1]) - 20;
                });


            //Let's draw a circle diagram(pie)
            var radius = Math.min(w, h) / 2;
            var color = d3.scale.ordinal().range(["#3498db", "#e74c3c", "#f1c40f", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
            var arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);
            var labelArc = d3.svg.arc().outerRadius(radius - 60).innerRadius(radius - 40);

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) { return d[1]; });


            var youtubeDiagram = d3.select('.youtube-diagram')
                    .attr('height', h)
                    .attr('width', w)
                 .append("g")
                    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");
            var youtube_top = Array.prototype.slice.call(JSON.parse(data.common_videos), 0, 3);
            var yb_g = youtubeDiagram.selectAll(".yb-arc")
                .data(pie(youtube_top))
                .enter()
                .append('g')
                .attr("class", "yb-arc");
            yb_g.append("path")
                .attr("d", arc)
                .style("fill", function(d) { return color(d.data[0]); })
                .on("mouseover", function(d){
                    var clr = LightenDarkenColor(color(d.data[0]), 20);
                    d3.select(this).style("fill", clr);
                })
                .on("mouseout", function(d){
                    d3.select(this).style("fill", color(d.data[0]));
                });
            yb_g.append("text")
                .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
                .on("click", function(d){
                    window.open("http://youtube.com/watch?v=" + d.data[0], "_target");
                })
                .attr("dy", ".35em")
                .text(function(d) {return d.data[0]; });
        }


    });
})();