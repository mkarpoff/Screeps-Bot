"use strict";

require("prototype.spawn")();
require("prototype.creep")();
require("prototype.tower")();

Memory.resetLoop = false;
Memory.lorryExists = false;
Memory.towerExists = false;
if ( Memory.drawTargets == undefined ) {
	Memory.drawTargets = true;
}

module.exports.loop = function() {
	// This reset all the creeps logic protocols so that they can break out of
	// bad states by unfortunate writes
	if ( Memory.resetLoop ) {
		for ( let name in Game.creeps ) {
			Game.creeps[name].memory.task = null;
			Game.creeps[name].memory.target = null;
		}
		Memory.resetLoop = false;
	}

	deleteDeadCreeps();
	runCreeps();
	runTowers();
	spawnCreeps();
};

function spawnCreeps() {
	for (let spawn in Game.spawns ) {
		Game.spawns[spawn].runSpawn();
	}
}

function deleteDeadCreeps() {
	for (let name in Memory.creeps) {
		// and checking if the creep is still alive
		if (Game.creeps[name] == undefined) {
			// if not, delete the memory entry
			delete Memory.creeps[name];
		}
	}
}

function runCreeps() {
	for ( let name in Game.creeps ) {
		Game.creeps[name].runCreep();
	}
}

function runTowers() {
	let towers = Game.rooms["W8N3"].find(FIND_STRUCTURES, {
		filter: (s) => s.structureType == STRUCTURE_TOWER
	});
	for (let tower of towers) {
		tower.runTower();
	}
}

