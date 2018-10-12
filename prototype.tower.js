"use strict";

let priorityRepair = require("priority.repair");

module.exports = function() {
	StructureTower.prototype.runTower = runTower;
	StructureTower.prototype.drawTarget = drawTarget;
};

function runTower() {
	let target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
	if (target != null) {
		this.drawTarget(target, TARGET_STYLE.ATTACK);
		this.attack(target);
		return;
	}
	target = this.pos.findClosestByRange(FIND_MY_CREEPS,
		{ filter: (c) => c.hits < c.hitsMax });
	if (target != null) {
		this.drawTarget(target, TARGET_STYLE.HEAL);
		this.heal(target);
		return;
	}
	target = priorityRepair.getRepairTarget(this);
	if (target != null) {
		this.drawTarget(target, TARGET_STYLE.REPAIR);
		this.repair(target);
		return;
	}
}

const TARGET_STYLE = {
	HEAL: {
		fill: "#008000",
		radius: 0.15,
		// Green
		stroke: "#008000",
	},
	ATTACK: {
		fill: "#FF0000",
		radius: 0.20,
		// Red
		stroke: "#FF0000",
	},
	REPAIR: {
		fill: "#00FFFF",
		radius: 0.20,
		// Cyan
		stroke: "#00FFFF",
	},
};

function drawTarget(target, targetStyle) {
	if ( ! Memory.drawTargets ) {
		return;
	}
	if (target != null) {
		this.room.visual.circle(
			target.pos,
			targetStyle
		);
	}
}
