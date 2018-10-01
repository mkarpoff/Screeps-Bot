"use strict";

module.exports = function() {
	StructureSpawn.prototype.spawnScalingCreep =
		function(energyMax, role) {
			let numParts = Math.floor(energyMax / 200);
			let body = Array(numParts*3);
			body.fill(WORK, 0,numParts);
			body.fill(CARRY, numParts, numParts*2);
			body.fill(MOVE, numParts*2, numParts*3);
			return this.spawnCreep(body, role + "_" + Game.time.toString(), {
				memory: {
					role: role,
					task: null,
					target: null,
					range: null,
				}});
		};
	StructureSpawn.prototype.spawnLongDistanceWorker =
		function(energyMax, role, numWorkParts, homeRoomName, harvestRoomName, harvestSource) {

			let numParts = Math.floor((energyMax - 150 * numWorkParts) / 100 );
			let body = Array(numWorkParts * 2 + numParts * 2);
			body.fill(WORK, 0,numWorkParts);
			body.fill(CARRY, numWorkParts, numWorkParts + numParts);
			body.fill(MOVE, numWorkParts + numParts);
			return this.spawnCreep(body, role + "_" + harvestRoomName + "_" + Game.time.toString(), {
				memory: {
					role: role,
					task: null,
					target: null,
					range: null,
					harvestRoomName: harvestRoomName,
					harvestSource: harvestSource,
					homeRoomName: homeRoomName,
				}});
		};
	StructureSpawn.prototype.spawnLorryCreep =
		function(energyMax, role) {
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
				}});
		};
};
