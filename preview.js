import React, { useState, useEffect } from 'react';
import { useChannel } from '@storybook/preview-api';

const ADDON_ID = 'keyboard-nav-visualizer';
const EVENTS = {
  TOGGLE_VISUALIZER: `${ADDON_ID}/toggle`,
  KEY_PRESSED: `${ADDON_ID}/key-pressed`,
  FOCUS_CHANGED: `${ADDON_ID}/focus-changed`,
  TAB_ORDER_UPDATED: `${ADDON_ID}/tab-order`,
  UPDATE_SETTINGS: `${ADDON_ID}/update-settings`,
};

let settings = {
  showOverlay: true,
  showTabIndex: true,
  highlightFocus: true,
  trackHistory: true,
};

// Create overlay element
const createOverlay = () => {
  const overlay = document.createElement('div');
  overlay.id = 'keyboard-nav-overlay';
  overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 999999;
    border: 3px solid #0066cc;
    border-radius: 4px;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
    transition: all 0.15s ease;
    display: none;
  `;
  document.body.appendChild(overlay);
  return overlay;
};

const createBadge = (element, index) => {
  const badge = document.createElement('div');
  badge.className = 'keyboard-nav-badge';
  badge.textContent = index + 1;
  badge.style.cssText = `
    position: absolute;
    background: #0066cc;
    color: white;
    font-size: 12px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 10px;
    z-index: 999998;
    pointer-events: none;
    font-family: system-ui, sans-serif;
    line-height: 1;
  `;
  
  const rect = element.getBoundingClientRect();
  badge.style.top = `${window.scrollY + rect.top - 12}px`;
  badge.style.left = `${window.scrollX + rect.left - 12}px`;
  
  document.body.appendChild(badge);
  return badge;
};

const getElementDescription = (element) => {
  if (!element) return 'unknown';
  
  let desc = element.tagName.toLowerCase();
  if (element.id) desc += `#${element.id}`;
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').slice(0, 2).join('.');
    if (classes) desc += `.${classes}`;
  }
  if (element.getAttribute('aria-label')) {
    desc += ` [${element.getAttribute('aria-label')}]`;
  }
  return desc;
};

const getFocusableElements = () => {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');
  
  const elements = Array.from(document.querySelectorAll(selector));
  
  return elements
    .filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             el.offsetParent !== null;
    })
    .sort((a, b) => {
      const aIndex = parseInt(a.getAttribute('tabindex') || '0');
      const bIndex = parseInt(b.getAttribute('tabindex') || '0');
      if (aIndex === 0 && bIndex === 0) return 0;
      if (aIndex === 0) return 1;
      if (bIndex === 0) return -1;
      return aIndex - bIndex;
    });
};

// Update tab order visualization
const updateTabOrder = (emit) => {
  // Remove existing badges
  document.querySelectorAll('.keyboard-nav-badge').forEach(badge => badge.remove());
  
  const focusableElements = getFocusableElements();
  const tabOrderData = [];
  
  if (settings.showTabIndex) {
    focusableElements.forEach((element, index) => {
      createBadge(element, index);
      tabOrderData.push({
        index,
        element: getElementDescription(element),
        tabIndex: element.getAttribute('tabindex'),
      });
    });
  }
  
  emit(EVENTS.TAB_ORDER_UPDATED, { elements: tabOrderData });
};

// Update focus overlay
const updateOverlay = (element) => {
  if (!settings.showOverlay || !element) return;
  
  const overlay = document.getElementById('keyboard-nav-overlay');
  if (!overlay) return;
  
  const rect = element.getBoundingClientRect();
  overlay.style.display = 'block';
  overlay.style.top = `${window.scrollY + rect.top}px`;
  overlay.style.left = `${window.scrollX + rect.left}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
};

const withKeyboardNav = (Story) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const emit = useChannel({
    [EVENTS.TOGGLE_VISUALIZER]: ({ enabled }) => {
      setIsEnabled(enabled);
    },
    [EVENTS.UPDATE_SETTINGS]: (newSettings) => {
      settings = { ...settings, ...newSettings };
    },
  });

  useEffect(() => {
    if (isEnabled) {
      if (!document.getElementById('keyboard-nav-overlay')) {
        createOverlay();
      }
      updateTabOrder(emit);
    } else {
      document.getElementById('keyboard-nav-overlay')?.remove();
      document.querySelectorAll('.keyboard-nav-badge').forEach(badge => badge.remove());
    }
  }, [isEnabled, emit]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e) => {
      emit(EVENTS.KEY_PRESSED, {
        key: e.key,
        code: e.code,
        timestamp: Date.now(),
        target: getElementDescription(e.target),
      });
    };

    const handleFocus = (e) => {
      if (settings.highlightFocus) {
        updateOverlay(e.target);
      }
      
      emit(EVENTS.FOCUS_CHANGED, {
        element: getElementDescription(e.target),
        timestamp: Date.now(),
      });
    };

    const handleBlur = () => {
      const overlay = document.getElementById('keyboard-nav-overlay');
      if (overlay) overlay.style.display = 'none';
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    const observer = new MutationObserver(() => {
      if (isEnabled) {
        updateTabOrder(emit);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'disabled'],
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
      observer.disconnect();
    };
  }, [isEnabled, emit]);

  return Story();
};

export const decorators = [withKeyboardNav];
