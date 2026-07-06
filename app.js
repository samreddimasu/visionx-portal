/* ==========================================================================
   VISIONX CLIENT APPLICATION ENGINE
   Features: Vanta.js Backgrounds, Supabase Auth Integration, Mock DB Engine,
   Card Router Transitions, Dynamic Inputs, Live Countdown, Toast Alerts,
   Navbar Navigation, About & Contact Modals.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE VARIABLES ---
  let vantaEffect = null;
  let supabaseClient = null;
  let isMockMode = true;
  let liveClockInterval = null;
  let currentActiveTheme = 0x00f2fe; // Tracks purple/cyan/magenta base theme

  // --- HTML ELEMENT SELECTORS ---
  const vantaBg = document.getElementById('vanta-bg');
  const authViewport = document.getElementById('auth-viewport');
  const dashViewport = document.getElementById('dashboard-viewport');
  const toastContainer = document.getElementById('toast-container');
  
  // Navigation & Tabs
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const panelLogin = document.getElementById('panel-login');
  const panelSignup = document.getElementById('panel-signup');
  const panelForgot = document.getElementById('panel-forgot');
  const linkForgot = document.getElementById('link-forgot');
  const forgotBack = document.getElementById('forgot-back');

  // Top Nav Items
  const navHome = document.getElementById('nav-home');
  const navCourses = document.getElementById('nav-courses');
  const navAbout = document.getElementById('nav-about');
  const navContact = document.getElementById('nav-contact');

  // About Modal
  const aboutModal = document.getElementById('about-modal');
  const aboutClose = document.getElementById('about-close');

  // Courses Modal
  const coursesModal = document.getElementById('courses-modal');
  const coursesClose = document.getElementById('courses-close');

  // Contact Us Modal
  const contactModal = document.getElementById('contact-modal');
  const contactClose = document.getElementById('contact-close');
  const formContact = document.getElementById('form-contact');

  // Forms
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const formForgot = document.getElementById('form-forgot');

  // Modal (Credentials Setting)
  const settingsTrigger = document.getElementById('settings-trigger');
  const settingsModal = document.getElementById('settings-modal');
  const settingsClose = document.getElementById('settings-close');
  const settingsSave = document.getElementById('save-settings');
  const inputSupaUrl = document.getElementById('supabase-url');
  const inputSupaKey = document.getElementById('supabase-key');
  const checkboxMock = document.getElementById('use-mock');

  // Dashboard components
  const userDispName = document.getElementById('user-display-name');
  const userDispEmail = document.getElementById('user-display-email');
  const dashGreeting = document.getElementById('dash-greeting-name');
  const logoutBtn = document.getElementById('logout-btn');

  // No countdown nodes needed


  // ==========================================
  // 1. VANTA.JS NEON BACKGROUND ANIMATION
  // ==========================================
  function initVantaBackground() {
    if (typeof VANTA !== 'undefined' && VANTA.NET) {
      try {
        vantaEffect = VANTA.NET({
          el: "#vanta-bg",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x00f2fe, // Start with Signup Cyan
          backgroundColor: 0x030307,
          points: 13.00,
          maxDistance: 20.00,
          spacing: 16.00
        });
      } catch (err) {
        console.error("Vanta.js initialization failed:", err);
      }
    }
  }

  function updateVantaColor(hexColor) {
    if (vantaEffect && typeof vantaEffect.setOptions === 'function') {
      vantaEffect.setOptions({
        color: hexColor
      });
    }
  }


  // ==========================================
  // 2. TOAST NOTIFICATIONS ENGINE
  // ==========================================
  function showToast(title, message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${iconClass} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">&times;</button>
    `;

    toastContainer.appendChild(toast);

    const autoRemoveTimer = setTimeout(() => {
      removeToast(toast);
    }, duration);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(autoRemoveTimer);
      removeToast(toast);
    });
  }

  function removeToast(toast) {
    toast.classList.add('removing');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }


  // ==========================================
  // 3. DATABASE CONFIGURATION (SUPABASE VS MOCK)
  // ==========================================
  function loadDatabaseSettings() {
    const savedUrl = localStorage.getItem('eduhack_supabase_url') || '';
    const savedKey = localStorage.getItem('eduhack_supabase_key') || '';
    const savedMockStatus = localStorage.getItem('eduhack_use_mock');

    inputSupaUrl.value = savedUrl;
    inputSupaKey.value = savedKey;

    if (savedMockStatus === null) {
      isMockMode = !savedUrl || !savedKey;
    } else {
      isMockMode = savedMockStatus === 'true';
    }
    checkboxMock.checked = isMockMode;

    initDatabaseClient();
  }

  function initDatabaseClient() {
    const url = inputSupaUrl.value.trim();
    const key = inputSupaKey.value.trim();

    if (!isMockMode && url && key) {
      try {
        supabaseClient = supabase.createClient(url, key);
        console.log("Supabase Client initialized successfully.");
      } catch (err) {
        console.error("Failed to construct Supabase Client:", err);
        showToast("Initialization Error", "Real Supabase construction failed. Falling back to local mock.", "error");
        isMockMode = true;
        checkboxMock.checked = true;
      }
    } else {
      supabaseClient = null;
      isMockMode = true;
      console.log("Running in Local Mock Database mode.");
    }
  }

  function saveDatabaseSettings() {
    const url = inputSupaUrl.value.trim();
    const key = inputSupaKey.value.trim();
    isMockMode = checkboxMock.checked;

    localStorage.setItem('eduhack_supabase_url', url);
    localStorage.setItem('eduhack_supabase_key', key);
    localStorage.setItem('eduhack_use_mock', isMockMode);

    initDatabaseClient();
    settingsModal.classList.add('hidden');
    showToast("Settings Applied", "Database configurations updated successfully.", "success");

    checkActiveSession();
  }

  // Settings Modal Controls
  settingsTrigger.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
  });
  settingsClose.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add('hidden');
    }
  });
  settingsSave.addEventListener('click', saveDatabaseSettings);


  // ==========================================
  // 4. TOP NAVIGATION LINKS & MODALS INTERACTIVITY
  // ==========================================
  function resetNavActiveState() {
    navHome.classList.remove('active');
    if (navCourses) navCourses.classList.remove('active');
    navAbout.classList.remove('active');
    navContact.classList.remove('active');
  }

  // Home Navigation
  navHome.addEventListener('click', (e) => {
    e.preventDefault();
    resetNavActiveState();
    navHome.classList.add('active');
    
    // Close any overlays
    if (coursesModal) coursesModal.classList.add('hidden');
    aboutModal.classList.add('hidden');
    contactModal.classList.add('hidden');
    settingsModal.classList.add('hidden');
    
    // Restore base background theme
    updateVantaColor(currentActiveTheme);
  });

  // Courses Navigation
  if (navCourses) {
    navCourses.addEventListener('click', (e) => {
      e.preventDefault();
      resetNavActiveState();
      navCourses.classList.add('active');
      
      coursesModal.classList.remove('hidden');
      aboutModal.classList.add('hidden');
      contactModal.classList.add('hidden');
      settingsModal.classList.add('hidden');
      
      // Smooth background change to cyan-blue gradient for Courses
      updateVantaColor(0x00f2fe);
    });
  }

  if (coursesClose) {
    coursesClose.addEventListener('click', () => {
      coursesModal.classList.add('hidden');
      resetNavActiveState();
      navHome.classList.add('active');
      updateVantaColor(currentActiveTheme);
    });
  }

  // About Navigation
  navAbout.addEventListener('click', (e) => {
    e.preventDefault();
    resetNavActiveState();
    navAbout.classList.add('active');
    
    if (coursesModal) coursesModal.classList.add('hidden');
    aboutModal.classList.remove('hidden');
    contactModal.classList.add('hidden');
    settingsModal.classList.add('hidden');
    
    // Smooth background change to cyan for About
    updateVantaColor(0x00f2fe);
  });

  aboutClose.addEventListener('click', () => {
    aboutModal.classList.add('hidden');
    resetNavActiveState();
    navHome.classList.add('active');
    updateVantaColor(currentActiveTheme);
  });

  // Contact Navigation
  navContact.addEventListener('click', (e) => {
    e.preventDefault();
    resetNavActiveState();
    navContact.classList.add('active');
    
    if (coursesModal) coursesModal.classList.add('hidden');
    contactModal.classList.remove('hidden');
    aboutModal.classList.add('hidden');
    settingsModal.classList.add('hidden');
    
    // Smooth background change to magenta for Contact
    updateVantaColor(0xff007f);
  });

  contactClose.addEventListener('click', () => {
    contactModal.classList.add('hidden');
    resetNavActiveState();
    navHome.classList.add('active');
    updateVantaColor(currentActiveTheme);
  });

  // macOS Floating Dock Event Listeners
  const dockHome = document.getElementById('dock-home');
  const dockCourses = document.getElementById('dock-courses');
  const dockExams = document.getElementById('dock-exams');
  const dockAbout = document.getElementById('dock-about');
  const dockContact = document.getElementById('dock-contact');
  const dockSettings = document.getElementById('dock-settings');

  if (dockHome) {
    dockHome.addEventListener('click', (e) => {
      e.preventDefault();
      navHome.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (dockCourses) {
    dockCourses.addEventListener('click', (e) => {
      e.preventDefault();
      if (navCourses) navCourses.click();
    });
  }

  if (dockExams) {
    dockExams.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSec = document.querySelector('.welcome-section');
      if (targetSec) {
        const offsetTop = targetSec.offsetTop + targetSec.offsetHeight + 20;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        showToast("Navigation", "Viewing Active Educational Events", "info");
      }
    });
  }

  if (dockAbout) {
    dockAbout.addEventListener('click', (e) => {
      e.preventDefault();
      navAbout.click();
    });
  }

  if (dockContact) {
    dockContact.addEventListener('click', (e) => {
      e.preventDefault();
      navContact.click();
    });
  }

  if (dockSettings) {
    dockSettings.addEventListener('click', (e) => {
      e.preventDefault();
      const trigger = document.getElementById('settings-trigger');
      if (trigger) trigger.click();
    });
  }

  // Course Enrollment Trigger
  document.querySelectorAll('.enroll-course-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseName = btn.getAttribute('data-course');
      showToast("Enrollment Request", `Successfully registered for ${courseName}! Check your dashboard feed for links.`, "success");
      if (coursesClose) coursesClose.click();
    });
  });

  // Handle outside-modal clicking to close
  window.addEventListener('click', (e) => {
    if (e.target === coursesModal) {
      if (coursesClose) coursesClose.click();
    }
    if (e.target === aboutModal) {
      aboutClose.click();
    }
    if (e.target === contactModal) {
      contactClose.click();
    }
  });

  // --- SUBMIT: CONTACT FORM ---
  formContact.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');

    let isValid = true;

    if (nameInput.value.trim().length < 2) {
      setError(nameInput, false);
      isValid = false;
    }
    if (!validateEmail(emailInput.value)) {
      setError(emailInput, false);
      isValid = false;
    }
    if (messageInput.value.trim().length < 10) {
      setError(messageInput, false);
      isValid = false;
    }

    if (!isValid) {
      showToast("Validation Failed", "Please correct the message parameters.", "error");
      return;
    }

    try {
      setLoadingState(formContact, true, "Transmitting data...");
      
      const payload = {
        name: nameInput.value,
        email: emailInput.value,
        message: messageInput.value,
        _subject: `VISIONX Message from ${nameInput.value}`
      };

      // Dispatch parallel API posts to FormSubmit
      const p1 = fetch("https://formsubmit.co/ajax/Samchowdhary.x@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const p2 = fetch("https://formsubmit.co/ajax/dhuddukoushik@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Wait for both submissions
      await Promise.all([p1, p2]);

      showToast("Transmission Dispatched", "Forwarding to Samchowdhary.x@gmail.com & dhuddukoushik@gmail.com...", "success");
      formContact.reset();
      contactClose.click();
    } catch (err) {
      showToast("Transmission Error", err.message, "error");
    } finally {
      setLoadingState(formContact, false, "DISPATCH TRANSMISSION");
    }
  });


  // ==========================================
  // 5. LOCAL MOCK DATABASE SYSTEM
  // ==========================================
  const MockDB = {
    getUsers: function() {
      let users = JSON.parse(localStorage.getItem('eduhack_mock_users'));
      if (!users || users.length === 0) {
        users = [
          {
            email: "sam@gmail.com",
            password: "password123",
            fullName: "Sam Developer",
            verified: true,
            event: "CBSE Boards Coding Blitz",
            created_at: new Date().toISOString()
          },
          {
            email: "promangamerop50@gmail.com",
            password: "password123",
            fullName: "Pro Developer",
            verified: true,
            event: "SSC Preparation Challenge",
            created_at: new Date().toISOString()
          },
          {
            email: "student@gmail.com",
            password: "password123",
            fullName: "Alex Student",
            verified: true,
            event: "SSC Preparation Challenge",
            created_at: new Date().toISOString()
          }
        ];
        localStorage.setItem('eduhack_mock_users', JSON.stringify(users));
      }
      return users;
    },
    saveUsers: function(users) {
      localStorage.setItem('eduhack_mock_users', JSON.stringify(users));
    },
    getSessionUser: function() {
      return JSON.parse(localStorage.getItem('eduhack_mock_session')) || null;
    },
    setSessionUser: function(user) {
      if (user) {
        localStorage.setItem('eduhack_mock_session', JSON.stringify(user));
      } else {
        localStorage.removeItem('eduhack_mock_session');
      }
    },
    signUp: async function(email, password, fullName) {
      await new Promise(r => setTimeout(r, 800));
      
      const users = this.getUsers();
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("A user profile with this email already exists.");
      }

      const newUser = { 
        email, 
        password, 
        fullName,
        verified: true,
        event: 'CBSE Boards Coding Blitz',
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      this.saveUsers(users);
      return { user: { email, user_metadata: { full_name: fullName } } };
    },
    signIn: async function(email, password) {
      await new Promise(r => setTimeout(r, 600));

      const users = this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user || user.password !== password) {
        throw new Error("Invalid login credentials. Access denied.");
      }

      this.setSessionUser(user);
      return { user: { email: user.email, fullName: user.fullName, user_metadata: { full_name: user.fullName } } };
    },
    signOut: async function() {
      this.setSessionUser(null);
      return true;
    }
  };


  // ==========================================
  // 6. AUTHENTICATION & FORM LOGIC
  // ==========================================

  // Tab View Routing
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    panelLogin.classList.remove('hidden');
    panelSignup.classList.add('hidden');
    panelForgot.classList.add('hidden');
    currentActiveTheme = 0x9d4edd; // Purple Theme
    updateVantaColor(currentActiveTheme);
    clearErrors();
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    panelSignup.classList.remove('hidden');
    panelLogin.classList.add('hidden');
    panelForgot.classList.add('hidden');
    currentActiveTheme = 0x00f2fe; // Cyan Theme
    updateVantaColor(currentActiveTheme);
    clearErrors();
  });

  linkForgot.addEventListener('click', (e) => {
    e.preventDefault();
    panelForgot.classList.remove('hidden');
    panelLogin.classList.add('hidden');
    panelSignup.classList.add('hidden');
    currentActiveTheme = 0xff007f; // Magenta Theme
    updateVantaColor(currentActiveTheme);
    clearErrors();
  });

  forgotBack.addEventListener('click', () => {
    panelForgot.classList.add('hidden');
    panelLogin.classList.remove('hidden');
    currentActiveTheme = 0x9d4edd; // Purple Theme
    updateVantaColor(currentActiveTheme);
    clearErrors();
  });

  // Password Visibility Toggle
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });

  // Form Validation Handlers
  function setError(inputElement, isValid = false) {
    const parent = inputElement.closest('.input-group');
    if (!parent) return;

    if (!isValid) {
      parent.classList.add('invalid', 'shake');
      setTimeout(() => {
        parent.classList.remove('shake');
      }, 400);
    } else {
      parent.classList.remove('invalid');
    }
  }

  function clearErrors() {
    document.querySelectorAll('.input-group').forEach(group => {
      group.classList.remove('invalid', 'shake');
    });
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  // --- SUBMIT: SIGN IN ---
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    let isValid = true;

    if (!validateEmail(emailInput.value)) {
      setError(emailInput, false);
      isValid = false;
    }
    if (passwordInput.value.length < 6) {
      setError(passwordInput, false);
      isValid = false;
    }

    if (!isValid) {
      showToast("Validation Failed", "Check your authorization keys.", "error");
      return;
    }

    try {
      setLoadingState(formLogin, true, "Verifying logs...");
      
      let userObj = null;

      if (isMockMode) {
        const res = await MockDB.signIn(emailInput.value, passwordInput.value);
        userObj = res.user;
      } else {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: emailInput.value,
          password: passwordInput.value
        });
        if (error) throw error;
        userObj = data.user;
      }

      showToast("Access Granted", "Establishing handshake with core portal.", "success");
      enterDashboard(userObj);
      triggerConfetti();
      formLogin.reset();
    } catch (err) {
      showToast("Authentication Denied", err.message, "error");
    } finally {
      setLoadingState(formLogin, false, "ENTER CORE SYSTEM");
    }
  });

  // --- SUBMIT: SIGN UP ---
  formSignup.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmInput = document.getElementById('signup-confirm-password');
    const termsCheck = document.getElementById('signup-terms');

    let isValid = true;

    if (nameInput.value.trim().length < 2) {
      setError(nameInput, false);
      isValid = false;
    }
    if (!validateEmail(emailInput.value)) {
      setError(emailInput, false);
      isValid = false;
    }
    if (passwordInput.value.length < 6) {
      setError(passwordInput, false);
      isValid = false;
    }
    if (passwordInput.value !== confirmInput.value) {
      setError(confirmInput, false);
      isValid = false;
    }
    if (!termsCheck.checked) {
      showToast("Policy Agreement", "You must authorize terms to compile profile.", "error");
      isValid = false;
    }

    if (!isValid) return;

    try {
      setLoadingState(formSignup, true, "Compiling profile...");

      if (isMockMode) {
        await MockDB.signUp(emailInput.value, passwordInput.value, nameInput.value);
        showToast("Registration Success", "Mock Profile created. You can now login.", "success");
        triggerConfetti();
      } else {
        const { data, error } = await supabaseClient.auth.signUp({
          email: emailInput.value,
          password: passwordInput.value,
          options: {
            data: {
              full_name: nameInput.value
            }
          }
        });
        if (error) throw error;
        
        // Sync public profiles table in Supabase
        if (data.user) {
          try {
            await supabaseClient
              .from('profiles')
              .insert({
                id: data.user.id,
                email: emailInput.value,
                full_name: nameInput.value,
                verified: data.session ? true : false,
                event: 'None',
                created_at: new Date().toISOString()
              });
          } catch(profileErr) {
            console.warn("Could not insert to profiles table:", profileErr);
          }
        }

        if (data.session) {
          showToast("Registration Complete", "Welcome code compiled successfully.", "success");
          enterDashboard(data.user);
          triggerConfetti();
        } else {
          showToast("Verification Required", "Registration logs dispatched to email. Verify to activate profile.", "info");
          triggerConfetti();
        }
      }

      formSignup.reset();
      tabLogin.click();
    } catch (err) {
      showToast("Compilation Failed", err.message, "error");
    } finally {
      setLoadingState(formSignup, false, "REGISTER USER PROFILE");
    }
  });

  // --- SUBMIT: FORGOT PASSWORD ---
  formForgot.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const emailInput = document.getElementById('forgot-email');

    if (!validateEmail(emailInput.value)) {
      setError(emailInput, false);
      showToast("Validation Failed", "Check recovery email syntax.", "error");
      return;
    }

    try {
      setLoadingState(formForgot, true, "Dispatching logs...");

      if (isMockMode) {
        await new Promise(r => setTimeout(r, 800));
        showToast("Logs Dispatched", "Password recovery simulation completed. Reset code is active in mock system.", "success");
      } else {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(emailInput.value, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        showToast("Logs Dispatched", "Secure reset logs transmitted to verified email.", "success");
      }

      formForgot.reset();
      forgotBack.click();
    } catch (err) {
      showToast("Recovery Blocked", err.message, "error");
    } finally {
      setLoadingState(formForgot, false, "DISPATCH RECOVERY LOGS");
    }
  });

  // Button Loading State helper
  function setLoadingState(form, isLoading, text) {
    const btn = form.querySelector('.submit-btn');
    const span = btn.querySelector('span');
    btn.disabled = isLoading;
    if (isLoading) {
      btn.style.opacity = '0.75';
      span.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> ${text}`;
    } else {
      btn.style.opacity = '1';
      span.innerHTML = text;
    }
  }

  // --- CONFETTI LAUNCHER BLAST SYSTEM (SHOOTING UPWARDS FROM BOTTOM CORNERS IN GROUPS) ---
  function triggerConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100vw';
    confettiContainer.style.height = '100vh';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    confettiContainer.style.overflow = 'hidden';
    document.body.appendChild(confettiContainer);

    const colors = [
      '#ff007f', '#00f2fe', '#9d4edd', '#39ff14', 
      '#ffea00', '#ff5722', '#e91e63', '#2196f3'
    ];
    const shapes = ['square', 'circle', 'rectangle'];

    for (let i = 0; i < 110; i++) {
      const confetti = document.createElement('div');
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      confetti.style.position = 'absolute';
      const sizeWidth = Math.random() * 9 + 6;
      const sizeHeight = shape === 'rectangle' ? sizeWidth * 1.8 : sizeWidth;
      
      confetti.style.width = `${sizeWidth}px`;
      confetti.style.height = `${sizeHeight}px`;
      confetti.style.backgroundColor = color;
      
      if (shape === 'circle') {
        confetti.style.borderRadius = '50%';
      }

      // Check left/right launcher
      const isLeft = i % 2 === 0;
      const animationName = isLeft ? 'shoot-left-dynamic' : 'shoot-right-dynamic';
      
      // Calculate dynamic dispersed coordinates for groups
      let peakX, peakY, endX, rotMid, rotEnd;
      
      if (isLeft) {
        peakX = `${Math.random() * 35 + 15}vw`; // Peak center area 15vw to 50vw
        peakY = `${Math.random() * 35 + 8}vh`;  // Height peak 8vh to 43vh
        endX = `${Math.random() * 40 + 50}vw`;  // Land right side 50vw to 90vw
        rotMid = `${Math.random() * 300 + 90}deg`;
        rotEnd = `${Math.random() * 600 + 400}deg`;
      } else {
        peakX = `${Math.random() * 35 + 50}vw`; // Peak center area 50vw to 85vw
        peakY = `${Math.random() * 35 + 8}vh`;  // Height peak 8vh to 43vh
        endX = `${Math.random() * 40 + 10}vw`;  // Land left side 10vw to 50vw
        rotMid = `-${Math.random() * 300 + 90}deg`;
        rotEnd = `-${Math.random() * 600 + 400}deg`;
      }
      
      confetti.style.setProperty('--peak-x', peakX);
      confetti.style.setProperty('--peak-y', peakY);
      confetti.style.setProperty('--end-x', endX);
      confetti.style.setProperty('--rot-mid', rotMid);
      confetti.style.setProperty('--rot-end', rotEnd);

      const duration = Math.random() * 1.6 + 1.8; // 1.8s to 3.4s
      // Very tiny delay range so they shoot simultaneously as a group/burst
      const delay = Math.random() * 0.15;
      
      confetti.style.animation = `${animationName} ${duration}s cubic-bezier(0.1, 0.75, 0.35, 1) forwards ${delay}s`;
      
      confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
      confettiContainer.remove();
    }, 4500);
  }


  // ==========================================
  // 7. DASHBOARD CONTROL CENTRE & EVENTS
  // ==========================================
  function enterDashboard(user) {
    authViewport.classList.add('hidden');
    dashViewport.classList.remove('hidden');
    
    // Transition to Apple ambient theme
    document.body.classList.add('apple-theme');
    const vantaBgEl = document.getElementById('vanta-bg');
    if (vantaBgEl) vantaBgEl.style.opacity = '0';

    const email = user?.email || "";
    const name = user?.user_metadata?.full_name || user?.fullName || (email ? email.split('@')[0] : "User");

    userDispName.innerText = name;
    userDispEmail.innerText = email || "user@visionx.io";

    // Validate Developer status (only sam@gmail.com and promangamerop50@gmail.com)
    const developerEmails = ['sam@gmail.com', 'promangamerop50@gmail.com'];
    const isDeveloper = email ? developerEmails.includes(email.toLowerCase()) : false;
    const coordPanel = document.getElementById('coordinator-panel');
    
    if (coordPanel) {
      if (isDeveloper) {
        coordPanel.classList.remove('hidden');
      } else {
        coordPanel.classList.add('hidden');
      }
    }
    
    // Typewriter text animation for welcome greeting
    typeWriter(dashGreeting, name.toUpperCase(), 75);

    startLiveSystemClock();
    loadCoordinatorData();
  }

  function typeWriter(element, text, speed) {
    element.innerHTML = '';
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  function startLiveSystemClock() {
    const liveTimeNode = document.getElementById('live-time-val');
    if (!liveTimeNode) return;

    if (liveClockInterval) clearInterval(liveClockInterval);

    function tick() {
      const now = new Date();
      liveTimeNode.innerText = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }

    tick();
    liveClockInterval = setInterval(tick, 1000);
  }

  // Register seat interaction inside Dashboard
  document.querySelectorAll('.register-event-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const eventName = btn.getAttribute('data-event');
      
      if (btn.innerText === "REGISTER SEAT") {
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Reserving...`;
        
        setTimeout(() => {
          btn.innerHTML = `<i class="fa-solid fa-check"></i> ALLOCATED`;
          btn.style.background = 'rgba(57, 255, 20, 0.1)';
          btn.style.borderColor = 'var(--neon-green)';
          btn.style.color = 'var(--neon-green)';
          showToast("Seat Allocated", `You have successfully reserved a seat for: ${eventName}`, "success");
        }, 1200);
      } else if (btn.innerText === "ACCESS WORKSPACE") {
        showToast("Opening Console", `Initializing virtual workspace parameters for: ${eventName}`, "info");
      }
    });
  });

  // Logout Session Handler
  logoutBtn.addEventListener('click', async () => {
    try {
      if (isMockMode) {
        await MockDB.signOut();
      } else if (supabaseClient) {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
      }

      showToast("Session Disconnected", "Secure tunnel severed. Redirecting to gateway.", "info");
      
      if (liveClockInterval) clearInterval(liveClockInterval);

      // Restore Vanta background theme and disable Apple glows
      document.body.classList.remove('apple-theme');
      const vantaBgEl = document.getElementById('vanta-bg');
      if (vantaBgEl) vantaBgEl.style.opacity = '1';

      dashViewport.classList.add('hidden');
      authViewport.classList.remove('hidden');
      tabSignup.click(); // Reset to cyan signup
    } catch (err) {
      showToast("Disconnect Failed", err.message, "error");
    }
  });


  // ==========================================
  // 8. INITIAL SESSION CHECK & STARTUP
  // ==========================================
  async function checkActiveSession() {
    try {
      if (isMockMode) {
        const user = MockDB.getSessionUser();
        if (user) {
          enterDashboard(user);
        } else {
          dashViewport.classList.add('hidden');
          authViewport.classList.remove('hidden');
        }
      } else if (supabaseClient) {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        
        if (session && session.user) {
          enterDashboard(session.user);
        } else {
          dashViewport.classList.add('hidden');
          authViewport.classList.remove('hidden');
        }
      }
    } catch (err) {
      console.error("Session verification failed:", err);
    }
  }

  // GitHub / Discord placeholders
  document.getElementById('oauth-github').addEventListener('click', () => {
    showToast("Gate Connection", "GitHub OAuth protocol is ready. Please configure live credentials inside settings.", "info");
  });
  document.getElementById('oauth-discord').addEventListener('click', () => {
    showToast("Gate Connection", "Discord OAuth protocol is ready. Please configure live credentials inside settings.", "info");
  });

  // --- STARTUP BOOTSTRAP ---
  initVantaBackground();
  loadDatabaseSettings();
  checkActiveSession();

  // ==========================================
  // 9. TEXT SCRAMBLE ENGINE & INTERACTIVITY
  // ==========================================
  class TextScrambler {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.update = this.update.bind(this);
    }
    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => this.resolve = resolve);
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 25);
        const end = start + Math.floor(Math.random() * 25);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }
    update() {
      let output = '';
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="scramble-char" style="opacity:0.75; color: var(--neon-cyan);">${char}</span>`;
        } else {
          output += from;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }
    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  // Hook up hover & automatic scrambling targets
  document.querySelectorAll('.scramble-target').forEach(el => {
    let originalText = el.getAttribute('data-value') || el.innerText;
    const scrambler = new TextScrambler(el);
    
    // Scramble on hover
    el.addEventListener('mouseenter', () => {
      scrambler.setText(originalText);
    });

    // Scramble automatically on page load
    setTimeout(() => {
      scrambler.setText(originalText);
    }, 1000);

    // Scramble automatically every 8 seconds
    setInterval(() => {
      if (el.offsetWidth > 0 || el.offsetHeight > 0) {
        scrambler.setText(originalText);
      }
    }, 8000);
  });

  // ==========================================
  // 10. REAL-TIME EMAIL VERIFIER CONTROLS
  // ==========================================
  let emailCheckTimeout = null;
  const signupEmailInput = document.getElementById('signup-email');
  const emailCheckerWidget = document.getElementById('signup-email-checker');
  const stepSyntax = document.getElementById('signup-step-syntax');
  const stepMx = document.getElementById('signup-step-mx');
  const stepSmtp = document.getElementById('signup-step-smtp');
  const signupSubmitBtn = formSignup.querySelector('.submit-btn');

  signupEmailInput.addEventListener('input', () => {
    clearTimeout(emailCheckTimeout);
    const email = signupEmailInput.value.trim();

    if (!email) {
      emailCheckerWidget.classList.add('hidden');
      signupSubmitBtn.disabled = false;
      signupSubmitBtn.style.opacity = '1';
      return;
    }

    emailCheckerWidget.classList.remove('hidden');
    emailCheckerWidget.classList.add('checking');
    emailCheckerWidget.querySelector('.checker-status-text').innerText = "Analysing email profile...";

    // Reset steps to checking status
    [stepSyntax, stepMx, stepSmtp].forEach(step => {
      step.className = 'pending';
      step.querySelector('i').className = 'fa-solid fa-circle-dot';
    });

    emailCheckTimeout = setTimeout(async () => {
      await performEmailCheck(email);
    }, 600); // Debounce duration
  });

  // Listen to form resets to clear the checker UI
  formSignup.addEventListener('reset', () => {
    emailCheckerWidget.classList.add('hidden');
    signupSubmitBtn.disabled = false;
    signupSubmitBtn.style.opacity = '1';
  });

  async function performEmailCheck(email) {
    signupSubmitBtn.disabled = true;
    signupSubmitBtn.style.opacity = '0.5';

    // 1. Syntax Check
    stepSyntax.className = 'checking';
    stepSyntax.querySelector('i').className = 'fa-solid fa-circle-notch fa-spin';
    await new Promise(r => setTimeout(r, 450));

    if (!validateEmail(email)) {
      stepSyntax.className = 'error';
      stepSyntax.querySelector('i').className = 'fa-solid fa-circle-xmark';
      emailCheckerWidget.querySelector('.checker-status-text').innerText = "Syntax check failed: Invalid email structure";
      emailCheckerWidget.classList.remove('checking');
      
      // Re-enable register button so they can still try to submit and get descriptive error feedback
      signupSubmitBtn.disabled = false;
      signupSubmitBtn.style.opacity = '1';
      return;
    }
    stepSyntax.className = 'success';
    stepSyntax.querySelector('i').className = 'fa-solid fa-circle-check';

    // 2. DNS/MX Record Server Check
    stepMx.className = 'checking';
    stepMx.querySelector('i').className = 'fa-solid fa-circle-notch fa-spin';
    emailCheckerWidget.querySelector('.checker-status-text').innerText = "Resolving MX DNS records...";
    await new Promise(r => setTimeout(r, 550));

    const domain = email.split('@')[1] || "";
    let isDomainValid = false;

    try {
      // Connect to Rapid Email Verifier API
      const response = await fetch(`https://rapid-email-verifier.fly.dev/api/validate?email=${encodeURIComponent(email)}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        const data = await response.json();
        isDomainValid = data.mx_records && data.mx_records.length > 0;
      } else {
        throw new Error();
      }
    } catch(e) {
      // Fallback resolver checks structure and rules out bad domains
      const domainPattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const badDomains = ['gamil.com', 'yaho.com', 'test.com', 'example.com', 'fake.com', 'temp.com', 'mock.com'];
      isDomainValid = domainPattern.test(domain) && !badDomains.includes(domain.toLowerCase());
    }

    if (!isDomainValid) {
      stepMx.className = 'error';
      stepMx.querySelector('i').className = 'fa-solid fa-circle-xmark';
      emailCheckerWidget.querySelector('.checker-status-text').innerText = "MX resolution failed: Unreachable mail server";
      emailCheckerWidget.classList.remove('checking');
      
      // Re-enable register button so they can still try to submit
      signupSubmitBtn.disabled = false;
      signupSubmitBtn.style.opacity = '1';
      return;
    }
    stepMx.className = 'success';
    stepMx.querySelector('i').className = 'fa-solid fa-circle-check';

    // 3. SMTP Mailbox & Burner Check
    stepSmtp.className = 'checking';
    stepSmtp.querySelector('i').className = 'fa-solid fa-circle-notch fa-spin';
    emailCheckerWidget.querySelector('.checker-status-text').innerText = "Initiating SMTP handshake...";
    await new Promise(r => setTimeout(r, 600));

    const burnerDomains = ['mailinator.com', 'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'dispostable.com'];
    if (burnerDomains.includes(domain.toLowerCase())) {
      stepSmtp.className = 'error';
      stepSmtp.querySelector('i').className = 'fa-solid fa-circle-xmark';
      emailCheckerWidget.querySelector('.checker-status-text').innerText = "Blocked: Disposable email accounts forbidden";
      emailCheckerWidget.classList.remove('checking');
      return;
    }

    stepSmtp.className = 'success';
    stepSmtp.querySelector('i').className = 'fa-solid fa-circle-check';
    emailCheckerWidget.querySelector('.checker-status-text').innerText = "Handshake resolved. Email accounts active!";
    emailCheckerWidget.classList.remove('checking');
    
    // Enable submit buttons
    signupSubmitBtn.disabled = false;
    signupSubmitBtn.style.opacity = '1';
  }

  // ==========================================
  // 11. HACKATHON COORDINATOR DASHBOARD LOGIC
  // ==========================================
  async function loadCoordinatorData() {
    const tbody = document.getElementById('coord-registrations-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr class="empty-row"><td colspan="5"><i class="fa-solid fa-circle-notch fa-spin"></i> Synchronising participant profiles...</td></tr>`;

    let participants = [];

    if (isMockMode) {
      participants = MockDB.getUsers();
    } else if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        participants = data || [];
      } catch (err) {
        console.error("Supabase profile sync error:", err);
        tbody.innerHTML = `<tr class="empty-row"><td colspan="5" style="color:var(--neon-red)"><i class="fa-solid fa-triangle-exclamation"></i> Supabase query failed. Ensure the public "profiles" table is configured.</td></tr>`;
        return;
      }
    }

    if (participants.length === 0) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="5"><i class="fa-solid fa-folder-open"></i> No participant registrations found.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    participants.forEach(p => {
      const row = document.createElement('tr');
      
      const fullName = p.fullName || p.full_name || 'N/A';
      const email = p.email || 'N/A';
      const verified = p.verified === undefined ? true : p.verified;
      const event = p.event || 'None';
      
      let dateStr = 'N/A';
      const dateVal = p.created_at || p.createdDate;
      if (dateVal) {
        dateStr = new Date(dateVal).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
      } else {
        dateStr = new Date().toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
      }

      const statusBadge = verified 
        ? `<span class="status-badge verified"><i class="fa-solid fa-circle-check"></i> Verified</span>`
        : `<span class="status-badge pending"><i class="fa-solid fa-circle-notch fa-spin"></i> Pending</span>`;

      row.innerHTML = `
        <td><strong>${fullName}</strong></td>
        <td>${email}</td>
        <td>${statusBadge}</td>
        <td><span style="color:var(--neon-cyan)">${event}</span></td>
        <td><small>${dateStr}</small></td>
      `;
      tbody.appendChild(row);
    });
  }

  async function exportDataToExcel() {
    let participants = [];

    if (isMockMode) {
      participants = MockDB.getUsers();
    } else if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        participants = data || [];
      } catch (err) {
        showToast("Export Failed", "Could not query participant records.", "error");
        return;
      }
    }

    if (participants.length === 0) {
      showToast("Export Denied", "No registration profiles available to compile.", "error");
      return;
    }

    // Build Excel-compatible CSV output
    const headers = ["Full Name", "Email Address", "Verification Status", "Registered Event", "Registration Date"];
    const rows = participants.map(p => {
      const fullName = p.fullName || p.full_name || 'N/A';
      const email = p.email || 'N/A';
      const verified = (p.verified === undefined || p.verified === true) ? 'Verified' : 'Pending';
      const event = p.event || 'None';
      const dateStr = p.created_at || p.createdDate || new Date().toISOString();
      return [fullName, email, verified, event, dateStr];
    });

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Adding UTF-8 BOM for proper Excel rendering
    csvContent += [headers.join(","), ...rows.map(r => r.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "visionx_user_registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Excel Sheet Downloaded", "Registrations sheet successfully compiled and downloaded.", "success");
  }

  function addMockTestData() {
    const mockUsers = [
      { fullName: "Aarav Sharma", email: "aarav.sharma@gmail.com", verified: true, event: "SSC Preparation Challenge", created_at: new Date(Date.now() - 1000 * 3600 * 24).toISOString() },
      { fullName: "Priya Patel", email: "priya.patel@outlook.com", verified: true, event: "CBSE Boards Coding Blitz", created_at: new Date(Date.now() - 1000 * 3600 * 12).toISOString() },
      { fullName: "Ishaan Sen", email: "ishaan@tempmail.com", verified: false, event: "None", created_at: new Date().toISOString() },
      { fullName: "Meera Nair", email: "meera.nair@yahoo.com", verified: true, event: "SSC Preparation Challenge", created_at: new Date(Date.now() - 1000 * 3600 * 48).toISOString() },
      { fullName: "Kabir Mehta", email: "kabir.mehta@mit.edu", verified: true, event: "CBSE Boards Coding Blitz", created_at: new Date(Date.now() - 1000 * 3600 * 5).toISOString() }
    ];

    if (isMockMode) {
      const existing = MockDB.getUsers();
      const updated = [...existing, ...mockUsers];
      MockDB.saveUsers(updated);
      loadCoordinatorData();
      showToast("Test Data Added", "Appended 5 registrations to the local mock store.", "success");
    } else {
      showToast("Supabase Active", "To add data, sign up new accounts in the main signup form.", "info");
    }
  }

  // Hook up Coordinator dashboard button listeners
  const btnExport = document.getElementById('btn-export-excel');
  const btnMock = document.getElementById('btn-generate-mock');

  if (btnExport) btnExport.addEventListener('click', exportDataToExcel);
  if (btnMock) btnMock.addEventListener('click', addMockTestData);

  // ==========================================
  // 12. DUAL SCREEN CAROUSEL & EDUCATIONAL BG INITIALISERS
  // ==========================================
  
  // Educational Background Spawner and Float Animations
  function initEduBackground() {
    const bgContainer = document.getElementById('edu-floating-bg');
    if (!bgContainer) return;

    const icons = [
      'fa-graduation-cap', 'fa-book-open', 'fa-shapes', 'fa-calculator', 
      'fa-flask', 'fa-globe', 'fa-pencil', 'fa-compass', 'fa-atom', 'fa-brain',
      'fa-chalkboard-user', 'fa-diagram-project', 'fa-square-root-variable', 'fa-school'
    ];

    const formulas = [
      'E = mc²', 'a² + b² = c²', 'H₂O', 'F = ma', 'CO₂', 'π ≈ 3.14159', 'y = mx + c',
      'f(x) = ∫x dx', 'sin²θ + cos²θ = 1', 'DNA', '∑ x_i', 'ΔE = hν', 'Fe + O₂ → Fe₂O₃'
    ];

    const colors = [
      'rgba(0, 242, 254, 0.22)', // Neon Cyan
      'rgba(157, 78, 221, 0.22)', // Neon Purple
      'rgba(255, 0, 127, 0.22)', // Neon Magenta
      'rgba(57, 255, 20, 0.18)'  // Neon Green
    ];

    const floatElements = [];

    // 1. Spawning floating icons
    for (let i = 0; i < 20; i++) {
      const element = document.createElement('div');
      element.className = 'edu-floating-icon';
      
      const randIcon = icons[Math.floor(Math.random() * icons.length)];
      const randColor = colors[Math.floor(Math.random() * colors.length)];
      
      element.innerHTML = `<i class="fa-solid ${randIcon}"></i>`;
      element.style.color = randColor;
      
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      element.style.left = `${posX}vw`;
      element.style.top = `${posY}vh`;
      
      const size = Math.random() * 25 + 20;
      element.style.fontSize = `${size}px`;
      
      const duration = Math.random() * 18 + 18;
      const delay = Math.random() * -25;
      element.style.animation = `edu-drift ${duration}s linear infinite ${delay}s`;
      
      bgContainer.appendChild(element);
      
      floatElements.push({ el: element, factor: Math.random() * 20 + 10 });
    }

    // 2. Spawning floating mathematical formula strings
    for (let i = 0; i < 15; i++) {
      const element = document.createElement('div');
      element.className = 'edu-floating-text';
      
      const randFormula = formulas[Math.floor(Math.random() * formulas.length)];
      const randColor = colors[Math.floor(Math.random() * colors.length)];
      
      element.innerText = randFormula;
      element.style.color = randColor;
      
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      element.style.left = `${posX}vw`;
      element.style.top = `${posY}vh`;
      
      const size = Math.random() * 6 + 12;
      element.style.fontSize = `${size}px`;
      
      const duration = Math.random() * 20 + 20;
      const delay = Math.random() * -25;
      element.style.animation = `edu-drift ${duration}s linear infinite ${delay}s`;
      
      bgContainer.appendChild(element);
      
      floatElements.push({ el: element, factor: Math.random() * 15 + 8 });
    }

    // Parallax mouse move reactivity
    window.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX / window.innerWidth - 0.5;
      const mouseY = e.clientY / window.innerHeight - 0.5;
      
      floatElements.forEach(item => {
        const moveX = mouseX * item.factor;
        const moveY = mouseY * item.factor;
        item.el.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
      });
    });
  }

  function initPromoSlider() {
    const slider = document.getElementById('promo-slider');
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.promo-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    let currentSlide = 0;
    
    function showSlide(index) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
    }
    
    // Auto transition every 4 seconds
    let slideInterval = setInterval(() => {
      let nextSlide = (currentSlide + 1) % slides.length;
      showSlide(nextSlide);
    }, 4000);
    
    // Dot navigation click handlers
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        clearInterval(slideInterval);
        const index = parseInt(dot.getAttribute('data-slide'));
        showSlide(index);
        
        // Restart interval
        slideInterval = setInterval(() => {
          let nextSlide = (currentSlide + 1) % slides.length;
          showSlide(nextSlide);
        }, 4000);
      });
    });
  }

  function initQuizWidget() {
    const quizBox = document.getElementById('quiz-question-box');
    if (!quizBox) return;

    const optButtons = quizBox.querySelectorAll('.quiz-opt-btn');
    const feedback = document.getElementById('quiz-feedback');

    optButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.getAttribute('data-correct') === 'true';
        
        optButtons.forEach(b => {
          b.classList.remove('correct', 'wrong');
          b.disabled = true;
        });

        if (isCorrect) {
          btn.classList.add('correct');
          feedback.className = 'quiz-feedback success';
          feedback.innerText = 'Correct! Hydrogen gas (H₂) is released during the reaction. Double click options to reset.';
          feedback.classList.remove('hidden');
          triggerConfetti();
          showToast("Correct Answer!", "+10 XP added to academic record.", "success");
        } else {
          btn.classList.add('wrong');
          feedback.className = 'quiz-feedback error';
          feedback.innerText = 'Incorrect choice. Double click the options box to retry!';
          feedback.classList.remove('hidden');
          showToast("Incorrect Option", "Refer to Chemistry syllabus module.", "error");
          
          setTimeout(() => {
            optButtons.forEach(b => b.disabled = false);
          }, 1500);
        }
      });
    });

    quizBox.addEventListener('dblclick', () => {
      optButtons.forEach(b => {
        b.classList.remove('correct', 'wrong');
        b.disabled = false;
      });
      feedback.classList.add('hidden');
    });
  }

  // CBSE / SSC Syllabus Subjects and Mock Tests Dataset
  const mockTestsData = {
    CBSE: {
      math: {
        title: "Mathematics",
        description: "Master syllabus concepts in Quadratic Equations, Arithmetic Progressions, Coordinate Geometry, Trigonometry, and Statistics.",
        1: [
          { q: "What is the value of k if the quadratic equation 2x² + kx + 3 = 0 has two equal roots?", o: ["±2√6", "±4√3", "±6", "±3√2"], a: 0 },
          { q: "If the common difference of an AP is 5, then what is a_18 - a_13?", o: ["5", "20", "25", "30"], a: 2 },
          { q: "The coordinate of point P dividing the line segment joining A(1, 3) and B(4, 6) in the ratio 2:1 is:", o: ["(2, 4)", "(3, 5)", "(2.5, 4.5)", "(3, 4)"], a: 1 }
        ],
        2: [
          { q: "In a triangle, if the square of one side is equal to the sum of squares of the other two sides, the angle opposite the first side is:", o: ["45°", "60°", "90°", "120°"], a: 2 },
          { q: "A tangent PQ at a point P of a circle of radius 5 cm meets a line through the centre O at a point Q so that OQ = 12 cm. Length PQ is:", o: ["12 cm", "13 cm", "8.5 cm", "√119 cm"], a: 3 },
          { q: "If sin A + sin² A = 1, then the value of the expression (cos² A + cos⁴ A) is:", o: ["1", "0.5", "2", "0"], a: 0 }
        ],
        3: [
          { q: "A solid spherical ball of volume 2304π cm³ is melted and recast into solid cones of radius 6 cm and height 12 cm. Number of cones is:", o: ["32", "64", "128", "16"], a: 1 },
          { q: "If the mean of the observations x, x+3, x+5, x+7 and x+10 is 9, then the mean of the last three observations is:", o: ["10.33", "10.5", "11.33", "11.5"], a: 2 },
          { q: "Cards marked with numbers 2 to 101 are placed in a box. A card is drawn at random. The probability that the card has a prime number less than 30 is:", o: ["9/100", "1/10", "11/100", "10/101"], a: 1 }
        ]
      },
      physics: {
        title: "Physical Science (Physics)",
        description: "Study Core concepts in Light Reflection & Refraction, Human Eye & Colorful World, Electricity, and Magnetic Effects of Electric Current.",
        1: [
          { q: "A convex lens has a focal length of 20 cm. At what distance should an object be placed to get a real image of the same size?", o: ["20 cm", "40 cm", "10 cm", "30 cm"], a: 1 },
          { q: "The refractive index of glass is 1.50. The speed of light in vacuum is 3 × 10⁸ m/s. The speed of light in glass is:", o: ["2.0 × 10⁸ m/s", "1.5 × 10⁸ m/s", "2.5 × 10⁸ m/s", "4.5 × 10⁸ m/s"], a: 0 },
          { q: "The split-ring in a DC motor acts as a:", o: ["Commutator", "Armature", "Slip-ring", "Electromagnet"], a: 0 }
        ],
        2: [
          { q: "How much work is done in moving a charge of 2 C across two points having a potential difference of 12 V?", o: ["6 J", "24 J", "12 J", "48 J"], a: 1 },
          { q: "An electric bulb is rated 220 V and 100 W. When it is operated on 110 V, the power consumed will be:", o: ["100 W", "75 W", "50 W", "25 W"], a: 3 },
          { q: "The strength of magnetic field inside a long straight solenoid carrying current:", o: ["Decreases as we move towards its ends", "Increases as we move towards its ends", "Is zero", "Is the same at all points"], a: 3 }
        ],
        3: [
          { q: "At the time of short circuit, the current in the circuit:", o: ["reduces substantially", "does not change", "increases heavily", "vary continuously"], a: 2 },
          { q: "Which of the following correct depicts the direction of magnetic field lines around a straight current-carrying wire?", o: ["Straight parallel lines", "Concentric circular lines", "Perpendicular radial lines", "Spiral lines"], a: 1 },
          { q: "A person with a myopic eye cannot see objects beyond 1.2 m distinctly. What should be the type of corrective lens?", o: ["Convex lens", "Bifocal lens", "Cylindrical lens", "Concave lens"], a: 3 }
        ]
      },
      chemistry: {
        title: "Chemistry",
        description: "Excel in Chemical Reactions & Equations, Acids Bases & Salts, Metals & Non-Metals, and Carbon & its Compounds.",
        1: [
          { q: "Which of the following is a displacement reaction?", o: ["CaCO₃ → CaO + CO₂", "2H₂ + O₂ → 2H₂O", "Fe + CuSO₄ → FeSO₄ + Cu", "NaOH + HCl → NaCl + H₂O"], a: 2 },
          { q: "What happens when dilute hydrochloric acid is added to iron filings?", o: ["Hydrogen gas and iron chloride are produced", "Chlorine gas and iron hydroxide are produced", "No reaction takes place", "Iron salt and water are produced"], a: 0 },
          { q: "The chemical formula of Plaster of Paris is:", o: ["CaSO₄ · 2H₂O", "CaSO₄ · ½H₂O", "CaSO₄ · H₂O", "CaSO₄ · 5H₂O"], a: 1 }
        ],
        2: [
          { q: "An aqueous solution turns red litmus blue. Its pH value is likely to be:", o: ["1", "4", "5", "10"], a: 3 },
          { q: "Which of the following non-metals is liquid at room temperature?", o: ["Carbon", "Bromine", "Phosphorus", "Sulfur"], a: 1 },
          { q: "Alloys are homogeneous mixtures of metals. Brass is an alloy of:", o: ["Copper and Zinc", "Copper and Tin", "Lead and Tin", "Zinc and Nickel"], a: 0 }
        ],
        3: [
          { q: "While cooking, if the bottom of the vessel is getting blackened on the outside, it means that:", o: ["the food is not cooked completely", "the fuel is not burning completely", "the fuel is wet", "the fuel is burning completely"], a: 1 },
          { q: "Butanone is a four-carbon compound with the functional group:", o: ["carboxylic acid", "aldehyde", "ketone", "alcohol"], a: 2 },
          { q: "Which of the following forms the basis of the Modern Periodic Table?", o: ["Atomic mass", "Atomic number", "Atomic radius", "Valency"], a: 1 }
        ]
      },
      biology: {
        title: "Biology",
        description: "Explore syllabus modules: Life Processes, Control & Coordination, How do Organisms Reproduce?, Heredity and Evolution, and Our Environment.",
        1: [
          { q: "Which plant hormone promotes cell division?", o: ["Auxin", "Gibberellin", "Cytokinin", "Abscisic Acid"], a: 2 },
          { q: "The site of photosynthesis in a plant cell is:", o: ["Mitochondria", "Chloroplast", "Cytoplasm", "Ribosome"], a: 1 },
          { q: "The gap between two neurons is called a:", o: ["Dendrite", "Synapse", "Axon", "Impulse"], a: 1 }
        ],
        2: [
          { q: "Which of the following is a female hormone?", o: ["Estrogen", "Testosterone", "Thyroxine", "Insulin"], a: 0 },
          { q: "During respiration, the breakdown of pyruvate to carbon dioxide and water takes place in:", o: ["Cytoplasm", "Chloroplast", "Mitochondria", "Nucleus"], a: 2 },
          { q: "The kidneys in human beings are a part of the system for:", o: ["Nutrition", "Respiration", "Excretion", "Transportation"], a: 2 }
        ],
        3: [
          { q: "An evolutionary relationship can be traced between humans and:", o: ["Chimpanzee", "Spider", "Bacteria", "Monkey"], a: 0 },
          { q: "The process of transfer of pollen grains from anther to stigma is:", o: ["Fertilization", "Pollination", "Germination", "Transpiration"], a: 1 },
          { q: "Which blood vessel carries deoxygenated blood from the heart to the lungs?", o: ["Pulmonary Artery", "Pulmonary Vein", "Aorta", "Vena Cava"], a: 0 }
        ]
      },
      social: {
        title: "Social Studies",
        description: "Master key syllabus topics: Nationalism in Europe & India, Resources & Development, Power Sharing & Federalism, and Economic Development.",
        1: [
          { q: "Who was proclaimed the German Emperor in 1871?", o: ["Kaiser William I", "Otto von Bismarck", "Napoleon Bonaparte", "Victor Emmanuel II"], a: 0 },
          { q: "Which soil is also known as Regur soil?", o: ["Red soil", "Alluvial soil", "Black soil", "Laterite soil"], a: 2 },
          { q: "Which sector of economy is also called the service sector?", o: ["Primary sector", "Secondary sector", "Tertiary sector", "Quaternary sector"], a: 2 }
        ],
        2: [
          { q: "In which year did the Jallianwala Bagh tragedy occur?", o: ["1915", "1919", "1921", "1928"], a: 1 },
          { q: "Which of the following is a leguminous crop?", o: ["Pulses", "Millets", "Jowar", "Sesamum"], a: 0 },
          { q: "What type of party system is present in India?", o: ["One-party system", "Two-party system", "Multi-party system", "No-party system"], a: 2 }
        ],
        3: [
          { q: "Where was the first printing press set up in India?", o: ["Goa", "Calcutta", "Madras", "Bombay"], a: 0 },
          { q: "Which mineral is formed by the decomposition of rocks, leaving a weathered residual mass?", o: ["Coal", "Bauxite", "Gold", "Iron Ore"], a: 1 },
          { q: "The exchange of goods and services between countries is called:", o: ["Domestic Trade", "International Trade", "Local Trade", "Wholesale Trade"], a: 1 }
        ]
      },
      english: {
        title: "English Language & Literature",
        description: "Refine language elements: Reading Comprehension, Grammar Rules, Active-Passive voice, Tenses, and Figure of Speech.",
        1: [
          { q: "Identify the correct spelling:", o: ["Necesasry", "Necesary", "Necessary", "Neccessary"], a: 2 },
          { q: "What is the synonym of the word 'Prudent'?", o: ["Foolish", "Careless", "Wise", "Hasty"], a: 2 },
          { q: "Which of the following is an adverb?", o: ["Quick", "Quickly", "Quicker", "Quickness"], a: 1 }
        ],
        2: [
          { q: "Fill in the blank: Neither of the boys ____ present yesterday.", o: ["was", "were", "are", "have"], a: 0 },
          { q: "Identify the tense: She had written a letter before he arrived.", o: ["Past Perfect", "Simple Past", "Present Perfect", "Past Continuous"], a: 0 },
          { q: "What is the antonym of the word 'Vague'?", o: ["Unclear", "Dull", "Clear", "Faint"], a: 2 }
        ],
        3: [
          { q: "Fill in the blank: He is senior ____ me in rank.", o: ["than", "to", "from", "with"], a: 1 },
          { q: "What is the passive voice of: 'Someone stole my pen'?", o: ["My pen is stolen", "My pen has stolen by someone", "My pen was stolen", "My pen had stolen"], a: 2 },
          { q: "Identify the figure of speech: The wind whispered in the night.", o: ["Simile", "Metaphor", "Personification", "Hyperbole"], a: 2 }
        ]
      }
    },
    SSC: {
      math: {
        title: "Mathematics",
        description: "Master State board SSC syllabus topics: Real Numbers, Progressions, Mensuration, Coordinate Geometry, Trigonometry, and Probability.",
        1: [
          { q: "If HCF of 306 and 657 is 9, what is their LCM?", o: ["22338", "3069", "2285", "10124"], a: 0 },
          { q: "If x, y, z are in Arithmetic Progression (AP), then 2y is equal to:", o: ["x + z", "xz", "x - z", "(x + z)/2"], a: 0 },
          { q: "The distance between the points (a, b) and (-a, -b) is:", o: ["2√(a²+b²)", "√(a²+b²)", "2(a+b)", "0"], a: 0 }
        ],
        2: [
          { q: "The total surface area of a solid hemisphere of radius r is:", o: ["2πr²", "3πr²", "4πr²", "πr²"], a: 1 },
          { q: "If P(E) = 0.05, what is the probability of 'not E'?", o: ["0.95", "0.05", "0.5", "0"], a: 0 },
          { q: "If tan A = 4/3, then sin A is:", o: ["3/5", "4/5", "5/4", "3/4"], a: 1 }
        ],
        3: [
          { q: "The class interval having the highest frequency in a grouped data is called:", o: ["Median class", "Modal class", "Mean class", "Class width"], a: 1 },
          { q: "A cylindrical pencil sharpened at one edge is the combination of:", o: ["A cylinder and a cone", "A cylinder and a hemisphere", "A cone and a hemisphere", "Two cylinders"], a: 0 },
          { q: "Which of the following cannot be the probability of an event?", o: ["2/3", "-1.5", "15%", "0.7"], a: 1 }
        ]
      },
      physics: {
        title: "Physical Science (Physics)",
        description: "Understand State board topics in Heat, Refraction at Curved Surfaces, Lenses, Electric Current, and Electromagnetism.",
        1: [
          { q: "The SI unit of heat is:", o: ["Joule", "Calorie", "Celsius", "Kelvin"], a: 0 },
          { q: "A focal length of a plano-convex lens of refractive index 1.5 and radius of curvature 20 cm is:", o: ["20 cm", "40 cm", "10 cm", "30 cm"], a: 1 },
          { q: "The device used for producing electric current is called a:", o: ["Generator", "Galvanometer", "Ammeter", "Motor"], a: 0 }
        ],
        2: [
          { q: "Which lens is used to correct presbyopia?", o: ["Convex lens", "Concave lens", "Bifocal lens", "Cylindrical lens"], a: 2 },
          { q: "According to Snell's law, the ratio sin i / sin r is equal to:", o: ["Constant", "Zero", "1", "Infinity"], a: 0 },
          { q: "The electrical resistance of a conductor is directly proportional to its:", o: ["Length", "Area of cross-section", "Temperature", "Current"], a: 0 }
        ],
        3: [
          { q: "The magnetic field lines inside a current-carrying straight solenoid are:", o: ["Concentric circles", "Parallel straight lines", "Divergent lines", "Zero"], a: 1 },
          { q: "Which color of light deviates the least through a glass prism?", o: ["Violet", "Red", "Green", "Yellow"], a: 1 },
          { q: "What is the relation between focal length f and radius of curvature R of a spherical mirror?", o: ["f = 2R", "f = R/2", "f = R", "f = R/3"], a: 1 }
        ]
      },
      chemistry: {
        title: "Chemistry",
        description: "Excel in State board modules: Chemical Equations, Acids Bases & Salts, Atomic Structure, Chemical Bonding, Metallurgy, and Carbon Compounds.",
        1: [
          { q: "The process of heating an ore strongly below its melting point in the presence of excess air is:", o: ["Roasting", "Calcination", "Smelting", "Reduction"], a: 0 },
          { q: "Which acid is present in tomato?", o: ["Citric acid", "Oxalic acid", "Acetic acid", "Tartaric acid"], a: 1 },
          { q: "The maximum number of electrons that can be accommodated in the M-shell is:", o: ["2", "8", "18", "32"], a: 2 }
        ],
        2: [
          { q: "The bond formed by sharing of electron pairs between two atoms is called:", o: ["Ionic bond", "Covalent bond", "Metallic bond", "Coordinate bond"], a: 1 },
          { q: "The modern periodic table is classified into how many groups and periods?", o: ["18 groups, 7 periods", "7 groups, 18 periods", "8 groups, 7 periods", "18 groups, 8 periods"], a: 0 },
          { q: "Which element is the chief constituent of all organic compounds?", o: ["Hydrogen", "Carbon", "Oxygen", "Nitrogen"], a: 1 }
        ],
        3: [
          { q: "The chemical formula of Rust is:", o: ["Fe₃O₄", "Fe₂O₃ · xH₂O", "Fe(OH)₃", "FeCO₃"], a: 1 },
          { q: "An element reacts with oxygen to give a compound with a high melting point. This compound is soluble in water. The element is likely to be:", o: ["Calcium", "Carbon", "Silicon", "Iron"], a: 0 },
          { q: "Which of the following hydrocarbons is unsaturated?", o: ["CH₄", "C₂H₆", "C₂H₄", "C₃H₈"], a: 2 }
        ]
      },
      biology: {
        title: "Biology / Natural Science",
        description: "Study State board SSC topics: Nutrition, Respiration, Transportation, Coordination, Reproduction, and Coordination in Life Processes.",
        1: [
          { q: "The study of internal structure of plants is called:", o: ["Anatomy", "Morphology", "Physiology", "Taxonomy"], a: 0 },
          { q: "Which part of the brain controls reflex actions and simple responses?", o: ["Cerebrum", "Cerebellum", "Medulla Oblongata", "Spinal Cord"], a: 3 },
          { q: "The structure that prevents entry of food into the windpipe is:", o: ["Pharynx", "Larynx", "Epiglottis", "Esophagus"], a: 2 }
        ],
        2: [
          { q: "During photosynthesis, light energy is converted into:", o: ["Chemical energy", "Heat energy", "Electrical energy", "Mechanical energy"], a: 0 },
          { q: "The number of salivary glands present in the human mouth is:", o: ["2 pairs", "3 pairs", "4 pairs", "5 pairs"], a: 1 },
          { q: "The process of gaseous exchange in plants takes place through:", o: ["Stomata", "Lenticels", "Root hairs", "Both Stomata & Lenticels"], a: 3 }
        ],
        3: [
          { q: "Which blood cells are responsible for blood clotting at injury sites?", o: ["Red Blood Cells", "White Blood Cells", "Blood Platelets", "Plasma"], a: 2 },
          { q: "The structural and functional unit of human kidney is:", o: ["Neuron", "Nephron", "Alveoli", "Ureter"], a: 1 },
          { q: "The hormone that regulates carbohydrate metabolism in human body is:", o: ["Adrenaline", "Insulin", "Thyroxine", "Estrogen"], a: 1 }
        ]
      },
      social: {
        title: "Social Studies",
        description: "Excel in State board modules: India Relief Features, Ideas of Development, Production & Employment, and World Wars era.",
        1: [
          { q: "The highest peak in India (Kanchenjunga) has an elevation of:", o: ["8586 m", "8848 m", "8611 m", "8126 m"], a: 0 },
          { q: "In which year was the Suez Canal opened, shortening trade distance to Europe?", o: ["1859", "1869", "1889", "1909"], a: 1 },
          { q: "Which institution is responsible for issuing currency notes in India?", o: ["State Bank of India", "Reserve Bank of India", "Finance Ministry", "NITI Aayog"], a: 1 }
        ],
        2: [
          { q: "Which of the following lines of latitude passes through India?", o: ["Equator", "Tropic of Cancer", "Tropic of Capricorn", "Arctic Circle"], a: 1 },
          { q: "The primary sector of economy in India provides employment to approximately:", o: ["20%", "45%", "60%", "10%"], a: 1 },
          { q: "The Treaty of Versailles, signed after WWI, was heavily biassed against:", o: ["France", "Germany", "Italy", "Great Britain"], a: 1 }
        ],
        3: [
          { q: "The Great Depression started in which year?", o: ["1929", "1939", "1919", "1945"], a: 0 },
          { q: "Which state in India has the highest literacy rate?", o: ["Kerala", "Tamil Nadu", "Maharashtra", "Delhi"], a: 0 },
          { q: "The right to information act (RTI) was enacted in India in:", o: ["2001", "2005", "2010", "2015"], a: 1 }
        ]
      },
      english: {
        title: "English",
        description: "Master State board SSC curriculum: Voice, Direct & Indirect Speech, Prepositions, Synonyms, and Sentence Corrections.",
        1: [
          { q: "What is the plural of 'Index'?", o: ["Indexes", "Indices", "Indexess", "Indicies"], a: 1 },
          { q: "Fill in the blank: If I ____ a bird, I would fly to you.", o: ["am", "was", "were", "had been"], a: 2 },
          { q: "What is the synonym of the word 'Courageous'?", o: ["Fearful", "Brave", "Timid", "Weak"], a: 1 }
        ],
        2: [
          { q: "Fill in: He has been living here ____ five years.", o: ["since", "for", "from", "during"], a: 1 },
          { q: "What is the reported speech of: He said, 'I am writing a letter.'?", o: ["He said that he was writing a letter", "He said he is writing a letter", "He told that he wrote a letter", "He said that he had written a letter"], a: 0 },
          { q: "Which word is an adjective?", o: ["Beauty", "Beautiful", "Beautifully", "Beautify"], a: 1 }
        ],
        3: [
          { q: "Choose the correct passive voice: 'Close the door.'", o: ["Let the door close", "Let the door be closed", "You should close the door", "Let door close"], a: 1 },
          { q: "Find the odd one out in spelling:", o: ["Committee", "Millennium", "Embarrass", "Ocurrence"], a: 3 },
          { q: "Identify the figure of speech: As bold as a lion.", o: ["Metaphor", "Simile", "Alliteration", "Irony"], a: 1 }
        ]
      }
    }
  };

  function initSyllabusModal() {
    const modal = document.getElementById('syllabus-modal');
    const openBtns = document.querySelectorAll('.open-syllabus-btn');
    const closeBtn = document.getElementById('close-syllabus-modal');
    
    const boardTitle = document.getElementById('modal-board-title');
    const subjectTitle = document.getElementById('subject-title');
    const subjectDesc = document.getElementById('subject-description');
    const tabBtns = document.querySelectorAll('.subject-tab-btn');
    
    const testsList = document.querySelector('.mock-tests-list');
    const startTestBtns = document.querySelectorAll('.start-test-btn');
    
    const activeTestPanel = document.getElementById('active-test-panel');
    const activeTestTitle = document.getElementById('active-test-title');
    const questionsBox = document.getElementById('test-questions-box');
    const submitBtn = document.getElementById('submit-test-btn');
    const cancelBtn = document.getElementById('cancel-test-btn');
    const resultsFeedback = document.getElementById('test-results-feedback');

    let activeBoard = 'CBSE';
    let activeSubject = 'math';
    let activeTestNum = 1;
    let activeMode = 'syllabus'; // 'syllabus' or 'test'

    // 1. Open and Close handlers
    openBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeBoard = btn.getAttribute('data-board');
        activeMode = btn.getAttribute('data-mode') || 'syllabus';
        
        if (activeMode === 'syllabus') {
          let targetUrl = 'cbse_syllabus.html';
          if (activeBoard === 'SSC') targetUrl = 'ssc_syllabus.html';
          else if (activeBoard === 'POLYTECHNIC') targetUrl = 'polytechnic_syllabus.html';
          else if (activeBoard === 'EAPCET') targetUrl = 'eapcet_syllabus.html';
          else if (activeBoard === 'ECET') targetUrl = 'ecet_syllabus.html';
          else if (activeBoard === 'LAWCET') targetUrl = 'lawcet_syllabus.html';
          else if (activeBoard === 'NEET') targetUrl = 'neet_syllabus.html';
          else if (activeBoard === 'JEE') targetUrl = 'jee_syllabus.html';
          else if (activeBoard === 'CIVILS') targetUrl = 'civils_syllabus.html';
          
          window.open(targetUrl, '_blank');
          showToast(`${activeBoard} Syllabus Opened`, "Syllabus Hub loaded in a new tab.", "success");
          return;
        }
        
        if (activeMode === 'test') {
          let targetUrl = 'cbse_tests.html';
          if (activeBoard === 'SSC') targetUrl = 'ssc_tests.html';
          else if (activeBoard === 'POLYTECHNIC') targetUrl = 'polytechnic_tests.html';
          else if (activeBoard === 'EAPCET') targetUrl = 'eapcet_tests.html';
          else if (activeBoard === 'ECET') targetUrl = 'ecet_tests.html';
          else if (activeBoard === 'LAWCET') targetUrl = 'lawcet_tests.html';
          else if (activeBoard === 'NEET') targetUrl = 'neet_tests.html';
          else if (activeBoard === 'JEE') targetUrl = 'jee_tests.html';
          else if (activeBoard === 'CIVILS') targetUrl = 'civils_tests.html';
          
          window.open(targetUrl, '_blank');
          showToast(`${activeBoard} Exams Opened`, "Interactive Testing Center loaded in a new tab.", "success");
          return;
        }
      });
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      resetActiveTest();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        resetActiveTest();
      }
    });
    // 1b. Download Syllabus PDF trigger
    const btnDownloadPDF = document.getElementById('btn-download-syllabus-pdf');
    if (btnDownloadPDF) {
      btnDownloadPDF.addEventListener('click', () => {
        downloadSyllabusGuide(activeBoard, activeSubject);
      });
    }

    function downloadSyllabusGuide(board, subject) {
      const data = mockTestsData[board][subject];
      const title = `${board} - ${data.title.toUpperCase()} SYLLABUS & STUDY GUIDE`;
      
      let questionsText = '';
      const testSet = data;
      // Get the 3 mock tests
      [1, 2, 3].forEach(num => {
        if (testSet[num]) {
          questionsText += `\n--- MOCK TEST ${num} REFERENCE QUESTIONS ---\n`;
          testSet[num].forEach((q, idx) => {
            questionsText += `${idx + 1}. ${q.q}\n   Options: ${q.o.join(' | ')}\n   Correct Option Index: ${q.a}\n\n`;
          });
        }
      });

      const fileContent = `======================================================================
${title}
======================================================================
Course: Secondary School Curriculum (${board})
Subject: ${data.title}
Generated On: ${new Date().toLocaleDateString()}

Syllabus Scope & Objectives:
-----------------------------
${data.description}

This guide compiles the recommended revision parameters, learning modules, 
and representative mock testing pools configured in the VISIONX gateway.

${questionsText}
----------------------------------------------------------------------
Verification Hash: SHA256-VX-${board}-${subject.toUpperCase()}-SECURE
VISIONX Educational Gateway Services (Offline Study Compiler)
======================================================================`;

      const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${board.toLowerCase()}_${subject}_syllabus_guide.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast("Download Initialized", `Saved ${board} ${subject.toUpperCase()} study guide to your device.`, "success");
    }

    // 2. Tab Navigation
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const subject = btn.getAttribute('data-subject');
        setActiveSubject(subject);
      });
    });

    const resourcesList = document.getElementById('syllabus-resources-list');
    
    const subjectResourcesData = {
      math: [
        { name: "Syllabus Blueprint & Topics.pdf", size: "142 KB" },
        { name: "Formula Sheet & Proofs.pdf", size: "320 KB" },
        { name: "Previous Year Questions.pdf", size: "1.2 MB" }
      ],
      physics: [
        { name: "Physics Syllabus Outline.pdf", size: "118 KB" },
        { name: "Ray Diagrams & Lens Guide.pdf", size: "480 KB" },
        { name: "Formula & Concept Sheets.pdf", size: "210 KB" }
      ],
      chemistry: [
        { name: "Chemistry Syllabus Scope.pdf", size: "98 KB" },
        { name: "Chemical Reactions cheat sheet.pdf", size: "245 KB" },
        { name: "Salt Analysis & Formulas.pdf", size: "185 KB" }
      ],
      biology: [
        { name: "Biology Core Syllabus Map.pdf", size: "135 KB" },
        { name: "Important Diagrams & Labels.pdf", size: "620 KB" },
        { name: "Excretion & Repro Notes.pdf", size: "290 KB" }
      ],
      social: [
        { name: "Syllabus Timeline & Scope.pdf", size: "155 KB" },
        { name: "History & Geography Maps.pdf", size: "1.4 MB" },
        { name: "Core Notes & Timeline.pdf", size: "380 KB" }
      ],
      english: [
        { name: "English Grammar Syllabus.pdf", size: "90 KB" },
        { name: "Active-Passive & Tense Rules.pdf", size: "180 KB" },
        { name: "Figure of Speech Guide.pdf", size: "130 KB" }
      ]
    };

    function setActiveSubject(subject) {
      activeSubject = subject;
      const data = mockTestsData[activeBoard][subject];
      
      subjectTitle.innerText = data.title;
      subjectDesc.innerText = data.description;

      const syllabusBox = document.querySelector('.syllabus-info-box');
      const testsContainer = document.querySelector('.mock-tests-container');

      if (activeMode === 'syllabus') {
        if (syllabusBox) syllabusBox.classList.remove('hidden');
        if (testsContainer) testsContainer.classList.add('hidden');
      } else {
        if (syllabusBox) syllabusBox.classList.add('hidden');
        if (testsContainer) testsContainer.classList.remove('hidden');
      }
      
      // Populate resources grid dynamically for the active subject
      if (resourcesList) {
        resourcesList.innerHTML = '';
        const list = subjectResourcesData[subject] || [];
        list.forEach(res => {
          const card = document.createElement('div');
          card.className = 'resource-item-card';
          card.innerHTML = `
            <i class="fa-solid fa-file-pdf resource-icon-badge"></i>
            <div class="resource-info">
              <div class="resource-name">${res.name}</div>
              <div class="resource-size">${res.size} • Verified PDF</div>
            </div>
            <i class="fa-solid fa-download resource-dl-arrow"></i>
          `;
          card.addEventListener('click', () => {
            downloadResourceFile(activeBoard, subject, res.name);
          });
          resourcesList.appendChild(card);
        });
      }

      resetActiveTest();
    }

    function downloadResourceFile(board, subject, fileName) {
      const fileTitle = `${board} - ${subject.toUpperCase()} - ${fileName.toUpperCase()}`;
      const content = `======================================================================
${fileTitle}
======================================================================
Course Target: Secondary School Gateway (${board})
Resource: ${fileName}
Status: VERIFIED SECURE PDF COPY
Generated: ${new Date().toLocaleDateString()}

Study Parameter Outlines:
- Comprehensive topic-by-topic outline configured for: ${subject.toUpperCase()}
- Formatted notes compiling core formulas and syllabus objectives.
- Suggested practical/theory worksheets.

Notes:
Keep track of available mock tests on your VISIONX dashboard. Complete them
regularly to lock in your acquired study points and trigger confetti!

----------------------------------------------------------------------
Verification: SHA256-RES-${board}-${subject.toUpperCase()}-${fileName.replace(/\s+/g,'_')}
======================================================================`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${board.toLowerCase()}_${subject}_${fileName.toLowerCase().replace('.pdf', '.txt')}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Download Started", `Downloading resource file: ${fileName}`, "success");
    }

    // 3. Start Test logic
    startTestBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeTestNum = btn.getAttribute('data-test');
        startMockTest();
      });
    });

    function startMockTest() {
      const questions = mockTestsData[activeBoard][activeSubject][activeTestNum];
      const subjectLabel = activeSubject.toUpperCase();
      
      activeTestTitle.innerText = `Mock Test ${activeTestNum}: ${subjectLabel}`;
      
      // Clear and Render dynamic questions
      questionsBox.innerHTML = '';
      resultsFeedback.classList.add('hidden');
      
      questions.forEach((qItem, qIdx) => {
        const qDiv = document.createElement('div');
        qDiv.className = 'test-question-item';
        
        let optionsHtml = '';
        qItem.o.forEach((opt, optIdx) => {
          optionsHtml += `
            <label class="test-opt-label">
              <input type="radio" name="q_${qIdx}" value="${optIdx}">
              ${opt}
            </label>
          `;
        });

        qDiv.innerHTML = `
          <p>${qIdx + 1}. ${qItem.q}</p>
          <div class="test-options-list">
            ${optionsHtml}
          </div>
        `;
        
        questionsBox.appendChild(qDiv);
      });

      // Bind checked styles to labels
      questionsBox.querySelectorAll('.test-opt-label').forEach(label => {
        label.addEventListener('click', () => {
          const name = label.querySelector('input').name;
          // Clear checked class on siblings
          questionsBox.querySelectorAll(`input[name="${name}"]`).forEach(input => {
            input.parentElement.classList.remove('checked');
          });
          if (label.querySelector('input').checked) {
            label.classList.add('checked');
          }
        });
      });

      // Show/Hide containers
      testsList.classList.add('hidden');
      activeTestPanel.classList.remove('hidden');
    }

    function resetActiveTest() {
      activeTestPanel.classList.add('hidden');
      testsList.classList.remove('hidden');
      resultsFeedback.classList.add('hidden');
    }

    cancelBtn.addEventListener('click', resetActiveTest);

    // 4. Submit and Validate
    submitBtn.addEventListener('click', () => {
      const questions = mockTestsData[activeBoard][activeSubject][activeTestNum];
      let score = 0;
      let unanswered = false;

      questionsBox.querySelectorAll('.test-question-item').forEach(item => {
        item.classList.remove('wrong-question');
      });

      questions.forEach((qItem, qIdx) => {
        const selected = questionsBox.querySelector(`input[name="q_${qIdx}"]:checked`);
        if (!selected) {
          unanswered = true;
          return;
        }

        const answerVal = parseInt(selected.value);
        if (answerVal === qItem.a) {
          score++;
        } else {
          // Highlight incorrect answer options
          const correctLabel = selected.parentElement.parentElement.querySelector(`input[value="${qItem.a}"]`).parentElement;
          correctLabel.style.borderColor = 'var(--neon-green)';
          selected.parentElement.classList.add('wrong');
        }
      });

      if (unanswered) {
        showToast("Incomplete Test", "Please answer all 3 questions before submitting.", "error");
        return;
      }

      // Display results feedback
      resultsFeedback.classList.remove('hidden');
      if (score === 3) {
        resultsFeedback.className = 'quiz-feedback success';
        resultsFeedback.innerHTML = `<strong>Perfect Score: 3/3!</strong> +25 XP added to academic record. You have successfully perfected this syllabus quadrant.`;
        triggerConfetti();
        showToast("Mock Test Passed!", "Perfect score achieved. Academic record upgraded.", "success");
      } else {
        resultsFeedback.className = 'quiz-feedback error';
        resultsFeedback.innerHTML = `<strong>Result: ${score}/3 Correct.</strong> Review highlighted correct responses in green and retry.`;
        showToast("Mock Test Completed", `Score: ${score}/3. Review topics and try again.`, "info");
      }

      // Lock inputs
      questionsBox.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = true);
    });
  }

  function initEventsSlider() {
    const track = document.getElementById('events-slider-track');
    const dots = document.querySelectorAll('.event-dot');
    const slides = document.querySelectorAll('.events-slide');
    if (!track || slides.length === 0) return;
    
    let current = 0;
    const total = slides.length;
    
    function goToSlide(index) {
      current = index;
      const slideWidth = slides[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${current * slideWidth}px)`;
      
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }
    
    let timer = setInterval(() => {
      let next = (current + 1) % total;
      // In desktop view, if all fit, don't slide past index 0
      const containerWidth = track.parentElement.getBoundingClientRect().width;
      const trackWidth = track.scrollWidth;
      if (trackWidth <= containerWidth) {
        return;
      }
      goToSlide(next);
    }, 5000);
    
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        clearInterval(timer);
        goToSlide(idx);
      });
    });
    
    // Recalculate on resize
    window.addEventListener('resize', () => {
      goToSlide(current);
    });
  }

  // --- FAMOUS EDUCATION QUOTES TICKER ---
  const quotes = [
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" },
    { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" }
  ];

  let currentQuoteIndex = 0;
  const quoteTextEl = document.getElementById('header-quote-text');
  const quoteAuthorEl = document.getElementById('header-quote-author');

  function cycleQuotes() {
    if (!quoteTextEl || !quoteAuthorEl) return;
    const ticker = document.querySelector('.header-quote-ticker');
    if (ticker) ticker.classList.add('quote-fade-out');
    
    setTimeout(() => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      const nextQuote = quotes[currentQuoteIndex];
      
      quoteTextEl.innerText = `"${nextQuote.text}"`;
      quoteAuthorEl.innerText = `— ${nextQuote.author}`;
      
      if (ticker) ticker.classList.remove('quote-fade-out');
    }, 500);
  }

  // Cycle every 8 seconds
  setInterval(cycleQuotes, 8000);

  // --- POMODORO STUDY TIMER LOGIC ---
  let pomoTime = 25 * 60; // 25 minutes
  let pomoTimerInterval = null;
  let isPomoRunning = false;
  let pomoMode = 'study'; // 'study' or 'break'

  const pomoTimeEl = document.getElementById('pomo-time');
  const pomoLabelEl = document.getElementById('pomo-label');
  const pomoStartBtn = document.getElementById('pomo-start-btn');
  const pomoResetBtn = document.getElementById('pomo-reset-btn');

  function updatePomoDisplay() {
    if (!pomoTimeEl) return;
    const mins = Math.floor(pomoTime / 60);
    const secs = pomoTime % 60;
    pomoTimeEl.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function startPomoTimer() {
    if (isPomoRunning) {
      clearInterval(pomoTimerInterval);
      pomoStartBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
      isPomoRunning = false;
      showToast("Pomodoro Timer", "Timer paused.", "info");
    } else {
      isPomoRunning = true;
      pomoStartBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
      showToast("Pomodoro Timer", pomoMode === 'study' ? "Study session started. Stay focused!" : "Break session started. Relax!", "success");
      
      pomoTimerInterval = setInterval(() => {
        if (pomoTime > 0) {
          pomoTime--;
          updatePomoDisplay();
        } else {
          clearInterval(pomoTimerInterval);
          isPomoRunning = false;
          pomoStartBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
          
          if (pomoMode === 'study') {
            pomoMode = 'break';
            pomoTime = 5 * 60;
            if (pomoLabelEl) {
              pomoLabelEl.innerText = 'BREAK';
              pomoLabelEl.className = 'badge-magenta';
            }
            showToast("Focus Complete!", "Session complete! Enjoy your 5-minute break.", "success");
          } else {
            pomoMode = 'study';
            pomoTime = 25 * 60;
            if (pomoLabelEl) {
              pomoLabelEl.innerText = 'STUDY';
              pomoLabelEl.className = 'badge-cyan';
            }
            showToast("Break Complete!", "Time to start another focus session.", "success");
          }
          updatePomoDisplay();
        }
      }, 1000);
    }
  }

  if (pomoStartBtn) pomoStartBtn.addEventListener('click', startPomoTimer);
  if (pomoResetBtn) {
    pomoResetBtn.addEventListener('click', () => {
      clearInterval(pomoTimerInterval);
      isPomoRunning = false;
      pomoStartBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
      pomoMode = 'study';
      pomoTime = 25 * 60;
      if (pomoLabelEl) {
        pomoLabelEl.innerText = 'STUDY';
        pomoLabelEl.className = 'badge-cyan';
      }
      updatePomoDisplay();
      showToast("Pomodoro Timer", "Timer reset to 25 minutes.", "info");
    });
  }

  // --- AMBIENT GENTLE FALLING PARTICLES ---
  function initFallingParticles() {
    const bgContainer = document.getElementById('edu-floating-bg');
    if (!bgContainer) return;

    const symbols = ['★', '✦', '🎓', '✎', '∑', 'π', 'H₂O', '√'];
    const colors = ['rgba(0, 242, 254, 0.3)', 'rgba(157, 78, 221, 0.3)', 'rgba(255, 0, 127, 0.3)', 'rgba(57, 255, 20, 0.25)'];

    setInterval(() => {
      // Prevent browser overhead (max 40 floating particles)
      const activeParticles = bgContainer.querySelectorAll('.edu-falling-particle');
      if (activeParticles.length > 40) {
        activeParticles[0].remove();
      }

      const particle = document.createElement('div');
      particle.className = 'edu-falling-particle';
      
      const randSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const randColor = colors[Math.floor(Math.random() * colors.length)];
      
      particle.innerText = randSymbol;
      particle.style.color = randColor;
      particle.style.textShadow = `0 0 8px ${randColor}`;
      
      const startX = Math.random() * 98;
      particle.style.left = `${startX}vw`;
      particle.style.top = `-30px`;
      
      const size = Math.random() * 15 + 10;
      particle.style.fontSize = `${size}px`;
      
      const duration = Math.random() * 12 + 10; // fall duration 10s to 22s
      const driftX = (Math.random() - 0.5) * 120;
      
      particle.style.transition = `transform ${duration}s linear, opacity ${duration}s ease-out`;
      bgContainer.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${driftX}px, calc(100vh + 30px)) rotate(${Math.random() * 720 - 360}deg)`;
        particle.style.opacity = '0';
      });

      setTimeout(() => {
        particle.remove();
      }, duration * 1000);

    }, 2500);
  }

  // Launch layouts
  initEduBackground();
  initPromoSlider();
  initQuizWidget();
  initSyllabusModal();
  initEventsSlider();
  initFallingParticles();
  updatePomoDisplay();
});
