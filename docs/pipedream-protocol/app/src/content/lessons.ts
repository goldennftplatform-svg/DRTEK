import type { CohortId } from '../engine/state';

export interface QuizOption {
  text: string;
  correct: boolean;
}
export interface Lesson {
  id: number;
  name: string;
  // Teach copy per cohort (GDD 3).
  teach: Record<CohortId, string>;
  quiz: { q: string; opts: QuizOption[] };
}

// Scaffold lessons. Extend this array to build the full 10-level GDD campaign
// (L2 cookies, L3 metadata, L4 immune/phish, L5 networks, L6 finance, ...).
export const LESSONS: Lesson[] = [
  {
    id: 1,
    name: 'Email',
    teach: {
      t: "Your email is a bucket that travels the network. Send one - I'll show you.",
      y: 'Email = a water bucket leaving your phone. Send your first.',
      p: 'Email is your passport online. Set up a first account.',
      m: 'Sending email is like sending a little bucket of water through pipes. Try it.'
    },
    quiz: {
      q: 'When you send an email, what actually leaves your phone?',
      opts: [
        { text: 'A water bucket that travels the network', correct: true },
        { text: 'Nothing at all', correct: false },
        { text: 'Only the words, never your address', correct: false }
      ]
    }
  },
  {
    id: 2,
    name: 'Cookies',
    teach: {
      t: "Sites ask for cookies. 'Accept all' lets them follow you. Say no when you can.",
      y: 'Cookies = crumbs that track you. Essential-only keeps you clean.',
      p: "Cookie banners: pick 'Essential only' to limit sharing.",
      m: 'A cookie is a small note a site leaves. Too many lets shops follow you. Pick fewer.'
    },
    quiz: {
      q: "What does 'Accept All' on a cookie banner usually allow?",
      opts: [
        { text: 'Sites to track you across the web', correct: true },
        { text: 'Makes your phone faster', correct: false },
        { text: 'Nothing changes', correct: false }
      ]
    }
  },
  {
    id: 3,
    name: 'Passwords',
    teach: {
      t: 'A long passphrase is like a weird sentence. Hard to guess, easy to remember.',
      y: 'Length beats symbols. Four random words > "P@ssw0rd".',
      p: 'Use a long passphrase; length dominates strength.',
      m: 'A long string of words is easy for you and hard for thieves. Pick four words.'
    },
    quiz: {
      q: 'Why is a long passphrase safer than a short complex one?',
      opts: [
        { text: 'It has far more possible combinations', correct: true },
        { text: 'Shorter passwords are always fine', correct: false },
        { text: 'Only symbols matter', correct: false }
      ]
    }
  },
  {
    id: 4,
    name: 'Phishing',
    teach: {
      t: "Some messages are wolves in sheep clothes. A 'bank' text that rushes you? Slow down and check who really sent it.",
      y: 'Phishing = a fake that looks real. Check the sender and the domain before you tap.',
      p: "Phishing tries to rush you. Pause and verify the real source before acting.",
      m: 'Scammers mimic banks and friends. Look closely at who truly sent it.'
    },
    quiz: {
      q: "A message says 'Your bank: secure your account now' with a link to bnk-secure.xyz. What is safest?",
      opts: [
        { text: 'Open the official app/site yourself to check', correct: true },
        { text: 'Click the link and log in fast', correct: false },
        { text: 'Reply with your password to prove it is you', correct: false },
        { text: 'Forward it to friends so they know', correct: false }
      ]
    }
  },
  {
    id: 5,
    name: 'Encryption',
    teach: {
      t: "HTTPS locks your pipe so nobody else can read the water inside. Look for the lock icon.",
      y: "HTTPS = the padlock on the pipe. If the lock is missing, anyone can read your data.",
      p: "HTTPS encrypts data in transit. Check for the lock icon before entering anything sensitive.",
      m: "A secure connection (HTTPS) locks the pipe. Without it, others can read what you send."
    },
    quiz: {
      q: 'What does HTTPS actually protect against?',
      opts: [
        { text: 'Others reading your data as it travels the network', correct: true },
        { text: 'Websites remembering your password', correct: false },
        { text: 'Making your internet faster', correct: false },
        { text: 'Stopping all viruses automatically', correct: false }
      ]
    }
  },
  {
    id: 6,
    name: 'Privacy',
    teach: {
      t: "Privacy is choosing who sees what. Default settings often share everything - lock it down.",
      y: "Default privacy settings share everything. Check who can see your posts and profile.",
      p: "Review your privacy settings. Limit who sees your posts, location, and contacts.",
      m: "Privacy means deciding who sees your information. Take a moment to lock down your settings."
    },
    quiz: {
      q: 'Why should you check your social media privacy settings?',
      opts: [
        { text: 'To control who sees your posts and personal info', correct: true },
        { text: 'To make your posts reach more people', correct: false },
        { text: 'It does not matter - everything is already public', correct: false },
        { text: 'Only if you are famous', correct: false }
      ]
    }
  },
  {
    id: 7,
    name: 'Metadata',
    teach: {
      t: "Every photo you take carries hidden info - when, where, and what device. That is metadata.",
      y: "Metadata = invisible data attached to your files. Photos carry your location and device info.",
      p: "Files carry metadata: timestamps, locations, device names. Strip it before sharing.",
      m: "Behind every file is hidden information about you - when it was made and where. That is metadata."
    },
    quiz: {
      q: 'What information can metadata in a photo reveal?',
      opts: [
        { text: 'The location it was taken and the device used', correct: true },
        { text: 'Nothing - photos are just images', correct: false },
        { text: 'Only the file size', correct: false },
        { text: 'Only the colors in the image', correct: false }
      ]
    }
  },
  {
    id: 8,
    name: 'Digital Footprint',
    teach: {
      t: "Everything you post leaves a trail. Even deleted posts can still exist on servers.",
      y: "What you post online can outlast you. Screenshots, archives, caches - it all lingers.",
      p: "Your digital footprint is permanent. Think before you post - it may never truly go away.",
      m: "Posts and messages can stay around even after you delete them. That trail is your footprint."
    },
    quiz: {
      q: 'What happens to a photo you delete from social media?',
      opts: [
        { text: 'It may still exist on servers or in other people\'s devices', correct: true },
        { text: 'It is immediately destroyed everywhere', correct: false },
        { text: 'Only your phone deletes it', correct: false },
        { text: 'Nothing was ever stored', correct: false }
      ]
    }
  },
  {
    id: 9,
    name: 'Two-Factor Auth',
    teach: {
      t: "Your password is one lock. Two-factor auth adds a second - like a code on your phone.",
      y: "2FA = your password plus a phone code. Even if they steal your password, they cannot get in.",
      p: "Two-factor authentication adds a second gate. Enable it on every account that offers it.",
      m: "A second code on your phone is a second lock. Thieves with your password still cannot pass."
    },
    quiz: {
      q: 'What does two-factor authentication actually add?',
      opts: [
        { text: 'A second verification step beyond your password', correct: true },
        { text: 'A longer password automatically', correct: false },
        { text: 'A way to share your password safely', correct: false },
        { text: 'It replaces your password entirely', correct: false }
      ]
    }
  },
  {
    id: 10,
    name: 'Safe Browsing',
    teach: {
      t: "Before you trust a site: look for the lock, check the URL, and think if it feels right.",
      y: "Trust is earned. A legit site has HTTPS, a clean URL, and does not rush you with pop-ups.",
      p: "Verify a site before entering info: HTTPS lock, correct URL, no suspicious pop-ups.",
      m: "A trustworthy site shows a lock and uses a clear address. If it feels off, step back."
    },
    quiz: {
      q: 'Which of these is most likely a safe website?',
      opts: [
        { text: 'https://bank.com/login', correct: true },
        { text: 'http://bank-login.xyz/secure', correct: false },
        { text: 'http://192.168.1.1/bank', correct: false },
        { text: 'http://b4nk.com/log-in.html', correct: false }
      ]
    }
  }
];
