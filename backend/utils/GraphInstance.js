// graphInstance.js
const Graph = require("./Graph.js"); // Adjust the path as needed

let graph = null;

const initializeGraph = () => {
  graph = new Graph();
};

const getGraph = () => {
  if (!graph) {
    initializeGraph();
  }
  return graph;
};

module.exports = {
  initializeGraph,
  getGraph,
};
