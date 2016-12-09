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
                        // console.log("line-probe-" + d.key.replace(/\ |(|)/g, ''));
                        return "line-probe-" + remove_chars(d.key);//.replace(/\ |(|)/g, '');
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
                    .attr("id", 'tag' + remove_chars(d.key))//.replace(/\s+/g, ''))
                    .style("opacity", 1)
                    .attr("fill", "none")
                    .attr("d", scatter_line(d.values));
        });
        graph.svg = svg;
        return graph;

    };//end  setup_scatter_line

    /**
     * Returns a scaled x value
     */
    get_x_value_scatter = function (graph, data) {
        var scaleX = graph.multi_scaleX;
        var sample_id = data.Sample_ID;
        var sort_by_options = graph.options.split_sort_by_option;
        if (options.multi_group != 1) {
            var option2 = data[sort_by_options[0]];
            // Currently there is an error with the sample type -> needs to be
            // changed to having an underscore
            var option1 = data[sort_by_options[1]];
            var scale_val = graph.name_mapping[remove_chars(option2 + "-" + sample_id
                     + "-" + option1)];
            centreX = scaleX(scale_val);
        } else {
            var scale_val = graph.name_mapping[remove_chars(data[sort_by_options[0]] +
                    "-" + sample_id)];
            centreX = scaleX(scale_val);
        }
        return centreX;
    }




    sort_scatter_data = function (graph) {
	    options = graph.options;
        sample_type_count = 0;
        //check if no sample type order has been given. in this case order by order
        // in datasheheet
        var sort_by_options = options.sortByOption.split(',');
        if (options.sortByOption == null) {
            sample_type_order = options.sample_type_order.split(',');
            nested_values = d3.nest()
                    .key(function (d) {
                        return d.Sample_Type;
                    })
                    .sortKeys(function (a, b) {
                        return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);
                    })
                    .key(function (d) {
                        return d.Sample_ID;
                    })
                    .entries(options.data);
        }
	    else if (options.sortByOption != "null") {
          if(sort_by_options.length == 1) {
            nested_values = d3.nest()
                    .key(function (d) {
                        var value = sort_by_options[0];
                        return d[value];
                    })
                    .key(function (d) {
                        return d.Sample_ID;
                    })
                    .entries(options.data);
          } else {
            nested_values = d3.nest()
                    .key (function (d) {
                        var value = sort_by_options[0];
                        return d[value];
                    })
                    .key (function (d) {
                        var value2 = sort_by_options[1];
                        return d[value2];
                    })
                    .key (function (d) {
                        return d.Sample_ID;
                        }
                    )
                    .entries(options.data);
          }
	    }
        graph.nested_values = nested_values;
        return graph;
    }



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
        scaleX = graph.multi_scaleX;//graph.scaleX;
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
        color_object = {};

        for(i=0;i<options.probes.length;i++) {
          color_object[options.probes[i]] = options.colour_array[options.probes[i]];
        }

        svg.selectAll(".dot") // class of .dot
                .data(options.data) // use the options.data and connect it to the elements that have .dot css
                .enter() // this will create any new data points for anything that is missing.
                .append("circle") // append an object circle
                .attr("class", function (d) {
                  // chnages done by Isha - no plot for scatter NaN
                  if ((!d[options.y_column])&& d[options.y_column]!= 0){return;}
                    //adds the sample type as the class so that when the sample type is overered over
                    //on the x label, the dots become highlighted
                    return "sample-type-" + options.sample_types[d.Sample_Type];
                })
                .attr("id", function(d) {
                  if ((!d[options.y_column])&& d[options.y_column]!= 0){return;}
                    return "scatter-point-" + d.Sample_ID;
                }) // cahnges done by Isha
                .attr("r", function(d){
                  if ((!d[options.y_column])&& d[options.y_column]!= 0){return;}
                  else {
                    return radius;
                  }
                }) //radius 3.5
                .attr("cx", function (d) {
                  if ((!d[options.y_column])&& d[options.y_column]!= 0){return;}
                    // set the x position as based off x_column
                    // ensure that you put these on separate lines to make it easier to troubleshoot
                    var xval = get_x_value_scatter(graph, d);//graph.name_mapping[remove_chars(d.Sample_Type + "-" + d.Probe + "-" + d.Sample_ID)];
                    //var cx = scaleX(xval);//d[options.x_column]);
                    return xval;
                })
                .attr("cy", function (d) {
                  if ((!d[options.y_column])&& d[options.y_column]!= 0){return;}
                    // set the y position as based off y_column
                    // ensure that you put these on separate lines to make it easier to troubleshoot
                    // changes done by Isha
                    var cy = scaleY(d[options.y_column]);
                    return cy;
                })
                .style("stroke", "black")
                .style("stroke-width", function(d){
                  if ((!d[options.y_column])&& d[options.y_column]!= 0){return "0px";}
                  else {return "1px";}
                })
                .style("fill", function (d) {
                    //chooses the colour based on the probe
                    //gets the colours from options
                    if ((!d[options.y_column])&& d[options.y_column]!= 0){return;}
                    return options.colour_array[d.Probe];//"Red";//color_object[d.Probe];

                })
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide);

        graph.svg = svg;
        return graph;
    };    // end of  setup_scatter



    set_data_order = function(graph) {
        if (options.sample_type_order !== "none") {
            options.data.sort(function(a, b) {
                return options.sample_type_order.indexOf(a) - options.sample_type_order.indexOf(b);
            })
        }
        return graph;
    }

    get_type = function (data_point) {
        return data_point;
    }
//------------Things added to make it modular ---------------------

   label_hover_on_feature = function (d, sample_type_count, collective_name, options) {
        var radius = options.circle_radius;
  	    sample_type_count++;
        var name = get_type(d);
          var sample_type_group = document.getElementsByClassName(collective_name + name);
          for (i = 0; i < sample_type_group.length; i++) {
              d3.select(sample_type_group[i]).attr("r", options.hover_circle_radius).style("opacity", 0.5);
          }
    }


   label_hover_out_feature = function (d, sample_type_count, collective_name, options) {
        var radius = options.circle_radius;
        var name = get_type(d);
        var sample_type_group = document.getElementsByClassName(collective_name + name);
        for (i = 0; i < sample_type_group.length; i++) {
            d3.select(sample_type_group[i]).attr("r", radius).style("opacity", 1);
        }
    }



    /*  Setting up the graph including y and x axes */
    setup_graph = function (graph) {
        graph.graph_type = "Scatter Plot";
        var label_padding = 20;
        // setup all the graph elements
        options = graph.options;
        graph = setup_margins(graph);
        graph = set_data_order(graph);
        graph = setup_svg(graph);
        graph = sort_scatter_data(graph);
        graph = setup_data_for_x_axis(graph);
        graph = setup_x_axis(graph, graph.sample_id_list);
        if (options.display.x_axis_labels === "yes") {
            if (options.multi_group != 1) {
                graph = setup_x_axis_labels(graph, graph.sample_id_list, label_padding, ".sample_type_text", ".sample-type-", 2);
                label_padding += 80;
            }
            graph = setup_x_axis_labels(graph, graph.sample_id_list, label_padding, ".sample_type_text", ".sample-type-", 1);

        }
        // if (options.include_disease_state_x_axis == "yes") {
        //     graph = this.calculate_x_value_of_disease_state(graph);
        //     graph = this.setup_disease_state_labels(graph);
        //   }

        graph = setup_y_axis(graph);
        // graph = setup_D3_legend(graph, options.legend_list);
        // Only display the vertical lines if the user chooses so
        if (options.display.vertical_lines === "yes") {
            //Need to pass it the list on which the lines are to be created
            graph = setup_vertical_lines(graph, graph.sample_id_list);
        }
        // Display the legend if the user has specified they want the legend
         if (options.display.legend  === "yes") {
            graph = setup_D3_legend(graph, options.legend_list);
        }
        if (options.whiskers_needed == true) {
            graph = setup_error_bars(graph)
        }
        // graph = setup_scatter_line(graph);
        if (options.display.horizontal_lines === "yes") {
            graph = setup_horizontal_lines(graph);
        }
        graph =  setup_watermark(graph);
        //graph = setup_hover_bars(graph);
        if (options.display.hoverbars === "yes") {
            graph = setup_hover_bars(graph);
        }
        graph = setup_scatter(graph);
        if(scaling_required == "yes") {
          $('.x_axis_label').hide();
          $('.y_axis_label').hide();
          $('.main-title').hide();
        }
        return graph;

    };  // end setup_graph

    // end test
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
