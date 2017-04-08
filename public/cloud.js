function wordCloud(selector) {
  var width = $(window).width() - 20;
  var height = $(window).height() - 125;
  var fill = d3.scale.category20b();
  var svg = d3.select(selector).append("svg")
              .attr("width", width)
              .attr("height", height)
              .append("g")
              .attr("transform", "translate("+width/2+","+height/2+")");

  function draw(words) {
    //Use the 'text' attribute (the word itself) to identity unique elements.
    var cloud = svg.selectAll("g text")
                    .data(words, function(d) { return d.text; })

    //Entering words
    cloud.enter()
          .append("text")
          .style("font-family", "Impact")
          .style("fill", function(d, i) { return fill(i); })
          .attr("text-anchor", "middle")
          .attr('font-size', 2)
          .text(function(d) { return d.text; });

    //Entering and existing words
    cloud.transition()
          .duration(600)
          .style("font-size", function(d) { return d.size + "px"; })
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .style("fill-opacity", 1);

    //Exiting words
    cloud.exit()
          .transition()
          .duration(200)
          .style('fill-opacity', 1e-6)
          .attr('font-size', 1)
          .remove();
  }

  return {
      //Recompute the word cloud for a new set of words. This method will
      // asynchronously call draw when the layout has been computed.
      update: function(words) {
          d3.layout.cloud().size([width, height])
              .words(words)
              .padding(2)
              .rotate(function(d) { return d.rotation; })
              //.rotate(function(d) { return ~~(Math.random() * 5) * 30 - 60; })
              .font("Impact")
              .fontSize(function(d) { return d.size; })
              .on("end", draw)
              .start();
      }
  }

}
