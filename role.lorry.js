"use strict";

const MOVING = "MOVING";
const TRANSFER = "TRANSFER";


module.exports = {
	run: function(creep) {
		if (creep.memory.task == null) {
			determineTask(creep);
		}
		creep.drawTarget(creep);
		creep.performTask(creep);
	},
};


function determineTask(creep) {
	let memory = creep.memory;
	// If you don't have energy get it first
	if ( creep.carry.energy == 0 ) {
		if ( creep.ticksToLive < 30 ) {
			creep.suicide();
		}
		creep.taskCollectEnergyFromStorage();
		return;
	}


	let closestStorage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
		filter: (s) => ( s.structureType == STRUCTURE_SPAWN
			|| s.structureType == STRUCTURE_EXTENSION
			|| s.structureType == STRUCTURE_TOWER )
			&& s.energy < s.energyCapacity });
	if (closestStorage == null ) {
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

