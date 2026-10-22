// Public original video captions and Portuguese subtitles checked on 2026-10-20.
// Quantities, where not stated in the video, are app adaptations for one person.
const amount=pairs=>pairs.map(([id,quantity])=>({id,quantity}));
const ingredient=(id,name,unit,packQuantity,category,allergens=[])=>({id,name,unit,packQuantity,category,allergens,priceCents:null});
const source=(creator,url,publishedAt,adaptation)=>({creator,url,publishedAt,checkedAt:'2026-10-20',credit:creator==='hyzer'?'Tiago Costa · Hyzer':'Kelvio Januário · Kelvio, O Chefe',adaptation});

export const HYZER_KELVIO_INGREDIENTS=Object.fromEntries([
 ingredient('bacon','Bacon de porco','g',200,'Carne e peixe'),
 ingredient('alheira','Alheira de carne','g',200,'Carne e peixe',['gluten']),
 ingredient('cheese_sao_jorge','Queijo São Jorge','g',250,'Ovos e laticínios',['milk']),
 ingredient('puff_pastry','Massa folhada refrigerada','g',230,'Frescos',['gluten','milk']),
 ingredient('tomato_paste','Concentrado de tomate','g',200,'Mercearia'),
 ingredient('oregano','Orégãos secos','g',10,'Mercearia'),
 ingredient('chicken_ham','Fiambre de peito de frango','g',150,'Carne e peixe'),
 ingredient('cooked_ham','Fiambre de porco cozido','g',150,'Carne e peixe'),
 ingredient('ketchup','Ketchup','g',500,'Mercearia'),
 ingredient('worcestershire','Molho inglês Worcestershire','ml',150,'Mercearia',['fish','gluten']),
 ingredient('red_cabbage','Couve-roxa','g',1000,'Fruta e legumes'),
 ingredient('butter','Manteiga sem sal','g',250,'Ovos e laticínios',['milk']),
 ingredient('cream','Natas culinárias','ml',200,'Ovos e laticínios',['milk']),
 ingredient('bay_leaf','Louro seco','g',5,'Mercearia'),
 ingredient('basil','Manjericão fresco','g',20,'Fruta e legumes'),
 ingredient('vinegar','Vinagre de sidra','ml',500,'Mercearia',['sulphites']),
 ingredient('lime','Lima (peso do fruto)','g',500,'Fruta e legumes'),
 ingredient('beef_steak','Bife de vaca','g',500,'Carne e peixe'),
].map(i=>[i.id,i]));

export const HYZER_KELVIO_RECIPES=[
 {
  id:'criador-hyzer-mini-quiches',name:'Mini quiches de bacon e espinafres',
  description:'Quiches sem massa com ovos, espinafres, bacon e queijo, em estilo pizza.',
  minutes:35,equipment:['oven','knife'],diet:'all',image:'eggs',photoKey:'egg-bacon-mini-quiches',primaryProtein:'eggs',
  source:source('hyzer','https://www.tiktok.com/@hyzer_tc/video/7253530569370373402','2023-07-08','Ingredientes e método verificados no vídeo original. Dividimos a base de oito ovos em doses de refeição com dois ovos por pessoa e pesámos os restantes ingredientes. Pimenta preta em vez de verde, queijo ralado corrente em vez de mozzarella específica; o pão e tomate de acompanhamento são nossos.'),
  ingredients:amount([['eggs',2],['bacon',30],['spinach',60],['onion',20],['tomato_paste',15],['cheese',30],['oregano',0.5],['paprika',0.5],['black_pepper',0.2],['salt',0.5],['olive_oil',3],['bread',80],['tomato',120]]),
  steps:['Aqueça o forno a 190 °C. Pique espinafres e cebola e corte o bacon em pedaços pequenos. Unte pequenas formas de forno com o azeite.','Bata os ovos com sal, pimenta, pimentão e orégãos. Misture bacon, espinafres, cebola, concentrado de tomate e queijo.','Distribua pelas formas sem encher até à borda e asse cerca de 20 a 25 minutos, até o centro ficar firme e completamente cozinhado.','Deixe repousar 3 minutos e sirva com pão e tomate cortado.'],
 },
 {
  id:'criador-hyzer-folhados-alheira',name:'Folhados de alheira e queijo São Jorge',
  description:'Massa folhada estaladiça recheada com alheira, queijo da ilha e manjericão.',
  minutes:45,equipment:['oven','knife'],diet:'all',image:'chicken',photoKey:'alheira-cheese-pastries',primaryProtein:'pork',
  source:source('hyzer','https://www.tiktok.com/@hyzer_tc/video/7296244939397008673','2023-10-31','Vídeo original de folhados de alheira de Mirandela e São Jorge. Doses, temperatura e tempo de forno definidos por nós para pequenos folhados bem cozinhados. Usamos alheira de carne e mantemos o queijo São Jorge como produto distinto. Salada simples de espinafres, tomate e pepino em vez da mistura selvagem com frutos secos e sésamo; vinagre de sidra em vez de balsâmico.'),
  ingredients:amount([['alheira',100],['cheese_sao_jorge',30],['puff_pastry',80],['basil',2],['eggs',0.25],['black_pepper',0.2],['spinach',40],['tomato',100],['cucumber',80],['vinegar',6],['lime',25],['olive_oil',5],['salt',0.3]]),
  steps:['Aqueça o forno a 200 °C. Retire a pele à alheira, desfaça-a e misture com o queijo ralado e manjericão picado.','Corte a massa folhada em pares de quadrados. Divida o recheio pelas bases, pincele as bordas com um pouco do ovo batido e cubra com os quadrados restantes.','Sele as bordas com um garfo, pincele a superfície com o ovo na quantidade indicada e tempere com pimenta. Asse 20 a 25 minutos, até a massa dourar e o recheio ficar bem quente e cozinhado.','Lave e corte os legumes. Tempere com azeite, vinagre, lima e sal e sirva com os folhados, após repousarem alguns minutos.'],
 },
 {
  id:'criador-hyzer-esparguete-ovos',name:'Esparguete de tomate com ovos e queijo',
  description:'Esparguete com ovos cozinhados no molho de tomate, queijo e fiambre.',
  minutes:30,equipment:['hob','pot','pan','knife'],diet:'all',image:'pasta',photoKey:'spaghetti-tomato-eggs-ham',primaryProtein:'eggs',
  source:source('hyzer','https://www.tiktok.com/@hyzer_tc/video/7694382529133972768','2026-10-08','Vídeo original de esparguete com creme de tomate e mozzarella, ovos e presunto cozido trufado. As quantidades são nossas. Preparamos um molho de tomate pelado e natas em vez do creme pronto não identificado; queijo ralado em vez de mini mozzarella e fiambre de porco cozido em vez do produto trufado. Não apresentamos este molho caseiro como receita original do criador.'),
  ingredients:amount([['pasta',80],['canned_tomato',180],['cream',20],['eggs',1.5],['cooked_ham',35],['cheese',30],['parmesan',5],['garlic',3],['basil',2],['olive_oil',6],['salt',0.7],['black_pepper',0.2]]),
  steps:['Coza o esparguete em água com parte do sal. Pique o alho e corte o fiambre em tiras.','Aqueça azeite numa frigideira com tampa e cozinhe o alho sem dourar. Junte tomate e deixe apurar 8 minutos; envolva as natas.','Bata os ovos e pese a proporção indicada para o número de pessoas. Distribua sobre o molho, tape e cozinhe em lume brando até ficarem completamente firmes.','Junte queijo, fiambre e esparguete escorrido, envolvendo com cuidado e aquecendo bem. Termine com parmesão, manjericão e pimenta.'],
 },
 {
  id:'criador-hyzer-tosta-frango',name:'Tosta mista de fiambre de frango',
  description:'Pão dourado com queijo derretido, fiambre de frango e toque de parmesão.',
  minutes:20,equipment:['hob','pan','knife'],diet:'all',image:'chicken',photoKey:'chicken-ham-cheese-toast',primaryProtein:'chicken',
  source:source('hyzer','https://www.tiktok.com/@hyzer_tc/video/7695131919813479713','2026-10-10','A tosta foi verificada no vídeo original; não incluímos o iced latte do mesmo vídeo. Definimos quantidades de refeição e juntámos salada. Usamos frigideira tapada em vez de máquina de tostas e manteiga simples com parmesão e manjericão em vez dos temperos preparados. Fiambre de frango tem ingrediente e preço próprios, distintos de peito de frango cru.'),
  ingredients:amount([['bread',120],['chicken_ham',80],['cheese',35],['butter',10],['parmesan',4],['basil',1],['black_pepper',0.2],['tomato',120],['cucumber',80],['olive_oil',5]]),
  steps:['Recheie o pão com fiambre de frango, queijo, parmesão, manjericão e pimenta. Espalhe a manteiga pela face exterior do pão.','Aqueça uma frigideira em lume médio-baixo. Coloque a tosta, tape e doure dos dois lados, pressionando levemente, até o queijo derreter e o recheio ficar quente.','Corte tomate e pepino e envolva com o azeite. Corte a tosta ao meio e sirva logo com a salada.'],
 },
 {
  id:'criador-kelvio-strogonoff',name:'Strogonoff de frango com arroz',
  description:'Frango dourado num molho cremoso de tomate, natas, mostarda e molho inglês.',
  minutes:35,equipment:['hob','pan','pot','knife'],diet:'all',image:'chicken',photoKey:'chicken-stroganoff-rice',primaryProtein:'chicken',
  source:source('kelvio','https://www.tiktok.com/@_kelvio_/video/7698310628896673057','2026-10-19','Episódio 2 da série para estudantes, com ingredientes e método no áudio público. O vídeo não indica o número de doses: todos os pesos por pessoa, temperos e acompanhamentos são nossos. Usamos mostarda Dijon como uma das alternativas mencionadas e tomate pelado em pedaços. Acrescentámos arroz branco, incluído na lista de compras; não acrescentámos cogumelos, ausentes desta preparação.'),
  ingredients:amount([['chicken',170],['onion',40],['canned_tomato',80],['olive_oil',8],['paprika',0.7],['black_pepper',0.2],['salt',0.8],['ketchup',15],['worcestershire',7],['mustard',6],['cream',65],['rice',75]]),
  steps:['Coza o arroz em água com parte do sal. Corte o peito de frango em tiras e pique a cebola.','Aqueça metade do azeite e doure o frango por turnos. Retire para um prato; a confeção termina no molho.','Junte o azeite restante e amoleça a cebola. Acrescente tomate e deixe cozinhar até se desfazer; volte a colocar o frango.','Tempere com pimentão, sal e pimenta e envolva ketchup, molho inglês e mostarda. Cozinhe até o frango estar completamente cozinhado.','Reduza para lume mínimo e envolva as natas, aquecendo sem ferver fortemente. Sirva com arroz branco.'],
 },
 {
  id:'criador-kelvio-bife-brocolos',name:'Bife com arroz de brócolos e couve-roxa',
  description:'Bife dourado, arroz solto com brócolos e salada crocante de couve e cenoura.',
  minutes:40,equipment:['hob','pan','pot','knife'],diet:'all',image:'chicken',photoKey:'steak-broccoli-rice-slaw',primaryProtein:'beef',
  source:source('kelvio','https://www.tiktok.com/@_kelvio_/video/7697317899299523873','2026-10-16','O vídeo público mostra a composição de bife, arroz de brócolos e salada de couve-roxa e cenoura. A espécie e o corte da carne não são indicados no áudio: escolhemos bife de vaca e definimos todos os pesos. O arroz segue o método público do episódio 1 (TikTok 7696820519076662560), com cebola, azeite e louro. O molho da salada é nosso; omitimos a flambagem.'),
  ingredients:amount([['beef_steak',180],['rice',75],['broccoli',100],['onion',25],['olive_oil',12],['bay_leaf',0.1],['red_cabbage',80],['carrot',50],['yogurt',25],['lemon',30],['salt',0.9],['black_pepper',0.2]]),
  steps:['Pique a cebola e corte os brócolos em raminhos pequenos. Amoleça a cebola em metade do azeite, junte brócolos e arroz e envolva.','Junte água quente segundo a indicação do arroz, louro e parte do sal. Deixe levantar fervura, reduza para lume mínimo e tape. Cozinhe pelo tempo da embalagem; retire o louro e deixe repousar tapado 5 minutos.','Corte a couve-roxa fina e rale a cenoura. Misture iogurte, limão e pimenta e envolva nos legumes; reserve no frigorífico.','Seque os bifes e tempere. Aqueça uma frigideira com o azeite restante e doure dos dois lados, ajustando o tempo à espessura e ao ponto desejado. Deixe repousar 5 minutos.','Sirva os bifes com o arroz e salada. O método do arroz é o do vídeo do criador; as doses e o tempero da salada são a nossa adaptação.'],
 },
];

export const HYZER_KELVIO_RESEARCH=[
 ...HYZER_KELVIO_RECIPES.map(r=>({creator:r.source.creator,title:r.name,url:r.source.url,publishedAt:r.source.publishedAt,checkedAt:'2026-10-20',status:'integrated',recipeId:r.id,reason:'Legenda e transcrição portuguesa do vídeo original verificadas. Quantidades e alterações explicitadas.'})),
 {creator:'kelvio',title:'Arroz de brócolos · estudantes, episódio 1',url:'https://www.tiktok.com/@_kelvio_/video/7696820519076662560',publishedAt:'2026-10-15',checkedAt:'2026-10-20',status:'integrated-component',recipeId:'criador-kelvio-bife-brocolos',reason:'Método completo do arroz utilizado no prato de bife. O acompanhamento não é contado como outra receita principal.'},
 {creator:'kelvio',title:'Montagem de dez marmitas',url:'https://www.tiktok.com/@_kelvio_/video/7698426343050005792',publishedAt:'2026-10-19',checkedAt:'2026-10-20',status:'insufficient-source',recipeId:null,reason:'Publica composição e montagem de carne picada, bolonhesa e salmão, sem métodos completos dos pratos. É um anúncio do serviço, não três novas fichas verificadas.'},
 {creator:'kelvio',title:'Magoga no Rumos',url:'https://www.rtp.pt/play/p16251/e952536/rumos',publishedAt:'2026-09-09',checkedAt:'2026-10-20',status:'insufficient-source',recipeId:null,reason:'A página RTP atribui a sandes Magoga ao chef, mas não publica ingredientes ou preparação em texto. Não foi criada uma receita genérica a partir do nome.'},
 {creator:'kelvio',title:'Participação no Bem-vindos',url:'https://www.rtp.pt/programa/tv/p48438/e52',publishedAt:null,checkedAt:'2026-10-20',status:'insufficient-source',recipeId:null,reason:'A página confirma a presença na cozinha, sem nome de prato nem ficha de ingredientes.'},
 {creator:'kelvio',title:'Site oficial e canal YouTube',url:'https://kelvio-o-chefe.vercel.app/conteudo',publishedAt:null,checkedAt:'2026-10-20',status:'profile-verified',recipeId:null,reason:'Confirma Instagram kelvio.antunes, TikTok _kelvio_ e YouTube Chef_Kelvio. O site apresenta serviços, sem fichas; o canal público mostrou quatro vlogs, sem receitas completas.'},
 {creator:'hyzer',title:'Desafio Dia do Pai · Bimbo',url:'https://www.youtube.com/watch?v=I3GCgGHp3r4',publishedAt:null,checkedAt:'2026-10-20',status:'insufficient-source',recipeId:null,reason:'O vídeo da Bimbo é identificado como Tiago Hyzer. Descrição sem receita; a ligação oficial lechefbimbo.pt/desafio/3 não resolve DNS e as legendas não devolveram texto. Não se atribuem ao criador outras receitas genéricas da marca.'},
 {creator:'hyzer',title:'Histórico do perfil público',url:'https://www.tiktok.com/@hyzer_tc',publishedAt:null,checkedAt:'2026-10-20',status:'limited-access',recipeId:null,reason:'O perfil no browser mostra a biografia e pedido de login, sem grelha de vídeos para percorrer o arquivo. Não foi contornado o acesso.'},
 {creator:'kelvio',title:'Histórico do perfil público',url:'https://www.tiktok.com/@_kelvio_',publishedAt:null,checkedAt:'2026-10-20',status:'limited-access',recipeId:null,reason:'O perfil no browser mostra a biografia e pedido de login. O embed público disponibilizou doze posts; os vídeos originais com receitas foram verificados individualmente.'},
];
