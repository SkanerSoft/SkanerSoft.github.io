extends Node


var player
var level



var level_name = 'level_0'



func _ready():
	pass


func pause(p=true):
	get_tree().paused = p
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED if !p else Input.MOUSE_MODE_VISIBLE)
