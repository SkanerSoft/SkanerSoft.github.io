extends KinematicBody

const SPEED = 4

onready var head = $head
onready var ray = $head/camera/ray


var dir = Vector3()
var cast = null
var object = null


func _ready():
	G.player = self


func _physics_process(delta):
	#control
	dir.z = 0
	dir.x = 0

	if Input.is_action_pressed('ui_up'):
		dir.z = -SPEED
	elif Input.is_action_pressed('ui_down'):
		dir.z = SPEED

	if Input.is_action_pressed('ui_left'):
		dir.x = -SPEED
	elif Input.is_action_pressed('ui_right'):
		dir.x = SPEED

	dir.y -= 1

	if dir.x || dir.z:
		dir = dir.rotated(Vector3.UP, rotation.y)

	dir = move_and_slide(dir, Vector3.UP)

	#cast
	cast = ray.get_collider()


func action_left():
	if cast is Interactive:
		if object:
			object.drop()
		object = cast
		cast.take($target_object)
	else:
		if object:
			object.push()
			object = null


func action_right():
	if object:
		object.drop()
		object = null


func _input(e):
	if e is InputEventMouseMotion:
		rotation.y -= e.relative.x * 0.005
		head.rotation.x = clamp(head.rotation.x - e.relative.y * 0.005, -1.4, 1.4)
	elif e is InputEventMouseButton:
		if e.pressed:
			if e.button_index == BUTTON_LEFT:
				action_left()
			elif e.button_index == BUTTON_RIGHT:
				action_right()




