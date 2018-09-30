"use strict";
let creepBasic = require('creep.basic');
let roleUpgrader = require('role.upgrader');
let roleCollector = require('role.collector');

const COLLECTING = 'COLLECTING';
const MOVING = 'MOVING';
const BUILDING = 'BUILDING';
const ROLE = 'BUILDER';

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
	// If you don't have energy get it first
	if ( creep.carry.energy == 0 ) {
		roleCollector.run(creep);
		return;
	}

	let closestConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES); /* TODO This needs to be the spawn the creep is assigned */
	// If there are no construction sites run the upgrader protocole
	if ( closestConstructionSite == undefined ) {
		roleUpgrader.run(creep);
		return;
	}

	// If you're neer a construction site then build
	if ( creep.pos.inRangeTo(closestConstructionSite, 3) ) {
		memory.task = BUILDING;
		memory.target = closestConstructionSite.id;
		return;
	// Else Move to building site
	} else {
		memory.task = MOVING;
		memory.target = closestConstructionSite.id;
		memory.range = 3
		return;
	}
}

