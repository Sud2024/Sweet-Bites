(() => {
  const dialog = document.getElementById('catalogue');
  const opener = document.getElementById('open-catalogue');
  if (typeof dialog?.showModal !== 'function') return;

  const tabs = [...dialog.querySelectorAll('[role="tab"]')];
  const content = dialog.querySelector('.catalogue-content');

  function selectTab(selected) {
    for (const tab of tabs) {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    }
    content.scrollTop = 0;
    selected.focus();
  }

  opener.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialog.showModal();
    selectTab(tabs[0]);
  });

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      const destinations = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1
      };
      if (!Object.hasOwn(destinations, event.key)) return;
      event.preventDefault();
      selectTab(tabs[destinations[event.key]]);
    });
  }
})();
