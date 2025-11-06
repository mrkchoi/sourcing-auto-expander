// content.js
if (!globalThis.__LI_EXPANDER__) {
  globalThis.__LI_EXPANDER__ = (() => {
    let intervalId = null;

    function expandAll() {
      try {
        // LinkedIn Recruiter
        document
          .querySelectorAll('button span[aria-hidden="true"]')
          .forEach((span) => {
            const text = span.textContent?.trim() || '';
            if (/^Show all \(\d+\)$/i.test(text)) {
              const btn = span.closest('button');
              if (btn) btn.click();
            }
          });

        // Humanly
        document
          .querySelectorAll('.show-more-less-experience.clickable')
          .forEach((btn) => {
            const text = btn.textContent?.trim() || '';
            if (/^Show all\s*\(?\d+\)?$/i.test(text)) btn.click();
          });

        // LinkedIn Public Profiles
        document
          .querySelectorAll('button.inline-show-more-text__button')
          .forEach((btn) => {
            const text = (btn.textContent || '').toLowerCase();
            const expanded = btn.getAttribute('aria-expanded');
            if (text.includes('see more') && expanded === 'false') btn.click();
          });
      } catch (e) {
        console.debug('[LI Expander] error:', e);
      }
    }

    function start() {
      if (intervalId) return;
      expandAll(); // <-- run immediately on toggle
      intervalId = setInterval(expandAll, 1500);
      console.debug('[LI Expander] started');
    }

    function stop() {
      if (!intervalId) return;
      clearInterval(intervalId);
      intervalId = null;
      console.debug('[LI Expander] stopped');
    }

    function toggle(enabled) {
      enabled ? start() : stop();
    }

    return { start, stop, toggle };
  })();
}
