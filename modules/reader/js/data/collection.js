// Coleção inicial de frases
const READER_COLLECTION = {

  cards: [
    {
      id: 1,
      category: "Comida",
      tags: ["Casa", "Rotina"],
      image: "https://cdn-icons-png.flaticon.com/512/824/824239.png",
      frontText: "Eu bebo água gelada",
      backText: "Eu bebo água gelada"
    },
    {
      id: 2,
      category: "Ações",
      tags: ["Casa", "Escola"],
      image: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
      frontText: "Eu gosto de comer xis",
      backText: "Eu gosto de comer xis"
    },
    {
      id: 3,
      category: "Lugares",
      tags: ["Casa", "Rotina"],
      image: "https://img.icons8.com/?size=100&id=SL1Q0YmE4CA0&format=png&color=000000",
      frontText: "Eu quero ir no banheiro agora",
      backText: "Eu vou ao banheiro agora"
    },
    {
      id: 4,
      category: "Emoções",
      tags: ["Favoritos"],
      image: "https://cdn-icons-png.flaticon.com/512/742/742751.png",
      frontText: "Eu estou muito feliz hoje",
      backText: "Eu estou muito feliz hoje"
    },
    {
      id: 5,
      category: "Pessoas",
      tags: ["Casa", "Favoritos"],
      image: "https://cdn-icons-png.flaticon.com/512/4140/4140051.png",
      frontText: "Eu amo a minha mamãe",
      backText: "Eu amo a minha mamãe"  
    },
    {
      id: 6,
      category: "Pessoas",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png",
      frontText: "Eu amo o meu papai",
      backText: "Eu amo o meu papai",
    },
    {
      id: 7,
      category: "Ações",
      tags: ["Casa", "Rotina"],
      image: "https://cdn-icons-png.flaticon.com/512/10303/10303407.png",
      frontText: "Eu vou dormir cedo hoje",
      backText: "Eu vou dormir cedo hoje"
    },
    {
      id: 8,
      category: "Ações",
      tags: ["Casa", "Escola"],
      image: "https://cdn-icons-png.flaticon.com/512/686/686589.png",
      frontText: "Eu gosto muito de brincar",
      backText: "Eu gosto muito de brincar"
    },
    {
      id: 9,
      category: "Emoções",
      tags: ["Favoritos"],
      image: "https://cdn-icons-png.flaticon.com/512/742/742752.png",
      frontText: "Eu estou muito triste",
      backText: "Eu estou muito triste"
    },
    {
      id: 10,
      category: "Saúde",
      tags: ["Médico"],
      image: "https://cdn-icons-png.flaticon.com/512/4320/4320337.png",
      frontText: "Eu estou sentindo muita dor",
      backText: "Eu me machuquei"
    },
    {
      id: 11,
      category: "Lugares",
      tags: ["Escola"],
      image: "https://cdn-icons-png.flaticon.com/512/2436/2436874.png",
      frontText: "Eu vou para a escola hoje",
      backText: "Eu vou para a escola hoje"
    },
    {
      id: 12,
      category: "Lugares",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/1946/1946488.png",
      frontText: "Eu quero voltar para casa",
      backText: "Eu quero voltar para casa"
    },
    {
      id: 13,
      category: "Lugares",
      tags: ["Médico"],
      image: "https://cdn-icons-png.flaticon.com/512/2967/2967350.png",
      frontText: "Eu preciso ir ao hospital",
      backText: "Eu preciso ir ao hospital"
    },
    {
      id: 14,
      category: "Saúde",
      tags: ["Médico", "Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/4320/4320371.png",
      frontText: "Eu preciso tomar meu remédio",
      backText: "Eu preciso tomar meu remédio"
    },
    {
      id: 15,
      category: "Comida",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/2405/2405479.png",
      frontText: "Eu quero beber um suco",
      backText: "Eu quero beber um suco"
    },
    {
      id: 16,
      category: "Comida",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/2674/2674505.png",
      frontText: "Eu bebo leite todas manhãs",
      backText: "Eu bebo leite todas manhãs"
    },
    {
      id: 17,
      category: "Comida",
      tags: ["Casa", "Escola"],
      image: "https://cdn-icons-png.flaticon.com/512/415/415733.png",
      frontText: "Eu como uma maçã vermelha",
      backText: "Eu como uma maçã vermelha"
    },
    {
      id: 18,
      category: "Comida",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/9768/9768109.png",
      frontText: "Eu como uma banana amarela",
      backText: "Eu como uma banana amarela"
    },
    {
      id: 19,
      category: "Comida",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/7093/7093198.png",
      frontText: "Eu como torradinha, com pão e manteiga",
      backText: "Eu como pão com manteiga"
    },
    {
      id: 20,
      category: "Comida",
      tags: ["Favoritos"],
      image: "https://cdn-icons-png.flaticon.com/512/3132/3132693.png",
      frontText: "Eu adoro comer pizza de queijo",
      backText: "Eu adoro comer pizza de queijo"
    },
    {
      id: 21,
      category: "Lugares",
      tags: ["Favoritos"],
      image: "https://cdn-icons-png.flaticon.com/512/12963/12963355.png",
      frontText: "Eu gosto de ir ao parque",
      backText: "Eu gosto de ir ao parque"
    },
    {
      id: 22,
      category: "Objetos",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
      frontText: "Olha um carro vermelho",
      backText: "Olha um carro"
    },
    {
      id: 23,
      category: "Transportes",
      tags: ["Escola"],
      image: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
      frontText: "Eu vou de ônibus para escola",
      backText: "Eu vou de ônibus para escola"
    },
    {
      id: 24,
      category: "Objetos",
      tags: ["Favoritos"],
      image: "https://cdn-icons-png.flaticon.com/512/2586/2586738.png",
      frontText: "Eu uso meu celular todo dia",
      backText: "Eu uso meu celular todo dia"
    },
    {
      id: 25,
      category: "Objetos",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/15177/15177944.png",
      frontText: "Eu assisto TV na sala",
      backText: "Eu assisto TV na sala"
    },
    {
      id: 26,
      category: "Ações",
      tags: ["Favoritos"],
      image: "https://cdn-icons-png.flaticon.com/512/727/727218.png",
      frontText: "Eu gosto de ouvir música",
      backText: "Eu gosto de ouvir música"
    },
    {
      id: 27,
      category: "Ações",
      tags: ["Escola"],
      image: "https://cdn-icons-png.flaticon.com/512/3043/3043888.png",
      frontText: "Eu gosto muito de correr",
      backText: "Eu gosto muito de correr"
    },
    {
      id: 28,
      category: "Ações",
      tags: ["Escola"],
      image: "https://cdn-icons-png.flaticon.com/512/6840/6840012.png",
      frontText: "Eu vou sentar na cadeira",
      backText: "Eu vou sentar na cadeira"
    },
    {
      id: 29,
      category: "Ações",
      tags: ["Escola"],
      image: "https://cdn-icons-png.flaticon.com/512/2593/2593782.png",
      frontText: "Eu vou levantar agora mesmo",
      backText: "Eu vou levantar agora mesmo"
    },
    {
      id: 30,
      category: "Emoções",
      tags: ["Casa", "Favoritos"],
      image: "https://cdn-icons-png.flaticon.com/512/11325/11325064.png",
      frontText: "Eu quero um abraço bem forte",
      backText: "Eu quero um abraço bem forte"
    },
    {
      id: 31,
      category: "Emoções",
      tags: ["Rotina"],
      image: "https://cdn-icons-png.flaticon.com/512/742/742774.png",
      frontText: "Eu estou muito bravo hoje",
      backText: "Eu estou muito brava hoje"
    },
    {
      id: 32,
      category: "Emoções",
      tags: ["Rotina"],
      image: "https://cdn-icons-png.flaticon.com/512/742/742760.png",
      frontText: "Eu estou muito calmo agora",
      backText: "Eu estou muito calma agora"
    },
    {
      id: 33,
      category: "Pessoas",
      tags: ["Escola"],
      image: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
      frontText: "Eu devo obedecer a professora",
      backText: "Eu falo com a professora"
    },
    {
      id: 34,
      category: "Pessoas",
      tags: ["Escola", "Favoritos"],
      image: "https://cdn-icons-png.flaticon.com/512/1000/1000370.png",
      frontText: "Eu brinco com meu amigo",
      backText: "Eu brinco com minha amiga"
    },
    {
      id: 35,
      category: "Pessoas",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/7697/7697560.png",
      frontText: "Eu vou visitar a vovó",
      backText: "Eu vou visitar o vovô"
    },
    {
      id: 36,
      category: "Pessoas",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/6740/6740296.png",
      frontText: "Eu vou visitar a vovó",
      backText: "Eu vou visitar o vovô"
    },
    {
      id: 37,
      category: "Rotina",
      tags: ["Casa", "Rotina"],
      image: "https://cdn-icons-png.flaticon.com/512/3004/3004458.png",
      frontText: "Eu escovo meus dentes todos dias",
      backText: "Eu escovo meus dentes todos dias"
    },
    {
      id: 38,
      category: "Rotina",
      tags: ["Casa", "Rotina"],
      image: "https://cdn-icons-png.flaticon.com/512/1426/1426396.png",
      frontText: "Eu tomo banho pela manhã",
      backText: "Eu tomo banho pela manhã"
    },
    {
      id: 39,
      category: "Rotina",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/892/892458.png",
      frontText: "Eu troco de roupa todos dias",
      backText: "Eu troco de roupa todos dias"
    },
    {
      id: 40,
      category: "Rotina",
      tags: ["Casa", "Escola"],
      image: "https://cdn-icons-png.flaticon.com/512/2755/2755820.png",
      frontText: "Eu lavo minhas mãos agora",
      backText: "Eu lavo minhas mãos agora"
    },
    {
      id: 41,
      category: "Emoções",
      tags: ["Rotina"],
      image: "https://cdn-icons-png.flaticon.com/512/742/742755.png",
      frontText: "Eu estou muito cansado hoje",
      backText: "Eu estou muito cansada hoje"
    },
    {
      id: 42,
      category: "Sensações",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/414/414927.png",
      frontText: "Eu estou com muito frio",
      backText: "Eu estou com muito frio"
    },
    {
      id: 43,
      category: "Sensações",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
      frontText: "Eu estou com muito calor",
      backText: "Eu estou com muito calor"
    },
    {
      id: 44,
      category: "Sensações",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
      frontText: "Eu estou com muita fome",
      backText: "Eu estou com muita fome"
    },
    {
      id: 45,
      category: "Sensações",
      tags: ["Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/824/824239.png",
      frontText: "Eu estou com muita sede",
      backText: "Eu estou com muita sede"
    },
    {
      id: 46,
      category: "Ações",
      tags: ["Escola", "Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/3524/3524659.png",
      frontText: "Eu preciso de ajuda agora",
      backText: "Eu preciso de ajuda agora"
    },
    {
      id: 47,
      category: "Comunicação",
      tags: ["Favoritos"],
      image: "https://cdn-icons-png.flaticon.com/512/845/845646.png",
      frontText: "Sim",
      backText: "Eu respondo que sim"
    },
    {
      id: 48,
      category: "Comunicação",
      tags: ["Favoritos"],
      image: "https://cdn-icons-png.flaticon.com/512/1828/1828843.png",
      frontText: "Não",
      backText: "Eu respondo que não"
    },
    {
      id: 49,
      category: "Comunicação",
      tags: ["Escola", "Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/742/742748.png",
      frontText: "Eu digo muito obrigado",
      backText: "Eu digo muito obrigada"
    },
    {
      id: 50,
      category: "Comunicação",
      tags: ["Escola", "Casa"],
      image: "https://cdn-icons-png.flaticon.com/512/742/742799.png",
      frontText: "Eu peço por favor",
      backText: "Eu peço por favor"
    }
  ],
  categories: [
    { name: "Comida", color: "#F97316" },
    { name: "Ações", color: "#3B82F6" },
    { name: "Emoções", color: "#EC4899" },
    { name: "Pessoas", color: "#8B5CF6" },
    { name: "Lugares", color: "#14B8A6" },
    { name: "Saúde", color: "#22C55E" },
    { name: "Objetos", color: "#6366F1" },
    { name: "Transportes", color: "#06B6D4" },
    { name: "Rotina", color: "#84CC16" },
    { name: "Sensações", color: "#EAB308" },
    { name: "Comunicação", color: "#EF4444" }
  ],
  tags: [
    { name: "Favoritos", color: "#F59E0B" },
    { name: "Rotina", color: "#10B981" },
    { name: "Escola", color: "#3B82F6" },
    { name: "Casa", color: "#8B5CF6" },
    { name: "Médico", color: "#EF4444" }
  ]
}
    // Exportar para uso
window.READER_COLLECTION = READER_COLLECTION;