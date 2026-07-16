// ==========================================
// METHOD 1: Mozilla Readability Engine
// ==========================================
function testReadabilityMethod() {
    // Clone the DOM so we don't mutate the live view
    const documentClone = document.cloneNode(true);
    
    const reader = new Readability(documentClone);
    const article = reader.parse();

    if (article && article.textContent) {
        return article.textContent.trim();
    }
    return "Readability failed to extract text.";
}

// ==========================================
// METHOD 2: Manual Target DOM Selectors
// ==========================================
function testManualSelectorMethod() {
    // Selectors we want to target and scrub away entirely
    const selectorsToRemove = [
        'header', 'footer', 'aside', 'nav', '.sidebar', '.ads', 
        '.comment-section', '.related-posts', 'script', 'style', '.meta'
    ];
    
    const bodyClone = document.body.cloneNode(true);
    
    // Wipe out the clutter elements from our temporary DOM copy
    selectorsToRemove.forEach(selector => {
        bodyClone.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Gather remaining paragraph texts
    const paragraphs = bodyClone.querySelectorAll('p');
    let textLines = [];
    
    paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text.length > 20) { // filter out noise
            textLines.push(text);
        }
    });
    
    return textLines.join('\n\n');
}

// ==========================================
// EXECUTE TESTS ON LOAD
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    console.log("%c--- RUNNING SEPARATION TESTS ---", "color: cyan; font-weight: bold; font-size: 14px;");

    console.log("%c\n[RESULTS] Method 1: Mozilla Readability:", "color: lime; font-weight: bold;");
    const output1 = testReadabilityMethod();
    console.log(output1);

    console.log("%c\n[RESULTS] Method 2: Manual DOM Selectors:", "color: orange; font-weight: bold;");
    const output2 = testManualSelectorMethod();
    console.log(output2);
});