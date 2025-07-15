document.getElementById("summarizeForm").addEventListener("submit", function (e) {
  e.preventDefault();
  summarize();
});

function summarize() {
  const inputText = document.getElementById("inputText").value.trim();
  const summaryBox = document.getElementById("summaryBox");
  const summarizeBtn = document.getElementById("summarizeBtn");

  if (!inputText) {
    summaryBox.innerText = "Please paste blog content to summarize.";
    updateWordCount();
    return;
  }

  summarizeBtn.disabled = true;
  summarizeBtn.innerText = "Summarizing...";

  setTimeout(() => {
    const summary = generateSummary(inputText);
    summaryBox.innerText = summary;
    updateWordCount();

    summarizeBtn.disabled = false;
    summarizeBtn.innerText = "Summarize";
  }, 1000);
}

function generateSummary(text) {
  const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"]);

  const sentences = text.split(/[.?!]/).filter(s => s.trim().length > 0).map(s => s.trim() + ".");
  if (sentences.length === 0) return "Summary could not be generated.";

  const wordFreq = {};
  const words = text.toLowerCase().split(/\s+/).filter(w => !stopWords.has(w) && w.length > 2);
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const sentenceScores = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().split(/\s+/).filter(w => !stopWords.has(w));
    const score = sentenceWords.reduce((sum, word) => sum + (wordFreq[word] || 0), 0) / (sentenceWords.length || 1);
    return { sentence, score, index };
  });

  const topCount = Math.max(1, Math.floor(sentences.length * 0.3));
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, topCount)
    .sort((a, b) => a.index - b.index)
    .map(s => s.sentence);

  let summary = topSentences.join(" ").trim();
  if (!summary.endsWith(".")) summary += ".";

  const summaryWords = summary.split(/\s+/);
  if (summaryWords.length > 150) {
    summary = summaryWords.slice(0, 150).join(" ") + "...";
  }

  return summary;
}

function clearText() {
  document.getElementById("inputText").value = "";
  document.getElementById("summaryBox").innerText = "";
  updateWordCount();
}

function copySummary() {
  const summary = document.getElementById("summaryBox").innerText;
  navigator.clipboard.writeText(summary)
    .then(() => showToast("Summary copied to clipboard!"))
    .catch(() => showToast("Failed to copy summary."));
}

function showToast(message) {
  const toastEl = document.getElementById("toast");
  toastEl.querySelector(".toast-body").innerText = message;

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

function updateWordCount() {
  const inputText = document.getElementById("inputText").value.trim();
  const summaryText = document.getElementById("summaryBox").innerText.trim();

  const inputCount = inputText ? inputText.split(/\s+/).length : 0;
  const summaryCount = summaryText ? summaryText.split(/\s+/).length : 0;

  document.getElementById("inputWordCount").innerText = `Word count: ${inputCount}`;
  document.getElementById("summaryWordCount").innerText = `Word count: ${summaryCount}`;
}

document.getElementById("inputText").addEventListener("input", updateWordCount);
updateWordCount();
