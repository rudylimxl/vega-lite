instruction: drop vega-lite.js to your Looker IDE. Change the 'file' parameter. In this example, it's expecting the file in a folder called 'viz'

  
Add this to your project manifest.lkml file:  
  
visualization: {  
  id: "vega"  
  label: "Vega-lite"  
  file: "viz/vega.js"  
  dependencies: ["https://cdn.jsdelivr.net/npm/vega@5.4.0","https://cdn.jsdelivr.net/npm/vega-lite@3.4.0","https://cdn.jsdelivr.net/npm/vega-embed@4.2.1"]  
}
