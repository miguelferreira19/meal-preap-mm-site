// Public captions checked on 2026-10-20. This module does not reproduce ebook content.
// All ingredient amounts are per person, in raw edible weight unless named otherwise.
// An indexed caption is explicitly distinguished from a verified original Instagram post.
const ingredient=(name,unit,packQuantity,category,allergens=[])=>({name,unit,packQuantity,priceCents:null,category,allergens});
export const SOCIAL_INGREDIENTS={
 sweet_potato:ingredient('Batata-doce','g',1000,'Fruta e legumes'),
 avocado_pulp:ingredient('Abacate, polpa','g',200,'Fruta e legumes'),
 cottage:ingredient('Queijo cottage','g',200,'Ovos e laticínios',['milk']),
 feta:ingredient('Queijo feta','g',200,'Ovos e laticínios',['milk']),
 leek:ingredient('Alho-francês','g',500,'Fruta e legumes'),
 cod:ingredient('Bacalhau desfiado, já demolhado e sem espinhas','g',400,'Carne e peixe',['fish']),
 olives:ingredient('Azeitonas sem caroço, escorridas','g',150,'Mercearia'),
 chicken_ham:ingredient('Fiambre de frango','g',150,'Charcutaria'),
 egg_whites:ingredient('Claras de ovo pasteurizadas','ml',500,'Ovos e laticínios',['egg']),
 oregano:ingredient('Orégãos secos','g',10,'Mercearia'),
 cocoa:ingredient('Cacau em pó sem açúcar','g',125,'Mercearia'),
 baking_powder:ingredient('Fermento em pó para bolos','g',100,'Mercearia'),
 milk_powder:ingredient('Leite em pó magro','g',400,'Ovos e laticínios',['milk']),
 oat_flour:ingredient('Farinha de aveia','g',500,'Mercearia',['gluten']),
 banana_pulp:ingredient('Banana, polpa','g',1000,'Fruta e legumes'),
 salmon:ingredient('Lombo de salmão sem espinhas','g',250,'Carne e peixe',['fish']),
};
const amounts=pairs=>pairs.map(([id,quantity])=>({id,quantity}));
const indexed='Legenda pública consultada num índice de publicações; a ligação original do Instagram ainda não foi confirmada. ';
const source=(url,adaptation,{indexedCaption=false,publishedAt=null}={})=>({creator:'foodies',url,credit:'FOODIES by Carolina',checkedAt:'2026-10-20',publishedAt,kind:indexedCaption?'public-caption-index':'public-caption',adaptation:(indexedCaption?indexed:'')+adaptation});

export const SOCIAL_RECIPES=[
 {
  id:'criador-foodies-hamburguer-batata-doce',name:'Hambúrguer em tortilhas de batata-doce e cenoura',description:'Carne de vaca e guacamole entre discos dourados de legumes, ovo e queijo.',minutes:45,equipment:['hob','pan','oven','knife'],diet:'all',image:'chicken',photoKey:'beef-sweet-potato-burger',primaryProtein:'beef',
  source:source('https://www.instagram.com/p/DejCQq2uDSm/','A receita está integralmente na legenda pública. Convertida em duas doses: pesámos a batata-doce e a cenoura e fizemos uma guacamole simples de abacate e limão. Alho fresco em vez de alho em pó; quantidades dos temperos definidas por nós. Para o preço da polpa usamos abacate em cubos pronto a usar; descongela conforme a embalagem e prova antes de juntar sal.'),
  ingredients:amounts([['beef',150],['sweet_potato',150],['carrot',100],['eggs',1.5],['cheese',50],['avocado_pulp',60],['lemon',20],['garlic',2],['paprika',0.5],['salt',0.8],['black_pepper',0.2]]),
  steps:['Aqueça o forno a 180 °C e forre um tabuleiro com papel vegetal. Rale batata-doce e cenoura.','Misture os legumes com os ovos batidos, queijo e parte do sal e da pimenta. Forme discos finos e asse cerca de 25 minutos, até firmes e dourados.','Tempere a carne com alho bem picado, pimentão, sal e pimenta. Molde hambúrgueres e cozinhe na frigideira antiaderente, virando, até ficarem totalmente cozinhados no centro.','Esmague o abacate com algumas gotas de limão. Monte cada hambúrguer entre dois discos de legumes, com a guacamole. Prepare discos adicionais por turnos se o tabuleiro for pequeno.'],
 },
 {
  id:'criador-foodies-massa-curgete-feta',name:'Massa de curgete e feta com frango grelhado',description:'Molho de legumes assados e feta, com massa e um peito de frango dourado.',minutes:35,equipment:['airfryer','hob','pot','pan','blender','knife'],diet:'all',image:'pasta',photoKey:'chicken-zucchini-pasta',primaryProtein:'chicken',
  source:source('https://www.instagram.com/p/DeeFE31KWhD/','Usamos apenas a receita pública do molho e da massa. Os panados mencionados na publicação pertencem ao livro e não foram usados: o frango grelhado é um acompanhamento criado por nós, incluído nas quantidades e no tempo. Definimos o peso dos legumes, feta, frango e azeite; alho fresco substitui alho em pó.'),
  ingredients:amounts([['pasta',70],['zucchini',150],['onion',60],['garlic',6],['feta',30],['chicken',150],['olive_oil',5],['salt',0.8],['black_pepper',0.2]]),
  steps:['Corte a curgete e a cebola. Asse com os dentes de alho ainda com casca na air fryer, a 180 °C, durante 15 a 18 minutos; mexa a meio.','Coza a massa pelo tempo da embalagem. Antes de escorrer, reserve uma chávena da água da cozedura.','Corte o frango em bifes finos, tempere com parte do sal e da pimenta e cozinhe no azeite, na frigideira, até estar completamente cozinhado no centro.','Descasque o alho assado e triture com curgete, cebola e feta. Acrescente água da massa aos poucos até obter um molho liso. Envolva na massa e sirva com o frango.'],
 },
 {
  id:'criador-foodies-wrap-frango-cottage',name:'Wrap de frango, ovo e cottage',description:'Tortilha recheada com frango desfiado, tomate e espinafres, ligada por ovo e cottage.',minutes:35,equipment:['hob','pot','pan','knife'],diet:'all',image:'chicken',photoKey:'chicken-egg-wrap',primaryProtein:'chicken',
  source:source('https://pikory.com/tag/high-protein-wrap-recipes-for-breakfast','Índice Pikory. A legenda indica wrap, dois ovos, duas colheres de cottage, tomate, frango cozinhado e espinafres, com preparação na frigideira tapada. Pesos dos recheios e temperos definidos por nós. Cozemos o frango de raiz: o ingrediente e o tempo referem-se ao peso cru, não a sobras gratuitas.',{indexedCaption:true}),
  ingredients:amounts([['wraps',60],['eggs',2],['cottage',30],['chicken',100],['tomato',80],['spinach',30],['olive_oil',2],['salt',0.6],['black_pepper',0.2]]),
  steps:['Coza o peito de frango em água durante 12 a 18 minutos, até completamente cozinhado. Escorra e desfie.','Bata os ovos com cottage, sal e pimenta. Corte o tomate e lave os espinafres.','Unte ligeiramente uma frigideira antiaderente, coloque a tortilha no fundo e distribua ovo, frango, tomate e espinafres. Tape e cozinhe em lume médio a brando até o ovo ficar firme.','Se necessário, vire com ajuda de um prato e aqueça o outro lado. Dobre, corte e sirva. Para várias pessoas, faça um wrap de cada vez.'],
 },
 {
  id:'criador-foodies-wrap-ovo-fiambre',name:'Tortilha de ovo com queijo e fiambre de frango',description:'Uma base de wrap crocante com ovo, queijo derretido, tomate e salsa.',minutes:20,equipment:['hob','pan','knife'],diet:'all',image:'eggs',photoKey:'ham-egg-tortilla',primaryProtein:'eggs',
  source:source('https://pikory.com/tag/high-protein-egg-wrap-ideas','Índice Pikory. A legenda publica um wrap, dois ovos, uma clara e os recheios opcionais; não descreve o método. Preparação na frigideira tapada criada por nós. Escolhemos queijo, fiambre de frango e tomate e definimos os seus pesos. A clara é contabilizada como 30 ml de clara pasteurizada.',{indexedCaption:true}),
  ingredients:amounts([['wraps',60],['eggs',2],['egg_whites',30],['cheese',25],['chicken_ham',60],['tomato',100],['parsley',3],['oregano',0.3],['olive_oil',2],['salt',0.5],['black_pepper',0.2]]),
  steps:['Bata os ovos e a clara com sal, pimenta e orégãos. Corte o fiambre e o tomate em pedaços pequenos.','Unte uma frigideira antiaderente, coloque a tortilha no fundo e verta a mistura de ovo. Distribua tomate, fiambre e queijo.','Tape e cozinhe em lume brando, sem deixar a tortilha queimar, até o ovo ficar totalmente firme e o queijo derreter.','Termine com salsa, dobre e sirva quente. Cozinhe as doses por turnos para manter a camada de ovo fina.'],
 },
 {
  id:'criador-foodies-bacalhau-bras',name:'Bacalhau à Brás com cenoura e alho-francês',description:'Bacalhau e ovos com legumes salteados e batata palha preparada na air fryer.',minutes:45,equipment:['airfryer','hob','pan','knife'],diet:'all',image:'fish',photoKey:'cod-bras',primaryProtein:'fish',
  source:source('https://pikory.com/u/foodiesguide__/31366174242','Índice Pikory, publicação de 18/09/2026. Convertida em duas doses de prato principal. O bacalhau indicado é já demolhado, sem pele e espinhas; a demolha não cabe nos 45 minutos. Pesos de cebola, alho-francês, azeitonas, azeite e temperos definidos por nós.',{indexedCaption:true,publishedAt:'2026-09-18'}),
  ingredients:amounts([['cod',200],['potato',150],['carrot',75],['onion',80],['leek',75],['garlic',3],['eggs',1.5],['parsley',4],['olives',15],['olive_oil',10],['salt',0.3],['black_pepper',0.2]]),
  steps:['Confirme que o bacalhau está demolhado. Corte a batata em palitos muito finos, seque e envolva em parte do azeite. Cozinhe na air fryer a 200 °C durante 15 a 20 minutos, agitando a meio.','Corte cebola e alho-francês e rale a cenoura. Amoleça cebola, alho-francês e alho no azeite restante; junte a cenoura e cozinhe mais 2 a 3 minutos.','Adicione o bacalhau desfiado e salteie até estar completamente cozinhado. Envolva a batata.','Junte os ovos batidos em lume baixo, mexendo até o ovo ficar cozinhado, sem o deixar secar. Prove antes de acrescentar o sal e termine com pimenta, salsa e azeitonas.'],
 },
 {
  id:'criador-foodies-salmao-cremoso',name:'Salmão cremoso de cottage e espinafres',description:'Lombo de salmão num molho de tomate, cottage e espinafres, acompanhado de arroz.',minutes:35,equipment:['hob','pot','pan','blender','knife'],diet:'all',image:'fish',photoKey:'creamy-salmon-spinach',primaryProtein:'fish',
  source:source('https://pikory.com/tag/recette-avec-saumon-healthy','Índice Pikory. Usamos a opção pública de cottage batido com leite, sem natas. Definimos o peso dos lombos, leite e temperos e juntámos arroz para prato principal. Tomate comum em vez de cherry; tomate pelado triturado em vez de polpa pronta. O limão consta do método da legenda.',{indexedCaption:true}),
  ingredients:amounts([['salmon',160],['olive_oil',7.5],['onion',60],['garlic',3],['tomato',50],['cottage',75],['milk',25],['oregano',0.3],['spinach',75],['canned_tomato',20],['parsley',3],['lemon',25],['salt',0.7],['black_pepper',0.2],['rice',70]]),
  steps:['Coza o arroz em água com parte do sal. Pique cebola e alho e corte o tomate.','Amoleça cebola, alho e tomate no azeite. Acrescente o salmão, tempere com pimenta, limão e o restante sal e doure de ambos os lados.','Triture cottage, leite e tomate pelado. Junte este molho e os espinafres à frigideira e cozinhe suavemente até os espinafres murcharem e o salmão ficar cozinhado no centro.','Polvilhe com orégãos e salsa e sirva com arroz. Se usar peixe congelado, descongele no frigorífico de véspera.'],
 },
 {
  id:'criador-foodies-lasanha-atum-wrap',name:'Lasanha de atum e legumes em wraps',description:'Camadas de atum, cogumelos, espinafres e tortilha, com cobertura de ovo e iogurte.',minutes:45,equipment:['hob','pan','oven','knife'],diet:'all',image:'fish',photoKey:'tuna-wrap-lasagna',primaryProtein:'fish',
  source:source('https://pikory.com/tag/high-protein-lasagna-wrap-bake','Índice Pikory. A legenda fornece os ingredientes e a ordem das camadas, sem doses completas nem temperatura. Quantidades, tempos e cozedura a 180 °C definidos por nós. Usamos a opção de iogurte natural, cogumelos comuns em vez de portobello e tomate pelado esmagado em vez de polpa pronta.',{indexedCaption:true}),
  ingredients:amounts([['tuna',100],['wraps',60],['eggs',1],['yogurt',75],['cheese',30],['onion',40],['garlic',3],['pepper',50],['mushrooms',75],['leek',50],['tomato',60],['canned_tomato',50],['spinach',50],['coriander',3],['olive_oil',5],['salt',0.6],['black_pepper',0.2]]),
  steps:['Aqueça o forno a 180 °C. Amoleça cebola e alho no azeite e junte pimento, cogumelos e alho-francês picados. Salteie até perderem parte da água.','Acrescente tomate fresco, tomate pelado esmagado, espinafres e atum escorrido. Tempere e apure cerca de 5 minutos. Termine com coentros.','Numa assadeira pequena, alterne o recheio e pedaços de wrap. Bata o ovo com o iogurte e distribua por cima; cubra com queijo.','Asse durante 20 a 25 minutos, até a cobertura estar firme, o ovo completamente cozinhado e o queijo dourado. Deixe assentar alguns minutos antes de cortar.'],
 },
 {
  id:'criador-foodies-lasanha-curgete',name:'Lasanha de curgete, vaca e cottage',description:'Fatias finas de curgete em camadas com carne, molho de cottage e queijo gratinado.',minutes:55,equipment:['hob','pan','oven','blender','knife'],diet:'all',image:'chicken',photoKey:'beef-zucchini-lasagna',primaryProtein:'beef',
  source:source("https://pictame.com/en/discover/hashtag/courtney-cook's-viral-recipe",'Índice Pictame. Ingredientes e preparação estão na legenda pública indexada. Convertida em quatro doses; os pesos de legumes, leite e temperos foram definidos por nós. Escolhemos a opção de grelhar a curgete na frigideira e usamos tomate pelado triturado em vez de polpa pronta.',{indexedCaption:true}),
  ingredients:amounts([['beef',125],['olive_oil',7.5],['garlic',1.5],['onion',35],['carrot',30],['pepper',25],['canned_tomato',25],['zucchini',150],['cheese',30],['cottage',50],['milk',20],['parsley',3],['oregano',0.3],['salt',0.8],['black_pepper',0.2]]),
  steps:['Aqueça o forno a 180 °C. Amoleça cebola, alho, cenoura e pimento no azeite. Junte a carne e cozinhe, desfazendo-a, até deixar de haver partes cruas.','Acrescente o tomate esmagado e parte dos temperos e deixe apurar. Corte a curgete em fatias finas no comprimento e grelhe numa frigideira antiaderente, de ambos os lados.','Triture cottage e leite com os restantes temperos até obter um molho cremoso. Numa assadeira, alterne camadas de carne, curgete e molho.','Cubra com queijo e asse 25 a 30 minutos, até dourar. Deixe repousar 5 minutos e termine com salsa.'],
 },
 {
  id:'criador-foodies-brownie-batata-doce',name:'Brownie de batata-doce e cacau',description:'Quadrados de cacau intenso, com batata-doce e aveia. Extra para sobremesa ou lanche.',minutes:65,equipment:['microwave','oven','knife'],diet:'all',image:'eggs',photoKey:'sweet-potato-brownie',primaryProtein:null,mealType:'extra',
  source:source('https://www.instagram.com/p/DbNXNBPKQlc/','Legenda integral confirmada no Instagram. A receita inteira foi dividida por seis porções pequenas. Usamos a alternativa pública de leite em pó magro e omitimos adoçante e pepitas opcionais. Os 65 minutos incluem cozedura no micro-ondas, forno e arrefecimento breve; não é um almoço ou jantar.'),
  ingredients:amounts([['sweet_potato',50],['eggs',0.5],['oat_flour',5],['milk_powder',5],['cocoa',5],['baking_powder',0.7],['salt',0.05]]),
  steps:['Aqueça o forno a 180 °C. Pique a batata-doce com um garfo e cozinhe no micro-ondas cerca de 8 a 10 minutos, até macia; o tempo depende do tamanho.','Retire a casca e esmague. Misture o puré com ovos, farinha de aveia, leite em pó, cacau, fermento e sal.','Coloque numa forma pequena forrada com papel vegetal e asse cerca de 35 minutos, até a massa estar cozinhada.','Deixe arrefecer pelo menos 10 minutos antes de cortar. Para seis porções, use seis vezes as quantidades indicadas e corte em seis quadrados iguais.'],
 },
 {
  id:'criador-foodies-muffins-cottage',name:'Muffins de banana, cenoura e cottage',description:'Muffins macios de aveia com banana madura e cenoura. Extra para o lanche.',minutes:45,equipment:['oven','blender','knife'],diet:'all',image:'eggs',photoKey:'banana-carrot-muffins',primaryProtein:null,mealType:'extra',
  source:source('https://pikory.com/tag/cottage-cheese-oat-muffins-recipe','Índice Pikory. Receita pública com método completo; dividida por quatro porções. Escolhemos a alternativa publicada de mais farinha de aveia em vez de proteína em pó: 110 g no total. Pesos da banana e da cenoura definidos por nós; omitidos chocolate e canela opcionais. Sem promessa de macronutrientes.',{indexedCaption:true}),
  ingredients:amounts([['banana_pulp',30],['carrot',25],['eggs',0.25],['cottage',15],['oat_flour',27.5]]),
  steps:['Aqueça o forno a 180 °C. Para quatro porções, multiplique as quantidades por quatro e prepare quatro formas de silicone.','Triture a banana, a cenoura, o ovo e o cottage até obter um creme. Transfira para uma taça e incorpore a farinha de aveia.','Divida a massa pelas formas e asse cerca de 25 minutos, confirmando que o centro fica cozinhado.','Deixe arrefecer 10 minutos antes de desenformar, para os muffins não se desfazerem.'],
 },
 {
  id:'criador-foodies-panquecas-banana',name:'Panquecas de banana, aveia e cottage',description:'Panquecas simples de três ingredientes, para pequeno-almoço ou lanche.',minutes:20,equipment:['hob','pan'],diet:'all',image:'eggs',photoKey:'banana-oat-pancakes',primaryProtein:null,mealType:'extra',
  source:source('https://pikory.com/tag/high-protein-oat-pancakes-recipe','Índice Pikory. Mantemos banana, farinha de aveia e a opção cottage indicados na legenda. Convertimos as colheres em 30 g de farinha e 60 g de cottage; esses pesos e o tempo total são estimativas nossas. Chocolate opcional omitido. Não substitui uma refeição principal.',{indexedCaption:true}),
  ingredients:amounts([['banana_pulp',120],['oat_flour',30],['cottage',60]]),
  steps:['Esmague a banana madura com um garfo. Envolva a farinha de aveia e o cottage até ficar uniforme.','Aqueça uma frigideira antiaderente em lume médio a brando. Coloque pequenas colheradas de massa, sem as juntar.','Deixe a base firmar antes de virar com cuidado: estas panquecas são frágeis. Cozinhe o segundo lado e repita até terminar a massa.'],
 },
];

// Coverage is limited to the public posts actually read, not the creators' entire history.
// Entries for creators covered by another module are recorded in the companion report.
export const SOCIAL_RESEARCH=[
 {creator:'foodies',name:'FOODIES by Carolina',profile:'https://www.instagram.com/foodiesguide__/',status:'integrated',checkedPosts:15,countRecipes:11,reason:'Oito pratos principais e três extras. Três fontes são legendas confirmadas diretamente no Instagram; oito são legendas públicas de índices, com essa limitação visível. Quatro promoções sem ficha completa não foram convertidas em receitas.',publications:[
  ...SOCIAL_RECIPES.map(r=>({title:r.name,url:r.source.url,status:r.source.kind==='public-caption'?'integrated-primary':'integrated-index',reason:r.source.adaptation})),
  ...['DetMai1OkQJ','DepWnlJsVV4','Deluvs4Ob5t','DegcTU6KfNo'].map(code=>({title:'Promoção de livros ou plano de refeições',url:`https://www.instagram.com/p/${code}/`,status:'incomplete',reason:'A legenda remete para livros e não contém ingredientes e preparação suficientes; não foi usado conteúdo pago.'})),
 ]},
 {creator:'vasco',name:'Vasco Meska',profile:'https://www.instagram.com/vascomeska/',status:'no-complete-recipe-found',checkedPosts:6,countRecipes:0,reason:'Nas seis legendas públicas locais há humor, viagens e publicidade; não foi identificada uma ficha culinária completa. Isto não demonstra que o perfil nunca tenha publicado receitas.',publications:[
  ['Dehc8ycCB6T','Nenhuma experiência é única'],['DeSDj_ri7IY','Dos meus favoritos'],['Dd_7XI4i1xM','Não desejo isto a ninguém'],['DeHyNrugvLc','Viagem ao México'],['DeFMH4WtJCG','Jetski'],['Dd9aqPpC0qN','Publicidade de cosmética'],
 ].map(([code,title])=>({title,url:`https://www.instagram.com/p/${code}/`,status:'not-a-recipe',reason:'Legenda sem ingredientes e método de uma receita.'}))},
 {creator:'carlos',name:'Carlos Aleluia',profile:'https://www.instagram.com/realcarlosaleluia/',status:'no-complete-recipe-found',checkedPosts:6,countRecipes:0,reason:'O perfil confirmado é @realcarlosaleluia; @carlos_aleluia é outra pessoa. As seis legendas locais são recomendações de restaurantes, viagens e publicidade, sem ficha para cozinhar em casa.',publications:[
  ['DepDATdIMft','Bali em Portugal'],['Dee7i21xoaq','Restaurante chinês em Lisboa'],['DeZzDo_x0Ud','Febras a metro'],['DeUn8CUonNY','Cortes de vaca num restaurante'],['DeMwIPbonj0','Campanha comercial'],['DeKMup8IWft','Febras a metro, episódio 2'],
 ].map(([code,title])=>({title,url:`https://www.instagram.com/p/${code}/`,status:'not-a-recipe',reason:'A legenda descreve uma visita ou promoção; não fornece uma receita do autor.'}))},
 {creator:'monica',name:'Mónica Ribeiro',profile:'https://www.instagram.com/monicaffr/',status:'no-complete-recipe-found',checkedPosts:6,countRecipes:0,reason:'As seis legendas locais abordam remodelação, maternidade, decoração e roupa. Não se deduzem receitas a partir de uma cozinha ou de um prato mostrado sem ficha.',publications:[
  ['Der2nddEdzp','Remodelação da cozinha'],['DefBAzoxW2A','Pós-parto'],['DeXd_MwkQoq','Outono'],['DePnsWpI32r','Quarto de criança'],['DeM9ZQFi_TA','Roupa e publicidade'],['DeH5XQhlW3_','Registo pessoal'],
 ].map(([code,title])=>({title,url:`https://www.instagram.com/p/${code}/`,status:'not-a-recipe',reason:'A legenda pública não contém uma ficha culinária.'}))},
 {creator:'tascologo',name:'O Tascólogo',profile:'https://www.instagram.com/tascologo/',status:'no-complete-recipe-found',checkedPosts:6,countRecipes:0,reason:'Cinco legendas locais abordam restaurantes ou a aplicação Devora. Há uma colaboração a fazer pão, mas a legenda não publica os ingredientes nem o método: não inventámos essa ficha.',publications:[
  ['DepJBjMiWp9','Frango de churrasco num snack-bar','not-a-recipe'],['DeXD8kACUkn','Cabrito do restaurante O Seabra','not-a-recipe'],['DeU7okhgmnR','Lançamento da Devora','not-a-recipe'],['DeR_d0YsZL9','Colaboração a fazer pão','incomplete'],['DeKbJ2JircI','Restaurante O Fuso','not-a-recipe'],['Dd1zLD9KzlB','Presuntaria Pata Negra','not-a-recipe'],
 ].map(([code,title,status])=>({title,url:`https://www.instagram.com/p/${code}/`,status,reason:status==='incomplete'?'A legenda não fornece ingredientes nem método; seria necessário verificar o vídeo.':'Recomendação de restaurante ou produto, sem ficha culinária.'}))},
 {creator:'carmem',name:'Carmem Pimentinha',profile:'https://www.tiktok.com/@carmemlu_',status:'unverified',checkedPosts:0,countRecipes:0,reason:'O pedido ao perfil público TikTok foi limitado com HTTP 429. A conta Instagram com o mesmo nome não foi confirmada como sendo desta criadora; não foi usada para atribuir receitas ou retratos.',publications:[]},
 {creator:'joao',name:'João Meireles',profile:'https://www.instagram.com/argelinooo_/',status:'unverified',checkedPosts:0,countRecipes:0,reason:'Os ficheiros locais dos perfis indicados não disponibilizaram publicações com legenda. A identidade e uma ficha culinária precisam de confirmação; não foi usada uma conta parecida como substituto.',publications:[]},
];
