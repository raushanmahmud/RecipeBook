// Initialize Firebase
var config = {
    apiKey: "AIzaSyCRgPCJ4jtKnga97V4RrSrjTHDnX7IRDe4",
    authDomain: "recipebook-d47bf.firebaseapp.com",
    databaseURL: "https://recipebook-d47bf.firebaseio.com",
    projectId: "recipebook-d47bf",
    storageBucket: "recipebook-d47bf.appspot.com",
    messagingSenderId: "350682428096"
};
    firebase.initializeApp(config);

//create firebase database reference
var dbRef = firebase.database();
var recepiesRef = dbRef.ref('recepies');

// Get a reference to the storage service, which is used to create references in the storage bucket
var storage = firebase.storage();
// Create a storage reference from our storage service
var storageRef = storage.ref();
// Create a child reference
var imagesRef = storageRef.child('images');

// imagesRef now points to 'images'

//when a new recepie gets added to firebase database,
//load older recepies as well as any newly added one...
recepiesRef.on("child_added", function(snap) {
  console.log("added", snap.key, snap.val);
  // Generate new pages with recepies
  var htmlPage = recepieHtmlPageFromObject(snap.val());
  // Add dynamic pages to body tag in "index.html"
  var $newPage = $(htmlPage);
  $('body').append($newPage).trigger('create'); // for Android it might be .trigger('updatelayout');

  // generate html for listview
  var html = recepieHtmlFromObject(snap.val());
  // add recepies to listview
  var $someelement = $(html);
  $('#recipelist').append($someelement).trigger('updatelayout');
  $('ul').listview('refresh');

  
});

//save new recepie to the Firebase db
$(document).on('click', '#addRecepie', function () {
 if( $('#recepieName').val() != '' && $('#recepieText').val() != '' && $('#fileUpload').val() != ''){
	var strN = $('#recepieName').val();  
	var strT = $('#recepieText').val();      
	var input = document.getElementById('fileUpload');
	file = input.files[0];
	var currImgRef = imagesRef.child(file.name);
	var uploadTask = currImgRef.put(file);
        
	uploadTask.on('state_changed', function(snapshot){
  
	}, function(error) {
  
	}, function() {
  		var mydownloadURL = uploadTask.snapshot.downloadURL;
		recepiesRef.push({	
		link: strN.replace(/\s/g, '').toLowerCase(),// pageID       
		name: strN, // Recepie Name
       	 	text: strT, // Ingredients and Steps
		img : mydownloadURL // Image of the dish
      		});
	});
	clear();
    } else {
      alert('Please fill in the fields!');
    }
         
});
$(document).on('click', '#cancel', function () {
	clear();
});

//prepare recepie object's HTML
function recepieHtmlFromObject(recepie){
  var html = '';
  html = "<li>"+"<a href="+'"#'+recepie.link+'"'+">"+"<img src="+recepie.img+" style='top:15%; left:1%; ' alt="+'"Gummy bears"'+'/>'+"<h1>"+recepie.name+"</h1>"+"<p>"+recepie.text+"</p>"+"</a>"+"</li>	";
  return html;
}
//add recepie object page 's HTML
function recepieHtmlPageFromObject(recepie){ 
  var htmlPage = '';
  var steps = recepie.text.replace("Ingredients", "<b>Ingredients</b>");
  steps = steps.replace("Steps", "<b>Steps</b>");
  steps = steps.replace(/\n/g, "<br />");
  htmlPage='<div data-iscroll data-role="page" id="'+recepie.link+'">'+ '<header data-role="header" data-position="fixed">'+'<h1>'+recepie.name+'</h1>'+'<a href="#home" data-icon="back" data-iconpos="notext">Back</a>'+'</header>'+'<img src='+recepie.img+'></>'+'<h3 class="ui-bar ui-bar-a ui-corner-all">'+recepie.name+'</h3>'+'<div class="ui-body ui-body-a ui-corner-all">'+'<p>'+steps+'</p>'+'</div>'+'<footer data-role="footer" data-position="fixed">'+'<nav data-role="navbar">'+'<ul>'+'<li><a href="#home" data-icon="home">Home</a></li>'+'<li><a href="#add" data-icon="plus">Add</a></li>'+'<li><a href="#info" data-icon="info">Info</a></li>'+'</ul>'+'</nav>'+'</footer>'+'</div>';
  return htmlPage;
}
// for clearing the form in "#add" page
function clear(){
      $('#recepieName').val('');
      $('#recepieText').val('');
      $('#fileUpload').val('');
      $.mobile.navigate( "#home" );
}
 
