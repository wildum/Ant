const POPULATION_SIZE = 50;
const SHORTER_PATH = [0, 1, 6]; //change value if you change the map


function algorithm () {
    pop = createPopulation();
    if(pop.length >= POPULATION_SIZE) {
        var newPop = selection(pop);
        var bestSolution = newPop[newPop.length - 1];
        while(newPop < POPULATION_SIZE) {
            var parent1 = Math.round(Math.random()*newPop.length -1);
            var parent2 = Math.round(Math.random()*newPop.length -1);
            var child = crossover(parent1, parent2);
            //TODO: mutation
            newPop.push(child);
        }
    }
}
//TODO refactor the next two functions
function simulationGenerator() {
    var results = graph.getBestSolution();

    var spawnFrequence = Math.random()*4950 + 50; // 50-5000
    var pheromoneStrength = Math.random()*2.9 + 0.1; //0.3-3
    var pheromoneDecayRate = Math.random()*3.4e-4 + 0.1e-4; //0.1e-3 - 3.4e-3
    reset(spawnFrequence, pheromoneStrength, pheromoneDecayRate);
    console.log(results.path)
    return results;
}

function createPopulation() {
    var pop = [];
    var interval = window.setInterval(function simulator() {
        pop.push(simulationGenerator());
    }, 30000);
    return pop;
}

function selection(pop) {
    const GRADED_RETAIN_PERCENT = 0.3;
    const NONGRADED_RETAIN_PERCENT = 0.2;
    pop = deleteWrongSolutions(pop);
    pop.sort(compare);

    solutionsSelected = [];

    graded = GRADED_RETAIN_PERCENT * pop.length;
    for(var i in Math.floor(graded)){
        solutionsSelected.push(pop.pop());
    }

    nongraded = NONGRADED_RETAIN_PERCENT * pop.length;
    for(var i in Math.floor(nongraded)){
        solutionsSelected.push(pop.splice(Math.round(Math.random()*pop.length - 1)));
    }
    return transformSolutions(solutionsSelected);
}

function deleteWrongSolutions(pop) {
    var i = pop.length;
        while(i--) {
            if(pop[i].path.toString() != SHORTER_PATH) {
                pop.splice(i, 1);
            }
        }
    return pop;
}

function transformSolutions(pop) {
    newPop = [];
    pop.forEach(function(solution) {
        newPop.push([solution.spawnFrequence, solution.pheromoneStrength, solution.pheromoneDecayRate]);
    });
    return newPop;
}

function crossover(parent1, parent2) {
    var spawnFrequence = flipCoin === 0 ? parent1.spawnFrequence : parent2.spawnFrequence;
    var pheromoneStrength = flipCoin === 0 ? parent1.pheromoneStrength : parent2.pheromoneStrength;
    var pheromoneDecayRate = flipCoin === 0 ? parent1.pheromoneDecayRate : parent2.pheromoneDecayRate;
    var child = {spawnFrequence, pheromoneStrength, pheromoneDecayRate };
    return child;
}

function flipCoin() {
    return Math.round(Math.random());
}

function compare(a, b) {
    if(a.p > b.p) {
        return 1;
    }
    else {
        return -1;
    }
    return 0;
}