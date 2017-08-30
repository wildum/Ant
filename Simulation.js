function simulationGenerator() {
    var results = graph.getBestSolution();

    var spawnFrequence = Math.random()*4900 + 100; // 100-5000
    var pheromoneStrength = Math.random()*2.7 + 0.3; //0.3-3
    var pheromoneDecayRate = Math.random()*4.5e-3 + 0.5e-3; //0.5e-3 - 5e-3
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