const POPULATION_SIZE = 50;
const SHORTER_PATH = [0, 1, 6]; //change value if you change the map
const SIMULATION_TIME = 10000;
var generation = 0;
var population = [];
var solutions = [];
var bestSolution = [];
var bestSolutionLabel;


function algorithm() {
    population = createPopulation();
    runSimulation();
}

function simulationGenerator(chrom) {
    var results = graph.getBestSolution();
    reset(chrom.SPAWN_FREQUENCE, chrom.PHEROMONE_STRENGTH, chrom.PHEROMONE_DECAY_RATE);
    return results;
}

function runSimulation() {
    var interval = window.setInterval(function simulator() {
        solutions.push(simulationGenerator(population.pop()));
        if (population.length === 0) {
            var solutionsSelected = selection(solutions);
            solutions = [];
            bestSolution = solutionsSelected[0];
            population = solutionsIntoNewPopulation(solutionsSelected);
            while (population.length < POPULATION_SIZE) {
                var parent1 = population[Math.round(Math.random() * population.length - 1)];
                var parent2 = population[Math.round(Math.random() * population.length - 1)];
                var child = crossover(parent1, parent2);
                child = mutation(child);
                population.push(child);
            }
            generation++;

            var text = 'Best solution: ' + Math.round(bestSolution.p) + ', ' + Math.round(bestSolution.SPAWN_FREQUENCE) + ', ' + bestSolution.PHEROMONE_STRENGTH + ', ' + bestSolution.PHEROMONE_DECAY_RATE;
            if (!bestSolutionLabel) {
                bestSolutionLabel = new PIXI.Text(text, { fontFamily: 'Arial', fontSize: 14, fill: 0x993333, align: 'center' });
                bestSolutionLabel.x = 50;
                bestSolutionLabel.y = 470;
                bestOfPreviousGenerationLayer.addChild(bestSolutionLabel);
            } else {
                bestSolutionLabel.text = text;
            }

        }
    }, SIMULATION_TIME);
}

function createPopulation() {
    var population = [];
    for (var i = 0; i < POPULATION_SIZE; i++) {
        var SPAWN_FREQUENCE = Math.random() * 495 + 0.1; // 500
        var PHEROMONE_STRENGTH = Math.random() * 5 + 0.1; //0.3-3
        var PHEROMONE_DECAY_RATE = Math.random() * 3.4e-3 + 0.1e-4; //0.1e-3 - 3.4e-3
        population.push({ SPAWN_FREQUENCE, PHEROMONE_STRENGTH, PHEROMONE_DECAY_RATE });
    }
    return population;
}

function selection(solutions) {
    const GRADED_RETAIN_PERCENT = 0.3;
    const NONGRADED_RETAIN_PERCENT = 0.2;

    solutions = solutions.filter(s => s.path.toString() === SHORTER_PATH.toString());
    solutions.sort(compare);
    solutionsSelected = [];

    graded = GRADED_RETAIN_PERCENT * solutions.length;
    while (graded > 0 && solutions.length > 0) {
        solutionsSelected.push(solutions.pop());
        graded--;
    }

    nongraded = NONGRADED_RETAIN_PERCENT * solutions.length;
    while (nongraded && solutions.length > 0) {
        solutionsSelected.push(solutions.splice(Math.round(Math.random() * solutions.length - 1), 1)[0]);
        nongraded--;
    }
    return solutionsSelected;
}

function crossover(parent1, parent2) {
    var SPAWN_FREQUENCE = flipCoin === 0 ? parent1.SPAWN_FREQUENCE : parent2.SPAWN_FREQUENCE;
    var PHEROMONE_STRENGTH = flipCoin === 0 ? parent1.PHEROMONE_STRENGTH : parent2.PHEROMONE_STRENGTH;
    var PHEROMONE_DECAY_RATE = flipCoin === 0 ? parent1.PHEROMONE_DECAY_RATE : parent2.PHEROMONE_DECAY_RATE;
    var child = { SPAWN_FREQUENCE, PHEROMONE_STRENGTH, PHEROMONE_DECAY_RATE };
    return child;
}

function mutation(chrom) {
    var r = Math.floor(Math.random() * 5); // if 3 or 4 no mutation
    switch (r) {
        case 0:
            chrom.SPAWN_FREQUENCE = Math.random() * 495 + 0.1; // 500
            break;
        case 1:
            chrom.PHEROMONE_STRENGTH = Math.random() * 5 + 0.1; //0.3-3
            break;
        case 2:
            chrom.PHEROMONE_DECAY_RATE = Math.random() * 3.4e-3 + 0.1e-4; //0.1e-3 - 3.4e-3
            break;
    }
    return chrom;
}

// TOOLS

function solutionsIntoNewPopulation(solutionsSelected) {
    newPopulation = [];
    solutionsSelected.forEach(function (solution) {
        var chrom = { SPAWN_FREQUENCE: solution.SPAWN_FREQUENCE, PHEROMONE_STRENGTH: solution.PHEROMONE_STRENGTH, PHEROMONE_DECAY_RATE: solution.PHEROMONE_DECAY_RATE };
        newPopulation.push(chrom);
    });
    return newPopulation;
}

function flipCoin() {
    return Math.round(Math.random());
}

function compare(a, b) {
    if (a.p > b.p) {
        return 1;
    }
    else {
        return -1;
    }
    return 0;
}