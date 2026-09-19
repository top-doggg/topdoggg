// src/content/works.js
// TRST Studios / DE.LA.COSTA work archive.
// Source: archiveData.js (migrated). Preserve all IDs, URLs, and field shape.
// Do not invent works, titles, or statements.

export const works = [
  {
    id: "west-of-the-tracks",
    series: "West of the Tracks",
    title: "Coming Back Home",
    year: "2025",
    medium: "Photography / field note",
    location: "Southern California",
    image: "/instagram/coming-back-home.jpg",
    copy: "A continuing visual archive of community, memory, belonging, and the everyday life that carries a place forward.",
    statement: "West of the Tracks holds photographs, field notes, and moving images made close to home. The work treats the neighborhood as a living record, not a backdrop: a place made of people, gestures, weather, rituals, loss, humor, and return.",
    inquirySubject: "West of the Tracks inquiry",
  },
  {
    id: "cheos-world",
    series: "Haloed Youth",
    title: "Cheo's World",
    year: "2025",
    medium: "Illustration / tribute",
    location: "Southern California",
    image: "/instagram/cheos-world.jpg",
    copy: "Neighborhood identity, friendship, innocence, and memory held inside a lived visual world.",
    statement: "Cheo's World holds friendship, neighborhood language, and memory inside an illustrated world. The work is retained as part of the archive and is available for artwork, print, licensing, or exhibition conversations through the studio.",
    inquirySubject: "Cheo's World inquiry",
  },
  {
    id: "old-town-boogie",
    series: "Civic Memory",
    title: "Old Town Boogie",
    year: "2025",
    medium: "Public work / photography",
    location: "San Juan Capistrano",
    image: "/instagram/old-town-boogie.jpg",
    copy: "Live printing, music, painting, and a public response shaped in the presence of community.",
    statement: "Old Town Boogie records a public moment built through live printing, music, painting, and the people who showed up. It frames culture as something made with a place, not simply presented to it.",
    inquirySubject: "Old Town Boogie inquiry",
  },
  {
    id: "what-we-carry",
    series: "What We Carry",
    title: "Black and White",
    year: "2025",
    medium: "Photography",
    location: "Southern California",
    image: "/instagram/black-and-white.jpg",
    copy: "Community memory, protection, and the emotional weight held inside ordinary moments.",
    statement: "What We Carry looks at the emotional information held inside everyday images: care, protection, distance, history, and the way people keep each other visible.",
    inquirySubject: "What We Carry inquiry",
  },
  {
    id: "ancestral-continuum",
    series: "Ancestral Continuum",
    title: "The Value of Everything",
    year: "2025",
    medium: "Image / reflection",
    location: "Southern California",
    image: "/instagram/value-of-everything.jpg",
    copy: "A reflection on uncertainty, inheritance, and the value that appears when certainty gives way.",
    statement: "Ancestral Continuum moves through symbols, memory, and reflection. It asks how inherited knowledge can stay active in an image without turning culture into decoration.",
    inquirySubject: "Ancestral Continuum inquiry",
  },
  {
    id: "street-notes",
    series: "Street Notes",
    title: "Game Recognizes Game",
    year: "2025",
    medium: "Photography / street note",
    location: "Southern California",
    image: "/instagram/game-recognizes-game.jpg",
    copy: "Recognition, respect, and the codes people read without explanation.",
    statement: "Street Notes gathers compact images and phrases that hold the energy of recognition, language, and lived exchange. They are not filler between larger projects; they are part of the record.",
    inquirySubject: "Street Notes inquiry",
  },
];

export function workById(id) {
  return works.find((work) => work.id === id);
}
