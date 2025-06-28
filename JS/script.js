
/*============================
          FIREBASE
==============================*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, where} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";




// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBtu1FMCQAdzhZfdlNOh-jbWm6QSHVgGQg",
  authDomain: "drivingschool-e23dd.firebaseapp.com",
  projectId: "drivingschool-e23dd",
  storageBucket: "drivingschool-e23dd.appspot.com", // FIXED typo from ".firebasestorage.app"
  messagingSenderId: "132911193392",
  appId: "1:132911193392:web:fd0835b474fcbeb789fcf5",
  measurementId: "G-G6KL1LJW2W"
};

// Firebase Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {

  /*============================
            login.html
  ==============================*/

const wasLoggedOut = sessionStorage.getItem("loggedOut");

if(wasLoggedOut){
alert("You've been loggged out successfully");
sessionStorage.removeItem("loggedOut"); //clean up
}

  const loginForm = document.querySelector("form#loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const spinner = document.getElementById("spinner");
      if (spinner) spinner.classList.remove("d-none");

      const email = document.getElementById("exampleInputEmail").value.trim();
      const password = document.getElementById("exampleInputPassword").value;

      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        alert(`Login failed: ${error.message}`);
        console.error("Login error:", error);
      } finally {
        if (spinner) spinner.classList.add("d-none");
      }
    });

    onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = "clients.html";
      }
    });
  }

  /*============================
          register.html
  ==============================*/
  const registerForm = document.getElementById("registerForm");

if (registerForm) {




  // Validation functions
  function validateFirstName() {
    const name = document.getElementById("firstName");
    const nameError = document.getElementById('firstNameError');
    const checkmarkIcon = document.querySelector("#firstNameGroup .checkmark-icon");

    if (name.value.trim().length < 2) {
      nameError.textContent = "Name must be at least 2 characters.";
      checkmarkIcon.classList.remove("visible");
      return false;
    } else {
      nameError.textContent = "";
      checkmarkIcon.classList.add("visible");
      return true;
    }
  }

  function validateLastName() {
    const lastName = document.getElementById('lastName');
    const lastError = document.getElementById('lastNameError');
    const lastNameCheck = document.getElementById("lastNameCheck");

    if (lastName.value.trim().length < 2) {
      lastError.textContent = "Last Name must be at least 2 characters.";
      lastNameCheck.classList.remove("visible");
      return false;
    } else {
      lastError.textContent = "";
      lastNameCheck.classList.add("visible");
      return true;
    }
  }

  function validateEmail() {
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const emailCheck = document.getElementById("emailCheck");

    if (!email.validity.valid) {
      emailError.textContent = "Enter a valid email address.";
      emailCheck.classList.remove("visible");
      return false;
    } else {
      emailError.textContent = "";
      emailCheck.classList.add("visible");
      return true;
    }
  }

  function validatePhone() {
    const phone = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const phoneCheck = document.getElementById("phoneCheck");
    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phone.value)) {
      phoneError.textContent = "Phone must be 10 digits.";
      phoneCheck.classList.remove("visible");
      return false;
    } else {
      phoneError.textContent = "";
      phoneCheck.classList.add("visible");
      return true;
    }
  }

  // Attach blur event listeners
  document.getElementById("firstName").addEventListener("blur", validateFirstName);
  document.getElementById("lastName").addEventListener("blur", validateLastName);
  document.getElementById("email").addEventListener("blur", validateEmail);
  document.getElementById("phone").addEventListener("blur", validatePhone);

  
  function showFormErrorBanner(){
    const banner = document.getElementById("formErrorBanner");


    banner.style.display = "block";
    banner.scrollIntoView({behavior: "smooth"});

    setTimeout(() =>{
      banner.style.display = "none";
    }, 5000);
  }
  

// Check if user already exists
async function checkIfUserExists(email, phone) {
  const usersRef = collection(db, "clients");

  try {
    // Check if online before querying
    if (!navigator.onLine) {
      alert("You're offline. Cannot verify user details.");
      return true; // Block registration as a safety fallback
    }

    // Query by email
    const emailQuery = query(usersRef, where("email", "==", email));
    const emailSnap = await getDocs(emailQuery);

    if (!emailSnap.empty) {
      alert("User already registered with that email.");
      return true;
    }

    // Check again if internet is still online before second query
    if (!navigator.onLine) {
      alert("You're offline. Could not complete verification.");
      return true;
    }

    // Query by phone
    const phoneQuery = query(usersRef, where("phone", "==", phone));
    const phoneSnap = await getDocs(phoneQuery);

    if (!phoneSnap.empty) {
      alert("User already registered with that phone number.");
      return true;
    }

    // No existing user found
    return false;

  } catch (error) {
    console.error("Error checking if user exists:", error.code, error.message);

    if (!navigator.onLine || error.code === 'unavailable') {
      alert("Network issue. Please check your internet connection.");
    } else {
      alert("An error occurred while checking registration. Please try again.");
    }

    return true; // Block registration to avoid duplicates
  }
}

const submitBtn = document.getElementById("submitBtn");

 
 // Firebase submission function
async function submitToFirebase() {
  const firstname = document.getElementById("firstName").value.trim();
  const lastname = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const spinner = document.getElementById("spinner");

  if (!navigator.onLine) {
    alert("You are offline. Please check your connection before submitting.");
    if (submitBtn) submitBtn.disabled = false;
    if (spinner) spinner.classList.add("d-none");
    return;
  }

  try {
    if (spinner) spinner.classList.remove("d-none");

    const userExists = await checkIfUserExists(email, phone);
    
    // If the check failed due to network issues, treat as block
    if (userExists) {
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.classList.add("d-none");
      return;
    }

    // Double-check internet before final submission
    if (!navigator.onLine) {
      alert("Internet connection lost. Please reconnect and try again.");
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.classList.add("d-none");
      return;
    }

    await addDoc(collection(db, "clients"), {
      firstname,
      lastname,
      email,
      phone,
      datetime: serverTimestamp()
    });

    alert("Thank you for registering!");
    registerForm.reset();  // Ensure your form has id="registerForm"
    if (spinner) spinner.classList.add("d-none");
    window.location.href = "index.html";

  } catch (error) {
    console.error("Error submitting form: ", error);

    if (!navigator.onLine) {
      alert("You're offline. Please try again when you reconnect.");
    } else {
      alert("Registration failed. Please try again.");
    }

    if (submitBtn) submitBtn.disabled = false;
    if (spinner) spinner.classList.add("d-none");
  }
}


  //Action when submit button is pressed
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();


    if (submitBtn) submitBtn.disabled = true; // 🔒 Disable button right away

    const valid =
      validateFirstName() &&
      validateLastName() &&
      validateEmail() &&
      validatePhone();
  

      //If everything validated submit data to firestore DB
    if (valid) {
      submitToFirebase();
    } else {

      //Banner display if user still hasnt fixed issues
  showFormErrorBanner()

  if(submitBtn){
 submitBtn.disabled = false; // 🔓 Re-enable if validation failed
  } 
    }
  });

}

/*============================
      clients.html
==============================*/
if (window.location.pathname.includes("clients.html")) {
  

  window.addEventListener("pageshow", (event) => {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
      location.reload(); // Force reload when returning via back/forward
    }
  });
  

  const rowsPerPage = 8;
  let clientsData = [];
  let currentPage = 1;
   let isLoggingOut = false;

  //If user isnt loged in dont display table data
onAuthStateChanged(auth,(user) =>{


if(user){
loadClients();
}else{

  if(!isLoggingOut){
    alert("Please Login to view this page.");
  }

  window.location.href = "login.html";
}

});


//Log out the user
document.getElementById("logoutBtn").addEventListener("click", () => {

  isLoggingOut = true;

  signOut(auth)
    .then(() => {
      sessionStorage.setItem("loggedOut", "true"); //set flag
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Failed to logout: " + error.message);
    });
});

//Load Database clients to view recent added outside of webpage refresh the page
  async function loadClients() {
    const querySnapshot = await getDocs(collection(db, "clients"));
    clientsData = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.datetime?.toDate?.().toLocaleString?.() || "";
      clientsData.push({
        firstname: data.firstname || "",
        lastname: data.lastname || "",
        email: data.email || "",
        phone: data.phone || "",
        date: date
      });
    });
//Total Clients Number
    document.getElementById("totalClients").textContent = `Total Sign-ins: ${clientsData.length}`;

    //Load data for the first time 
    renderTable();
    renderPagination();


  }

//search Field
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    let debounceTimeout;
  
    searchInput.addEventListener("input", () => {

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        // console.log("Search Input: ",searchInput.value);
        currentPage = 1;
        renderTable();
        renderPagination();
        
      }, 300); // 300ms debounce
    });
  }
  




  function getFilteredData() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    return clientsData.filter(client =>
      client.firstname.toLowerCase().includes(searchTerm) ||
      client.lastname.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.phone.toLowerCase().includes(searchTerm)
    );
  }

//Format phone number function 


function formatPhoneNumber(phone) {
  if (!phone || phone.length !== 10) return phone;
  return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
}
  function renderTable() {
    const tableBody = document.getElementById("clientTableBody");
    tableBody.innerHTML = "";

    const filtered = getFilteredData();
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const rowsToShow = filtered.slice(startIndex, endIndex);

    if (rowsToShow.length === 0) {
      const searchTerm = document.getElementById("searchInput").value.trim();
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">
            No results found for "<strong>${searchTerm}</strong>"
          </td>
        </tr>`;
      return;
    }

    rowsToShow.forEach(data => {


const formattedPhone = formatPhoneNumber(data.phone);


      const row = `
        <tr>
          <td>${data.firstname}</td>
          <td>${data.lastname}</td>
          <td>${data.email}</td>
          <td>${formattedPhone}</td>
          <td>${new Date(data.date).toLocaleDateString()}</td>
          <td><i class="bi bi-trash"></i></td>
        </tr>`;
      tableBody.innerHTML += row;
    });
  }

  function renderPagination() {
    const pagination = document.getElementById("paginationControls");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(getFilteredData().length / rowsPerPage);
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = `btn btn-sm mx-1 ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}`;
      btn.addEventListener("click", () => {
        currentPage = i;
        renderTable();
        renderPagination();
      });
      pagination.appendChild(btn);
    }
  }



}


});


