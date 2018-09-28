"use strict";
let creepBasic = require('creep.basic');
let roleCollector = require('role.collector');

const COLLECTING = 'COLLECTING';
const MOVING = 'MOVING';
const TRANSFER = 'TRANSFER';
const BUILDING = 'BUILDING';
const ROLE = 'HARVESTER';

let roleBuilder = require('role.builder');

module.exports = {
	spawn: function(spawn) {
		spawn.spawnCreep([WORK,WORK,CARRY,MOVE],
			ROLE + Game.time.toString(),
			{ memory: {
				role: ROLE,
				task: null,
				target: null,
				range: null,
			}
		});
	},
	
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

	let closestSpawn = Game.spawns.Spawn1; /* TODO This needs to be the spawn the creep is assigned */
	// If the spawn has no more room for energy run the builder protocole
	if (closestSpawn.energy == closestSpawn.energyCapacity ) {
		roleBuilder.run(creep);
		return;
	}
	
	// If you're by the spawn transfer energy
	if ( creep.pos.inRangeTo(closestSpawn, 1) ) {
		memory.task = TRANSFER;
		memory.target = closestSpawn.id
		memory.range = 1;
		return;

	// move to the spawn
	} else {
		memory.task = MOVING;
		memory.target = closestSpawn.id;
		memory.range = 1;
		return;
	}
}

