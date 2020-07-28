$(document).ready(function() {
	var alert = document.getElementById('alert');
	alert.setAttribute("id", "alert-show");
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
})


function submit() {
	handleClientLoad();
	localStorage.setItem('logged', 'yes');
  	localStorage.setItem('register-complete', 'no');
}

function makeApiCall() {
      var params = {
        // The spreadsheet to request.
        spreadsheetId: '1U40JEWyRSRuplnIxIRDRMAw-Q1AgCjG0zLF55me0t_w',  // TODO: Update placeholder value.

        // The ranges to retrieve from the spreadsheet.
        ranges: ['A2:D'],  // TODO: Update placeholder value.

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
        var numRows = parseInt(localStorage.getItem('numRows'));
        var fname = document.getElementById("fname").value;
        var lname = document.getElementById("lname").value;
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var values = [[fname, lname, email, password]];
        var body = {values: values};
        var sameEmail = false;
        for(var row = 0; row < numRows; row++) {
        	for(var col = 0; col < 4; col++) {
        		console.log(result.sheets[0].data[0].rowData[row].values[col].effectiveValue.stringValue);
        	}
        }
        for(var row = 0; row < numRows; row++) {
        	var sheetEmail = result.sheets[0].data[0].rowData[row].values[2].effectiveValue.stringValue;
        	if(sheetEmail == email) {
        		sameEmail = true;
        		break;
        	}
        }
        if(sameEmail) {
        	alert("This email is already registered with an account.");
        } else {
        	updateAcc();
        	updateAcc().then(changePage);
        	function updateAcc() {
        		return new Promise(function(resolve) {
        			setTimeout(function() {
            			gapi.client.sheets.spreadsheets.values.update({
   							spreadsheetId: '1U40JEWyRSRuplnIxIRDRMAw-Q1AgCjG0zLF55me0t_w',
   							range: ['A'+(numRows+2)+':D'+(numRows+2)],
   							valueInputOption: "RAW",
   							resource: body
						}).then((response) => {
  							var result = response.result;
  							console.log(`${result.updatedCells} cells updated.`);
						});
        				localStorage.setItem('accRow', (numRows+2));
            			resolve();
        			}, 500)
    			});
        	}
        	function changePage() {
        		location.replace("myaccount");
        	}
        }
      }, function(reason) {
        console.error('error: ' + reason.result.error.message);
      });
    }

    function initClient() {
      var API_KEY = 'AIzaSyA1fFau5KZTwjchpqNhvuq4FhRQ-V6QNA0';  // TODO: Update placeholder with desired API key.

      var CLIENT_ID = '15098280011-taegk4jia8jcmuv06m2es7ak4qkl77cp';  // TODO: Update placeholder with desired client ID.

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