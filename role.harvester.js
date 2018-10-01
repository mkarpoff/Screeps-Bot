"use strict";

const COLLECTING = "COLLECTING";
const MOVING = "MOVING";
const TRANSFER = "TRANSFER";

let roleBuilder = require("role.builder");

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
		if ( creep.room.find( FIND_SOURCES_ACTIVE ) == null ) {
			return;
		}
		let closestSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
		if ( closestSource == null ) {
			closestSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
		}
		if ( closestSource == null ) {
			return;
		}
		if ( creep.pos.inRangeTo(closestSource, 1) ) {
			memory.task = COLLECTING;
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
	let closestStorage;
	if (Memory.lorryExists) {
		closestStorage = creep.room.storage;
	} else {
		closestStorage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
			filter: (s) => ( s.structureType == STRUCTURE_SPAWN 
				|| s.structureType == STRUCTURE_EXTENSION 
				|| s.structureType == STRUCTURE_TOWER )
				&& s.energy < s.energyCapacity });
	}
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

