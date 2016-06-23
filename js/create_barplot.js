//D3 code for baseball Visualization

// Defining margins as in  http://bl.ocks.org/mbostock/3019563
var margin = {top: 20, right: 10, bottom:20, left:100};

var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // Main svg
    var chart = d3.select("#hand-barplot").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height+margin.top+margin.bottom)
          .attr("class", "barplot")
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function draw_bar_plot(data){
//Sumarise count per handedness
  var count_handedness = d3.nest()
        .key(function(d){
          return d.handedness;
        })
        .rollup(function(leaves) {return {"count": leaves.length,
                                          "percentage": leaves.length/data.length*100};})
        .entries(data);

  var x = d3.scale.ordinal()
          .domain(["R", "L", "B"])
          .rangeBands([0, width], 0.1);


  var y = d3.scale.linear()
            .domain([0, d3.max(count_handedness, function(d) {return d.values.count;})])
            .range([height, 0]);

  var y_pct = d3.scale.linear()
                .domain([0, 100])
                .range([height, 0]);



  //Add axis
  var hand_axis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(function(value){//replace RLB with longer labels
      new_labels = {"R": "Right-handed Players",
                    "L": "Left-handed Players",
                    "B": "Ambidextrous Players"};
      return new_labels[value];
    });

  //the vertical axis starts in percentage
  var vertical_axis = d3.svg.axis()
    .scale(y_pct)
    .orient("left");

  chart.append("g")
    .attr("class", "hand axis")
    .attr("transform", "translate(0,"+ height+")")
    .call(hand_axis);

  chart.append("g")
    .attr("class", "vertical axis")
    //need to have extra horizontal
    //space to make room for the y axis labels
    .call(vertical_axis);

  //specifying bars - used https://bost.ocks.org/mike/bar/3/ as reference

  var bar = chart.selectAll(".bar")
        .data(count_handedness)
      .enter().append("rect")
      //put the bars across the x axis
        .attr("class", "bar")
        .attr("x", function(d){return x(d.key);})
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y_pct(d.values.percentage); })
        .attr("height", function(d) { return height - y_pct(d.values.percentage); });




  //Button to change count/percentage
  var button_pct = d3.select("#hand-barplot")
                .append("button")
                .attr("type", "button")
                .text("Show Count")
                .style("display", "block");

  function change_bars(what_to_show){
    //Changes the bars from count to percentage and vice versa
    var transition_time=1500;
    var new_scale;
    var new_text;
    switch(what_to_show){
      case "percentage":
        new_scale = y_pct;
        new_text = "Count";
        break;
      case "count":
        new_scale = y;
        new_text = "Percentage";
        break;
    }
    //Update bars
    chart.selectAll(".bar")
      .transition(transition_time)
      .attr("y", function(d) { return new_scale(d.values[what_to_show]); })
      .attr("height", function(d) { return height - new_scale(d.values[what_to_show]); });
    //Update scales
    d3.select(".vertical.axis")
      .transition(transition_time)
      .call(vertical_axis.scale(new_scale));
    //Update button labels
    button_pct
      .text("Show "+new_text);

  }

  //Tooltips: http://bl.ocks.org/mbostock/1087001
  var tooltip = d3.select("#hand-barplot").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")//TODO: move to CSS
      .style("pointer-events", "none")//TODO: move to CSS
      .style("display", "none");

  function mouseover(d){
    d3.select(this)
      .transition(500)
      .attr("fill", "red");
    tooltip
      .html("Count: "+d.values.count+
            " players.<br>Percentage: "+
            d.values.percentage.toFixed(1)+" %")
      .style("display", "inline");
    }

  function mouseout(d){
    d3.select(this)
      .transition(500)
      .attr("fill", "black");
    tooltip
      .style("display", "none");
  }

  function mousemove(d){
    tooltip
      .style("left", (d3.event.pageX + 20) + "px")
      .style("top", (d3.event.pageY - 40) + "px");
  }
  //Bar hover effect
  chart.selectAll(".bar")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("mousemove", mousemove);

//Button to switch between percentage and counts
button_pct.on("click", function(){
  if(button_pct.text() == "Show Percentage"){
    change_bars("percentage");
  }else {
    change_bars("count");
  }});
}//end of draw function
