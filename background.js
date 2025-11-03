// Track enabled/disabled per tab
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
  // Inject once; subsequent injects are cheap/no-op
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js'],
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  const tabId = tab.id;

  const states = await getStates();
  const currentlyEnabled = !!states[tabId];
  const nextEnabled = !currentlyEnabled;

  await ensureContentScript(tabId);

  // Tell the content script to start/stop
  await chrome.tabs.sendMessage(tabId, { enable: nextEnabled }).catch(() => {
    /* ignore if no receiver yet */
  });

  states[tabId] = nextEnabled;
  await setStates(states);
  await setBadge(tabId, nextEnabled);
});

// Clean up state when a tab closes
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const states = await getStates();
  if (tabId in states) {
    delete states[tabId];
    await setStates(states);
  }
});
