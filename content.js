<<<<<<< HEAD

//---------------------------------------------------LISTENERS-----------------------------------------------------------------
let text = ''
// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getText") {
    sendResponse({text: text})
  } 
  return true;
});

//---------------------------------------------------SEND MESSAGE------------------------------------------------------------
function init() {
  text = document.documentElement.innerText

}

init();

=======
chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    console.log(message)
		const audio = new Audio(
			`data:audio/mp3;base64,${message.audio}`
		);
		audio.play()
})
>>>>>>> quocanhV2
