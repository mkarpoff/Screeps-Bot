
let priorityMax = 3;

module.exports = {
	getRepairTarget:  getRepairTarget,
};

function getRepairTarget(obj) {
	let closestRepairSite = null;
	if ( obj.structureType == null ) {
		// If it's a creep doing the repairs
		for (let i = 0; i < priorityMax && closestRepairSite == null; i+=1) {
			closestRepairSite = obj.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (s) => needsRepairCreep(s,i)});
		}
	} else {
		// If it's a tower doing the repairs
		for (let i = 0; i < priorityMax && closestRepairSite == null; i+=1) {
			closestRepairSite = obj.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (s) => needsRepairTower(obj, s, i)});
		}
	}
	return closestRepairSite;
}

function needsRepairCreep(struct, i) {
	switch (i) {
	case 0:
		switch (struct.structureType) {
		case STRUCTURE_WALL:
		case STRUCTURE_RAMPART:
			return (struct.hits < 50000);
		default:
			return (struct.hits < struct.hitsMax * 0.50);
		}
	case 1:
		switch (struct.structureType) {
		case STRUCTURE_WALL:
		case STRUCTURE_RAMPART:
			return (struct.hits < 100000);
		default:
			return false;
		}
	case 2:
		switch (struct.structureType) {
		case STRUCTURE_WALL:
		case STRUCTURE_RAMPART:
			return (struct.hits < 200000 );
		default:
			return false;
		}
	case 3:
		switch (struct.structureType) {
		case STRUCTURE_WALL:
		case STRUCTURE_RAMPART:
			return (struct.hits < RAMPART_HITS_MAX[2]);
		default:
			return false;
		}
	default:
		return false;
	}
}

function needsRepairTower(tower, struct, i) {
	switch (i) {
	case 0:
		switch (struct.structureType) {
		case STRUCTURE_WALL:
		case STRUCTURE_RAMPART:
			return false;
		default:
			return (struct.hits < struct.hitsMax * 0.70);
		}
	case 1:
		switch (struct.structureType) {
		case STRUCTURE_WALL:
		case STRUCTURE_RAMPART:
			return (struct.hits < 100000) && tower.pos.inRangeTo(struct, 5);
		default:
			return (struct.hits < (struct.hitsMax * 0.95));
		}
	case 2:
		switch (struct.structureType) {
		case STRUCTURE_WALL:
		case STRUCTURE_RAMPART:
			return (struct.hits < 200000) && tower.pos.inRangeTo(struct, 5);
		default:
			return ((struct.hitsMax - struct.hits) > 200);
		}
	default:
		return false;
	}
}

