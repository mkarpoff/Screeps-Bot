"use strict";
let creepBasic = require("creep.basic");

const COLLECTING = "COLLECTING";
const WITHDRAWING = "WITHDRAWING";
const MOVING = "MOVING";
module.exports = {
	run: function(creep) {
		if ( creep.memory.task == null ) {
			determineTask(creep);
		}
		creepBasic.performTask(creep);
	}
};

function determineTask(creep) {
	if ( creep.ticksToLive < 30 && creep.carry.energy == 0) {
		creep.suicide();
	}
	let memory = creep.memory;
	let closestSource = null;
	if ( Memory.lorryExists == false || creep.room.storage == undefined ) {
		closestSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
		if ( closestSource == null ) {
			closestSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
		}
	}
	// There are no more sources with reasources check in storage
	if ( closestSource == null ) {
		closestSource = creep.room.storage;
		if ( closestSource == undefined ) {
			return;
		} else if ( closestSource.store[RESOURCE_ENERGY] < creep.carryCapacity ) {
			return;
		} else {
			// if you are in range collect energy
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
	}

	// if you are in range collect energy
	if ( creep.pos.inRangeTo(closestSource, 1) && creep.room.storage == undefined) {
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
