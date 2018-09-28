"use strict";
let creepBasic = require('creep.basic');
let roleCollector = require('role.collector');

const COLLECTING = 'COLLECTING';
const MOVING = 'MOVING';
const UPGRADING = 'UPGRADING';
const ROLE = 'UPGRADER';

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
		switch(creep.memory.task) {
			case null:
				determineTask(creep);
				break;
			case MOVING:
				creepBasic.move(creep);
				break;
			case COLLECTING:
				creepBasic.collectEnergy(creep);
				break;
			case UPGRADING:
				creepBasic.upgrade(creep);
				break;
			default:
		}
	},
};

function determineTask(creep) {
	let memory = creep.memory;
	// If you don't have energy get it
	if ( creep.carry.energy == 0 ) {
		roleCollector.run(creep);
		return;
	}

	let closestController = Game.spawns.Spawn1.room.controller /* TODO This needs to be the spawn the creep is assigned */
	// If you're near the controller upgrade it
	if ( creep.pos.inRangeTo(closestController, 2) ) {
		memory.task = UPGRADING;
		memory.target = creep.room.controller.id;
		return;

	} else {
		memory.task = MOVING;
		memory.target = closestController.id;
		memory.range = 2
		return;
	}
}

