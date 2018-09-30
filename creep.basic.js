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
		return resetCreep(creep);
	}
	let res = creep.harvest(Game.getObjectById(creep.memory.target));
	if ( res != OK ) {
		return resetCreep(creep);
	}
}

function withdrawEnergy(creep) {
	if ( creep.carry.energy == creep.carryCapacity ) {
		return resetCreep(creep);
	}
	let res = creep.withdraw(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
	if ( res != OK ) {
		return resetCreep(creep);
	}
}

function transfer(creep) {
	if (creep.carry.energy == 0 ) {
		return resetCreep(creep);
	}
	let res = creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
	if ( res != OK ) {
		return resetCreep(creep);
	}
}

function upgrade(creep) {
	if (creep.carry.energy == 0 ) {
		return resetCreep(creep);
	}
	let res = creep.upgradeController(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
	if ( res != OK ) {
		return resetCreep(creep);
	}
}

function build(creep) {
	if (creep.carry.energy == 0 ) {
		return resetCreep(creep);
	}
	let res = creep.build(Game.getObjectById(creep.memory.target));
	if ( res != OK ) {
		return resetCreep(creep);
	}
}

function repair(creep) {
	if (creep.carry.energy == 0 ) {
		return resetCreep(creep);
	}
	let target = Game.getObjectById(creep.memory.target);
	let res = creep.repair(target);
	if ( res != OK ) {
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
	if (ret != OK ) {
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
		console.error("[ " + creep.name + " ] no path to [ " + creep.memory.target + " ]");
		return resetCreep(creep);
	}
	let moveTarget = creep.pos.findClosestByPath(exit);
	let ret = creep.moveTo(moveTarget, {reusePath:5});
	if (ret != OK ) {
		return resetCreep(creep);
	}
}

function resetCreep(creep) {
	creep.memory.target = null;
	creep.memory.task = null;
	creep.range = null;
}


