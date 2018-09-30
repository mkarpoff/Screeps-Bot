"use strict";
let creepBasic = require('creep.basic');
let roleCollector = require('role.collector');

const MOVING = 'MOVING';
const TRANSFER = 'TRANSFER';

let roleBuilder = require('role.builder');

module.exports = {
	
	run: function(creep) {
		if (creep.memory.task == null) {
			determineTask(creep);
		}
		creepBasic.performTask(creep);
	},
};


function determineTask(creep) {
	let memory = creep.memory;
	// If you don't have energy get it first
	if ( creep.carry.energy == 0 ) {
		roleCollector.run(creep);
		return;
	}

	let closestStorage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
		filter: (s) => ( s.structureType == STRUCTURE_SPAWN 
			|| s.structureType == STRUCTURE_EXTENSION 
			|| s.structureType == STRUCTURE_TOWER )
			&& s.energy < s.energyCapacity });
	// If the spawn has no more room for energy run the builder protocole
	if (closestStorage == undefined ) {
		roleBuilder.run(creep);
		return;
	}
	
	// If you're by the spawn transfer energy
	if ( creep.pos.inRangeTo(closestStorage, 1) ) {
		memory.task = TRANSFER;
		memory.target = closestStorage.id;
		memory.range = 1;
		return;

	// move to the spawn
	} else {
		memory.task = MOVING;
		memory.target = closestStorage.id;
		memory.range = 1;
		return;
	}
}

