const strings = {};

function translate(key){
	return strings[key] || key;
}

function loadLanguageStrings(map){
	Object.assign( strings, map );
}

export default translate;
export {
	loadLanguageStrings,
	translate
};
