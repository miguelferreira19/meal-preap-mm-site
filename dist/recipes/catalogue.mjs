import {YOUTUBE_RECIPES,YOUTUBE_INGREDIENTS,YOUTUBE_RESEARCH} from './youtube.mjs';
import {GIL_JUCY_RECIPES,GIL_JUCY_INGREDIENTS,GIL_JUCY_RESEARCH} from './gil-jucy.mjs';
import {SOCIAL_RECIPES,SOCIAL_INGREDIENTS,SOCIAL_RESEARCH} from './social.mjs';
import {HYZER_KELVIO_RECIPES,HYZER_KELVIO_INGREDIENTS,HYZER_KELVIO_RESEARCH} from './hyzer-kelvio.mjs';

const aliases={cornstarch:'cornflour',vinegar:'cider_vinegar',curry_powder:'curry'};
const canonical=id=>aliases[id]||id;
export const EXTRA_RECIPES=[...YOUTUBE_RECIPES,...GIL_JUCY_RECIPES,...SOCIAL_RECIPES,...HYZER_KELVIO_RECIPES].map(recipe=>({...recipe,ingredients:Object.entries(recipe.ingredients.reduce((amounts,{id,quantity})=>{const key=canonical(id);amounts[key]=(amounts[key]||0)+quantity;return amounts;},{})).map(([id,quantity])=>({id,quantity}))}));
export const EXTRA_INGREDIENTS={};
for(const group of [YOUTUBE_INGREDIENTS,GIL_JUCY_INGREDIENTS,SOCIAL_INGREDIENTS,HYZER_KELVIO_INGREDIENTS]){
 for(const [rawId,item] of Object.entries(group)){
  const id=canonical(rawId);
  const previous=EXTRA_INGREDIENTS[id];
  if(previous&&previous.unit!==item.unit)throw Error('Unidades incompatíveis para '+id);
  EXTRA_INGREDIENTS[id]={...previous,...item,id,allergens:[...new Set([...(previous?.allergens||[]),...item.allergens])]};
 }
}
const research=[...YOUTUBE_RESEARCH,...GIL_JUCY_RESEARCH,...SOCIAL_RESEARCH,...HYZER_KELVIO_RESEARCH];
export const RECIPE_RESEARCH=research.map(({creator,name,title,url,profile,status,reason,recipeId,checkedAt})=>({creator,name,title,url,profile,status,reason,recipeId,checkedAt:checkedAt||'2026-10-20'}));
