const {assert} = require('chai');
require('mocha');
const KEYS = require('../src/keys');
const Locale = require("../src/models/Locale");


const flatten = (array) => {
	if(!Array.isArray(array)) return array;
	return array.reduce(
		(a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
	);
};

const flattenObject = (val) => {
	if(typeof val !== 'object') return flatten(val);
	return flatten(Object.keys(val).map(key => {
		return flattenObject(val[key]);
	}));
};

let keys = flattenObject(KEYS);


const test = Locale.fromRaw({
	name:'Tester',
	methods:[
		{name:'plural_s', args:`n`, body:`return parseInt(n) === 1 ? '' : 's'`}
	],
	locales:{
		'test':'Test',
		'fn_test':'{x} World',
		'method_test':'{x} Token{plural_s}',
	}
});

const fs = require('fs');
const files = fs.readdirSync('./src/languages');
const languages = files.map(lang => {
	const name = lang.split('.')[0];
	const json = require(`../src/languages/${name}`);
	return {name, json, lang:Locale.fromRaw(json)};
});

const SPECIALS = [
	{key:'create_eos_exchange_ex_field_parts', asserter:x => Array.isArray(x()) && x().length === 4}
]

describe('Locales', () => {

	it('should be able to import JSON formatted languages', () => {
		console.log('Test: ', test.locales['test']())
		console.log('Argument Test: ', test.locales['fn_test']('Hello'))
		console.log('Method Test: ', test.locales['method_test'](4))
	});

	it('should be have all keys', () => {
		languages.map(language => {
			const hasAllKeys = keys.filter(key => {
				if(!language.lang.locales.hasOwnProperty(key) || !language.lang.locales[key].length){
					return key;
				}
				return null;
			}).filter(x => x);

			assert(hasAllKeys.length === 0, `"${language.name}" didn't have all the required keys. \r\nMissing: ${hasAllKeys}`);

			SPECIALS.map(x => {
				assert(x.asserter(language.lang.locales[x.key]), "Could not assert special case: " + x.key);
			})
		})
	});

	// it('should be able to import english', () => {
	// 	let i = 0;
	// 	Object.keys(English.locales).map(key => {
	// 		if(i > 25) return;
	// 		console.log(English.locales[key]());
	// 	});
	// });

});