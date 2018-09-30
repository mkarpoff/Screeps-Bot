"use strict";

const COLLECTING = 'COLLECTING';
const	WITHDRAWING = 'WITHDRAWING';
const MOVING = 'MOVING';
const MOVING_LD = 'MOVING_LD';
const TRANSFER = 'TRANSFER';
const UPGRADING = 'UPGRADING';
const REPAIRING = 'REPAIRING';
const BUILDING = 'BUILDING';

module.exports = {
	performTask:performTask,
};

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
		default:
			console.warn("[creep.basic.js] Unknown task [" + creep.name +"]: " + creep.memory.task);
			creep.memory.task = null;
	}
}

function collectEnergy(creep) {
	if ( creep.carry.energy == creep.carryCapacity ) {
		creep.memory.task = null;
		return;
	}
	let res = creep.harvest(Game.getObjectById(creep.memory.target));
	if ( res != OK ) {
		creep.memory.task = null;
	}
}

function withdrawEnergy(creep) {
	if ( creep.carry.energy == creep.carryCapacity ) {
		creep.memory.task = null;
		return;
	}
	let res = creep.withdraw(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
	if ( res != OK ) {
		creep.memory.task = null;
	}
}

function transfer(creep) {
	if (creep.carry.energy == 0 ) {
		creep.memory.task = null;
		return;
	}
	let res = creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
	if ( res != OK ) {
		creep.memory.task = null;
	}
}

function upgrade(creep) {
	if (creep.carry.energy == 0 ) {
		creep.memory.task = null;
		return;
	}
	let res = creep.upgradeController(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
	if ( res != OK ) {
		creep.memory.task = null;
	}
}

function build(creep) {
	if (creep.carry.energy == 0 ) {
		creep.memory.task = null;
		return;
	}
	let res = creep.build(Game.getObjectById(creep.memory.target));
	if ( res != OK ) {
		creep.memory.task = null;
	}
}

function repair(creep) {
	if (creep.carry.energy == 0 ) {
		creep.memory.task = null;
	}
	let target = Game.getObjectById(creep.memory.target);
	let res = creep.repair(target);
	if ( res != OK ) {
		creep.memory.task = null;
	} else if ( target.hits == target.hitsMax ) {
		creep.memory.task = null;
	} else if ( target.structureType == STRUCTURE_WALL || target.structureType == STRUCTURE_RAMPART ) {
		creep.memory.task = null;
	}
}

function move(creep) {
	let moveTarget = Game.getObjectById(creep.memory.target);
	if ( moveTarget == null ) {
		return;
	}
	if ( creep.pos.inRangeTo(moveTarget, creep.memory.range) ) {
		creep.memory.task = null;
		return;
	}
	let ret = creep.moveTo(moveTarget, {reusePath:5});
	if (ret != OK ) {
		creep.memory.task = null;
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
		creep.memory.task = null;
		creep.memory.target = null;
		return;
	}
	let exit = creep.room.findExitTo(creep.memory.target);
	if ( exit == ERR_NO_PATH ) {
		console.error("[ " + creep.name + " ] no path to [ " + creep.memory.target + " ]");
		creep.memory.task = null;
		return;
	}
	let moveTarget = creep.pos.findClosestByPath(exit);
	let ret = creep.moveTo(moveTarget, {reusePath:5});
	if (ret != OK ) {
		creep.memory.task = null;
		creep.memory.target = null;
	}
}

