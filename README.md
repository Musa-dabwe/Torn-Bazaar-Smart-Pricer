# Torn Bazaar Smart Pricer

Author: Zedtrooper [3028329]
Current Version: 2.4

A Tampermonkey and Torn PDA userscript for the text-based RPG Torn that streamlines the process of adding items to your Bazaar. It automatically fetches current market values via the Torn API and prices your items competitively with a single click.

Main Changes:

@run-at timing adjusted - Changed to document-end to improve compatibility with PDA (Progressive Web App or similar)

Increased wait time - Extended delays to 2000ms (2 seconds) to allow more time for PDA's rendering processes

Enhanced retry mechanism - Implemented more aggressive retry logic with 20 attempts occurring every 500ms to ensure successful execution

Dark mode improvements - Simplified styling approach specifically for PDA's dark mode

Enhanced debugging - Added better console logging capabilities to help troubleshoot issues

jQuery removed - Completely eliminated jQuery dependency, likely moving to vanilla JavaScript

Safety check added - Added fallback handling if the DOMContentLoaded event has already fired.
