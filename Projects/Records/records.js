var Records = function (count) {

	var max = count || 10;

	var records = [];

	var sortUP = function () {
		records.sort(function (a, b) { // По возрасту (возрастание)
			if (a.record < b.record)
				return 1;
			else if (a.record > b.record)
				return -1;
			else
				return 0;
		});
	};

	var sortDOWN = function () {
		records.sort(function (a, b) { // По возрасту (возрастание)
			if (a.record > b.record)
				return 1;
			else if (a.record < b.record)
				return -1;
			else
				return 0;
		});
	};

	this.addRecord = function (record, info) {
		records.push({
			record : record,
			info   : info
		});

		sortUP();

		records.length = max;

	};

	this.getRecords = function () {
		return records;
	};

	this.getAsNumbers = function () {
		var arr = [];
		for (var i = 0; i <  records.length; i++) {
			arr.push(records[i].record);
		}
		return arr;
	};

	this.getAsJSON = function () {
		var arr = '[', info;
		for (var i = 0; i <  records.length; i++) {
			if (i != 0) {
				arr += ', ';
			}
			info = JSON.stringify(records[i].info);
			arr += '{"record" : ' + records[i].record + ', "info" : ' + info + '}';
		}
		arr += ']';
		return arr;
	};

	this.setAsJSON = function (json) {
		records.length = 0;

		var json = JSON.parse(json);

		for (var i in json) {
			records.push(json[i]);
		}

	};

};