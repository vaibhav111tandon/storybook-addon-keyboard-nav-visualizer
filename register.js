import React, { useState, useEffect, useCallback } from 'react';
import { addons, types } from '@storybook/manager-api';
import { AddonPanel } from '@storybook/components';

const ADDON_ID = 'keyboard-nav-visualizer';
const PANEL_ID = `${ADDON_ID}/panel`;
const TOOL_ID = `${ADDON_ID}/tool`;

const EVENTS = {
  TOGGLE_VISUALIZER: `${ADDON_ID}/toggle`,
  KEY_PRESSED: `${ADDON_ID}/key-pressed`,
  FOCUS_CHANGED: `${ADDON_ID}/focus-changed`,
  TAB_ORDER_UPDATED: `${ADDON_ID}/tab-order`,
  UPDATE_SETTINGS: `${ADDON_ID}/update-settings`,
};

// Toolbar Button
const KeyboardNavTool = () => {
  const [enabled, setEnabled] = useState(false);
  const channel = addons.getChannel();
  const emit = (event, payload) => channel.emit(event, payload);

  const toggleVisualizer = useCallback(() => {
    const newState = !enabled;
    setEnabled(newState);
    console.log('Toggling visualizer, new state:', newState, enabled);
    emit(EVENTS.TOGGLE_VISUALIZER, { enabled: newState });
  }, [enabled]);

  return React.createElement(
    'button',
    {
      onClick: toggleVisualizer,
      title: 'Toggle Keyboard Navigation Visualizer',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        cursor: 'pointer',
        background: enabled ? '#0066cc' : 'transparent',
        color: enabled ? 'white' : 'currentColor',
        border: 'none',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: 500,
        transition: 'all 0.2s',
      },
    },
    React.createElement('span', null, '⌨️'),
    React.createElement('span', null, 'Keyboard Nav')
  );
};

// Panel Component
const KeyboardNavPanel = ({ active }) => {
  const [keyHistory, setKeyHistory] = useState([]);
  const [focusHistory, setFocusHistory] = useState([]);
  const [tabOrder, setTabOrder] = useState([]);
  const [settings, setSettings] = useState({
    showOverlay: true,
    showTabIndex: true,
    highlightFocus: true,
    trackHistory: true,
  });

  const channel = addons.getChannel();

  useEffect(() => {
    // emit updated settings to the preview
    channel.emit(EVENTS.UPDATE_SETTINGS, settings);

    // handlers that update panel state when the preview emits events
    const onKeyPressed = (data) => {
      if (settings.trackHistory) {
        setKeyHistory((prev) => [data, ...prev].slice(0, 50));
      }
    };

    const onFocusChanged = (data) => {
      if (settings.trackHistory) {
        setFocusHistory((prev) => [data, ...prev].slice(0, 30));
      }
    };

    const onTabOrderUpdated = (data) => {
      setTabOrder(data.elements || []);
    };

    channel.on(EVENTS.KEY_PRESSED, onKeyPressed);
    channel.on(EVENTS.FOCUS_CHANGED, onFocusChanged);
    channel.on(EVENTS.TAB_ORDER_UPDATED, onTabOrderUpdated);

    return () => {
      channel.removeListener(EVENTS.KEY_PRESSED, onKeyPressed);
      channel.removeListener(EVENTS.FOCUS_CHANGED, onFocusChanged);
      channel.removeListener(EVENTS.TAB_ORDER_UPDATED, onTabOrderUpdated);
    };
  }, [settings]);

  const clearHistory = () => {
    setKeyHistory([]);
    setFocusHistory([]);
  };

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    });
  };

  if (!active) return null;

  return React.createElement(
    'div',
    { style: { padding: '16px', fontFamily: 'system-ui, sans-serif', height: '100%', overflow: 'auto' } },
    
    React.createElement(
      'div',
      { style: { marginBottom: '20px' } },
      React.createElement('h3', { style: { margin: '0 0 12px', fontSize: '16px', fontWeight: 600 } }, 'Settings'),
      React.createElement(
        'div',
        { style: { display: 'flex', flexWrap: 'wrap', gap: '12px' } },
        Object.entries({
          showOverlay: 'Show Focus Overlay',
          showTabIndex: 'Show Tab Index',
          highlightFocus: 'Highlight on Focus',
          trackHistory: 'Track History',
        }).map(([key, label]) =>
          React.createElement(
            'label',
            {
              key,
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              },
            },
            React.createElement('input', {
              type: 'checkbox',
              checked: settings[key],
              onChange: () => toggleSetting(key),
              style: { cursor: 'pointer' },
            }),
            React.createElement('span', null, label)
          )
        )
      )
    ),

    React.createElement(
      'div',
      { style: { marginBottom: '24px' } },
      React.createElement(
        'h3',
        { style: { margin: '0 0 12px', fontSize: '16px', fontWeight: 600 } },
        `Tab Order (${tabOrder.length} elements)`
      ),
      tabOrder.length === 0
        ? React.createElement(
            'div',
            { style: { padding: '12px', background: '#f5f5f5', borderRadius: '4px', fontSize: '13px', color: '#666' } },
            'Enable the visualizer to see tab order'
          )
        : React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            tabOrder.map((item, idx) =>
              React.createElement(
                'div',
                {
                  key: idx,
                  style: {
                    padding: '10px 12px',
                    background: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  },
                },
                React.createElement(
                  'span',
                  {
                    style: {
                      background: '#0066cc',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      minWidth: '24px',
                      textAlign: 'center',
                    },
                  },
                  idx + 1
                ),
                React.createElement(
                  'code',
                  { style: { flex: 1, fontSize: '12px', color: '#333' } },
                  item.element
                ),
                item.tabIndex !== undefined &&
                  React.createElement(
                    'span',
                    { style: { fontSize: '11px', color: '#666', background: '#e8e8e8', padding: '2px 6px', borderRadius: '3px' } },
                    `tabindex: ${item.tabIndex}`
                  )
              )
            )
          )
    ),

    // Key Press History
    React.createElement(
      'div',
      { style: { marginBottom: '24px' } },
      React.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' } },
        React.createElement('h3', { style: { margin: 0, fontSize: '16px', fontWeight: 600 } }, 'Key Press History'),
        keyHistory.length > 0 &&
          React.createElement(
            'button',
            {
              onClick: clearHistory,
              style: {
                padding: '4px 12px',
                fontSize: '12px',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              },
            },
            'Clear'
          )
      ),
      keyHistory.length === 0
        ? React.createElement(
            'div',
            { style: { padding: '12px', background: '#f5f5f5', borderRadius: '4px', fontSize: '13px', color: '#666' } },
            'Press keys to see history'
          )
        : React.createElement(
            'div',
            { style: { maxHeight: '200px', overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px' } },
            keyHistory.map((item, idx) =>
              React.createElement(
                'div',
                {
                  key: idx,
                  style: {
                    padding: '8px 12px',
                    borderBottom: idx < keyHistory.length - 1 ? '1px solid #f0f0f0' : 'none',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: idx === 0 ? '#f0f7ff' : 'white',
                  },
                },
                React.createElement(
                  'span',
                  null,
                  React.createElement(
                    'kbd',
                    {
                      style: {
                        background: '#333',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        marginRight: '8px',
                      },
                    },
                    item.key
                  ),
                  React.createElement('span', { style: { color: '#666', fontSize: '11px' } }, item.target)
                ),
                React.createElement('span', { style: { color: '#999', fontSize: '10px' } }, formatTimestamp(item.timestamp))
              )
            )
          )
    ),

    React.createElement(
      'div',
      null,
      React.createElement('h3', { style: { margin: '0 0 12px', fontSize: '16px', fontWeight: 600 } }, 'Focus History'),
      focusHistory.length === 0
        ? React.createElement(
            'div',
            { style: { padding: '12px', background: '#f5f5f5', borderRadius: '4px', fontSize: '13px', color: '#666' } },
            'Tab through elements to see focus history'
          )
        : React.createElement(
            'div',
            { style: { maxHeight: '200px', overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: '4px' } },
            focusHistory.map((item, idx) =>
              React.createElement(
                'div',
                {
                  key: idx,
                  style: {
                    padding: '8px 12px',
                    borderBottom: idx < focusHistory.length - 1 ? '1px solid #f0f0f0' : 'none',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: idx === 0 ? '#f0fff4' : 'white',
                  },
                },
                React.createElement('code', { style: { fontSize: '11px', color: '#333' } }, item.element),
                React.createElement('span', { style: { color: '#999', fontSize: '10px' } }, formatTimestamp(item.timestamp))
              )
            )
          )
    )
  );
};

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Keyboard Navigation',
    match: ({ viewMode }) => viewMode === 'story',
    render: () => React.createElement(KeyboardNavTool),
  });

  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Keyboard Navigation',
    match: ({ viewMode }) => viewMode === 'story',
    render: ({ active }) => React.createElement(AddonPanel, { active }, React.createElement(KeyboardNavPanel, { active })),
  });
});