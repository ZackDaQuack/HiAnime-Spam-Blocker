// ==UserScript==
// @name         HiAnime Spam Blocker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Hides the annoying porn promo / rule34 / discord spam in comments
// @author       ZackDaQuack
// @match        https://hianime.to/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  // These catch most of the spam
  const spamPatterns = [
    // Core sex/porn terms + obfuscations
    /sex/i,
    /s[\u200b\u00ad.-]*ex/i,
    /s e x/i,
    /nude/i,
    /n[\u200b\u00ad.-]*ude/i,
    /n u d e/i,
    /porn/i,
    /p[\u200b\u00ad.-]*orn/i,
    /horny/i,
    /cum/i,
    /cock/i,
    /pussy/i,
    /dick/i,
    /fuck/i,
    /blowjob/i,

    // Promo phrases
    /my (nudes|photos|contact|link|page|profile)/i,
    /send nudes/i,
    /nudes here/i,
    /free nudes/i,
    /onlyfans/i,
    /of link/i,
    /sub.*onlyfans/i,
    /hot girls?/i,
    /hot singles/i,
    /meet girls/i,
    /join (my|our) (server|group|discord)/i,
    /discord\.gg/i,
    /discord me/i,
    /dc.*gg/i,
    /rule34/i,
    /r34/i,
    /hentai/i,
    /hen-?tai/i,

    // Shorteners & spam domains
    /hot1\.top/i,
    /acort\.me/i,
    /scrollx\.org/i,
    /scr-?ollx/i,
    /bit\.ly/i,
    /tinyurl\.com/i,
    /goo\.gl/i,
    /t\.co/i,
    /\.(top|fun|live|xyz|club|site|online|pro|cc|me|link)\/?$/i, // suspicious TLDs

    // Emoji spam
    /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]{4,}/gu,
    /👉|👈|💦|🔞|🍆|🍑|😈|😏|🥵|🫦|🤑|💯|🚨|📸|🔗|▶️|⏩/g,

    // Other junk
    /no ads/i,
    /ad-?free/i,
    /view (full|video|here)/i,
    /tiktok for/i,
    /snapchat/i,
    /insta.*dm/i,
    /contact me/i,
    /dm me/i,
    /add me/i,
  ];

  // Checks if text looks like spam (username or message body)
  function isSpam(text) {
    if (!text) return false;

    // Normalize: remove zero-width junk + soft hyphens for cleaner matching
    const normalized = text
      .toLowerCase()
      .replace(/[\u200b\u200c\u200d\u00ad]/g, "");

    // Check if text is in the patterns
    if (spamPatterns.some((p) => p.test(normalized))) return true;

    // Detect soft hyphens
    const softHyphens = (text.match(/\u00ad/g) || []).length;
    if (softHyphens >= 3) return true;

    // Check if there are more than 4 emojis
    const emojiCount = (
      normalized.match(
        /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ) || []
    ).length;
    if (emojiCount >= 4) return true;

    // Short + contains link-like stuff
    if (
      text.length < 60 &&
      /[./@]/.test(text) &&
      (text.includes("me/") || text.includes(".top") || text.includes(".org"))
    ) {
      return true;
    }

    return false;
  }

  // Finds and hides spam comment blocks
  function hideSpam() {
    // All individual comments live in .cw_l-line
    const commentBlocks = document.querySelectorAll(".list-comment .cw_l-line");

    commentBlocks.forEach((block) => {
      // Grab username and actual comment text
      const usernameEl = block.querySelector(".user-name");
      const username = usernameEl ? usernameEl.textContent.trim() : "";

      const bodyEl = block.querySelector(".ibody p");
      const body = bodyEl ? bodyEl.textContent.trim() : "";

      // If either part looks spammy, hide the whole comment
      if (isSpam(username) || isSpam(body)) {
        block.style.display = "none";
      }
    });
  }

  // Run once page is ready
  document.addEventListener("DOMContentLoaded", hideSpam);

  // Watch for new comments being loaded
  const observer = new MutationObserver((mutations) => {
    // Only recheck if something was actually added
    if (mutations.some((m) => m.addedNodes.length > 0)) {
      hideSpam();
    }
  });

  // Target the comments section if we can find it, otherwise whole body
  const target = document.querySelector("#content-comments") || document.body;
  observer.observe(target, { childList: true, subtree: true });
})();
