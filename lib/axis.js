
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



