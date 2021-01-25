/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes FriendlyChat.
function FriendlyChat() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  //this.submitImageButton = document.getElementById('submitImage');
  this.imageForm = document.getElementById('image-form');
  this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Events for image upload.
  /*
  this.submitImageButton.addEventListener('click', function() {
    this.mediaCapture.click();
  }.bind(this));
  */
  //this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));


  this.loginUserBNN =  false;

  this.initFirebase();
}

function createFirebaseUser() {
  firebase.database().ref("users").push().set({
    "username": "chuy99",
    "name": "chuy99",
    "groups": {

    },
    "individualChats": {

    }
  })
}

// function sendPrivateMessage() {
//   var message = document.getElementById("message").value;
//   // firebase.database().ref()
// }

var userId = 1;
var userName = 'Jesus Morales';
var receptor = 0;
var nameReceptor = '';
function createIndividualNewChat(idReceptor, ) {
  // firebase.database().ref("individual").push()
  let idChat = '';
  if (idReceptor > userId) {
    idChat = `${idReceptor}${userId}`
  } else {
    idChat = `${userId}${idReceptor}`

  }


  firebase.database().ref("/individual/" + idChat).once('value').then(snapshot => {
    console.log(snapshot);
      firebase.database().ref("individual/" + idChat).push().set({
        // "sender": userName,
        // "receptor": "Arely Morales",
        // "message": "Hola",
        // "timestamp": Date.now()
      })
  })
}

// function sendPrivateMessage

// Sets up shortcuts to Firebase features and initiate firebase auth.
FriendlyChat.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.

  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('messages3');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 20 messages and listen for new ones.
  var setMessage = function(data) {
    console.log("set ",data);
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
  }.bind(this);
  var deleteMessage = function(data) {
    console.log("Elimino ",data);
    var myobj = document.getElementById(data.key);
    myobj.remove();
  };
  this.messagesRef.limitToLast(20).on('child_added', setMessage);
  //this.messagesRef.limitToLast(20).on('child_changed', setMessage);
  this.messagesRef.on('child_removed', deleteMessage);
};

// Saves a new message on the Firebase DB.
FriendlyChat.prototype.saveMessage = function(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    // Add a new message entry to the Firebase Database.
    console.log(this.userName.textContent);
    this.messagesRef.push({
      name: this.userName.textContent,
      text: this.messageInput.value,
      photoUrl: /*currentUser.photoURL || */'/chat/images/profile_placeholder.png'
    }).then(function() {
      // Clear message text field and SEND button state.
      FriendlyChat.resetMaterialTextfield(this.messageInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

// Sets the URL of the given img element with the URL of the image stored in Firebase Storage.
FriendlyChat.prototype.setImageUrl = function(imageUri, imgElement) {
  imgElement.src = imageUri;

  // If the image is a Firebase Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// userId
// userName
// receptor
// nameReceptor
var chat = '';
const clickUsers = function(ev) {
  // $("#chatName").html(decodeURIComponent(name))
  var param0 = $(ev.currentTarget).attr("data-param0");
  var param1 = $(ev.currentTarget).attr("data-param1");
  receptor = param0;
  nameReceptor = param1;
  $("#individual-messages-list").empty();
  $("#receptorId").html(param1);
  // let chat = '';
  if (userId > receptor) {
    chat = `${userId}${receptor}`;
  } else {
    chat = `${receptor}${userId}`;
  }

  firebase.database().ref("/individual/" + chat).on("child_added", function(snapshot) {
    var html = "";
    html += `<li id='message-${snapshot.key}'>`;
    // if (snapshot.val().sender === myName) {
    //     html += `
    //         <button data-id='${snapshot.key}' onclick='deleteMessage(this);'>
    //           Delete
    //         </button>
    //     `
    // }
      html += snapshot.val().sender + ": " + snapshot.val().message;
    html += "</li>";
  
    document.getElementById("individual-messages-list").innerHTML += html;
  
  });1


  // console.log(param0);
  // console.log(param1);
  // console.log(decodeURIComponent(name))
}

const sendPrivateMessage = function() {
  // e.preventDefault();
  var message = document.getElementById("individual-message").value;
  // console.log('The message is: ', message)
  // let chat = '';
  if (userId > receptor) {
    chat = `${userId}${receptor}`;
  } else {
    chat = `${receptor}${userId}`;
  }
  document.getElementById("individual-message").value = '';


  // firebase.database().ref("/individual/" + chat).once('value').then(snapshot => {
    // console.log(snapshot);
      firebase.database().ref("individual/" + chat).push().set({
        "sender": userName,
        "receptor": nameReceptor,
        "message": message,
        "timestamp": Date.now(),
        "idSender": userId,
        "idReceptor": receptor 
      })
  // })
  // var message = document.getElementById("individual-message").value = '';
  return false;
}

const getUsers = async function() {
  try {
    const users = await axios.get('https://oxxolivedev.stage-pruebas.com/newusers');
    if (!users.data) {
      console.log('No Users');
    } else {
      console.log(users.data)
      const divUser = $("#usersList");
      // let html = '';
      users.data.forEach(user => {
        let html = `<p id="${user.id}-id" data-param0="${user.id}" data-param1="${user.name} ${user.lastname}">${user.name} ${user.lastname}</p>`;
        divUser.append(html);
        $(`#${user.id}-id`).click(clickUsers)
        // html += `<p onclick=createIndividualNewChat("${encodeURIComponent(user.id)}", "${encodeURIComponent(user.name)}")>${user.name} ${user.lastname}</p>`;
        // html += '<p onclick=createIndividualNewChat("' + encodeURIComponent(user.id) + '")>' + user.name + ' ' + user.lastname + '</p>';
        // html += '<p onclick=clickUsers("' + user.name + '")>' + user.name + ' ' + user.lastname + '</p>';
        // html += '<p onclick=clickUsers("'  + user.name + '")>' + user.name + ' ' + user.lastname + '</p>';
      });

    }
  } catch (error) {
    console.error(error);
  }
}

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function(event) {
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();0 

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;
    this.messagesRef.push({
      name: currentUser.displayName,
      imageUrl: FriendlyChat.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/chat/images/profile_placeholder.png'
    }).then(function(data) {

      // Upload the image to Firebase Storage.
      this.storage.ref(currentUser.uid + '/' + Date.now() + '/' + file.name)
          .put(file, {contentType: file.type})
          .then(function(snapshot) {
            // Get the file's Storage URI and update the chat message placeholder.
            var filePath = snapshot.metadata.fullPath;
            data.update({imageUrl: this.storage.ref(filePath).toString()});
          }.bind(this)).catch(function(error) {
        console.error('There was an error uploading a file to Firebase Storage:', error);
      });
    }.bind(this));
  }
};

// Signs-in Friendly Chat.
FriendlyChat.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  //var provider = new firebase.auth.GoogleAuthProvider();
//  this.auth.signInWithPopup(provider);
  this.loginBNN();
};

FriendlyChat.prototype.loginBNN = function(){
  var userName = prompt("¿Cúal es tu nombre?");
  this.loginUserBNN =  true;
  // Set the user's profile pic and name.
  //this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
  this.userName.textContent = userName;

  // Show user's profile and sign-out button.
  this.userName.removeAttribute('hidden');
  this.userPic.removeAttribute('hidden');
  this.signOutButton.removeAttribute('hidden');

  // Hide sign-in button.
  this.signInButton.setAttribute('hidden', 'true');

  // We load currently existing chant messages.
  this.loadMessages();
};


// Signs-out of Friendly Chat.
FriendlyChat.prototype.signOut = function() {
  //signout Firebase
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
FriendlyChat.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.
    this.loadMessages();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.loginUserBNN ) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
FriendlyChat.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
    '<div class="name"></div>' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +

    '</div>';

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {

  console.log("Agrega Mensaje");
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.

    text=this.linksadd(text);
    messageElement.innerHTML = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');




  } else if (imageUri) { // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }.bind(this));
    this.setImageUrl(imageUri, image);
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};

// Enables or disables the submit button depending on the values of the input
// fields.
FriendlyChat.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
        'actually a Firebase bug that occurs rarely. ' +
        'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
        'and make sure the storageBucket attribute is not empty. ' +
        'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
        'displayed there.');
  }
};
FriendlyChat.prototype.linksadd = function(input){
  let text = input;
  const linksFound = text.match( /(?:www|https?)[^\s]+/g );
  const aLink = [];

  if ( linksFound != null ) {

    for ( let i=0; i<linksFound.length; i++ ) {
      let replace = linksFound[i];
      if ( !( linksFound[i].match( /(http(s?)):\/\// ) ) ) { replace = 'http://' + linksFound[i] }
      let linkText = replace.split( '/' )[2];
      if ( linkText.substring( 0, 3 ) == 'www' ) { linkText = linkText.replace( 'www.', '' ) }
      if ( linkText.match( /youtu/ ) ) {

        let youtubeID = replace.split( '/' ).slice(-1)[0];

        youtubeID = youtubeID.replace('watch?v=', '');
        aLink.push( '<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/' + youtubeID + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' )
      }
      else if ( linkText.match( /vimeo/ ) ) {
        let vimeoID = replace.split( '/' ).slice(-1)[0];
        aLink.push( '<div class="video-wrapper"><iframe src="https://player.vimeo.com/video/' + vimeoID + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>' )
      }
      else {
        aLink.push( '<a href="' + replace + '" target="_blank">' + replace + '</a>' );
      }
      text = text.split( linksFound[i] ).map(item => { return aLink[i].includes('iframe') ? item.trim() : item } ).join( aLink[i] );
    }
    return text;

  }
  else {
    return input;
  }
}

window.onload = async function() {
  window.friendlyChat = new FriendlyChat();
  await getUsers();
};
