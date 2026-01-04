# Torn Bazaar Quick Pricer

**Author:** Zedtrooper [3028329]
**Current Version:** 2.8

This is a Tampermonkey userscript for the text-based RPG Torn. It streamlines the experience of running a Bazaar by automatically fetching market values via the Torn API. It allows you to price your items competitively with a single click, both when adding new stock and when managing existing listings.

### Main Changes in v2.8

1. **Manage Bazaar Integration**
The script now functions on the "Manage Bazaar" page. You can quickly reprice your existing listings to match current market rates without having to remove and re-add them.
2. **NPC Price Floor Protection**
The script automatically prevents pricing items below their NPC vendor sell price. This ensures you never lose potential profit by listing items on the bazaar for less than you could sell them to game vendors.
3. **Quick Fill Feature**
Added a "Quick Fill" button that automatically prices all items in the current view simultaneously.
4. **Tab-Aware Filling**
Quick Fill is now intelligent; it only processes items in the category tab you are currently viewing, preventing accidental bulk changes across your entire inventory.
5. **Simultaneous Processing**
All pricing operations now occur in parallel rather than sequentially, resulting in near-instant updates for bulk operations.
6. **Improved UI**
The interface has been redesigned with a unified "Settings" and "Quick Fill" area at the top of the page for better accessibility.
7. **Default Discount Adjustment**
Items now default to 0% discount (exact market value). This preference remains customizable in the settings.
8. **Gray Button Theme**
The interface buttons have been updated to a neutral gray scheme to blend seamlessly with Torn’s native UI.

### Key Features

The script places "Quick Add" (or "Update") buttons next to your items. Clicking these will fetch the current market value and auto-fill the price and quantity fields.

* **Smart Automation:** A "Quick Fill" button allows you to price or update every item in your current tab at once.
* **Protection:** Includes NPC price floor protection to prevent under-pricing.
* **Efficiency:** A smart caching system stores price data for 5 minutes to minimize API calls and speed up usage.
* **Compatibility:** Fully optimized for desktop and the Torn PDA mobile interface, with automatic dark and light mode detection.

### How to Use

1. **Installation:** Install the script and enter your Torn Public API key when prompted on the first run.
2. **Adding Items:** Navigate to the "Add Items" page in your Bazaar. Click the button next to a single item, or use the Quick Fill button to price all items in the current category tab.
3. **Managing Inventory:** Navigate to the "Manage Bazaar" page. You can use the same features to update the prices of currently listed items to ensure they remain competitive.
4. **Customization:** Click the Settings button to adjust your discount percentage. You can set a positive percentage to undercut the market, or a negative percentage to price above the market.

### Requirements

* A Torn Public API key (generated in your Torn preferences under the API tab).
* Tampermonkey or a compatible userscript manager like, Torn PDA on android.
