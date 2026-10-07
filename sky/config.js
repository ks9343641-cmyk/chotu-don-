/* ==========================================================
   CONFIG: personalize karne ke liye SIRF yahi file badalni hai
   Text "quotes" ke andar likho. Quotes aur commas mat hatana.
   ========================================================== */

const CONFIG = {

  /* ---------- Uska naam ---------- */
  name: "Mehak",

  /* ---------- Colors ---------- */
  colors: {
    background: "#05060a",
    accent: "#b9a7ff"
  },

  /* ---------- 1. Opening ---------- */
  opening: {
    line1: "For the days when your mind gets a little too loud.",
    line2: "Take a breath. I made you something.",
    button: "ENTER"
  },

  /* ---------- 3. "How heavy does today feel?" ----------
     Slider 0-100. Jis range mein value aaye, wo text dikhega. */
  slider: {
    question: "How heavy does today feel?",
    texts: [
      { upTo: 25,  text: "Okay. A lighter day. Let it stay that way for as long as it can." },
      { upTo: 50,  text: "Somewhere in the middle. That's allowed too." },
      { upTo: 75,  text: "That's a lot to carry. You don't have to carry it fast." },
      { upTo: 100, text: "Then today is heavy. You don't have to fix it. Just stay a while." }
    ]
  },

  /* ==========================================================
     4. THINGS YOU FORGOT: floating cards
     Yahan apne personal messages daalo.
     Har card: title (bahar dikhega), message (click pe khulega)
     Naya card chahiye to ek { } block copy karke neeche paste karo.
     ========================================================== */
  cards: [
    {
      title: "You are allowed to rest.",
      message: "Thakna kamzori nahi hai. Jo itna sab sambhal raha ho, use rukne ka poora haq hai."
    },
    {
      title: "Not everything tonight.",
      message: "Saari problems aaj raat solve karni zaroori nahi. Kal ka din bhi hai, aur wo tujhse alag se nipat lega."
    },
    {
      title: "Hard day ≠ bad you.",
      message: "Kuch din bas mushkil hote hain. Iska matlab ye nahi ki tu kuch galat kar rahi hai."
    },
    {
      title: "You matter more than you think.",
      message: "Tujhe pata bhi nahi hoga ki kuch logon ke din tere hone se thode better hote hain. Main bhi unmein se ek hoon."
    },
    {
      title: "Personal one (edit me)",
      message: "👉 YAHAN apna ek inside joke ya sachchi baat likh. Ye card sabse zaroori hai."
    }
  ],

  /* ==========================================================
     7. MEMORIES: gallery
     image: photo ka path (sky/photos/ folder mein rakho)
     Photo nahi hai to image: "" chhod do, placeholder dikhega.
     ========================================================== */
  memories: [
    {
      image: "sky/photos/1.jpg",
      title: "Memory title 1",
      date: "Date likh (jaise: March 2025)",
      description: "Yahan us din ki baat likh, kya hua tha, kya funny tha."
    },
    {
      image: "sky/photos/2.jpg",
      title: "Memory title 2",
      date: "Date",
      description: "Description"
    },
    {
      image: "sky/photos/3.jpg",
      title: "Memory title 3",
      date: "Date",
      description: "Description"
    }
  ],

  /* ---------- 8. Quiet mode ---------- */
  quiet: {
    line1: "Don't think about tomorrow.",
    line2: "Just stay here for a minute.",
    inhale: "INHALE",
    exhale: "EXHALE",
    sessionSeconds: 60
  }
};
