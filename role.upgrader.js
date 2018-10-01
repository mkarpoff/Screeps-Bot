"use strict";
let creepBasic = require("creep.basic");
let roleCollector = require("role.collector");

const MOVING = "MOVING";
const UPGRADING = "UPGRADING";

module.exports = {
	run: function(creep) {
		if ( creep.memory.task == null ) {
			determineTask(creep);
		}
		creepBasic.drawTarget(creep);
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

