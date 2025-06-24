/*============================
          FIREBASE
==============================*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";




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
      emailError.textContent = "Enter a valid email.";
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

  // Firebase submission function
  function submitToFirebase() {
    const firstname = document.getElementById("firstName").value.trim();
    const lastname = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    addDoc(collection(db, "clients"), {
      firstname,
      lastname,
      email,
      phone,
      datetime: serverTimestamp()
    }).then(() => {
      alert("Thank you for registering!");
      registerForm.reset();
      document.querySelectorAll('.input-group').forEach(group => {
        group.classList.remove('input-valid', 'input-invalid');
      });
      document.querySelectorAll('.checkmark-icon').forEach(icon => {
        icon.classList.remove('visible');
      });
    }).catch((error) => {
      console.error("Error submitting form: ", error);
      alert("Registration failed.");
    });
  }

  // Submit listener
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const valid =
      validateFirstName() &&
      validateLastName() &&
      validateEmail() &&
      validatePhone();

    if (valid) {
      submitToFirebase();
    }
  });
}

 

});


/*============================
      clients.html
==============================*/
if (window.location.pathname.includes("clients.html")) {

onAuthStateChanged(auth, (user) =>{

if(!user){
//Redirect or show a message 
          window.location.href = "login.html";
return;
}



          
  import("https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js").then(({ getDocs, collection }) => {
    const rowsPerPage = 8;
    let clientsData = [];
    let currentPage = 1;

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
      renderTable();
      renderPagination();


//search Field
      document.getElementById("searchInput").addEventListener("input", () => {
        currentPage = 1;
        renderTable();
        renderPagination();
      });
    }

    document.getElementById("logoutBtn").addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          window.location.href = "login.html";
        })
        .catch((error) => {
          console.error("Logout error:", error);
          alert("Failed to logout: " + error.message);
        });
    });

    function getFilteredData() {
      const searchTerm = document.getElementById("searchInput").value.toLowerCase();
      return clientsData.filter(client =>
        client.firstname.toLowerCase().includes(searchTerm) ||
        client.lastname.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm) ||
        client.phone.toLowerCase().includes(searchTerm)
      );
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
        const row = `
          <tr>
            <td>${data.firstname}</td>
            <td>${data.lastname}</td>
            <td>${data.email}</td>
            <td>${data.phone}</td>
            <td>${new Date(data.date).toLocaleDateString()}</td>
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
//Only load clients if authenticated
    loadClients();
  });
       });     
}
