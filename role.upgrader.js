"use strict";
let creepBasic = require('creep.basic');
let roleCollector = require('role.collector');

const COLLECTING = 'COLLECTING';
const MOVING = 'MOVING';
const UPGRADING = 'UPGRADING';
const ROLE = 'UPGRADER';

module.exports = {
	spawn: function(spawn) {
		spawn.spawnCreep([WORK,WORK,CARRY,MOVE],
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
	// If you don't have energy get it
	if ( creep.carry.energy == 0 ) {
		roleCollector.run(creep);
		return;
	}

	let closestController = Game.spawns.Spawn1.room.controller;
	// If you're near the controller upgrade it
	if ( creep.pos.inRangeTo(closestController, 2) ) {
		memory.task = UPGRADING;
		memory.target = creep.room.controller.id;
		return;

	} else {
		memory.task = MOVING;
		memory.target = closestController.id;
		memory.range = 2;
		return;
	}
}

