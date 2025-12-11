# Torn Bazaar Smart Pricer

**Author:** Zedtrooper [3028329]  
**Current Version:** 1.8

A Tampermonkey userscript for the text-based RPG [Torn](https://www.torn.com) that streamlines the process of adding items to your Bazaar. It automatically fetches current market values via the Torn API and prices your items competitively with a single click.

## 🚀 Features

* **[span_0](start_span)One-Click Pricing:** Adds a "💰 Add" button to every item in your Bazaar "Manage" page[span_0](end_span).
* **[span_1](start_span)Live Market Data:** Fetches the real-time market value for items using the official Torn API[span_1](end_span).
* **[span_2](start_span)Smart Auto-Fill:** Automatically fills both the price and the maximum available quantity for the item[span_2](end_span).
* **[span_3](start_span)Customizable Discounts:** Set a default percentage to undercut the market average (e.g., list at 1% below market value)[span_3](end_span).
* **[span_4](start_span)Safety Guards:** Includes a "Price Floor Warning" to alert you if an item is being listed dangerously low compared to market value[span_4](end_span).
* **[span_5](start_span)API Caching:** Caches price data for 5 minutes to minimize API calls and speed up usage[span_5](end_span).

## 🛠️ Installation

1.  **Install a Userscript Manager:**
    * [Tampermonkey](https://www.tampermonkey.net/) (Recommended for Chrome/Edge/Firefox)
    * [Violentmonkey](https://violentmonkey.top/)
2.  **Install the Script:**
    * Click the `install` link (if hosted on GreasyFork) or create a new script in your manager and paste the code from `script.js`.
3.  **Reload Torn:**
    * Refresh your Torn Bazaar page to initialize the script.

## ⚙️ Configuration

Upon first use, the script will ask for your **Public API Key**.

1.  **Get your Key:** Go to [Torn Settings -> API Key](https://www.torn.com/preferences.php#tab=api).
2.  **Create Key:** Generate a **Public** key.
3.  **[span_6](start_span)Enter Key:** Paste it into the prompt when the script loads[span_6](end_span).

### Changing Settings
You can adjust your pricing strategy at any time:
* [span_7](start_span)Look for the **⚙️ (Gear Icon)** located next to your Bazaar title[span_7](end_span).
* **[span_8](start_span)Discount Percentage:** Set how much to undercut the market (default is 1%)[span_8](end_span).
* **[span_9](start_span)Price Floor:** Set a warning threshold percentage[span_9](end_span).
* **[span_10](start_span)Clear Cache:** Force the script to re-fetch fresh prices[span_10](end_span).

## 📖 How to Use

1.  Navigate to your **Bazaar** in Torn.
2.  Click on **"Manage Items"**.
3.  [span_11](start_span)You will see a green **💰 Add** button appear next to your items[span_11](end_span).
4.  Click the button:
    * The script fetches the current market value.
    * It calculates your price (Market Value - Discount).
    * [span_12](start_span)It fills the price input and maxes out the quantity[span_12](end_span).
5.  [span_13](start_span)The price box will flash **green** to confirm the value has been set[span_13](end_span).

## ⚠️ Disclaimer

* **Use at your own risk.** While this script uses public API data and does not automate actions (you still have to click "Add" for each item), always adhere to Torn's scripting rules.
* This script is not affiliated with or endorsed by Torn.

---
*Created by Zedtrooper [3028329]*
