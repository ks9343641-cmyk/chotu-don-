/* Step 1: sirf check karta hai ki setup sahi chal raha hai.
   Aage ke steps mein is file mein code add hoga. */

// CONFIG ke colors CSS mein lagao
document.documentElement.style.setProperty("--bg", CONFIG.colors.background);
document.documentElement.style.setProperty("--accent", CONFIG.colors.accent);

// Test line
document.getElementById("scene-opening").innerHTML =
  '<p class="setup-test">Setup OK. Hi, ' + CONFIG.name + '.</p>';
