// ==UserScript==
// @name         LeekScript++ Core
// @namespace    http://your.homepage/
// @version      0.1
// @description  This is the core plugin for my additions to the leekscript.
// @author       Charlesfire
// @match        http://leekwars.com/*
// @grant        none
// ==/UserScript==

//     /\[('|")(\w+)('|")\]/g
//     /\.(\w+)\b/g

var Compiler = function()
{
	this.passes = new Array();
	
	this.addPass = function(pass)
	{
		this.passes[this.passes.length] = pass;
	};
	
	this.compile = function(code)
	{
		var result;
		var length = this.passes.length;
		for(var i = 0; i < length; i++)
		{
			result = this.passes[i].compile(code);
			if (result.error != undefined)
				showError(result.error);
			else
				code = result.code;
		}
		return code;
	};
	
	this.decompile = function(code)
	{
		var result;
		var length = this.passes.length;
		for(var i = 0; i < length; i++)
		{
			result = this.passes[i].decompile(code);
			if (result.error != undefined)
				showError(result.error);
			else
				code = result.code;
		}
		return code;
	};
	
	function showError(error)
	{
		$('#results').append("<div class='error'>× <i>" + error + "</i></div>");
	}
};

function modifyEditors()
{
	console.log("YOLOOOOOOOOOOOOOOOOOOOOOOOOOO!");
	for(var _editor in editors)
	{
		editors[_editor].load = function(show)
		{
			var editor = this;
			_.get('ai/get/' + editor.id + '/$', function(data)
			{
				if (data.success)
				{
					var ai = data.ai.code;
					ai = compiler.decompile(ai);

					if (_BASIC)
					{
						editor.editorDiv.append("<textarea>" + ai + "</textarea>");
						_editorResize();
					}
					else
					{
						editor.editor.setValue(ai);
						editor.editor.getDoc().clearHistory();

						setTimeout(function()
						{
							editor.updateIncludes();
						}, 200);
					}

					editor.loaded = true;
					if (show)
					{
						editor.show();
					}
				}
			});
		};

		editors[_editor].save = function()
		{
			var editor = this;
			if (_saving) return;
			_saving = true;

			_.log("save id " + editor.id + "...");

			editor.tabDiv.removeClass("modified");

			$('#compiling').show();
			$('#results').empty().hide();

			var saveID = editor.id > 0 ? editor.id : 0;

			var content = _BASIC ? editor.editorDiv.find('textarea').val() : editor.editor.getValue();
			content = compiler.compile(content);

			_.post('ai/save/', {ai_id: saveID, code: content}, function(data)
			{
				_saving = false;
				$('#results').empty().show();
				$('#compiling').hide();

				if (!data.success || data.result.length === 0)
				{
					$('#results').append("<div class='error'>× <i>" + _.lang.get('editor', 'server_error') + "</i></div>");
					return;
				}

				for (var r in data.result)
				{
					var res = data.result[r];
					var code = res[0];
					var ia = res[1];

					var iaEditor = editors[ia];
					var iaName = iaEditor.name;

					if (code === 2)
					{
						$('#results').append("<div class='good'>✔ " + _.lang.get('editor', 'valid_ai', _.protect(iaName)) + "</div><br>");
						$('#results .good').last().delay(800).fadeOut(function()
						{
							$('#results').hide();
						});

						iaEditor.error = false;
						iaEditor.tabDiv.removeClass("error");
						$('.line-error').removeClass("line-error");

						iaEditor.level = res[3];
						if (ia == current)
						{
							$('#comp-level').text(res[3]);
						}

					}
					else if (code === 1)
					{
						var info = res[2];

						$('#results').append("<div class='error'>× <b>" + _.protect(iaName) + "</b>&nbsp; ▶ " + info + "</div><br>");
						iaEditor.tabDiv.removeClass("error").addClass("error");
						iaEditor.error = true;
					} 
					else if (code === 0)
					{

						var line = res[3];
						var pos = res[4];
						var info = res[5];

						if (res.length === 8)
						{
							info = _.lang.get('java_compilation', res[6], res[7]);
						}
						else
						{
							info = _.lang.get('java_compilation', res[6]);
						}
						info = '(' + res[5] + ') ' + info;

						$('#results').append("<div class='error'>× " + _.lang.get('editor', 'ai_error', _.protect(iaName), line) + "&nbsp; ▶ " + info + "</div><br>");

						iaEditor.tabDiv.removeClass("error").addClass("error");

						iaEditor.error = true;
						iaEditor.errorLine = line;

						iaEditor.showErrors();
					}
				}

				editor.modified = false;

				if (editor.needTest)
				{
					editor.needTest = false;
					editor.test();
				}
			});
		};
	}
	editors[current].load(true);
}


var compiler = new Compiler();

var interval = setInterval(function()
{
	if (typeof editors !== "undefined" && Object.keys(editors).length !== 0)
	{
		modifyEditors();
		clearInterval(interval);
		console.log("LS++ activated!");
	}
}, 100);
