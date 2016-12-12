// if you don't specify a html file, the sniper will generate a div with id "rootDiv"
var app = require("biojs-vis-scatter-plot");
function round_to_two_decimal_places(num){
    new_num = Math.round(num * 100) / 100;
    return new_num;
}

//An array of colours which are used for the different probes
/*
var colours = ["DarkOrchid", "Orange", "DodgerBlue", "Blue","BlueViolet","Brown", "Deeppink", "BurlyWood","CadetBlue",
"Chartreuse","Chocolate","Coral","CornflowerBlue","Crimson","Cyan", "Red", "DarkBlue",
"DarkGoldenRod","DarkGray", "Tomato", "Violet","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen",
"DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSlateBlue","DarkTurquoise",
"DarkViolet","DeepPink","DeepSkyBlue","DodgerBlue","FireBrick","ForestGreen","Fuchsia",
"Gold","GoldenRod","Green","GreenYellow","HotPink","IndianRed","Indigo"];
*/
var dataset_data = {"detectionThreshold": "6.2", "probeColours": ["red", "Orange", "DodgerBlue", "Blue", "BlueViolet", "Brown", "Deeppink", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Crimson", "Cyan", "Red", "DarkBlue", "DarkGoldenRod", "DarkGray", "Tomato", "Violet", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSlateBlue", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DodgerBlue", "FireBrick", "ForestGreen", "Fuchsia", "Gold", "GoldenRod", "Green", "GreenYellow", "HotPink", "IndianRed", "Indigo"], "sampleTypeDisplayGroupColours": {"0": {"0": "#9932cc", "1": "#7a28a3", "2": "#5b1e7a", "3": "#3c1451", "4": "#1d0a28", "5": "#000000"}, "1": {"0": "#ffa500", "1": "#d48900", "2": "#a96d00", "3": "#7e5100", "4": "#533500", "5": "#281900", "6": "#000000"}, "2": {"0": "#1e90ff", "1": "#1460aa", "2": "#0a3055", "3": "#000000"}, "3": {"0": "#0000ff", "1": "#0000e2", "2": "#0000c5", "3": "#0000a8", "4": "#00008b", "5": "#00006e", "6": "#000051", "7": "#000034", "8": "#000017", "9": "#000000"}, "4": {"0": "#8a2be2", "1": "#5c1c96", "2": "#2e0d4a", "3": "#000000"}, "5": {"0": "#a52a2a", "1": "#8d2424", "2": "#751e1e", "3": "#5d1818", "4": "#451212", "5": "#2d0c0c", "6": "#150606", "7": "#000000"}, "6": {"0": "#8b008b", "1": "#6f006f", "2": "#530053", "3": "#370037", "4": "#1b001b", "5": "#000000"}, "7": {"0": "#ff1493", "1": "#df1180", "2": "#bf0e6d", "3": "#9f0b5a", "4": "#7f0847", "5": "#5f0534", "6": "#3f0221", "7": "#1f-10e", "8": "#000000"}}, "Title": "Densely interconnected transcriptional circuits control cell states in human hematopoiesis", "y_axis_label": "Log2 Expression", "medianDatasetExpression": "8.81", "sampleTypeDisplayOrder": "Hematopoietic Stem Cell CD133+ CD34(dim),Hematopoietic Stem Cell CD38- CD34+,Common Myeloid Progenitor,Megakaryocyte/Erythroid Progenitor,Erythroid CD34+ CD71+ GlyA-,Erythroid CD34- CD71+ GlyA-,Erythroid CD34- CD71+ GlyA+,Erythroid CD34- CD71(lo) GlyA+,Erythroid CD34- CD71- GlyA+,Colony Forming Unit-Megakaryocytic (CFU-MK),Megakaryocyte,Granulocyte-Monocyte Progenitor,Colony Forming Unit-Granulocyte (CFU-G),Neutrophilic Metamyelocyte,Neutrophil,Colony Forming Unit-Monocyte (CFU-M),Monocyte,Eosinophil,Basophil,Myeloid Dendritic cell,Plasmacytoid Dendritic cell,Early B-cell,Pro B-cell,Naive B-cell,Mature B-cell (class able to switch),Mature B-cell,Mature B-cell (class switched),Mature NK Cell CD56- CD16+ CD3-,Mature NK Cell CD56+ CD16+ CD3-,Mature NK Cell CD56- CD16- CD3-,NKT,Naive T-cell CD8+,Effective Memory RA T-cell CD8+,Effective Memory T-cell CD8+,Central Memory T-cell CD8+,Naive T-cell CD4+,Effective Memory T-cell CD4+,Central Memory T-cell CD4+", "limitSortBy": "Sample Type", "cellsSamplesAssayed": "38 distinct hematopoietic cell states based on cell surface marker expression, representing hematopoietic stem and progenitor cells, terminally differentiated cells, and intermediate states", "sampleTypeDisplayGroups": "{\"Hematopoietic Stem Cell CD133+ CD34(dim)\":0,\"Hematopoietic Stem Cell CD38- CD34+\":0,\"Common Myeloid Progenitor\":0,\"Megakaryocyte/Erythroid Progenitor\":0,\"Erythroid CD34+ CD71+ GlyA-\":1,\"Erythroid CD34- CD71+ GlyA-\":1,\"Erythroid CD34- CD71+ GlyA+\":1,\"Erythroid CD34- CD71(lo) GlyA+\":1,\"Erythroid CD34- CD71- GlyA+\":1,\"Colony Forming Unit-Megakaryocytic (CFU-MK)\":2,\"Megakaryocyte\":2,\"Granulocyte-Monocyte Progenitor\":3,\"Colony Forming Unit-Granulocyte (CFU-G)\":3,\"Neutrophilic Metamyelocyte\":3,\"Neutrophil\":3,\"Colony Forming Unit-Monocyte (CFU-M)\":3,\"Monocyte\":3,\"Eosinophil\":3,\"Basophil\":3,\"Myeloid Dendritic cell\":4,\"Plasmacytoid Dendritic cell\":4,\"Early B-cell\":5,\"Pro B-cell\":5,\"Naive B-cell\":5,\"Mature B-cell (class able to switch)\":5,\"Mature B-cell\":5,\"Mature B-cell (class switched)\":5,\"Mature NK Cell CD56- CD16+ CD3-\":6,\"Mature NK Cell CD56+ CD16+ CD3-\":6,\"Mature NK Cell CD56- CD16- CD3-\":6,\"NKT\":6,\"Naive T-cell CD8+\":7,\"Effective Memory RA T-cell CD8+\":7,\"Effective Memory T-cell CD8+\":7,\"Central Memory T-cell CD8+\":7,\"Naive T-cell CD4+\":7,\"Effective Memory T-cell CD4+\":7,\"Central Memory T-cell CD4+\":7}"};
var colours = dataset_data["probeColours"];

var setup_colours_for_group = function (array_group, new_array, number_of_colours, colours) {
    var count = 0;
    for (i = 0; i< array_group.length; i++){
        if (count == number_of_colours){
            count = 0;
        }
        new_array[array_group[i]] = colours[count];
        count ++;
      }
    return new_array;
}

// tip which is displayed when hovering over a collumn. Displays the sample type
//of the collumn
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function(d) {
        sample_type = d.sample_type;
        temp =
            "Sample Type: " +  sample_type + "<br/>"
        return temp;
    });

// this tooltip function is passed into the graph via the tooltip
var tooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, +110])
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

//The url's to the data displayed
data_url= '../data/ds_id_5003_scatter_gata3.tsv';
//data_url = '../data/ds_id_2000_scatter_stat1.tsv';
//data_url = '../data/ds_id_2000_scatter_pdgfd.tsv';

/* Extracting the data from the csv files for use in the graph
 * Also sets relevent options based on the data passed in (for example
 * calculating the min and max values of the graph */
d3.tsv(data_url,function (error,data){
    max = 0;
    min = 0;
    number_of_increments = 0;
    count = 0;
    //make an array to store the number of probes for the legend
    probes_types = new Array();
    probes = new Array();
    probe_count = 0;
    //Saving the sample types and corrosponding id to use when
    //itterating over for the hovering over the ample types and altering the scatter
    //points for that sample type
    sample_types = new Array();
    sample_type_array = new Array();
    sample_type_count = 0;
    j = 0;
    //need to put in the number of colours that are being used (so that it
    //can reiitterate over them again if necesary
    number_of_colours = 39;
    colour_count = 0;
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
        if($.inArray(d.Probe, probes_types) == -1){
            probes_types.push(d.Probe);
            probe_count++;
        }
        if($.inArray(d.Sample_Type, sample_type_array) == -1) {
            //Gives each sample type a unique id so that they can be grouped
            //And highlighted together
            sample_type_array.push(d.Sample_Type);
            sample_types[d.Sample_Type] = sample_type_count;
            j++;
            sample_type_count ++;
        }
        count++;

    });
    //USed to set up the probes and their corrosponding
    //colours
    /*
    for(i = 0; i < probe_count; i++){
        probes[i] = [];
        probes[i][0] = probes_types[i];
      //  colour_count++;
        if(colour_count == number_of_colours){
            colour_count = 0;
        }
        probes[i][1] = colours[colour_count];
        colour_count++;
    }*/
    var probe_colour = {};//new Array();
    probe_colour = setup_colours_for_group(probes_types.sort(), probe_colour,
        number_of_colours, colours);
    var sample_colour =  {};//new Array();
    sample_colour = setup_colours_for_group(sample_type_array.sort(), sample_colour,
        number_of_colours, colours);

    // The number of increments is how large the increment size is for the
    // y axis (i.e. 1 per whole numner etc) e.g. or an increment per number = max - min
    //number_of_increments = max - min;
    // Turn number of increments into a whole number
    //number_of_increments |= 0;
    number_of_increments = max - min;
    var increment_value = 1;
    // this is when max-min is 0
    if (number_of_increments < dataset_data["medianDatasetExpression"])  {
        if (number_of_increments < dataset_data["detectionThreshold"])  {
            number_of_increments = Math.ceil(dataset_data["detectionThreshold"]);
        }
        else {
            number_of_increments = Math.ceil(dataset_data["medianDatasetExpression"]);
        }
    }
    // Turn number of increments into a whole number
    number_of_increments = Math.ceil(number_of_increments);

    if((number_of_increments * increment_value) < 6) {
        number_of_increments = 6;
    }
    if((number_of_increments * increment_value) > 10) {
        number_of_increments = 10;
    }


    probes = probes;
    sample_types = sample_types;
    probe_count = probe_count;
    title = "Scatter Plot";
    subtitle1 = dataset_data["Title"];
    subtitle2 = dataset_data["cellsSamplesAssayed"];
    target = rootDiv;

    // can always use just a straight value, but it's nicer when you calculate
    // based off the number of samples that you have
    width = data.length*1;
    horizontal_grid_lines = width;
    if (width < 1000){
        width = 1000;
    }

    //add
    var ref_name = {};
    var ref_type = "ensemblID";
    var symbol = "GATA3";
    if(ref_type == 'ensemblID') {
      ref_name[symbol] = symbol;
    }

    var sortByOption = "Smaple_Type";

    var split_sort_by_option = sortByOption.split(',');
    if (split_sort_by_option[0] == "Sample Type") {
        split_sort_by_option[0] = "Sample_Type";
    } else if (split_sort_by_option[1] == "Sample Type") {
        split_sort_by_option[1] = "Sample_Type";
    }

    var multi_group = 1;
    var whiskers_needed = true;
    var legend_required = "yes";
    var show_min_y_axis = false;




    //The main options for the graph
    var options = {
        split_sort_by_option: split_sort_by_option,
        multi_group: multi_group, // Indicates there is only 1 group on the x axis (probes)
        legend_list: {name: "probes", list: probes_types},
        colour_array: probe_colour, //probe_colours=
        /******** Options for Sizing *****************************************/
        legend_padding: 190,
        legend_rect_size: 20,
        height: 400,
        width: 900,
        margin:{top: 200, left: 100, bottom: 300, right: 250},
        initial_padding: 10,
        x_axis_label_padding: 10,//padding for the x axis labels (how far below the graph)
        text_size: "12px",
        title_text_size: "16px",

        //tooltip_multiview: tooltip_multiview,
        //increment: 0.2,
        increment: number_of_increments * increment_value, // To double the number of increments ( mutliply by 2, same for
        // reducing. Number of increments is how many numbers are displayed on the y axis. For none to
        // be displayed multiply by 0
        // changes masde by isha to show horizontal and vertical lines
        display: {hoverbars: "no", error_bars: "yes", legend: legend_required, horizontal_lines: "yes", legend_hover: "no", vertical_lines: "yes", x_axis_labels: "yes", y_axis_title: "yes", horizontal_grid_lines: "yes"},

        circle_radius: 2,  // for the scatter points
        hover_circle_radius: 10,
        /*********** End of sizing options **********************************/

        background_colour: "white",
        background_stroke_colour:  "black",
        background_stroke_width:  "1px",
        colour: colours,
        font_style: "Arial",
        grid_colour: "black",
        ref_name: ref_name,
        grid_opacity: 0.5,
        y_label_text_size: "14px",
        y_label_x_val: 40,
        data: data,
        whiskers_needed: whiskers_needed,
        sortByOption: sortByOption,
        show_min_y_axis: show_min_y_axis,
        // eq. yes for x_axis labels indicates the user wants labels on the x axis (sample types)
        // indicate yes or no to each of the display options below to choose which are displayed on the graph
        domain_colours : ["#FFFFFF","#7f3f98"],
        error_bar_width:5,
        error_stroke_width: "1px",
        error_dividor:100,//100 means error bars will not show when error < 1% value
        //horizontal lines takes a name, colour and the yvalue. If no colour is given one is chosen at random
        horizontal_lines: [["Detection Threshold "+dataset_data["detectionThreshold"] , "green",dataset_data["detectionThreshold"]], ["Median "+dataset_data["medianDatasetExpression"], , dataset_data["medianDatasetExpression"]]],
        horizontal_line_value_column: 'value',
        //to have horizontal grid lines = width (to span accross the grid), otherwise = 0
        horizontal_grid_lines: width,
        legend_class: "legend",
        legend_range: [0,100],
        line_stroke_width: "2px",
        //default number of colours iis 39 (before it reitterates over it again)
        number_of_colours: 39,
        //2 is the chosen padding. On either side there will be padding = to the interval between the points
        //1 gives 1/2 the interval on either side etc.
        padding: 2,
        probe_count: probe_count,
        probes: probes_types,
        //sample type order indicates whether or not the samplese need to be represented in a specific order
        //if no order is given then the order from the data set is taken
        disease_state_order: "none", //Order of the disease state on the x axis
        sample_type_order:dataset_data["sampleTypeDisplayOrder"],// "DermalFibroblast, hONS", // "BM MSC,BM erythropoietic cells CD235A+,BM granulopoietic cells CD11B+,BM hematopoietic cells CD45+,Developing cortex neural progenitor cells,Ventral midbrain neural progenitor cells,Olfactory lamina propria derived stem cells",
        sample_types: sample_types,
        // Can fit 4 subtitles currently
        subtitles: [subtitle1,subtitle2],
        stroke_width:"3px",
        target: target,
        title: title,
        title_class: "title",
        tip: tip,//second tip to just display the sample type
        tooltip: tooltip, // using d3-tips
        //tooltip1: tooltip1, // using d3-tips unique_id: "chip_id",
        watermark:"https://www.stemformatics.org/img/logo.gif",
        x_axis_text_angle:-45,
        x_axis_title: "Samples",
        x_column: 'Sample_ID',
        x_middle_title: 500,
        y_axis_title: dataset_data["y_axis_label"],
        y_column: 'Expression_Value'
    }

    var instance = new app(options);

    // Get the d3js SVG element
    var tmp = document.getElementById(rootDiv.id);
    var svg = tmp.getElementsByTagName("svg")[0];
    // Extract the data as SVG text string
    var svg_xml = (new XMLSerializer).serializeToString(svg);

});
