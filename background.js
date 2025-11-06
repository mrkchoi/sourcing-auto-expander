// background.js

const STATE_KEY = 'tabStates'; // { [tabId]: true|false }

async function getStates() {
  const { [STATE_KEY]: states = {} } = await chrome.storage.session.get(
    STATE_KEY
  );
  return states;
}
async function setStates(states) {
  await chrome.storage.session.set({ [STATE_KEY]: states });
}

async function setBadge(tabId, enabled) {
  await chrome.action.setBadgeBackgroundColor({
    color: enabled ? '#AEE6FF' : '#999999',
    tabId,
  });
  await chrome.action.setBadgeText({ text: enabled ? 'ON' : '', tabId });
}

async function ensureContentScript(tabId) {
  // Injecting repeatedly is cheap/no-op if already present
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js'],
  });
}

// Call the content singleton directly in the tab's isolated world
async function toggleInTab(tabId, enabled) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (enabledArg) => {
      globalThis.__LI_EXPANDER__?.toggle(enabledArg);
    },
    args: [enabled],
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  const tabId = tab.id;

  const states = await getStates();
  const nextEnabled = !Boolean(states[tabId]);

  await ensureContentScript(tabId);
  await toggleInTab(tabId, nextEnabled);

  states[tabId] = nextEnabled;
  await setStates(states);
  await setBadge(tabId, nextEnabled);
});

// Re-apply state after reload/navigation so the first click "sticks"
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== 'complete') return;
  const states = await getStates();
  const enabled = Boolean(states[tabId]);
  if (!enabled) {
    await setBadge(tabId, false);
    return;
  }
  try {
    await ensureContentScript(tabId);
    await toggleInTab(tabId, true); // start immediately on page load if ON
    await setBadge(tabId, true);
  } catch (e) {
    // Tab might not be scriptable (e.g., chrome:// pages)
    await setBadge(tabId, false);
  }
});

// Clean up per-tab state
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const states = await getStates();
  if (tabId in states) {
    delete states[tabId];
    await setStates(states);
  }
});
