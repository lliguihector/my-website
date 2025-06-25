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
/*============================
      clients.html
==============================*/
if (window.location.pathname.includes("clients.html")) {
  document.addEventListener("DOMContentLoaded", () => {
    // Immediate auth check to prevent back-button access after logout
    const user = auth.currentUser;
    if (!user) {
      window.location.replace("login.html"); // use replace to block back navigation
      return;
    }

    // Still listen for future auth state changes (e.g., token expiration)
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.replace("login.html");
      }
    });

    const rowsPerPage = 8;
    let clientsData = [];
    let currentPage = 1;

    async function loadClients() {
      try {
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

        document.getElementById("totalClients").textContent = `Total Sign-ins: ${clientsData.length}`;
        renderTable();
        renderPagination();

        // Debounced search input (optional, improves performance)
        const searchInput = document.getElementById("searchInput");
        let debounceTimer;
        searchInput.addEventListener("input", () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            currentPage = 1;
            renderTable();
            renderPagination();
          }, 300); // 300ms delay
        });

      } catch (error) {
        console.error("Error loading clients:", error);
        alert("Failed to load client data.");
      }
    }

    document.getElementById("logoutBtn").addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          window.location.replace("login.html");
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
            <td>${data.date}</td>
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

    // Load data
    loadClients();
  });
}





});
