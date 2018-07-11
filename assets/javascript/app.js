
//Initial Variables
var trainname = "";
var destination = "";
var firstT = "";
var frequency = "";
var newTrain;
var tName;
var tDest;
var firstTrain;
var freq;


//1. INITIALIZE FIREBASE

var config = {
    apiKey: "AIzaSyAexbkgA0Tf9NgX50RPU8Y8oPJmM3aLGUs",
    authDomain: "testproject-9da20.firebaseapp.com",
    databaseURL: "https://testproject-9da20.firebaseio.com",
    projectId: "testproject-9da20",
    storageBucket: "testproject-9da20.appspot.com",
    messagingSenderId: "308424515289"
};


firebase.initializeApp(config);
var database = firebase.database();

//Authentification using Google account
var provider = new firebase.auth.GoogleAuthProvider();

provider.addScope('profile');
provider.addScope('email');

//Sign in using a pop-up
$(document).on('click', '.signIn', function () {
    firebase.auth().signInWithPopup(provider).then(function (result) {
        // For Google Access Token. 
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        $('.content').show();
        loggedIn();

    });

    $(this).removeClass('signIn')
        .addClass('signOut')
        .html('Sign Out');
});

$(document).on('click', '.signOut', function () {
    firebase.auth().signOut().then(function () {
        $('.content').hide();
    })


    $(this).removeClass('signOut')
        .addClass('signIn')
        .html('Sign in with your Google account to begin');
});

//DISPLAY CURRENT TIME

function displayRealTime() {
    setInterval(function () {
        $('#current-time').html(moment().format('hh:mm:ss A'));
    }, 1000);
}


displayRealTime();



function loggedIn() {



    //------------------------------------------------------------------------------------------------------------------------------------


    //2.TAKE IN USER INPUT ON SUBMIT

    $("#submit").on("click", function (event) {
        event.preventDefault();

        var trainname = $("#name").val().trim();
        var destination = $("#destination").val().trim();
        var firstT = $("#firsttrain").val().trim();
        var frequency = $("#frequency").val().trim();

        //Ask for input if left blank
        if (trainname == "") {
            alert("Please enter a train name");
            return false;
        };
        if (destination == "") {
            alert("Please enter a destination");
            return false;
        };
        if (firstT == "") {
            alert("Please enter the first train time");
            return false;
        };
        if (frequency == "") {
            alert("Please enter a frequency");
            return false;
        };


        //create object for holding train data
        var newTrain = {

            tName: trainname,
            tDest: destination,
            firstTrain: firstT,
            freq: frequency
        };

        //push new train data to firebase
        database.ref().push(newTrain);



        //clear all input boxes
        $("#name").val("");
        $("#destination").val("");
        $("#firsttrain").val("");
        $("#frequency").val("");


    });

}








//------------------------------------------------------------------------------------------------------------------

//3. Create Firebase event for adding train information to the database and a row in the html when a user adds an entry
database.ref().on("child_added", function (childSnapshot) {
    console.log(childSnapshot.val());
    console.log("ID is " + childSnapshot.key);

    //store data from firebase to a variable
    var trainname = childSnapshot.val().tName;
    var destination = childSnapshot.val().tDest;
    var firstT = childSnapshot.val().firstTrain;
    var frequency = childSnapshot.val().freq;
    var trainKey = childSnapshot.key;



    //Calculations for next train arrival and minutes away

    //First train time
    var firsttrainMoment = moment(firstT, "hh:mm a").subtract(1, "years");
    console.log("First train: " + moment(firsttrainMoment).format("HH:mm"));

    // var traintime = moment(firsttrainMoment).format("HH:mm");

    //Current time
    var currentTime = moment();
    console.log("current time is: " + moment(currentTime).format("HH:mm"));

    //Difference between times
    var difftime = moment().diff(moment(firsttrainMoment), "minutes");
    console.log("difference in time: " + difftime);

    //Time apart
    var tRemainder = difftime % frequency;
    console.log("minutes difference: " + tRemainder);


    //Minutes until next train
    var minutesAway = frequency - tRemainder;
    console.log("Minutes away: " + minutesAway);

    

    //Next Train
    var addToArrival = currentTime.add(minutesAway, "minutes");
    var newTime = addToArrival.format("hh:mm a");





    //Making changes to HTML

    // Create the new row

    var newRow = $("<tr>").append(
        $("<td>").text(trainname),
        $("<td>").text(destination),
        $("<td>").text(frequency),
        $("<td>").text(newTime),
        $("<td>").text(minutesAway),
        $("<td>").html("<i class='fas fa-backspace delete' data-ID = " + trainKey  +  " id = " + trainKey+  "></i>"),

    );


    // Append the new row to the table
    $("#trainSchedule > tbody").append(newRow);

    //Delete Row
    $("#" + trainKey).on("click", function (event) {
        // event.preventDefault();

        var confirmmessage = confirm("Are you sure you want to delete this entire row?");
        var key = $(this).attr("data-ID");
        // console.log(key);
        

        if (confirmmessage) {
            $(this).closest("tr").remove();
            database.ref().child(key).remove();
            // return;
            
            
        }
        else {
            return;
        }



    })



}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
})





