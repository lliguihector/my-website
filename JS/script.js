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


    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const isFirstNameValid = validateField("firstName", v => v.length > 0, "First name is required.");
      const isLastNameValid = validateField("lastName", v => v.length > 0, "Last name is required.");
      const isEmailValid = validateField("email", v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email address.");
      const isPhoneValid = validateField("phone", v => /^[0-9]{10}$/.test(v), "Phone must be 10 digits.");

      if (isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid) {
        submitToFirebase();


              
      }
    });



function testForm(){
  alert("Form Was Submited");
  console.log("Form Was Submited")
}

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
        alert("Thank you for registering with Driving School!");
        registerForm.reset();
        document.querySelectorAll('.input-group').forEach(group => {
          group.classList.remove('input-valid', 'input-invalid');
        });
      }).catch((error) => {
        console.error("Error submitting form: ", error);
        alert("Submission failed.");
      });
    }


  }

  // Reusable field validation function
  function validateField(id, testFn, errorMessage) {
    const input = document.getElementById(id);
    const value = input.value.trim();
    const group = input.closest(".input-group");
            
 console.log("Input value: ", value); // Debug: Check value being validated
            
    if (!testFn(value)) {
console.log("Validation failed."); // Debug: Check why it's failing       
      group?.classList.remove("input-valid");
      group?.classList.add("input-invalid");
      input.setCustomValidity(errorMessage);
      return false;
    } else {
console.log("Validation succeeded."); // Debug: Check when validation passes      
      group?.classList.remove("input-invalid");
      group?.classList.add("input-valid");
      input.setCustomValidity("");
      return true;
    }
  }

});


/*============================
      clients.html
==============================*/
if (window.location.pathname.includes("clients.html")) {
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

    loadClients();
  });
}
