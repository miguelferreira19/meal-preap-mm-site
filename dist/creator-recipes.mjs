// Public primary sources checked 2026-10-20. Concise adaptations written for this app.
// Quantities are raw and per main-course serving, unless explicitly stated otherwise.
import {EXTRA_CREATORS} from './recipes/creators.mjs';
import {EXTRA_RECIPES} from './recipes/catalogue.mjs';
export const CREATORS = [
 ...EXTRA_CREATORS,
 {id:'pitada',name:'A Pitada do Pai',personName:'Rui Marques',portrait:'assets/creators/pitada.jpg',portraitSource:'https://www.apitadadopai.com/wp-content/uploads/2024/08/rui-livro-airfryer-850x567-1-e1777980455493-300x300.jpg',portraitPage:'https://www.apitadadopai.com/receitas-para-airfryer/',handle:'@apitadadopai',profile:'https://www.instagram.com/apitadadopai/',audience:'618 mil',audienceCheckedAt:'2026-10-20'},
 {id:'clara',name:'Clara de Sousa',personName:'Clara de Sousa',portrait:'assets/creators/clara.png',portraitSource:'https://claradesousa.pt/wp-content/uploads/elementor/thumbs/claradesousa-imagemperfil-round-ql94ihjlazwie4e6brwnmsivij9amvu5q0cixv7d56.png',portraitPage:'https://claradesousa.pt/sobre-a-clara/',handle:'@claradesousa_cozinha_bricolage',profile:'https://www.instagram.com/claradesousa_cozinha_bricolage/',audience:'199 mil',audienceCheckedAt:'2026-10-20'},
];
const amounts=pairs=>pairs.map(([id,quantity])=>({id,quantity}));
const source=(creator,url,publishedAt,adaptation,credit)=>({creator,url,publishedAt,adaptation,credit,checkedAt:'2026-10-20'});
export const CREATOR_RECIPES = [
 ...EXTRA_RECIPES,
 {
  id:'criador-empadao-filo',name:'Empadão crocante de carne e abóbora',description:'Vaca, feijão e abóbora sob uma cobertura de massa filo estaladiça.',minutes:40,equipment:['hob','pan','oven','knife'],diet:'all',image:'chicken',
  source:source('pitada','https://www.apitadadopai.com/empadao-frango-crocante/','2026-10-14','Usamos a alternativa de carne picada indicada na fonte. Doses de prato principal, alho fresco e quantidades de massa e temperos definidos por nós.','A Pitada do Pai · Inês Aguiar'),
  ingredients:amounts([['beef',125],['pumpkin',150],['kidney_beans',80],['filo',35],['onion',40],['garlic',3],['paprika',1],['olive_oil',10],['salt',1]]),
  steps:['Aqueça o forno a 200 °C. Corte a abóbora em cubos de 1 cm e pique cebola e alho.','Amoleça a cebola em parte do azeite. Junte a carne e cozinhe até perder totalmente a cor crua. Acrescente alho, pimentão e abóbora; tape e cozinhe 10 minutos, juntando um pouco de água se necessário.','Envolva o feijão escorrido e o sal. Transfira para uma assadeira, cubra com massa filo amachucada e pincele com o azeite restante.','Asse 15 a 20 minutos, até a cobertura dourar e a abóbora estar macia. Para mais pessoas, distribua por assadeiras sem amontoar.'],
 },
 {
  id:'criador-mac-cheese',name:'One pot de vaca, abóbora e queijo',description:'Massa cremosa num só tacho, com carne picada e queijo derretido.',minutes:30,equipment:['hob','pot','knife'],diet:'all',image:'pasta',
  source:source('pitada','https://www.apitadadopai.com/one-pot-mac-cheese-com-carne-picada-e-abobora/','2025-10-20','Quantidades ajustadas para prato principal. O tomate pelado cozinha no tacho em vez de usar molho pronto. Usamos alho fresco e mais tempo para o refogado.','A Pitada do Pai · Inês Aguiar'),
  ingredients:amounts([['beef',125],['pasta',80],['pumpkin',100],['onion',35],['canned_tomato',80],['soy_sauce',3],['cheese',25],['garlic',3],['olive_oil',5],['black_pepper',0.2],['salt',0.5]]),
  steps:['Corte a abóbora em cubos pequenos. Num tacho largo, amoleça cebola e alho no azeite durante 3 minutos.','Junte a carne, desfaça-a com a colher e cozinhe completamente. Acrescente abóbora, tomate e molho de soja.','Adicione a massa crua e água quente até a cobrir por pouco. Cozinhe pelo tempo da embalagem, mexendo e acrescentando água aos poucos.','Quando massa e abóbora estiverem macias, desligue e envolva o queijo. Prove antes de juntar o sal e termine com pimenta.'],
 },
 {
  id:'criador-quesadillas',name:'Quesadillas de frango e queijo',description:'Tortilhas douradas com frango cremoso, queijo e uma salada fresca.',minutes:30,equipment:['hob','pot','pan','knife'],diet:'all',image:'chicken',
  source:source('pitada','https://www.apitadadopai.com/quesadillas-mexicanas/','2026-06-23','Cozemos o peito de frango de raiz e douramos na frigideira. Usamos limão em vez de lima e tomate e pepino em vez de abacate. Doses aumentadas para refeição.','A Pitada do Pai · Inês Aguiar'),
  ingredients:amounts([['chicken',150],['wraps',80],['cheese',40],['yogurt',35],['lemon',35],['black_pepper',0.2],['tomato',100],['cucumber',80],['salt',0.7]]),
  steps:['Coza o frango em água com parte do sal durante 12 a 18 minutos, até estar cozinhado no centro. Desfie com dois garfos.','Envolva com o iogurte, queijo, pimenta e algumas gotas de sumo de limão.','Espalhe em metade de cada tortilha e dobre. Doure numa frigideira antiaderente, em lume médio, cerca de 2 minutos de cada lado, até o queijo derreter.','Corte em triângulos e sirva com tomate e pepino cortados, temperados com limão e o sal restantes. Faça as tortilhas por turnos.'],
 },
 {
  id:'criador-frango-aveia',name:'Frango crocante de aveia e parmesão',description:'Bifes finos com crosta de aveia, queijo e raspa de limão.',minutes:30,equipment:['airfryer','hob','pot','knife'],diet:'all',image:'chicken',
  source:source('pitada','https://www.apitadadopai.com/peito-frango-crosta-aveia-limao-parmesao/','2026-02-06','Peitos grandes convertidos em peso por pessoa. Juntámos arroz e brócolos para formar uma refeição completa; estes acompanhamentos entram no custo.','A Pitada do Pai · Inês Aguiar'),
  ingredients:amounts([['chicken',150],['oats',15],['parmesan',10],['lemon',30],['eggs',0.25],['olive_oil',4],['black_pepper',0.2],['rice',70],['broccoli',120],['salt',0.8]]),
  steps:['Coza o arroz em água com sal. Coza também os brócolos em água ou a vapor sobre a panela.','Corte o frango em bifes finos. Bata o ovo com o azeite. Noutra taça, misture aveia, parmesão, raspa de limão e pimenta. Use a quantidade indicada de ovo batido e reserve o restante no frio.','Passe os bifes no ovo e depois na aveia, pressionando a crosta. Disponha numa só camada na air fryer a 190 °C.','Cozinhe 14 a 16 minutos, virando a meio, até o centro estar completamente cozinhado. Repita em turnos se necessário e sirva com arroz e brócolos.'],
 },
 {
  id:'criador-empadao-frango',name:'Empadão de frango com puré de abóbora',description:'Frango suculento sob um puré de batata e abóbora gratinado.',minutes:45,equipment:['hob','pot','pan','oven','knife'],diet:'all',image:'chicken',
  source:source('pitada','https://www.apitadadopai.com/empadao-carne/','2026-03-02','O recheio de frango segue os ingredientes da fonte, apesar do título genérico original. Pesamos batata e abóbora em cru e definimos as doses e o queijo opcional.','A Pitada do Pai · Inês Aguiar'),
  ingredients:amounts([['chicken',150],['potato',180],['pumpkin',140],['onion',40],['yogurt',25],['cheese',20],['garlic',3],['paprika',1],['black_pepper',0.2],['olive_oil',8],['salt',1]]),
  steps:['Aqueça o forno a 180 °C. Coza batata e abóbora em cubos durante 15 a 20 minutos; escorra muito bem e esmague com garfo.','Enquanto cozem, amoleça cebola e alho no azeite. Junte frango em tiras finas, pimentão, sal e pimenta e cozinhe completamente.','Fora do lume, envolva o iogurte. Espalhe numa assadeira e cubra com o puré.','Polvilhe com queijo e gratine 10 a 15 minutos, até a superfície ganhar cor. Sirva porções com recheio e cobertura.'],
 },
 {
  id:'criador-camarao-guilho',name:'Camarão à guilho com pão e salada',description:'Camarão com alho, coentros e limão, para molhar o pão no molho.',minutes:25,equipment:['hob','pan','knife'],diet:'all',image:'fish',
  source:source('pitada','https://www.apitadadopai.com/camaroes-guilho-air-fryer/','2026-07-21','Adaptado para miolo de camarão na frigideira. Juntámos pão, tomate e pepino para servir como refeição; o peso indicado é de camarão já descascado.','A Pitada do Pai · Inês Aguiar'),
  ingredients:amounts([['prawns',160],['garlic',6],['lemon',45],['olive_oil',12],['coriander',5],['chili',2],['black_pepper',0.2],['salt',0.7],['bread',100],['tomato',120],['cucumber',80]]),
  steps:['Descongele o camarão no frigorífico e seque-o. Corte tomate e pepino para a salada e pique alho, malagueta e coentros.','Aqueça o azeite em lume médio. Junte alho e malagueta por cerca de 30 segundos, sem queimar.','Acrescente o camarão numa só camada e cozinhe 3 a 5 minutos, virando, até ficar opaco por inteiro. Tempere com sal, pimenta, sumo de limão e coentros.','Sirva logo, com pão e salada. O tempo de descongelação é adicional; retire o camarão do congelador na véspera.'],
 },
 {
  id:'criador-hamburguer-atum',name:'Hambúrguer de atum e feijão branco',description:'Hambúrgueres dourados com mostarda e limão, no pão com salada.',minutes:35,equipment:['hob','pan','knife'],diet:'all',image:'fish',
  source:source('clara','https://claradesousa.pt/receita/hamburguer-de-atum-com-vinagreta-de-limao/',null,'Doses de prato principal e pão esfarelado em vez de pão ralado comprado. Servimos no pão com tomate e pepino; simplificámos a vinagreta sem mel.','Clara de Sousa'),
  ingredients:amounts([['tuna',100],['white_beans',75],['eggs',0.5],['mustard',8],['lemon',40],['parsley',4],['bread',110],['olive_oil',12],['black_pepper',0.2],['salt',0.7],['tomato',100],['cucumber',80]]),
  steps:['Escorra atum e feijão e pese-os já escorridos. Esmague o feijão com garfo e esfarele cerca de um quarto do pão; reserve o restante.','Misture feijão, atum, ovo batido, metade da mostarda, raspa de limão, salsa, sal e pimenta. Junte pão esfarelado aos poucos até conseguir moldar hambúrgueres sem secar a massa.','Deixe repousar 10 minutos. Doure em parte do azeite cerca de 3 minutos de cada lado; vire com cuidado e deixe o ovo cozinhar completamente.','Misture o restante azeite e mostarda com sumo de limão. Sirva os hambúrgueres no pão com tomate, pepino e molho.'],
 },
 {
  id:'criador-tomatada',name:'Tomatada com ovos e pão de alho',description:'Ovos num molho de tomate apurado, com pão tostado para acompanhar.',minutes:30,equipment:['hob','pan','knife'],diet:'all',image:'eggs',
  source:source('clara','https://claradesousa.pt/receita/tomatada-com-ovos-escalfados/',null,'Usamos dois ovos por pessoa. Simplificámos as ervas para salsa e trocámos pimenta rosa por preta; o pão de alho é tostado na frigideira.','Clara de Sousa'),
  ingredients:amounts([['eggs',2],['canned_tomato',200],['onion',45],['garlic',4],['olive_oil',10],['parsley',5],['black_pepper',0.2],['salt',0.8],['bread',100]]),
  steps:['Pique cebola e alho. Aqueça parte do azeite numa frigideira com tampa e amoleça a cebola durante 4 minutos; junte metade do alho.','Acrescente tomate, sal, pimenta e metade da salsa. Deixe apurar 12 a 14 minutos em lume médio, mexendo pontualmente.','Abra os ovos separadamente para uma taça e coloque em pequenas covas no molho. Tape e cozinhe em lume brando até as claras estarem firmes e as gemas no ponto desejado.','Enquanto o tomate apura, toste o pão noutra frigideira com o azeite restante e esfregue com o alho reservado. Termine os ovos com salsa e sirva com pão.'],
 },
];
