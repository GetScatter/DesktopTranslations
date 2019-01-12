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
}).filter(x => !!x);

const SPECIALS = [
	{key:'create_eos_exchange_ex_field_parts', asserter:x => Array.isArray(x()) && x().length === 4}
]

describe('Locales', () => {

	it('should be able to import JSON formatted languages', () => {
		console.log('Test: ', test.locales['test']())
		console.log('Argument Test: ', test.locales['fn_test']('Hello'))
		console.log('Method Test: ', test.locales['method_test'](4))
	});

	it('should have methods of maximum length', () => {
		languages.map(language => {
			language.json.methods.map(method => {
				assert(method.body.length < 100, "Invalid method body length: ", language, method)
			})
		})
	});

	it('should be have all exact keys', () => {
		languages.map(language => {
			const hasAllKeys = keys.filter(key => {
				if(!language.lang.locales.hasOwnProperty(key) || !language.lang.locales[key].length){
					return key;
				}
				return null;
			}).filter(x => x);

			assert(hasAllKeys.length === 0, `"${language.name}" didn't have all the required keys. \r\nMissing: ${hasAllKeys}`);


			const hasExtraKeys = Object.keys(language.lang.locales).filter(key => {
				if(!keys.includes(key)) return key;
				return null;
			}).filter(x => x);

			assert(hasExtraKeys.length === 0, `"${language.name}" had extra keys. \r\nExtra: ${hasExtraKeys}`);

			SPECIALS.map(x => {
				assert(x.asserter(language.lang.locales[x.key]), "Could not assert special case: " + x.key);
			})
		})
	});

});