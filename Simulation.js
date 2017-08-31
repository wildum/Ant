function simulationGenerator() {
    var results = graph.getBestSolution();

    var spawnFrequence = Math.random()*4950 + 50; // 50-5000
    var pheromoneStrength = Math.random()*2.7 + 0.3; //0.3-3
    var pheromoneDecayRate = Math.random()*3.4e-4 + 0.1e-4; //0.1e-3 - 3.4e-3
    reset(spawnFrequence, pheromoneStrength, pheromoneDecayRate);
    console.log(results);
    return results;
}

function createPopulation() {
    var pop = [];
    var interval = window.setInterval(function simulator() {
        pop.push(simulationGenerator());
    }, 60000);
    return pop;
}

function getScore () {

}