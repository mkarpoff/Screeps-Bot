"use strict";

const COLLECTING = 'COLLECTING';
const MOVING = 'MOVING';
const TRANSFER = 'TRANSFER';
const UPGRADING = 'UPGRADING';
const REPAIRING = 'REPAIRING';
const BUILDING = 'BUILDING';

module.exports = {
	collectEnergy: collectEnergy,
	transfer: transfer,
	upgrade: upgrade,
	build: build,
	move: move,
	performTask:performTask,
};

function performTask(creep) {
	switch(creep.memory.task) {
		case null:
			break;
		case MOVING:
			move(creep);
			break;
		case TRANSFER:
			transfer(creep);
			break;
		case COLLECTING:
			collectEnergy(creep);
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
			console.log("[creep.basic.js] Unknown task [" + creep.name +"]: " + creep.memory.task);
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


function transfer(creep) {
	if (creep.carry.energy == 0 ) {
		creep.memory.task = null;
		return;
	}
	let res = creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY)
	if ( res != OK ) {
		creep.memory.task = null;
	}
}

function upgrade(creep) {
	if (creep.carry.energy == 0 ) {
		creep.memory.task = null;
		return;
	}
	let res = creep.upgradeController(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY)
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
	let res = creep.repair(Game.getObjectById(creep.memory.target));
	if ( res != OK ) {
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
