class Graph {
    constructor() {
        this.adjacencyList = {};

    }
    addVertex(vertex) {
        if (!this.adjacencyList[vertex]) {
            this.adjacencyList[vertex] = []
        }
    }
    addEdge(v1, v2) {
        this.adjacencyList[v1].push(v2);

    }

}
module.exports = Graph;