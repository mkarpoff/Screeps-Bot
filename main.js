"use strict";

const HARVESTER = "HARVESTER";
const HARVESTER_LD = "HARVESTER_LD";
const UPGRADER = "UPGRADER";
const BUILDER = "BUILDER";
const REPAIRER = "REPAIRER";
const LORRY = "LORRY";

require("prototype.spawn")();
let roleHarvester = require("role.harvester");
let roleHarvesterLD = require("role.longDistanceHarvester");
let roleUpgrader = require("role.upgrader");
let roleBuilder = require("role.builder");
let roleRepairer = require("role.repairer");
let roleLorry = require("role.lorry");

let criticalNumHarvesters = 0;
let minNumHarvesters = 3;
let minNumUpgraders = 1;
let minNumBuilders = 2;
let minNumRepairers = 2;
let minNumLorrys = 2;

Memory.resetLoop = false;
Memory.lorryExists = false;
const homeRoom = Game.spawns.Spawn1.room.name;
let LD_HARVEST_TARGET = {
	"W8N2": { minNumHarvesters: 2, },
	"W7N3": { minNumHarvesters: 2, },
};

module.exports.loop = function() {
	// This reset all the creeps logic protocols so that they can break out of
	// bad states by unfortunate writes
	if ( Memory.resetLoop ) {
		for ( let name in Game.creeps ) {
			Game.creeps[name].memory.task = null;
			Game.creeps[name].memory.target = null;
		}
		Memory.resetLoop = false;
	}

	deleteDeadCreeps();
	runCreeps();
	runTowers();
	spawnCreeps();
};

function spawnCreeps() {
	let numHarvesters = _.sum( Game.creeps, (c) => c.memory.role == HARVESTER );
	let numUpgraders = _.sum( Game.creeps, (c) => c.memory.role == UPGRADER );
	let numBuilders = _.sum( Game.creeps, (c) => c.memory.role == BUILDER );
	let numRepairers = _.sum( Game.creeps, (c) => c.memory.role == REPAIRER );
	let numLorrys = _.sum( Game.creeps, (c) => c.memory.role == LORRY );
	Memory.lorryExists = numLorrys > 0;

	let energy = 1200; 
	let res;
	if ( numHarvesters < minNumHarvesters ) {
		res = Game.spawns.Spawn1.spawnScalingCreep(energy, HARVESTER);
		if ( res == ERR_NOT_ENOUGH_ENERGY && numHarvesters <= criticalNumHarvesters ) {
			Game.spawns.Spawn1.spawnScalingCreep(200, HARVESTER);
		}
	} else if ( numUpgraders < minNumUpgraders ) {
		Game.spawns.Spawn1.spawnScalingCreep(energy, UPGRADER);
	} else if ( numBuilders < minNumBuilders ) {
		Game.spawns.Spawn1.spawnScalingCreep(energy, BUILDER);
	} else if ( numRepairers < minNumRepairers ) {
		Game.spawns.Spawn1.spawnScalingCreep(energy, REPAIRER);
	} else if ( numLorrys < minNumLorrys && Game.spawns.Spawn1.room.storage != undefined ) {
		Game.spawns.Spawn1.spawnLorryCreep(energy, LORRY);
	} else {
		energy = Game.spawns.Spawn1.room.energyCapacityAvailable;
		for (let room in LD_HARVEST_TARGET ) {
			numHarvesters = _.sum( Game.creeps,
				(c) => c.memory.role == HARVESTER_LD
					&& c.memory.harvestRoomName == room);
			if ( numHarvesters < LD_HARVEST_TARGET[room].minNumHarvesters ) {
				Game.spawns.Spawn1.spawnLongDistanceWorker(
					energy, HARVESTER_LD, 3, homeRoom, room, null);
			}
		}
	}
}

function deleteDeadCreeps() {
	for (let name in Memory.creeps) {
		// and checking if the creep is still alive
		if (Game.creeps[name] == undefined) {
			// if not, delete the memory entry
			delete Memory.creeps[name];
		}
	}
}

function runCreeps() {
	for ( let name in Game.creeps ) {
		let creep = Game.creeps[name];
		if ( creep.spawning ) {
			continue;
		}
		switch( creep.memory.role ) {
		case HARVESTER:
			roleHarvester.run(creep);
			break;
		case UPGRADER:
			roleUpgrader.run(creep);
			break;
		case BUILDER:
			roleBuilder.run(creep);
			break;
		case REPAIRER:
			roleRepairer.run(creep);
			break;
		case HARVESTER_LD:
			roleHarvesterLD.run(creep);
			break;
		case LORRY:
			roleLorry.run(creep);
			break;
		default:
			console.log("[ " + creep.name + " ] Unknown role [ " + creep.memory.role + " ]" );
		}
	}
}

function runTowers() {
	let towers = Game.rooms[homeRoom].find(FIND_STRUCTURES, {
		filter: (s) => s.structureType == STRUCTURE_TOWER
	});
	for (let tower of towers) {
		let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (target != undefined) {
			tower.attack(target);
		}
	}
}

