"use strict";
const HARVESTER = "HARVESTER";
const HARVESTER_LD = "HARVESTER_LD";
const UPGRADER = "UPGRADER";
const BUILDER = "BUILDER";
const REPAIRER = "REPAIRER";
const LORRY = "LORRY";

const criticalNumHarvesters = 0;
const defaultMinNumHarvesters = 3;
const defaultMinNumUpgraders = 1;
const defaultMinNumBuilders = 1;
const defaultMinNumRepairers = 1;
const defaultMinNumLorrys = 3;

module.exports = function() {
	StructureSpawn.prototype.spawnScalingCreep = spawnScalingCreep;
	StructureSpawn.prototype.spawnLongDistanceWorker = spawnLongDistanceWorker;
	StructureSpawn.prototype.spawnLorryCreep = spawnLorryCreep;
	StructureSpawn.prototype.runSpawn = runSpawn;
	StructureSpawn.prototype.setDefaultValues = setDefaultValues;
};

function spawnScalingCreep(energyMax, role, homeRoomName) {
	let numParts = Math.floor(energyMax / 200);
	let body = Array(numParts*3);
	body.fill(WORK, 0,numParts);
	body.fill(CARRY, numParts, numParts*2);
	body.fill(MOVE, numParts*2, numParts*3);
	return this.spawnCreep(body, role + "_" + Game.time.toString(), {
		memory: {
			role: role,
			working: false,
			task: null,
			target: null,
			range: null,
			homeRoomName: homeRoomName,
		}});
}

function spawnLongDistanceWorker(energyMax, role, numWorkParts, homeRoomName, harvestRoomName, harvestSource) {
	let numParts = Math.floor((energyMax - 150 * numWorkParts) / 100 );
	let body = Array(numWorkParts * 2 + numParts * 2);
	body.fill(WORK, 0,numWorkParts);
	body.fill(CARRY, numWorkParts, numWorkParts + numParts);
	body.fill(MOVE, numWorkParts + numParts);
	return this.spawnCreep(body, role + "_" + harvestRoomName + "_" + Game.time.toString(), {
		memory: {
			role: role,
			working: false,
			task: null,
			target: null,
			range: null,
			harvestRoomName: harvestRoomName,
			harvestSource: harvestSource,
			homeRoomName: homeRoomName,
		}});
}

function spawnLorryCreep(energyMax, role, homeRoomName) {
	let numParts = Math.floor(energyMax / 150);
	let body = Array(numParts*3);
	body.fill(CARRY, 0, 2*numParts);
	body.fill(MOVE, numParts);
	return this.spawnCreep(body, role + "_" + Game.time.toString(), {
		memory: {
			role: role,
			task: null,
			target: null,
			range: null,
			homeRoomName: homeRoomName,
		}});
}

function setDefaultValues() {
	if ( this.memory.criticalNumHarvesters == undefined ) {
		this.memory.criticalNumHarvesters = criticalNumHarvesters;
	}
	if ( this.memory.minNumHarvesters == undefined ) {
		this.memory.minNumHarvesters = defaultMinNumHarvesters;
	}
	if ( this.memory.minNumUpgraders == undefined ) {
		this.memory.minNumUpgraders = defaultMinNumUpgraders;
	}
	if ( this.memory.minNumBuilders == undefined ) {
		this.memory.minNumBuilders = defaultMinNumBuilders;
	}
	if ( this.memory.minNumRepairers == undefined ) {
		this.memory.minNumRepairers = defaultMinNumRepairers;
	}
	if ( this.memory.minNumLorrys == undefined ) {
		this.memory.minNumLorrys = defaultMinNumLorrys;
	}
	if ( this.memory.ldHarvestTarget == undefined ) {
		this.memory.ldHarvestTarget = [{ },{ }];
	}
	if ( this.room.controller.level == 8 ) {
		this.memory.minNumUpgraders = 1;
	}
}

function runSpawn() {
	this.setDefaultValues();
	let roomName = this.room.name;
	let numLorrys = _.sum( Game.creeps, (c) => c.memory.role == LORRY );
	Memory.lorryExists = numLorrys > 0;
	// If the spawn is spawning a new creep skip the rest of the code
	if ( this.spawning != null ) {
		return;
	}
	let numHarvesters = _.sum( Game.creeps, (c) => c.memory.homeRoomName == roomName && c.memory.role == HARVESTER );
	let numUpgraders = _.sum( Game.creeps, (c) => c.memory.homeRoomName == roomName && c.memory.role == UPGRADER );
	let numBuilders = _.sum( Game.creeps, (c) => c.memory.homeRoomName == roomName && c.memory.role == BUILDER );
	let numRepairers = _.sum( Game.creeps, (c) => c.memory.homeRoomName == roomName && c.memory.role == REPAIRER );

	let energy = Math.min(1200,this.room.energyCapacityAvailable);
	if ( numHarvesters < this.memory.minNumHarvesters ) {
		let res = this.spawnScalingCreep(energy, HARVESTER, roomName);
		if ( res == ERR_NOT_ENOUGH_ENERGY && numHarvesters <= criticalNumHarvesters ) {
			this.spawnScalingCreep(200, HARVESTER, roomName);
		}
	} else if ( numUpgraders < this.memory.minNumUpgraders ) {
		this.spawnScalingCreep(energy, UPGRADER, roomName );
	} else if ( numBuilders < this.memory.minNumBuilders ) {
		this.spawnScalingCreep(energy, BUILDER, roomName);
	} else if ( numRepairers < this.memory.minNumRepairers ) {
		this.spawnScalingCreep(energy, REPAIRER, roomName);
	} else if ( numLorrys < this.memory.minNumLorrys && this.room.storage != undefined ) {
		this.spawnLorryCreep(1600, LORRY, roomName);
	} else {
		// 1950 with 3 work creates a creep that can carry half of a source
		energy = Math.min(1950, this.room.energyCapacityAvailable);
		for ( let priorityLevel in this.memory.ldHarvestTarget ) {
			for (let targetRoomName in this.memory.ldHarvestTarget[priorityLevel]) {
				numHarvesters = _.sum( Game.creeps,
					(c) => c.memory.role == HARVESTER_LD
						&& c.memory.harvestRoomName == targetRoomName);
				if ( numHarvesters < this.memory.ldHarvestTarget[priorityLevel][targetRoomName] ) {
					this.spawnLongDistanceWorker(
						energy, HARVESTER_LD, 3, roomName, targetRoomName, null);
				}
			}
		}
	}
}
