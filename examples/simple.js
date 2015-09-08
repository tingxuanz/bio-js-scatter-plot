// if you don't specify a html file, the sniper will generate a div with id "rootDiv"
var app = require("biojs-vis-rohart-msc-test");
function round_to_two_decimal_places(num){
    new_num = Math.round(num * 100) / 100;
    return new_num;
}

// have to set this up here so that the tooltip can use these values
//var horizontal_lines = {'Standard_Deviation':0.4337,'Standard_Deviation':0.5169};

// this tooltip function is passed into the graph via the tooltip
var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, +110])
    .html(function(d) {
        probe = d.Probe;
        // 2 decimal places on the display only
        // 95% CI [0.66,0.71] 
        // MSC 100/100
      /*  total = d.total_samplings;
        msc_call = d.MSC_calls; */
        Expression_Value = round_to_two_decimal_places(d[y_column]);
        lwr = round_to_two_decimal_places(d.Expression_Value - d.Standard_Deviation);
        upr = round_to_two_decimal_places(d.Expression_Value + d.Standard_Deviation);
        temp = 
            "Sample: " + d.Sample_ID +"<br/>"+
            "Log2 Expression: " + Expression_Value + " [" + lwr + ";" + upr +"]<br/>"
           // "MSC predicted "+msc_call+"/"+total+" iterations<br/>"
        return temp; 
    });

//data_url= '../data/ds_id_5003_scatter_gata3.tsv';
//data_url = '../data/ds_id_2000_scatter_stat1.tsv';
data_url = '../data/ds_id_2000_scatter_pdgfd.tsv';
d3.tsv(data_url,function (error,data){
    max = 0; 
    min = 0;
    probe_name_length = 0;
    number_of_increments = 0;
    count = 0; 
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
        count++;

    });
    number_of_increments = max - min;
    //turn number of increments into a whole number
    number_of_increments |= 0;
    //this deals with very long probe names. If they are too large
    //increase the size of the graph to compensate 
    if(probe_name_length > 22){
        probe_name_length = 15* probe_name_length;
    }else{
        probe_name_length = 450;
    }
    probe_name_length = probe_name_length;
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

    var options = {
        background_colour: "white",
        background_stroke_colour:  "black",
        background_stroke_width:  "1px",
        circle_radius:3.5,  // for the scatter points
        data: data,
        data_columns_for_colour: ["MSC_calls","ds_id"], //d.MSC_calls
        domain_colours : ["#FFFFFF","#7f3f98"],
        dt: 5,
        dt_colour: "green",
        error_bar_width:5,
        error_dividor:100,//100 means error bars will not show when error < 1% value 
        height: 1500,
    //    horizontal_lines: horizontal_lines,
        horizontal_line_value_column: 'value',
        legend_class: "legend",
        increment: number_of_increments,
        legend_range: [0,100],
        line_stroke_width: "2px",
        margin_legend: width - 190,
        margin:{top: 180, left:200, bottom: 530, right: probe_name_length},
        med: 8.93,
        med_colour: "purple",
        probe_length: probe_name_length,
        sample_type_order: "DermalFibroblast, hONS", // "BM MSC,BM erythropoietic cells CD235A+,BM granulopoietic cells CD11B+,BM hematopoietic cells CD45+,Developing cortex neural progenitor cells,Ventral midbrain neural progenitor cells,Olfactory lamina propria derived stem cells",
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
        y_column: 'Expression_Value'//'prediction' // d.prediction
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

