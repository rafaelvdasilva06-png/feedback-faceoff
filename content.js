/* Feedback Face-Off content: people and moments (based on Nova SBE Communication eJournal 4). */
(function(){
const P = {
  marta:    { name: "Marta",    role: "Junior analyst",       tag: "The Anxious Newcomer",     col: "#cfe3f5", desc: "3 weeks in. Needs reassurance. Hates being criticised in public." },
  rui:      { name: "Rui",      role: "Senior technician",    tag: "The Defensive Expert",     col: "#e2dccf", desc: "15 years' experience. Wants respect. Hates being told how to do his job." },
  carolina: { name: "Carolina", role: "Operations lead, your peer", tag: "The Direct Driver", col: "#f3d6d1", desc: "Fast and results-focused. Wants you to get to the point." },
  leonor:   { name: "Leonor",   role: "Customer service lead", tag: "The Big-Picture Optimist", col: "#fbe9b4", desc: "Full of energy. Agrees quickly, then forgets the details." },
  diogo:    { name: "Diogo",    role: "Data analyst",         tag: "The Quiet Analyst",        col: "#d5e6dc", desc: "Logical and prepared. Hates being put on the spot." },
  ana:      { name: "Ana",      role: "Shift coordinator",    tag: "The People-Pleaser",       col: "#ead7ef", desc: "Kind, avoids conflict, finds it hard to say no." },
  tomas:    { name: "Tomás",    role: "Junior associate",     tag: "The Nervous Presenter",    col: "#dfe4ea", desc: "Capable, but loses confidence fast when something goes wrong." }
};

const MOMENTS = [
  { id: "m-timing", who: "marta", type: "mc", concept: "Criteria 1 & 2 · Timing + context",
    situ: "Her daily sales report has arrived two hours late for three days in a row. The morning meeting runs on old numbers.",
    q: "When do you give the feedback?",
    o: [
      { t: "Today, privately, before tomorrow's report.", p: 3 },
      { t: "Send a quick chat message right now.", p: 1 },
      { t: "Wait for her review next month.", p: 0 },
      { t: "Mention it in tomorrow's team meeting.", p: 0 }
    ],
    why: "Soon enough to stop it happening again, and at a moment she can really listen. Waiting a month lets the problem grow; a quick chat message gives her no support." },
  { id: "m-context", who: "rui", type: "mc", concept: "Criteria 1 & 2 · Timing + context",
    situ: "He skipped the safety checklist sign-off twice this week. Right now he's at the machines with three younger technicians.",
    q: "Where do you raise it?",
    o: [
      { t: "Ask him to step aside for two minutes, just the two of you.", p: 3 },
      { t: "Send him an email quoting the safety policy.", p: 1 },
      { t: "Right there, so the juniors learn from it too.", p: 0 },
      { t: "At next month's safety meeting, to everyone.", p: 0 }
    ],
    why: "Context includes who is present. Correcting an expert in front of juniors humiliates him and guarantees defensiveness. An email is private but feels bureaucratic." },
  { id: "m-sbi-carolina", who: "carolina", type: "fill", concept: "Criterion 3 · Descriptive (SBI)",
    situ: "She approved a big supplier order without checking stock. The warehouse is now full.",
    q: "Build your feedback. She likes it short and factual.",
    parts: ["", " ", ", so ", ". Can we add a stock check to approvals?"],
    blanks: [
      { label: "Situation", opts: ["On Monday's supplier order,", "Lately,", "As usual,"], ok: 0 },
      { label: "Behaviour", opts: ["it was approved without a stock check", "you were careless", "things got messy"], ok: 0 },
      { label: "Impact", opts: ["Thursday's delivery has nowhere to go", "it was a disaster", "everyone is annoyed with you"], ok: 0 }
    ],
    why: "Situation anchored in time, behaviour you could observe, impact on the task. 'Careless' and 'a disaster' are judgements, and judgements start arguments." },
  { id: "m-descriptive", who: "leonor", type: "mc", concept: "Criterion 3 · Descriptive",
    situ: "She promises customers a callback within the hour. Yesterday 40% of callbacks took over four hours, and two customers complained.",
    q: "Which sentence is descriptive feedback?",
    o: [
      { t: "\"Yesterday 40% of callbacks took over four hours, and two customers complained about the one-hour promise.\"", p: 3 },
      { t: "\"Callback times have been a bit slow recently.\"", p: 1 },
      { t: "\"You always over-promise to customers.\"", p: 0 },
      { t: "\"If this continues, you'll never be a good team lead.\"", p: 0 }
    ],
    why: "Concrete facts she can check, no labels. 'Always' is a generalisation, and 'you'll never be…' is exactly the destructive judgement the eJournal warns against." },
  { id: "m-rule2", who: "diogo", type: "mc", concept: "Rule 2 · Within their power to change",
    situ: "His data showed Tuesdays were overstaffed, but he stayed silent in the planning meeting and the team added a shift anyway.",
    q: "Which feedback is about something he can actually change?",
    o: [
      { t: "\"Could you share one key insight in each meeting? Send me the points beforehand and I'll bring you in.\"", p: 3 },
      { t: "\"Try to speak up more in meetings.\"", p: 1 },
      { t: "\"You need to be more extroverted.\"", p: 0 },
      { t: "\"You're just too shy for this role.\"", p: 0 }
    ],
    why: "Feedback must be about something within the person's power to change. He can't change his personality, but he can share one insight. 'Speak up more' is right but vague." },
  { id: "m-counter", who: "ana", type: "mc", concept: "Criterion 5 · Counter-feedback",
    situ: "You've just told her that accepting last-minute shift swaps left the weekend understaffed. She goes quiet and looks down.",
    q: "What do you do next?",
    o: [
      { t: "Ask: \"How do you see it? What makes it hard to say no?\" Then listen.", p: 3 },
      { t: "Say \"Don't worry, it's fine\" and end the meeting.", p: 1 },
      { t: "Repeat the point more firmly so it sinks in.", p: 0 },
      { t: "Add two more examples of the problem.", p: 0 }
    ],
    why: "Feedback only works if you let the other person explain their actions. Her answer will show you the real cause. Saying 'it's fine' is kind but cancels the message." },
  { id: "m-harbour", who: "tomas", type: "mc", concept: "Criterion 4 · Free silence (a safe harbour)",
    situ: "In a client presentation, Tomás clicks to the wrong slide, loses his place and freezes. The client is watching.",
    q: "What do you do in the moment?",
    o: [
      { t: "Quietly help him find the slide, nod to him and let him carry on.", p: 3 },
      { t: "Take over the rest of the presentation yourself.", p: 1 },
      { t: "Say nothing and let him work it out alone.", p: 0 },
      { t: "Point out the mistake to the client and apologise for him.", p: 0 }
    ],
    why: "Like the conductor with Maria João Pires: don't underline the failure, and don't leave a silence that kills confidence. Rescue him and give him back the stage." },
  { id: "m-recv-fill", who: "carolina", type: "fill", concept: "Receiving feedback · No defensiveness",
    situ: "After the ops call, she tells you: \"Your updates take way too long. Nobody knows what you need from us.\"",
    q: "Build your reply without getting defensive.",
    parts: ["", " ", " ", ""],
    blanks: [
      { label: "Open", opts: ["Thanks for telling me.", "I disagree, but okay.", "Well, actually…"], ok: 0 },
      { label: "Acknowledge", opts: ["You're right, I can be more direct.", "The topic is just complex.", "Others like the detail."], ok: 0 },
      { label: "Act", opts: ["Would headline plus the decision I need work on Thursday?", "Let's see how it goes.", "I'll think about it."], ok: 0 }
    ],
    why: "Thank, own your part, commit to a concrete change. Explaining why you were right is the defensive reflex that stops people giving you feedback." },
  { id: "m-recv-mc", who: "marta", type: "mc", concept: "Receiving feedback · No defensiveness",
    situ: "Yesterday you corrected her report in front of the team. Today she says, nervously: \"That made me feel really embarrassed.\"",
    q: "How do you respond?",
    o: [
      { t: "\"Thank you for telling me. You're right, I'll give that kind of feedback privately from now on.\"", p: 3 },
      { t: "\"I'm sorry you felt that way.\"", p: 1 },
      { t: "\"I was only trying to help you.\"", p: 0 },
      { t: "\"You'll need to get used to feedback here.\"", p: 0 }
    ],
    why: "Thank her, own it and change. 'Sorry you felt that way' puts the problem on her feelings, not your action." },
  { id: "m-sbi-ana", who: "ana", type: "fill", concept: "SBI model · Situation, Behaviour, Impact",
    situ: "She keeps approving last-minute shift swaps and covering the gaps herself.",
    q: "Build warm, specific feedback.",
    parts: ["", " ", ", so ", ". Can we agree a 48-hour rule together?"],
    blanks: [
      { label: "Situation", opts: ["The last two weekends,", "Recently,", "As always,"], ok: 0 },
      { label: "Behaviour", opts: ["swaps were approved with under a day's notice", "you couldn't say no", "you were too nice"], ok: 0 },
      { label: "Impact", opts: ["we were short-staffed and you worked six days straight", "it was a big problem", "everyone is tired of it"], ok: 0 }
    ],
    why: "Describe the behaviour, not her personality. 'Can't say no' labels her; 'swaps approved with under a day's notice' is something she can change." },
  { id: "m-destructive", who: "rui", type: "mc", concept: "Rule 1 · Constructive, not destructive",
    situ: "When you raise the skipped checklist, he snaps: \"I've done this job for 15 years.\"",
    q: "What's your reply?",
    o: [
      { t: "\"That's exactly why I want your view. What would make the checklist useful for you?\"", p: 3 },
      { t: "\"I understand, but rules are rules.\"", p: 1 },
      { t: "\"Experience doesn't matter here.\"", p: 0 },
      { t: "\"Fine, skip it if you're sure.\"", p: 0 }
    ],
    why: "Constructive means building him up while still fixing the problem. Dismissing his experience destroys trust, and giving in drops the feedback altogether." },
  { id: "m-inner", who: "leonor", type: "mc", concept: "Criterion 1 · Inner timing",
    situ: "You need to talk about callback promises, but she has just come off a call with a furious customer and is visibly upset.",
    q: "When do you talk to her?",
    o: [
      { t: "Give her a few minutes, then talk privately before her next shift.", p: 3 },
      { t: "Wait until next week, when things are calmer.", p: 1 },
      { t: "Right now, while it's fresh.", p: 0 },
      { t: "Email it so she can read it later.", p: 0 }
    ],
    why: "Timing includes the receiver's inner timing. Right now she can't hear it, but a week is too long. Soon, private and calm is best." }
];

// 4 fixed questions, one per criterion, always in this order:
// timing + context -> descriptive -> free silence -> counter-feedback.
// A rematch swaps in the alternate version of the first two so the room sees something new.
const SETS = [
  ["m-timing", "m-descriptive", "m-harbour", "m-counter"],
  ["m-context", "m-sbi-carolina", "m-harbour", "m-counter"]
];
function pick(lastIds){
  lastIds = lastIds || [];
  return (lastIds[0] === SETS[0][0] ? SETS[1] : SETS[0]).slice();
}
const byId = id => MOMENTS.find(m => m.id === id);
// base points: tap = 3/1/0 for the option; fill = 1 per correct blank
function base(m, a){
  if (a == null) return 0;
  if (m.type === "mc") return (m.o[a] || {}).p || 0;
  return (Array.isArray(a) ? a : []).reduce((s, v, i) => s + (v === m.blanks[i].ok ? 1 : 0), 0);
}
window.FF = { P, MOMENTS, pick, byId, base };
})();
