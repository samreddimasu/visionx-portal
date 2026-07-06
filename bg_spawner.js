// VISIONX Background Spawner for Portal new tabs
document.addEventListener('DOMContentLoaded', () => {
  // 1. Create the floating background container if it doesn't exist
  let bgContainer = document.getElementById('edu-floating-bg');
  if (!bgContainer) {
    bgContainer = document.createElement('div');
    bgContainer.id = 'edu-floating-bg';
    bgContainer.className = 'edu-background-layer';
    // Insert at the beginning of the body so it sits behind content
    document.body.insertBefore(bgContainer, document.body.firstChild);
  }

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

  // Spawn 12 floating icons
  for (let i = 0; i < 12; i++) {
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
    
    const size = Math.random() * 20 + 16;
    element.style.fontSize = `${size}px`;
    
    const duration = Math.random() * 20 + 20;
    const delay = Math.random() * -25;
    element.style.animation = `edu-drift ${duration}s linear infinite ${delay}s`;
    
    bgContainer.appendChild(element);
  }

  // Spawn 12 formula texts
  for (let i = 0; i < 12; i++) {
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
    
    const size = Math.random() * 12 + 10;
    element.style.fontSize = `${size}px`;
    
    const duration = Math.random() * 20 + 20;
    const delay = Math.random() * -25;
    element.style.animation = `edu-drift ${duration}s linear infinite ${delay}s`;
    
    bgContainer.appendChild(element);
  }

  // --- AMBIENT GENTLE FALLING PARTICLES ---
  const fallingSymbols = ['★', '✦', '🎓', '✎', '∑', 'π', 'H₂O', '√'];
  const fallingColors = ['rgba(0, 242, 254, 0.3)', 'rgba(157, 78, 221, 0.3)', 'rgba(255, 0, 127, 0.3)', 'rgba(57, 255, 20, 0.25)'];

  setInterval(() => {
    const activeParticles = bgContainer.querySelectorAll('.edu-falling-particle');
    if (activeParticles.length > 25) {
      activeParticles[0].remove();
    }

    const particle = document.createElement('div');
    particle.className = 'edu-falling-particle';
    
    const randSymbol = fallingSymbols[Math.floor(Math.random() * fallingSymbols.length)];
    const randColor = fallingColors[Math.floor(Math.random() * fallingColors.length)];
    
    particle.innerText = randSymbol;
    particle.style.color = randColor;
    particle.style.textShadow = `0 0 8px ${randColor}`;
    
    const startX = Math.random() * 98;
    particle.style.left = `${startX}vw`;
    particle.style.top = `-30px`;
    
    const size = Math.random() * 15 + 10;
    particle.style.fontSize = `${size}px`;
    
    const duration = Math.random() * 12 + 10;
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

  }, 2800);
});
