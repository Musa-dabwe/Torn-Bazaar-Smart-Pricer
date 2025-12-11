// ==UserScript==
// @name         Torn Bazaar Smart Pricer
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Auto-fill bazaar items with market-based pricing
// @author       Zedtrooper [3028329]
// @match        https://www.torn.com/bazaar.php*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      api.torn.com
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        defaultDiscount: GM_getValue('discountPercent', 1),
        priceFloorWarning: GM_getValue('priceFloorPercent', 50),
        apiKey: GM_getValue('tornApiKey', ''),
        lastPriceUpdate: GM_getValue('lastPriceUpdate', 0),
        priceCache: GM_getValue('priceCache', {}),
        cacheTimeout: 5 * 60 * 1000 // 5 minutes
    };

    // Save config
    function saveConfig() {
        GM_setValue('discountPercent', CONFIG.defaultDiscount);
        GM_setValue('priceFloorPercent', CONFIG.priceFloorWarning);
        GM_setValue('tornApiKey', CONFIG.apiKey);
        GM_setValue('lastPriceUpdate', CONFIG.lastPriceUpdate);
        GM_setValue('priceCache', CONFIG.priceCache);
    }

    // API Key prompt
    function showApiKeyPrompt() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        overlay.innerHTML = `
            <div style="background: #fff; padding: 30px; border-radius: 10px; max-width: 500px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <h2 style="margin-top: 0; color: #333;">Bazaar Quick Pricer Setup</h2>
                <p style="color: #666; line-height: 1.6;">
                    This script needs a <strong>Public API Key</strong> to fetch market
                    prices.<br><br>
                    To create one:<br>
                    1. Go to <a href="https://www.torn.com/preferences.php#tab=api" target="_blank" style="color: #2196F3;">Settings → API Key</a><br>
                    2. Create a new <strong>Public</strong> API key<br>
                    3. Copy and paste it below
                </p>
                <input type="text" id="apiKeyInput" placeholder="Enter your API key" style="width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button id="saveApiKey" style="flex: 1; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">Save</button>
                    <button id="cancelApiKey" style="flex: 1; padding: 10px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('saveApiKey').onclick = () => {
            const key = document.getElementById('apiKeyInput').value.trim();
            if (key && key.length === 16) {
                CONFIG.apiKey = key;
                saveConfig();
                overlay.remove();
                location.reload();
            } else {
                alert('Please enter a valid 16-character API key');
            }
        };

        document.getElementById('cancelApiKey').onclick = () => {
            overlay.remove();
        };
    }

    // Settings panel
    function showSettingsPanel() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        overlay.innerHTML = `
            <div style="background: #fff; padding: 30px; border-radius: 10px; max-width: 500px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <h2 style="margin-top: 0; color: #333;">Bazaar Quick Pricer Settings</h2>

                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 5px; color: #666; font-weight: bold;">Discount Percentage:</label>
                    <input type="number" id="discountInput" value="${CONFIG.defaultDiscount}" min="0" max="50" step="0.5" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                    <small style="color: #999;">Price items this % below market average</small>
                </div>

                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 5px; color: #666; font-weight: bold;">Price Floor Warning (%):</label>
                    <input type="number" id="priceFloorInput" value="${CONFIG.priceFloorWarning}" min="0" max="100" step="5" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                    <small style="color: #999;">Warn if listing below this % of market value</small>
                </div>

                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 5px; color: #666; font-weight: bold;">API Key:</label>
                    <input type="text" id="apiKeyUpdateInput" value="${CONFIG.apiKey}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
                </div>

                <div style="margin: 20px 0;">
                    <button id="clearCache" style="width: 100%; padding: 10px; background: #ff9800; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">Clear Price Cache</button>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button id="saveSettings" style="flex: 1; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">Save Settings</button>
                    <button id="cancelSettings" style="flex: 1; padding: 10px; background: #999; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('clearCache').onclick = () => {
            CONFIG.priceCache = {};
            CONFIG.lastPriceUpdate = 0;
            saveConfig();
            alert('Price cache cleared! Refresh the page.');
        };

        document.getElementById('saveSettings').onclick = () => {
            CONFIG.defaultDiscount = parseFloat(document.getElementById('discountInput').value);
            CONFIG.priceFloorWarning = parseFloat(document.getElementById('priceFloorInput').value);
            CONFIG.apiKey = document.getElementById('apiKeyUpdateInput').value.trim();
            saveConfig();
            overlay.remove();
            alert('Settings saved!');
        };

        document.getElementById('cancelSettings').onclick = () => {
            overlay.remove();
        };
    }

    // Extract item ID from image
    function getItemIdFromImage(image) {
        const numberPattern = /\/(\d+)\//;
        const match = image.src.match(numberPattern);
        if (match) {
            return parseInt(match[1], 10);
        }
        console.error('[BazaarQuickPricer] ItemId not found!');
        return null;
    }

    // Get quantity from item element - FIXED VERSION
    function getQuantity(itemElement) {
        // Look for the title-wrap which contains the item name and quantity
        const titleWrap = itemElement.querySelector('div.title-wrap');
        if (!titleWrap) {
            console.log('[BazaarQuickPricer] Title wrap not found');
            return 1;
        }

        // Get all text content
        const fullText = titleWrap.innerText || titleWrap.textContent;
        console.log('[BazaarQuickPricer] Parsing quantity from:', fullText);

        // Match patterns like "x19 Edelweiss" or "x1 Item Name"
        const match = fullText.match(/x(\d+)/i);
        if (match) {
            const quantity = parseInt(match[1], 10);
            console.log('[BazaarQuickPricer] Found quantity:', quantity);
            return quantity;
        }

        console.log('[BazaarQuickPricer] No quantity found, defaulting to 1');
        return 1;
    }

    // Get item value from page
    function getItemValueFromPage(itemElement) {
        // Look for the "Value: $X,XXX" text on the page
        const valueElements = itemElement.querySelectorAll('li');
        for (let li of valueElements) {
            const text = li.innerText || li.textContent;
            if (text.includes('Value:')) {
                // Extract number from "Value: $3,241"
                const match = text.match(/Value:\s*\$?([\d,]+)/i);
                if (match) {
                    const value = parseInt(match[1].replace(/,/g, ''), 10);
                    console.log('[BazaarQuickPricer] Found item value on page:', value);
                    return value;
                }
            }
        }
        return null;
    }

    // Fetch item data using Torn API to get market_value
    function fetchItemData(itemId, callback) {
        // Check cache first
        const now = Date.now();
        if (CONFIG.priceCache[itemId] && (now - CONFIG.lastPriceUpdate < CONFIG.cacheTimeout)) {
            console.log(`[BazaarQuickPricer] Using cached price for item ${itemId}`);
            callback(CONFIG.priceCache[itemId]);
            return;
        }

        // Use the torn API to get item information including market_value
        const itemUrl = `https://api.torn.com/torn/${itemId}?selections=items&key=${CONFIG.apiKey}&comment=BazaarQuickPricer`;
        GM_xmlhttpRequest({
            method: 'GET',
            url: itemUrl,
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);

                    if (data.error) {
                        console.error(`[BazaarQuickPricer] API Error for item ${itemId}:`, data.error);
                        if (data.error.code === 2) {
                            alert('Incorrect API Key! Please update it in settings.');
                            CONFIG.apiKey = null;
                            saveConfig();
                        }
                        callback(0);
                        return;
                    }

                    // Get the market_value from the items data
                    if (data.items && data.items[itemId]) {
                        const marketValue = data.items[itemId].market_value;
                        console.log(`[BazaarQuickPricer] Item ${itemId} market_value: $${marketValue.toLocaleString()}`);
                        CONFIG.priceCache[itemId] = marketValue;
                        CONFIG.lastPriceUpdate = now;
                        saveConfig();
                        callback(marketValue);
                        return;
                    }

                    callback(0);
                } catch (e) {
                    console.error(`[BazaarQuickPricer] Error parsing data for item ${itemId}:`, e);
                    callback(0);
                }
            },
            onerror: function() {
                console.error(`[BazaarQuickPricer] Failed to fetch data for item ${itemId}`);
                callback(0);
            }
        });
    }

    // Add Quick Price button to an item
    function addQuickPriceButton(itemElement) {
        // Check if already processed
        if (itemElement.querySelector('.quick-price-btn')) return;
        const nameWrap = itemElement.querySelector('div.title-wrap div.name-wrap');
        if (!nameWrap) return;

        const image = itemElement.querySelector('div.image-wrap img');
        if (!image) return;

        const itemId = getItemIdFromImage(image);
        if (!itemId) return;

        const amountDiv = itemElement.querySelector('div.amount-main-wrap');
        if (!amountDiv) return;

        const priceInputs = amountDiv.querySelectorAll('div.price div input');
        if (priceInputs.length === 0) return;

        // Create button
        const btnWrap = document.createElement('span');
        btnWrap.className = 'btn-wrap quick-price-btn';
        btnWrap.style.cssText = 'float: right; margin-left: auto;';

        const btnSpan = document.createElement('span');
        btnSpan.className = 'btn';
        const btnInput = document.createElement('input');
        btnInput.type = 'button';
        btnInput.value = '💰 Add';
        btnInput.className = 'torn-btn';
        btnInput.style.cssText = 'background: linear-gradient(to bottom, #5cb85c, #4cae4c); color: white; font-size: 11px;';

        btnSpan.appendChild(btnInput);
        btnWrap.appendChild(btnSpan);
        nameWrap.appendChild(btnWrap);
        // Add click handler
        $(btnWrap).on('click', 'input', function(event) {
            event.stopPropagation();

            btnInput.value = 'Loading...';
            btnInput.disabled = true;

            fetchItemData(itemId, (marketValue) => {
                btnInput.disabled = false;
                btnInput.value = '💰 Add';

                if (marketValue > 0) {
                    // Calculate discount amount: 1% of market value
                    const discountAmount = marketValue * (CONFIG.defaultDiscount / 100);
                    // Subtract discount from market value
                    const finalPrice = Math.round(marketValue - discountAmount);

                    console.log(`[BazaarQuickPricer] Item ${itemId}:`);
                    console.log(`  Market Value: $${marketValue.toLocaleString()}`);
                    console.log(`  Discount: ${CONFIG.defaultDiscount}% = $${discountAmount.toFixed(2)}`);
                    console.log(`  Final Price: $${finalPrice.toLocaleString()}`);
                    // Set price (without commas for the value, Torn will format it)
                    priceInputs[0].value = finalPrice;
                    priceInputs[1].value = finalPrice;

                    const inputEvent = new Event('input', { bubbles: true });
                    priceInputs[0].dispatchEvent(inputEvent);
                    // Set quantity
                    const isQuantityCheckbox = amountDiv.querySelector('div.amount.choice-container') !== null;
                    if (isQuantityCheckbox) {
                        // For guns/items with checkbox
                        const checkbox = amountDiv.querySelector('div.amount.choice-container input');
                        if (checkbox && !checkbox.checked) {
                            checkbox.click();
                        }
                        console.log('[BazaarQuickPricer] Clicked checkbox for max quantity');
                    } else {
                        // For regular items with quantity input
                        const quantityInput = amountDiv.querySelector('div.amount input');
                        if (quantityInput) {
                            const quantity = getQuantity(itemElement);
                            quantityInput.value = quantity;

                            // Dispatch multiple events to ensure Torn recognizes the change
                            const keyupEvent = new Event('keyup', { bubbles: true });
                            const changeEvent = new Event('change', { bubbles: true });
                            const inputEvt = new Event('input', { bubbles: true });

                            quantityInput.dispatchEvent(inputEvt);
                            quantityInput.dispatchEvent(keyupEvent);
                            quantityInput.dispatchEvent(changeEvent);

                            console.log(`[BazaarQuickPricer] Set quantity to ${quantity}`);
                        }
                    }

                    // Visual feedback
                    priceInputs[0].style.border = '2px solid #5cb85c';
                    priceInputs[0].style.background = '#f0fff0';
                    setTimeout(() => {
                        priceInputs[0].style.border = '';
                        priceInputs[0].style.background = '';
                    }, 1500);
                    console.log(`[BazaarQuickPricer] Successfully configured item ${itemId}`);
                } else {
                    alert(`Could not fetch market value for this item (ID: ${itemId})`);
                }
            });
        });
    }

    // Process all items on the page
    function processAllItems() {
        const items = $('ul.items-cont li.clearfix:not(.disabled)');
        console.log(`[BazaarQuickPricer] Found ${items.length} items to process`);

        items.each(function() {
            addQuickPriceButton(this);
        });
    }

    // Set up mutation observer
    function setupObserver() {
        const observerTarget = $('.content-wrapper')[0];
        if (!observerTarget) {
            console.log('[BazaarQuickPricer] Content wrapper not found, retrying...');
            setTimeout(setupObserver, 500);
            return;
        }

        const observer = new MutationObserver(function(mutations) {
            let shouldProcess = false;
            mutations.forEach(mutation => {
                if (mutation.target.classList.contains('items-cont') ||
                    mutation.target.className.indexOf('core-layout___') > -1 ||
                    mutation.target.classList.contains('ReactVirtualized__Grid__innerScrollContainer')) {
                    shouldProcess = true;
                }
            });

            if (shouldProcess) {
                setTimeout(processAllItems, 100);
            }
        });
        observer.observe(observerTarget, {
            attributes: false,
            childList: true,
            characterData: false,
            subtree: true
        });
        console.log('[BazaarQuickPricer] Observer set up successfully');
    }

    // Helper to wait for an element to appear
    function waitForElement(selector, callback, maxTries = 50) {
        let retries = 0;
        const check = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(check);
                callback(element);
            } else if (retries++ >= maxTries) {
                clearInterval(check);
                console.warn(`[BazaarQuickPricer] Element ${selector} not found after waiting.`);
                callback(null);
            }
        }, 100); // Check every 100ms
    }

    // Initialize
    function init() {
        if (!CONFIG.apiKey || CONFIG.apiKey === 'null') {
            showApiKeyPrompt();
            return;
        }

        console.log('[BazaarQuickPricer] Initialized');

        // --- NEW IMPLEMENTATION: Embed settings button ---
        // We use a fuzzy selector [class*="actions-root"] to find the container
        // even if the random characters at the end change.
        waitForElement('div[class*="actions-root"]', (targetContainer) => {
            if (targetContainer) {
                // Check if button already exists
                if (document.getElementById('bazaar-pricer-settings-btn')) return;

                // Create the new button element
                const settingsBtn = document.createElement('button');
                settingsBtn.id = 'bazaar-pricer-settings-btn';
                settingsBtn.type = 'button';
                settingsBtn.className = 'icon-wrap-root___TSzPY'; // Matches Torn style
                settingsBtn.setAttribute('data-title', 'Bazaar Quick Pricer Settings');
                settingsBtn.setAttribute('tabindex', '0');
                settingsBtn.setAttribute('aria-label', 'Bazaar Quick Pricer Settings');

                // Set the content as the ⚙️ icon
                settingsBtn.innerHTML = '<span class="icon" aria-hidden="true" style="font-size: 18px; line-height: 1; display: inline-block;">⚙️</span>';

                settingsBtn.onclick = showSettingsPanel;

                // Inject the button
                targetContainer.prepend(settingsBtn);
                console.log('[BazaarQuickPricer] Settings button embedded successfully.');
            } else {
                // Fallback: Floating button
                const fallbackSettingsBtn = document.createElement('button');
                fallbackSettingsBtn.textContent = '⚙️ Settings';
                fallbackSettingsBtn.style.cssText = `
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    padding: 10px 15px;
                    background: #2196F3;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    z-index: 9999;
                    font-size: 14px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    font-weight: bold;
                `;
                fallbackSettingsBtn.onclick = showSettingsPanel;
                document.body.appendChild(fallbackSettingsBtn);
                console.warn('[BazaarQuickPricer] Target container not found. Using fallback button.');
            }
        });

        // Process items and set up observer
        setTimeout(() => {
            processAllItems();
            setupObserver();
        }, 1000);
    }

    // Run on page load
    if (window.location.href.includes('bazaar.php')) {
        window.addEventListener('load', init);
    }

})();
