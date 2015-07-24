// ==UserScript==
// @name         Leekscript++ Object-like Array
// @namespace    http://your.homepage/
// @version      0.1
// @description  Add the notation Array.key to the leekscript.
// @author       Charlesfire
// @match        http://leekwars.com/
// @grant        none
// @require		 https://raw.githubusercontent.com/charlesfire/LeekScriptPlusPlus/master/LeekScript%2B%2B%20Core.user.js
// ==/UserScript==

var ArrayLikeObjectPass = function()
{
	this.compile = function(code)
	{
		code = code.replace(/\.(\w+)\b/g, "\/\*OLA\*\/['$1']");
		return {code : code, error : undefined};
	};
	
	this.decompile = function(code)
	{
		code = code.replace(/\/\*OLA\*\/\[('|")(\w+)('|")\]/g, ".$2");
		return {code : code, error : undefined};
	};
};

compiler.addPass(new ArrayLikeObjectPass);