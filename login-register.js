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
});


function submit() {
	handleClientLoad();
	localStorage.setItem('logged', 'yes');
}

function makeApiCall() {
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
        for(var row = 0; row < 300; row++) {
        	if(result.sheets[0].data[0].rowData[row].values[0].effectiveValue === undefined) {
        		localStorage.setItem('numRows', row);
        		break;
        	}
        }
        var numRows = localStorage.getItem('numRows');
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var accRow = -1;
        console.log(numRows);
        for(var row = 0; row < numRows; row++) {
        	for(var col = 0; col < 4; col++) {
        		console.log(result.sheets[0].data[0].rowData[row].values[col].effectiveValue.stringValue);
        	}
        }
        for(var row = 0; row < numRows; row++) {
        	var sheetEmail = result.sheets[0].data[0].rowData[row].values[2].effectiveValue.stringValue;
        	var sheetPass = result.sheets[0].data[0].rowData[row].values[3].effectiveValue.stringValue;
        	if((sheetEmail == email) && (sheetPass == password)) {
        		accRow = row;
        	}
        }
        if(accRow == -1) {
        	alert("Wrong credentials");
        } else {
        	console.log(accRow);
          	if(result.sheets[0].data[0].rowData[accRow].values[4].effectiveValue === undefined) {
            	localStorage.setItem('register-complete', 'no');
          	}
          	else {
              localStorage.setItem('branches', result.sheets[0].data[0].rowData[accRow].values[8].effectiveValue.stringValue);
            	localStorage.setItem('register-complete', 'yes');
          	}
        	localStorage.setItem('accRow', accRow+2);
          setTimeout(function () {
            location.replace("myaccount");
          }, 1000);
        }
      }, function(reason) {
        console.error('error: ' + reason.result.error.message);
      });
    }

    function initClient() {
      var API_KEY = APIKEY;  // TODO: Update placeholder with desired API key.

      var CLIENT_ID = CLIENTID;  // TODO: Update placeholder with desired client ID.

      // TODO: Authorize using one of the following scopes:
      //   'https://www.googleapis.com/auth/drive'
      //   'https://www.googleapis.com/auth/drive.file'
      //   'https://www.googleapis.com/auth/drive.readonly'
      //   'https://www.googleapis.com/auth/spreadsheets'
      //   'https://www.googleapis.com/auth/spreadsheets.readonly'
      var SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

      gapi.client.init({
        'apiKey': API_KEY,
        'clientId': CLIENT_ID,
        'scope': SCOPE,
        'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      }).then(function() {
      	gapi.auth2.getAuthInstance().signIn();
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
        updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      });
    }

    function handleClientLoad() {
      	gapi.load('client:auth2', initClient);
    }

    function updateSignInStatus(isSignedIn) {
      if (isSignedIn) {
        makeApiCall();
      }
    }
