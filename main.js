"use strict";

const HARVESTER = 'HARVESTER';
const UPGRADER = 'UPGRADER';
const BUILDER = 'BUILDER';
const REPAIRER = 'REPAIRER';

let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleRepairer = require('role.repairer');
let minNumHarvesters = 8;
let minNumUpgraders = 6;
let minNumBuilders = 4;
let minNumRepairers = 4;

let resetLoop = false;
module.exports.loop = function() {
 
	// This reset all the creeps logic protocols so that they can break out of
	// bad states by unfortunate writes
	if ( resetLoop ) {
		for ( let name in Game.creeps ) {
			Game.creeps[name].memory.task = null;
			Game.creeps[name].memory.target = null;
		}
		resetLoop = false;
	}

	for (let name in Memory.creeps) {
		// and checking if the creep is still alive
		if (Game.creeps[name] == undefined) {
			// if not, delete the memory entry
			delete Memory.creeps[name];
		}
	}

	for ( let name in Game.creeps ) {
		let creep = Game.creeps[name];
		if ( creep.memory.role == HARVESTER ) {
			roleHarvester.run(creep);
		} else if ( creep.memory.role == UPGRADER ) {
			roleUpgrader.run(creep);
		} else if ( creep.memory.role == BUILDER ) {
			roleBuilder.run(creep);
		} else if ( creep.memory.role == REPAIRER) {
			roleRepairer.run(creep);
		}
	}
	
	let numHarvesters = _.sum( Game.creeps, (c) => c.memory.role == HARVESTER );
	let numUpgraders = _.sum( Game.creeps, (c) => c.memory.role == UPGRADER );
	let numBuilders = _.sum( Game.creeps, (c) => c.memory.role == BUILDER );
	let numRepairers = _.sum( Game.creeps, (c) => c.memory.role == REPAIRER );
	if ( numHarvesters < minNumHarvesters ) {
		roleHarvester.spawn(Game.spawns.Spawn1);
	} else if ( numUpgraders < minNumUpgraders ) {
		roleUpgrader.spawn(Game.spawns.Spawn1);
	} else if ( numBuilders < minNumBuilders ) {
		roleBuilder.spawn(Game.spawns.Spawn1);
	} else if ( numRepairers < minNumRepairers ) {
		roleRepairer.spawn(Game.spawns.Spawn1);
	}
}
