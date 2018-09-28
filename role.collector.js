"use strict";
let creepBasic = require('creep.basic');

const COLLECTING = 'COLLECTING';
const MOVING = 'MOVING';
module.exports = {
	run: function(creep) {
		if ( creep.memory.task == null ) {
				determineTask(creep);
		}
		creepBasic.performTask(creep);
	}
};

function determineTask(creep) {
	let memory = creep.memory;
	let closestSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
	if (closestSource == null ) {
		closestSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
	}

	// if you're in range collect energy
	if ( creep.pos.inRangeTo(closestSource, 1) ) {
		memory.task = COLLECTING;
		memory.target = closestSource.id;
		memory.range = 1;
		return;
	}
	// else move closer
	memory.task = MOVING;
	memory.target = closestSource.id;
	memory.range = 1
	return;
}
