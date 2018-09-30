"use strict";
let creepBasic = require('creep.basic');
let roleCollector = require('role.collector');

const MOVING = 'MOVING';
const MOVING_LD = 'MOVING_LD';
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
	// Don't try to harvest energy if you are 200 from death you'll end up droping it on the ground
	if ( creep.ticksToLive < 200 && creep.carry.energy == 0) {
		creep.suicide();
	}

	// If you don't have energy get it first
	if ( creep.carry.energy == 0 ) {
		// move to the right room
		if ( creep.room.name != creep.memory.harvestRoomName ) {
			memory.task = MOVING_LD;
			memory.target = creep.memory.harvestRoomName;
			memory.range = 1;
			return;
		} else {
			roleCollector.run(creep);
			return;
		}

	// If you have energy bring it home
	} else {
		// move to the right room
		if ( creep.room.name != memory.homeRoomName ) {
				memory.task = MOVING_LD;
				memory.target = creep.memory.homeRoomName;
				memory.range = 1;
				return;
		}

// Harvester storage code. Might make it place the energy in a container to pass it on
		let closestStorage = creep.room.storage;
		if ( closestStorage == undefined || _.sum(closestStorage.store ) == closestStorage.storeCapacity) {

			closestStorage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
				filter: (s) => (s.structureType == STRUCTURE_SPAWN 
					|| s.structureType == STRUCTURE_EXTENSION )
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
}

