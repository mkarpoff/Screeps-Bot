"use strict";
let creepBasic = require('creep.basic');
let roleBuilder = require('role.builder');
let roleCollector = require('role.collector');

const COLLECTING = 'COLLECTING';
const MOVING = 'MOVING';
const REPAIRING = 'REPAIRING';
const ROLE = 'REPAIRER';

module.exports = {
	spawn: function(spawn) {
		spawn.spawnCreep([WORK,CARRY,MOVE,MOVE],
			ROLE + Game.time.toString(),
			{ memory: {
				role: ROLE,
				task: null,
				target: null,
				range:null,
			}
		});
	},

	run: function(creep) {
		if ( creep.memory.task == null ) {
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

	let closestRepairSite = creep.pos.findClosestByPath(FIND_STRUCTURES, {
		filter: (s) => s.hits < s.maxHits && s.structureType != STRUCTURE_WALL });
	// If there are no repair sites run the construction protocole
	if ( closestRepairSite == undefined ) {
		roleBuilder.run(creep);
		return;
	}

	// If you're neer a repair site then build
	if ( creep.pos.inRangeTo(closestRepairSite, 3) ) {
		memory.task = REPAIRING;
		memory.target = closestRepairSite.id;
		return;
	// Else Move to repair site
	} else {
		memory.task = MOVING;
		memory.target = closestRepairSite.id;
		memory.range = 3
		return;
	}
}


