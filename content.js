let currentAudio = null;
let animationFrame = null;
let activeTracker = null;
let selectedRange = null;

//-----------------------------------Functions----------------------------

function isAudioPlaying() {
  return Boolean(
    currentAudio &&
    !currentAudio.ended &&
    !currentAudio.paused
  );
}

function cleanupWordTracker() {
  if (!activeTracker) {
    return;
  }

  window.clearInterval(activeTracker.intervalId);

  activeTracker.spans.forEach((span) => {
    const parent = span.parentNode;

    if (!parent) {
      return;
    }

    parent.replaceChild(document.createTextNode(span.textContent), span);
    parent.normalize();
  });

  cancelAnimationFrame(activeTracker.frameId);
  activeTracker = null;
}

function getSelectedTextNodes(range) {
  const nodes = [];
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
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

  if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
    nodes.unshift(range.commonAncestorContainer);
  }

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
  if (!activeTracker) {
    return;
  }

  activeTracker.spans.forEach((span, spanIndex) => {
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

  const range = selectedRange?.cloneRange();

  if (!range || range.collapsed) {
    return null;
  }


  const entries = [];

  getSelectedTextNodes(range).forEach((node) => {
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

    if (afterNode) {
      entry.node = node;
    }
  }

  const spans = entries.map((entry) => entry.span).filter(Boolean);

  if (spans.length === 0) {
    return null;
  }

  activeTracker = {
    spans,
    intervalId: null
  };

  setActiveWord(0);

  return activeTracker;
}

function getSelectedText() {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    selectedRange = null;
    return "";
  }

  selectedRange = selection.getRangeAt(0).cloneRange();
  return selection.toString().trim();
}

function startWordTracking(audio, timepoints) {
  console.log('starting to word track', timepoints)
  const tracker = createWordTracker();

  if (!tracker || !timepoints.length) {
    return;
  }

  const marks = timepoints
    .map((point) => ({
      index: Number(point.markName.replace("word-", "")),
      time: point.timeSeconds
    }))
    .filter((mark) => Number.isInteger(mark.index))
    .sort((a, b) => a.time - b.time);

  let activeIndex = -1;

  function update() {
    let nextIndex = 0;

    for (const mark of marks) {
      if (mark.time <= audio.currentTime) {
        nextIndex = mark.index;
      } else {
        break;
      }
    }

    nextIndex = Math.min(nextIndex, tracker.spans.length - 1);

    if (nextIndex !== activeIndex) {
      setActiveWord(nextIndex);
      activeIndex = nextIndex;
    }

    if (!audio.paused && !audio.ended) {
      tracker.frameId = requestAnimationFrame(update);
    }
  }

  tracker.frameId = requestAnimationFrame(update);
}

//--------------------------------main-----------------------------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "playAudio") {(async () => {
    if (currentAudio) {
      currentAudio.pause();
      cleanupWordTracker();
    }

    try {
      currentAudio = new Audio(`data:audio/mp3;base64,${message.audio}`);
      currentAudio.addEventListener("ended", () => {
        currentAudio = null;
        cleanupWordTracker();
        selectedRange = null;
      }, { once: true });
      await currentAudio.play();
      startWordTracking(currentAudio, message.timepoints ?? []);
      sendResponse({ success: true });
    } catch (error) {
      currentAudio = null;
      console.error("Playback failed:", error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  return true;
}

  if (message.action === 'stopAudio') {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    sendResponse({ success: true });
    cleanupWordTracker();
    selectedRange = null;
  }

  if (message.action === "getSelectedText") {
    sendResponse({ text: getSelectedText() });
  }

  if (message.action === 'getAudioState'){
    sendResponse(isAudioPlaying())
  }
});
