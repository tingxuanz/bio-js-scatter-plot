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
var general_setup = require('./general.js');
var axis = require('./axis.js');
var features = require('./features.js');

module.exports = biojsvisscatterplot = function (init_options)
{


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



    /*  Setting up the graph including y and x axes */
    setup_graph = function (graph) {
        // setup all the graph elements
        options = graph.options;
        graph = setup_margins(graph);
        graph = set_data_order(graph);
        //graph =  setup_size_options(graph);
        // setup svg in general.js
        graph = setup_svg(graph);
        //Setup data in axis.js
        graph = setup_data_for_x_axis(graph);
        graph = setup_x_axis(graph);
        graph = setup_x_axis(graph);
        graph = setup_y_axis(graph);
        // In general.js
        graph = setup_D3_legend(graph, options.probes);

        // Only display the vertical lines if the user chooses so
        if (options.display.vertical_lines === "yes") {
            //Need to pass it the list on which the lines are to be created
            graph = setup_vertical_lines(graph, graph.sample_id_list);
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
        // Display hoverbars is in general.js
        if (options.display.hoverbars === "yes") {
            graph = setup_hover_bars(graph, graph.sample_id_list);
        }
        //Specific to scatter so within index
        graph = setup_scatter(graph);

        graph = run_tests(graph); //Runs from the test.js script
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
