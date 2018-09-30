"use strict";
let creepBasic = require('creep.basic');
let roleBuilder = require('role.builder');
let roleCollector = require('role.collector');

const MOVING = 'MOVING';
const REPAIRING = 'REPAIRING';
const ROLE = 'REPAIRER';

module.exports = {
	spawn: function(spawn) {
		spawn.spawnCreep([WORK,WORK,CARRY,MOVE],
			ROLE + Game.time.toString(),
			{ memory: {
				role: ROLE,
				task: null,
				target: null,
				range:null,
			}
		});
	},

	run: function(creep) {
		if ( creep.memory.task == null ) {
				determineTask(creep);
		}
//		if ( creep.memory.target != null ) {
//			creep.room.visual.circle(Game.getObjectById(creep.memory.target).pos,
//				{	fill: 'transparent',
//					radius: 0.40,
//					stroke: 'red'
//			});
//		}
		creepBasic.performTask(creep);
	},
};

function determineTask(creep) {
	let memory = creep.memory;
	// If you don't have energy get it first
	if ( creep.carry.energy == 0 ) {
		roleCollector.run(creep);
		return;
	}

	let closestRepairSite = null;
	// If there are no repair sites run the construction protocole
	for (let i = 0; i < priorityMax && closestRepairSite == null; i+=1) {
		closestRepairSite = creep.pos.findClosestByPath(FIND_STRUCTURES, {
			filter: (s) => needsRepair(s,i)});
	}
	if ( closestRepairSite == undefined ) {
		roleBuilder.run(creep);
		return;
	}
	// If you're neer a repair site then build
	// TODO add some logic so it doesn't stand by a source
	if ( creep.pos.inRangeTo(closestRepairSite, 3) ) {
		memory.task = REPAIRING;
		memory.target = closestRepairSite.id;
		return;
	// Else Move to repair site
	} else {
		memory.task = MOVING;
		memory.target = closestRepairSite.id;
		memory.range = 3;
		return;
	}
}

let priorityMax = 3;
function needsRepair(struct, i) {
	switch (i) {
		case 0:
			switch (struct.structureType) {
				case STRUCTURE_WALL:
				case STRUCTURE_RAMPART:
					return (struct.hits < 50000);
				default:
					return (struct.hits < struct.hitsMax * 0.70);
			}
		case 1:
			switch (struct.structureType) {
				case STRUCTURE_WALL:
				case STRUCTURE_RAMPART:
					return (struct.hits < 100000);
				default:
					return (struct.hits < struct.hitsMax * 0.95);
			}
		case 2:
			switch (struct.structureType) {
				case STRUCTURE_WALL:
				case STRUCTURE_RAMPART:
					return (struct.hits < 200000 );
				default:
					return (struct.hits < struct.hitsMax);
			}
		case 3:
			switch (struct.structureType) {
				case STRUCTURE_WALL:
				case STRUCTURE_RAMPART:
					return (struct.hits < RAMPART_HITS_MAX[2]);
				default:
					return (struct.hits < struct.hitsMax);
			}
		default:
			return false;
	}
}

