var user_name = '';
var avatar = '';




VK.init(function() {
	init();
}, function() {
	alert('Ошибка');
}, '5.103');



function init() {
	VK.api("users.get", {"fields": "photo_50,first_name,last_name", "v":"5.73"}, function (data) {
		user_name = data.response[0].first_name + ' ' + data.response[0].last_name;
		avatar = data.response[0].photo_50;


		var user_data = document.createElement('div');
		user_data.className = 'user_data';
		user_data.innerHTML = `
			<img src="`+avatar+`">
			<span>`+user_name+`</span>
		`;
		document.body.appendChild(user_data);
	});
}


function publish(level, score) {
	VK.api("wall.post", {"message": 'Ура! Я поиграл в игру "ИЗОЛЯЦИЯ" и добрался до '+(level+1)+' уровня, а по пути убил '+score+' врагов!', "attachments" : "photo-44840923_457240013,https://vk.com/app7193129", "v":"5.73"}, function (data) {

	});
}