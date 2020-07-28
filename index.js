$(document).ready(function() {

    var delay = 300;

    var isLoggedIn = false;
    if((localStorage.getItem('logged') == 'yes') || localStorage.getItem('logged-email') == 'yes') {
        console.log("logged in email");
    } else {
        $("#homepage-title").css("opacity", "0.8");
        $("#list-builder").delay(delay).fadeIn("fast", () => {
            $("#popup-box").fadeIn("fast", () => {});
        });

        $("#popup-close").click(() => {
            $("#list-builder, #popup-box").hide();
            $("#homepage-title").css("opacity", "1");
        });
    }

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
    localStorage.setItem('logged-email', 'yes');
}

function makeApiCall() {
      var params = {
        // The spreadsheet to request.
        spreadsheetId: '1HS7V5NTbVzc1Ctlk_08_QSU8FfjlB2-JmsFz7TLX--w',  // TODO: Update placeholder value.

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
        		localStorage.setItem('newsletterNumRows', row);
        		break;
        	}
        }
        var numRows = parseInt(localStorage.getItem('newsletterNumRows'));
        var fullname = document.getElementById("fullname").value;
        var email = document.getElementById("email").value;
        var values = [[fullname, email]];
        var body = {values: values};
        var sameEmail = false;

        for(var row = 0; row < numRows; row++) {
            var sheetEmail = result.sheets[0].data[0].rowData[row].values[1].effectiveValue.stringValue;
            if(sheetEmail == email) {
                sameEmail = true;
                break;
            }
        }
        if(sameEmail) {
            alert("This email is already registered with an account.");
        } else if((fullname == null) || (email == null)) {
            alert("One of your inputs are invalid.")
        } else {
            gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: '1HS7V5NTbVzc1Ctlk_08_QSU8FfjlB2-JmsFz7TLX--w',
                range: ['A'+(numRows+2)+':D'+(numRows+2)],
                valueInputOption: "RAW",
                resource: body
            }).then((response) => {
                var result = response.result;
                console.log(`${result.updatedCells} cells updated.`);
                $("#list-builder, #popup-box").hide();
                alert("Subscription Successful!")
            });
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