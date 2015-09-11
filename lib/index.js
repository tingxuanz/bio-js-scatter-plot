/*
 * biojs-vis-rohart-msc-test
 * https://github.com/rowlandm/biojs-vis-rohart-msc-test
 *
 * Copyright (c) 2014 rowlandm
 * Licensed under the Apache 2 license.
 */

/**
@class biojsvisrohartmsctest
 */
/*
    Copyright 2015 Rowland Mosbergen

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.




    This is a standalone unit to call when you want to create a graph
    similar to the msc signature graphs that Florian Rohart developed.

    For an example: see https://github.com/rowlandm/biojs-vis-rohart-msc-test/blob/master/examples/simple.js

        var options = {
            background_colour: "white",
            background_stroke_colour:  "black",
            background_stroke_width:  "1px",
            circle_radius:5,  // for the scatter points
            data: data,
            data_columns_for_colour: ["MSC_calls","total_subsamplings"], //d.MSC_calls
            domain_colours : ["#FFFFFF","#7f3f98"],
            error_bar_width:10, 
            height: 1020,
            horizontal_line_value_column: 'value',
            horizontal_lines: horizontal_lines,  // this gets turned into an array of objects
            legend_class: "legend",
            legend_range: [0,100],
            margin:{top: 180, right: 120, bottom: 530, left: 200},
            sample_type_order: "BM MSC,BM erythropoietic cells CD235A+,BM granulopoietic cells CD11B+,BM hematopoietic cells CD45+,Developing cortex neural progenitor cells,Ventral midbrain neural progenitor cells,Olfactory lamina propria derived stem cells",
            show_horizontal_line_labels: true,
            subtitle1: subtitle1,
            subtitle2: subtitle2,
            target: target,
            title: title,
            title_class: "title",
            tooltip: tooltip, // using d3-tips
            unique_id: "chip_id",
            watermark:"http://www1.stemformatics.org/img/logo.gif",
            width:width, // suggest 50 per sample
            x_axis_text_angle:-45, 
            x_axis_title: "Samples",
            x_column:'Replicate_Group_ID',
            x_middle_title: 325,
            y_axis_title: "Rohart Score",
            y_column:'prediction' // d.prediction
        }

        var instance = new app(options);
 */   


/**
 * Private Methods
 */

/*
 * Public Methods
 */

/**
 * Method responsible to say Hello
 *
 * @example
 *
 *     biojsvisrohartmsctest.hello('biojs');
 *
 * @method hello
 * @param {String} name Name of a person
 * @return {String} Returns hello name
 */

/*
biojsvisrohartmsctest.hello = function (name) {

  return 'new hello ' + name;
};

module.exports = biojsvisrohartmsctest = function(opts){
  this.el = opts.el;
  this.el.textContent = biojsvisrohartmsctest.hello(opts.text);
};

*/
var  biojsvisrohartmsctest;

module.exports = biojsvisrohartmsctest = function(init_options)
{

    /* this is just to define the options as defaults: added numberFormat*/
    this.default_options = function(){

        var options = {
            target: "#graph",
            unique_id: "Sample_ID",
            margin:{top: 80, right: 0, bottom: 30, left: 0},
            height: 1500,
            width: 1060,
           // horizontal_lines: {"DT", "MED"},
            x_axis_title: "Samples",
            y_axis_title: "Log2 Expression"
        }
        return options;
        
    } // end this.defaultOptions

    // Derived from http://bl.ocks.org/mbostock/7555321
    this.d3_wrap = function (text, width) {
      text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            x = text.attr("x"), // set x to be x, not 0 as in the example
            dy = parseFloat(text.attr("dy")); // no dy
            // added this in as sometimes dy is not used
            if (isNaN(dy)){
                dy =0;
            } else {
                dy = dy;
            }
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            new_dy =++lineNumber * lineHeight + dy; // added this in as well
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", new_dy+ "em").text(word).attr('text-anchor','middle');
          }
        }
      });
    } // end d3_wrap


    // setup margins in a different function
    this.setup_margins = function(graph){
        options = graph.options;
        page_options.margin = options.margin;
        page_options.width = options.width;
        page_options.width_whole = options.width - page_options.margin.left - page_options.margin.right; // -150 makes it fit the graph nicely
        page_options.height = options.height - page_options.margin.top - page_options.margin.bottom;

        graph.page_options = page_options;
        return graph;

    } // end this.setup_margins
    //setting up the line to append for each of the values (i.e. line between scatter points)
   this.setup_line = function(graph){
       
        scatter_line = d3.svg.line()
            .x(function(d,i) { return scaleX(d[options.x_column]);})
            .y(function(d) { return scaleY(d.Expression_Value);});

         svg.append("path")
            .attr("class", "line")
            .attr("d", scatter_line(options.data));
        graph.svg = svg;
        return graph;   
    
    }
    // we are trying to take into account not just the data but the lines as well
    // and we are taking into account that we want to be able to see 0 too
    this.return_y_min_max_values = function(graph){
        options = graph.options;
        max_val = 1;
        min_val = 0;
        // this is very specific for MSC Test graph

        lwr_min_max_values_from_data = d3.extent(options.data, 
            function(d) {   // this will go through each row of the options.data
                            // and provide a way to access the values 
                // you want to check that we use the highest and lowest values of the lines and at least stop at 0
                lwr = (d.Expression_Value - d.Standard_Deviation);
                temp = lwr; // this will get the y_column (usually prediction) from the row
                // have to take into account lwr and upr
                if(lwr < min_val){
                    min_val = lwr;
                }
                return temp; 
            }
        );

        // do the same for upr
        upr_min_max_values_from_data = d3.extent(options.data, 
            function(d) {
                upr = (d.Standard_Deviation + d.Expression_Value);
                temp = upr;
                if(upr > max_val){
                    max_val = upr;
                }
                return temp; 
            }
        );


        min = lwr_min_max_values_from_data[0];

        max = upr_min_max_values_from_data[1];

        // set minimum to 0 if the minimum is a positive number
        // this means that the minimum number is at least 0
        // a negative number will be the only way to drop below 0
        if (min > 0) { min = 0; }

        // similarly, if the max number from the data is -ve
        // at least show 0
        if (max < 1) { max = 1; } 
        for (key in options.horizontal_lines){
            value = options.horizontal_lines[key];
            if (value > max){ max = value }
            if (value < min){ min = value }
        }
        graph.max_val = max_val;
        graph.min_val = min_val; 
        graph.force_domain =[min,max]; 
        return graph;
    }

    this.setup_y_axis = function(graph){
        svg = graph.svg;
        max = graph.max_val;
        // ########################################## Setup Y axis labels ###################################3
        /*
            For the y axis, the scale is linear, so we create a variable called y that we can use later
            to scale and do other things. in some people call it yScale
            https://github.com/mbostock/d3/wiki/Quantitative-Scales
            The range is the range of the graph from the height to 0. This is true for all y axes
        */
        var scaleY = d3.scale.linear()
            .range([page_options.height, 0]);

        // setup the yaxis. this is later called when appending as a group .append("g")
        // Note that it uses the y to work out what it should output

      var yAxis = d3.svg.axis() 
                    .scale(scaleY)
                    .orient("left")
                    //sets the number of points to increment by 1 whole number. To change see options.increment
                    .ticks(options.increment);

        y_column = options.y_column;
        // d3.extent returns the max and min values of the array using natural order
        // we are trying to take into account not just the data but the lines as well
        graph = this.return_y_min_max_values(graph);
        scaleY.domain(graph.force_domain).nice();
        y_axis_legend_y = (graph.full_height - options.margin.top - options.margin.bottom)/2;
        
        /*Adding the title to the Y-axis: stored in options.y_axis_title: information from
        ** http://bl.ocks.org/dougdowson/8a43c7a7e5407e47afed*/         
        svg.append("text")
          .text(options.y_axis_title)
          .attr("text-anchor", "middle")
          .style("font-family", "Arial")
          .style("font-size", "20px")
          .attr("transform", "rotate(-90)")
          .style("text-anchor", "middle")
          .attr("x", -y_axis_legend_y)
          .attr("y", -50); //specifies how far away it is from the axis

        svg.append("g")
            .attr("class", "grid") 
            .call(yAxis //implementing the y axis as an axis
                .tickSize(-page_options.width, 100, 0)
            );

        graph.svg = svg;
        graph.scaleY = scaleY;
        graph.yAxis = yAxis;
        return graph;
    } // end this.setup_y_axis

    /*
    This includes:
    - returning vertical_lines which is the basis for calculating the vertical lines that
    separate the sample types.
    - returning the sample_id_list that allows the scaleX.domain(sample_id_list) call to 
    create the values for the x values of the samples for ordinal values 
    - also want to store the starting sample_id of a sample type as well so that we can 
    calculate the middle of the sample types to display just the sample type
    */
    this.setup_data_for_x_axis = function(graph){
        options = graph.options;
    
        sample_type_order = options.sample_type_order.split(',');
        nested_values = d3.nest()
            .key(function(d){ return d.Sample_Type })
            .sortKeys(function(a,b){return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);})
            .entries(options.data);
        
        sample_id_list = new Array();
        sample_type_list = new Array();//stores the two sample types
        vertical_lines = new Array(); // new object
        horizontal_lines = new Array();
        vert_count = 0;
        type_count = 0;//calculates the number of sample types
        count = 0;        
        for (temp_count in nested_values){
            row = nested_values[temp_count];
            key = row.key;
            values = row.values; 
            for (count_row in values){
                sample = values[count_row];
                sample_id = sample.Sample_ID; //(changed here from replicate group)
                sample_type = sample.Sample_Type;
                //This checks for multiple id's, count contains how many samples there are
                //Ensures the x axis lables and the vertical lines are correct
                if($.inArray(sample_id, sample_id_list) == -1) {
                    sample_id_list.push(sample_id);
                    count ++;
                }
        
            }   
            temp = {};
            temp['sample_type'] = key;
            temp['start_sample_id'] = values[0].Sample_ID;
            temp['end_sample_id'] = sample_id;
            vertical_lines.push(temp);
            vert_count++;
        }
        horizontal_lines.push("DT");
        horizontal_lines.push("MED");
        graph.horizontal_lines = horizontal_lines;
        graph.type_count = type_count;
        graph.vertical_lines = vertical_lines;
        graph.sample_id_list = sample_id_list;
        return graph;
    } // setup_data_for_x_axis



    this.setup_x_axis = function (graph){
        // ########################################## Setup X axis labels ###################################3
        page_options = graph.page_options;
        svg = graph.svg;
        options = graph.options;
        sample_id_list = graph.sample_id_list;

        // http://bost.ocks.org/mike/bar/3/
        // because we have samples along the bottom we use ordinal instead of linear
        // we also use rangeRoundBands as it gives us some flexibility
        // see here for more: https://github.com/mbostock/d3/wiki/Ordinal-Scales
        var scaleX = d3.scale.ordinal()
            .rangeRoundBands([0, page_options.width],0.4); // note that 0.4 was chosen by iterative fiddling

        /*
        http://stackoverflow.com/questions/15713955/d3-ordinal-x-axis-change-label-order-and-shift-data-position
        The order of values for ordinal scales is the order in which you give them to .domain(). 
        That is, simply pass the order you want to .domain() and it should just work.

        */
        scaleX.domain(sample_id_list);
        // setup the xaxis. this is later called when appending as a group .append("g")
        // Note that it uses the x to work out what it should output
        var xAxis = d3.svg.axis()
            .scale(scaleX)
            .tickSize(0)
            .orient("bottom");

        font_size = "0px"; // set this to 0 if you don't want sample_id as the labels on the x axis
        svg.append("g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + page_options.height + ")")
            .call(xAxis)// this is actually implementing the xAxis as an axis itself
        .selectAll("text")  // text for the xaxes - remember they are on a slant 
            .attr("dx", "-2em") // when rotating the text and the size
            .style("font-size", font_size)
            .style("text-anchor", "end")
            .attr("dy", "-0.1em")
            .attr("transform", function(d) {
                return "rotate(-65)" // this is rotating the text 
                })
        .append("text") // main x axis title
            .attr("class", "label")
            .attr("x", page_options.width)
            .attr("y", +24)
            .style("text-anchor", "end")
            .text(options.x_axis_title);

        graph.nested_values = nested_values;
        graph.sample_id_list = sample_id_list;
        graph.vertical_lines = vertical_lines;
        graph.svg = svg;
        graph.scaleX = scaleX;

        graph = this.setup_x_axis_using_sample_types(graph);

        return graph ;
    } //end this.setup_x_axis


    // This is to make the sample types replace the sample ids
    this.setup_x_axis_using_sample_types = function (graph){
        svg = graph.svg;
        scaleX = graph.scaleX;
        vertical_lines = graph.vertical_lines;
        calculate_x_value_of_sample_types = this.calculate_x_value_of_sample_types;
        page_options = graph.page_options;
        options = graph.options;

        svg.selectAll(".sample_type_text")  // text for the xaxes - remember they are on a slant 
            .data(vertical_lines).enter()
            .append("text") // when rotating the text and the size
           .text(
                function(d){
                    temp = d.sample_type;
                    return temp;
                }
            )
            .attr("class", "x_axis_diagonal_labels")
            .style("text-anchor", "end") 
            // Even though we are rotating the text and using the cx and the cy, we need to 
            // specify the original y and x  
            .attr("y", page_options.height + 60)
            .attr("x", 
                function(d){
                   avg = calculate_x_value_of_sample_types(d,sample_id_list,scaleX);
                   return avg; 
                }
            ) // when rotating the text and the size
             .attr("transform", 
                // combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
                // and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
                // basically, you just have to specify the angle of the rotation and you have
                // additional cx and cy points that you can use as the origin.
                // therefore you make cx and cy your actual points on the graph as if it was 0 angle change
                // you still need to make the y and x set as above
                function(d, i) {
                    // actual x value if there was no rotation
                    x_value = calculate_x_value_of_sample_types(d,sample_id_list,scaleX);
                    // actual y value if there was no rotation
                    y_value = page_options.height+60;
                    return "rotate("+options.x_axis_text_angle+","+x_value+","+y_value+")";
                }
            );
    


        graph.svg = svg;
        return graph;
    } // setup_x_axis_using_sample_types

    this.calculate_x_value_of_sample_types = function(d,sample_id_list,scaleX){
        // To get the difference, we need the sample ids to allow 
        // d3 to calculate the x axis

        var start_temp= scaleX(d.start_sample_id); 
        var end_temp = scaleX(d.end_sample_id); 
        var avg = (start_temp + end_temp)/2;
        return avg; 

    } // calculate_x_value_of_sample_types


    this.calculate_x_value_of_vertical_lines = function(d,sample_id_list,scaleX){
        // To get the difference, we need the sample ids to allow 
        // d3 to calculate the x axis
        this_sample_index = sample_id_list.indexOf(d.end_sample_id)
        next_sample_id = sample_id_list[this_sample_index +1];
        
        var temp = scaleX(d.end_sample_id); 
        var temp2 = scaleX(next_sample_id); 
        if (temp2 != undefined){
            var avg = (temp + temp2)/2;
        } else {
            var avg = 0;
        }
        return avg; 

    } // calculate_x_value_of_vertical_lines

    this.setup_vertical_lines = function(graph){
        svg = graph.svg;
        vertical_lines = graph.vertical_lines;
        sample_id_list = graph.sample_id_list;
        page_options = graph.page_options;
        calculate_x_value_of_vertical_lines = this.calculate_x_value_of_vertical_lines;
        
        svg.selectAll(".separator").data(vertical_lines).enter()
            .append("line")
            .attr("class", "separator") 
            .attr("x1", 
                function(d){
                   avg = calculate_x_value_of_vertical_lines(d,sample_id_list,scaleX);
                   return avg; 
                }
            ) 
            .attr("x2", 
                function(d){
                   avg = calculate_x_value_of_vertical_lines(d,sample_id_list,scaleX);
                   return avg; 
                }
            ) 
            .attr("y1", 
                function(d){
                    temp = 0;
                    return temp;
                }
            )
            .attr("y2", 
                function(d){
                    // this is to keep it within the graph
                    temp = page_options.height;
                    return temp;
                }
            )
            .attr("shape-rendering","crispEdges")
            .attr("stroke-width",options.line_stroke_width)
            .attr("opacity","0.2")
            .attr("stroke","black");

        graph.svg = svg;
        return graph;
    } // //setup_vertical_lines


    this.setup_error_bars = function (graph){
        svg = graph.svg;
        options = graph.options;
        page_options = graph.page_options;
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        tooltip = graph.options.tooltip;
        shape_rendering = "auto";
        stroke_width = options.stroke_width;//default stroke width
        dividor = options.error_dividor;
    
        /*  http://bost.ocks.org/mike/circles/ 
            This pattern is so common, you’ll often see the selectAll + data + enter + append methods called 
            sequentially, one immediately after the other. Despite it being common, keep in mind that this 
            is just one special case of a data join.
        */
        width = options.error_bar_width;
        
        svg.selectAll(".max").data(options.data).enter()
            .append("line") // append an object line
            .attr("class", "max") 
            .attr("x1", 
                function(d){
                        //Checks if the error is < 1% of the value (default - can be made more precise see options.error_dividor) 
                        //If it is it doesn't paint the bars (x part)
                        if(((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value/dividor)){
                           var temp = scaleX(d[options.x_column]);
                            return temp;

                        } else {
                            width = options.error_bar_width;
                            var temp = scaleX(d[options.x_column]) - width; 
                            return temp;
                        }
                }
            ) 
            .attr("x2", 
                function(d){
                       if(((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value/dividor)){
                            var temp = scaleX(d[options.x_column]);
                            return temp;
                        } else {
                            var temp = scaleX(d[options.x_column]) + width; 
                            return temp;
                        }
                }
            ) 
            .attr("y1", 
                function(d){
                    if(((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) > 0){
                        temp = scaleY(d.Expression_Value + d.Standard_Deviation);//upper value
                        return temp;
                    }else{
                        return 0;
                    }
                }
            )
            .attr("y2", 
                function(d){
                    if(((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) > 0){
                        temp = scaleY(d.Expression_Value + d.Standard_Deviation);//upper value
                        return temp;
                    } else {
                        return 0;
                    }
                }
            )
                .attr("shape-rendering",shape_rendering)
                .attr("stroke-width",stroke_width)
                .attr("stroke","black")
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide)
                .style("fill", 'none'); // color is black
            

        svg.selectAll(".min").data(options.data).enter()
            .append("line") // append an object line
            .attr("class", "min") 
            .attr("x1", 
                function(d){
                //Checks if the error is < 1% (default - can be made more precise see options.error_dividor) of the value
                // If it is it doesn't paint the bars (x part)
                   if(((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value/dividor)){
                        var temp = scaleX(d[options.x_column]);
                        return temp;
                    } else {
                        var temp = scaleX(d[options.x_column]) + width;
                        return temp;
                    }
                }
 
            ) 
            .attr("x2", 
                function(d){
                   if(((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value/dividor)){
                        var temp = scaleX(d[options.x_column]);
                        return temp;
                    } else {
                        var temp = scaleX(d[options.x_column]) - width;
                        return temp;
                    }
                }
 
            ) 
            .attr("y1", 
                function(d){
                    temp = scaleY(d.Expression_Value - d.Standard_Deviation);//lower value
                    return temp;
                }
            )
            .attr("y2", 
                function(d){
                    temp = scaleY(d.Expression_Value - d.Standard_Deviation);//lower value
                    return temp;
                }
            )
            .attr("shape-rendering",shape_rendering)
            .attr("stroke-width",stroke_width)
            .attr("stroke","black")
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide)
            .style("fill", 'none') ; // color is black


        svg.selectAll(".vertical").data(options.data).enter()
            .append("line") // append an object line
            .attr("class", "vertical") 
            .attr("x1", 
                function(d){
                    var temp = scaleX(d[options.x_column]); 
                    return temp;
                }
            ) 
            .attr("x2", 
                function(d){
                    var temp = scaleX(d[options.x_column]); 
                    return temp;
                }
            ) 
            .attr("y1", 
                function(d){
                    temp = scaleY(d.Expression_Value + d.Standard_Deviation);//
                    return temp;
                }
            )
            .attr("y2", 
                function(d){
                    temp = scaleY(d.Expression_Value - d.Standard_Deviation);
                    return temp;
                }
            )
            .attr("shape-rendering",shape_rendering)
            .attr("stroke-width",stroke_width)
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide)
            .attr("stroke-width","2px")
            .attr("stroke","black")
            .style("fill", 'none') ; // color is black

        graph.svg = svg;
        return graph;
    } // end setup_error_bars
    

    this.setup_scatter = function(graph){

        svg = graph.svg;
        options = graph.options;
        page_options = graph.page_options;
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        y_column = options.y_column;
        x_column = options.x_column;
        // ######################################## Setup points on the graph ####################################3
        /*  http://bost.ocks.org/mike/circles/ 
            This pattern is so common, you’ll often see the selectAll + data + enter + append methods called 
            sequentially, one immediately after the other. Despite it being common, keep in mind that this 
            is just one special case of a data join.
        */
        tooltip = options.tooltip;
        svg.call(tooltip);
        count = 0;
        attr_y = 0;
        t = 0;
        r = 0;
        //Chooses a colour for each probe
        var cValue = function(d) { return d.Probe;},
            color = d3.scale.category20();            

        svg.selectAll(".dot") // class of .dot
          .data(options.data) // use the options.data and connect it to the elements that have .dot css
        .enter() // this will create any new data points for anything that is missing.
            .append("circle") // append an object circle
            .attr("class", "dot") 
            .attr("r", options.circle_radius) //radius 3.5
            .attr("cx", function(d) { 
                // set the x position as based off x_column
                // ensure that you put these on separate lines to make it easier to troubleshoot
                var cx = scaleX(d[options.x_column]); 
                return cx; 
            })
            .attr("cy", function(d) { 
                // set the y position as based off y_column
                // ensure that you put these on separate lines to make it easier to troubleshoot
                var cy =  scaleY(d[options.y_column]);
                return cy;
            })
            .style("stroke","black")
            .style("stroke-width","1px")
            .style("fill", function(d) { return color(cValue(d));})
            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide);

          // draw legend from http://bl.ocks.org/weiglemc/6185069
    var legend = svg.selectAll(".legend")
          .data(color.domain())
        .enter().append("g")
          .attr("class", "legend")
        //  .attr("transform",  
          .style("text-anchor", "middle")
          .attr("x", -180)
          .attr("y", -50) //specifies how far away it is from the axis=
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
  // draw legend colored rectangles
        legend.append("rect")
          .attr("x", (function(d) {
                if(options.long_legend == 1){
                    while(count < options.probe_count){
                        if(count < 40){
                            count++;
                            temp = graph.full_width - 100 - options.probe_length/2 + 5;
                            return temp;
                        } else {
                            attr_y = 1;
                            count++;
                            return graph.full_width - 100 - options.margin.left + 5;
                        }
                    }
                }else{
                    return graph.full_width - options.margin.left - 100 + 5;
                }
                count = 0;
            }))
           .attr("y", (function(d) {
                if(attr_y == 1 && r > 40){
                    return -page_options.height;
                } else {
                    r++;
                    return 9;
                }
            }))
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

  // draw legend text
        legend.append("text")
         .attr("x", (function(d) {
                if(options.long_legend == 1){
                    while(count < options.probe_count){
                        if(count < 40){
                            count++;
                            temp = graph.full_width - 100 - options.probe_length/2;
                            return temp;
                        } else {
                            attr_y = 1;
                            count++;
                            return graph.full_width - 100 - options.margin.left;
                        }
                    }
                }else{
                    return graph.full_width - options.margin.left - 100;
                }
                count = 0;
            }))
          .attr("y", (function(d) {
                if(attr_y == 1 && t > 40){
                    return -page_options.height;
                } else {
                    t++;
                    return 9;
                }
            }))
          .attr("dy", ".35em")
          .style("text-anchor", "end")/* (function(d) {
                if(count < 40){
                    return "end";
                } else {
                    return "start";
                }
            })) */
          .text(function(d) { return d;});

        graph.svg = svg;
        return graph;
    }    // end of this.setup_scatter


//     This is to setup multiple horizontal lines with a label


    this.setup_horizontal_lines = function(graph){
       
        svg = graph.svg
        options = graph.options;
        width = page_options.width;
        lines = options.lines;
    //append the median line
        svg.append("line") // append an object line
            .attr("class", "lines")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", scaleY(options.med))
            .attr("y2", scaleY(options.med))
            .attr("shape-rendering","crispEdges")
            .attr("stroke-width",options.line_stroke_width)
            .attr("opacity","0.6")
            .attr("stroke",options.med_colour);
    //this is the top of the graph. It needs to be added separately otherwise the grid element overrides it
    //turning it grey
    svg.append("line") // append an object line
            .attr("class", "lines")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1",0)
            .attr("y2",0)
            .attr("shape-rendering","crispEdges")
            .attr("stroke-width",options.line_stroke_width)
            .attr("stroke","black");

   //append the DT line
        svg.append("line") // append an object line
            .attr("class", "lines") 
            .attr("x1", 0) 
            .attr("x2", width) 
            .attr("y1", scaleY(options.dt)) //dt position from options 
            .attr("y2", scaleY(options.dt)) 
            .attr("shape-rendering","crispEdges")
            .attr("stroke-width",options.line_stroke_width)
            .attr("opacity","0.6")
            .attr("stroke",options.dt_colour);

        graph.svg = svg;
        return graph; 
    } // end setup_horizontal_lines

    this.preprocess_lines = function(graph){
        horizontal_lines = graph.options.horizontal_lines;
        lines = Array();
        for (key in horizontal_lines){
            name = key;
            value = horizontal_lines[key];
            data_line = {'value':value,'name':name};
            lines.push(data_line);
        }  
                 
        graph.options.lines = lines;
 
        return graph;
    }   // end preprocess_lines

    this.setup_svg = function (graph){
        options = graph.options;
        page_options = graph.page_options;

        full_width = page_options.width+options.probe_length;
        full_height = options.height;

        graph.full_width = full_width;
        graph.full_height = full_height;
        background_stroke_width = options.background_stroke_width;
        background_stroke_colour = options.background_stroke_colour;

        // clear out html
        $(options.target)
            .html('')
            .css('width',full_width+'px')
            .css('height',full_height+'px');

        // setup the SVG. We do this inside the d3.tsv as we want to keep everything in the same place
        // and inside the d3.tsv we get the data ready to go (called options.data in here)
        var svg = d3.select(options.target).append("svg")
            .attr("width", full_width)
            .attr("height",full_height) 
        .append("g")
            // this is just to move the picture down to the right margin length
            .attr("transform", "translate(" + page_options.margin.left + "," + page_options.margin.top + ")");


        // this is to add a background color
        // from: http://stackoverflow.com/questions/20142951/how-to-set-the-background-color-of-a-d3-js-svg
        svg.append("rect")
            .attr("width", page_options.width)
            .attr("height", page_options.height)
            .attr("stroke-width", background_stroke_width)
            .attr("stroke", background_stroke_colour)
            .attr("fill", options.background_colour);

        // this is the Main Title
        // http://bl.ocks.org/mbostock/7555321
        height_margin = 20;
        height_divisor = 1.5;
        svg.append("text")
            .attr("x", page_options.width/2)//options.x_middle_title)             
            .attr("y", 0 - (page_options.margin.top /height_divisor)-height_margin) 
            .attr("text-anchor", "middle")  
            .text(options.title).attr("class",options.title_class)
           .style("font-family", "Arial")
            .style("font-size", "30px")
           .style("fill", "black")
            .attr("class",options.title_class);

        // this is the Sub Title
        svg.append("text")
            .attr("x", page_options.width/2)//ptions.x_middle_title)             
            .attr("y", 0 - (page_options.margin.top / height_divisor)+height_margin)
            .attr("text-anchor", "middle")  
            .text(options.subtitle1).attr("class",options.title_class+" subtitle1")
            .style("font-family", "Arial")
            .style("font-size", "20px")
           .style("fill", "black")
            .attr("class",options.title_class);


        svg.append("text")
            .attr("x", page_options.width/2)//options.x_middle_title)             
            .attr("y", 0 - (page_options.margin.top / height_divisor)+height_margin*3)
            .attr("text-anchor", "middle")  
            .text(options.subtitle2).attr("class",options.title_class+" subtitle2")
            .style("font-family", "Arial")
            .style("font-size", "20px")
            .style("fill", "black")
            .attr("class",options.title_class);


        max_width_of_text = 800;
        suggested_width_of_text = options.width*0.7;
        if (max_width_of_text < suggested_width_of_text){
            width_of_title = max_width_of_text;
        } else {
            width_of_title = suggested_width_of_text;
        }
        svg.selectAll("."+options.title_class)
            .call(this.d3_wrap,width_of_title); 


        graph.svg = svg;
        return graph;
    } // setup_svg

    this.setup_rohart_background_text = function(graph){
        options = graph.options;
        page_options = graph.page_options;
        svg = graph.svg;

        /*  WARNING: You can't use this twice!!!! 
            you will get wrong values. This is already set 
            in the setup_y_axis so this has to be used 
        var y = d3.scale.linear()
            .range([page_options.height, 0]);
        */
        scaleY = graph.scaleY;
        //Adding the Med and Dt titles just above the lines
        font_size = "20px";
        margin_y_value = 20;
        svg.append("text")
            .attr("x", margin_y_value)             
            .attr("y", scaleY(options.dt) - 10)
            .text("DT")
            .attr("text-anchor", "middle")  
            .style("font-family", "Arial")  
            .style("font-size", font_size)  
            .style("fill", options.dt_colour)  
            .attr("class",options.title_class);

        svg.append("text")
            .attr("x", margin_y_value + 10)             
            .attr("y", scaleY(options.med) - 10)
            .text("MED")
            .attr("text-anchor", "middle")  
            .style("font-family", "Arial")  
            .style("font-size", font_size)  
            .style("fill", options.med_colour)  
            .attr("class",options.title_class); 

        graph.svg = svg;
        return graph;
    } // setup_rohart_background_text

    /*  Setting up the watermark */
    this.setup_watermark = function(graph){
        svg = graph.svg;
        options = graph.options;

        svg.append("image")
            .attr("xlink:href",options.watermark)
            .attr("x", page_options.height/2 - 100)
            .attr("y", -(graph.full_width - options.margin.left)) // just out of the graphs edge
            .attr("transform", "rotate(+90)")
            .attr("width", 200)
            .attr("height", 100);

        graph.svg = svg;
        return graph;
    } // setup_watermark

    /*---------------------------------------------------------------------------------
    **Setting up the y axis label (d2 logarithmic) */


    /*  Setting up the graph including y and x axes */ 
    this.setup_graph = function(graph){

        // setup all the graph elements
        graph = this.setup_margins(graph);
        graph = this.setup_svg(graph);    
        graph = this.setup_y_axis(graph);
        graph = this.setup_data_for_x_axis(graph);
        graph = this.setup_x_axis(graph);
        graph = this.setup_error_bars(graph);
        graph = this.setup_scatter(graph);
        graph = this.setup_rohart_background_text(graph);
        graph = this.setup_horizontal_lines(graph);
        graph = this.setup_watermark(graph);
        graph = this.setup_vertical_lines(graph);
        graph = this.setup_line(graph);
        return graph;

    }  // end setup_graph  

    // run this right at the start of the initialisation of the class
    this.init = function(init_options){
        var options = this.default_options();
        options = init_options;
        page_options = {}; // was new Object() but jshint wanted me to change this
        var graph = {}; // this is a new object
        graph.options = options;

        graph = this.preprocess_lines(graph);
        graph = this.setup_graph(graph);
  //      graph = this.setup_legend(graph);

        var target = $(options.target);
        target.addClass('rohart_msc_graph');
    } 

    // constructor to run right at the start
    this.init(init_options);
}
