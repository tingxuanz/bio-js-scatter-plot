// if you don't specify a html file, the sniper will generate a div with id "rootDiv"
var app = require("biojs-vis-rohart-msc-test");
function round_to_two_decimal_places(num){
    new_num = Math.round(num * 100) / 100;
    return new_num;
}


    var colours = ["Orange", "Blue", "Crimson", "BlueViolet","Brown", "Deeppink", "BurlyWood","CadetBlue",
"Chartreuse","Chocolate","Coral","CornflowerBlue","Crimson","Cyan", "Red", "DarkBlue",
"DarkGoldenRod","DarkGray", "Tomato", "Violet","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen",
"DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSlateBlue","DarkTurquoise",
"DarkViolet","DeepPink","DeepSkyBlue","DodgerBlue","FireBrick","ForestGreen","Fuchsia",
"Gold","GoldenRod","Green","GreenYellow","HotPink","IndianRed","Indigo"];


// have to set this up here so that the tooltip can use these values
//var horizontal_lines = {'Standard_Deviation':0.4337,'Standard_Deviation':0.5169};

// this tooltip function is passed into the graph via the tooltip
var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, +110])
    .html(function(d) {
        probe = d.Probe;
        // 2 decimal places on the display only
        Expression_Value = round_to_two_decimal_places(d[y_column]);
        lwr = round_to_two_decimal_places(d.Expression_Value - d.Standard_Deviation);
        upr = round_to_two_decimal_places(d.Expression_Value + d.Standard_Deviation);
        temp = 
            "Probe: " + d.Probe + "<br/>" +
            "Sample: " + d.Sample_ID +"<br/>"+
            "Log2 Expression: " + Expression_Value + " [" + lwr + ";" + upr +"]<br/>"
           // "MSC predicted "+msc_call+"/"+total+" iterations<br/>"
        return temp; 
    });

//data_url= '../data/ds_id_5003_scatter_gata3.tsv';
data_url = '../data/ds_id_2000_scatter_stat1.tsv';
//data_url = '../data/ds_id_2000_scatter_pdgfd.tsv';
d3.tsv(data_url,function (error,data){
    max = 0; 
    min = 0;
    probe_name_length = 0;
    number_of_increments = 0;
    count = 0; 
    //make an array to store the number of probes for the legend
    probes_types = new Array();
    probes = new Array();
    probe_count = 0;
    long_legend = 0;
    colour_count = 0;
    color = d3.scale.category20();
    data.forEach(function(d){
        // ths + on the front converts it into a number just in case
        d.Expression_Value = +d.Expression_Value;
        d.Standard_Deviation = +d.Standard_Deviation;
        d.Probe = d.Probe;
        //calculates the max value of the graph otherwise sets it to 0
        //calculates the min value and uses this if max < 0 otherwise sets to 0
        //increment valye = max - min.
        if(d.Expression_Value + d.Standard_Deviation > max){
            max = d.Expression_Value + d.Standard_Deviation;
        }
        if(d.Expression_Value - d.Standard_Deviation < min){
            min = d.Expression_Value - d.Standard_Deviation;
        }
        if((d.Probe).length > probe_name_length){
            probe_name_length = (d.Probe).length;
        }
        if($.inArray(d.Probe, probes_types) == -1){
            probes_types.push(d.Probe);
            probe_count++;
        }
        count++;

    });
    for(i = 0; i < probe_count; i++){
        probes[i] = [];
        probes[i][0] = probes_types[i];
      //  colour_count++;
        if(colour_count == 39){
            colour_count = 0;
        }
        probes[i][1] = colours[colour_count];
        colour_count++;
    }
    number_of_increments = max - min;
    //turn number of increments into a whole number
    number_of_increments |= 0;
    //this deals with very long probe names. If they are too large
    //increase the size of the graph to compensate 
    if(probe_name_length > 22){
        probe_name_length = 15* probe_name_length;
    }else{
        probe_name_length = 500;
    }
    if(probe_count > 40){
        probe_name_length = 2*probe_name_length;
        long_legend = 1;
    }
    probes = probes;
    probe_count = probe_count;
    probe_name_length = probe_name_length;
    long_legend = long_legend;
    title = "Scatter Plot";
    subtitle1 = "Subtitle"
    subtitle2 = "Subtitle"
    target = rootDiv;

    // can always use just a straight value, but it's nicer when you calculate
    // based off the number of samples that you have
    width = data.length*3 + 500;
    if (width < 1000){
        width = 1000;
    }

   /* var colours = ["Aqua", "Blue", "BlueViolet","Brown","BurlyWood","CadetBlue",
"Chartreuse","Chocolate","Coral","CornflowerBlue","Crimson","Cyan","DarkBlue",
"DarkGoldenRod","DarkGray","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen",
"DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSlateBlue","DarkTurquoise",
"DarkViolet","DeepPink","DeepSkyBlue","DodgerBlue","FireBrick","ForestGreen","Fuchsia",
"Gold","GoldenRod","Green","GreenYellow","HotPink","IndianRed","Indigo"];
i*/
    var options = {
        background_colour: "white",
        background_stroke_colour:  "black",
        background_stroke_width:  "1px",
        circle_radius:3.5,  // for the scatter points
        colour: colours,
        data: data,
        domain_colours : ["#FFFFFF","#7f3f98"],
        error_bar_width:5,
        error_dividor:100,//100 means error bars will not show when error < 1% value 
        height: 1500,
        //horizontal lines takes a name, colour and the yvalue. If no colour is given one is chosen at random
        horizontal_lines: [["Detection Threshold", "green", 5], ["Median", , 8.93]],
        horizontal_line_value_column: 'value',
        legend_class: "legend",
        increment: number_of_increments,
        legend_range: [0,100],
        line_stroke_width: "2px",
        long_legend: long_legend,
        margin_legend: width - 190,
        margin:{top: 180, left:200, bottom: 530, right: 300},
        number_of_colours: 39,
        probe_length: probe_name_length,
        probe_count: probe_count,
        probes: probes,
        //sample type order indicates whether or not the samplese need to be represented in a specific order
        //if no order is given then the order from the data set is taken
        sample_type_order:"none",// "DermalFibroblast, hONS", // "BM MSC,BM erythropoietic cells CD235A+,BM granulopoietic cells CD11B+,BM hematopoietic cells CD45+,Developing cortex neural progenitor cells,Ventral midbrain neural progenitor cells,Olfactory lamina propria derived stem cells",
        show_horizontal_line_labels: true,
        subtitle1: subtitle1,
        subtitle2: subtitle2,
        stroke_width:"1.5px",
        target: target,
        title: title,
        title_class: "title",
        tooltip: tooltip, // using d3-tips
        unique_id: "chip_id",
        watermark:"http://www1.stemformatics.org/img/logo.gif",
        width:width, // suggest 50 per sample
        x_axis_text_angle:-45, 
        x_axis_title: "Samples",
        x_column: 'Sample_ID',//'Replicate_Group_ID',
        x_middle_title: 500,//325
        y_axis_title: "Log2 Expression",
        y_column: 'Expression_Value',//'prediction' // d.prediction
        y_lines: "no", //whether we can the horizontal lines or not
    }

    var instance = new app(options);

    // Get the d3js SVG element
    var tmp = document.getElementById(rootDiv.id);
    var svg = tmp.getElementsByTagName("svg")[0];
    // Extract the data as SVG text string
    var svg_xml = (new XMLSerializer).serializeToString(svg);

/*
    var form = document.getElementById("svgform");
    form['output_format'].value = output_format;
    form['data'].value = svg_xml ;
    form.submit();
*/
}); 

