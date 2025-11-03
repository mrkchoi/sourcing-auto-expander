// Togglable interval that clicks "Show all (#)" under Experience
let intervalId = null;

function start() {
  if (intervalId) return; // already running
  intervalId = setInterval(() => {
    try {
      // LinkedIn Recruiter
      document
        .querySelectorAll('button span[aria-hidden="true"]')
        .forEach((span) => {
          const text = span.textContent.trim();
          if (/^Show all \(\d+\)$/i.test(text)) {
            const btn = span.closest('button');
            if (btn) btn.click();
          }
        });

      // Humanly (app.teamable.com)
      document
        .querySelectorAll('.show-more-less-experience.clickable')
        .forEach((btn) => {
          const text = btn.textContent.trim();
          if (/^Show all\s*\(?\d+\)?$/i.test(text)) {
            if (btn) btn.click();
          }
        });
    } catch (e) {
      console.log('e', e);
      // swallow errors from dynamic DOM
    }
  }, 1500);
  // Optional console cue
  console.debug('[LI Expander] started');
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.debug('[LI Expander] stopped');
  }
}

// Listen for toggle messages from background
chrome.runtime.onMessage.addListener((msg) => {
  if (typeof msg?.enable === 'boolean') {
    if (msg.enable) start();
    else stop();
  }
});
