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

O catálogo inclui oito adaptações de receitas públicas d’A Pitada do Pai e de Clara de Sousa, com nome, retrato, ligação à publicação original e alterações identificadas. O planeamento prefere estas receitas quando o orçamento, as proteínas, os utensílios e os preços disponíveis permitem. O filtro De criadores e a pesquisa permitem encontrar o autor. Fontes e retratos documentados em [CREATOR_SOURCES.md](CREATOR_SOURCES.md).

Fotografias dos pratos são ilustrativas; os acompanhamentos podem diferir. Créditos e licenças em RECIPE_PHOTOS.md, ASSET_SOURCES.md e no detalhe das receitas. Não existe parceria com os criadores, supermercados ou marcas usadas como referência.
