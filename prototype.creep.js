"use strict";

let roleHarvester = require("role.harvester");
let roleHarvesterLD = require("role.longDistanceHarvester");
let roleUpgrader = require("role.upgrader");
let roleBuilder = require("role.builder");
let roleRepairer = require("role.repairer");
let roleLorry = require("role.lorry");

let priorityRepair = require("priority.repair");

const HARVESTER = "HARVESTER";
const HARVESTER_LD = "HARVESTER_LD";
const UPGRADER = "UPGRADER";
const BUILDER = "BUILDER";
const REPAIRER = "REPAIRER";
const LORRY = "LORRY";

const COLLECTING = "COLLECTING";
const WITHDRAWING = "WITHDRAWING";
const MOVING = "MOVING";
const MOVING_LD = "MOVING_LD";
const TRANSFER = "TRANSFER";
const UPGRADING = "UPGRADING";
const REPAIRING = "REPAIRING";
const BUILDING = "BUILDING";
const PICKUPING = "PICKUPING";
const RECYCLING = "RECYCLING";

const TARGET_STYLE = {
	HARVESTER: {
		fill: "transparent",
		radius: 0.15,
		// Green
		stroke: "#008000",
		strokeWidth: 0.05,
	},
	REPAIRER: {
		fill: "transparent",
		radius: 0.20,
		// Red
		stroke: "#FF0000",
		strokeWidth: 0.05,
	},
	UPGRADER: {
		fill: "transparent",
		radius: 0.25,
		// Cyan
		stroke: "#00FFFF",
		strokeWidth: 0.05,

	},
	BUILDER: {
		fill: "transparent",
		radius: 0.30,
		// Blue
		stroke: "#0000FF",
		strokeWidth: 0.05,
	},
	LORRY: {
		fill: "transparent",
		radius: 0.35,
		// Hot Pink
		stroke: "#FF1493",
		strokeWidth: 0.05,
	},
	HARVESTER_LD: {
		fill: "transparent",
		radius: 0.40,
		// Orange
		stroke: "#D35400",
		strokeWidth: 0.05,
	},
};

module.exports = function() {
	Creep.prototype.performTask = performTask;
	Creep.prototype.drawTarget = drawTarget;
	Creep.prototype.taskGetHealed = taskGetHealed;
	Creep.prototype.taskGetRecycled = taskGetRecycled;
	Creep.prototype.taskTravelToRoom = taskTravelToRoom;
	Creep.prototype.taskStoreEnergyIn = taskStoreEnergyIn;
	Creep.prototype.taskStoreEnergyInStorage = taskStoreEnergyInStorage;
	Creep.prototype.taskPickupEnergyFromGround = taskPickupEnergyFromGround;
	Creep.prototype.taskCollectEnergyFromStorage = taskCollectEnergyFromStorage;
	Creep.prototype.taskBuildClosestConstructionSite = taskBuildClosestConstructionSite;
	Creep.prototype.taskRepairClosestBuilding = taskRepairClosestBuilding;
	Creep.prototype.taskUpgradeController = taskUpgradeController;
	Creep.prototype.taskHarvestEnergyFromClosestSource = taskHarvestEnergyFromClosestSource;
	Creep.prototype.runCreep = runCreep;
};

function taskGetHealed() {
	if ( this.room.name != this.memory.homeRoomName ) {
		return this.taskTravelToRoom(this.memory.homeRoomName);
	}
	if ( this.carry.energy > 0 ) {
		if ( this.taskStoreEnergyInStorage() ) {
			return true;
		} else if ( this.taskStoreEnergyIn([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]) ) {
			return true;
		}
	}

	let tower = this.pos.findClosestByRange(FIND_MY_STRUCTURES, 
		{filter: s => s.structureType == STRUCTURE_TOWER});
	if ( this.pos.inRangeTo(tower, 1) ) {
		resetCreep(this);
		return true;
	}
	// move to the spawn
	this.memory.task = MOVING;
	this.memory.target = tower.id;
	this.memory.range = 1;
	return true;
}

function taskGetRecycled() {
	if ( this.room.name != this.memory.homeRoomName ) {
		return this.taskTravelToRoom(this.memory.homeRoomName);
	}
	if ( this.carry.energy > 0 ) {
		if ( this.taskStoreEnergyInStorage() ) {
			return true;
		} else if ( this.taskStoreEnergyIn([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]) ) {
			return true;
		}
	}
	let spawn = this.pos.findClosestByPath(FIND_MY_SPAWNS);

	if ( spawn == null ) {
		this.suicide();
		return true;
	}

	if ( this.pos.inRangeTo(spawn, 1) ) {
		this.memory.task = RECYCLING;
		this.memory.target = spawn.id;
		this.memory.range = 1;
		return true;
	}
	// move to the spawn
	this.memory.task = MOVING;
	this.memory.target = spawn.id;
	this.memory.range = 1;
	return true;
}

function taskTravelToRoom(room) {
	this.memory.task = MOVING_LD;
	this.memory.target = room;
	this.memory.range = 1;
	return true;
}

function taskStoreEnergyIn(structureList) {
	let closestStorage = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
		filter: (s) => structureList.includes(s.structureType)
			&& s.energy < s.energyCapacity
			&& ! (s.energyCapacity - s.energy > this.carry[RESOURCE_ENERGY] && s.structureType == STRUCTURE_EXTENSION)
	});
	if ( closestStorage == null ) {
		return resetCreep(this);
	}

	// If you're by the spawn transfer energy
	if ( this.pos.inRangeTo(closestStorage, 1) ) {
		this.memory.task = TRANSFER;
		this.memory.target = closestStorage.id;
		this.memory.range = 1;
		return true;
	}
	// move to the spawn
	this.memory.task = MOVING;
	this.memory.target = closestStorage.id;
	this.memory.range = 1;
	return true;
}

function taskStoreEnergyInStorage() {
	let closestStorage = this.room.storage;
	if ( closestStorage == undefined ) {
		return resetCreep(this);
	}

	// If you're by the spawn transfer energy
	if ( this.pos.inRangeTo(closestStorage, 1) ) {
		this.memory.task = TRANSFER;
		this.memory.target = closestStorage.id;
		this.memory.range = 1;
		return true;
	}

	// move to the spawn
	this.memory.task = MOVING;
	this.memory.target = closestStorage.id;
	this.memory.range = 1;
	return true;
}

let energyToBePickedup = {};
function taskPickupEnergyFromGround() {
	let closestSource = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES,
		{filter: (e) => e.RESOURCE_TYPE = RESOURCE_ENERGY
			&& (energyToBePickedup[e.id] == undefined
			|| energyToBePickedup[e.id] == this.id )});
	if ( closestSource != null ) {
		energyToBePickedup[closestSource.id] = this.id;
		// if you are in range collect energy
		if ( this.pos.inRangeTo(closestSource, 1) ) {
			this.memory.task = PICKUPING;
			this.memory.target = closestSource.id;
			this.memory.range = 1;
			return true;
		}
		// else move closer
		this.memory.task = MOVING;
		this.memory.target = closestSource.id;
		this.memory.range = 1;
		return true;
	}
	closestSource = this.pos.findClosestByPath(FIND_TOMBSTONES,
		{ filter: (t) => t.store[RESOURCE_ENERGY] > 0
			&& (energyToBePickedup[t.id] == undefined
			|| energyToBePickedup[t.id] == this.id )});
	if ( closestSource != null ) {
		energyToBePickedup[closestSource.id] = this.id;
		if ( this.pos.inRangeTo(closestSource, 1) ) {
			this.memory.task = PICKUPING;
			this.memory.target = closestSource.id;
			this.memory.range = 1;
			return true;
		}
		// else move closer
		this.memory.task = MOVING;
		this.memory.target = closestSource.id;
		this.memory.range = 1;
		return true;
	}
	return resetCreep(this);
}

function taskCollectEnergyFromStorage() {
	let closestSource = this.room.storage;
	if ( closestSource == undefined ) {
		return resetCreep(this);
	} else if ( closestSource.store[RESOURCE_ENERGY] < this.carryCapacity ) {
		return resetCreep(this);
	}

	// if you are in range collect energy
	if ( this.pos.inRangeTo(closestSource, 1) ) {
		this.memory.task = WITHDRAWING;
		this.memory.target = closestSource.id;
		this.memory.range = 1;
		return true;
	}
	// else move closer
	this.memory.task = MOVING;
	this.memory.target = closestSource.id;
	this.memory.range = 1;
	return true;
}

function taskBuildClosestConstructionSite() {
	let closestConstructionSite = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

	// If there are no construction sites run the upgrader protocole
	if ( closestConstructionSite == undefined ) {
		return false;
	}

	// If you're neer a construction site then build
	if ( this.pos.inRangeTo(closestConstructionSite, 3) ) {
		this.memory.task = BUILDING;
		this.memory.target = closestConstructionSite.id;
		this.memory.range = 3;
		return true;
	}

	// Move to building site
	this.memory.task = MOVING;
	this.memory.target = closestConstructionSite.id;
	this.memory.range = 3;
	return true;
}

function taskRepairClosestBuilding() {
	let closestRepairSite = null;
	priorityRepair.getRepairTarget(this);
	// If there are no repair sites run the construction protocole
	if ( closestRepairSite == null) {
		return false;
	}
	// If you're neer a repair site then build
	if ( this.pos.inRangeTo(closestRepairSite, 3) ) {
		this.memory.task = REPAIRING;
		this.memory.target = closestRepairSite.id;
		this.memory.range = 3;
		return true;
	// Else Move to repair site
	}
	this.memory.task = MOVING;
	this.memory.target = closestRepairSite.id;
	this.memory.range = 3;
	return true;
}

function taskUpgradeController() {
	let closestController = this.room.controller;
	if ( closestController == undefined ) {
		return false;
	}

	// If you're near the controller upgrade it
	if ( this.pos.inRangeTo(closestController, 2) ) {
		this.memory.task = UPGRADING;
		this.memory.target = closestController.id;
		return true;
	}
	this.memory.task = MOVING;
	this.memory.target = closestController.id;
	this.memory.range = 2;
	return true;
}

function taskHarvestEnergyFromClosestSource() {
	if ( this.room.find( FIND_SOURCES_ACTIVE ) == null ) {
		return resetCreep(this);
	}
	let closestSource = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
	if ( closestSource == null ) {
		closestSource = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
	}
	if ( closestSource == null ) {
		return resetCreep(this);
	}
	// if you are in range collect energy
	if ( this.pos.inRangeTo(closestSource, 1)) {
		this.memory.task = COLLECTING;
		this.memory.target = closestSource.id;
		this.memory.range = 1;
		return true;
	}
	// else move closer
	this.memory.task = MOVING;
	this.memory.target = closestSource.id;
	this.memory.range = 1;
	return true;
}

function performTask(creep) {
	switch(creep.memory.task) {
	case null:
		break;
	case MOVING:
		move(creep);
		break;
	case MOVING_LD:
		moveLongDistance(creep);
		break;
	case TRANSFER:
		transfer(creep);
		break;
	case COLLECTING:
		collectEnergy(creep);
		break;
	case WITHDRAWING:
		withdrawEnergy(creep);
		break;
	case UPGRADING:
		upgrade(creep);
		break;
	case BUILDING:
		build(creep);
		break;
	case REPAIRING:
		repair(creep);
		break;
	case PICKUPING:
		pickupEnergy(creep);
		break;
	case RECYCLING:
		recycleCreep(creep);
		break;
	default:
		console.warn("[creep.basic.js] Unknown task [" + creep.name +"]: " + creep.memory.task);
		creep.memory.task = null;
	}
}

function runCreep() {
	if ( this.spawning ) {
		return;
	}
	switch( this.memory.role ) {
	case HARVESTER:
		roleHarvester.run(this);
		break;
	case UPGRADER:
		roleUpgrader.run(this);
		break;
	case BUILDER:
		roleBuilder.run(this);
		break;
	case REPAIRER:
		roleRepairer.run(this);
		break;
	case HARVESTER_LD:
		roleHarvesterLD.run(this);
		break;
	case LORRY:
		roleLorry.run(this);
		break;
	default:
		console.log("[ " + this.name + " ] Unknown role [ " + this.memory.role + " ]" );
	}
}

function drawTarget() {
	if ( ! Memory.drawTargets ) {
		return;
	}
	if ( this.memory.target != null ) {
		let target = Game.getObjectById(this.memory.target);
		if (target != null) {
			this.room.visual.circle(
				target.pos,
				TARGET_STYLE[this.memory.role]
			);
		}
	}
}

/* LOCAL METHODS */
function pickupEnergy(creep) {
	let target = Game.getObjectById(creep.memory.target);
	let res = creep.pickup(target);
	if ( res ) {
		res = creep.withdraw(target, RESOURCE_ENERGY);
	}
	delete energyToBePickedup[creep.memory.target];
	return resetCreep(creep);
}

function collectEnergy(creep) {
	if ( creep.carry.energy == creep.carryCapacity ) {
		return resetCreep(creep);
	}
	let res = creep.harvest(Game.getObjectById(creep.memory.target));
	if ( res ) {
		return resetCreep(creep);
	}
}

function withdrawEnergy(creep) {
	if ( creep.carry.energy == creep.carryCapacity ) {
		return resetCreep(creep);
	}
	let res = creep.withdraw(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
	if ( res ) {
		return resetCreep(creep);
	}
}

function transfer(creep) {
	let target = Game.getObjectById(creep.memory.target);
	if (creep.carry.energy == 0 ) {
		return resetCreep(creep);
	}
	let res = creep.transfer(target, RESOURCE_ENERGY);
	if ( res ) {
		return resetCreep(creep);
	}
	if ( target.energy == target.energyCapacity ) {
		return resetCreep(creep);
	}
}

function upgrade(creep) {
	if (creep.carry.energy == 0 ) {
		return resetCreep(creep);
	}
	let res = creep.upgradeController(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
	if ( res ) {
		return resetCreep(creep);
	}
}

function build(creep) {
	if (creep.carry.energy == 0 ) {
		return resetCreep(creep);
	}
	let res = creep.build(Game.getObjectById(creep.memory.target));
	if ( res ) {
		return resetCreep(creep);
	}
}

function repair(creep) {
	if (creep.carry.energy == 0 ) {
		return resetCreep(creep);
	}
	let target = Game.getObjectById(creep.memory.target);
	let res = creep.repair(target);
	if ( res ) {
		return resetCreep(creep);
	} else if ( target.hits == target.hitsMax ) {
		return resetCreep(creep);
	} else if ( target.structureType == STRUCTURE_WALL || target.structureType == STRUCTURE_RAMPART ) {
		return resetCreep(creep);
	}
}

function move(creep) {
	let moveTarget = Game.getObjectById(creep.memory.target);
	if ( moveTarget == null ) {
		return resetCreep(creep);
	}
	if ( creep.pos.inRangeTo(moveTarget, creep.memory.range) ) {
		return resetCreep(creep);
	}
	let ret = creep.moveTo(moveTarget, {reusePath:5});
	if ( ret ) {
		return resetCreep(creep);
	}
}

function moveLongDistance(creep) {
	if ( creep.room.name == creep.memory.target ) {
		let xt = null;
		let yt = null;
		if ( creep.pos.x == 0 ) {
			xt = 1;
		} else if ( creep.pos.x == 49 ) {
			xt = 48;
		} else {
			xt = creep.pos.x;
		}
		if ( creep.pos.y == 0 ) {
			yt = 1;
		} else if ( creep.pos.y == 49 ) {
			yt = 48;
		} else {
			yt = creep.pos.y;
		}
		creep.moveTo(xt,yt);
		return resetCreep(creep);
	}
	let exit = creep.room.findExitTo(creep.memory.target);
	if ( exit == ERR_NO_PATH ) {
		console.log("[ " + creep.name + " ] no path to [ " + creep.memory.target + " ]");
		return resetCreep(creep);
	}
	let moveTarget = creep.pos.findClosestByPath(exit);
	let ret = creep.moveTo(moveTarget, {reusePath:5});
	if ( ret ) {
		return resetCreep(creep);
	}
}

function recycleCreep(creep) {
	let spawn = Game.getObjectById(creep.memory.target);
	if ( spawn == null ) {
		resetCreep(creep);
	}
	let res = spawn.recycleCreep(creep);
	if ( res ) {
		resetCreep(creep);
	}
}

function resetCreep(creep) {
	creep.memory.target = null;
	creep.memory.task = null;
	creep.range = null;
	return false;
}


