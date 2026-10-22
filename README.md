# Meal Preap M&M

**[Abrir a aplicação](https://miguelferreira19.github.io/meal-preap-mm-site/)**

Planeador gratuito de almoços e jantares em Portugal. Pessoas, orçamento, supermercado, proteínas, utensílios, ingredientes a evitar e despensa com quantidades. O plano, os favoritos e as compras ficam no navegador de cada dispositivo.

## Preços reais

O GitHub Actions consulta as páginas oficiais de Continente, Auchan, Pingo Doce e Lidl, com atualizações previstas de seis em seis horas. Cada produto conserva a origem, embalagem, preço e data da consulta. O botão Atualizar preços lê a última recolha publicada. O GitHub Pages serve a aplicação e os dados publicados; não executa o servidor de consultas quando abres o site.

Se uma consulta falhar, um preço anterior pode ser conservado até 24 horas, sem mudar a data original. Preços expirados são recusados. As execuções agendadas do GitHub podem atrasar ou ser suspensas por inatividade; o separador Actions permite executar o processo manualmente. Nenhum preço é inventado para preencher produtos em falta.

O Lidl tem cobertura parcial de ofertas públicas, que pode não permitir uma receita completa. Aldi e Mercadona não têm ligação verificável. O preço final depende da loja, morada, disponibilidade e pesagem. Entrega e descontos de cartão não entram no cálculo.

## Instalar

iPhone: Partilhar → Adicionar ao ecrã principal. Android: menu do navegador → Instalar aplicação. Funciona fora de casa sem este computador ligado. Os dados locais do endereço anterior não são transferidos automaticamente entre domínios.

## Manutenção

Node.js 24.11 ou superior, sem dependências de execução:

- npm test — verificar cálculos, filtros, despensa e recolhas.
- npm run refresh — consultar novamente os supermercados.
- npm run build — preparar os ficheiros de GitHub Pages em _site/.

A publicação está definida em .github/workflows/pages.yml. Este repositório contém apenas a aplicação e os ficheiros necessários à recolha e publicação; o projeto completo e o histórico anterior mantêm-se privados.

## Receitas e imagens

O catálogo inclui **109 adaptações de 10 criadores: 106 refeições principais e 3 extras**, com autor, retrato real ou logótipo oficial, ligação à fonte e alterações identificadas. Foram acrescentadas 101 fichas às oito existentes. A pesquisa e o filtro por autor permitem explorar o catálogo; a opção de compatibilidade aplica as escolhas de tempo, proteínas, equipamentos, exclusões e preços. Os extras não entram nos planos de almoço e jantar.

As fontes foram verificadas em 20/10/2026. Oito receitas de FOODIES by Carolina usam legendas públicas de índices, identificadas como tal; a ligação original no Instagram ainda não está confirmada. As restantes 101 fichas têm fonte pública primária. As quantidades e preparações definidas pela app são explicadas em cada adaptação. Não foram usados ebooks nem conteúdos pagos.

Dos 15 perfis pedidos, nove têm receitas integradas; Clara de Sousa permanece como autora adicional. Nos restantes seis não foi possível verificar uma receita completa no material consultado, com limites de acesso ou identidade em alguns casos. O levantamento não equivale ao arquivo completo de cada perfil e não classifica receitas como tendências atuais. Consulte [fontes e retratos](CREATOR_SOURCES.md), [cobertura por perfil](docs/RESEARCH_COVERAGE.md) e o [registo estruturado](docs/RECIPE_RESEARCH.json).

As imagens dos pratos são ilustrativas e seguem uma direção visual uniforme. Quando geradas por IA, têm essa indicação no detalhe da receita. Créditos e proveniência em [RECIPE_PHOTOS.md](RECIPE_PHOTOS.md) e [ASSET_SOURCES.md](ASSET_SOURCES.md). Não existe parceria com os criadores, supermercados ou marcas usadas como referência.
