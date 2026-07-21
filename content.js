console.log("content script running");
console.log(chrome.runtime.id);
console.log(chrome.storage);

const player = {
    audio: null,
    tracker: null,
    selectedRange: null,
    timepoints: []
};

//-----------------------------------FUNCTIONS----------------------------

function isAudioPlaying() {
  return Boolean(
    player.audio &&
    !player.audio.ended &&
    !player.audio.paused
  );
}

function cleanupWordTracker() {
  if (!player.tracker) {
    return;
  }


  player.tracker.spans.forEach((span) => {
    const parent = span.parentNode;

    if (!parent) {
      return;
    }

    parent.replaceChild(document.createTextNode(span.textContent), span);
    parent.normalize();
  });

  cancelAnimationFrame(player.tracker.frameId);
  player.tracker = null;
}

//-----------------------------------highlighting------------------------------

function getSelectedTextNodes(range) {

  const nodes = [];
  const root =
    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentNode
      : range.commonAncestorContainer;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        try {
          return range.intersectsNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        } catch {
          return NodeFilter.FILTER_REJECT;
        }
      }
    }
  );

  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  console.log({
    selected: range.toString(),
    ancestor: range.commonAncestorContainer,
    type: range.commonAncestorContainer.nodeType
  });

  return [...new Set(nodes)];
}

function getNodeSelectionOffsets(range, node) {
  const start = node === range.startContainer ? range.startOffset : 0;
  const end = node === range.endContainer ? range.endOffset : node.nodeValue.length;

  return {
    start: Math.max(0, Math.min(start, node.nodeValue.length)),
    end: Math.max(0, Math.min(end, node.nodeValue.length))
  };
}

function createHighlightSpan() {
  const span = document.createElement("span");
  span.dataset.selectSpeakWord = "true";
  span.style.borderRadius = "3px";
  span.style.transition = "background-color 80ms linear, box-shadow 80ms linear";

  return span;
}

function setActiveWord(index) {
  if (!player.tracker) {
    return;
  }

  player.tracker.spans.forEach((span, spanIndex) => {
    if (spanIndex === index) {
      span.style.backgroundColor = "#fde047";
      span.style.boxShadow = "0 0 0 2px rgba(253, 224, 71, 0.35)";
      return;
    }

    span.style.backgroundColor = spanIndex < index ? "rgba(250, 204, 21, 0.25)" : "transparent";
    span.style.boxShadow = "none";
  });
}

function createWordTracker() {
  cleanupWordTracker();

  
  const range = player.selectedRange?.cloneRange();

  console.log("selectedRange:", player.selectedRange);
  console.log("range:", range);

  if (!range || range.collapsed) {
    return null;
  }

  
  const entries = [];

  const nodes = getSelectedTextNodes(range);
  console.log("selected nodes:", nodes);

  nodes.forEach((node) => {
    const { start, end } = getNodeSelectionOffsets(range, node);
    const selectedPart = node.nodeValue.slice(start, end);
    const matches = [...selectedPart.matchAll(/\S+/g)];

    matches.forEach((match) => {
      entries.push({
        node,
        start: start + match.index,
        end: start + match.index + match[0].length,
        span: null
      });
    });
  });

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    const node = entry.node;

    if (!node.parentNode || entry.end > node.nodeValue.length || entry.start >= entry.end) {
      continue;
    }

    const afterNode = entry.end < node.nodeValue.length ? node.splitText(entry.end) : null;
    const wordNode = entry.start > 0 ? node.splitText(entry.start) : node;
    const span = createHighlightSpan();

    wordNode.parentNode.insertBefore(span, wordNode);
    span.appendChild(wordNode);
    entry.span = span;
  }

  const spans = entries.map((entry) => entry.span).filter(Boolean);

  if (spans.length === 0) {
    return null;
  }

  player.tracker = {
    spans,
    frameId: null
  };

  setActiveWord(0);

  return player.tracker;
}

function getSelectedText() {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    player.selectedRange = null;
    return "";
  }

  player.selectedRange = selection.getRangeAt(0).cloneRange();
  return selection.toString().trim();
}

function startWordTracking() {
  console.log('starting to word track', player.timepoints)
  const tracker = createWordTracker();

  console.log(`tracker: ${tracker}`)
  if (!tracker || !player.timepoints.length) {
    return;
  }

  const marks = player.timepoints
    .map((point) => ({
      index: Number(point.markName.replace("word-", "")),
      time: point.timeSeconds
    }))
    .filter((mark) => Number.isInteger(mark.index))
    .sort((a, b) => a.time - b.time);

  console.log("marks:", marks);

  if (!marks.length) {
    console.log("No valid marks");
    return;
  }

  let currentMark = 0;
  setActiveWord(marks[0].index);
  function update() {
    while (
      currentMark + 1 < marks.length &&
      player.audio.currentTime >= marks[currentMark + 1].time
    ) {
      currentMark++;
      setActiveWord(marks[currentMark].index);
    }

    if (!player.audio.paused && !player.audio.ended) {
        tracker.frameId = requestAnimationFrame(update);
    }
  }

  tracker.frameId = requestAnimationFrame(update);
  console.log('finished')
}

//----------------------------------------audio handling-----------------------------------------

function setPlaying(isPlaying) {
  chrome.storage.session.set({ isPlaying });
}

function onPlay(){
  chrome.storage.session.set({audioStatus : 'playing'})
  startWordTracking();
}

function onPause(){
  chrome.storage.session.set({audioStatus : 'paused'})
}

function onEnded(){
  chrome.storage.session.set({audioStatus : 'ended'})
  cleanupWordTracker();
  player.selectedRange = null;
}

function setAudio(audio) {
  if (player.audio) {
    player.audio.removeEventListener("play", onPlay);
    player.audio.removeEventListener("pause", onPause);
    player.audio.removeEventListener("ended", onEnded);
  }

  player.audio = audio;

  if (player.audio) {
    player.audio.addEventListener("play", onPlay);
    player.audio.addEventListener("pause", onPause);
    player.audio.addEventListener("ended", onEnded);
  }
}

//--------------------------------main-----------------------------------------



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "playAudio") {(async () => {
    player.timepoints = message.timepoints ?? [];
    if (player.audio) {
      player.audio.pause();
      cleanupWordTracker();
    }

    try {
      setAudio(new Audio(`data:audio/mp3;base64,${message.audio}`))
      await player.audio.play();
      sendResponse({ success: true });
    } catch (error) {
      player.audio = null;
      console.error("Playback failed:", error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  return true;
}

  if (message.action === 'stopAudio') {
    if (player.audio) {
      player.audio.pause();
      setAudio(null);
    }
    sendResponse({ success: true });
    cleanupWordTracker();
    player.selectedRange = null;
  }

  if (message.action === "getSelectedText") {
    sendResponse({ text: getSelectedText() });
  }

  if (message.action === 'getAudioState'){
    sendResponse(isAudioPlaying())
  }
});
