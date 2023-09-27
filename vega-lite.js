/** all credit to original owner
 * Fixes the chart sizing so that it doesn't overflow outside
 * of lookers 'vis' container.
 * @returns void
 */
const fixChartSizing = () => {
    const container = document.getElementById('vis');
    container.style.overflow = 'hidden';
    const svg = container.querySelector('svg');
    svg.setAttribute('height', container.clientHeight);
    svg.setAttribute('width', container.clientWidth);
};

looker.plugins.visualizations.add({
    create: function(element, config){

        var container = element.appendChild(document.createElement("div"));
        container.setAttribute("id","my-vega");

        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = "#vg-tooltip-element { font-family: Open Sans,Helvetica,Arial,sans-serif}";
        element.appendChild(css);
        var embedPadding = document.createElement("style");
        embedPadding.innerHTML = ".vega-embed {padding-right: 0px !important}";
        element.appendChild(embedPadding);
        var formStyle = document.createElement("style");
        formStyle.type = "text/css";
        formStyle.setAttribute("id","annotFormStyle");
        formStyle.innerHTML = "input[type=text], select, textarea {width: 100%;padding: 12px;border: 1px solid #ccc;border-radius: 4px;box-sizing: border-box;margin-top: 6px;margin-bottom: 16px;resize: vertical;}input[type=button] {background-color: #4CAF50;color: white;padding: 12px 20px;border: none;border-radius: 4px;cursor: pointer;}input[type=button]:hover {background-color: #45a049;}#annotation-input {width: 50%;margin-left: auto;margin-right: auto;border-radius: 5px;background-color: #f2f2f2;padding: 20px;}";
        element.appendChild(formStyle);
    },
    updateAsync: function(data, element, config, queryResponse, details, done){

      var visMaster = this;

      var myData = [];
      var dataProperties = {};
      var dims = [];
      var meas = [];
      var allFields = [];
      var options = {};

      var createOptionsResponse = createOptions(queryResponse);

      console.log(config);

      options = createOptionsResponse['options'];

      var optionsMasterList = createOptionsResponse['masterList'];

      this.trigger('registerOptions', options);  

      const thisViz = this;

      //create array of all measures for lookup purposes
      queryResponse.fields.measure_like.forEach(function(field){
        var fieldName = (field.name).replace(".","_");
        meas.push(fieldName);      
      });
      //create array of all dimensions for lookup purposes
      queryResponse.fields.dimension_like.forEach(function(field){
        var fieldName = (field.name).replace(".","_");
        dims.push(fieldName);      
      });

      allFields = meas.concat(dims);

      dataProperties = createMetaData(allFields,queryResponse);


      if (Object.keys(config).length > 3) {

        var fieldSettingArray = ["x","y","x2","y2","column","row","color","color2","size","size2","shape","shape2","highlight","sort","order","labelField","labelFilter"];
        // var lookerColors = ["#3eb0d5","#B1399E","#C2DD67","#592EC2","#4276BE","#72D16D","#FFD95F","#B32F37","#9174F0","#E57947","#75E2E2","#FBB555"];
        // var vividColors = ["#3D52B9","#08B248","#A918B4","#FC2E31","#FC9200","#2B99F7","#C9DC10","#FA2F90","#FCBF00","#24BED5","#149888","#6F38BB","#8B97D5","#6BD191","#CB74D2","#FD8283","#FDBE66","#DFEA70"];
        
        var lookerColors = {
          "looker":["#3eb0d5","#B1399E","#C2DD67","#592EC2","#4276BE","#72D16D","#FFD95F","#B32F37","#9174F0","#E57947","#75E2E2","#FBB555"],
          "looker-vivid":["#3D52B9","#08B248","#A918B4","#FC2E31","#FC9200","#2B99F7","#C9DC10","#FA2F90","#FCBF00","#24BED5","#149888","#6F38BB","#8B97D5","#6BD191","#CB74D2","#FD8283","#FDBE66","#DFEA70"]
        }

        for (var fieldChoice in config) {
          if (typeof config[fieldChoice] != "object") {
            if (fieldSettingArray.includes(fieldChoice)) {
              if (!allFields.includes(config[fieldChoice]) && config[fieldChoice] != "") {
                var updateArray = [];
                var updateObj = {};

                if (fieldChoice == "x") {
                  updateObj[fieldChoice] = defaultDim;
                } else if (fieldChoice == "y") {
                  updateObj[fieldChoice] = defaultMes;
                } else {
                  updateObj[fieldChoice] = "";
                }

                updateArray.push(updateObj);
                thisViz.trigger("updateConfig", updateArray);
              } 
            }
          }
        }

        var configFields = Object.values(config);
        // console.log(configFields);
        var detailFields = [];
        // for (var i = dims.length - 1; i >= 0; i--) {
        //   if(!configFields.includes(dims[i])) {
        //     if (config['color'] == "") {
        //       config['color'] = dims[i];
        //       thisViz.trigger("updateConfig", updateArray);
        //     }
        //   }
        // }

        // console.log(detailFields);

        // console.log(config);

      // var parent = document.getElementById("my-vega").parentElement;
      var chartHeight = element.offsetHeight * 0.96; // - 35
      var chartWidth = element.offsetWidth * 0.96 - 62;

      if (config['legendPosition'] == "top" || config['legendPosition'] == "bottom") {
        chartHeight = chartHeight - (40 + 18 + config['legendPadding']);
      }

      if (config['legendPosition'] == "left" || config['legendPosition'] == "right") {
        chartWidth = chartWidth - (70 + config['legendPadding']);
      }

      if (dataProperties[config['y']]['dtype'] == "nominal") {
        if (config['axisLabelAngle'] == 0 || typeof config['axisLabelAngle'] == "undefined") {
          chartWidth = chartWidth - 47;
        }
      }

      if (dataProperties[config['x']]['dtype'] == "nominal") {
        if (Math.abs(config['axisLabelAngle']) != 0 || typeof config['axisLabelAngle'] == "undefined") {
          chartHeight = chartHeight - 59;
        }
      }

      // console.log(chartWidth);
      // console.log(chartHeight);

      for (var cell in data) {
        var obj = data[cell];
        var dataDict = {};
        dataDict['links'] = [];
        for (var key in obj){
          var shortName = key.replace(".","_");
          dataDict[shortName] = obj[key]['value'];
          if (typeof obj[key]['links'] != "undefined") {

            //create array of all links for a row of data
            for(var l=0;l<obj[key]['links'].length;l++){

              //grab link label and add field name for clarity in menu
              var currentLabel = obj[key]['links'][l]['label'];
              currentLabel = currentLabel + " (" + (key.substring(key.indexOf(".")+1)).replace(/_/g," ") + ")";
              obj[key]['links'][l]['label'] = currentLabel;
            }
            //add links for field in row
            dataDict['links'].push(obj[key]['links']);
          }
          if (typeof obj[key]["sort_value"] != "undefined") {
            dataDict[shortName + '_properSort'] = obj[key]["sort_value"];
          }
        }

        //flatten to make single depth array
        dataDict['links'] = dataDict['links'].flat();
        myData.push(dataDict);
      }

      var rowValues = [];
      var colValues = [];

      //auto-size settings when a row facet included
      if (typeof config['row'] != "undefined" && typeof config['row'] != "" && config['fixed_height'] == null) {
        for (var x = 0; x < myData.length; x++) {
          rowValues.push(myData[x][config['row']]);
        }
        let uniqueRows = new Set(rowValues); 
        chartHeight = Math.max( (chartHeight / uniqueRows.size), (chartHeight / 12) );       
      }

      //auto-sizing settings when a column facet included
      if (typeof config['column'] != "undefined" && config['column'] != "" && config['fixed_width'] == null) {
        for (var x = 0; x < myData.length; x++) {
          colValues.push(myData[x][config['column']]);
        }
        let uniqueCols = new Set(colValues); 
        chartWidth = Math.max( (chartWidth / uniqueCols.size), (chartWidth / 12) ) ;       
      }

      //manual-sizing for chart height
      if (typeof config['fixed_height'] != "undefined" && config['fixed_height'] != null) {
        chartHeight = config['fixed_height'];
      }

      //manual-sizing for chart width
      if (typeof config['fixed_width'] != "undefined" && config['fixed_width'] != null) {
        chartWidth = config['fixed_width'];
      }      

      //construct the tooltip with appropriate formatting
      var tooltipFields = [];

      for (var datum in dataProperties) {
        var fieldsToExclude = [];

        if (config['includeInTip'] != "") {
          fieldsToExclude = config['includeInTip'].split(",").map(function(item){ return item.trim()});
        } 

        if (!fieldsToExclude.includes(dataProperties[datum]['title'])) {
          var tip = {};
          tip['field'] = datum;
          tip['type'] = dataProperties[datum]['dtype'];
          tip['format'] = dataProperties[datum]['valueFormat'];
          tip['title'] = dataProperties[datum]['title'];
          tooltipFields.push(tip);
        }
      }


      //switch to compatible mark if trying to utilize shape
      if (config['shape'] != "") {
        config['mark_type'] = "point";
      }
      //set expected size for bar
      // if (config['mark_type'] == "bar") {
      //   config['fixed_size'] = -1;
      // }

      var chart = {
        "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
        "data": {
          "values": myData
        },
        "resolve": {
          "scale": {
            "x": null,
            "y": null,
            "color": null,
            "legend": null
          }
        },
        "facet" : {},
        "config": {
          // "autosize": {
          //   "type": "fit",
          //   "contains": "padding"
          // }, 
          "axis": {
            "titleFont":"Open Sans,Helvetica,Arial,sans-serif",
            "labelFont":"Open Sans,Helvetica,Arial,sans-serif",
            "labelColor": "#666666",
            "titleColor": "#666666",
            "titleFontWeight": "bold",
            "gridOpacity": config['gridOpacity']
          },
          "header": {
            "titleFont":"Open Sans,Helvetica,Arial,sans-serif",
            "labelFont":"Open Sans,Helvetica,Arial,sans-serif",
            "labelColor": "#666666",
            "titleColor": "#666666",
            "titleFontWeight": "bold"
          },
          "legend": {
            "titleFont":"Open Sans,Helvetica,Arial,sans-serif",
            "labelFont":"Open Sans,Helvetica,Arial,sans-serif",
            "labelColor": "#666666",
            "orient": config['legendPosition'],
            "titleColor": "#666666",
            "titleFontWeight": "bold",
            "symbolSize": 150
          }
          // "circle": {"opacity":config['opacity']},
          // "bar": {"opacity":config['opacity']}
        },
        "transform": [
          {
            "calculate": "0", "as": "alignLeft"
          }
        ],
        "spec": {
          "layer": [ {
            "mark": {
              "type": config['mark_type'], 
              "fillOpacity": config['opacity'],
              "stroke": config['border'][0]
            },
            "encoding": {}
          }
          ],
          "width": chartWidth,
          "height": chartHeight        
        }
      };

      if (config['legendColumns'] != "") {
        chart.config.legend.columns = config['legendColumns'];
      }

      if (config['legendBorder'] != "") {
        chart.config.legend.strokeColor = config['legendBorder'];
      }

      if (config['legendPadding'] != "") {
        chart.config.legend.padding = config['legendPadding'];
      }

      if (config['legendRadius'] != "") {
        chart.config.legend.cornerRadius = config['legendRadius']; 
      }

      if (config['axisLabelAngle'] != null) {
        chart.config.axis.labelAngle = config['axisLabelAngle'];
      }

      // Fix sizing on next tick

      if (config['chartAutoSize'] == "yes") {
        setTimeout( () => fixChartSizing(), 0);
      } else {
        const container = document.getElementById('vis');
        container.style.overflow = 'scroll';
      }

      ////////////////////////////////////////////
     //check and add another layer if requested//
    ////////////////////////////////////////////
     var layerCount = (chart.spec.layer).length;

     //update sizing
      if (config['mark_type'] == 'circle' || config['mark_type'] == 'line') {
        config['fixed_size'] = Math.pow(config['fixed_size'],1.8);
      }

      if (config['mark_type2'] == 'circle' || config['mark_type2'] == 'line') {
        config['fixed_size2'] = Math.pow(config['fixed_size2'],1.8);
      }
      /////////////////////////////////
      //check and add layers///////////
     //add another layer on the X axis
     if (config['x2'] != "" && typeof config['x2'] != "undefined") {

      var secondLayer = {
        "encoding": {},
        "mark": {
          "type": config['mark_type2'],
          "fillOpacity":config['opacity2'],
          "thickness":3,
          "stroke":config['border2'][0]
          }
        };
      
      // secondLayer = {
      //   "encoding": {},
      //   "mark": {
      //     "type": config['mark_type2'],
      //     "fillOpacity":config['opacity2'],
      //     "thickness":3,
      //     "stroke":config['border2'][0]
      //     }
      //   };

        // secondLayer.encoding.x = {};

      } else if (config['y2'] != "" && typeof config['y2'] != "undefined") {
        var secondLayer = {
          "encoding": {},
          "mark": {
            "type": config['mark_type2'],
            "fillOpacity":config['opacity2'],
            "thickness":3,
            "stroke":config['border2'][0]
            }
          };
      }

      //add another layer on the Y axis
     // if (config['y2'] != "" && typeof config['y2'] != "undefined") {
     //  secondLayer = {
     //    "encoding": {},
     //    "mark": {
     //      "type": config['mark_type2'],
     //      "fillOpacity":config['opacity2'],
     //      "thickness":3,
     //      "stroke":config['border2'][0]
     //    }
     //  };

     //  //use newly selected value on Y
     //  // secondLayer.encoding.y = {};
     //  //re-aggregate the measure if requested, useful for an average line

     //  } 

      //End additional layer section//     
     ////////////////////////////////

      //add column or row facet
      //row & column facets
      if (config['column'] != "" && typeof config['column'] != "undefined") {
        //add column facet
        chart.facet.column = {"field":config['column'],"type":dataProperties[config['column']]['dtype'],"title": dataProperties[config['column']]['title']};
        // check for independent axes
        if (config['resolve_y'] != "" && config['y'] != "") {
          chart.resolve = {"scale": {"y":"independent"}};
        }
        if (config['resolve_x'] != "" && config['x'] != "") {
          chart.resolve = {"scale": {"x":"independent"}};
        }
      }      
      if (config['row'] != "" && typeof config['row'] != "undefined") {
        //add row facet
        chart.facet.row = {"field":config['row'],"type":dataProperties[config['row']]['dtype'],"title": dataProperties[config['row']]['title']};
        // check for independent axes
        if (config['resolve_y'] != "" && config['y'] != "") {
          chart.resolve = {"scale": {"y":"independent"}};
        }
        if (config['resolve_x'] != "" && config['x'] != "") {
          chart.resolve = {"scale": {"x":"independent"}};
        }        
      }

      //////////////////////////////////////////
      ///End Faceting//////////////////////////
      ////////////////////////////////////////
      chart.spec.layer[0].selection = {};
      //add selection handler to chart
        if (config['highlight'] != "" && typeof config['highlight'] != "undefined") {
          chart.spec.layer[0].selection['paintbrush'] = {
            "type" : "multi",
            "on" : "mouseover", "empty":"all","fields":[config['highlight']]
          };
        }

    var layerCount = (chart.spec.layer).length;
    
      //adjust opacity if circle
      if (config['mark_type'] == "circle" || config['mark_type'] == "point") {
        chart.spec.layer[0].mark.opacity = config['opacity'];
      }

      if (config['mark_type2'] == "circle" || config['mark_type2'] == "point") {
        if (typeof secondLayer != "undefined" && secondLayer != "") {
          secondLayer.mark.opacity = config['opacity2'];
          // secondLayer.mark.opacity = config['opacity2'];
        }
      }

      //checks for building viz based on config selections//
     //////////////////////////////////////////////////////

     //add points to line to ensure proper drill through
     var marksNeedingPoints = ["line","trail","area"];
     // "mark": {"type": "line", "color": "green", "point": {"color": "red"}},
     if (marksNeedingPoints.includes(config['mark_type'])) {
      chart.spec.layer[0].mark.point = {"color":config['fixed_color']};
     }

     if (marksNeedingPoints.includes(config['mark_type2'])) {
      if (typeof secondLayer != "undefined" && secondLayer != "") {
        secondLayer.mark.point = {"color": config['fixed_color2']};
        // secondLayer.mark.point = {"color":config['fixed_color2']};
      }
     }

     // set x and y axis
     if (config['y'] != "" && typeof config['y'] != "undefined") {
      chart.spec.layer[0].encoding.y = {
        "field": config['y'], 
        "type": dataProperties[config['y']]['dtype'], 
        "title": dataProperties[config['y']]['title'], 
        "scale": {"zero": config['unpin_y']}
      };
     }

      if (typeof secondLayer != "undefined" && secondLayer != "") {

        if (config['x2'] != "" && typeof config['x2'] != "undefined") {
          secondLayer.encoding.y = {
            "field": config['y'],
            "type": dataProperties[config['y']]['dtype'],
            "scale": {"zero": config['unpin_y']}      
          };
          secondLayer.encoding.x = {
            "field":config['x2'],
            "type":dataProperties[config['x2']]['dtype'],
            "scale":{"zero":config['unpin_x']}
          };
        }

        if (config['y2'] != "" && typeof config['y2'] != "undefined") {
          secondLayer.encoding.x = {
            "field": config['x'],
            "type": dataProperties[config['x']]['dtype'],
            "scale": {"zero": config['unpin_x']} 
          };
          secondLayer.encoding.y = {
            "field":config['y2'],
            "type":dataProperties[config['y2']]['dtype'],
            "scale":{"zero":config['y2']}
          }
        }
      }

     //set tooltip
     chart.spec.layer[0].encoding.tooltip = tooltipFields;

     if (typeof secondLayer != "undefined") {
      secondLayer.encoding.tooltip = tooltipFields;
     }

     if (config['x'] != "" && typeof config['x'] != "undefined") {
      chart.spec.layer[0].encoding.x = {
        "field": config['x'], 
        "type": dataProperties[config['x']]['dtype'], 
        "title": dataProperties[config['x']]['title'],
        "scale": {"zero": config['unpin_x']}
      };
     }

     if (config['normalize']) {
      if (config['mark_type'] == "bar" || config['mark_type'] == "area") {
        chart.spec.layer[0].encoding.x.stack = "normalize";
        chart.spec.layer[0].encoding.y.stack = "normalize";
      }
     }

      //coloring properties layer 1//

      //list of categorical schemes not compatible with sequential data
      var myColorPalettes = ["tableau10","tableau20","dark2","category20b","set2","looker","looker-vivid"];

      //change color domain based on user input
      if (config['domain'] != "" && typeof config['domain'] != "undefined") {
        var colorDomain = [];
        //parse the string input by user into array of integers
        for (num in config['domain'].split(",")) {
          colorDomain.push(Number(config['domain'].split(",")[num]));
        }       
      }

     //color domain for second layer
      if (typeof secondLayer != "undefined" && secondLayer != "") {
        if (config['domain2'] != "" && typeof config['domain2'] != "undefined") {
          var colorDomain2 = [];
          //parse the string input by user into array of integers
          for (num in config['domain2'].split(",")) {
            colorDomain2.push(Number(config['domain2'].split(",")[num]));
          }       
        } 
      }

      //set default color sceme
      if (config['color_scheme'] == "") {
        config['color_scheme'] = "tableau10"
      }

      if (config['color_scheme2'] == "") {
        config['color_scheme2'] = "tableau10"
      }

      //set highlighting based on selection, use color selected on marks page
      if (config['highlight'] != "" && typeof config['highlight'] != "undefined") {
        //assign default color if none selected
        chart.spec.layer[0].encoding.color = {
        "condition": {
          "scale": {"type":"ordinal","scheme":config['color_scheme']},
          //use aformentioned select
          "selection" : "paintbrush",
          //field to drive the highlight
          "field":config['highlight'], "type": dataProperties[config['highlight']]['dtype'], "title": dataProperties[config['highlight']]['title']
          },
        //value if false 
        "value":"#B8B8B8"
        };

        if (config['color_scheme'].includes("looker")) {
          chart.spec.layer[0].encoding.color.condition.scale = {"range": lookerColors[config['color_scheme']]};
        }

      } else if (config['color'] != "" && typeof config['color'] != "undefined") {
        //if user has changed the field to color by
        //add color setting based on data type
        chart.spec.layer[0].encoding.color = {"field": config['color'], "type": dataProperties[config['color']]['dtype'],"title": dataProperties[config['color']]['title']};
        //check if quantitative or nominal
        if (dataProperties[config['color']]['dtype'] == 'quantitative') {
          //determine scale and scheme based on data type
          if (config['color_scheme'] == "") {
            //if color scheme left on auto, assign the blues
            chart.spec.layer[0].encoding.color.scale = {"type": "sequential", "scheme":"blues"};
          } else {
            //if color scheme is categorical, but used with quantitative data, switch it to the blues by default
            if (myColorPalettes.includes(config['color_scheme'])) {config['color_scheme'] = "blues";}
            //apply new color scheme for sequential data, include domain manually provided
            chart.spec.layer[0].encoding.color.scale = {"type": "sequential", "scheme": {"name" : config['color_scheme']}, "domain" : colorDomain};
          }
        } else if (dataProperties[config['color']]['dtype'] == 'nominal') {
          if (config['color_scheme'] == "") {
            //if color scheme is auto, use tableau10
            chart.spec.layer[0].encoding.color.scale = {"type": "ordinal", "scheme":"tableau10"};
          } else {
            //assign selected color scheme otherwise - ordinal will work with quantitative data so no checking required
            if (config['color_scheme'].includes("looker")) {
              chart.spec.layer[0].encoding.color.scale = {"range": lookerColors[config['color_scheme']]};
            } else {
              chart.spec.layer[0].encoding.color.scale = {"type": "ordinal", "scheme":config['color_scheme']};
            }
          }
        }
      } else {
        if (config['mark_type'] == "line") {
          //color the stoke if it's a line to avoid it being filled
          chart.spec.layer[0].mark.stroke = config['fixed_color'];
        } else {
          //color the fill of the mark if not a line
          chart.spec.layer[0].mark.fill = config['fixed_color'];
        }
      }
      //End coloring section layer 1//
      ///////////////////////////////
      ///////////////////////////////
      //Begin coloring section layer 2//

      
    if (typeof secondLayer != "undefined" && secondLayer != "") {

      if (config['color2'] != "" && typeof config['color2'] != "undefined") {

        //if user has changed the field to color by
        //add color setting based on data type
        secondLayer.encoding.color = {"field": config['color2'], "type": dataProperties[config['color2']]['dtype'],"title": dataProperties[config['color2']]['title']};
        //check if quantitative or nominal
        if (dataProperties[config['color2']]['dtype'] == 'quantitative') {
          //determine scale and scheme based on data type
          if (config['color_scheme2'] == "") {
            //if color scheme left on auto, assign the blues
            secondLayer.encoding.color.scale = {"type": "sequential", "scheme":"blues"};
          } else {
            //if color scheme is categorical, but used with quantitative data, switch it to the blues by default
            if (myColorPalettes.includes(config['color_scheme2'])) {
              config['color_scheme2'] = "blues";
            }
            //apply new color scheme for sequential data, include domain manually provided
            secondLayer.encoding.color.scale = {"type": "sequential", "scheme": {"name" : config['color_scheme2']}, "domain" : colorDomain2};
          }
        } else if (dataProperties[config['color2']]['dtype'] == 'nominal') {
          if (config['color_scheme2'] == "") {
            //if color scheme is auto, use tableau10
            secondLayer.encoding.color.scale = {"type": "ordinal", "scheme":"tableau10"};
          } else {
            //assign selected color scheme otherwise - ordinal will work with quantitative data so no checking required
            secondLayer.encoding.color.scale = {"type": "ordinal", "scheme":config['color_scheme2']};
          }
        }        
      } else if (config['fixed_color2'] != "" && typeof config['fixed_color2'] != "undefined") {

        if (config['mark_type2'] == "line") {
          //color the stoke if it's a line to avoid it being filled
          secondLayer.mark.stroke = config['fixed_color2'];
        } else {
          //color the fill of the mark if not a line
          secondLayer.mark.fill = config['fixed_color2'];
        }

      } else if (config['color'] != "" && typeof config['color'] != "undefined") {
        //if user has changed the field to color by
        //add color setting based on data type
        secondLayer.encoding.color = {"field": config['color'], "type": dataProperties[config['color']]['dtype'],"title": dataProperties[config['color']]['title']};
        //check if quantitative or nominal
        if (dataProperties[config['color']]['dtype'] == 'quantitative') {
          //determine scale and scheme based on data type
          if (config['color_scheme'] == "") {
            //if color scheme left on auto, assign the blues
            secondLayer.encoding.color.scale = {"type": "sequential", "scheme":"blues"};
          } else {
            //if color scheme is categorical, but used with quantitative data, switch it to the blues by default
            if (myColorPalettes.includes(config['color_scheme'])) {config['color_scheme'] = "blues";}
            //apply new color scheme for sequential data, include domain manually provided
            secondLayer.encoding.color.scale = {"type": "sequential", "scheme": {"name" : config['color_scheme']}, "domain" : colorDomain};
          }
        } else if (dataProperties[config['color']]['dtype'] == 'nominal') {
          if (config['color_scheme2'] == "") {
            //if color scheme is auto, use tableau10
            secondLayer.encoding.color.scale = {"type": "ordinal", "scheme":"tableau10"};
          } else {
            //assign selected color scheme otherwise - ordinal will work with quantitative data so no checking required
            secondLayer.encoding.color.scale = {"type": "ordinal", "scheme":config['color_scheme']};
          }
        }
      } else {
        if (config['mark_type2'] == "line") {
          //color the stoke if it's a line to avoid it being filled
          secondLayer.mark.stroke = config['fixed_color2'];
        } else {
          //color the fill of the mark if not a line
          secondLayer.mark.fill = config['fixed_color2'];
        }
      }
    }


      var sizableMarks = ["point", "square", "circle", "tick", "bar", "text"];

      //shape properties
      if (config['shape'] != "" && typeof config['shape'] != "undefined") {
        chart.spec.layer[0].encoding.shape = {"field": config['shape'], "type": dataProperties[config['shape']]['dtype'],"title": dataProperties[config['shape']]['title']};
      }

      //shape properties layer 2
      if (typeof secondLayer != "undefined" && secondLayer != "") {
        if (config['shape2'] != "" && typeof config['shape2'] != "undefined") {
          secondLayer.encoding.shape = {"field": config['shape2'], "type": dataProperties[config['shape2']]['dtype'],"title": dataProperties[config['shape2']]['title']};
        }        
      }

      //set style of line
      if (config['line_style'] != "" && typeof config['line_style'] != "undefined" && config['mark_type'] == "line") {
        chart.spec.layer[0].mark.interpolate = config['line_style'];
      }

      //set style of line 2
      if (typeof secondLayer != "undefined" && typeof secondLayer != "") {
        if (config['line_style2'] != "" && typeof config['line_style2'] != "undefined" && config['mark_type2'] == "line") {
          secondLayer.mark.interpolate = config['line_style2'];
        }        
      }

      //sizing properties
      if (config['size'] != "" && typeof config['size'] != "undefined") {
        chart.spec.layer[0].encoding.size = {"field": config['size'], "type": dataProperties[config['size']]['dtype'],"title": dataProperties[config['size']]['title']};
      } else {
        if (config['mark_type'] == "bar") {
          if (config['fixed_size'] == 12) {
            chart.spec.layer[0].mark.discreteBandSize = 1;
          } else {
            chart.spec.layer[0].mark.size = config['fixed_size']
          }
        } else {
          
          if (config['mark_type'] == "line") {
            chart.spec.layer[0].mark.point.size = config['fixed_size'];
          } else {
            chart.spec.layer[0].mark.size = config['fixed_size'];
          }
          
        }
        
      }

      //sizing properties 2
      if (typeof secondLayer != "undefined" && secondLayer != "") {
        if (config['size2'] != "" && typeof config['size2'] != "undefined") {
          secondLayer.encoding.size = {"field": config['size2'], "type": dataProperties[config['size2']]['dtype'],"title": dataProperties[config['size2']]['title']};
        } else {
          if (config['mark_type2'] == "bar") {
            if (config['fixed_size2'] == 12) {
              secondLayer.mark.discreteBandSize = 1;
            } else {
              secondLayer.mark.size = config['fixed_size2']
            }
          } else {
            secondLayer.mark.size = config['fixed_size2'];
          }
          
        }       
      }

    //add the second layer
    if (secondLayer != "" && typeof secondLayer != "undefined") {
      chart.spec.layer.push(secondLayer);
    }

      //default labels (apply to whichever field has measure?)
      //for faceted charts, make no changes. Check for when no facets but field exists on color to resolve color legend appropriately
      // if (config['labelDefault'] != "" && typeof config['labelDefault'] != "undefined") {
      //   var numLayers = chart.spec.layer.length;
      //   // chart.spec.resolve = {
      //   //   "scale": {
      //   //     "color": "independent"
      //   //   }
      //   // };
      //   var whatIsX = dataProperties[config['x']]['dtype'];
      //   var whatIsY = dataProperties[config['y']]['dtype'];
      //   if (whatIsX == "quantitative") {
      //     //add labels for X encoded by Y
      //     var labelLayer = {
      //       "mark": {
      //         "type": "text",
      //         "align": "left",
      //         "baseline": "middle",
      //         "color": "black",
      //         "font":"Open Sans,Helvetica,Arial,sans-serif"
      //       },
      //       "encoding": {
      //         "text": {"field": config['x'], "type": dataProperties[config['x']]['dtype'], "format": dataProperties[config['x']]['valueFormat']},
      //         "y": {"field": config['y'], "type": dataProperties[config['y']]['dtype']},
      //         "x": {"field": config['x'], "type": dataProperties[config['x']]['dtype'], "stack": "zero"}
      //       }
      //     };

      //     if (config['color'] != "" && typeof config['color'] != "undefined" && config['column'] == "" && config['row'] == "") {
      //        labelLayer.encoding.color = {"field": config['color'], "type": dataProperties[config['color']]['dtype'], "scale": {"range":["black"]}, "legend": null};
      //        chart.spec.resolve = {
      //         "scale": {
      //           "color": "independent"
      //         }
      //        };
      //     }

      //     chart.spec.layer.push(labelLayer);
      //   } else if (whatIsY == "quantitative") {
      //     //add labels for Y encoded by X
      //     var labelLayer = {
      //       "mark": {
      //         "type": "text",
      //         "align": "center",
      //         "baseline": "middle",
      //         "color": "black",
      //         "font":"Open Sans,Helvetica,Arial,sans-serif",
      //         "dy": 7
      //       },
      //       "encoding": {
      //         "text": {"field": config['y'], "type": dataProperties[config['y']]['dtype'], "format": dataProperties[config['y']]['valueFormat']},
      //         "y": {"field": config['y'], "type": dataProperties[config['y']]['dtype'], "stack": "zero"},
      //         "x": {"field": config['x'], "type": dataProperties[config['x']]['dtype']}
      //       }
      //     };

      //     if (config['color'] != "" && typeof config['color'] != "undefined") {
      //        labelLayer.encoding.detail = {"field": config['color'], "type": dataProperties[config['color']]['dtype']};
      //     } 
      //     chart.spec.layer.push(labelLayer);
      //   }
      // }

      if (config['labelField'] != "" && typeof config['labelField'] != "undefined") {
        var labelPinY;
        var labelPinX;

        labelPinY = config['y'];
        labelPinX = config['x'];

        if (config['labelPin'] == "zero") {
          if (dataProperties[config['x']]['dtype'] == "quantitative") {
            labelPinX = "alignLeft";
          } else if (dataProperties[config['y']]['dtype'] == "quantitative"){
            labelPinY = "alignLeft";
          }
        }
          
          var labelLayer = {
            "transform": [
            ],
            "mark": {
              "type": "text",
              "align": config['labelAlign'],
              "baseline": config['labelBaseline'],
              "color": config['labelColor'][0],
              "font":"Open Sans,Helvetica,Arial,sans-serif",
              "fontSize": config['labelSize'],
              "angle": config['labelAngle'],
              "dx": config['dx'],
              "dy": config['dy'],
              "tooltip": null
            },
            "encoding": {
              "text": {"field": config['labelField'], "type": dataProperties[config['labelField']]['dtype'], "format": dataProperties[config['labelField']]['valueFormat']},
              "y": {"field": labelPinY, "type": dataProperties[config['y']]['dtype'], "stack": "zero"},
              "x": {"field": labelPinX, "type": dataProperties[config['x']]['dtype'], "stack": "zero"}
            }
          };

          if (config['mark_type'] != "bar") {
            labelLayer.encoding.x.stack = null;
            labelLayer.encoding.y.stack = null;
          }

          if (config['normalize']) {
            labelLayer.encoding.x.stack = "normalize";
            labelLayer.encoding.y.stack = "normalize";
          }

          if (config['order'] != "" && typeof config['order'] != "undefined") {
            labelLayer.encoding.order = {"field":config['order'], "type":dataProperties[config['order']]['dtype'], "sort":config['order_type']};
          }

          //apply label filters if requested
          if (config['labelFilter'] != "" && typeof config['labelFilter'] != "undefined") {

            var filterString;
            //construct filter for nominal data
            if (dataProperties[config['labelFilter']]['dtype'] == "nominal") {
              filterString = {"filter": {"field": config['labelFilter'], "oneOf": config['labelFilterValues']}};
            } else if (dataProperties[config['labelFilter']]['dtype'] == "quantitative") {
              filterString = {"filter": "datum."+config['labelFilter']+" "+config['labelFilterValues'][0]};
            }
            labelLayer.transform.push(filterString);
          }
          //handle labels when a coloring encoding is included
          if (config['color'] != "" && typeof config['color'] != "undefined") {
             labelLayer.encoding.detail = [];
             labelLayer.encoding.detail.push({"field": config['color'], "type": dataProperties[config['color']]['dtype']});
          } 

          // if (config['labelField'] != config['x']) {
          //     labelLayer.encoding.detail.push({"field": config['x'], "type": dataProperties[config['x']]['dtype']});
          // }
          // if (config['labelField'] != config['y']) {
          //     labelLayer.encoding.detail.push({"field": config['y'], "type": dataProperties[config['y']]['dtype']});
          // }

        chart.spec.layer.push(labelLayer);
      }

      //order properties for stacked bars
      if (config['order'] != "" && typeof config['order'] != "undefined") {
        chart.spec.layer[0].encoding.order = {"field":config['order'], "type":dataProperties[config['order']]['dtype'], "sort":config['order_type']};
      }

      //sorting properties for bar charts mainly
      if (config['sort'] != "" && typeof config['sort'] != "undefined") {
        for (var i = chart.spec.layer.length - 1; i >= 0; i--) {
          if (dataProperties[config['y']]['dtype'] == "nominal") {
            chart.spec.layer[i].encoding.y.sort = {"field":config['sort'],"order":config['sort_type']};
          } else if (dataProperties[config['x']]['dtype'] == "nominal") {
            chart.spec.layer[i].encoding.x.sort = {"field": config['sort'], "order": config['sort_type']};
          } 
        }
      } else {
        if (dataProperties[config['y']]['specialSort'] == "yes") {
          for (var i = chart.spec.layer.length - 1; i >= 0; i--) {
            chart.spec.layer[i].encoding.y.sort = {"field":config['y']+'_properSort'};
          }
        } else if (dataProperties[config['x']]['specialSort'] == "yes") {
          for (var i = chart.spec.layer.length - 1; i >= 0; i--) {
            chart.spec.layer[i].encoding.x.sort = {"field":config['x']+'_properSort'};
            // if (config['mark_type'] == "line") {
            //   chart.spec.layer[i].encoding.order = {"field": config['y'] + "_properTimeUnitSort","type":"ordinal"};
            // }
          }
        }
      }
        // if (dataProperties[config['y']]['dtype'] == "nominal") {
        //   chart.spec.layer[0].encoding.y.sort = {"field":config['sort'],"op":"sum" ,"order":config['sort_type']}; //"type":dataProperties[config['sort']]['dtype'],
        // } else if (dataProperties[config['x']]['dtype'] == "nominal") {
        //   chart.spec.layer[0].encoding.x.sort = {"field":config['sort'],"op":"sum","order":config['sort_type']}; //"type":dataProperties[config['sort']]['dtype'],
        // }
      //}

      //reference line settings
      //update to try y first, use x if no y specified
      if (config['averageX'] != "" && typeof config['averageX'] != "undefined") {
        var axisSelect = "y";
        if (config['y'] == "" || typeof config['y'] == "undefined") {
          config['y'] = config['x'];
          axisSelect = "x";
        }

        if (typeof chart.spec.layer[0].selection['paintbrush'] == "undefined" && !config['normalize']) {
          chart.spec.layer[0].selection['refBrush'] = {
                "type": "interval",
                "encodings": [axisSelect]
              };
        }

        if (dataProperties[config['x']]['dtype'] == "quantitative" && dataProperties[config['y']]['dtype'] == "quantitative") {
          chart.spec.layer[0].selection['refBrush']['encodings'] = null;
        }

        var refLayer = {
          "transform": [],
          "mark": {
            "type": "rule",
            "size": 2,
            "color": "black"
          },
          "encoding": {
            "tooltip": {
              "field": config['x'],
              "type": dataProperties[config['x']]['dtype'],
              "format": dataProperties[config['x']]['valueFormat'],
              "aggregate": config['averageX'],
              "title": config['averageX'] + " of " + dataProperties[config['x']]['title']
            },
            "x": {
              "field": config['x'],
              "type": dataProperties[config['x']]['dtype'],
              "scale": {"zero":config['unpin_x']},
              "aggregate": config['averageX']
          },
          "opacity": {"value": 0.8}
        }
      };

      if (typeof chart.spec.layer[0].selection['paintbrush'] == "undefined" && !config['normalize']) {
        refLayer.transform.push({"filter": {"selection":"refBrush"}});
      }

      chart.spec.layer.push(refLayer);

        var refLayerStatic = {
          "mark": {
            "type": "rule",
            "size": 2,
            "color": "black"
          },
          "encoding": {
            "tooltip": {
              "field": config['x'],
              "type": dataProperties[config['x']]['dtype'],
              "format": dataProperties[config['x']]['valueFormat'],
              "aggregate": config['averageX'],
              "title": config['averageX'] + " of " + dataProperties[config['x']]['title']
            },
            "x": {
              "field": config['x'],
              "type": dataProperties[config['x']]['dtype'],
              "scale": {"zero":config['unpin_x']},
              "aggregate": config['averageX']
          },
          "opacity": {"value": 0.4}
        }
      };
      chart.spec.layer.push(refLayerStatic);
    }

      //y axis reference line
      ///////////////////////
      if (config['averageY'] != "" && typeof config['averageY'] != "undefined" && !config['normalize']) {

        var axisSelect = "x";
        //use y axis if no x axis field (ie bubble plot using row instead of axis)
        if (config['x'] == "" || typeof config['x'] == "undefined") {
          config['x'] = config['y'];
          axisSelect = "y";
        }

        if (typeof chart.spec.layer[0].selection['paintbrush'] == "undefined" && !config['normalize']) {
          chart.spec.layer[0].selection['refBrush'] = {
                "type": "interval"
              };
        }

        var refLayer = {
          "transform": [],
          "mark": {
            "type": "rule",
            "size": 2,
            "color": "black"
          },
          "encoding": {
            "tooltip": {
              "field": config['y'],
              "type": dataProperties[config['y']]['dtype'],
              "format": dataProperties[config['y']]['valueFormat'],
              "aggregate": config['averageY'],
              "title": config['averageY'] + " of " + dataProperties[config['y']]['title']
            },
            "y": {
              "field": config['y'],
              "type": dataProperties[config['y']]['dtype'],
              "scale": {"zero":config['unpin_y']},
              "aggregate": config['averageY']
          },
          "opacity": {"value": 0.8}
        }
      };

      if (typeof chart.spec.layer[0].selection['paintbrush'] == "undefined") {
        refLayer.transform.push({"filter": {"selection":"refBrush"}});
      }

      chart.spec.layer.push(refLayer);

        var refLayerStatic = {
          "mark": {
            "type": "rule",
            "size": 2,
            "color": "black"
          },
          "encoding": {
            "tooltip": {
              "field": config['y'],
              "type": dataProperties[config['y']]['dtype'],
              "format": dataProperties[config['y']]['valueFormat'],
              "aggregate": config['averageY'],
              "title": config['averageY'] + " of " + dataProperties[config['y']]['title']
            },
            "y": {
              "field": config['y'],
              "type": dataProperties[config['y']]['dtype'],
              "scale": {"zero":config['unpin_y']},
              "aggregate": config['averageY']
          },
          "opacity": {"value": 0.4}
        }
      };
      chart.spec.layer.push(refLayerStatic);
    }

    if (config['mark_type'] == 'boxplot') {
      if (config['color'] == "" || typeof config['color'] == "undefined") {
        chart.spec.layer[0].encoding.color = {"value":config['fixed_color'][0]};
      } else {
        chart.spec.layer[0].encoding.color = {"field":config['color'],"type":dataProperties[config['color']]['dtype'],"title":dataProperties[config['color']]['title']};
        chart.spec.layer[0].encoding.color.scale = {"type": "ordinal", "scheme":config['color_scheme']};
      }
      
      // chart.spec.layer[0].encoding.opacity = {"value":config['opacity']};

      if (config['boxplotExtent'] == "1.5") {
        config['boxplotExtent'] = Number(config['boxplotExtent']);
      }
      chart.config.boxplot = {
        "extent": config['boxplotExtent'],
        "median": {"color":config['boxMedian'][0],"thickness":2,"ticks":true}
      }
      chart.config.bar = {
        "stroke": config['border'][0],
        "fill": config['fixed_color'][0],
        "fillOpacity": config['opacity']
      }
    }

    if ( (config['row'] == "" || typeof config['row'] == "undefined") && (config['column'] == "" || typeof config['column'] == "undefined")) {
      chart['layer'] = chart['spec']['layer'];

      chart["width"] = chartWidth;
      chart["height"] = chartHeight; 

      delete chart.spec;
      delete chart.facet;
    }

      // console.log(chart);
      // console.log(JSON.stringify(chart));

      var tooltipOptions = {
        theme: 'dark'
      };

      var opt = {
        "actions": false,
        "tooltip": tooltipOptions,
        "renderer": "svg"
      };


      // console.log(chart);

      vegaEmbed(element, chart, opt).then(({spec, view}) => {

        var tips = document.getElementsByClassName("vg-tooltip");

        view.addEventListener('click', function (event, item) {
          if (event.shiftKey) {

            console.log(config['annotationList']);

            var annotJSON = JSON.parse(config['annotationList']);

            var newAnnotation = {
                note: {
                  label: "Your Text Here...",
                  title: "Optional Label",
                  wrap: 150
                },
                id: annotJSON.length,
                connector: {
                  end: "dot"
                },
                x: null,
                y: null
              };

            newAnnotation['x'] = event.clientX;
            newAnnotation['y'] = event.clientY;

            annotJSON.push(newAnnotation);

            console.log(annotJSON);




              visMaster.trigger("updateConfig", [{annotationList: JSON.stringify(annotJSON)}]);

              // config['annotationList'] = JSON.stringify(annotJSON);

          } else {
            try {
              if (typeof item.datum.links != "undefined") {
               LookerCharts.Utils.openDrillMenu({
                links: item.datum.links,
                event: event
            });  
              }               
             } catch(err) {
             }
          }
        });
        if ( JSON.parse(config['annotationList']).length > 0 ) {

          var annotList = JSON.parse(config['annotationList']);

          
          const makeAnnotations = d3.annotation()
            .editMode(false)
            .type(d3.annotationCalloutCircle)
            .annotations(annotList)

          // for (var i = 0; i < annotList.length; i++) {
          //   annotList[i]
          // }

          d3.select("#vis")
            .select("svg")
            .append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)
            .on('dblclick', function() {
              makeAnnotations.editMode(!makeAnnotations.editMode()).update();
              var newPositions = makeAnnotations.annotations();
              for (var i = 0; i < newPositions.length; i++) {
                annotList[i]['x'] = newPositions[i]['x']
                annotList[i]['y'] = newPositions[i]['y']
                annotList[i]['dx'] = newPositions[i]['dx']
                annotList[i]['dy'] = newPositions[i]['dy']
                
              }
              
              console.log(annotList);

              visMaster.trigger("updateConfig", [{annotationList: JSON.stringify(annotList)}]);

              // console.log(config);

            })
            .on('contextmenu', function() {

              const updateAnnotationText = () => {

                // console.log('trying to update text');
                // console.log(a);
                var annotationText = JSON.parse(config['annotationList']);
                // var annotationHeader = document.getElementById("annotHeader").value;
                // var annotationBody = document.getElementById("annotBody").value;
                annotationText[clickedAnnotation]['note']['title'] = document.getElementById("annotHeader").value;
                annotationText[clickedAnnotation]['note']['label'] = document.getElementById("annotBody").value;

                // console.log(annotationText);

                visMaster.trigger("updateConfig", [{annotationList: JSON.stringify(annotationText)}]);
                var inputParent = document.getElementById("annotation-input");
                inputParent.parentNode.removeChild(inputParent);
              }

              d3.event.preventDefault();
              // console.log(event);

              var inputForm = "<div id='annotation-input'><form><label for='fname'>Subject</label><input type='text' id='annotHeader' name='firstname' placeholder='Header'><label for='subject'>Body</label><input type='text' id='annotBody' name='firstname' placeholder='your comment here'><input id='annotDone' type='button' value='Done'></form></div>";
              var newForm = document.createElement("DIV");
              newForm.innerHTML = inputForm;

              var visParent = document.getElementById("vis").parentElement;
              visParent.insertBefore(newForm,document.getElementById("vis"));

              var clickedAnnotation = d3.event['target']['__data__']['id'];

              // console.log(clickedAnnotation);

              document.getElementById("annotDone").addEventListener("click", updateAnnotationText);


            })
            .on('click', function() {
              console.log(d3.event);
              if(d3.event.altKey) {

                var annotDeletePos = d3.event['target']['__data__']['id'];

                var updatedAnnots = JSON.parse(config['annotationList']);

                for (var i = 0; i < updatedAnnots.length; i++) {
                  if ( updatedAnnots[i]['id'] == annotDeletePos ) {
                    updatedAnnots.splice(i,1);
                  }
                }

                visMaster.trigger("updateConfig", [{annotationList: JSON.stringify(updatedAnnots)}]);
              }
            });       
        }
        done()
      }); 
}
      
    }
});

function createMetaData(allFields,queryResponse){

  var dataFormatDict = {
    "$#,##0" : "$,.0f",
    "$#,##0.00" : "$,.2f",
    "#,##0.00%" : ",.2%",
    "#,##0.0%" : ",.1%",
    "#,##0%" : ",.0%",
    "null" : ""
  };

  var dateFields = ["date_date", "date_month", "date_quarter", "date_week"];

  var dataProperties = {};
  //determine number format
  for (var field in allFields) {
    var lookerName = allFields[field];
    dataProperties[allFields[field]] = {};
    //get friendly names for measures
    queryResponse.fields.measure_like.forEach(function(measure){
      if (lookerName == measure['name'].replace(".","_")) {
        //get label short or label to handle table calcs
        if (typeof measure['label_short'] != "undefined") {
          dataProperties[allFields[field]]['title'] = measure['label_short'];
        } else {
          dataProperties[allFields[field]]['title'] = measure['label'];
        }
        dataProperties[allFields[field]]['valueFormat'] = dataFormatDict[String(measure['value_format'])];
        if (measure['type'] == "yesno" || measure['type'] == "string") {
          dataProperties[allFields[field]]['dtype'] = "nominal";
        } else {
          dataProperties[allFields[field]]['dtype'] = "quantitative";
        }
        
      } 
    });
    //get friendly names for dimensions
    queryResponse.fields.dimension_like.forEach(function(dimension){
      if (lookerName == dimension['name'].replace(".","_")) {
        if (typeof dimension['label_short'] != "undefined") {
          dataProperties[allFields[field]]['title'] = dimension['label_short'];
        } else {
          dataProperties[allFields[field]]['title'] = dimension['label'];
        }       
        dataProperties[allFields[field]]['valueFormat'] = dataFormatDict[String(dimension['value_format'])];
        if (dateFields.includes(dimension.type)) {
          dataProperties[allFields[field]]['dtype'] = "temporal";
        } else {
          dataProperties[allFields[field]]['dtype'] = "nominal";
        }
        if (dimension.type == "date_day_of_week") {
          dataProperties[allFields[field]]['specialSort'] = "yes";
        } else if (dimension.type == "date_month_name") {
          dataProperties[allFields[field]]['specialSort'] = "yes";
        }
      } 
    });
  }
  return dataProperties;
}

  var defaultDim;
  var defaultMes;

function createOptions(queryResponse){

  var masterList = [];
  var dimensionList = [];
  var measureList = [];
  var options = {};
  var optionsResponse = {};
  optionsResponse['options'] = {};
  optionsResponse['measures'] = [];
  optionsResponse['dimensions'] = [];
  optionsResponse['masterList'] = [];

  var dimCounter = 1;
  var mesCounter = 1;

  queryResponse.fields.dimension_like.forEach(function(field){
    var dimLib = {};
    var fieldName = (field.name).replace(".","_");
    if (typeof field.label_short != "undefined") {
      dimLib[field.label_short] = fieldName; //store friendly label & field name
    } else {
      dimLib[field.label] = fieldName; //capture label, mainly for table calcs
    }
    if (dimCounter == 1) {
      defaultDim = fieldName; //grab first dimension to use as default X value
    }
    optionsResponse['masterList'].push(dimLib); //add to master list of all fields
    optionsResponse['dimensions'].push(dimLib);
    dimCounter += 1;
  });

  queryResponse.fields.measure_like.forEach(function(field){
    var mesLib = {};
    var fieldName = (field.name).replace(".","_");
    if (typeof field.label_short != "undefined") {
      mesLib[field.label_short] = fieldName;
      optionsResponse['measures'].push(mesLib);
    } else {
      mesLib[field.label] = fieldName;
      if (field.type == "yesno") {
        optionsResponse['dimensions'].push(mesLib);
      } else {
        optionsResponse['measures'].push(mesLib);
      }
    }
    if (mesCounter == 1) {
      defaultMes = fieldName //grab first measure as default Y value
    }
    optionsResponse['masterList'].push(mesLib);
    
    mesCounter += 1;
  });

  var mesLib = {};
  mesLib['NA'] = "";
  optionsResponse['masterList'].push(mesLib);
  optionsResponse['measures'].push(mesLib);
  optionsResponse['dimensions'].push(mesLib);

  optionsResponse['options']['x'] = {
    label: "X",
    section: "1.Axes",
    type: "string",
    display: "select",
    order: 1,
    values: optionsResponse['masterList'],
    default: defaultDim
  }
  optionsResponse['options']['y'] = {
    label: "Y",
    section: "1.Axes",
    type: "string",
    display: "select",
    order: 2,
    values: optionsResponse['masterList'],
    default: defaultMes
  }
  //Mark config options
  optionsResponse['options']['mark_type'] = {
    label: "Mark Type",
    section: "2.Mark",
    type: "string",
    order: 1,
    display: "select",
    default: "bar",
    values: [
      {"Bar" : "bar"},
      {"Rule" : "rule"},
      {"Circle" : "circle"},
      {"Tick" : "tick"},
      {"Box Plot" : "boxplot"},
      {"Line" : "line"},
      {"Rect" : "rect"},
      {"Area" : "area"},
      {"Point" : "point"},
      {"Trail" : "trail"}
    ]
  }
  optionsResponse['options']['color'] = {
    label: "Color",
    section: "2.Mark",
    type: "string",
    display: "select",
    order: 2,
    values: optionsResponse['masterList'],
    default: ""
  }
  optionsResponse['options']['color_scheme'] = {
    label: "Color Scheme",
    section: "2.Mark",
    type: "string",
    display: "select",
    order: 3,
    values: [
      {"Auto" : ""},
      {"Looker (Categorical)" : "looker"},
      {"Vivid (Categorical)" : "looker-vivid"},
      {"Default 10 (Categorical)" : "tableau10"},
      {"Default 20 (Categorical)" : "tableau20"},
      {"Dark 8 (Categorical)" : "dark2"},
      {"Dark 20 (Categorical)" : "category20b"},
      {"Light 8 (Categorical)" : "set2"},
      {"Blues (Sequential)" : "blues"},
      {"Greens (Sequential)" : "greens"},
      {"Grays (Sequential)" : "greys"},
      {"Purples (Sequential)" : "purples"},
      {"Oranges (Sequential)" : "oranges"},
      {"Viridis (Sequential Multi)" : "viridis"},
      {"Inferno (Sequential Multi)" : "inferno"},
      {"Magma (Sequential Multi)" : "magma"},
      {"Plasma (Sequential Multi)" : "plasma"},
      {"Blue Purple (Sequential Multi)" : "bluepurple"},
      {"Purple Red (Sequential Multi)" : "purplered"},
      {"Spectral (Diverging)" : "spectral"},
      {"Red Blue (Diverging)" : "redblue"},
      {"Red Gray (Diverging)" : "redgrey"},
      {"Red Green (Diverging)" : "redyellowgreen"},
      {"Brown Green (Diverging)" : "brownbluegreen"}
    ],
    default: ""
  }
  optionsResponse['options']['domain'] = {
    label: "Color Domain",
    section: "2.Mark",
    type: "string",
    display: "text",
    order: 4,
    default: ""
  }
  optionsResponse['options']['size'] = {
    label: "Size",
    section: "2.Mark",
    type: "string",
    display: "select",
    order: 5,
    values: optionsResponse['measures'],
    default: ""
  }
  optionsResponse['options']['shape'] = {
    label: "Shape",
    section: "2.Mark",
    order: 6,
    type: "string",
    display: "select",
    values: optionsResponse['dimensions'],
    default: ""
  }
  optionsResponse['options']['fixed_size'] = {
    label: "Fixed Size",
    section: "2.Mark",
    type: "number",
    display: "range",
    default: 12,
    min: 1,
    max: 128
  }
  optionsResponse['options']['opacity'] = {
    label: "Opacity",
    section: "2.Mark",
    type: "number",
    display: "text",
    default: 1,
    min: 0,
    max: 1
  }
  optionsResponse['options']['line_style'] = {
    label: "Line Style",
    section: "2.Mark",
    type: "string",
    display: "select",
    default: "",
    values:[{"Default":""},{"Monotone":"monotone"},{"Step":"step-after"}]
  }
  optionsResponse['options']['fixed_color'] = {
    label: "Fixed Color",
    section: "2.Mark",
    type: "array",
    display: "color",
    default: "#4C78A8"
  }
  optionsResponse['options']['border'] = {
    label: "Border (Enter color)",
    section: "2.Mark",
    type: "array",
    display: "color",
    default: ""
  }
  //end mark config options layer 1
  /////////////////////////
  //mark config options layer 2
  optionsResponse['options']['mark_type2'] = {
    label: "Mark Type",
    section: "3.Mark(2)",
    type: "string",
    order: 1,
    display: "select",
    default: "bar",
    values: [
      {"Bar" : "bar"},
      {"Rule" : "rule"},
      {"Circle" : "circle"},
      {"Tick" : "tick"},
      {"Box Plot" : "boxplot"},
      {"Line" : "line"},
      {"Rect" : "rect"},
      {"Area" : "area"},
      {"Point" : "point"},
      {"Trail" : "trail"}
    ]
  }
  optionsResponse['options']['color2'] = {
    label: "Color",
    section: "3.Mark(2)",
    type: "string",
    display: "select",
    order: 2,
    values: optionsResponse['masterList'],
    default: ""
  }
  optionsResponse['options']['color_scheme2'] = {
    label: "Color Scheme",
    section: "3.Mark(2)",
    type: "string",
    display: "select",
    order: 3,
    values: [
      {"Auto" : ""},
      {"Looker (Categorical)" : "looker"},
      {"Default 10 (Categorical)" : "tableau10"},
      {"Default 20 (Categorical)" : "tableau20"},
      {"Dark 8 (Categorical)" : "dark2"},
      {"Dark 20 (Categorical)" : "category20b"},
      {"Light 8 (Categorical)" : "set2"},
      {"Blues (Sequential)" : "blues"},
      {"Greens (Sequential)" : "greens"},
      {"Grays (Sequential)" : "greys"},
      {"Purples (Sequential)" : "purples"},
      {"Oranges (Sequential)" : "oranges"},
      {"Viridis (Sequential Multi)" : "viridis"},
      {"Inferno (Sequential Multi)" : "inferno"},
      {"Magma (Sequential Multi)" : "magma"},
      {"Plasma (Sequential Multi)" : "plasma"},
      {"Blue Purple (Sequential Multi)" : "bluepurple"},
      {"Purple Red (Sequential Multi)" : "purplered"},
      {"Spectral (Diverging)" : "spectral"},
      {"Red Blue (Diverging)" : "redblue"},
      {"Red Gray (Diverging)" : "redgrey"},
      {"Red Green (Diverging)" : "redyellowgreen"},
      {"Brown Green (Diverging)" : "brownbluegreen"}
    ],
    default: ""
  }
  optionsResponse['options']['domain2'] = {
    label: "Color Domain",
    section: "3.Mark(2)",
    type: "string",
    display: "text",
    order: 4,
    default: ""
  }
  optionsResponse['options']['size2'] = {
    label: "Size",
    section: "3.Mark(2)",
    type: "string",
    display: "select",
    order: 5,
    values: optionsResponse['measures'],
    default: ""
  }
  optionsResponse['options']['shape2'] = {
    label: "Shape",
    section: "3.Mark(2)",
    order: 6,
    type: "string",
    display: "select",
    values: optionsResponse['dimensions'],
    default: ""
  }
  optionsResponse['options']['fixed_size2'] = {
    label: "Fixed Size",
    section: "3.Mark(2)",
    type: "number",
    display: "range",
    default: 12,
    min: 1,
    max: 128
  }
  optionsResponse['options']['opacity2'] = {
    label: "Opacity",
    section: "3.Mark(2)",
    type: "number",
    display: "text",
    default: 1,
    min: 0,
    max: 1
  }
  optionsResponse['options']['line_style2'] = {
    label: "Line Style",
    section: "3.Mark(2)",
    type: "string",
    display: "select",
    default: "",
    values:[{"Default":""},{"Monotone":"monotone"},{"Step":"step-after"}]
  }
  optionsResponse['options']['fixed_color2'] = {
    label: "Fixed Color",
    section: "3.Mark(2)",
    type: "array",
    display: "color",
    default: "#4C78A8"
  }
  optionsResponse['options']['border2'] = {
    label: "Border (Enter color)",
    section: "3.Mark(2)",
    type: "array",
    display: "color",
    default: ""
  }
  //end mark config layer 2
  /////////////////////////
  //axis options
  optionsResponse['options']['row'] = {
    label: "Row",
    section: "1.Axes",
    type: "string",
    order: 3,
    display: "select",
    default: "",
    values: optionsResponse['dimensions']
  }
  optionsResponse['options']['column'] = {
    label: "Column",
    section: "1.Axes",
    type: "string",
    order: 4,
    display: "select",
    default: "",
    values: optionsResponse['dimensions']
  }
  optionsResponse['options']['resolve_x'] = {
    label: "Independent X Axis",
    section: "1.Axes",
    type: "string",
    display: "select",
    default: "",
    order: 5,
    values: [
    {"Yes":"independent"},
    {"No":""}
    ]
  }
  optionsResponse['options']['resolve_y'] = {
    label: "Independent Y Axis",
    section: "1.Axes",
    type: "string",
    display: "select",
    order: 7,
    default: "",
    values: [
    {"Yes":"independent"},
    {"No":""}
    ]
  }
  optionsResponse['options']['unpin_x'] = {
    label: "Unpin X from Zero",
    section: "1.Axes",
    type: "string",
    display: "select",
    order: 6,
    default: true,
    values: [{"Yes":false},{"No":true}]
  }
  optionsResponse['options']['unpin_y'] = {
    label: "Unpin Y from Zero",
    section: "1.Axes",
    type: "string",
    display: "select",
    order: 8,
    default: true,
    values: [{"Yes":false},{"No":true}]   
  }
  optionsResponse['options']['normalize'] = {
    label: "Stacked Percentage",
    section: "1.Axes",
    type: "string",
    display: "select",
    order: 9,
    default: false,
    values: [{"No": false},{"Yes": true}]
  }
  optionsResponse['options']['fixed_height'] = {
    label: "Chart Height",
    section: "5.Advanced",
    type: "number",
    order: 1,
    display: "text",
    default: null,
  }
  optionsResponse['options']['fixed_width'] = {
    label: "Chart Width",
    section: "5.Advanced",
    type: "number",
    order: 2,
    display: "text",
    default: null,
  }
  optionsResponse['options']['legendPosition'] = {
    label: "Legend Position",
    section: "5.Advanced",
    type: "string",
    display: "select",
    order: 3,
    default: "bottom",
    values: [
      {"Bottom":"bottom"},
      {"Top":"top"},
      {"Left":"left"},
      {"Right":"right"}
    ]
  }
  optionsResponse['options']['legendColumns'] = {
    label: "Legend Columns",
    section: "5.Advanced",
    type: "number",
    display: "text",
    order: 4,
    default: ""
  }
  optionsResponse['options']['legendBorder'] = {
    label: "Legend Border",
    section: "5.Advanced",
    type: "array",
    display: "color",
    order: 5,
    default: "",
  }
  optionsResponse['options']['legendPadding'] = {
    label: "Legend Padding",
    section: "5.Advanced",
    type: "number",
    display: "text",
    order: 6,
    default: ""   
  }
  optionsResponse['options']['legendRadius'] = {
    label: "Legend Corner Radius",
    section: "5.Advanced",
    type: "number",
    display: "text",
    order: 7,
    default: ""  
  }
  // optionsResponse['options']['path'] = {
  //   label: "Path",
  //   section: "2.Mark",
  //   order: 7,
  //   type: "string",
  //   default: "",
  //   display: "select",
  //   values: optionsResponse['dimensions']
  // }
  optionsResponse['options']['highlight'] = {
    label: "Highlight Action",
    section: "5.Advanced",
    type: "string",
    order: 8,
    display: "select",
    default: "",
    values: optionsResponse['dimensions']
  }
  optionsResponse['options']['sort'] = {
    label: "Sort Value",
    section: "5.Advanced",
    type: "string",
    display: "select",
    order: 9,
    default: "",
    values: optionsResponse['masterList']
  }
  optionsResponse['options']['sort_type'] = {
    label: "Sort by Type",
    section: "5.Advanced",
    type: "string",
    order: 10,
    display: "select",
    default: "descending",
    values: [{"Descending":"descending"},{"Ascending":"ascending"}]
  }
  optionsResponse['options']['order'] = {
    label: "Order by (stacked only)",
    section: "5.Advanced",
    type: "string",
    order: 11,
    display: "select",
    default: "",
    values: optionsResponse['measures']
  }
  optionsResponse['options']['order_type'] = {
    label: "Order by Type",
    section: "5.Advanced",
    type: "string",
    order: 12,
    display: "select",
    default: "descending",
    values: [{"Descending":"descending"},{"Ascending":"ascending"}]
  }
optionsResponse['options']['boxplotExtent'] = {
  label: "Box Plot Extent",
  section: "5.Advanced",
  type: "string",
  display: "select",
  default: "",
  order:13,
  values: [{"1.5 IQR":"1.5"},{"Min-Max":"min-max"}]
}
optionsResponse['options']['boxMedian'] = {
  label: "Box Plot Median",
  section: "5.Advanced",
  type: "array",
  display: "color",
  default: "black",
  order:14
}
optionsResponse['options']['averageX'] = {
  label: "Reference Line X",
  section: "5.Advanced",
  type: "string",
  order: 15,
  display: "select",
  default: "",
  values: [{"No":""},{"Mean":"mean"},{"Median":"median"},{"Min":"min"},{"Max":"max"}]
}
optionsResponse['options']['averageY'] = {
  label: "Reference Line Y",
  section: "5.Advanced",
  type: "string",
  order: 16,
  display: "select",
  default: "",
  values: [{"No":""},{"Mean":"mean"},{"Median":"median"},{"Min":"min"},{"Max":"max"}]
}
optionsResponse['options']['gridOpacity'] = {
  label: "Grid Opacity",
  section: "5.Advanced",
  type: "number",
  display: "text",
  default: 1,
  min: 0,
  max: 1,
  order: 17
}
optionsResponse['options']['axisLabelAngle'] = {
  label: "Axis Label Angle",
  section: "5.Advanced",
  type: "number",
  display: "text",
  default: null,
  order: 18
}
optionsResponse['options']['x2'] = {
  label: "X2",
  section: "1.Axes",
  type: "string",
  display: "select",
  order: 1,
  values: optionsResponse['masterList'],
  default: ""    
}
optionsResponse['options']['y2'] = {
  label: "Y2",
  section: "1.Axes",
  type: "string",
  display: "select",
  order: 2,
  values: optionsResponse['masterList'],
  default: ""    
}
// optionsResponse['options']['labelDefault'] = {
//   label: "Label Default",
//   section: "4.Labels",
//   type: "string",
//   order: 1,
//   display: "select",
//   default: "",
//   values: [{"Yes":"yes"},{"No":""}]
// }
optionsResponse['options']['labelField'] = {
  label: "Label Field",
  section: "4.Labels",
  type: "string",
  order: 2,
  display: "select",
  default: "",
  values: optionsResponse['masterList']
}
optionsResponse['options']['labelPin'] = {
  label: "Pin Labels To",
  section: "4.Labels",
  type: "string",
  order: 3,
  display: "select",
  default: "field",
  values: [{"Field Value":"field"},{"Zero":"zero"}]
}
optionsResponse['options']['labelAlign'] = {
  label: "Horizontal Alignment",
  section: "4.Labels",
  type: "string",
  order: 4,
  display: "select",
  default: "center",
  values: [{"Left":"left"},{"Center":"center"},{"Right":"right"}]
}
optionsResponse['options']['labelBaseline'] = {
  label: "Vertical Alignment",
  section: "4.Labels",
  type: "string",
  order: 5,
  display: "select",
  default: "middle",
  values: [{"Top":"top"},{"Middle":"middle"},{"Bottom":"bottom"}]
}
optionsResponse['options']['dx'] = {
  label: "X Offset",
  section: "4.Labels",
  type: "number",
  order: 6,
  display: "text",
  default: 0
}
optionsResponse['options']['dy'] = {
  label: "Y Offset",
  section: "4.Labels",
  type: "number",
  order: 7,
  display: "text",
  default: 0
}
optionsResponse['options']['labelSize'] = {
  label: "Font Size",
  section: "4.Labels",
  type: "number",
  order: 8,
  display: "text",
  default: 11
}
optionsResponse['options']['labelColor'] = {
  label: "Label Color",
  section: "4.Labels",
  type: "array",
  display: "color",
  order: 9,
  default: "black"
}
optionsResponse['options']['labelAngle'] = {
  label: "Label Angle",
  section: "4.Labels",
  type: "number",
  order: 10,
  display: "text",
  default: null
}
optionsResponse['options']['labelFilter'] = {
  label: "Label Filter Field",
  section: "4.Labels",
  type: "string",
  order: 11,
  display: "select",
  default: "",
  values: optionsResponse['masterList']
}
optionsResponse['options']['labelFilterValues'] = {
  label: "Label Filter Field",
  section: "4.Labels",
  type: "array",
  order: 12,
  display: "text",
  default: ""
}
optionsResponse['options']['includeInTip'] = {
  label: "Exlude from Tooltip",
  section: "5.Advanced",
  type: "string",
  display: "text",
  placeholder: "Type in field name to exclude",
  default: ""
}
optionsResponse['options']['chartAutoSize'] = {
  label: "Auto-size Chart?",
  section: "5.Advanced",
  type: "string",
  display: "radio",
  default: "no",
  values: [{"Yes":"yes"},{"No":"no"}]
}
optionsResponse['options']['annotationList'] = {
  type: "string",
  default: "[]"
}
// optionsResponse['options']['annotationsArray'] = {
//   label: "annotations",
//   section: "4.Labels",
//   type: "string",
//   order: 13,
//   display: "text",
//   default: ""
// }
// optionsResponse['options']['comments'] = {
//   label: "Add Comment",
//   section: "5.Advanced",
//   type: "string",
//   order: 15,
//   display: "text",
//   default: ""
// }
// optionsResponse['options']['labels'] = {
//   label: "Labels?",
//   section: "5.Advanced",
//   type: "string",
//   display: "select",
//   default: "",
//   values: optionsResponse['masterList']
//   // values: [{"Yes":"yes"},{"No":"no"}]
// }

  return optionsResponse;
}
