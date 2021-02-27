extends Node


func _ready():
	G.pause(false)
	G.level = load("res://levels/"+G.level_name+".tscn").instance()
	$world.add_child(G.level)


func _input(e):
	if e is InputEventKey:
		if e.pressed && e.scancode == KEY_ESCAPE:
			get_tree().quit()
