$(document).ready(function() {
	var isLoggedIn = false;
	if(localStorage.getItem('logged') == 'yes') {
		isLoggedIn = true;
		if(document.getElementById('hidden') != null) {
      document.getElementById('hidden').id = 'accshow';
    }
    document.getElementById('loginnav').id = 'hidden';
    console.log("logged in");
    console.log(localStorage.getItem('accRow'));
  } else {
    if(document.getElementById('hidden') != null) {
      document.getElementById('hidden').id = 'loginnav';
    }
    document.getElementById('accshow').id = 'hidden';
    console.log("logged out");
  }

  if(localStorage.getItem('register-complete') == 'no') {
    console.log("finish the registration");
    document.getElementById('complete-reg-hide').id = 'complete-reg-show';
    document.getElementById('acc-complete-border-hide').id = 'acc-complete-border-show';
  } else {
    console.log("registration complete");
    if(document.getElementById('acc-info-hide') != null) {
      document.getElementById('acc-info-hide').id = 'acc-info-show';
    }
    var branches = localStorage.getItem('branches').toString();
    var branchIds = [];
    var branchNum = 0;
    if(branches.includes("parli")) {
      branchNum++;
      branchIds.push(SPREADSHEETID);
    }
    if(branches.includes("policy")) {
      branchNum++;
      branchIds.push(SPREADSHEETID);
    }
    if(branches.includes("public-forum")) {
      branchNum++;
      branchIds.push(SPREADSHEETID);
    }
    if(branches.includes("speech")) {
      branchNum++;
      branchIds.push(SPREADSHEETID);
    }
    localStorage.setItem('branch-ids', JSON.stringify(branchIds));
    localStorage.setItem('branch-num', branchNum);
    gapi.load('client:auth2', initClientBranch);
  }

  document.getElementById("logoutbutton").addEventListener("click", logout);
});

function updateRegistration() {
  var params = {
    // The spreadsheet to request.
    spreadsheetId: SPREADSHEETID,  // TODO: Update placeholder value.

    // The ranges to retrieve from the spreadsheet.
    ranges: [range],  // TODO: Update placeholder value.

    // True if grid data should be returned.
    // This parameter is ignored if a field mask was set in the request.
    includeGridData: true,  // TODO: Update placeholder value.
  };

  var request = gapi.client.sheets.spreadsheets.get(params);
  request.then(function(response) {
    var accRow = parseInt(localStorage.getItem('accRow'));
    var phone = document.getElementById("phone").value;
    var judgeName = document.getElementById("judge-name").value;
    var judgeEmail = document.getElementById("judge-email").value;
    var judgePhone = document.getElementById("judge-phone").value;
    var branches = "";
    if(document.getElementById("parli-check").checked) {
      branches += " parli";
    }
    if(document.getElementById("policy-check").checked) {
      branches += " policy";
    }
    if(document.getElementById("pf-check").checked) {
      branches += " public-forum";
    }
    if(document.getElementById("speech-check").checked) {
      branches += " speech";
    }
    branches = branches.substring(1);
    var values = [[phone, judgeName, judgeEmail, judgePhone, branches]];
    var body = {values: values};
    localStorage.setItem('branches', branches);

    gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEETID,
      range: [range],
      valueInputOption: "RAW",
      resource: body
    }).then((response) => {
      var result = response.result;
    });
  }, function(reason) {
    console.error('error: ' + reason.result.error.message);
  });
}


function initClient() {
  var API_KEY = APIKEY;  // TODO: Update placeholder with desired API key.

  var CLIENT_ID = CLIENTID;  // TODO: Update placeholder with desired client ID.

  var SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

  gapi.client.init({
    'apiKey': API_KEY,
    'clientId': CLIENT_ID,
    'scope': SCOPE,
    'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  }).then(function() {
    updateRegistration();
  });
}

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
  localStorage.setItem('register-complete', 'yes');
  document.getElementById('complete-reg-show').id = 'complete-reg-hide';
  document.getElementById('acc-complete-border-show').id = 'acc-complete-border-hide';
}

function logout() {
  localStorage.setItem('logged', 'no');
  localStorage.setItem('accRow', null);
  location.replace("index");
  gapi.auth2.getAuthInstance().signOut();
}

function initClientBranch() {
  var ids = JSON.parse(localStorage.getItem('branch-ids'));

  var branchNum = localStorage.getItem('branch-num');

  var API_KEY = APIKEY;  // TODO: Update placeholder with desired API key.

  var CLIENT_ID = CLIENTID';  // TODO: Update placeholder with desired client ID.

  var SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

  gapi.client.init({
    'apiKey': API_KEY,
    'clientId': CLIENT_ID,
    'scope': SCOPE,
    'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  }).then(function() {
    showBranch(ids, branchNum);

  });
}

function showBranch(ids, branchNum) {
  var params = {
    // The spreadsheet to request.
    spreadsheetId: SPREADSHEETID,  // TODO: Update placeholder value.

    // The ranges to retrieve from the spreadsheet.
    ranges: [range],  // TODO: Update placeholder value.

    // True if grid data should be returned.
    // This parameter is ignored if a field mask was set in the request.
    includeGridData: true,  // TODO: Update placeholder value.
  };
  var request = gapi.client.sheets.spreadsheets.get(params);
  request.then(function(response) {
    var result = response.result;
    var accRow = parseInt(localStorage.getItem('accRow')) - 1;
    var email = result.sheets[0].data[0].rowData[accRow].values[2].effectiveValue.stringValue;
    var info = [];
    for(var infoCol = 0; infoCol < 9; infoCol++) {
    	info.push(result.sheets[0].data[0].rowData[accRow].values[infoCol].effectiveValue.stringValue);
    }

    const getSheets = (ids) => {
  		return Promise.all(
    		ids.map(id => {
      			const branchParams = {
        			spreadsheetId: id,
        			ranges: ['A3:L'],
        			includeGridData: true,
      			}
      			return gapi.client.sheets.spreadsheets.get(branchParams)
    		})
  		)
	}

	const doStuffWithSheets = async () => {
  		const sheetResponses = await getSheets(ids);
  		sheetResponses.forEach(response => {
  			var id = response.result.spreadsheetId;
    		var result = response.result;
	        var tempRow = 0;
	        var completedTournaments = [];
	        var openTournaments = [];
	        while(result.sheets[0].data[0].rowData[tempRow].values[11].effectiveValue != null) {
	        	if(result.sheets[0].data[0].rowData[tempRow].values[11].effectiveValue.stringValue.includes("Completed")) {
	        		completedTournaments.push((result.sheets[0].data[0].rowData[tempRow].values[11].effectiveValue.stringValue+"!A3:K").toString());
	        	} else {
	        		openTournaments.push((result.sheets[0].data[0].rowData[tempRow].values[11].effectiveValue.stringValue+"!A3:K").toString());
	        	}
	        	tempRow++;
	        }
	        var header = document.createElement("h3");
	        header.innerHTML = result.properties.title;
	        header.classList.add("mini-header");
	        document.getElementById('acc-info-show').innerHTML += header.outerHTML;


	        var openParams = {
	        	spreadsheetId: id,
	        	ranges: openTournaments,
	        	includeGridData: true,
	      	};
	      	var rangeLength = openTournaments.length;
	      	var request = gapi.client.sheets.spreadsheets.get(openParams);
	      	request.then(function(response) {
	      		//for each open sheet
	      		var result = response.result;
	      		for(var j = 0; j < rangeLength; j++) {
	      			var alreadyRegistered = false;
	      		
	      			for(var row = 0; row < 20; row++) {
	        			if(result.sheets[j].data[0].rowData[row].values[0].effectiveValue === undefined) {
	        				localStorage.setItem('numRows', row);
	        				break;
	        			}
	        		}
	        		var numRows = parseInt(localStorage.getItem('numRows'));

	        		//for each row in the sheet
	        		for(var row = 0; row < numRows; row++) {
	        			if(result.sheets[j].data[0].rowData[row].values[1].effectiveValue.stringValue == email) {
	        				alreadyRegistered = true;
	        				break;
	        			}
	        		}

	        		if(!alreadyRegistered) {
	        			console.log(response.result.sheets[j].properties.title + " is open for registration.");
	        		}
	        	}

	      	}, function(reason) {
	        	console.error('error: ' + reason.result.error.message);
	      	});


	      	var completedParams = {
	        	spreadsheetId: id,
	        	ranges: completedTournaments,
	        	includeGridData: true,
	      	};
	      	var request = gapi.client.sheets.spreadsheets.get(completedParams);
	      	request.then(function(response) {

	      	}, function(reason) {
	        	console.error('error: ' + reason.result.error.message);
	      	});
  		})
	}
	doStuffWithSheets();
})
}
