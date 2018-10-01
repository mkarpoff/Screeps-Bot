"use strict";
let creepBasic = require("creep.basic");

const MOVING = "MOVING";
const WITHDRAWING = "WITHDRAWING";
const TRANSFER = "TRANSFER";


module.exports = {
	run: function(creep) {
		if (creep.memory.task == null) {
			determineTask(creep);
		}
		creepBasic.drawTarget(creep);
		creepBasic.performTask(creep);
	},
};


function determineTask(creep) {
	let memory = creep.memory;
	// If you don't have energy get it first
	if ( creep.carry.energy == 0 ) {
		if ( creep.ticksToLive < 30 ) {
			creep.suicide();
		}
		let closestSource = creep.room.storage;
		if ( closestSource == undefined ) {
			// No storage but lorry exists
			console.log("[ " + creep.name + " ] No storage to withdraw from");
			return;
		}
		if ( creep.pos.inRangeTo(closestSource, 1) ) {
			memory.task = WITHDRAWING;
			memory.target = closestSource.id;
			memory.range = 1;
			return;
		}
		// else move closer
		memory.task = MOVING;
		memory.target = closestSource.id;
		memory.range = 1;
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

