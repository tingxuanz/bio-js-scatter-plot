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

        id = null;
        //Add legend squares
        legend.append('rect')
                .attr('width', legendRectSize)
                .attr('class', "legendClass")
                .attr('id', function (d, i) {
        		    if (graph.graph_type !== "Scatter Plot") {
            			return "legend-rect-" + d[i];
        		    }
                    id = d[0];
                    return "legend-rect-" + d[0];
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
                    // console.log(probe_group);
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
                .attr('class', "legendClass")
                .attr("id", function (probeInfo) {
                    return "legend-text-" + probeInfo[0];
                    })
                .attr('x', legendRectSize + legendSpacing)
                .attr('y', legendRectSize - legendSpacing)
                .style("font-family", options.font_style)
                .style("font-size", options.text_size)
                .style('opacity', 1)
                .style("fill", function(probeInfo){
                  if(probeInfo[2] == "no") {
                    return 'black';
                  }
                  else {
                    return 'red';
                  }
                })
                .text(function (probeInfo) {
                        if(false) {
                          if (probeInfo[2] == "no") {return probeInfo[0];}
                          else {return probeInfo[0] +"*";}
                        }
                      else {
                        // Ariane -> ref_name was not defined it must be
                        // a global variable set elsewhere, I have moved it to
                        // the options
                        if (probeInfo[2] == "no") {return options.ref_name + " "+ probeInfo[0];}
                        else {return options.ref_name + " "+ probeInfo[0] +"*";}
                      }
                });

        graph.svg = svg;
        return graph;
    };

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
        if (options.sortByOption == "Sample_Type") {
            sample_type_order = options.sample_type_order.split(',');
            nested_values = d3.nest()
                    .key(function (d) {
                        return d.Sample_Type;
                    })
                    .sortKeys(function (a, b) {
                        return sample_type_order.indexOf(a) - sample_type_order.indexOf(b);
                    })
                    .entries(options.data);
        }
        else if (options.sortByOption != "null") {
          if(options.sortByOption.split(",").length == 1){
            nested_values = d3.nest()
                    .key(function (d) {
                        value = options.sortByOption.split(",")[0];
                        return d[value];
                    })
                    .entries(options.data);
          }
          else {
            nested_values = d3.nest()
                    .key(function (d) {
                        value = options.sortByOption.split(",");
                        return d[value[0]];
                    })
                    .entries(options.data);
          }

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
                    // changes done by Isha
                    last_sample_id = sample_id;
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
            temp['end_sample_id'] = last_sample_id;
            vertical_lines.push(temp);
            vert_count++;
        }
        for(i=0; i<options.probes.length; i++) {
          for(j=0; j<nested_values[0].values.length; j++) {
            if(nested_values[0].values[j].Probe == options.probes[i][0]) {
              options.probes[i][2] = nested_values[0].values[j].Multi_Mapping;
              break;
            }
          }
        }
        graph.type_count = type_count;
        graph.vertical_lines = vertical_lines;
        graph.sample_type = sample_type;
        graph.sample_id_list = sample_id_list;
        return graph;
    }; // setup_data_for_x_axis




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



    /**
    * Calculates where we want to put the ertical elines which separate the different
    * sample types on the x axis.
    * @param {type} d
    * @param {type} sample_id_list
    * @param {type} scaleX
    * @returns {biojsvisscatterplot.calculate_x_value_of_vertical_lines.nm$_index.avg}
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
        color_object = {};
        // changes done by Isha
        for(i=0;i<options.probes.length;i++) {
          color_object[options.probes[i][0]] = options.probes[i][1];
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
                    var cx = scaleX(d[options.x_column]);
                    return cx;
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
                    // if ($.inArray(d.Probe, probes) === -1) {
                    //     probes.push(d.Probe);
                    //     x++;
                    //     color_object[d.Probe] = options.colour[x];
                    //     // changes done by Isha
                    //     // color_object[d.Probe] = options.probes[d.Probe];
                    // }
                    // if (x === options.number_of_colours) {
                    //     x = 0;
                    // }
                    // colour = color_object[d.Probe];
                    // return colour;
                    if ((!d[options.y_column])&& d[options.y_column]!= 0){return;}
                    return color_object[d.Probe];
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


//------------Things added to make it modular ---------------------

    /**
     * gets a particular type -> this is used to mae the code more modular
     * Allows us to have probes as main type and samples for others
     */
    get_type = function (data_point) {
        return data_point.sample_type;
    }

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

    /* This is used for calculating the size of the interval between the scatter points
     i.e. for setting up the vertical lines */
    calculate_x_value_of_labels = function (d, sample_id_list, scaleX) {
        // To get the difference, we need the sample ids to allow
        // d3 to calculate the x axis
        var start_temp = scaleX(d.start_sample_id);
        var end_temp = scaleX(d.end_sample_id);
        var avg = (start_temp + end_temp) / 2;
        return avg;

    }; // calculate_x_value_of_sample_types

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
        // setup all the graph elements
        options = graph.options;
        graph = setup_margins(graph);
        graph = set_data_order(graph);
        graph = setup_svg(graph);

        //graph =  setup_size_options(graph);

        // changes for disease_state type order
        // if (options.include_disease_state_x_axis == "yes") {
        //     graph = this.sort_x_by_probe_and_disease_state(graph);
        //   }
          graph = setup_data_for_x_axis(graph);
          graph = setup_x_axis(graph, graph.sample_id_list);
if (options.display.x_axis_labels === "yes") {
            graph = setup_x_axis_labels(graph, graph.sample_id_list, 0, ".sample_type_text", ".sample-type-");
        }
        // if (options.include_disease_state_x_axis == "yes") {
        //     graph = this.calculate_x_value_of_disease_state(graph);
        //     graph = this.setup_disease_state_labels(graph);
        //   }

        graph = setup_y_axis(graph);
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
        // graph = setup_scatter_line(graph);
        if (options.display.horizontal_lines === "yes") {
            graph = setup_horizontal_lines(graph);
        }
        graph =  setup_watermark(graph);
        if (options.display.hoverbars === "yes") {
            graph = setup_hover_bars(graph);
        }
        graph = setup_scatter(graph);
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
