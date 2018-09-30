module.exports = {
    "env": {
        "es6": true,
        "node": true,
				"screeps/screeps": true,
    },
		"plugins": [
			"screeps",
		],
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
				"no-console": [ "off" 
				],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
        ]
    }
};
