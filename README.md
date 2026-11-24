# Feedback Face-Off

A live, 3D room game for the Nova SBE Communication group presentation on feedback (eJournal 4, "The Power of Stories & Feedback").

- **Projector:** open `host.html`, click **Open the lobby**. A QR code and game code appear, and the screen counts players as they join.
- **Phones:** scan the QR code (or open the site and type the 4-letter code), pick a name. No app, no account.
- **3D office:** the projector walks you into the Lisbon office of Tejo & Partners (a fictional firm). Before each question a colleague walks up, speaks their line (browser text-to-speech, with subtitles) and, after the reveal, reacts to what most of the room chose.
- **5 moments:** each with a colleague who has a distinct personality. 3 tap questions (best answer 300 pts, partly right 100) and 2 sentence builders (100 pts per correct word choice). Faster correct answers earn up to 50% extra.
- **Podium** at the end, with drumroll, fanfare and confetti.

Concepts covered: the two rules (constructive; within the person's power to change), the five criteria (timing, context, descriptive, a safe harbour, counter-feedback), the SBI model (© Center for Creative Leadership) and receiving feedback without becoming defensive.

No 3D on an old laptop? Open `host.html?lite` for the flat version.

Rehearse alone: on the lobby screen click **Add 5 test players**, or open `host.html?mock` and `index.html?mock&p=1#CODE` in tabs of one browser.

Live sync uses the same free Firebase Realtime Database as Altitude (`config.js`). All people and situations are fictional.

Bundles three.js r170 (MIT licence) in `vendor/`.
