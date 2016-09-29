/*
 * biojs-vis-scatter-plot
 * https://github.com/rowlandm/biojs-vis-rohart-msc-test
 *
 * Copyright (c) 2014 rowlandm
 * Licensed under the Apache 2 license.
 */

/* global svg, d3 */

/**
 @class biojsvisrohartmsctest
 */
/*
 Copyright 2015 Ariane Mora

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.


 This is a standalone unit to call when you want to create a scatter plot graph.

 */
var biojsvisscatterplot;
var test = require('./test.js');
module.exports = biojsvisscatterplot = function (init_options)
{

    /* this is just to define the options as defaults: added numberFormat*/
    default_options = function () {

        var options = {
            target: "#graph",
            unique_id: "Sample_ID",
            margin: {top: 80, right: 0, bottom: 30, left: 0},
            height: 1500,
            width: 1060,
            x_axis_title: "Samples",
            y_axis_title: "Log2 Expression"
        };
        return options;

    }; // end  defaultOptions

    // Derived from http://bl.ocks.org/mbostock/7555321
    d3_wrap = function (text, width) {
        text.each(function () {
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
            if (isNaN(dy)) {
                dy = 0;
            }
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word === words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    new_dy = ++lineNumber * lineHeight + dy; // added this in as well
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", new_dy + "em").text(word).attr('text-anchor', 'middle');
                }
            }
        });
    }; // end d3_wrap


    // setup margins in a different function (sets up the page options (i.e. margins height etc)
    setup_margins = function (graph) {
        options = graph.options;
        //height = options.height;
        page_options.margin = options.margin;
        page_options.margin_left = options.margin.left;
        page_options.width = options.width;
        page_options.margin_top = options.margin.top;
        page_options.margin_bottom = options.margin.bottom;
        page_options.height = options.height;
        page_options.horizontal_grid_lines = options.horizontal_grid_lines;
        page_options.full_width = options.width + options.margin.left + options.margin.right;
        page_options.full_height = options.height + options.margin.top + options.margin.bottom;

        graph.page_options = page_options;
        return graph;

    }; ///end setup margins

    //setting up the line to append for each of the values (i.e. line between scatter points)
    //http://bl.ocks.org/d3noob/e99a762017060ce81c76 helpful for nesting the probes
    setup_scatter_line = function (graph) {
        scatter_line = d3.svg.line()
                .x(function (d, i) {
                    return scaleX(d[options.x_column]);
                })
                .y(function (d) {
                    return scaleY(d.Expression_Value);
                });
        //nest the values to take order into account (ordered by probe type)
        dataNest = d3.nest()
                .key(function (d) {
                    return d.Probe;
                })
                .entries(options.data);
        //Gets the colours for the probes (these can be random or prespecified)
        colour = options.colour;
        colour_count = 0;
        //nests through for each probe (doesn't take order into account)
        //order needs to be done separately (see above function dataNest)
        dataNest.forEach(function (d, i) {
            svg.append("path")
                    .attr("class", function () {
                        return "line-probe-" + d.key.replace(/\ |(|)/g, '');
                    })
                    .style("stroke", function () {
                        colour_count++;
                        //if it reaches the number of colours reitterate over them again
                        if (i % options.number_of_colours === 0) {
                            colour_count = 0;
                        }
                        return colour[colour_count];
                    })
                    .style("stroke-width", options.line_stroke_width)
                    .attr("id", 'tag' + d.key.replace(/\s+/g, ''))
                    .style("opacity", 1)
                    .attr("fill", "none")
                    .attr("d", scatter_line(d.values));
        });
        graph.svg = svg;
        return graph;

    };//end  setup_scatter_line


    //Setting up the max and minimum values for the graph
    //we are trying to take into account not just the data but the lines as well
    // and we are taking into account that we want to be able to see 0 too
    return_y_min_max_values = function (graph) {
        options = graph.options;
        max_val = 1;
        min_val = 0;

        lwr_min_max_values_from_data = d3.extent(options.data,
                function (d) {   // this will go through each row of the options.data
                    // and provide a way to access the values
                    // you want to check that we use the highest and lowest values of the lines and at least stop at 0
                    lwr = (d.Expression_Value - d.Standard_Deviation);
                    temp = lwr; // this will get the y_column (usually prediction) from the row
                    // have to take into account lwr and upr
                    if (lwr < min_val) {
                        min_val = lwr;
                    }
                    return temp;
                }
        );

        // do the same for upr
        // changes done by Isha to add extra padding for y axis
        upr_min_max_values_from_data = d3.extent(options.data,
                function (d) {
                    var extra_padding_for_y_axis = 1
                    upr = (d.Standard_Deviation + d.Expression_Value) + extra_padding_for_y_axis; 
                    temp = upr;
                    if (upr > max_val) {
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
        if (min > 0) {
            min = 0;
        }

        // similarly, if the max number from the data is -ve
        // at least show 0
        if (max < 1) {
            max = 1;
        }
        for (key in options.horizontal_lines) {
            value = options.horizontal_lines[key];
            if (value > max) {
                max = value;
            }
            if (value < min) {
                min = value;
            }
        }
        graph.max_val = max_val;
        graph.min_val = min_val;
        graph.force_domain = [min, max];
        return graph;
    };

    /**
     * Sets up the y axis for the graph
     * @param {type} graph
     * @returns {biojsvisscatterplot.setup_y_axis.graph}
     */
    setup_y_axis = function (graph) {
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

        y_column = options.y_column;
        // d3.extent returns the max and min values of the array using natural order
        // we are trying to take into account not just the data but the lines as well
        graph = return_y_min_max_values(graph);
        scaleY.domain(graph.force_domain).nice();
        /* Want to make the number of ticks default to 1 for each increment */
        var num_ticks = graph.max_val - graph.min_val;
        // Since the graph has a "nice" domain
        num_ticks = num_ticks * 1.25;
        /* If there are less than 10 ticks set the default to 10 */
        if (num_ticks < 10) {
            num_ticks = 10; 
        } else {
            // User may not want any ticks
            num_ticks *= options.increment;
        }
        // setup the yaxis. this is later called when appending as a group .append("g")
        // Note that it uses the y to work out what it should output
        // trying to have the grid lines as an option
        // sets the number of points to increment by 1 whole
        // number. To change see options.increment
        var yAxis = d3.svg.axis()
                .scale(scaleY)
                .orient("left")
                .ticks(num_ticks)
                .innerTickSize(-page_options.width)
                .outerTickSize(0);

        y_axis_legend_y = (graph.full_height - options.margin.top - options.margin.bottom) / 2;

        /*Adding the title to the Y-axis: stored in options.y_axis_title: information from
         ** http://bl.ocks.org/dougdowson/8a43c7a7e5407e47afed*/
        // only display the title if the user has indicated they would like the title displayed
        if (options.display.y_axis_title === "yes") {
            svg.append("text")
                    .text(options.y_axis_title)
                    .attr("text-anchor", "middle")
                    .style("font-family", options.font_style)
                    .style("font-size", options.y_label_text_size)
                    .attr("transform", "rotate(-90)")
                    .style("text-anchor", "middle")
                    .attr("stroke", "black")
                    .attr("x", -y_axis_legend_y)
                    .attr("y", -options.y_label_x_val); //specifies how far away it is from the axis
        }
        // Only display the grid lines accross the page if the user has specified they want a grid
        if (options.display.horizontal_grid_lines === "yes") {
            svg.append("g")
                    .attr("class", "grid") //creates the horizontal lines accross the page
                    .attr("opacity", options.grid_opacity)
                    .attr("stroke", options.grid_colour)
                    .attr("stroke-width", options.background_stroke_width)
                    .call(yAxis); //implementing the y axis as an axis
        } else {
            svg.append("g")
                .call(yAxis); //implementing the y axis as an axis
        }
        graph.svg = svg;
        graph.scaleY = scaleY;
        graph.yAxis = yAxis;
        return graph;
    }; // end  setup_y_axis

    /*
     This includes:
     - returning vertical_lines which is the basis for calculating the vertical lines that
     separate the sample types.
     - returning the sample_id_list that allows the scaleX.domain(sample_id_list) call to
     create the values for the x values of the samples for ordinal values
     - also want to store the starting sample_id of a sample type as well so that we can
     calculate the middle of the sample types to display just the sample type
     */
    setup_data_for_x_axis = function (graph) {
        options = graph.options;
        sample_type_count = 0;
        //check if no sample type order has been given. in this case order by order
        // in datasheheet
        if (options.sample_type_order !== "none") {
            sample_type_order = options.sample_type_order.split(',');
            nested_values = d3.nest()
                    .key(function (d) {
                        return d.Sample_Type;
                    })
                    .sortKeys(function (a, b) {
                        return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);
                    })
                    .entries(options.data);
        } else {
            nested_values = d3.nest()
                    .key(function (d) {
                        return d.Sample_Type;
                    })
                    .entries(options.data);
        }
        sample_id_list = new Array();
        sample_type_list = new Array();//stores the two sample types
        vertical_lines = new Array(); // new object
        vert_count = 0;
        type_count = 0;//calculates the number of sample types
        count = 0;
        temp_count = 0;
        count_row = 0;
        for (temp_count in nested_values) {
            row = nested_values[temp_count];
            key = row.key;
            values = row.values;
            for (count_row in values) {
                sample = values[count_row];
                sample_id = sample.Sample_ID;
                sample_type = sample.Sample_Type;
                //This checks for multiple id's, count contains how many samples there are
                //Ensures the x axis lables and the vertical lines are correct
                if ($.inArray(sample_id, sample_id_list) === -1) {
                    sample_id_list.push(sample_id);
                    count++;
                }
                if ($.inArray(sample_type, sample_type_list) === -1) {
                    sample_type_list.push(sample_type);
                    type_count++;
                }

            }
            temp = {};
            temp['sample_type'] = key;
            temp['start_sample_id'] = values[0].Sample_ID;
            temp['end_sample_id'] = sample_id;
            vertical_lines.push(temp);
            vert_count++;
        }
        graph.type_count = type_count;
        graph.vertical_lines = vertical_lines;
        graph.sample_type = sample_type;
        graph.sample_id_list = sample_id_list;
        return graph;
    }; // setup_data_for_x_axis


    /**
     * Sets up the x axis for the graph
     * @param {type} graph
     * @returns {biojsvisscatterplot.setup_x_axis.graph}
     */
    setup_x_axis = function (graph) {
        // ########################################## Setup X axis labels ###################################3
        page_options = graph.page_options;
        svg = graph.svg;
        options = graph.options;
        sample_id_list = graph.sample_id_list;

        /* http://bost.ocks.org/mike/bar/3/
         because we have samples along the bottom we use ordinal instead of linear
         we also use rangeRoundBands as it gives us some flexibility
         see here for more: https://github.com/mbostock/d3/wiki/Ordinal-Scales
         Using randPoints gives greatest accuracy, it goes from the first to the last point, the padding is set as a
         factor of the interval size (i.e. outer padidng = 1/2 dist between two samples) 1 = 1/2 interval distance on the outside
         2 = 1 interval dist on the outside. Have set the default to 2 */
        var scaleX = d3.scale.ordinal()
                .rangePoints([0, page_options.width], options.padding); // note that 0.4 was chosen by iterative fiddling

        /*
         http://stackoverflow.com/questions/15713955/d3-ordinal-x-axis-change-label-order-and-shift-data-position
         The order of values for ordinal scales is the order in which you give them to .domain().
         That is, simply pass the order you want to .domain() and it should just work. */
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
                .attr("transform", function (d) {
                    return "rotate(-65)"; // this is rotating the text
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

        // If the user wants labels we need to append the labels to the graph
        if (options.display.x_axis_labels === "yes") {
            graph = setup_x_axis_using_sample_types(graph);
        }
        return graph;
    }; //end  setup_x_axis



    /**
     * Prepares the data for the x axis and adds the labels to the x axis
     * This is to make the sample types replace the sample ids
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_x_axis_using_sample_types = function (graph) {
        svg = graph.svg;
        scaleX = graph.scaleX;
        vertical_lines = graph.vertical_lines;
        page_options = graph.page_options;
        options = graph.options;
        // handle gaps between samples oin the x axis
        value = calculate_difference_between_samples(sample_id_list, scaleX);
        // in the same function you want to store the padding
        // and you want to calculate that last padding too
        sample_type_count = 0;
        radius = options.circle_radius;

        svg.selectAll(".sample_type_text")  // text for the xaxes - remember they are on a slant
                .data(vertical_lines).enter()
                .append("text") // when rotating the text and the size
                .text(
                        function (d) {
                            // If the user does't want to have labels on the x axis we don't append the
                            // smaple type
                            temp = d.sample_type;
                            return temp;
                        }
                )
                .attr("class", "x_axis_diagonal_labels")
                .style("text-anchor", "end")
                .attr("id", function(d) {
                    /* This is used during testing to check the correct sample
 * is displayed */
                    return "xLabel-" + d.sample_type.replace(/\ |(|)/g, '');
                })
                // Even though we are rotating the text and using the cx and the cy, we need to
                // specify the original y and x
                .attr("y", page_options.height + options.x_axis_label_padding)
                .attr("x",
                        function (d) {
                            avg = calculate_x_value_of_sample_types(d, sample_id_list, scaleX);
                            return avg;
                        }
                ) // when rotating the text and the size
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .attr("transform",
                        /*combination of this: http://stackoverflow.com/questions/11252753/rotate-x-axis-text-in-d3
                         // and this: http://www.w3.org/TR/SVG/coords.html#TransformAttribute
                         // basically, you just have to specify the angle of the rotation and you have
                         // additional cx and cy points that you can use as the origin.
                         // therefore you make cx and cy your actual points on the graph as if it was 0 angle change
                         // you still need to make the y and x set as above*/
                        function (d, i) {
                            // actual x value if there was no rotation
                            x_value = calculate_x_value_of_sample_types(d, sample_id_list, scaleX);
                            // actual y value if there was no rotation
                            y_value = page_options.height;
                            return "rotate(" + options.x_axis_text_angle + "," + x_value + "," + y_value + ")";
                        }
                )
                /* Sets up the tooltips to display on the mouseover of the sample type label. This tooltip
                 changes the scatter points (increases the size and changes the opacity.
                 Note: due to stange sample type names (i.e. having unagreeable characters) it assigns
                 a number to each sample type and calls this rather than the sample type name.
                 This is set up in simple.js and saves in array options.sample_types where the key
                 is the sample type */
                .on('mouseover', function (d) {
                    sample_type_count++;
                  $(".sample-type-" + options.sample_types[d.sample_type]).hover();
                    var sample_type_group = document.getElementsByClassName("sample-type-" + options.sample_types[d.sample_type]);
                    for (i = 0; i < sample_type_group.length; i++) {
                        d3.select(sample_type_group[i]).attr("r", options.hover_circle_radius).style("opacity", 0.5);
                    }
                })
                .on('mouseout', function (d) {
                   $(".sample-type-" + options.sample_types[d.sample_type]);
                    var sample_type_group = document.getElementsByClassName("sample-type-" + options.sample_types[d.sample_type]);
                    for (i = 0; i < sample_type_group.length; i++) {
                        d3.select(sample_type_group[i]).attr("r", radius).style("opacity", 1);
                    }
                });

        graph.svg = svg;
        return graph;
    }; // setup_x_axis_using_sample_types

    /* This is used for calculating the size of the interval between the scatter points
     i.e. for setting up the vertical lines */
    calculate_x_value_of_sample_types = function (d, sample_id_list, scaleX) {
        // To get the difference, we need the sample ids to allow
        // d3 to calculate the x axis
        var start_temp = scaleX(d.start_sample_id);
        var end_temp = scaleX(d.end_sample_id);
        var avg = (start_temp + end_temp) / 2;
        return avg;

    }; // calculate_x_value_of_sample_types

    /* Similary with the code above this is used to calculate the interval between
     the scatter points, however this is used in the hover bars (slightly
     different as it uses the whole difference not 1/2 as with above */
    calculate_difference_between_samples = function (sample_id_list, scaleX) {

        prev_sample_id = sample_id_list[0];
        step_sample_id = sample_id_list[1];
        value = scaleX(step_sample_id) - scaleX(prev_sample_id);
        return value;
    };

    /**
    * Calculates where we want to put the ertical elines which separate the different
    * sample types on the x axis.
    */
    calculate_x_value_of_vertical_lines = function (d, sample_id_list, scaleX) {
        // To get the difference, we need the sample ids to allow
        // d3 to calculate the x axis
        this_sample_index = sample_id_list.indexOf(d.end_sample_id);
        next_sample_id = sample_id_list[this_sample_index + 1];

        var temp = scaleX(d.end_sample_id);
        var temp2 = scaleX(next_sample_id);

        if (temp2 !== undefined) {
            var avg = (temp + temp2) / 2;
        } else {
            var avg = 0;
        }
        return avg;

    }; // calculate_x_value_of_vertical_lines


    /**
     * Draws the vertical line on the x axis from the calculated x value above
     */
    setup_vertical_lines = function (graph) {
        svg = graph.svg;
        vertical_lines = graph.vertical_lines;
        sample_id_list = graph.sample_id_list;
        page_options = graph.page_options;
        svg.selectAll(".separator").data(vertical_lines).enter()
                .append("line")
                .attr("class", "separator")
                .attr("x1",
                        function (d) {
                            avg = calculate_x_value_of_vertical_lines(d, sample_id_list, scaleX);
                            return avg;
                        }
                )
                .attr("x2",
                        function (d) {
                            avg = calculate_x_value_of_vertical_lines(d, sample_id_list, scaleX);
                            return avg;
                        }
                )
                .attr("y1",
                        function (d) {
                            temp = 0;
                            return temp;
                        }
                )
                .attr("y2",
                        function (d) {
                            // this is to keep it within the graph
                            temp = page_options.height;
                            return temp;
                        }
                )
                .attr("shape-rendering", "crispEdges")
                .attr("stroke-width", options.line_stroke_width)
                .attr("opacity", "0.2")
                .attr("stroke", "black");

        graph.svg = svg;
        return graph;
    }; // //setup_vertical_lines


    /**
     * Sets up the error bars (if there) still sets them up on the small graph
     * This feature can be enabled or disabled.
     */
    setup_error_bars = function (graph) {
        svg = graph.svg;
        options = graph.options;
        page_options = graph.page_options;
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        tooltip = graph.options.tooltip;
        shape_rendering = "auto";
        //If the graph is small need the stroke width to be smaller
        stroke_width = options.error_stroke_width;
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
                        function (d) {
                            //Checks if the error is < 1% of the value (default - can be made more precise see options.error_dividor)
                            //If it is it doesn't paint the bars (x part)
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
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
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = scaleX(d[options.x_column]) + width;
                                return temp;
                            }
                        }
                )
                .attr("y1",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) > 0) {
                                temp = scaleY(d.Expression_Value + d.Standard_Deviation);//upper value
                                return temp;
                            } else {
                                return 0;
                            }
                        }
                )
                .attr("y2",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) > 0) {
                                temp = scaleY(d.Expression_Value + d.Standard_Deviation);//upper value
                                return temp;
                            } else {
                                return 0;
                            }
                        }
                )
                .attr("shape-rendering", shape_rendering)
                .attr("stroke-width", stroke_width)
                .attr("stroke", "black")
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide)
                .style("fill", 'none'); // color is black


        svg.selectAll(".min").data(options.data).enter()
                .append("line") // append an object line
                .attr("class", "min")
                .attr("x1",
                        function (d) {
                            //Checks if the error is < 1% (default - can be made more precise see options.error_dividor) of the value
                            // If it is it doesn't paint the bars (x part)
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = scaleX(d[options.x_column]) + width;
                                return temp;
                            }
                        }

                )
                .attr("x2",
                        function (d) {
                            if (((d.Expression_Value + d.Standard_Deviation) - d.Expression_Value) < (d.Expression_Value / dividor)) {
                                var temp = scaleX(d[options.x_column]);
                                return temp;
                            } else {
                                var temp = scaleX(d[options.x_column]) - width;
                                return temp;
                            }
                        }

                )
                .attr("y1",
                        function (d) {
                            temp = scaleY(d.Expression_Value - d.Standard_Deviation);//lower value
                            return temp;
                        }
                )
                .attr("y2",
                        function (d) {
                            temp = scaleY(d.Expression_Value - d.Standard_Deviation);//lower value
                            return temp;
                        }
                )
                .attr("shape-rendering", shape_rendering)
                .attr("stroke-width", stroke_width)
                .attr("stroke", "black")
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide)
                .style("fill", 'none'); // color is black


        svg.selectAll(".vertical").data(options.data).enter()
                .append("line") // append an object line
                .attr("class", "vertical")
                .attr("x1",
                        function (d) {
                            var temp = scaleX(d[options.x_column]);
                            return temp;
                        }
                )
                .attr("x2",
                        function (d) {
                            var temp = scaleX(d[options.x_column]);
                            return temp;
                        }
                )
                .attr("y1",
                        function (d) {
                            temp = scaleY(d.Expression_Value + d.Standard_Deviation);//
                            return temp;
                        }
                )
                .attr("y2",
                        function (d) {
                            temp = scaleY(d.Expression_Value - d.Standard_Deviation);
                            return temp;
                        }
                )
                .attr("shape-rendering", shape_rendering)
                .attr("stroke-width", stroke_width)
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide)
                .attr("stroke-width", "2px")
                .attr("stroke", "black")
                .style("fill", 'none'); // color is black

        graph.svg = svg;
        return graph;
    }; // end setup_error_bars


    /**
     * Sets up the actual scatter points on the graph, assigns colours based on
     * probe types also has a tooltip (see simple.js for tooltip setup)
     * with relevent info aobut each point
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_scatter = function (graph) {
        //size_options = graph.size_options;
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
        var x = -1;
        radius = options.circle_radius;
        probes = new Array();
        svg.selectAll(".dot") // class of .dot
                .data(options.data) // use the options.data and connect it to the elements that have .dot css
                .enter() // this will create any new data points for anything that is missing.
                .append("circle") // append an object circle
                .attr("id", function(d) {
                    return "scatter-point-" + d.Sample_ID;
                })
                .attr("class", function (d) {
                    //adds the sample type as the class so that when the sample type is overered over
                    //on the x label, the dots become highlighted
                    return "sample-type-" + options.sample_types[d.Sample_Type];
                })
                .attr("r", radius) //radius 3.5
                .attr("cx", function (d) {
                    // set the x position as based off x_column
                    // ensure that you put these on separate lines to make it easier to troubleshoot
                    var cx = scaleX(d[options.x_column]);
                    return cx;
                })
                .attr("cy", function (d) {
                    // set the y position as based off y_column
                    // ensure that you put these on separate lines to make it easier to troubleshoot
                    var cy = scaleY(d[options.y_column]);
                    return cy;
                })
                .style("stroke", "black")
                .style("stroke-width", "1px")
                .style("fill", function (d) {
                    //chooses the colour based on the probe
                    //gets the colours from options
                    if ($.inArray(d.Probe, probes) === -1) {
                        probes.push(d.Probe);
                        x++;
                    }
                    if (x === options.number_of_colours) {
                        x = 0;
                    }
                    colour = options.colour[x];
                    return colour;
                })
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide);

        graph.svg = svg;
        return graph;
    };    // end of  setup_scatter

    /**
     * This is to setup multiple horizontal lines with a label
     * colours can be chosen (options) otherwise a random colour is chosen
     * Horizontal lines are pre defined by the user. These can include:
     * Det line, or median line.
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_horizontal_lines = function (graph) {
        svg = graph.svg;
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        options = graph.options;
        width = page_options.width;
        lines = options.lines;
        horizontal_lines = options.horizontal_lines;
        font_size = options.text_size;
        margin_y_value = 20;
        colour_random = d3.scale.category20();
        //adds the horizontal lines to the graph. Colours are given, if no colour is given
        //a coloour is chosen at random.

        for (var i = 0; i < horizontal_lines.length; i++) {
            var name = horizontal_lines[i][0];
            //if no colours are defined pick one at random
            if (horizontal_lines[i][1] === undefined) {
                var colour = colour_random;
            } else {
                var colour = horizontal_lines[i][1];
            }
            var y_value = horizontal_lines[i][2];
            svg.append("line") // append an object line
                    .attr("class", "lines")
                    .attr("data-legend", function (d) {
                        return name;
                    })
                    .attr("id", "horizontal-line-"+ name)
                    .attr("x1", 0)
                    .attr("x2", width)
                    .attr("y1", scaleY(y_value))
                    .attr("y2", scaleY(y_value))
                    .attr("shape-rendering", "crispEdges")
                    .attr("stroke-width", options.line_stroke_width)
                    .attr("opacity", "0.6")
                    .style("stroke", colour);

            svg.append("text")
                    .attr("id", "horizontal-line-text-"+ name)
                    .attr("x", margin_y_value + (name.length * 3) + 15)
                    .attr("y", scaleY(y_value) - 10)
                    .text(name)
                    .attr("text-anchor", "middle")
                    .style("font-family", options.font_style)
                    .style("font-size", font_size)
                    .style("fill", colour)
                    .attr("class", options.title_class);
        }

        graph.svg = svg;
        return graph;
    }; // end setup_horizontal_lines

    /**
     * This changes the array of the user input into a easier format for
     * adding them to the graph
     * @param {type} graph
     * @returns {unresolved}
     */
    preprocess_lines = function (graph) {
        horizontal_lines = graph.options.horizontal_lines;
        lines = Array();
        for (key in horizontal_lines) {
            name = key;
            value = horizontal_lines[key];
            data_line = {'value': value, 'name': name};
            lines.push(data_line);
        }

        graph.options.lines = lines;

        return graph;
    };   // end preprocess_lines


    /**
     * sets up bars under the graph so that when the user hovers the mouse above it
     * Essentially sets a bar graph up under the scatter plot
     * This allows the user to easily see what "group" they are looking at
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_hover_bars = function (graph) {
        svg = graph.svg;
        options = graph.options;
        //sets up the tooltip which displys the sample type when the bar is hovered
        //over.
        tip = options.tip;
        svg.call(tip);
        opacity = 0; // start with the colour being white
        scaleX = graph.scaleX;
        scaleY = graph.scaleY;
        vertical_lines = graph.vertical_lines;
        sample_id_list = graph.sample_id_list;
        page_options = graph.page_options;
        //once and first are place holder values to check if it is the first element
        //as these need to have a different amount of padding
        sample_id_count = 0;
        first = 0;
        once = 0;
        //the tooltip for hovering over the bars which displays the sample type
        var tooltip_sample;

        x_values_for_bars = new Array();
        //This is required so taht the bars stop midway between the two sample types (i.e. on the line)
        padding = (calculate_difference_between_samples(sample_id_list, scaleX)) / 2;

        //Appending the bar to the graph
        svg.selectAll(".bar")
                .data(vertical_lines) // use the options.data and connect it to the elements that have .dot css
                .enter() // this will create any new data points for anything that is missing.
                .append("rect")
                .attr("id", function (d) {
                    return d.sample_type;
                }
                )
                /* .attr("class", "bar")*/
                .style("opacity", opacity)
                .style("fill", "#FFA62F")
                .attr("x", function (d) {
                    sample_id_count++;
                    if (first === 0) {
                        first = 1;
                        //need to add a padding of 10 to make up for the padding on the grid
                        //so that the highlighted collumn goes to the edge
                        //options.padding spefies how far away the user would like the initial one
                        //to be from the start of the graph
                        return scaleX(d.start_sample_id) - padding * options.padding;
                    } else {
                        return scaleX(d.start_sample_id) - padding;
                    }
                })
                .attr("width", function (d, i) {
                    sample_id_count--;
                    if (once === 0) {
                        once = 1;
                        return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + 3 / 2 * options.padding * padding;
                    }
                    if (sample_id_count === 0) {
                        //if it is the last sample type need to account for padding of the graph
                        //which as with the beggining means there needs to be extra padding added
                        //This is beacuse rangeRoundPoints has been used for the domain, see that
                        //Comment for more detail on the use
                        return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + 3 / 2 * options.padding * padding;

                    } else {
                        return scaleX(d.end_sample_id) - scaleX(d.start_sample_id) + options.padding * padding;
                    }
                })
                .attr("y", 0)
                .attr("height", page_options.height - 2)
                .on("mouseover", function (d) {
                    //on the mouse over of the graph the tooltip is displayed (tranisition fades it in)
                    barOver = document.getElementById(d.sample_type);
                    barOver.style.opacity = "0.5";
                    tooltip_sample = d3.select("body").append("div")
                            .attr('class', 'tooltip')
                            .style("opacity", 1e-6)
                            .html(function () {
                                temp =
                                        "Sample Type: " + d.sample_type + "<br/>";
                                return temp;
                            });

                    tooltip_sample.style("opacity", 1);
                })
                .on("mousemove", function (d) {
                    //on mousemove it follows the cursor around and displayed the current sample type it is hovering over
                    tooltip_sample.html = "Sample Type: " + d.sample_type + "<br/>";
                    tooltip_sample.style('left', Math.max(0, d3.event.pageX - 150) + "px");
                    tooltip_sample.style('top', (d3.event.pageY + 20) + "px");
                    tooltip_sample.show;
                })
                .on("mouseout", function (d) {
                    tooltip_sample.remove();
                    barOver = document.getElementById(d.sample_type);
                    barOver.style.opacity = "0";
                });

        graph.svg = svg;
        return graph;
    };



    /**
     * Sets up the SVG element
     * @param {type} graph
     * @returns {unresolved}
     */
    setup_svg = function (graph) {
        options = graph.options;
        page_options = graph.page_options;
        full_width = page_options.full_width;
        full_height = page_options.full_height;

        graph.full_width = full_width;
        graph.full_height = full_height;
        background_stroke_width = options.background_stroke_width;
        background_stroke_colour = options.background_stroke_colour;

        // clear out html
        $(options.target)
                .html('')
                .css('width', full_width + 'px')
                .css('height', full_height + 'px');

        // setup the SVG. We do this inside the d3.tsv as we want to keep everything in the same place
        // and inside the d3.tsv we get the data ready to go (called options.data in here)
        var svg = d3.select(options.target).append("svg")
                .attr("width", full_width)
                .attr("height", full_height)
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

        // Positions the title in a position relative to the graph
        height_divisor = 1.5;
        count = 0; // keeps track of the number of subtitles and if we
        // need to change the graph size to account for them
        svg.append("text")
                .attr("id", "title-"+ options.title)
                .attr("x", page_options.width / 2)//options.x_middle_title)
                .attr("y", 0 - (page_options.margin.top / height_divisor))
                .attr("text-anchor", "middle")
                .text(options.title).attr("class", options.title_class)
                .style("font-family", options.font_style)
                .style("font-size", options.title_text_size)
                .style("fill", "black")
                .attr("class", options.title_class);

        //Adds the subtitles to the graph
        for (i = 0; i < options.subtitles.length; i++) {
            svg.append("text")
                    .attr("id", "subtitle-"+ options.subtitles[i])
                    .attr("x", page_options.width / 2)//ptions.x_middle_title)
                    .attr("y", function () {
                        num = page_options.margin.top / height_divisor - (parseInt(options.text_size, 10) * (i + 1));
                        if (num <= 0) {
                            count++;
                        }
                        return 0 - num;
                    })
                    .attr("text-anchor", "middle")
                    // Adds the class for the specific subtitle as specified
                    .text(options.subtitles[i]).attr("class", options.title_class + " subtitle" + i)
                    .style("font-family", "Arial")
                    .style("font-size", options.text_size)
                    .style("fill", "black")
                    .attr("class", options.title_class);
        }

        max_width_of_text = 800;
        suggested_width_of_text = options.width * 0.7;
        if (max_width_of_text < suggested_width_of_text) {
            width_of_title = max_width_of_text;
        } else {
            width_of_title = suggested_width_of_text;
        }
       // svg.selectAll("." + options.title_class)
       //         .call(d3_wrap, width_of_title);

        graph.svg = svg;
        return graph;
    }; // setup_svg

    /*  Setting up the watermark */
    setup_watermark = function (graph) {
        svg = graph.svg;
        options = graph.options;

        svg.append("image")
                .attr("xlink:href", options.watermark)
                .attr("x", page_options.height / 2 - 100)
                .attr("y", -page_options.width - page_options.margin_left)// just out of the graphs edge
                .attr("transform", "rotate(+90)")
                .attr("width", 200)
                .attr("height", 100);

        graph.svg = svg;
        return graph;
    }; // setup_watermark


    /* http://bl.ocks.org/ZJONSSON/3918369 and http://zeroviscosity.com/d3-js-step-by-step/step-1-a-basic-pie-chart
     Interactive legend which allows you to display and not display the legend*/
    setup_D3_legend = function (graph) {
        svg = graph.svg;
        var legendSpacing = 4;
        options = graph.options;
        var legendRectSize = options.legend_rect_size;
        page_options = graph.page_options;

        //Add a legend title
        svg.append("text")
                .attr("x", page_options.width + options.legend_padding)//options.x_middle_title)
                .attr("y", 0 - (page_options.margin.top / height_divisor))
                .attr("text-anchor", "middle")
                .text("Legend").attr("class", options.title_class)
                .style("font-family", options.font_style)
                .style("font-size", options.title_text_size)
                .style("fill", "black")
                .attr("class", options.title_class)
                .on('mouseover', function (d) {
                    if (options.display.legend_hover !== "no") {
                        var leg = document.getElementsByClassName("legendClass");
                        for (i = 0; i < leg.length; i++) {
                            if (leg[i].style.opacity !== 0) {
                                d3.select(leg[i]).style("opacity", 0);
                            } else {
                                d3.select(leg[i]).style("opacity", 1);
                            }
                        }
                    }
                });


        //Add the legend to the svg element
        var legend = svg.selectAll('.legend')
                .data(options.probes) //options.probs contains the name and colour of the probes
                .enter()
                .append('g')
                .attr('transform', function (d, i) {
                    var height = legendRectSize + legendSpacing;
                    // Probe count tells us how many samples we have
                    var offset = height / 2 + options.probe_count / 2; //the 20 is to allow for the text above
                    var horizontal = -2 * legendRectSize + page_options.width + options.legend_padding;
                    var vertical = i * height - offset;
                    return 'translate(' + horizontal + ',' + vertical + ')';
                });

        var id = null;
        //Add legend squares
        legend.append('rect')
                .attr('width', legendRectSize)
                .attr('class', "legendClass")
                .attr('id', function (probeInfo, i) {
                    id = probeInfo[0];
                    return "legend-rect-" + probeInfo[0];
                    // Changed this from just probeInfo[0] for testing pupose's
                    // Make the id of the rectangle that of the probe name
                })
                .attr('height', legendRectSize)
                .style('fill', function (probeInfo) {
                    return probeInfo[1]; //First element stored in the probe array is colour
                })
                .style('stroke', function (probeInfo) {
                    return probeInfo[1]; //First element stored in the probe array is colour
                })
                .style('opacity', 1)
                .on('mouseover', function (d, i) {
                    var probe = d[0];
                    //Gets the elements by probe and assigns colour to the line (this is started off hidden)
                    var probe_group = document.getElementsByClassName("line-probe-" + probe.replace(/\ |(|)/g, ''));
                   for (i = 0; i < probe_group.length; i++) {
                        if (probe_group[i].style.opacity != 0) {
                            d3.select(probe_group[i]).style("opacity", 0);
                        } else {
                            d3.select(probe_group[i]).style("opacity", 1);
                        }
                    }
                }); //end on_click button

        //Add legend text
        legend.append('text')
                .attr("id", function (probeInfo) {
                    return "legend-text-" + probeInfo[0];
                    })
                .attr('class', "legendClass")
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .style('opacity', 1)
                .text(function (probeInfo) {
                    return probeInfo[0];
                });

        graph.svg = svg;
        return graph;
    };


    set_data_order = function(graph) {
        if (options.sample_type_order !== "none") {
            options.data.sort(function(a, b) {
                return options.sample_type_order.indexOf(a.Sample_Type) - options.sample_type_order.indexOf(b.Sample_Type);
            })
        }
        return graph;
    }

    /*  Setting up the graph including y and x axes */
    setup_graph = function (graph) {
        // setup all the graph elements
        options = graph.options;
        graph = setup_margins(graph);
        graph = set_data_order(graph);
        //graph =  setup_size_options(graph);
        graph = setup_svg(graph);
        graph = setup_data_for_x_axis(graph);
        graph = setup_x_axis(graph);
        graph = setup_x_axis(graph);
        graph = setup_y_axis(graph);
        graph = setup_D3_legend(graph);

        // Only display the vertical lines if the user chooses so
        if (options.display.vertical_lines === "yes") {
            graph = setup_vertical_lines(graph);
        }
        // Display the legend if the user has specified they want the legend
        //  if (options.display.legend  === "yes") {
        //     graph =  setup_legend(graph);
        // }
        if (options.display.error_bars === "yes") {
            graph = setup_error_bars(graph);
        }
        graph = setup_scatter_line(graph);
        if (options.display.horizontal_lines === "yes") {
            graph = setup_horizontal_lines(graph);
        }
        //graph =  setup_watermark(graph);
        if (options.display.hoverbars === "yes") {
            graph = setup_hover_bars(graph);
        }
        graph = setup_scatter(graph);
        graph = run_tests(graph);
        return graph;

    };  // end setup_graph

    // run this right at the start of the initialisation of the class
    init = function (init_options) {
        var options = default_options();
        options = init_options;
        page_options = {}; // was new Object() but jshint wanted me to change this
        //size_options = {};
        var graph = {}; // this is a new object
        graph.options = options;
        graph = preprocess_lines(graph);
        graph = setup_graph(graph);
        var target = $(options.target);
        target.addClass('scatter_plot');

        svg = graph.svg;
    };

    // constructor to run right at the start
    init(init_options);
};
