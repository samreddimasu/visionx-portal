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
  let countdownInterval = null;
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
  const navAbout = document.getElementById('nav-about');
  const navContact = document.getElementById('nav-contact');

  // About Modal
  const aboutModal = document.getElementById('about-modal');
  const aboutClose = document.getElementById('about-close');

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

  // Countdown Nodes
  const hoursNode = document.getElementById('hours');
  const minutesNode = document.getElementById('minutes');
  const secondsNode = document.getElementById('seconds');


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
    navAbout.classList.remove('active');
    navContact.classList.remove('active');
  }

  // Home Navigation
  navHome.addEventListener('click', (e) => {
    e.preventDefault();
    resetNavActiveState();
    navHome.classList.add('active');
    
    // Close any overlays
    aboutModal.classList.add('hidden');
    contactModal.classList.add('hidden');
    settingsModal.classList.add('hidden');
    
    // Restore base background theme
    updateVantaColor(currentActiveTheme);
  });

  // About Navigation
  navAbout.addEventListener('click', (e) => {
    e.preventDefault();
    resetNavActiveState();
    navAbout.classList.add('active');
    
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

  // Handle outside-modal clicking to close
  window.addEventListener('click', (e) => {
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
      
      // Simulate network dispatch delay
      await new Promise(r => setTimeout(r, 1200));

      showToast("Transmission Received", "Message logged to VISIONX operations command.", "success");
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
      return JSON.parse(localStorage.getItem('eduhack_mock_users')) || [];
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
        throw new Error("A developer profile with this email already exists.");
      }

      const newUser = { email, password, fullName };
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
      return { user: { email: user.email, user_metadata: { full_name: user.fullName } } };
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
      setLoadingState(formSignup, false, "REGISTER DEVELOPER PROFILE");
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

  // --- CONFETTI (DECORATIVE PAPERS) FALLING SYSTEM ---
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

    for (let i = 0; i < 120; i++) {
      const confetti = document.createElement('div');
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      confetti.style.position = 'absolute';
      const sizeWidth = Math.random() * 8 + 6;
      const sizeHeight = shape === 'rectangle' ? sizeWidth * 1.8 : sizeWidth;
      
      confetti.style.width = `${sizeWidth}px`;
      confetti.style.height = `${sizeHeight}px`;
      confetti.style.backgroundColor = color;
      
      if (shape === 'circle') {
        confetti.style.borderRadius = '50%';
      }

      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = `-${Math.random() * 50 + 20}px`;
      
      const startRotation = Math.random() * 360;
      const fallDuration = Math.random() * 3 + 2.5; // 2.5s to 5.5s
      const fallDelay = Math.random() * 0.6;
      const horizontalDrift = Math.random() * 260 - 130; // -130px to 130px
      const finalRotation = startRotation + Math.random() * 720 + 360;

      confetti.style.transform = `rotate(${startRotation}deg)`;
      confetti.style.opacity = '1';
      confetti.style.transition = `transform ${fallDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${fallDelay}s, top ${fallDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${fallDelay}s, opacity ${fallDuration}s ease-out ${fallDelay}s`;
      
      confettiContainer.appendChild(confetti);

      requestAnimationFrame(() => {
        setTimeout(() => {
          confetti.style.top = '105vh';
          confetti.style.transform = `translateX(${horizontalDrift}px) rotate(${finalRotation}deg)`;
          confetti.style.opacity = '0';
        }, 50);
      });
    }

    setTimeout(() => {
      confettiContainer.remove();
    }, 6200);
  }


  // ==========================================
  // 7. DASHBOARD CONTROL CENTRE & EVENTS
  // ==========================================
  function enterDashboard(user) {
    authViewport.classList.add('hidden');
    dashViewport.classList.remove('hidden');
    currentActiveTheme = 0x00f2fe; // Cyan background theme for dashboard
    updateVantaColor(currentActiveTheme);

    const email = user.email;
    const name = user.user_metadata?.full_name || user.fullName || email.split('@')[0];

    userDispName.innerText = name;
    userDispEmail.innerText = email;
    dashGreeting.innerText = name.toUpperCase();

    startCountdownTimer();
  }

  function startCountdownTimer() {
    let totalSeconds = (28 * 3600) + (14 * 60) + 30;

    if (countdownInterval) clearInterval(countdownInterval);

    function tick() {
      if (totalSeconds <= 0) {
        clearInterval(countdownInterval);
        hoursNode.innerText = "00";
        minutesNode.innerText = "00";
        secondsNode.innerText = "00";
        return;
      }

      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      hoursNode.innerText = String(hrs).padStart(2, '0');
      minutesNode.innerText = String(mins).padStart(2, '0');
      secondsNode.innerText = String(secs).padStart(2, '0');

      totalSeconds--;
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
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
      
      if (countdownInterval) clearInterval(countdownInterval);

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
});
