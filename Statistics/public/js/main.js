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
                }
            });

})();