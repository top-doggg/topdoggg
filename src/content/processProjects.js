const image = (file, label, alt = label) => ({ src: `/portfolio/${file}.webp`, label, alt });

export const processProjects = [
  {
    id: "register-to-vote", title: "Register to Vote", discipline: "Design / application",
    summary: "A swallow, the mission, and a message for San Juan Capistrano. Lettering and local imagery move from a pencil study into a color graphic and apparel mockup.",
    cover: image("vote-artwork", "Color artwork", "Blue and yellow Register to Vote artwork with a swallow and San Juan Capistrano mission"),
    stages: [image("vote-sketch", "01 / Pencil study"), image("vote-artwork", "02 / Color artwork"), image("vote-mockup", "03 / Apparel mockup")],
  },
  {
    id: "never-alone", title: "Never Alone", discipline: "Illustration / lettering",
    summary: "A group held together by a shared gesture. The pencil and resolved black-and-cream versions show changes in line, weight, and lettering.",
    cover: image("never-alone-artwork", "Resolved illustration", "Five figures with arms around each other above Never Alone lettering"),
    stages: [image("never-alone-sketch", "01 / Pencil study"), image("never-alone-artwork", "02 / Resolved illustration")],
  },
  {
    id: "blue-studies", title: "Studies in Blue", discipline: "Composition / color studies",
    summary: "Faces, geometry, and ornamental forms connected by a blue-and-cream palette. Composition studies, alternate treatments, and a canvas photograph are presented as distinct pieces.",
    cover: image("blue-composition", "Geometric composition", "Blue and cream geometric composition with eyes and interlocking forms"),
    stages: [image("blue-wide", "Wide composition study"), image("blue-variations", "Alternate color and composition treatments"), image("blue-composition", "Blue composition"), image("blue-portrait", "Portrait study"), image("blue-canvas", "Canvas photograph")],
  },
  {
    id: "neighborhood-stories", title: "Neighborhood Stories", discipline: "Illustration / visual storytelling",
    summary: "Street scenes, characters, lettering, and familiar symbols. Photographic settings and illustrated worlds offer different ways of picturing place.",
    cover: image("neighborhood-scene", "Neighborhood scene", "Illustrated paleta vendor and neighborhood characters against a black-and-white street photograph"),
    stages: [image("neighborhood-scene", "Illustration in a photographic setting"), image("street-poster", "TRST poster study"), image("capistrano-poster", "San Juan Capistrano variation"), image("trst-illustration", "TRST illustrated composition"), image("delacosta-graphic", "DE.LA.COSTA graphic"), image("street-character", "Character illustration")],
  },
  {
    id: "ornament-and-expression", title: "Ornament & Expression", discipline: "Drawing / graphic studies",
    summary: "Expressive faces, cloud forms, and ornamental linework. Related drawings sit alongside line and color treatments without flattening their differences.",
    cover: image("mask-blue", "Blue graphic study", "Blue ornamental graphic with expressive faces on a dark background"),
    stages: [image("mask-sketch", "Pencil study / stacked faces"), image("mask-linework", "Black-and-white line treatment"), image("mask-blue", "Blue color treatment"), image("mask-drawing", "Pencil study / ornamental faces"), image("mask-study", "Alternate drawing"), image("warrior-linework", "Related ornamental linework")],
  },
  {
    id: "field-notes", title: "Field Notes", discipline: "Photography / editorial layouts",
    summary: "Portraits, family, music, and everyday places arranged as photographic spreads. The supplied layouts retain their original image relationships and text.",
    cover: image("photo-layout-3", "Photographic layout", "Editorial layout combining photographs of musicians with a neighborhood illustration"),
    stages: [image("photo-archive", "Archive composition"), ...Array.from({ length: 7 }, (_, i) => image(`photo-layout-${i + 1}`, `Photographic layout / ${String(i + 1).padStart(2, "0")}`))],
  },
];
