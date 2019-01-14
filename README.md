# Vega-Lite for Looker
Vega is an incredible way to create visualizations, stated in their own words:
# Vega is a visualization grammar, a declarative language for creating, saving, and sharing interactive visualization designs. With Vega, you can describe the visual appearance and interactive behavior of a visualization in a JSON format, and generate web-based views using Canvas or SVG.

More complex Vega visuals in Looker: https://github.com/groodlooker/vega

**New as of 12/14/18 Support for Two Layers & Reference Lines in vega-2.js**

**New as of 12/22/18 Added Support for mark type 'boxplot'**

This Looker version adds a number of ui elements to craft visualizations in Vega-Lite, a higher-level language built on top of Vega:

https://vega.github.io/vega-lite/

The main js file is available hosted here:

https://s3.us-east-2.amazonaws.com/grood-lookin/vega.js

Vega-lite 2 available hosted here (due to UI limitations with API will keep this separate as it adds complexity to UI):
https://s3.us-east-2.amazonaws.com/grood-lookin/vega-2.js

Dependencies that need to be added to your Looker Custom Viz are hosted here:
https://cdn.jsdelivr.net/npm/vega@4.3.0/build/vega.js

https://cdn.jsdelivr.net/npm/vega-lite@3.0.0-rc8/build/vega-lite.js

https://cdn.jsdelivr.net/npm/vega-embed@3.20.0/build/vega-embed.js

All charts you create will maintain their drill paths with additional info about which field is generating the drill link.

A few examples of what you can create with Vega-Lite for Looker:

**New as of 12/22/18 box plot support**

![Screenshot](screen-shots/standard_box.png)
![Screenshot](screen-shots/colored_boxes.png)

**New as of 12/14/18 multi-layer support in vega-2.js file**

Value vs Target charting:
![Screenshot](screen-shots/value_v_target.png)

Lollipop style charts:
![Screenshot](screen-shots/lollipop.png)

Reference Lines that update on selection:
![Screenshot](screen-shots/movable_ref_line.png)

**Functionality in original vega-lite**

Bar trellising:
![Screenshot](screen-shots/bar_trellis.png)

Multi-facet trellising:
![Screenshot](screen-shots/trellis_region_segment.png)

Bubble Plots:
![Screenshot](screen-shots/bubble_plot.png)

Heatmap:
![Screenshot](screen-shots/heatmap.png)

Scatter Plots:
![Screenshot](screen-shots/scatter_plot_tooltip.png)
![Screenshot](screen-shots/scatter_plot_drill.png)

Highlighting:
![Screenshot](screen-shots/highlight.png)

Vega-Lite enables even richer visualization than this current version of "Vega-Lite for Looker" will allow for. Future iterations of this will include layers or "dual axis" support, cross-highlighting capabilities, more formatting options (line thickness, fonts, etc) and possibly crossfiltering.
