extends RigidBody
class_name Interactive


export var label = 'Название'

var target = null


func _physics_process(delta):
	if target:
		global_transform = global_transform.interpolate_with(target.global_transform, delta * 15)


func take(_target):
	target = _target
	mode = RigidBody.MODE_STATIC


func drop():
	target = null
	mode = RigidBody.MODE_RIGID
	var dir = transform.basis.z
	apply_central_impulse(dir * -1)


func push():
	target = null
	mode = RigidBody.MODE_RIGID
	var dir = G.player.head.global_transform.basis.z
	dir = dir.rotated(Vector3.UP, 0.1)
	dir.y -= 0.2
	apply_central_impulse(dir * -15)


