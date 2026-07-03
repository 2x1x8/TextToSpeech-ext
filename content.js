// Dynamically create and inject the floating bubble button into the webpage
const btn = document.createElement('div');
btn.className = 'vbee-mini-btn';

const icon = document.createElement('div');
icon.className = 'vbee-mini-icon';

// Generate a secure, web-accessible URL for your asset file
const iconUrl = chrome.runtime.getURL('audio_icon.png');
icon.style.backgroundImage = `url('${iconUrl}')`;

btn.appendChild(icon);
document.body.appendChild(btn);

let currentSelection = "";

// Show the bubble aligned to the final bounding box of the text selection
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const selectionText = selection.toString().trim();
  
  if (selectionText.length > 0 && selection.rangeCount > 0) {
    currentSelection = selectionText;
    
    // Get the exact coordinates of the highlighted text block
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Position it:
    // Left = right side of the highlighted box (the last letter) + 6px padding
    // Top = bottom side of the highlighted box + 4px padding
    btn.style.left = `${rect.right + window.scrollX + 1.5}px`;
    btn.style.top = `${rect.bottom + window.scrollY + 1.5}px`;
    
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
});

// Automatically hide the button if you click anywhere else
document.addEventListener('mousedown', (e) => {
  if (!btn.contains(e.target)) {
    btn.classList.remove('visible');
  }
});

// Forward the text to the service worker when you click the bubble
btn.addEventListener('click', () => {
  btn.classList.remove('visible');
  if (currentSelection && currentSelection.trim() !== "") {
    chrome.runtime.sendMessage({ action: "speakSelection", text: currentSelection });
  }
});