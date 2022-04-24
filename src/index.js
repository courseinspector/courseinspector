import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Course from './Course';
import localcoursedata from './assets/coursedata.json';
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "firebase/compat/auth";

var coursedata;
var user;
var authdata;
var authlevel = 0;

const firebaseConfig = {
    apiKey: "AIzaSyB7xPx53G2Q39jxMghxSN2P1vaf0YjukwE",
    authDomain: "courseinspector.firebaseapp.com",
    databaseURL: "https://courseinspector-default-rtdb.firebaseio.com",
    projectId: "courseinspector",
    storageBucket: "courseinspector.appspot.com",
    messagingSenderId: "714692191382",
    appId: "1:714692191382:web:3d52f73c4d534ee5f6ceb7",
    measurementId: "G-NJ5MX0KYYK"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = firebase.auth();
// Add Google as an authentication provider
var provider = new firebase.auth.GoogleAuthProvider();

// Get data from realtime database
const dbRef = firebase.database().ref();
dbRef.get().then((snapshot) => {
    if (snapshot.exists()) {
        authdata = snapshot.val().users;
        coursedata = snapshot.val().courses;
        Initialize();
    } else {
        coursedata = localcoursedata;
        Initialize();
    }
}).catch((error) => {
    coursedata = localcoursedata;
    Initialize();
});

function Initialize() {

    //#region Set Up
    const courseArr = Object.keys(coursedata);

    var courseItems = courseArr.map((name) => <Course course={coursedata[name]} />);

    renderDOM(courseItems);

    const search = document.getElementById('searchbar');
    search.addEventListener('input', filterCourses);

    const buttons = document.getElementsByClassName("tag");

    const signInButton = document.getElementById("signer");
    signInButton.addEventListener('click', signInWithRedirect);

    for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        btn.addEventListener("click", filterCourses);
    }
    //#endregion

    // This is for the search bar to reload results on enter instead of every time a new input is detected.
    /* Uncomment this for the above behavior, and comment out the other event listener
      search.addEventListener('keydown', function (e) {
      if (e.code === "Enter") {
        filterArr(e);
      }
    });
    */
    function filterCourses(e) {
        setTimeout(() => {

            const dict = {
                MAT: "Math",
                BUS: "Business",
                SOC: "History",
                ENG: "English",
                IND: "Trade",
                FAM: "Life Skills",
                AGR: "Agriculture",
                SCI: "Science",
                HPE: "Health/PE",
                ART: "Art",
                FOR: "Foreign Language",
                MUS: "Music"
            };

            courseItems = courseArr;
            var tags = document.getElementsByClassName("tag");
            var truetags = [];

            for (let i = 0; i < tags.length; i++) {
                if (tags[i].classList.contains("tag-true")) {
                    truetags.push(tags[i].id);
                }
            }

            if (!(0 === truetags.length)) { /* If this is not true, all the tags are not true and no filtering action needs to be done */
                courseItems = courseItems.filter((name) => {
                    var isPresent = false;
                    for (let i = 0; i < truetags.length; i++) {
                        const tag = truetags[i];
                        try {
                            if (coursedata[name].tags[0] === dict[tag]) {
                                isPresent = true;
                            }
                        } catch (e) {
                        }
                    }

                    if (isPresent) {
                        return (true);
                    } else {
                        return (false);
                    }
                });
            }

            var key = search.value.toLowerCase();
            key = key.replaceAll(' ', '-');
            courseItems = courseItems.filter(name => (name.search(key) !== -1)).map((name) => {
                return <Course course={coursedata[name]} />;
            });

            renderDOM(courseItems);
        }, 20);
    }

    
    
}

/**
     * 
     * @param {object} courseItems 
     * @param {firebase.User} user 
     */
    function renderDOM(courseItems, userdata = user) {
        ReactDOM.render(
            <React.StrictMode>
                <App user={userdata} classitems={<div class="parent">{courseItems}</div>}></App>
            </React.StrictMode>,
            document.getElementById('root')
        );
    }

firebase.auth()
    .getRedirectResult()
    .then((result) => {
        if (result.credential) {
            /** @type {firebase.auth.OAuthCredential} */
            var credential = result.credential;

            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = credential.accessToken;
            // ...
        }
        // The signed-in user info.
        user = result.user;
        console.log(authdata);
        try {
            Object.keys(authdata).forEach(key => {
                if (user._delegate.email == key.email) {
                    authlevel = key.level;
                    console.log(authlevel);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }).catch((error) => {
        // Handle Errors here.
    });

function signInWithRedirect() {
    let button = document.getElementById("signer");
    if (button.textContent === "Login") {
        firebase.auth().signInWithRedirect(provider);
    } else {
        firebase.auth().signOut().then(() => {
            user = null;
            window.location.reload();
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
            console.log(error);
        });
    }
}