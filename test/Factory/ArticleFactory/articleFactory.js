module.exports.validArticle = function () {
  return {
    _id: ObjectId("58c99bb16d823c6d2490ba89"),
    name: "This is valid",
    price: 0,
    ref: "Dit is een referentie",
    description: "Dit is een beschrijving"
  }
}

module.exports.validArticlesIds = function() {
  return [
    "58c99bb16d823c6d2490ba8c",
    "58c99bb16d823c6d2490ba8a",
    "58c99bb16d823c6d2490ba8d",
    "58c99bb16d823c6d2490ba8e",
    "58c9a126b00adf42707fdda1",
    "58c9a0f0ec91cf35d82e397b"
  ]
}

module.exports.validArticles = function() {
  return [
    {
      _id: ObjectId("58c99bb16d823c6d2490ba8c"),
      name: "First article",
      price: 50,
      ref: "Dit is een referentie",
      description: "Dit is een beschrijving"
    } , {
      _id: ObjectId("58c99bb16d823c6d2490ba8a"),
      name: "Second article",
      price: 100,
      ref: "Dit is een referentie",
      description: "Dit is een beschrijving"
    } , {
      _id: ObjectId("58c99bb16d823c6d2490ba8d"),
      name: "Third article",
      price: 30,
      ref: "Dit is een referentie",
      description: "Dit is een beschrijving"
    } , {
      _id: ObjectId("58c99bb16d823c6d2490ba8e"),
      name: "Fourth article",
      price: 50,
      ref: "Dit is een referentie",
      description: "Dit is een beschrijving"
    } , {
      _id: ObjectId("58c9a126b00adf42707fdda1"),
      name: "Fifth article",
      price: 65,
      ref: "Dit is een referentie",
      description: "Dit is een beschrijving"
    } , {
      _id: ObjectId("58c9a0f0ec91cf35d82e397b"),
      name: "Sixth article",
      price: 32165,
      ref: "Dit is een referentie",
      description: "Dit is een beschrijving"
    }
  ]
}
